import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SmartDashboardRedirect = () => {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    const resolve = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setTarget("/login");
        return;
      }

      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role;

      if (role === "admin") {
        setTarget("/dashboard/admin");
        return;
      }

      if (role === "business") {
        setTarget("/dashboard/company");
        return;
      }

      const { data: talentPoolApps } = await (supabase as any)
        .from("applications")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", "talent_pool_registration")
        .limit(1);

      if ((talentPoolApps || []).length > 0) {
        setTarget("/dashboard/talent-external");
        return;
      }

      setTarget("/dashboard/talent");
    };

    resolve();
  }, []);

  if (!target) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Navigate to={target} replace />;
};

export default SmartDashboardRedirect;
