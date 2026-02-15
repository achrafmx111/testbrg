import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpRole } from "@/integrations/supabase/mvp";

interface DashboardAccessGateProps {
  allowedRoles: MvpRole[];
  children: ReactNode;
}

export const DashboardAccessGate = ({
  allowedRoles,
  children,
}: DashboardAccessGateProps) => {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;

        if (!user) {
          setAllowed(false);
          setChecking(false);
          return;
        }

        const profile = await mvp.getMyProfile(user.id);

        if (!mounted) return;

        if (!profile || !allowedRoles.includes(profile.role)) {
          setAllowed(false);
        } else {
          setAllowed(true);
        }
      } catch (error) {
        console.error("Access gate error:", error);
        if (mounted) setAllowed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    check();

    return () => {
      mounted = false;
    };
  }, [allowedRoles]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
