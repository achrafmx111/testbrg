import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpApplication, MvpJob } from "@/integrations/supabase/mvp";

export default function TalentApplicationsPage() {
  const [applications, setApplications] = useState<MvpApplication[]>([]);
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const [apps, jobsData] = await Promise.all([mvp.listTalentApplications(user.id), mvp.listOpenJobs()]);
        setApplications(apps);
        setJobs(jobsData);
      } finally {
        setLoading(false);
      }
    };

    load().catch(() => undefined);
  }, []);

  const resolveJobTitle = (jobId: string) => jobs.find((job) => job.id === jobId)?.title ?? jobId;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Applications</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading applications...
        </div>
      ) : null}

      {!loading && applications.length === 0 ? (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">You have not applied yet.</div>
      ) : null}

      <div data-testid="talent-application-list">
      {applications.map((application) => (
        <div key={application.id} className="rounded-lg border p-3">
          <p className="text-sm">Job: {resolveJobTitle(application.job_id)}</p>
          <p className="text-xs text-muted-foreground">Job ID: {application.job_id}</p>
          <p className="text-sm font-medium">Stage: {application.stage}</p>
        </div>
      ))}
      </div>
    </div>
  );
}
