import { Activity, AlertTriangle, Clock3, LifeBuoy, MessageSquare, ShieldCheck, UserRoundCog, Zap } from "lucide-react";
import { AdminSectionHeader, AdminStatCard } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { AdminSystemHealth } from "@/pages/dashboard/components/AdminSystemHealth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const supportQueue = [
  {
    id: "TCK-2201",
    title: "Company cannot publish offer after draft save",
    priority: "high",
    channel: "Company",
    age: "36m",
    owner: "Support Ops",
  },
  {
    id: "TCK-2198",
    title: "Talent onboarding email delayed",
    priority: "medium",
    channel: "Talent",
    age: "1h 12m",
    owner: "Platform",
  },
  {
    id: "TCK-2194",
    title: "Admin export reports timing out",
    priority: "high",
    channel: "Admin",
    age: "2h 03m",
    owner: "Data Team",
  },
  {
    id: "TCK-2187",
    title: "Coach calendar slot overlap",
    priority: "low",
    channel: "Talent",
    age: "4h 20m",
    owner: "Program",
  },
];

const slaBuckets = [
  { label: "Critical", value: 92, target: "< 30 min", open: 3 },
  { label: "Standard", value: 86, target: "< 2 h", open: 11 },
  { label: "Low", value: 95, target: "< 8 h", open: 7 },
];

const kbArticles = [
  { title: "How to resolve talent profile moderation flags", views: 281, updated: "2 days ago" },
  { title: "Company billing disputes playbook", views: 164, updated: "5 days ago" },
  { title: "Admin role escalation checklist", views: 127, updated: "1 week ago" },
];

export default function AdminSupportPage() {
  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Support & System Health"
        description="Ticket queue operations, SLA monitoring, and reliability controls for cross-role support."
        aside={
          <Button className="h-9 rounded-lg bg-primary/90 px-4 text-xs font-semibold tracking-wide text-primary-foreground hover:bg-primary">
            Open support broadcast
          </Button>
        }
      />

      <Card className="border-border/40 bg-gradient-to-r from-secondary/15 via-card to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <LifeBuoy className="h-4 w-4 text-primary" />
            Command Center Overview
          </CardTitle>
          <CardDescription>
            Unified view of urgent incidents, queue pressure, and SLA confidence.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Open Tickets"
            value={21}
            tone="primary"
            icon={<MessageSquare className="h-4 w-4 text-primary" />}
            trend="down"
            trendLabel="-7.1%"
          />
          <AdminStatCard
            label="Avg First Response"
            value="18m"
            tone="secondary"
            icon={<Clock3 className="h-4 w-4 text-secondary-foreground" />}
            trend="up"
            trendLabel="+3m"
          />
          <AdminStatCard
            label="Escalations"
            value={4}
            tone="accent"
            icon={<AlertTriangle className="h-4 w-4 text-accent-foreground" />}
          />
          <AdminStatCard
            label="Auto-resolve Rate"
            value="63%"
            tone="primary"
            icon={<Zap className="h-4 w-4 text-primary" />}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Live Ticket Queue</CardTitle>
            <CardDescription>Prioritized incidents currently assigned to support streams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {supportQueue.map((ticket) => (
              <div key={ticket.id} className="rounded-lg border border-border/40 bg-muted/20 px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{ticket.title}</p>
                  <Badge variant={ticket.priority === "high" ? "destructive" : ticket.priority === "medium" ? "secondary" : "outline"} className="capitalize">
                    {ticket.priority}
                  </Badge>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{ticket.id}</span>
                  <span>{ticket.channel}</span>
                  <span>{ticket.owner}</span>
                  <span>{ticket.age}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">SLA Monitor</CardTitle>
            <CardDescription>Performance against target windows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {slaBuckets.map((bucket) => (
              <div key={bucket.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{bucket.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {bucket.open} open - target {bucket.target}
                  </p>
                </div>
                <Progress value={bucket.value} className="h-2" />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{bucket.value}% within SLA</p>
              </div>
            ))}

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Incident protocol synced
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Last runbook sync completed 23 minutes ago.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="inline-flex items-center gap-2 text-sm">
              <UserRoundCog className="h-4 w-4 text-primary" /> Knowledge Base Readiness
            </CardTitle>
            <CardDescription>Most used internal support guides this week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {kbArticles.map((article) => (
              <div key={article.title} className="rounded-lg border border-border/40 px-3 py-2.5">
                <p className="text-sm font-medium text-foreground">{article.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {article.views} views - updated {article.updated}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="inline-flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-primary" /> System Health
            </CardTitle>
            <CardDescription>Live service reliability across core admin features.</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminSystemHealth />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
