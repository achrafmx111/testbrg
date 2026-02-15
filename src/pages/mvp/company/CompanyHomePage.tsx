import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Briefcase, FileText, Plus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const hiringFunnel = [
  { stage: "Applied", count: 128 },
  { stage: "Screen", count: 74 },
  { stage: "Interview", count: 36 },
  { stage: "Offer", count: 14 },
  { stage: "Hired", count: 9 },
];

const sourceMix = [
  { name: "Talent Pool", value: 52, fill: "hsl(var(--primary))" },
  { name: "Direct Apply", value: 29, fill: "hsl(var(--secondary))" },
  { name: "Referral", value: 19, fill: "hsl(var(--accent))" },
];

const activeRoles = [
  { role: "SAP FI Consultant", applicants: 38, stage: "Interview" },
  { role: "SAP MM Analyst", applicants: 27, stage: "Screen" },
  { role: "SAP SD Specialist", applicants: 21, stage: "Offer" },
  { role: "BTP Associate", applicants: 14, stage: "Applied" },
];

const recentApplicants = [
  { name: "Yasmine El Idrissi", role: "SAP FI Consultant", score: 91, status: "Shortlisted" },
  { name: "Omar Benali", role: "SAP MM Analyst", score: 84, status: "Review" },
  { name: "Salma Naciri", role: "SAP SD Specialist", score: 95, status: "Interview" },
  { name: "Mehdi Zahiri", role: "BTP Associate", score: 78, status: "Pending" },
];

export default function CompanyHomePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Company Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Mock preview of recruitment operations, hiring flow, and talent pipeline health.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="talent-pool">Talent pool</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="jobs">
                <Plus className="mr-1 h-4 w-4" />
                Post job
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Roles" value="11" helper="+2 this month" icon={<Briefcase className="h-4 w-4 text-primary" />} />
        <StatCard label="Total Applicants" value="241" helper="across active roles" icon={<Users className="h-4 w-4 text-primary" />} />
        <StatCard label="Interviews" value="36" helper="14 scheduled this week" icon={<FileText className="h-4 w-4 text-primary" />} />
        <StatCard label="Hires" value="9" helper="conversion 7.0%" icon={<ArrowRight className="h-4 w-4 text-primary" />} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Hiring Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 rounded-xl bg-muted/10 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hiringFunnel}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="stage" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Applicant Source Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceMix} dataKey="value" nameKey="name" innerRadius={54} outerRadius={88} paddingAngle={3} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {sourceMix.map((item) => (
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
            <CardTitle className="text-base">Active Hiring Roles</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-primary">
              <Link to="jobs">
                Manage jobs
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeRoles.map((item) => (
              <div key={item.role} className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.role}</p>
                  <p className="text-xs text-muted-foreground">{item.applicants} applicants</p>
                </div>
                <Badge variant="secondary">{item.stage}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Applicants</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-primary">
              <Link to="applicants">
                Open pipeline
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentApplicants.map((item) => (
              <div key={item.name} className="rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-primary">{item.score}% match</span>
                  <span className="text-muted-foreground">{item.status}</span>
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
