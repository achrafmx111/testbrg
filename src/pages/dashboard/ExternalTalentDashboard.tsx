import { useEffect, useMemo, useState } from "react";
import { Briefcase, CalendarDays, CheckCircle2, Loader2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "./components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { Application, Profile } from "@/types";

const ExternalTalentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [{ data: profileData }, { data: appsData }] = await Promise.all([
          (supabase as any).from("profiles").select("*").eq("id", user.id).single(),
          (supabase as any)
            .from("applications")
            .select("*")
            .eq("user_id", user.id)
            .eq("type", "talent_pool_registration")
            .order("created_at", { ascending: false }),
        ]);

        setProfile(profileData || null);
        setApplications((appsData as Application[]) || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const latest = applications[0];
  const stats = useMemo(
    () => [
      { label: "Profile Status", value: profile ? "Active" : "Pending" },
      { label: "Talent Pool Entries", value: String(applications.length) },
      { label: "Interview Requests", value: String(applications.filter((a) => a.status === "reviewed" || a.status === "contacted").length) },
    ],
    [applications, profile],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardShell title="External Talent Dashboard" subtitle="Profile visibility, company interest, and interview coordination">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-800">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Talent Pool Application</CardTitle>
          </CardHeader>
          <CardContent>
            {latest ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Registration Status
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{latest.status}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Last Update
                  </div>
                  <p className="text-sm text-slate-600">{new Date(latest.updated_at || latest.created_at).toLocaleDateString()}</p>
                </div>
                <div className="rounded-lg border border-secondary/40 bg-secondary/15 p-3 text-sm text-slate-700">
                  Companies can review your profile. Interview scheduling is coordinated by the Bridging admin team.
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No talent pool registration found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Profile Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-700"><User className="h-4 w-4 text-primary" /> {profile?.first_name} {profile?.last_name}</div>
            <div className="flex items-center gap-2 text-slate-700"><CheckCircle2 className="h-4 w-4 text-primary" /> {profile?.email || "No email"}</div>
            <Button className="w-full" onClick={() => window.location.assign("/talent-pool")}>Update Talent Profile</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
};

export default ExternalTalentDashboard;
