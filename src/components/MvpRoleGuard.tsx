import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { MvpRole, roleHomePath } from "@/integrations/supabase/mvp";
import { useMvpUser } from "@/hooks/useMvpUser";

interface MvpRoleGuardProps {
  role: MvpRole;
  children: ReactNode;
}

export function MvpRoleGuard({ role, children }: MvpRoleGuardProps) {
  const location = useLocation();
  const { profile, isLoading, user } = useMvpUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!profile) {
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
  }

  if (profile.role !== role) {
    const target = roleHomePath(profile.role);
    if (target === location.pathname) {
      return null;
    }
    return <Navigate to={target} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
