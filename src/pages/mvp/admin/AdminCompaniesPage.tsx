import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { mvp, MvpCompany } from "@/integrations/supabase/mvp";
import { AdminEmptyState, AdminSectionHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<MvpCompany[]>([]);

  useEffect(() => {
    mvp.listCompanies().then(setCompanies).catch(() => undefined);
  }, []);

  return (
    <div className="space-y-8">
      <AdminSectionHeader title="Companies" description="Recruiter accounts, hiring partners, and company profile health." />

      {companies.length === 0 ? <AdminEmptyState text="No companies yet." /> : null}

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => (
          <div key={company.id} className={adminClassTokens.card}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold tracking-[-0.01em] text-foreground">{company.name}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{company.industry ?? "Industry not set"}</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-5 border-t border-border/60 pt-3 text-sm text-muted-foreground">Country: {company.country ?? "Unknown"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
