import { useEffect, useState } from "react";
import { Loader2, Briefcase, Calendar, Video, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpApplication, MvpJob, MvpInterview } from "@/integrations/supabase/mvp";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TalentApplicationsPage() {
  const [applications, setApplications] = useState<MvpApplication[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]); // Using any for nested relations
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // We use listCompanyApplications style fetching or similar
        // But here we want applications with job/company details.
        // listTalentApplications joins nothing.
        // We might need to fetch jobs separately or enhance backend.
        // For MVP, fetch APPS + JOBS + COMPANIES is easiest via client join or enhanced query.
        // Let's stick to basic APPS and basic JOBS list for join.

        const [apps, jobsData, uInterviews] = await Promise.all([
          mvp.listTalentApplications(user.id),
          mvp.listJobs(), // Fetch all jobs to resolve titles/companies
          mvp.listTalentInterviews(user.id)
        ]);

        // Resolve job details manually
        const enrichedApps = apps.map(app => {
          const job = jobsData.find(j => j.id === app.job_id);
          // We don't have company name in MvpJob (it has company_id).
          // We'd need listCompanies too.
          // This is getting heavy.
          // Ideally updates to listTalentApplications to select joins.
          // But for now, we pass 'job' object.
          return { ...app, job };
        });

        setApplications(enrichedApps);
        setInterviews(uInterviews);

        // Fetch companies to get names?
        // Actually let's fetch companies too
        const companies = await mvp.listCompanies();
        setApplications(apps.map(app => {
          const job = jobsData.find(j => j.id === app.job_id);
          const company = companies.find(c => c.id === job?.company_id);
          return { ...app, job, company };
        }));

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground mt-1">Track your job applications and upcoming interviews.</p>
      </div>

      {interviews.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Upcoming Interviews
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {interviews.map(interview => (
              <Card key={interview.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{interview.applications?.jobs?.title}</CardTitle>
                  <CardDescription>{interview.applications?.jobs?.companies?.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(interview.scheduled_at).toLocaleString()}
                    </div>
                    {interview.meeting_link && (
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <a href={interview.meeting_link} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          Join Meeting
                        </a>
                      </div>
                    )}
                    {interview.feedback && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <strong>Feedback:</strong> {interview.feedback}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-muted-foreground" /> Application History
        </h2>
        {applications.length === 0 ? (
          <div className="p-8 border border-dashed rounded-lg text-center bg-muted/20">
            <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
            <Button variant="link" className="mt-2 text-primary">Find Jobs</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => (
              <Card key={app.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{app.job?.title || "Unknown Job"}</h3>
                    <p className="text-muted-foreground text-sm">{app.company?.name || "Unknown Company"}</p>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                      {app.stage !== 'APPLIED' && (
                        <span className="text-primary font-medium">Updated: {new Date(app.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      app.stage === 'HIRED' ? 'default' :
                        app.stage === 'REJECTED' ? 'destructive' :
                          app.stage === 'INTERVIEW' ? 'secondary' : 'outline'
                    }>
                      {app.stage}
                    </Badge>
                    <Button size="sm" variant="ghost">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
