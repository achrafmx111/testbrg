// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { request_id } = await req.json();

        if (!request_id) throw new Error('Request ID is required');

        console.log(`Approving request: ${request_id}`);

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { db: { schema: 'mvp' } }
        );

        // Security: Verify Caller is Auth & Admin
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Missing Authorization header');

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) throw new Error('Unauthorized');

        const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'ADMIN') throw new Error('Forbidden: Admins only');

        // Also need public schema access for auth? Auth is separate.
        // Let's use two clients or just rely on 'schema' modifier if supported.
        // supabase-js v2 supports .schema() modifier.
        // But initializing with db.schema makes it default.

        // 1. Fetch Request
        const { data: request, error: reqError } = await supabaseAdmin
            .from('company_registration_requests')
            .select('*')
            .eq('id', request_id)
            .single();

        if (reqError || !request) {
            console.error("Request fetch error:", reqError);
            throw new Error('Request not found');
        }

        if (request.status === 'APPROVED') {
            return new Response(JSON.stringify({ message: "Already approved" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        console.log(`Creating user for email: ${request.email}`);

        // 2. Invite User (Uses Auth API, schema irrelevant)
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.inviteUserByEmail(request.email);

        if (userError) {
            console.error("User invite error:", userError);
            throw userError;
        }
        const userId = userData.user.id;
        console.log(`User created: ${userId}`);

        // 3. Create Profile
        // We already set schema to 'mvp' in constructor, so .from('profiles') targets mvp.profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: userId,
                role: 'COMPANY',
                full_name: request.contact_name,
                email: request.email
            });

        if (profileError) {
            console.warn("Profile creation warn (might exist):", profileError);
            // Continue, maybe user existed
        }

        // 4. Create Company
        const { data: company, error: companyError } = await supabaseAdmin
            .from('companies')
            .insert({
                name: request.company_name,
                industry: request.industry,
                website: request.website,
                country: request.country,
                location: request.country,
                size: '1-10',
                description: `Registered from ${request.website || 'contact form'}`
            })
            .select()
            .single();

        if (companyError) {
            console.error("Company creation error:", companyError);
            throw companyError;
        }
        console.log(`Company created: ${company.id}`);

        // 5. Link Profile -> Company
        await supabaseAdmin.from('profiles').update({ company_id: company.id }).eq('id', userId);

        // 6. Update Request Status
        await supabaseAdmin
            .from('company_registration_requests')
            .update({
                status: 'APPROVED',
                reviewed_at: new Date().toISOString()
                // reviewed_by should be passed from caller context? 
                // For now, system approves.
            })
            .eq('id', request_id);

        return new Response(
            JSON.stringify({ success: true, userId, companyId: company.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error("Function error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
});
