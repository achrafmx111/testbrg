import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock3, Link2, Loader2, Plus, Sparkles, Users, Video } from "lucide-react";
import { format } from "date-fns";
import { mvp, mvpSchema, MvpApplication, MvpInterview } from "@/integrations/supabase/mvp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ExtendedApplication extends MvpApplication {
  job_title?: string;
  candidate_name?: string;
}

export default function CompanyInterviewsPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [interviews, setInterviews] = useState<MvpInterview[]>([]);
  const [applications, setApplications] = useState<ExtendedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedAppId, setSelectedAppId] = useState("");
  const [interviewTime, setInterviewTime] = useState("10:00");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await mvp.getMyProfile(user.id);
      if (!profile?.company_id) return;

      const interviewsData = await mvp.listInterviews(profile.company_id);
      setInterviews(interviewsData);

      const { data: jobs } = await mvpSchema.from("jobs").select("id, title").eq("company_id", profile.company_id);
      const jobIds = (jobs ?? []).map((job) => job.id);

      if (!jobIds.length) {
        setApplications([]);
        return;
      }

      const { data: apps } = await mvpSchema
        .from("applications")
        .select(`
          *,
          jobs(title),
          profiles(full_name)
        `)
        .in("job_id", jobIds)
        .in("stage", ["SCREEN", "INTERVIEW", "OFFER"])
        .order("created_at", { ascending: false });

      const mappedApps: ExtendedApplication[] = (apps ?? []).map((app: any) => ({
        id: app.id,
        job_id: app.job_id,
        talent_id: app.talent_id,
        stage: app.stage,
        score: app.score,
        created_at: app.created_at,
        updated_at: app.updated_at,
        job_title: app.jobs?.title,
        candidate_name: app.profiles?.full_name,
      }));

      setApplications(mappedApps);
    } catch (error) {
      console.error("Error loading interviews:", error);
      setInterviews([
        {
          id: "mock-int-1",
          application_id: "mock-app-1",
          scheduled_at: new Date(new Date().setHours(14, 30)).toISOString(),
          meeting_link: "https://meet.google.com/mock-demo",
          feedback: "Focus on project ownership and stakeholder communication.",
          created_at: new Date().toISOString(),
        },
      ]);
      setApplications([
        {
          id: "mock-app-1",
          job_id: "mock-job-1",
          talent_id: "mock-talent-1",
          stage: "INTERVIEW",
          score: 88,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          job_title: "SAP S/4 Consultant",
          candidate_name: "Mock Candidate",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedDateInterviews = useMemo(
    () => interviews.filter((item) => date && new Date(item.scheduled_at).toDateString() === date.toDateString()),
    [date, interviews],
  );

  const kpis = useMemo(() => {
    const upcoming = interviews.filter((item) => new Date(item.scheduled_at).getTime() > Date.now()).length;
    const withLink = interviews.filter((item) => Boolean(item.meeting_link)).length;
    return {
      total: interviews.length,
      upcoming,
      withLink,
      candidates: applications.length,
    };
  }, [applications.length, interviews]);

  const getAppDetails = (applicationId: string) => applications.find((item) => item.id === applicationId);

  const handleSchedule = async () => {
    if (!selectedAppId || !date || !interviewTime) {
      toast({
        title: "Missing fields",
        description: "Select candidate, date, and time before scheduling.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const scheduledDate = new Date(date);
      const [hours, minutes] = interviewTime.split(":").map(Number);
      scheduledDate.setHours(hours, minutes, 0, 0);

      await mvp.createInterview({
        application_id: selectedAppId,
        scheduled_at: scheduledDate.toISOString(),
        meeting_link: meetingLink.trim() || undefined,
        feedback: notes.trim() || undefined,
      });

      toast({ title: "Interview scheduled", description: "Candidate and team are now aligned on this slot." });

      setDialogOpen(false);
      setSelectedAppId("");
      setMeetingLink("");
      setNotes("");
      await loadData();
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast({ title: "Schedule failed", description: "Please retry in a moment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Interview Ops
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Interview scheduler</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Plan interview loops, keep candidate momentum high, and centralize prep notes for your team.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 gap-2">
                <Plus className="h-4 w-4" /> Schedule interview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Create interview slot</DialogTitle>
                <DialogDescription>Pick candidate, time, and optional meeting context.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Candidate & role</Label>
                  <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select candidate..." />
                    </SelectTrigger>
                    <SelectContent>
                      {applications.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          {(app.candidate_name || "Candidate") + " - " + (app.job_title || "Role")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Date</Label>
                    <div className="rounded-md border px-3 py-2 text-sm text-foreground">{date ? format(date, "PPP") : "Select on calendar"}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Time</Label>
                    <Input type="time" value={interviewTime} onChange={(event) => setInterviewTime(event.target.value)} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Meeting link (optional)</Label>
                  <Input placeholder="https://meet.google.com/..." value={meetingLink} onChange={(event) => setMeetingLink(event.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>Prep notes (optional)</Label>
                  <Textarea placeholder="Topics, panel focus, candidate context..." value={notes} onChange={(event) => setNotes(event.target.value)} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSchedule} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Schedule"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total interviews" value={`${kpis.total}`} icon={<Video className="h-4 w-4 text-primary" />} />
        <MetricCard label="Upcoming" value={`${kpis.upcoming}`} icon={<Clock3 className="h-4 w-4 text-primary" />} />
        <MetricCard label="With meeting links" value={`${kpis.withLink}`} icon={<Link2 className="h-4 w-4 text-primary" />} />
        <MetricCard label="Interview-ready candidates" value={`${kpis.candidates}`} icon={<Users className="h-4 w-4 text-primary" />} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Calendar</CardTitle>
            <CardDescription>Dates with interviews are highlighted.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-xl border p-3"
              modifiers={{
                interview: (current) => interviews.some((item) => new Date(item.scheduled_at).toDateString() === current.toDateString()),
              }}
              modifiersStyles={{
                interview: { fontWeight: "bold", color: "hsl(var(--primary))", textDecoration: "underline" },
              }}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-3 text-base">
              <span>{date ? format(date, "MMMM d, yyyy") : "Schedule"}</span>
              <Badge variant="outline">{selectedDateInterviews.length} slots</Badge>
            </CardTitle>
            <CardDescription>Interview agenda for the selected day.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : null}

            {!loading && selectedDateInterviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/10 p-10 text-center">
                <CalendarIcon className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-semibold text-foreground">No interviews scheduled</p>
                <p className="mt-1 text-sm text-muted-foreground">Create a slot to keep candidates moving in your funnel.</p>
              </div>
            ) : null}

            {!loading
              ? selectedDateInterviews.map((item) => {
                const app = getAppDetails(item.application_id);
                return (
                  <div key={item.id} className="rounded-xl border border-border/50 bg-card/70 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{app?.candidate_name || "Candidate"}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{app?.job_title || "Role"}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock3 className="h-3 w-3" /> {format(new Date(item.scheduled_at), "p")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.meeting_link ? (
                          <Button variant="outline" size="sm" onClick={() => window.open(item.meeting_link || "", "_blank", "noopener,noreferrer")}>
                            <Video className="mr-1.5 h-4 w-4" /> Join call
                          </Button>
                        ) : null}
                        <Badge variant="secondary">{app?.stage || "INTERVIEW"}</Badge>
                      </div>
                    </div>

                    {item.feedback ? <p className="mt-2 text-xs text-muted-foreground">Notes: {item.feedback}</p> : null}
                  </div>
                );
              })
              : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5">{icon}</div>
      </CardContent>
    </Card>
  );
}
