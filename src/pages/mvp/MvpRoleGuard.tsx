import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MvpRole, mvp, roleHomePath } from "@/integrations/supabase/mvp";

interface MvpRoleGuardProps {
  role: MvpRole;
  children: ReactNode;
}

export function MvpRoleGuard({ role, children }: MvpRoleGuardProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [fallbackPath, setFallbackPath] = useState("/login");

  useEffect(() => {
    const check = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setAuthorized(false);
          setFallbackPath("/login");
          return;
        }

        const profile = await mvp.getMyProfile(user.id);
        if (!profile) {
          setAuthorized(false);
          setFallbackPath("/login");
          return;
        }

        if (profile.role === role) {
          setAuthorized(true);
          return;
        }

        setAuthorized(false);
        setFallbackPath(roleHomePath(profile.role));
      } catch {
        setAuthorized(false);
        setFallbackPath("/login");
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [role]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to={fallbackPath} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
