import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, FileText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpApplication, MvpJob, MvpProfile } from "@/integrations/supabase/mvp";

export default function CompanyOffersPage() {
  const [applications, setApplications] = useState<MvpApplication[]>([]);
  const [jobs, setJobs] = useState<Record<string, MvpJob>>({});
  const [profiles, setProfiles] = useState<Record<string, MvpProfile>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const companyProfile = await mvp.getMyProfile(user.id);
      if (!companyProfile?.company_id) return;

      const allApps = await mvp.listCompanyApplications(companyProfile.company_id);
      const offerApps = allApps.filter(a => a.stage === "OFFER" || a.stage === "HIRED");
      setApplications(offerApps);

      const [jobsData, allProfiles] = await Promise.all([
        mvp.listCompanyJobs(companyProfile.company_id),
        mvp.listProfiles("TALENT")
      ]);

      const jobMap: Record<string, MvpJob> = {};
      jobsData.forEach(j => jobMap[j.id] = j);
      setJobs(jobMap);

      const profMap: Record<string, MvpProfile> = {};
      allProfiles.forEach(p => profMap[p.id] = p);
      setProfiles(profMap);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAsHired = async (appId: string) => {
    setUpdatingId(appId);
    try {
      await mvp.updateApplicationStage(appId, "HIRED");
      toast({ title: "Congratulations!", description: "Candidate marked as hired." });
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Offers & Hiring</h2>
        <p className="text-muted-foreground">Manage extended offers and finalize hires.</p>
      </div>

      <div className="grid gap-4">
        {applications.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No active offers or recent hires.</p>
          </div>
        ) : (
          applications.map(app => {
            const job = jobs[app.job_id];
            const profile = profiles[app.talent_id];
            const isHired = app.stage === "HIRED";

            return (
              <Card key={app.id}>
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="space-y-1">
                    <div className="text-xl font-bold flex items-center gap-2">
                      {profile?.full_name || "Unknown Candidate"}
                      {isHired && <Badge className="bg-green-600">HIRED</Badge>}
                      {!isHired && <Badge variant="secondary">OFFER EXTENDED</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Applying for <span className="font-medium text-foreground">{job?.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Offer Date: {new Date(app.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isHired && (
                      <>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" /> View Contract
                        </Button>
                        <Button
                          onClick={() => markAsHired(app.id)}
                          disabled={!!updatingId}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updatingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                          Mark as Hired
                        </Button>
                      </>
                    )}
                    {isHired && (
                      <Button variant="outline" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Onboarding Started
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
