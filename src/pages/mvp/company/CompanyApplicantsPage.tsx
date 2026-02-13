import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationStage, mvp, MvpApplication, MvpJob } from "@/integrations/supabase/mvp";

const stages: ApplicationStage[] = ["APPLIED", "SCREEN", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

export default function CompanyApplicantsPage() {
  const [applications, setApplications] = useState<MvpApplication[]>([]);
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ApplicationStage>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await mvp.getMyProfile(user.id);
      if (!profile?.company_id) return;

      const [apps, jobsData] = await Promise.all([
        mvp.listCompanyApplications(profile.company_id),
        mvp.listCompanyJobs(profile.company_id),
      ]);

      setApplications(apps);
      setJobs(jobsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const saveStage = async (application: MvpApplication) => {
    const stage = drafts[application.id] ?? application.stage;
    setSavingId(application.id);
    try {
      await mvp.updateApplicationStage(application.id, stage);
      toast({ title: "Application updated", description: `Stage moved to ${stage}` });
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Stage update failed", description: error?.message });
    } finally {
      setSavingId(null);
    }
  };

  const resolveJobTitle = (jobId: string) => jobs.find((job) => job.id === jobId)?.title ?? jobId;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Applicants</h2>
      <p className="text-sm text-muted-foreground">Pipeline skeleton</p>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading applicants...
        </div>
      ) : null}

      {!loading && applications.length === 0 ? (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">No applicants yet.</div>
      ) : null}

      {applications.map((application) => (
        <div key={application.id} className="rounded-lg border p-3" data-testid="company-applicant-card">
          <p className="text-sm">Talent: {application.talent_id}</p>
          <p className="text-sm text-muted-foreground">Job: {resolveJobTitle(application.job_id)}</p>
          <p className="text-xs text-muted-foreground">Job ID: {application.job_id}</p>
          <p className="text-sm">Current stage: {drafts[application.id] ?? application.stage}</p>

          <div className="mt-3 flex items-center gap-2">
            <select
              className="rounded border px-2 py-1 text-sm"
              value={drafts[application.id] ?? application.stage}
              disabled={savingId === application.id}
              onChange={(e) =>
                setDrafts((prev) => ({
                  ...prev,
                  [application.id]: e.target.value as ApplicationStage,
                }))
              }
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>

            <Button size="sm" onClick={() => saveStage(application)} disabled={savingId === application.id}>
              {savingId === application.id ? "Saving..." : "Save stage"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
