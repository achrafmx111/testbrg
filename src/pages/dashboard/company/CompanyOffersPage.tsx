import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Clock3, Download, FileCheck2, FileText, Loader2, Printer, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpApplication, MvpJob, MvpProfile } from "@/integrations/supabase/mvp";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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

  // Contract View State
  const [selectedContract, setSelectedContract] = useState<OfferItem | null>(null);

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
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Offer Intelligence
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Offers & hiring command center</h2>
            <p className="mt-1 text-sm text-muted-foreground">Track offer-stage candidates, review contract context, and close final hiring decisions with confidence.</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
            Decision latency target: &lt; 72h
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={`${summary.total}`} helper="Offer pipeline" icon={<FileText className="h-4 w-4 text-primary" />} />
        <StatCard label="Offer Extended" value={`${summary.extended}`} helper="Awaiting acceptance" icon={<Clock3 className="h-4 w-4 text-primary" />} />
        <StatCard label="Hired" value={`${summary.hired}`} helper="Completed transitions" icon={<CheckCircle2 className="h-4 w-4 text-primary" />} />
      </section>

      <Card className="border-border/60 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> Offer approvals, e-sign readiness, and onboarding trigger checks are healthy.
          </p>
          <Badge variant="outline">Mockup-first mode</Badge>
        </CardContent>
      </Card>

      <section className="space-y-4">
        {offerItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/10 p-10 text-center text-muted-foreground">No active offers yet.</div>
        ) : (
          offerItems.map(({ app, job, candidate }) => {
            const isHired = app.stage === "HIRED";
            const currentItem = { app, job, candidate };
            return (
              <Card key={app.id} className="border-border/60 bg-card/95">
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1.5">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{candidate?.full_name || "Candidate"}</p>
                      <Badge variant={isHired ? "default" : "secondary"}>{isHired ? "Hired" : "Offer extended"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Role: <span className="text-foreground">{job?.title || "Unknown role"}</span></p>
                    <p className="mt-1 text-xs text-muted-foreground">Updated on {new Date(app.updated_at).toLocaleDateString()}</p>
                    <div className="pt-1 text-[11px] text-muted-foreground">
                      Next step: {isHired ? "Finalize onboarding packet" : "Share final contract and collect signature"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isHired ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setSelectedContract(currentItem)}
                        >
                          <FileCheck2 className="h-3.5 w-3.5" />
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

      {/* Contract View Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employment contract preview</DialogTitle>
            <DialogDescription>
              Reviewing offer for {selectedContract?.candidate?.full_name}. This is a read-only preview.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[500px] overflow-y-auto rounded-md border bg-muted/20 p-6 font-mono text-sm">
            <div className="space-y-4">
              <div className="text-center font-bold text-lg mb-6">OFFER OF EMPLOYMENT</div>
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>To:</strong> {selectedContract?.candidate?.full_name}</p>
              <p><strong>Position:</strong> {selectedContract?.job?.title}</p>
              <Separator className="my-4" />
              <p>Dear {selectedContract?.candidate?.full_name?.split(' ')[0] || "Candidate"},</p>
              <p>We are pleased to offer you the position of {selectedContract?.job?.title} at our company.</p>
              <p><strong>Compensation:</strong> {selectedContract?.job?.salary_range || "Competitive Market Rate"}</p>
              <p><strong>Start Date:</strong> TBD</p>
              <p><strong>Location:</strong> {selectedContract?.job?.location || "Remote"}</p>
              <p>This offer is contingent upon the successful completion of reference checks and background verification.</p>
              <p className="mt-4">Sincerely,</p>
              <p>Hiring Manager</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="ghost" className="gap-2" onClick={() => toast({ title: "Printing..." })}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Downloading..." })}>
                <Download className="h-4 w-4" /> Download PDF
              </Button>
              <Button onClick={() => setSelectedContract(null)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        </div>
        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
