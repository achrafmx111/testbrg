import { useCallback, useEffect, useState } from "react";
import { Loader2, UserCheck, X, User, Award, BookOpen, Globe, Star, Briefcase, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mvp, MvpTalentProfile } from "@/integrations/supabase/mvp";
import { useMvpUser } from "@/hooks/useMvpUser";
import { AdminEmptyState, AdminSectionHeader, AdminStatusBadge, AdminLoadingState } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";

function TalentDrawer({
  talent,
  onClose,
}: {
  talent: MvpTalentProfile | null;
  onClose: () => void;
}) {
  if (!talent) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-md overflow-y-auto border-l border-border/50 bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Talent Profile</h2>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6 p-6">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{talent.user_id.slice(0, 8)}...</p>
              <AdminStatusBadge
                text={talent.placement_status}
                kind={talent.placement_status === "JOB_READY" ? "primary" : talent.placement_status === "PLACED" ? "accent" : "neutral"}
              />
            </div>
          </div>

          {/* Bio */}
          {talent.bio && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" /> Bio
              </p>
              <p className="text-sm leading-relaxed text-foreground">{talent.bio}</p>
            </div>
          )}

          {/* Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/40 bg-muted/10 p-4">
              <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Award className="h-3 w-3" /> Readiness
              </p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-primary">{talent.readiness_score}</span>
                <span className="mb-0.5 text-xs text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted/40">
                <div
                  className="h-1.5 rounded-full bg-primary/70 transition-all duration-500"
                  style={{ width: `${Math.min(100, talent.readiness_score)}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/10 p-4">
              <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3" /> Coach Rating
              </p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-amber-500">{talent.coach_rating}</span>
                <span className="mb-0.5 text-xs text-muted-foreground">/ 5</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" /> Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {talent.skills.length > 0
                ? talent.skills.map((skill) => (
                  <span key={skill} className="rounded-lg border border-primary/20 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
                    {skill}
                  </span>
                ))
                : <span className="text-xs text-muted-foreground/60">No skills listed</span>}
            </div>
          </div>

          {/* Languages */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Globe className="h-3.5 w-3.5" /> Languages
            </p>
            <div className="flex flex-wrap gap-1.5">
              {talent.languages.length > 0
                ? talent.languages.map((lang) => (
                  <span key={lang} className="rounded-lg border border-border/40 bg-muted/20 px-2.5 py-1 text-xs text-muted-foreground">
                    {lang}
                  </span>
                ))
                : <span className="text-xs text-muted-foreground/60">No languages listed</span>}
            </div>
          </div>

          {/* Availability */}
          <div className="rounded-xl border border-border/40 bg-muted/10 p-4">
            <p className="text-xs text-muted-foreground">Availability</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {talent.availability ? "✅ Available" : "❌ Not Available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminTalentsPage() {
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<MvpTalentProfile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeTalent, setActiveTalent] = useState<MvpTalentProfile | null>(null);
  const { toast } = useToast();
  const { startImpersonation } = useMvpUser();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mvp.listTalentProfiles();
      setTalents(data);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to load talents", description: error?.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const markJobReady = async (userId: string) => {
    const confirmed = window.confirm("Are you sure you want to mark this talent as JOB_READY?");
    if (!confirmed) return;

    setBusyId(userId);
    try {
      await mvp.markTalentJobReady(userId);
      toast({ title: "Talent updated", description: "Placement status set to JOB_READY" });
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update failed", description: error?.message });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <AdminLoadingState text="Loading talents..." />;

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader title="Talents" description="Readiness monitoring and placement promotion queue." />

      {talents.length === 0 ? (
        <AdminEmptyState
          title="No talents found yet"
          description="Talents will appear here after registering through the Talent Pool."
        />
      ) : null}

      <div className={adminClassTokens.tableWrap} data-testid="admin-talent-list">
        <table className="w-full">
          <thead className={adminClassTokens.tableHead}>
            <tr>
              <th className="px-5 py-3 text-left">Talent</th>
              <th className="px-5 py-3 text-left">Skills</th>
              <th className="px-5 py-3 text-left">Readiness</th>
              <th className="px-5 py-3 text-left">Coach Rating</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {talents.map((talent) => (
              <tr
                key={talent.id}
                className={`${adminClassTokens.tableRow} cursor-pointer`}
                onClick={() => setActiveTalent(talent)}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{talent.user_id.slice(0, 8)}...</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {talent.skills.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-md border border-primary/20 bg-primary/8 px-1.5 py-0.5 text-[11px] text-primary">
                        {s}
                      </span>
                    ))}
                    {talent.skills.length > 3 && (
                      <span className="rounded-md border border-border/40 bg-muted/20 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        +{talent.skills.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-1.5 w-20 rounded-full bg-muted/50">
                      <div
                        className="h-1.5 rounded-full bg-primary/70 transition-all duration-300"
                        style={{ width: `${Math.min(100, talent.readiness_score)}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{talent.readiness_score}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm tabular-nums text-muted-foreground">{talent.coach_rating}</td>
                <td className="px-5 py-3.5">
                  <AdminStatusBadge
                    text={talent.placement_status}
                    kind={talent.placement_status === "JOB_READY" ? "primary" : talent.placement_status === "PLACED" ? "accent" : "neutral"}
                  />
                </td>
                <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
                    onClick={() => markJobReady(talent.user_id)}
                    disabled={busyId === talent.user_id || talent.placement_status === "JOB_READY"}
                  >
                    {busyId === talent.user_id ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>
                    ) : (
                      <><UserCheck className="h-3 w-3" /> Mark JOB_READY</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                    title="Login As (God Mode)"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Login as ${talent.user_id}?`)) {
                        startImpersonation(talent.user_id);
                      }
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TalentDrawer talent={activeTalent} onClose={() => setActiveTalent(null)} />
    </div>
  );
}
