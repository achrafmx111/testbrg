import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpApplication, MvpJob, MvpProfile } from "@/integrations/supabase/mvp";

type OfferItem = {
  app: MvpApplication;
  job?: MvpJob;
  candidate?: MvpProfile;
};

export default function CompanyOffersPage() {
  const [applications, setApplications] = useState<MvpApplication[]>([]);
  const [jobs, setJobs] = useState<Record<string, MvpJob>>({});
  const [profiles, setProfiles] = useState<Record<string, MvpProfile>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const companyProfile = await mvp.getMyProfile(user.id);
      if (!companyProfile?.company_id) return;

      const [allApplications, jobsData, talentProfiles] = await Promise.all([
        mvp.listCompanyApplications(companyProfile.company_id),
        mvp.listCompanyJobs(companyProfile.company_id),
        mvp.listProfiles("TALENT"),
      ]);

      setApplications(allApplications.filter((app) => app.stage === "OFFER" || app.stage === "HIRED"));
      setJobs(Object.fromEntries(jobsData.map((job) => [job.id, job])));
      setProfiles(Object.fromEntries(talentProfiles.map((profile) => [profile.id, profile])));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const offerItems = useMemo<OfferItem[]>(() => applications.map((app) => ({ app, job: jobs[app.job_id], candidate: profiles[app.talent_id] })), [applications, jobs, profiles]);

  const summary = useMemo(
    () => ({
      total: offerItems.length,
      extended: offerItems.filter((item) => item.app.stage === "OFFER").length,
      hired: offerItems.filter((item) => item.app.stage === "HIRED").length,
    }),
    [offerItems],
  );

  const markAsHired = async (applicationId: string) => {
    setUpdatingId(applicationId);
    try {
      await mvp.updateApplicationStage(applicationId, "HIRED");
      toast({ title: "Candidate marked as hired" });
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update failed", description: error?.message ?? "Try again." });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-accent/10 p-5 md:p-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Offers & Hiring Desk</h2>
        <p className="mt-1 text-sm text-muted-foreground">Track offer-stage candidates and finalize hiring decisions quickly.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={`${summary.total}`} helper="Offer pipeline" />
        <StatCard label="Offer Extended" value={`${summary.extended}`} helper="Awaiting acceptance" />
        <StatCard label="Hired" value={`${summary.hired}`} helper="Completed transitions" />
      </section>

      <section className="space-y-4">
        {offerItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/10 p-10 text-center text-muted-foreground">No active offers yet.</div>
        ) : (
          offerItems.map(({ app, job, candidate }) => {
            const isHired = app.stage === "HIRED";
            return (
              <Card key={app.id} className="border-border/60">
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{candidate?.full_name || "Candidate"}</p>
                      <Badge variant={isHired ? "default" : "secondary"}>{isHired ? "Hired" : "Offer extended"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Role: <span className="text-foreground">{job?.title || "Unknown role"}</span></p>
                    <p className="mt-1 text-xs text-muted-foreground">Updated on {new Date(app.updated_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isHired ? (
                      <>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          View contract
                        </Button>
                        <Button size="sm" onClick={() => markAsHired(app.id)} disabled={updatingId === app.id}>
                          {updatingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                          Mark hired
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        <CheckCircle2 className="mr-1.5 h-4 w-4 text-primary" />
                        Onboarding started
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
