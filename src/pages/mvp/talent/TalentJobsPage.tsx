import { useEffect, useState, useMemo } from "react";
import { Loader2, MapPin, Briefcase, DollarSign, Search, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpJob, MvpTalentProfile } from "@/integrations/supabase/mvp";
import { matchJobsToTalent, MatchResult } from "@/lib/matchingEngine";

export default function TalentJobsPage() {
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [profile, setProfile] = useState<MvpTalentProfile | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const allJobs = await mvp.listOpenJobs();
      setJobs(allJobs);

      if (user) {
        const allTalents = await mvp.listTalentProfiles();
        const myProfile = allTalents.find((t) => t.user_id === user.id) ?? null;
        setProfile(myProfile);

        if (myProfile) {
          const scored = matchJobsToTalent(myProfile, allJobs, 100);
          setMatches(scored);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const apply = async (jobId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }

    setApplyingId(jobId);
    try {
      await mvp.applyToJob(jobId, user.id);
      toast({ title: "Application submitted", description: "Good luck!" });
      // Ideally refresh applications state here
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        toast({ title: "Already applied", description: "You have already applied to this position." });
      } else {
        toast({ variant: "destructive", title: "Apply failed", description: error?.message });
      }
    } finally {
      setApplyingId(null);
    }
  };

  // Merge jobs with their match scores
  const displayedJobs = useMemo(() => {
    let list = jobs.map(job => {
      const match = matches.find(m => m.jobId === job.id);
      return { ...job, matchScore: match?.score ?? 0, breakdown: match?.breakdown };
    });

    // Sort by match score if profile exists, otherwise date
    if (profile) {
      list.sort((a, b) => b.matchScore - a.matchScore);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.required_skills.some(s => s.toLowerCase().includes(q))
      );
    }

    return list;
  }, [jobs, matches, search, profile]);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Open Positions</h2>
        <p className="text-muted-foreground">Find roles that match your skills and readiness.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs by title, skill, or location..."
          className="pl-9 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {!loading && displayedJobs.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <Briefcase className="mx-auto h-12 w-12 opacity-20 mb-4" />
          No jobs found matching your criteria.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {displayedJobs.map((job) => (
          <div key={job.id} className="group relative rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {job.location ?? "Remote"}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" /> {job.salary_range ?? "Competitive"}
                      </span>
                    </div>
                  </div>
                  {job.matchScore > 0 && (
                    <Badge variant={job.matchScore > 70 ? "default" : "secondary"} className="ml-2 gap-1 px-2.5 py-1">
                      <Zap className="h-3 w-3 fill-current" />
                      {job.matchScore}% Match
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-foreground/80 line-clamp-2 md:line-clamp-none">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {job.required_skills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs font-normal">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-end md:justify-center">
                <Button onClick={() => apply(job.id)} disabled={applyingId === job.id} className="w-full md:w-auto">
                  {applyingId === job.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying</> : "Quick Apply"}
                </Button>
              </div>
            </div>

            {/* Match Breakdown - Only visible on hover/focus if high match */}
            {job.matchScore > 0 && job.breakdown && (
              <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-xs text-muted-foreground hidden group-hover:flex animate-in fade-in transition-all">
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-primary" /> Skills: {job.breakdown.skillsOverlap}%</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-primary" /> Readiness: {job.breakdown.readiness}%</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-primary" /> Location: {job.breakdown.languageMatch}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
