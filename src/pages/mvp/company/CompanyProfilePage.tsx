import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpCompany } from "@/integrations/supabase/mvp";

export default function CompanyProfilePage() {
  const [company, setCompany] = useState<MvpCompany | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await mvp.getMyProfile(user.id);
      if (!profile?.company_id) return;

      const companies = await mvp.listCompanies();
      setCompany(companies.find((item) => item.id === profile.company_id) ?? null);
    };

    load().catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Company Profile</h2>
      {!company ? <div className="rounded-lg border p-4 text-sm text-muted-foreground">No company profile found.</div> : null}
      {company ? (
        <div className="rounded-lg border p-4">
          <p className="font-medium">{company.name}</p>
          <p className="text-sm text-muted-foreground">{company.industry ?? "-"}</p>
          <p className="text-sm text-muted-foreground">{company.country ?? "-"}</p>
        </div>
      ) : null}
    </div>
  );
}
