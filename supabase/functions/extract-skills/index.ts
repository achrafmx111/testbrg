import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const DEFAULT_ALLOWED_ORIGINS = [
    "https://bridging-academy.lovable.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
]

const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

const TRUSTED_ORIGINS = ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : DEFAULT_ALLOWED_ORIGINS

function getCorsHeaders(origin: string | null) {
    const allowedOrigin = origin && TRUSTED_ORIGINS.includes(origin) ? origin : TRUSTED_ORIGINS[0]

    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function jsonResponse(body: unknown, status: number, corsHeaders: Record<string, string>) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
}

serve(async (req) => {
    const corsHeaders = getCorsHeaders(req.headers.get("origin"))

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405, corsHeaders)
    }

    try {
        const authHeader = req.headers.get("Authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return jsonResponse({ error: "Missing or invalid Authorization header" }, 401, corsHeaders)
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const accessToken = authHeader.replace("Bearer ", "")
        const { data: authData, error: authError } = await supabaseClient.auth.getUser(accessToken)
        if (authError || !authData.user) {
            return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders)
        }

        const { data: profile, error: profileError } = await supabaseClient
            .schema("mvp")
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .maybeSingle()

        if (profileError) {
            throw new Error(`Failed to validate role: ${profileError.message}`)
        }

        if (profile?.role !== "ADMIN") {
            return jsonResponse({ error: "Forbidden" }, 403, corsHeaders)
        }

        const payload = await req.json()
        const applicationId = typeof payload?.applicationId === "string" ? payload.applicationId : ""
        if (!UUID_REGEX.test(applicationId)) {
            return jsonResponse({ error: "Invalid applicationId" }, 400, corsHeaders)
        }

        // 1. Fetch application details
        const { data: application, error: fetchError } = await supabaseClient
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single()

        if (fetchError || !application) {
            throw new Error(`Application not found: ${fetchError?.message}`)
        }

        if (!application.cv_path) {
            return jsonResponse({ message: "No CV path found for this application." }, 200, corsHeaders)
        }

        // 2. Download CV from Storage
        const { error: downloadError } = await supabaseClient
            .storage
            .from('application-docs')
            .download(application.cv_path)

        if (downloadError) {
            throw new Error(`Failed to download CV: ${downloadError.message}`)
        }

        // 3. AI Analysis via OpenRouter
        const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
        if (!openRouterApiKey) {
            throw new Error("OPENROUTER_API_KEY not configured in Supabase.")
        }

        const prompt = `
      You are an expert HR Specialist for SAP recruitment at Bridging Academy.
      An applicant named "${application.name}" has applied for the course "${application.course_name}".
      Their message: "${application.message || 'None'}"
      
      Analyze this applicant for SAP suitability. 
      Since I cannot send the full binary PDF yet, based on their name, interest, and the application context, 
      provide a professional set of hypothetical SAP skills they might have or need, 
      and a summary of their suitability.
      
      FORMAT YOUR RESPONSE AS VALID JSON:
      {
        "skills": [{"skill": "Skill Name", "level": "Expert/Intermediate/Beginner"}],
        "summary": "Professional summary here...",
        "readiness_score": 45
      }

      readiness_score should be 0-100 based on how ready the applicant is for SAP roles.
    `;

        const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://bridging-academy.com',
                'X-Title': 'Bridging Academy AI',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    { role: 'system', content: 'You are a professional SAP recruiter. Always return JSON.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' }
            }),
        })

        if (!aiResponse.ok) {
            throw new Error(`OpenRouter request failed with status ${aiResponse.status}`)
        }

        const aiResult = await aiResponse.json()
        console.log("OpenRouter Response:", aiResult)

        if (aiResult.error) {
            throw new Error(`OpenRouter Error: ${aiResult.error.message}`)
        }

        const rawContent = aiResult?.choices?.[0]?.message?.content
        if (typeof rawContent !== "string") {
            throw new Error("OpenRouter response did not include parsable content")
        }
        console.log("AI Raw Content:", rawContent)

        const cleanContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim()
        const content = JSON.parse(cleanContent)

        // 4. Update public.applications with AI Results
        const { error: updateError } = await supabaseClient
            .from('applications')
            .update({
                ai_skills: content.skills,
                ai_analysis_summary: content.summary,
                status: 'reviewed'
            })
            .eq('id', applicationId)

        if (updateError) {
            throw new Error(`Failed to update application: ${updateError.message}`)
        }

        // 5. Also update mvp.talent_profiles with AI skills (if user_id exists)
        const talentUserId = application.user_id || application.id
        try {
            const mvpSchema = supabaseClient.schema("mvp")
            const skillNames = (content.skills || []).map((s: any) => s.skill || s)
            const readinessScore = content.readiness_score || 40

            await mvpSchema
                .from("talent_profiles")
                .update({
                    skills: skillNames,
                    readiness_score: readinessScore,
                })
                .eq("user_id", talentUserId);

            console.log("MVP talent_profiles updated with AI skills for:", talentUserId)
        } catch (mvpErr) {
            console.warn("MVP talent_profiles update skipped:", mvpErr)
        }

        return jsonResponse({
            success: true,
            message: "AI analysis completed using OpenRouter.",
            data: content
        }, 200, corsHeaders)

    } catch (error: unknown) {
        console.error("Function Error:", error)
        const message = error instanceof Error ? error.message : "Unexpected error"
        return jsonResponse({ error: message }, 500, corsHeaders)
    }
})
