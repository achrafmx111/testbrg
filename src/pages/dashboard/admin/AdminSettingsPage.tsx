import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Check,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  MailCheck,
  ScrollText,
  Shield,
  Sparkles,
  TrendingUp,
  Users2,
} from "lucide-react";
import { mvp } from "@/integrations/supabase/mvp";
import { AdminSectionHeader, AdminStatCard } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogViewer } from "@/pages/dashboard/components/AuditLogViewer";
import { AdminReferralAnalytics } from "@/pages/dashboard/components/AdminReferralAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const governancePillars = [
  { label: "RBAC Enforcement", value: 94, icon: LockKeyhole, tone: "text-primary" },
  { label: "Audit Completeness", value: 98, icon: ScrollText, tone: "text-secondary-foreground" },
  { label: "MFA Adoption", value: 76, icon: Fingerprint, tone: "text-accent-foreground" },
];

const policyChecklist = [
  { title: "Data retention policy", owner: "Compliance", status: "active" },
  { title: "Admin access review", owner: "Security", status: "due" },
  { title: "Email domain allowlist", owner: "Ops", status: "active" },
  { title: "Talent profile moderation", owner: "Program", status: "draft" },
] as const;

const permissionMatrix = [
  { role: "Admin Owner", approvals: "full", finance: "full", interviews: "full", settings: "full" },
  { role: "Program Manager", approvals: "review", finance: "none", interviews: "full", settings: "review" },
  { role: "Support Ops", approvals: "review", finance: "none", interviews: "review", settings: "none" },
  { role: "Finance Lead", approvals: "review", finance: "full", interviews: "none", settings: "review" },
] as const;

export default function AdminSettingsPage() {
  const [auditCount, setAuditCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [permissionCount, setPermissionCount] = useState(0);
  const [toggles, setToggles] = useState({
    enforcedMfa: true,
    approvalWorkflow: true,
    anomalyAlerts: false,
    weeklyDigest: true,
  });

  useEffect(() => {
    const load = async () => {
      const [logs, staff, permissions] = await Promise.all([
        mvp.listAuditLogs(),
        mvp.listStaffAssignments(),
        mvp.listRolePermissions(),
      ]);
      setAuditCount(logs.length);
      setStaffCount(staff.length);
      setPermissionCount(permissions.length);
    };

    load().catch(() => undefined);
  }, []);

  const postureScore = useMemo(() => {
    const enabledCount = Object.values(toggles).filter(Boolean).length;
    return Math.min(100, 62 + enabledCount * 9);
  }, [toggles]);

  const setToggle = (key: keyof typeof toggles, value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Settings & Governance"
        description="Role policies, platform controls, audit visibility, and compliance posture in one workspace."
        aside={
          <Button className="h-9 rounded-lg bg-primary/90 px-4 text-xs font-semibold tracking-wide text-primary-foreground hover:bg-primary">
            Publish governance update
          </Button>
        }
      />

      <Card className="border-border/40 bg-gradient-to-r from-primary/10 via-card to-secondary/15">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Governance Posture
          </CardTitle>
          <CardDescription>
            Central score from policy coverage, alerting hygiene, and access controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <p className="text-3xl font-bold tracking-tight text-foreground">{postureScore}%</p>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
              stable posture
            </Badge>
          </div>
          <Progress value={postureScore} className="h-2.5" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Audit Logs"
          value={auditCount}
          tone="primary"
          icon={<ScrollText className="h-4 w-4 text-primary" />}
        />
        <AdminStatCard
          label="Staff Assignments"
          value={staffCount}
          tone="secondary"
          icon={<Users2 className="h-4 w-4 text-secondary-foreground" />}
        />
        <AdminStatCard
          label="Role Permissions"
          value={permissionCount}
          tone="accent"
          icon={<KeyRound className="h-4 w-4 text-accent-foreground" />}
        />
        <AdminStatCard
          label="Policy Coverage"
          value="91%"
          tone="primary"
          icon={<Shield className="h-4 w-4 text-primary" />}
          trend="up"
          trendLabel="+4.3%"
        />
      </div>

      <Tabs defaultValue="compliance" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance">
            <Shield className="mr-1.5 h-3.5 w-3.5" /> Compliance
          </TabsTrigger>
          <TabsTrigger value="growth">
            <TrendingUp className="mr-1.5 h-3.5 w-3.5" /> Growth
          </TabsTrigger>
          <TabsTrigger value="governance">
            <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Governance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="mt-4 space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
            <div className={adminClassTokens.panelCompact}>
              <AuditLogViewer />
            </div>
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Policy Checklist</CardTitle>
                <CardDescription>Review cycles and ownership map.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {policyChecklist.map((policy) => (
                  <div key={policy.title} className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{policy.title}</p>
                      <Badge
                        variant={policy.status === "active" ? "default" : policy.status === "due" ? "secondary" : "outline"}
                        className="capitalize"
                      >
                        {policy.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Owner: {policy.owner}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="mt-4 space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <div className={adminClassTokens.panelCompact}>
              <AdminReferralAnalytics />
            </div>
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Growth Levers</CardTitle>
                <CardDescription>Operational programs tied to referral performance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border/40 bg-primary/5 px-3 py-3">
                  <p className="text-sm font-medium text-foreground">Campus ambassador sprint</p>
                  <p className="mt-1 text-xs text-muted-foreground">Target +120 qualified referrals this month.</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-secondary/15 px-3 py-3">
                  <p className="text-sm font-medium text-foreground">Company referral booster</p>
                  <p className="mt-1 text-xs text-muted-foreground">Automated nudges to inactive partners every 7 days.</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-accent/15 px-3 py-3">
                  <p className="text-sm font-medium text-foreground">Talent success stories</p>
                  <p className="mt-1 text-xs text-muted-foreground">Publish 5 placement stories this cycle.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="governance" className="mt-4 space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Control Center</CardTitle>
                <CardDescription>Toggle operational policies for admin workspace behavior.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enforce MFA for admin users</p>
                    <p className="text-xs text-muted-foreground">Blocks dashboard access without second factor.</p>
                  </div>
                  <Switch checked={toggles.enforcedMfa} onCheckedChange={(v) => setToggle("enforcedMfa", v)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Manual approval workflow</p>
                    <p className="text-xs text-muted-foreground">Require two-step approval for sensitive actions.</p>
                  </div>
                  <Switch checked={toggles.approvalWorkflow} onCheckedChange={(v) => setToggle("approvalWorkflow", v)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Anomaly alerting</p>
                    <p className="text-xs text-muted-foreground">Email and in-app alerts for unusual admin patterns.</p>
                  </div>
                  <Switch checked={toggles.anomalyAlerts} onCheckedChange={(v) => setToggle("anomalyAlerts", v)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Weekly governance digest</p>
                    <p className="text-xs text-muted-foreground">Sends policy drift report every Monday.</p>
                  </div>
                  <Switch checked={toggles.weeklyDigest} onCheckedChange={(v) => setToggle("weeklyDigest", v)} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Pillar Readout</CardTitle>
                <CardDescription>Live status snapshot by governance pillar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {governancePillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div key={pillar.label} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                          <Icon className={`h-4 w-4 ${pillar.tone}`} /> {pillar.label}
                        </p>
                        <span className="text-xs font-semibold text-muted-foreground">{pillar.value}%</span>
                      </div>
                      <Progress value={pillar.value} className="h-2" />
                    </div>
                  );
                })}

                <Separator />

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="inline-flex items-center gap-2">
                    <MailCheck className="h-3.5 w-3.5 text-primary" /> Last digest sent to 7 stakeholders.
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <BellRing className="h-3.5 w-3.5 text-secondary-foreground" /> 2 alerts muted during maintenance window.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Role Permission Matrix</CardTitle>
              <CardDescription>Snapshot of access scope by operational role.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-2 py-2 font-semibold">Role</th>
                    <th className="px-2 py-2 font-semibold">Approvals</th>
                    <th className="px-2 py-2 font-semibold">Finance</th>
                    <th className="px-2 py-2 font-semibold">Interviews</th>
                    <th className="px-2 py-2 font-semibold">Settings</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionMatrix.map((row) => (
                    <tr key={row.role} className="border-b border-border/40 last:border-0">
                      <td className="px-2 py-3 font-medium text-foreground">{row.role}</td>
                      <td className="px-2 py-3"><PermissionPill value={row.approvals} /></td>
                      <td className="px-2 py-3"><PermissionPill value={row.finance} /></td>
                      <td className="px-2 py-3"><PermissionPill value={row.interviews} /></td>
                      <td className="px-2 py-3"><PermissionPill value={row.settings} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-primary" /> Matrix is synced with current policy bundle v2.7
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PermissionPill({ value }: { value: "full" | "review" | "none" }) {
  if (value === "full") {
    return <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Full</Badge>;
  }
  if (value === "review") {
    return <Badge variant="secondary">Review</Badge>;
  }
  return <Badge variant="outline">None</Badge>;
}
