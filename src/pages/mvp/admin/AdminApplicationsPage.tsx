import { useEffect, useMemo, useState } from "react";
import { mvp, MvpApplication } from "@/integrations/supabase/mvp";
import { AdminEmptyState, AdminSectionHeader, AdminStatusBadge } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<MvpApplication[]>([]);

  useEffect(() => {
    mvp.listApplications().then(setApplications).catch(() => undefined);
  }, []);

  const stageStats = useMemo(() => {
    const stages = ["APPLIED", "SCREEN", "INTERVIEW", "OFFER", "HIRED", "REJECTED"] as const;
    return stages.map((stage) => ({ stage, value: applications.filter((app) => app.stage === stage).length }));
  }, [applications]);

  return (
    <div className="space-y-8">
      <AdminSectionHeader title="Applications" description="Global pipeline visibility with stage distribution and candidate movement." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {stageStats.map((item) => (
          <div
            key={item.stage}
            className="rounded-xl border border-border/65 bg-card p-4 shadow-[0_8px_20px_-16px_hsl(var(--navy)/0.22),0_2px_5px_-3px_hsl(var(--navy)/0.14)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{item.stage}</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      {applications.length === 0 ? <AdminEmptyState text="No applications yet." /> : null}

      <div className={adminClassTokens.tableWrap}>
        <table className="w-full">
          <thead className={adminClassTokens.tableHead}>
            <tr>
              <th className="px-5 py-3 text-left">Application</th>
              <th className="px-5 py-3 text-left">Job</th>
              <th className="px-5 py-3 text-left">Talent</th>
              <th className="px-5 py-3 text-left">Stage</th>
            </tr>
          </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className={adminClassTokens.tableRow}>
                  <td className="px-5 py-3 text-sm font-semibold text-foreground">{app.id}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{app.job_id}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{app.talent_id}</td>
                  <td className="px-5 py-3">
                  <AdminStatusBadge
                    text={app.stage}
                    kind={app.stage === "HIRED" ? "accent" : app.stage === "REJECTED" ? "danger" : "primary"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
