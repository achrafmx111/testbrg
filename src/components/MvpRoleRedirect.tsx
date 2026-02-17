import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mvp, roleHomePath } from "@/integrations/supabase/mvp";

export default function MvpRoleRedirect() {
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          setTargetPath("/login");
          return;
        }

        const profile = await mvp.getMyProfile(user.id);

        if (!mounted) return;

        if (!profile) {
          setTargetPath("/login");
          return;
        }

        const home = roleHomePath(profile.role);
        setTargetPath(home);

      } catch {
        if (mounted) setTargetPath("/login");
      }
    };

    run();
    return () => { mounted = false; };
  }, []);

  if (!targetPath) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent redirect if we are already at the target path
  if (location.pathname === targetPath) {
    return null; // Render nothing or dashboard content if applicable
  }

  return <Navigate to={targetPath} replace />;
}
