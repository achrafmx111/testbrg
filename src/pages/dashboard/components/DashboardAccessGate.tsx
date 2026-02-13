import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "business" | "student" | "user";

interface DashboardAccessGateProps {
  allowedRoles: Role[];
  requireTalentPoolRegistration?: boolean;
  children: ReactNode;
}

export const DashboardAccessGate = ({
  allowedRoles,
  requireTalentPoolRegistration = false,
  children,
}: DashboardAccessGateProps) => {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setAllowed(false);
          return;
        }

        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role as Role | undefined;
        const isAdmin = role === "admin";

        if (isAdmin) {
          setAllowed(true);
          return;
        }

        if (!role || !allowedRoles.includes(role)) {
          setAllowed(false);
          return;
        }

        if (requireTalentPoolRegistration) {
          const { data } = await (supabase as any)
            .from("applications")
            .select("id")
            .eq("user_id", user.id)
            .eq("type", "talent_pool_registration")
            .limit(1);

          setAllowed((data || []).length > 0);
          return;
        }

        setAllowed(true);
      } catch {
        setAllowed(false);
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [allowedRoles, requireTalentPoolRegistration]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
