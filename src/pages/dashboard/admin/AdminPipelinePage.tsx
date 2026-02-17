import { useEffect, useState } from "react";
import { Loader2, MoreHorizontal, Calendar, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mvp, MvpApplication, MvpJob, MvpProfile, MvpCompany, ApplicationStage } from "@/integrations/supabase/mvp";
import { InterviewModal } from "@/components/mvp/InterviewModal";

const SCOLS: ApplicationStage[] = ["APPLIED", "SCREEN", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

export default function AdminPipelinePage() {
  const [applications, setApplications] = useState<MvpApplication[]>([]);
  const [jobs, setJobs] = useState<Record<string, MvpJob>>({});
  const [profiles, setProfiles] = useState<Record<string, MvpProfile>>({});
  const [companies, setCompanies] = useState<Record<string, MvpCompany>>({});

  const [loading, setLoading] = useState(true);

  // Interview Modal State
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<MvpApplication | null>(null);

  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [apps, allJobs, allProfiles, allCompanies] = await Promise.all([
        mvp.listApplications(),
        mvp.listJobs(),
        mvp.listProfiles("TALENT"),
        mvp.listCompanies()
      ]);

      setApplications(apps);

      const jobMap: Record<string, MvpJob> = {};
      allJobs.forEach(j => jobMap[j.id] = j);
      setJobs(jobMap);

      const profMap: Record<string, MvpProfile> = {};
      allProfiles.forEach(p => profMap[p.id] = p);
      setProfiles(profMap);

      const compMap: Record<string, MvpCompany> = {};
      allCompanies.forEach(c => compMap[c.id] = c);
      setCompanies(compMap);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStage = async (appId: string, newStage: ApplicationStage) => {
    try {
      await mvp.updateApplicationStage(appId, newStage);
      toast({ title: "Updated", description: `Candidate moved to ${newStage}` });
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.message });
    }
  };

  const openScheduleModal = (app: MvpApplication) => {
    setSelectedApp(app);
    setInterviewOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Kanban Columns
  const columns = SCOLS.reduce((acc, stage) => {
    acc[stage] = applications.filter(a => a.stage === stage);
    return acc;
  }, {} as Record<ApplicationStage, MvpApplication[]>);

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Global Pipeline</h2>
        <p className="text-muted-foreground">Overview of all candidate applications across companies.</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {SCOLS.map(stage => (
            <div key={stage} className="w-[300px] flex flex-col bg-muted/20 rounded-lg border h-full">
              <div className="p-3 border-b bg-muted/40 font-semibold flex justify-between items-center">
                {stage}
                <Badge variant="secondary" className="text-xs">{columns[stage].length}</Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {columns[stage].map(app => {
                  const job = jobs[app.job_id];
                  const profile = profiles[app.talent_id];
                  const company = job ? companies[job.company_id] : null;

                  return (
                    <Card key={app.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm truncate pr-2" title={profile?.full_name ?? "Unknown"}>
                            {profile?.full_name || "Unknown Candidate"}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Move To</DropdownMenuLabel>
                              {SCOLS.map(s => (
                                <DropdownMenuItem
                                  key={s}
                                  onClick={() => updateStage(app.id, s)}
                                  disabled={s === app.stage}
                                >
                                  {s}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openScheduleModal(app)}>
                                <Calendar className="mr-2 h-4 w-4" /> Schedule Interview
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{job?.title || "Unknown Job"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{company?.name || "Unknown Company"}</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-muted-foreground text-right mt-2">
                          {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <InterviewModal
        open={interviewOpen}
        onOpenChange={setInterviewOpen}
        applicationId={selectedApp?.id ?? null}
        onScheduled={() => {
          // Optimistic update or reload
          if (selectedApp) {
            updateStage(selectedApp.id, 'INTERVIEW');
          }
        }}
      />
    </div>
  );
}
