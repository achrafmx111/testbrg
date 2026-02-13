import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mvp, roleHomePath } from "@/integrations/supabase/mvp";

export default function MvpRoleRedirect() {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPath("/login");
        return;
      }

      const profile = await mvp.getMyProfile(user.id);
      if (!profile) {
        setPath("/login");
        return;
      }

      setPath(roleHomePath(profile.role));
    };

    run().catch(() => setPath("/login"));
  }, []);

  if (!path) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Navigate to={path} replace />;
}
