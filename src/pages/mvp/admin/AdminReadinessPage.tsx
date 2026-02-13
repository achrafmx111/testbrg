import { useEffect, useMemo, useState } from "react";
import { mvp, MvpTalentProfile } from "@/integrations/supabase/mvp";

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
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Talent Readiness</h2>
      <p className="text-sm text-muted-foreground">Skills matrix, coach queue and job-ready pipeline health.</p>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Average readiness score</p>
        <p className="text-2xl font-semibold">{avgReadiness}/100</p>
      </div>
      {talents.length === 0 ? <div className="rounded-lg border p-4 text-sm text-muted-foreground">No talent profiles yet.</div> : null}
    </div>
  );
}
