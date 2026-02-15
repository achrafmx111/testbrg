import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MvpRole, mvp, roleHomePath } from "@/integrations/supabase/mvp";

interface MvpRoleGuardProps {
  role: MvpRole;
  children: ReactNode;
}

type GuardState = "LOADING" | "ALLOWED" | "DENIED";

export function MvpRoleGuard({ role, children }: MvpRoleGuardProps) {
  const location = useLocation();
  const [state, setState] = useState<GuardState>("LOADING");
  const [fallbackPath, setFallbackPath] = useState("/login");

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          setFallbackPath("/login");
          setState("DENIED");
          return;
        }

        const profile = await mvp.getMyProfile(user.id);

        if (!mounted) return;

        if (!profile) {
          setFallbackPath("/login");
          setState("DENIED");
          return;
        }

        // Exact match required
        if (profile.role === role) {
          setState("ALLOWED");
          return;
        }

        // Access denied - calculate redirect once
        const target = roleHomePath(profile.role);
        // Safety: If target is unknown or same as current (loop risk), go to login
        if (!target || target === location.pathname) {
          setFallbackPath("/login");
        } else {
          setFallbackPath(target);
        }
        setState("DENIED");

      } catch (err) {
        if (!mounted) return;
        console.error("RoleGuard Check Error:", err);
        setFallbackPath("/login");
        setState("DENIED");
      }
    };

    check();

    return () => {
      mounted = false;
    };
  }, [role, location.pathname]);

  if (state === "LOADING") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (state === "DENIED") {
    // Prevent loop: don't redirect if we are already at fallbackPath
    if (location.pathname === fallbackPath) {
      // Fallback to login if we are stuck
      if (location.pathname !== "/login") {
        return <Navigate to="/login" replace />;
      }
      // If we are at login, render nothing (login page handles itself) or just null
      return null;
    }
    return <Navigate to={fallbackPath} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
