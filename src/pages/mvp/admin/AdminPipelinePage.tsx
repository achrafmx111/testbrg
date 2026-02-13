import { useEffect, useMemo, useState } from "react";
import { mvp, MvpApplication } from "@/integrations/supabase/mvp";

const stages = ["APPLIED", "SCREEN", "INTERVIEW", "OFFER", "HIRED", "REJECTED"] as const;

export default function AdminPipelinePage() {
  const [applications, setApplications] = useState<MvpApplication[]>([]);

  useEffect(() => {
    mvp.listApplications().then(setApplications).catch(() => undefined);
  }, []);

  const grouped = useMemo(() => {
    return stages.map((stage) => ({
      stage,
      count: applications.filter((app) => app.stage === stage).length,
    }));
  }, [applications]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Pipeline</h2>
      <p className="text-sm text-muted-foreground">Global placement stages and stuck candidate monitoring.</p>
      <div className="grid gap-3 md:grid-cols-3">
        {grouped.map((item) => (
          <div key={item.stage} className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{item.stage}</p>
            <p className="text-2xl font-semibold">{item.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
