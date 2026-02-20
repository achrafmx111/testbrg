import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Briefcase, CalendarCheck, GraduationCap, Sparkles, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const weeklyProgress = [
  { day: "Mon", learning: 42, applications: 2 },
  { day: "Tue", learning: 56, applications: 1 },
  { day: "Wed", learning: 61, applications: 2 },
  { day: "Thu", learning: 67, applications: 3 },
  { day: "Fri", learning: 74, applications: 1 },
  { day: "Sat", learning: 79, applications: 0 },
  { day: "Sun", learning: 84, applications: 1 },
];

const readinessMix = [
  { name: "Core Skills", value: 46, fill: "hsl(var(--primary))" },
  { name: "German Readiness", value: 28, fill: "hsl(var(--secondary))" },
  { name: "Interview Prep", value: 26, fill: "hsl(var(--accent))" },
];

const recommendedJobs = [
  { title: "Junior SAP FI Consultant", location: "Berlin", match: 92, status: "Hot Match" },
  { title: "SAP MM Functional Analyst", location: "Munich", match: 87, status: "High Match" },
  { title: "SAP SD Support Specialist", location: "Hamburg", match: 81, status: "Recommended" },
  { title: "SAP BTP Associate", location: "Frankfurt", match: 76, status: "Potential" },
];

const milestones = [
  { title: "FI Fundamentals Assessment", due: "2 days", state: "In Progress" },
  { title: "German B1 Speaking Practice", due: "4 days", state: "Scheduled" },
  { title: "Mock Interview Session", due: "1 week", state: "Booked" },
  { title: "Portfolio Review", due: "10 days", state: "Pending" },
];

export default function TalentHomePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Talent Command
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Talent Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Mock preview: your learning, readiness, and placement journey in one view.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="learning">Open learning</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="jobs">Apply to jobs</Link>
            </Button>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Readiness Score" value="84/100" helper="+6 this week" icon={<Target className="h-4 w-4 text-primary" />} />
        <StatCard label="Active Applications" value="6" helper="2 in interview" icon={<Briefcase className="h-4 w-4 text-primary" />} />
        <StatCard label="Learning Modules" value="27" helper="9 completed" icon={<GraduationCap className="h-4 w-4 text-primary" />} />
        <StatCard label="Interview Events" value="3" helper="next in 2 days" icon={<CalendarCheck className="h-4 w-4 text-primary" />} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Weekly Progress Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 rounded-xl bg-muted/10 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyProgress}>
                  <defs>
                    <linearGradient id="talent-learning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="learning" stroke="hsl(var(--primary))" fill="url(#talent-learning)" strokeWidth={2} />
                  <Area type="monotone" dataKey="applications" stroke="hsl(var(--secondary))" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Readiness Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={readinessMix} dataKey="value" nameKey="name" innerRadius={54} outerRadius={88} paddingAngle={3} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {readinessMix.map((item) => (
                <div key={item.name} className="rounded-lg bg-muted/15 px-2 py-2 text-center">
                  <p className="text-[10px] text-muted-foreground">{item.name}</p>
                  <p className="text-sm font-semibold text-foreground">{item.value}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Top Job Matches</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-primary">
              <Link to="jobs">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedJobs.map((job) => (
              <div key={job.title} className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/10 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => toast.info(`Viewing details for ${job.title}`)}>
                <div>
                  <p className="text-sm font-semibold text-foreground">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.location}</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">{job.status}</Badge>
                  <p className="mt-1 text-xs font-semibold text-primary">{job.match}% match</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Upcoming Milestones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestones.map((item) => (
              <div key={item.title} className="rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Due in {item.due}</span>
                  <span className="text-primary">{item.state}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({ label, value, helper, icon }: { label: string; value: string; helper: string; icon: ReactNode }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">{icon}</span>
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
