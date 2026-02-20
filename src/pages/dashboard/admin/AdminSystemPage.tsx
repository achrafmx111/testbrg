import { ReactNode, useMemo, useState } from "react";
import { Activity, AlertOctagon, Cpu, Database, Globe, HardDrive, Lock, RefreshCcw, Server, Shield } from "lucide-react";
import { AdminSectionHeader, AdminStatCard } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const INCIDENT_FEED: Array<{ id: string; title: string; severity: "low" | "medium" | "resolved"; time: string }> = [
  { id: "INC-441", title: "Queue spike detected on messaging workers", severity: "medium", time: "6m ago" },
  { id: "INC-439", title: "API latency threshold crossed in eu-central", severity: "low", time: "18m ago" },
  { id: "INC-434", title: "Temporary auth provider timeout", severity: "resolved", time: "53m ago" },
];

const SERVICE_PANELS = [
  { name: "API Gateway", uptime: 99.97, latency: "38ms", load: 64 },
  { name: "Database Cluster", uptime: 99.99, latency: "21ms", load: 58 },
  { name: "Realtime Sync", uptime: 99.91, latency: "44ms", load: 71 },
  { name: "Email Worker", uptime: 99.86, latency: "67ms", load: 79 },
];

const SECURITY_CHECKS: Array<{ title: string; status: "healthy" | "warning" }> = [
  { title: "RBAC policy sync", status: "healthy" },
  { title: "Admin MFA compliance", status: "warning" },
  { title: "Token rotation", status: "healthy" },
  { title: "Audit write pipeline", status: "healthy" },
];

export default function AdminSystemPage() {
  const [systemHealth] = useState({
    apiStatus: "operational",
    dbLatency: "24ms",
    errorRate: "0.01%",
    lastBackup: "2 hours ago",
    activeNodes: 12,
  });

  const aggregate = useMemo(() => {
    const avgLoad = Math.round(SERVICE_PANELS.reduce((sum, item) => sum + item.load, 0) / SERVICE_PANELS.length);
    const avgUptime = (SERVICE_PANELS.reduce((sum, item) => sum + item.uptime, 0) / SERVICE_PANELS.length).toFixed(2);
    return { avgLoad, avgUptime };
  }, []);

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="System Status"
        description="Infrastructure health, incident feed, and security posture across the entire platform."
        aside={
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCcw className="h-4 w-4" /> Refresh snapshot
          </Button>
        }
      />

      <Card className="border-border/40 bg-gradient-to-r from-primary/10 via-card to-secondary/15">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-5">
          <AdminStatCard
            label="API Status"
            value={systemHealth.apiStatus === "operational" ? "Online" : "Issues"}
            tone={systemHealth.apiStatus === "operational" ? "success" : "critical"}
            icon={<Server className="h-4 w-4 text-emerald-600" />}
            subtitle="99.9% uptime"
          />
          <AdminStatCard label="DB Latency" value={systemHealth.dbLatency} tone="success" icon={<Database className="h-4 w-4 text-blue-600" />} />
          <AdminStatCard label="Error Rate" value={systemHealth.errorRate} tone="success" icon={<AlertOctagon className="h-4 w-4 text-secondary" />} />
          <AdminStatCard label="Active Nodes" value={`${systemHealth.activeNodes}`} tone="secondary" icon={<Cpu className="h-4 w-4 text-primary" />} />
          <AdminStatCard label="Backup" value={systemHealth.lastBackup} tone="accent" icon={<HardDrive className="h-4 w-4 text-amber-600" />} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" /> Service Load Map
            </CardTitle>
            <CardDescription>Current utilization by core runtime services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SERVICE_PANELS.map((service) => (
              <div key={service.name} className="rounded-xl border border-border/50 bg-muted/20 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{service.name}</p>
                  <Badge variant="outline" className="text-[11px]">{service.latency}</Badge>
                </div>
                <Progress value={service.load} className="h-2" />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Load {service.load}%</span>
                  <span>Uptime {service.uptime}%</span>
                </div>
              </div>
            ))}

            <div className="grid gap-2 sm:grid-cols-2">
              <MiniMetric label="Avg cluster load" value={`${aggregate.avgLoad}%`} icon={<Globe className="h-3.5 w-3.5 text-primary" />} />
              <MiniMetric label="Avg service uptime" value={`${aggregate.avgUptime}%`} icon={<Server className="h-3.5 w-3.5 text-primary" />} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <AlertOctagon className="h-4 w-4 text-primary" /> Incident Feed
            </CardTitle>
            <CardDescription>Latest operational events from monitoring channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {INCIDENT_FEED.map((incident) => (
              <div key={incident.id} className="rounded-lg border border-border/50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{incident.title}</p>
                  <SeverityBadge level={incident.severity} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{incident.id} - {incident.time}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">Open incident console</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="inline-flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" /> Security Control Plane
          </CardTitle>
          <CardDescription>Status of critical guardrails and admin security controls.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SECURITY_CHECKS.map((check) => (
            <div key={check.title} className="rounded-xl border border-border/50 bg-muted/20 p-3">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <Lock className="h-3.5 w-3.5 text-primary" /> {check.title}
              </p>
              <p className="mt-2"><SecurityState status={check.status} /></p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniMetric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/70 px-3 py-2">
      <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">{icon}{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function SeverityBadge({ level }: { level: "low" | "medium" | "resolved" }) {
  if (level === "resolved") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">resolved</Badge>;
  if (level === "medium") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">medium</Badge>;
  return <Badge variant="outline">low</Badge>;
}

function SecurityState({ status }: { status: "healthy" | "warning" }) {
  if (status === "healthy") return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">healthy</Badge>;
  return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">needs attention</Badge>;
}
