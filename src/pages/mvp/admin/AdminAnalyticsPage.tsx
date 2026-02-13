import { useEffect, useState } from "react";
import { mvp } from "@/integrations/supabase/mvp";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({ talents: 0, jobs: 0, applications: 0, interviews: 0 });

  useEffect(() => {
    const load = async () => {
      const [talents, jobs, applications, interviews] = await Promise.all([
        mvp.listTalentProfiles(),
        mvp.listJobs(),
        mvp.listApplications(),
        mvp.listInterviews(),
      ]);

      setStats({
        talents: talents.length,
        jobs: jobs.length,
        applications: applications.length,
        interviews: interviews.length,
      });
    };
    load().catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Analytics</h2>
      <p className="text-sm text-muted-foreground">Funnel baseline: Signup -&gt; Learning -&gt; Job-ready -&gt; Interview -&gt; Placement.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Kpi label="Talents" value={stats.talents} />
        <Kpi label="Jobs" value={stats.jobs} />
        <Kpi label="Applications" value={stats.applications} />
        <Kpi label="Interviews" value={stats.interviews} />
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
