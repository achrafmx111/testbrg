import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  Trophy,
  Briefcase,
  ArrowRight,
  CheckCircle,
  Clock,
  User,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpTalentProfile, MvpJob, MvpApplication } from "@/integrations/supabase/mvp";
import { matchJobsToTalent, MatchResult } from "@/lib/matchingEngine";

export default function TalentHomePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MvpTalentProfile | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [applications, setApplications] = useState<MvpApplication[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [allTalents, allJobs, myApps] = await Promise.all([
          mvp.listTalentProfiles(),
          mvp.listOpenJobs(),
          mvp.listTalentApplications(user.id),
        ]);

        const myProfile = allTalents.find((t) => t.user_id === user.id) || null;
        setProfile(myProfile);
        setJobs(allJobs);
        setApplications(myApps);

        if (myProfile) {
          // Calculate matches
          const topMatches = matchJobsToTalent(myProfile, allJobs, 5);
          setMatches(topMatches);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">Profile Not Found</h2>
        <p className="text-muted-foreground">Please complete your profile to view your dashboard.</p>
        <Button asChild className="mt-4">
          <Link to="profile">Complete Profile</Link>
        </Button>
      </div>
    );
  }

  const getJob = (id: string) => jobs.find((j) => j.id === id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your job search today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="profile">Edit Profile</Link>
          </Button>
          <Button asChild>
            <Link to="jobs">Find Jobs</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Readiness Score */}
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{profile.readiness_score}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <Progress value={profile.readiness_score} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">Based on skills & assessments</p>
          </CardContent>
          <Trophy className="absolute right-4 top-4 h-12 w-12 text-primary/10" />
        </Card>

        {/* Active Applications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{applications.filter(a => a.stage !== 'REJECTED' && a.stage !== 'HIRED').length}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {applications.length > 0 ? "Last update recently" : "No active applications"}
            </p>
          </CardContent>
          <Briefcase className="absolute right-4 top-4 h-12 w-12 text-muted-foreground/10" />
        </Card>

        {/* Profile Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profile Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={profile.placement_status === 'JOB_READY' ? 'default' : 'secondary'} className="mt-1">
                {profile.placement_status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {profile.skills.slice(0, 3).map(skill => (
                <span key={skill} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border">
                  {skill}
                </span>
              ))}
              {profile.skills.length > 3 && (
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border">
                  +{profile.skills.length - 3}
                </span>
              )}
            </div>
          </CardContent>
          <User className="absolute right-4 top-4 h-12 w-12 text-muted-foreground/10" />
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Job Matches */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
              Top Job Matches
            </h2>
            <Link to="jobs" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {matches.length > 0 ? (
              matches.map((match) => {
                const job = getJob(match.jobId);
                if (!job) return null;
                return (
                  <Card key={match.jobId} className="group hover:border-primary/50 transition-colors">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">
                        {match.score}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.location} • {job.salary_range}</p>
                          </div>
                          <Button size="sm" variant="secondary" asChild>
                            <Link to="jobs">View</Link>
                          </Button>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Skills: {match.breakdown.skillsOverlap}%
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500" />
                            Readiness: {match.breakdown.readiness}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg bg-muted/30">
                <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-sm font-medium">No matches found yet</h3>
                <p className="text-xs text-muted-foreground mt-1 px-4">
                  Complete your profile skills or improve your readiness score to see job matches.
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="profile">Update Profile</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Recent Applications</h2>
          <Card>
            <CardContent className="p-0">
              {applications.length > 0 ? (
                <div className="divide-y">
                  {applications.slice(0, 5).map((app) => {
                    const job = getJob(app.job_id);
                    return (
                      <div key={app.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{job?.title || "Unknown Position"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={
                          app.stage === 'HIRED' ? 'default' :
                            app.stage === 'REJECTED' ? 'destructive' :
                              app.stage === 'INTERVIEW' ? 'secondary' : 'outline'
                        } className="text-[10px]">
                          {app.stage}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">No applications yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-base text-primary">Need Coaching?</CardTitle>
              <CardDescription>
                Schedule a session with a mentor to improve your readiness score.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Book Session</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
