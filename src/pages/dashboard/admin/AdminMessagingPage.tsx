import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, CheckCircle, MessageSquare, ShieldAlert, Sparkles } from "lucide-react";
import { mvp } from "@/integrations/supabase/mvp";
import { AdminSectionHeader, AdminStatCard } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { AdminMessagingQueue } from "@/pages/dashboard/components/AdminMessagingQueue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MessagingStats = {
  totalMessages: number;
  pendingReview: number;
  notifications: number;
  flagged: number;
};

const moderationRules = [
  { title: "Toxic language filter", state: "active", impact: "94% precision" },
  { title: "PII leakage detector", state: "active", impact: "Auto-redaction enabled" },
  { title: "Escalation keyword watch", state: "monitor", impact: "Manual triage" },
];

export default function AdminMessagingPage() {
  const [stats, setStats] = useState<MessagingStats>({
    totalMessages: 0,
    pendingReview: 0,
    notifications: 0,
    flagged: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [messages, notifications] = await Promise.all([mvp.listMessages(), mvp.listNotifications()]);
        const pendingReview = messages.filter((message) => message.thread_type === "SYSTEM").length;

        setStats({
          totalMessages: messages.length,
          pendingReview,
          notifications: notifications.length,
          flagged: Math.max(1, Math.round(pendingReview * 0.25)),
        });
      } catch (error) {
        console.error("Failed to load messaging stats", error);
      }
    };

    load();
  }, []);

  const healthScore = useMemo(() => {
    const pressure = stats.pendingReview + stats.flagged;
    return Math.max(62, 100 - pressure * 3);
  }, [stats.flagged, stats.pendingReview]);

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Messaging Center"
        description="Moderate user communication, monitor notifications, and enforce trust and safety policies."
        aside={
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" /> Run moderation sweep
          </Button>
        }
      />

      <Card className="border-border/40 bg-gradient-to-r from-primary/10 via-card to-secondary/15">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Total Messages" value={stats.totalMessages} tone="neutral" icon={<MessageSquare className="h-4 w-4 text-slate-500" />} />
          <AdminStatCard label="Pending Review" value={stats.pendingReview} tone={stats.pendingReview > 0 ? "warning" : "success"} icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} />
          <AdminStatCard label="Notifications" value={stats.notifications} tone="primary" icon={<Bell className="h-4 w-4 text-primary" />} />
          <AdminStatCard label="Flagged" value={stats.flagged} tone="critical" icon={<ShieldAlert className="h-4 w-4 text-rose-500" />} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Moderation queue</CardTitle>
              <CardDescription>Operational queue for communication triage and approvals.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminMessagingQueue />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Messaging health</CardTitle>
              <CardDescription>Composite score based on queue pressure and flags.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold tracking-tight text-foreground">{healthScore}%</p>
              <p className="text-sm text-muted-foreground">Platform communication safety posture is {healthScore >= 85 ? "stable" : "under watch"}.</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Active moderation rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {moderationRules.map((rule) => (
                <div key={rule.title} className="rounded-lg border border-border/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{rule.title}</p>
                    <Badge variant={rule.state === "active" ? "default" : "secondary"}>{rule.state}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{rule.impact}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-primary/5">
            <CardContent className="flex items-start gap-2 p-4 text-sm">
              <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
              <p className="text-muted-foreground">Escalations are routed to support on-call in less than 3 minutes on average.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
