import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const DEFAULT_ALLOWED_ORIGINS = [
    "https://bridging-academy.lovable.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
];

const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const TRUSTED_ORIGINS = ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : DEFAULT_ALLOWED_ORIGINS;

const getCorsHeaders = (origin: string | null) => {
    const allowedOrigin = origin && TRUSTED_ORIGINS.includes(origin) ? origin : TRUSTED_ORIGINS[0];
    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
};

const EmailRequestSchema = z.object({
    to: z.union([z.string().email(), z.array(z.string().email()).min(1).max(20)]),
    subject: z.string().trim().min(1).max(200),
    html: z.string().min(1).max(100_000),
});

const jsonResponse = (body: unknown, status: number, corsHeaders: Record<string, string>) => {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
};

serve(async (req) => {
    const corsHeaders = getCorsHeaders(req.headers.get("origin"));

    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405, corsHeaders);
    }

    try {
        if (!RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not set");
        }

        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return jsonResponse({ error: "Missing or invalid Authorization header" }, 401, corsHeaders);
        }

        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        );

        const accessToken = authHeader.replace("Bearer ", "");
        const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
        if (authError || !authData.user) {
            return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
        }

        const { data: profile, error: profileError } = await supabaseAdmin
            .schema("mvp")
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .maybeSingle();

        if (profileError) {
            throw new Error(`Failed to validate role: ${profileError.message}`);
        }

        if (profile?.role !== "ADMIN") {
            return jsonResponse({ error: "Forbidden" }, 403, corsHeaders);
        }

        const rawPayload = await req.json();
        const parsedPayload = EmailRequestSchema.safeParse(rawPayload);
        if (!parsedPayload.success) {
            return jsonResponse(
                { error: "Validation failed", details: parsedPayload.error.flatten() },
                400,
                corsHeaders,
            );
        }

        const { to, subject, html } = parsedPayload.data;

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Bridging Academy <notifications@bridging.academy>",
                to: Array.isArray(to) ? to : [to],
                subject: subject,
                html: html,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            return jsonResponse(data, res.status, corsHeaders);
        }

        return jsonResponse(data, 200, corsHeaders);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        return jsonResponse({ error: message }, 500, corsHeaders);
    }
});
