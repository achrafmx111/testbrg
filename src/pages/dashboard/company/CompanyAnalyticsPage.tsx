import { BarChart3, Calendar, Clock3, Download, PieChart, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeToHireChart } from "./analytics/TimeToHireChart";
import { FunnelChart } from "./analytics/FunnelChart";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SOURCING_DATA = [
  { name: "LinkedIn", value: 45 },
  { name: "Referrals", value: 25 },
  { name: "Website", value: 20 },
  { name: "Job Boards", value: 10 },
];

const CHANNEL_HIRING = [
  { name: "LinkedIn", hired: 12 },
  { name: "Referrals", hired: 8 },
  { name: "Website", hired: 3 },
  { name: "Job Boards", hired: 2 },
];

const COLORS = ["#2563eb", "#0f766e", "#d97706", "#7c3aed"];

const PIPELINE_HISTORY = [
  { name: "Week 1", applicants: 20, interviews: 5, offers: 1 },
  { name: "Week 2", applicants: 35, interviews: 12, offers: 3 },
  { name: "Week 3", applicants: 50, interviews: 25, offers: 6 },
  { name: "Week 4", applicants: 45, interviews: 22, offers: 5 },
  { name: "Week 5", applicants: 60, interviews: 30, offers: 9 },
];

type KpiCardProps = {
  title: string;
  value: string;
  trend: string;
  tone: "good" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
};

export default function CompanyAnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Decision Intelligence
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics hub</h1>
            <p className="mt-1 text-sm text-muted-foreground">Data-driven visibility over pipeline speed, quality, and conversion outcomes.</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="30d">
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last quarter</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => toast.info("Export generation started. Check your email shortly.")}> 
              <Download className="mr-2 h-4 w-4" /> Export report
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Time to hire" value="28 days" trend="-12% vs previous period" tone="good" icon={Clock3} />
        <KpiCard title="Offer acceptance" value="85%" trend="+5% this month" tone="good" icon={Target} />
        <KpiCard title="Total applicants" value="248" trend="+22% pipeline inflow" tone="good" icon={Users} />
        <KpiCard title="Cost per hire" value="EUR 1,250" trend="Stable spend" tone="neutral" icon={TrendingUp} />
      </section>

      <Tabs defaultValue="hiring" className="w-full">
        <TabsList className="mb-4 grid w-full max-w-[620px] grid-cols-3 rounded-xl border border-border/60 bg-card p-1">
          <TabsTrigger value="hiring" className="rounded-lg">Hiring performance</TabsTrigger>
          <TabsTrigger value="pipeline" className="rounded-lg">Pipeline health</TabsTrigger>
          <TabsTrigger value="sourcing" className="rounded-lg">Sourcing channels</TabsTrigger>
        </TabsList>

        <TabsContent value="hiring" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <TimeToHireChart />
            <FunnelChart />
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-lg">
                <BarChart3 className="h-4 w-4 text-primary" /> Pipeline growth
              </CardTitle>
              <CardDescription>Weekly volume trend for applicants, interviews, and offers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PIPELINE_HISTORY} margin={{ top: 10, right: 20, left: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.28} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Line type="monotone" dataKey="applicants" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="interviews" stroke="#0f766e" strokeWidth={3} />
                    <Line type="monotone" dataKey="offers" stroke="#d97706" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sourcing" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-lg">
                  <PieChart className="h-4 w-4 text-primary" /> Channel distribution
                </CardTitle>
                <CardDescription>Where incoming candidates originate.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SOURCING_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.28} vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {SOURCING_DATA.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Channel performance</CardTitle>
                <CardDescription>Hires completed by channel source.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CHANNEL_HIRING}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={112}
                        dataKey="hired"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {CHANNEL_HIRING.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ title, value, trend, tone, icon: Icon }: KpiCardProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className={`mt-1 text-xs ${tone === "good" ? "text-emerald-600" : "text-muted-foreground"}`}>{trend}</p>
      </CardContent>
    </Card>
  );
}
