import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { mvp, MvpApplication, MvpJob, MvpTalentProfile } from "@/integrations/supabase/mvp";
import { AdminSectionHeader, AdminStatCard, AdminStatusBadge } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<MvpTalentProfile[]>([]);
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [applications, setApplications] = useState<MvpApplication[]>([]);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [interviewsCount, setInterviewsCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [talentRows, companyRows, jobRows, applicationRows, interviewRows] = await Promise.all([
          mvp.listTalentProfiles(),
          mvp.listCompanies(),
          mvp.listJobs(),
          mvp.listApplications(),
          mvp.listInterviews(),
        ]);

        setTalents(talentRows);
        setCompaniesCount(companyRows.length);
        setJobs(jobRows);
        setApplications(applicationRows);
        setInterviewsCount(interviewRows.length);
      } finally {
        setLoading(false);
      }
    };

    load().catch(() => undefined);
  }, []);

  const counts = useMemo(
    () => ({
      talents: talents.length,
      jobReady: talents.filter((talent) => talent.placement_status === "JOB_READY").length,
      companies: companiesCount,
      jobs: jobs.length,
      applications: applications.length,
      interviews: interviewsCount,
      placed: talents.filter((talent) => talent.placement_status === "PLACED").length,
      openJobs: jobs.filter((job) => job.status === "OPEN").length,
    }),
    [talents, companiesCount, jobs, applications, interviewsCount],
  );

  const funnel = [
    { label: "Learning", value: talents.filter((talent) => talent.placement_status === "LEARNING").length },
    { label: "Job-ready", value: counts.jobReady },
    { label: "Applied", value: counts.applications },
    { label: "Interview", value: counts.interviews },
    { label: "Placed", value: counts.placed },
  ];

  const maxFunnel = Math.max(...funnel.map((item) => item.value), 1);
  const recentTalents = talents.slice(0, 5);
  const recentJobs = jobs.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-muted-foreground shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading command center...
      </div>
    );
  }

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Command Center"
        description="Executive overview for academy, marketplace, and placement operations."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <AdminStatCard label="Talents" value={counts.talents} tone="primary" />
        <AdminStatCard label="Job-ready" value={counts.jobReady} tone="secondary" />
        <AdminStatCard label="Companies" value={counts.companies} tone="accent" />
        <AdminStatCard label="Open Jobs" value={counts.openJobs} tone="primary" />
        <AdminStatCard label="Applications" value={counts.applications} tone="secondary" />
        <AdminStatCard label="Interviews" value={counts.interviews} tone="accent" />
        <AdminStatCard label="Placements" value={counts.placed} tone="primary" />
        <AdminStatCard label="Total Jobs" value={counts.jobs} tone="secondary" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px]">
        <div className={adminClassTokens.panel}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold tracking-[-0.01em]">Funnel Snapshot</h3>
            <span className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Live view
            </span>
          </div>
          <div className="mt-6 space-y-5">
            {funnel.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted/80">
                  <div
                    className="h-2.5 rounded-full bg-primary transition-all duration-200 ease-out"
                    style={{ width: `${Math.max(8, (item.value / maxFunnel) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={adminClassTokens.panel}>
          <h3 className="text-base font-semibold tracking-[-0.01em]">Activity Trend (Placeholder)</h3>
          <p className="mt-1 text-sm text-muted-foreground">Weekly activity volume for jobs, applications, and interviews.</p>
          <div className="mt-6 rounded-xl border border-border/60 bg-muted/25 p-4">
            <div className="grid h-44 grid-cols-7 items-end gap-2">
              {[32, 46, 40, 58, 54, 71, 63].map((value, index) => (
                <div key={index} className="space-y-2">
                  <div className="rounded-md bg-secondary/80 transition-all duration-200 ease-out" style={{ height: `${value}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <p className="rounded-md bg-card/70 px-2 py-1">Jobs</p>
              <p className="rounded-md bg-card/70 px-2 py-1">Applications</p>
              <p className="rounded-md bg-card/70 px-2 py-1">Interviews</p>
            </div>
          </div>
        </div>

        <aside className={adminClassTokens.panel}>
          <h3 className="text-base font-semibold tracking-[-0.01em]">Alerts</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className={adminClassTokens.railItem}>
              {counts.jobReady === 0 ? "No talents are job-ready yet." : `${counts.jobReady} talents ready for placement.`}
            </li>
            <li className={adminClassTokens.railItem}>
              {counts.openJobs === 0 ? "No open jobs available." : `${counts.openJobs} open jobs need candidates.`}
            </li>
            <li className={adminClassTokens.railItem}>
              {counts.interviews === 0 ? "No interviews scheduled this week." : `${counts.interviews} interviews currently tracked.`}
            </li>
          </ul>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className={adminClassTokens.tableWrap}>
          <div className="border-b border-border/60 bg-muted/20 px-5 py-4">
            <h3 className="text-base font-semibold tracking-[-0.01em]">Talents</h3>
          </div>
          <table className="w-full">
            <thead className={adminClassTokens.tableHead}>
              <tr>
                <th className="px-5 py-3 text-left">Talent</th>
                <th className="px-5 py-3 text-left">Readiness</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTalents.map((talent) => (
                <tr key={talent.id} className={adminClassTokens.tableRow}>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{talent.user_id}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{talent.readiness_score}</td>
                  <td className="px-5 py-3">
                    <AdminStatusBadge
                      text={talent.placement_status}
                      kind={talent.placement_status === "JOB_READY" ? "primary" : talent.placement_status === "PLACED" ? "accent" : "neutral"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={adminClassTokens.tableWrap}>
          <div className="border-b border-border/60 bg-muted/20 px-5 py-4">
            <h3 className="text-base font-semibold tracking-[-0.01em]">Jobs</h3>
          </div>
          <table className="w-full">
            <thead className={adminClassTokens.tableHead}>
              <tr>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job.id} className={adminClassTokens.tableRow}>
                  <td className="px-5 py-3 text-sm">{job.title}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{job.location ?? "Remote"}</td>
                  <td className="px-5 py-3">
                    <AdminStatusBadge text={job.status} kind={job.status === "OPEN" ? "primary" : "neutral"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={adminClassTokens.panel}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold tracking-[-0.01em]">Applications Summary</h3>
          <span className="text-xs text-muted-foreground">Pipeline health at a glance</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label="Applied"
            value={applications.filter((app) => app.stage === "APPLIED").length}
            kind="primary"
          />
          <SummaryCard
            label="Interview"
            value={applications.filter((app) => app.stage === "INTERVIEW").length}
            kind="accent"
          />
          <SummaryCard label="Hired" value={applications.filter((app) => app.stage === "HIRED").length} kind="secondary" />
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, kind }: { label: string; value: number; kind: "primary" | "secondary" | "accent" }) {
  const kindClass =
    kind === "accent"
      ? "border-accent/30 bg-accent/15"
      : kind === "secondary"
        ? "border-secondary/30 bg-secondary/20"
        : "border-primary/30 bg-primary/15";
  return (
    <div className={`rounded-xl border p-4 shadow-[0_8px_20px_-16px_hsl(var(--navy)/0.22),0_2px_5px_-3px_hsl(var(--navy)/0.14)] ${kindClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-foreground">{value}</p>
    </div>
  );
}
