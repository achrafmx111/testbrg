import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpProfile, MvpRole } from "@/integrations/supabase/mvp";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface MvpUserContext {
    isLoading: boolean;
    user: { id: string; email?: string } | null; // The effective user (real or impersonated)
    profile: MvpProfile | null; // The effective profile
    isImpersonating: boolean; // True if God Mode is active
    realAdminProfile: MvpProfile | null; // The original admin profile (if impersonating)
    startImpersonation: (targetUserId: string) => Promise<void>;
    stopImpersonation: () => void;
}

// Simple event bus to trigger updates across components
const MVP_USER_UPDATE_EVENT = "mvp-user-update";

export function useMvpUser(): MvpUserContext {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [profile, setProfile] = useState<MvpProfile | null>(null);
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [realAdminProfile, setRealAdminProfile] = useState<MvpProfile | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const loadUser = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const authUser = session?.user ?? null;

            if (!authUser) {
                setUser(null);
                setProfile(null);
                setIsImpersonating(false);
                setRealAdminProfile(null);
                return;
            }

            // 1. Get Real Profile
            const realProfile = await mvp.getMyProfile(authUser.id);

            if (!realProfile) {
                // Fallback just in case
                setUser({ id: authUser.id, email: authUser.email });
                setProfile(null);
                return;
            }

            // 2. Check for Impersonation Request
            const impersonatedId = localStorage.getItem("admin_impersonate_id");

            if (impersonatedId && realProfile.role === "ADMIN") {
                // GOD MODE: ACTIVE
                // Fetch impersonated profile
                const targetProfile = await mvp.getMyProfile(impersonatedId);
                if (targetProfile) {
                    setUser({ id: targetProfile.id, email: `impersonating:${targetProfile.email}` });
                    setProfile(targetProfile);
                    setIsImpersonating(true);
                    setRealAdminProfile(realProfile);
                } else {
                    // Target not found, revert
                    console.warn("Impersonated user not found, reverting.");
                    localStorage.removeItem("admin_impersonate_id");
                    setUser({ id: authUser.id, email: authUser.email });
                    setProfile(realProfile);
                    setIsImpersonating(false);
                    setRealAdminProfile(null);
                }
            } else {
                // NORMAL MODE
                // If not admin, ensure no impersonation key exists (security cleanup)
                if (realProfile.role !== "ADMIN") {
                    localStorage.removeItem("admin_impersonate_id");
                }

                setUser({ id: authUser.id, email: authUser.email });
                setProfile(realProfile);
                setIsImpersonating(false);
                setRealAdminProfile(null);
            }

        } catch (error) {
            console.error("useMvpUser Error:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();

        // Listen for custom events to reload state (e.g. from other components)
        const handleUpdate = () => loadUser();
        window.addEventListener(MVP_USER_UPDATE_EVENT, handleUpdate);

        // Also listen to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            loadUser();
        });

        return () => {
            window.removeEventListener(MVP_USER_UPDATE_EVENT, handleUpdate);
            subscription.unsubscribe();
        };
    }, [loadUser]);

    const startImpersonation = async (targetUserId: string) => {
        if (profile?.role !== "ADMIN") {
            toast({ variant: "destructive", title: "Access Denied", description: "Only admins can use God Mode." });
            return;
        }

        localStorage.setItem("admin_impersonate_id", targetUserId);
        // Trigger reload
        window.dispatchEvent(new Event(MVP_USER_UPDATE_EVENT));

        // We don't navigate yet, the component consuming this will handle navigation based on the new role
        // But usually we want to go to their dashboard
        toast({ title: "God Mode Activated ⚡️", description: "Switching identity..." });

        // Slight delay to allow state to update then redirect would be handled by the component or logic
        // We defer navigation to the caller or the Guard
    };

    const stopImpersonation = () => {
        localStorage.removeItem("admin_impersonate_id");
        window.dispatchEvent(new Event(MVP_USER_UPDATE_EVENT));
        toast({ title: "God Mode Deactivated", description: "Welcome back, Admin." });
        navigate("/admin");
    };

    return {
        isLoading,
        user,
        profile,
        isImpersonating,
        realAdminProfile,
        startImpersonation,
        stopImpersonation
    };
}
