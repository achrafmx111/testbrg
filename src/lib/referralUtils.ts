import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a unique referral code.
 * Format: NAME-XXXX (e.g., KEMAL-X9A2)
 */
async function generateUniqueCode(firstName: string): Promise<string> {
    const cleanName = (firstName || "USER").replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 5);
    let isUnique = false;
    let code = "";
    let attempts = 0;

    while (!isUnique && attempts < 10) {
        // Random 4-char suffix
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        code = `${cleanName}-${randomSuffix}`;

        // Check uniqueness in profiles table
        const { data } = await (supabase as any)
            .from('profiles')
            .select('id')
            .eq('referral_code', code)
            .maybeSingle();

        if (!data) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        // Fallback to timestamp if collision persists
        return `${cleanName}-${Date.now().toString(36).toUpperCase().substring(0, 6)}`;
    }

    return code;
}

/**
 * Gets the current user's referral code.
 * If they don't have one, generates it and saves to profile.
 */
export async function getOrAssignReferralCode(userId: string, firstName: string): Promise<string | null> {
    try {
        // 1. Check existing
        const { data: profile } = await supabase
            .from('profiles')
            .select('referral_code')
            .eq('id', userId)
            .single();

        if (profile?.referral_code) {
            return profile.referral_code;
        }

        // 2. Generate new
        const newCode = await generateUniqueCode(firstName);

        // 3. Save
        const { error } = await supabase
            .from('profiles')
            .update({ referral_code: newCode } as any)
            .eq('id', userId);

        if (error) {
            console.error("Failed to save referral code:", error);
            // If error is duplicate key (race condition), retry logic would go here
            return null;
        }

        return newCode;
    } catch (err) {
        console.error("Error in referral flow:", err);
        return null;
    }
}


/**
 * Sends a referral invite using the secure server-side RPC.
 * Enforces rate limiting and anti-abuse checks.
 */
export async function sendReferralInvite(email: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.rpc('create_referral', {
            referee_email: email
        });

        if (error) {
            console.error("Referral RPC Error:", error);
            // Parse common RPC errors for better UI feedback
            if (error.message.includes("Daily referral limit")) {
                return { success: false, error: "Daily limit reached (5 invites/day). Please try again tomorrow." };
            }
            if (error.message.includes("already invited")) {
                return { success: false, error: "You have already invited this person." };
            }
            if (error.message.includes("refer yourself")) {
                return { success: false, error: "You cannot refer yourself." };
            }
            return { success: false, error: error.message || "Failed to send invite." };
        }

        return { success: true };
    } catch (err) {
        console.error("Referral invite error:", err);
        return { success: false, error: "Network error. Please try again." };
    }
}
