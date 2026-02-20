import { useEffect, useMemo, useState } from "react";
import { Gauge, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import { mvp, MvpTalentProfile } from "@/integrations/supabase/mvp";
import { AdminSectionHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function AdminReadinessPage() {
  const [talents, setTalents] = useState<MvpTalentProfile[]>([]);

  useEffect(() => {
    mvp.listTalentProfiles().then(setTalents).catch(() => undefined);
  }, []);

  const stats = useMemo(() => {
    const total = talents.length;
    const avg = total ? Math.round(talents.reduce((sum, talent) => sum + talent.readiness_score, 0) / total) : 0;
    const ready = talents.filter((talent) => talent.readiness_score >= 80).length;
    const mid = talents.filter((talent) => talent.readiness_score >= 60 && talent.readiness_score < 80).length;
    const atRisk = talents.filter((talent) => talent.readiness_score < 60).length;
    const top = [...talents].sort((a, b) => b.readiness_score - a.readiness_score).slice(0, 6);

    return {
      total,
      avg,
      ready,
      mid,
      atRisk,
      top,
    };
  }, [talents]);

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Talent Readiness"
        description="Readiness health across the entire talent pool, from at-risk learners to interview-ready candidates."
        aside={
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" /> Refresh score snapshot
          </Button>
        }
      />

      <Card className="border-border/40 bg-gradient-to-r from-primary/10 via-card to-secondary/15">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Average readiness" value={`${stats.avg}/100`} icon={<Gauge className="h-4 w-4 text-primary" />} helper="Cohort-wide score" />
          <Metric label="Interview-ready" value={`${stats.ready}`} icon={<Target className="h-4 w-4 text-emerald-600" />} helper=">= 80 score" />
          <Metric label="Developing" value={`${stats.mid}`} icon={<TrendingUp className="h-4 w-4 text-amber-600" />} helper="60 to 79 score" />
          <Metric label="At risk" value={`${stats.atRisk}`} icon={<Users className="h-4 w-4 text-rose-600" />} helper="Below 60 score" />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Readiness distribution</CardTitle>
            <CardDescription>Quick visual of talent health segments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Bucket label="Interview-ready" value={stats.ready} total={Math.max(stats.total, 1)} />
            <Bucket label="Developing" value={stats.mid} total={Math.max(stats.total, 1)} />
            <Bucket label="At risk" value={stats.atRisk} total={Math.max(stats.total, 1)} />

            {stats.total === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No talent profiles available yet.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top readiness talents</CardTitle>
            <CardDescription>Highest readiness profiles this cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.top.map((talent) => (
              <div key={talent.id} className="rounded-lg border border-border/50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">Talent {talent.user_id.slice(0, 6).toUpperCase()}</p>
                  <Badge className="bg-primary/15 text-primary hover:bg-primary/15">{talent.readiness_score}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{talent.years_of_experience} years experience</p>
              </div>
            ))}

            {stats.top.length === 0 ? <p className="text-sm text-muted-foreground">No readiness ranking available.</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, icon, helper }: { label: string; value: string; icon: React.ReactNode; helper: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/80 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="text-[11px] text-muted-foreground">{helper}</p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">{icon}</div>
      </div>
    </div>
  );
}

function Bucket({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = Math.round((value / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{value} ({percent}%)</span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}
