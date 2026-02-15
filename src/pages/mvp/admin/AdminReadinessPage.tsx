import { useEffect, useMemo, useState } from "react";
import { Gauge } from "lucide-react";
import { mvp, MvpTalentProfile } from "@/integrations/supabase/mvp";
import { AdminSectionHeader, AdminEmptyState } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";

export default function AdminReadinessPage() {
  const [talents, setTalents] = useState<MvpTalentProfile[]>([]);

  useEffect(() => {
    mvp.listTalentProfiles().then(setTalents).catch(() => undefined);
  }, []);

  const avgReadiness = useMemo(() => {
    if (!talents.length) return 0;
    return Math.round(talents.reduce((sum, t) => sum + t.readiness_score, 0) / talents.length);
  }, [talents]);

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader title="Talent Readiness" description="Skills matrix, coach queue and job-ready pipeline health." />

      {/* Score card */}
      <div className={adminClassTokens.panel}>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8">
            <Gauge className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Average Readiness Score
            </p>
            <p className="mt-1 text-[2rem] font-bold tracking-[-0.03em] leading-none text-foreground">
              {avgReadiness}<span className="ml-0.5 text-base font-medium text-muted-foreground">/100</span>
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-muted/40">
          <div
            className="h-2 rounded-full bg-primary/70 transition-all duration-500"
            style={{ width: `${avgReadiness}%` }}
          />
        </div>
      </div>

      {talents.length === 0 ? <AdminEmptyState text="No talent profiles yet." /> : null}
    </div>
  );
}
