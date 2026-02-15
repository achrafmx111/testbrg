import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { applicationId } = await req.json()
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

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
            return new Response(JSON.stringify({ message: "No CV path found for this application." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 2. Download CV from Storage
        const { data: fileData, error: downloadError } = await supabaseClient
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

        const fileName = application.cv_path.split('/').pop();

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

        const aiResult = await aiResponse.json()
        console.log("OpenRouter Response:", aiResult);

        if (aiResult.error) {
            throw new Error(`OpenRouter Error: ${aiResult.error.message}`);
        }

        const rawContent = aiResult.choices[0].message.content;
        console.log("AI Raw Content:", rawContent);

        const cleanContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const content = JSON.parse(cleanContent);

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
        const talentUserId = application.user_id || application.id;
        try {
            const mvpSchema = supabaseClient.schema("mvp");
            const skillNames = (content.skills || []).map((s: any) => s.skill || s);
            const readinessScore = content.readiness_score || 40;

            await mvpSchema
                .from("talent_profiles")
                .update({
                    skills: skillNames,
                    readiness_score: readinessScore,
                })
                .eq("user_id", talentUserId);

            console.log("MVP talent_profiles updated with AI skills for:", talentUserId);
        } catch (mvpErr) {
            console.warn("MVP talent_profiles update skipped:", mvpErr);
        }

        return new Response(JSON.stringify({
            success: true,
            message: "AI analysis completed using OpenRouter.",
            data: content
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
