import { useEffect, useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { mvp, MvpJob } from "@/integrations/supabase/mvp";
import { AdminEmptyState, AdminSectionHeader, AdminStatusBadge } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<MvpJob[]>([]);

  useEffect(() => {
    mvp.listJobs().then(setJobs).catch(() => undefined);
  }, []);

  return (
    <div className="space-y-8">
      <AdminSectionHeader title="Jobs" description="Open opportunities, requirements, and pipeline readiness." />

      {jobs.length === 0 ? <AdminEmptyState text="No jobs yet." /> : null}

      <div className={adminClassTokens.tableWrap}>
        <table className="w-full">
          <thead className={adminClassTokens.tableHead}>
            <tr>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Location</th>
              <th className="px-5 py-3 text-left">Skills</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className={adminClassTokens.tableRow}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-secondary/35 bg-secondary/20 p-1 text-secondary-foreground">
                      <BriefcaseBusiness className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold tracking-[-0.01em] text-foreground">{job.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{job.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{job.location ?? "Remote"}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{job.required_skills.join(", ") || "No skills listed"}</td>
                <td className="px-5 py-3">
                  <AdminStatusBadge text={job.status} kind={job.status === "OPEN" ? "primary" : "neutral"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
