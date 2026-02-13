import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { mvp, MvpTalentProfile } from "@/integrations/supabase/mvp";

export default function CompanyTalentPoolPage() {
  const [query, setQuery] = useState("");
  const [talents, setTalents] = useState<MvpTalentProfile[]>([]);

  useEffect(() => {
    mvp.listTalentProfiles().then(setTalents).catch(() => undefined);
  }, []);

  const filtered = talents.filter((talent) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return talent.skills.some((skill) => skill.toLowerCase().includes(q)) || talent.languages.some((lang) => lang.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Talent Pool</h2>
      <Input placeholder="Search by skill or language" value={query} onChange={(e) => setQuery(e.target.value)} />
      {filtered.length === 0 ? <div className="rounded-lg border p-4 text-sm text-muted-foreground">No matching talents.</div> : null}
      <div className="space-y-3">
        {filtered.map((talent) => (
          <div key={talent.id} className="rounded-lg border p-3">
            <p className="text-sm">Talent ID: {talent.user_id}</p>
            <p className="text-sm text-muted-foreground">Skills: {talent.skills.join(", ") || "-"}</p>
            <p className="text-sm text-muted-foreground">Languages: {talent.languages.join(", ") || "-"}</p>
            <p className="text-sm">Readiness: {talent.readiness_score}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
