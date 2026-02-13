import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'ROLE_CHANGED'
    | 'PROFILE_UPDATED'
    | 'APP_STATUS_CHANGE'
    | 'MESSAGE_APPROVED'
    | 'MESSAGE_REJECTED'
    | 'PROFILE_EXPORTED'
    | 'ACCOUNT_DELETION_REQUEST'
    | 'ACCOUNT_DELETED'
    | 'UNAUTHORIZED_ACCESS'
    | 'PIPELINE_STAGE_CHANGED'
    | 'REFERRAL_CREATED'
    | 'REWARD_CLAIMED';

export type ResourceType =
    | 'profile'
    | 'application'
    | 'employer_pipeline'
    | 'recruitment_message'
    | 'auth'
    | 'system';

export interface AuditLogParams {
    userId?: string;
    action: AuditAction;
    resourceType: ResourceType;
    resourceId?: string;
    metadata?: Record<string, any>;
    correlationId?: string;
}

/**
 * Generates a SHA256 hash of the event data for tamper-evidence.
 */
async function generateEventHash(data: Record<string, any>): Promise<string> {
    try {
        const msgBuffer = new TextEncoder().encode(JSON.stringify(data));
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        console.warn("Hash generation failed", e);
        return "hash-failed";
    }
}

/**
 * Logs a security event to the security_logs table.
 * This is an immutable audit trail for GDPR and compliance.
 * Implements "Fire-and-Forget" pattern (swallows errors to prevent blocking main flow).
 */
export async function logSecurityEvent({
    userId,
    action,
    resourceType,
    resourceId,
    metadata = {},
    correlationId
}: AuditLogParams): Promise<void> {
    try {
        // If no userId provided, try to get current user
        let actorId = userId;
        if (!actorId) {
            const { data: { user } } = await supabase.auth.getUser();
            actorId = user?.id;
        }

        const userAgent = window.navigator.userAgent;
        const createdAt = new Date().toISOString();
        const finalCorrelationId = correlationId || crypto.randomUUID();

        // Generate Hash
        const eventData = {
            user_id: actorId,
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            metadata,
            correlation_id: finalCorrelationId,
            created_at: createdAt
        };

        const eventHash = await generateEventHash(eventData);

        // Perform insert
        // We use 'void' to not return the promise, but we await internally to ensure
        // the request is sent before the function scope closes if called with await.
        // Capturing errors here ensures the main application flow is never interrupted.
        const { error } = await (supabase as any)
            .from('security_logs')
            .insert({
                user_id: actorId,
                action,
                resource_type: resourceType,
                resource_id: resourceId,
                metadata,
                correlation_id: finalCorrelationId,
                event_hash: eventHash,
                user_agent: userAgent,
                created_at: createdAt
                // ip_address: handled by server/edge headers or default
            });

        if (error) {
            console.warn("Security Log Failed (Silent):", error.message);
            // In production, send to Sentry or specialized error tracking
        }
    } catch (err) {
        console.warn("Security Log Logic Error (Silent):", err);
    }
}
