import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpTalentProfile } from "@/integrations/supabase/mvp";

export default function TalentProfilePage() {
  const [profile, setProfile] = useState<MvpTalentProfile | null>(null);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const talentProfiles = await mvp.listTalentProfiles();
      const mine = talentProfiles.find((item) => item.user_id === user.id) ?? null;
      setProfile(mine);
      setBio(mine?.bio ?? "");
      setSkills((mine?.skills ?? []).join(", "));
      setLanguages((mine?.languages ?? []).join(", "));
    };

    load().catch(() => undefined);
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setSaving(true);
    try {
      const updated = await mvp.upsertTalentProfile({
        user_id: user.id,
        bio,
        skills: skills
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        languages: languages
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        readiness_score: profile?.readiness_score ?? 0,
        coach_rating: profile?.coach_rating ?? 0,
        availability: profile?.availability ?? true,
        placement_status: profile?.placement_status ?? "LEARNING",
      });
      setProfile(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Profile</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="text-sm font-medium">Bio</label>
          <Input value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Skills (comma separated)</label>
          <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Languages (comma separated)</label>
          <Input value={languages} onChange={(e) => setLanguages(e.target.value)} />
        </div>
        <Button type="submit" disabled={saving}>
          Save profile
        </Button>
      </form>
    </div>
  );
}
