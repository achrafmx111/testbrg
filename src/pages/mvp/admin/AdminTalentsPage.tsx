import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mvp, MvpTalentProfile } from "@/integrations/supabase/mvp";
import { AdminEmptyState, AdminSectionHeader, AdminStatusBadge } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";

export default function AdminTalentsPage() {
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<MvpTalentProfile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await mvp.listTalentProfiles();
      setTalents(data);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to load talents", description: error?.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const markJobReady = async (userId: string) => {
    const confirmed = window.confirm("Are you sure you want to mark this talent as JOB_READY?");
    if (!confirmed) {
      return;
    }

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

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-muted-foreground shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading talents...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminSectionHeader title="Talents" description="Readiness monitoring and placement promotion queue." />

      {talents.length === 0 ? <AdminEmptyState text="No talents found yet." /> : null}

      <div className={adminClassTokens.tableWrap} data-testid="admin-talent-list">
        <table className="w-full">
          <thead className={adminClassTokens.tableHead}>
            <tr>
              <th className="px-5 py-3 text-left">Talent</th>
              <th className="px-5 py-3 text-left">Readiness</th>
              <th className="px-5 py-3 text-left">Coach Rating</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {talents.map((talent) => (
              <tr key={talent.id} className={adminClassTokens.tableRow}>
                <td className="px-5 py-3 text-sm font-semibold text-foreground">{talent.user_id}</td>
                <td className="px-5 py-3 text-sm text-foreground">{talent.readiness_score}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{talent.coach_rating}</td>
                <td className="px-5 py-3">
                  <AdminStatusBadge
                    text={talent.placement_status}
                    kind={
                      talent.placement_status === "JOB_READY"
                        ? "primary"
                        : talent.placement_status === "PLACED"
                          ? "accent"
                          : "neutral"
                    }
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <Button
                    size="sm"
                    className="h-8 rounded-md px-3 text-xs font-semibold transition-all duration-200"
                    onClick={() => markJobReady(talent.user_id)}
                    disabled={busyId === talent.user_id || talent.placement_status === "JOB_READY"}
                  >
                    {busyId === talent.user_id ? "Saving..." : "Mark JOB_READY"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
