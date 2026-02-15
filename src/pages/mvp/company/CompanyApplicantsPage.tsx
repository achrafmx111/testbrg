import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Filter, ArrowRight, User, MoreHorizontal, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationStage, mvp, MvpApplication, MvpJob, MvpProfile, MvpTalentProfile } from "@/integrations/supabase/mvp";
import { scoreTalentJob } from "@/lib/matchingEngine";
import { InterviewModal } from "@/components/mvp/InterviewModal";

const stages: ApplicationStage[] = ["APPLIED", "SCREEN", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

export default function CompanyApplicantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterJobId = searchParams.get("jobId") ?? "all";

  const [applications, setApplications] = useState<MvpApplication[]>([]);
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [profiles, setProfiles] = useState<Record<string, MvpProfile>>({});
  const [talentProfiles, setTalentProfiles] = useState<Record<string, MvpTalentProfile>>({});

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<MvpApplication | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const companyProfile = await mvp.getMyProfile(user.id);
      if (!companyProfile?.company_id) return;

      const [apps, jobsData, allProfiles, allTalents] = await Promise.all([
        mvp.listCompanyApplications(companyProfile.company_id),
        mvp.listCompanyJobs(companyProfile.company_id),
        mvp.listProfiles("TALENT"),
        mvp.listTalentProfiles()
      ]);

      setApplications(apps);
      setJobs(jobsData);

      const profMap: Record<string, MvpProfile> = {};
      allProfiles.forEach(p => profMap[p.id] = p);
      setProfiles(profMap);

      const talentMap: Record<string, MvpTalentProfile> = {};
      allTalents.forEach(t => talentMap[t.user_id] = t);
      setTalentProfiles(talentMap);

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
    setUpdatingId(appId);
    try {
      await mvp.updateApplicationStage(appId, newStage);
      toast({ title: "Updated", description: `Candidate moved to ${newStage}` });
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.message });
    } finally {
      setUpdatingId(null);
    }
  };

  const openScheduleModal = (app: MvpApplication) => {
    setSelectedApp(app);
    setInterviewOpen(true);
  };

  const filteredApps = applications.filter(app => {
    if (filterJobId !== "all" && app.job_id !== filterJobId) return false;
    return true;
  });

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Applicants</h2>
          <p className="text-muted-foreground">Manage candidate pipeline across your jobs.</p>
        </div>
        <div className="w-[300px]">
          <Select
            value={filterJobId}
            onValueChange={(val) => setSearchParams(val === "all" ? {} : { jobId: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No applicants found matching criteria.</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredApps.map(app => {
              const job = jobs.find(j => j.id === app.job_id);
              const profile = profiles[app.talent_id];
              const talent = talentProfiles[app.talent_id];

              // Calculate match score on the fly
              let matchScore = 0;
              if (job && talent) {
                matchScore = scoreTalentJob(talent, job).score;
              }

              return (
                <div key={app.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {(profile?.full_name?.[0] || app.talent_id[0]).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-base">{profile?.full_name || "Unknown Candidate"}</h4>
                      <p className="text-sm text-muted-foreground">Applied for <span className="font-medium text-foreground">{job?.title || "Unknown Job"}</span></p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs font-normal">
                          {talent?.placement_status?.replace("_", " ") || "status unknown"}
                        </Badge>
                        {matchScore > 0 && (
                          <Badge variant={matchScore > 80 ? "default" : "secondary"} className="text-xs">
                            {matchScore}% Match
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block mb-1">Current Stage</span>
                      <Badge variant={app.stage === "REJECTED" ? "destructive" : app.stage === "HIRED" ? "default" : "secondary"}>
                        {app.stage}
                      </Badge>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={!!updatingId}>
                          {updatingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to={`/company/talent-pool?id=${app.talent_id}`}>View Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Move Stage</DropdownMenuLabel>
                        {stages.map(s => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() => updateStage(app.id, s)}
                            disabled={app.stage === s}
                          >
                            {s === app.stage && <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />}
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      <InterviewModal
        open={interviewOpen}
        onOpenChange={setInterviewOpen}
        applicationId={selectedApp?.id ?? null}
        onScheduled={() => {
          if (selectedApp) {
            updateStage(selectedApp.id, 'INTERVIEW');
          }
        }}
      />
    </div>
  );
}
