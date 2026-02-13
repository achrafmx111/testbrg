import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpJob } from "@/integrations/supabase/mvp";

export default function TalentJobsPage() {
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await mvp.listOpenJobs();
      setJobs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const apply = async (jobId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setApplyingId(jobId);
    try {
      await mvp.applyToJob(jobId, user.id);
      toast({ title: "Application submitted", description: "Your application was sent." });
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Apply failed", description: error?.message });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Jobs</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading jobs...
        </div>
      ) : null}

      {!loading && jobs.length === 0 ? (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">No open jobs available right now.</div>
      ) : null}

      {jobs.map((job) => (
        <div key={job.id} className="rounded-lg border p-3" data-testid="talent-job-card">
          <p className="font-medium">{job.title}</p>
          <p className="text-sm text-muted-foreground">
            {job.location ?? "Remote"} - {job.salary_range ?? "N/A"}
          </p>
          <p className="mt-2 text-sm">{job.description}</p>
          <Button className="mt-3" size="sm" onClick={() => apply(job.id)} disabled={applyingId === job.id}>
            {applyingId === job.id ? "Applying..." : "Apply"}
          </Button>
        </div>
      ))}
    </div>
  );
}
