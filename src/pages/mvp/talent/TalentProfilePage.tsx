import { FormEvent, useEffect, useState } from "react";
import { Loader2, Save, User, Globe, Briefcase, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpTalentProfile } from "@/integrations/supabase/mvp";

export default function TalentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MvpTalentProfile | null>(null);

  // Form states
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const allTalents = await mvp.listTalentProfiles();
        const mine = allTalents.find((item) => item.user_id === user.id) ?? null;

        setProfile(mine);
        if (mine) {
          setBio(mine.bio ?? "");
          setSkills((mine.skills ?? []).join(", "));
          setLanguages((mine.languages ?? []).join(", "));
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSaving(true);
    try {
      const updated = await mvp.upsertTalentProfile({
        user_id: user.id,
        bio,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        languages: languages.split(",").map((s) => s.trim()).filter(Boolean),
        // Preserve existing values for readonly fields
        readiness_score: profile?.readiness_score ?? 0,
        coach_rating: profile?.coach_rating ?? 0,
        availability: profile?.availability ?? true,
        placement_status: profile?.placement_status ?? "LEARNING",
      });

      setProfile(updated);
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save failed", description: error?.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Profile</h2>
        <p className="text-muted-foreground">Manage your professional information and skills.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Stats (Read-Only) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-xl">
                <span className="text-4xl font-bold text-primary">{profile?.readiness_score ?? 0}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Score / 100</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coach Rating</span>
                  <span className="font-medium">{profile?.coach_rating ?? 0}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{(profile?.placement_status ?? "LEARNING").toLowerCase().replace('_', ' ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Update your professional details to get better job matches.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Professional Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Skills
                  </Label>
                  <Input
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="SAP FI, ABAP, Project Management (comma separated)"
                  />
                  <p className="text-xs text-muted-foreground">Separate skills with commas.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languages" className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Languages
                  </Label>
                  <Input
                    id="languages"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="English, German (B2), French (comma separated)"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving} className="min-w-[120px]">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
