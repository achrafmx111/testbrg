import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle,
  Eye,
  FileText,
  Globe,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mvp, MvpApplication, MvpCompany, MvpJob, MvpTalentProfile } from "@/integrations/supabase/mvp";
import {
  AdminLoadingState,
  AdminPanelHeader,
  AdminSectionHeader,
  AdminStatCard,
  AdminStatusBadge,
} from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function isWithinDays(isoDate: string, days: number) {
  const end = Date.now();
  const start = end - days * 24 * 60 * 60 * 1000;
  const t = new Date(isoDate).getTime();
  return Number.isFinite(t) && t >= start && t <= end;
}

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<MvpTalentProfile[]>([]);
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [applications, setApplications] = useState<MvpApplication[]>([]);
  const [interviews, setInterviews] = useState<{ created_at: string; scheduled_at: string }[]>([]);
  const [companies, setCompanies] = useState<MvpCompany[]>([]);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [interviewsCount, setInterviewsCount] = useState(0);
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [selectedTrack, setSelectedTrack] = useState("ALL");
  const [selectedWindow, setSelectedWindow] = useState("30");

  useEffect(() => {
    const load = async () => {
      try {
        const [talentRows, companyRows, jobRows, applicationRows, interviewRows] = await Promise.all([
          mvp.listTalentProfiles(),
          mvp.listCompanies(),
          mvp.listJobs(),
          mvp.listApplications(),
          mvp.listInterviews(),
        ]);

        setTalents(talentRows);
        setCompanies(companyRows);
        setCompaniesCount(companyRows.length);
        setJobs(jobRows);
        setApplications(applicationRows);
        setInterviews(
          interviewRows.map((row) => ({
            created_at: row.created_at,
            scheduled_at: row.scheduled_at,
          })),
        );
        setInterviewsCount(interviewRows.length);
      } finally {
        setLoading(false);
      }
    };

    load().catch(() => undefined);
  }, []);

  const counts = useMemo(
    () => ({
      talents: talents.length,
      jobReady: talents.filter((talent) => talent.placement_status === "JOB_READY").length,
      companies: companiesCount,
      jobs: jobs.length,
      applications: applications.length,
      interviews: interviewsCount,
      placed: talents.filter((talent) => talent.placement_status === "PLACED").length,
      openJobs: jobs.filter((job) => job.status === "OPEN").length,
    }),
    [talents, companiesCount, jobs, applications, interviewsCount],
  );

  const placementBreakdown = [
    { label: "Learning", value: 0 },
    { label: "Job-ready", value: 0 },
    { label: "Placed", value: 0 },
  ];

  const selectedDays = useMemo(() => {
    const parsed = Number.parseInt(selectedWindow, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
  }, [selectedWindow]);

  const rangeFilteredJobs = useMemo(
    () => jobs.filter((job) => isWithinDays(job.created_at, selectedDays)),
    [jobs, selectedDays],
  );

  const rangeFilteredApplications = useMemo(
    () => applications.filter((app) => isWithinDays(app.created_at, selectedDays)),
    [applications, selectedDays],
  );

  const rangeFilteredInterviews = useMemo(
    () => interviews.filter((it) => isWithinDays(it.scheduled_at || it.created_at, selectedDays)),
    [interviews, selectedDays],
  );

  const availableTracks = useMemo(() => {
    const tracks = talents
      .map((talent) => talent.sap_track)
      .filter((track): track is string => Boolean(track && track.trim().length > 0));
    return ["ALL", ...Array.from(new Set(tracks)).sort((a, b) => a.localeCompare(b))];
  }, [talents]);

  const filteredTalents = useMemo(
    () => (selectedTrack === "ALL" ? talents : talents.filter((talent) => (talent.sap_track ?? "General") === selectedTrack)),
    [selectedTrack, talents],
  );

  const filteredApplications = useMemo(
    () => (selectedStage === "ALL" ? rangeFilteredApplications : rangeFilteredApplications.filter((app) => app.stage === selectedStage)),
    [rangeFilteredApplications, selectedStage],
  );

  placementBreakdown[0].value = filteredTalents.filter((talent) => talent.placement_status === "LEARNING").length;
  placementBreakdown[1].value = filteredTalents.filter((talent) => talent.placement_status === "JOB_READY").length;
  placementBreakdown[2].value = filteredTalents.filter((talent) => talent.placement_status === "PLACED").length;

  const stageBreakdown = [
    { stage: "APPLIED", label: "Applied", value: filteredApplications.filter((app) => app.stage === "APPLIED").length },
    { stage: "SCREEN", label: "Screen", value: filteredApplications.filter((app) => app.stage === "SCREEN").length },
    { stage: "INTERVIEW", label: "Interview", value: filteredApplications.filter((app) => app.stage === "INTERVIEW").length },
    { stage: "OFFER", label: "Offer", value: filteredApplications.filter((app) => app.stage === "OFFER").length },
    { stage: "HIRED", label: "Hired", value: filteredApplications.filter((app) => app.stage === "HIRED").length },
  ];

  const stageDotColors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--primary) / 0.55)",
    "hsl(var(--secondary) / 0.55)",
  ];

  const weeklyActivityData = useMemo(() => {
    const bars = Math.min(selectedDays, 14);
    const points: { day: string; jobs: number; applications: number; interviews: number }[] = [];
    const now = new Date();

    for (let i = bars - 1; i >= 0; i -= 1) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);

      const bucket = {
        day: `${day.getMonth() + 1}/${day.getDate()}`,
        jobs: 0,
        applications: 0,
        interviews: 0,
      };

      rangeFilteredJobs.forEach((job) => {
        const t = new Date(job.created_at).getTime();
        if (t >= day.getTime() && t < next.getTime()) bucket.jobs += 1;
      });

      filteredApplications.forEach((app) => {
        const t = new Date(app.created_at).getTime();
        if (t >= day.getTime() && t < next.getTime()) bucket.applications += 1;
      });

      rangeFilteredInterviews.forEach((it) => {
        const t = new Date(it.scheduled_at || it.created_at).getTime();
        if (t >= day.getTime() && t < next.getTime()) bucket.interviews += 1;
      });

      points.push(bucket);
    }

    return points;
  }, [filteredApplications, rangeFilteredInterviews, rangeFilteredJobs, selectedDays]);

  const topTalents = useMemo(
    () => [...filteredTalents].sort((a, b) => b.readiness_score - a.readiness_score).slice(0, 8),
    [filteredTalents],
  );

  const metrics = useMemo(() => {
    const now = Date.now();
    const windowMs = selectedDays * 24 * 60 * 60 * 1000;
    const currentStart = now - windowMs;
    const previousStart = currentStart - windowMs;

    const inCurrent = (isoDate: string) => {
      const t = new Date(isoDate).getTime();
      return Number.isFinite(t) && t >= currentStart && t <= now;
    };

    const inPrevious = (isoDate: string) => {
      const t = new Date(isoDate).getTime();
      return Number.isFinite(t) && t >= previousStart && t < currentStart;
    };

    const currentApplications = (selectedStage === "ALL" ? applications : applications.filter((a) => a.stage === selectedStage)).filter((a) =>
      inCurrent(a.created_at),
    ).length;
    const previousApplications = (selectedStage === "ALL" ? applications : applications.filter((a) => a.stage === selectedStage)).filter((a) =>
      inPrevious(a.created_at),
    ).length;

    const currentInterviews = interviews.filter((it) => inCurrent(it.scheduled_at || it.created_at)).length;
    const previousInterviews = interviews.filter((it) => inPrevious(it.scheduled_at || it.created_at)).length;

    const toTrend = (current: number, previous: number): { direction: "up" | "down" | "flat"; label: string } => {
      if (previous === 0 && current === 0) return { direction: "flat", label: "0%" };
      if (previous === 0 && current > 0) return { direction: "up", label: "new" };
      const percent = ((current - previous) / previous) * 100;
      const rounded = `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;
      if (percent > 1) return { direction: "up", label: rounded };
      if (percent < -1) return { direction: "down", label: rounded };
      return { direction: "flat", label: rounded };
    };

    return {
      currentApplications,
      currentInterviews,
      applicationsTrend: toTrend(currentApplications, previousApplications),
      interviewsTrend: toTrend(currentInterviews, previousInterviews),
    };
  }, [applications, interviews, selectedDays, selectedStage]);

  const companyNameById = useMemo(() => {
    const map = new Map<string, string>();
    companies.forEach((company) => map.set(company.id, company.name));
    return map;
  }, [companies]);

  const companySnapshots = useMemo(() => {
    const jobsByCompany = new Map<string, number>();
    const openJobsByCompany = new Map<string, number>();
    const applicationsByCompany = new Map<string, number>();

    rangeFilteredJobs.forEach((job) => {
      jobsByCompany.set(job.company_id, (jobsByCompany.get(job.company_id) ?? 0) + 1);
      if (job.status === "OPEN") {
        openJobsByCompany.set(job.company_id, (openJobsByCompany.get(job.company_id) ?? 0) + 1);
      }
    });

    const jobToCompany = new Map<string, string>();
    rangeFilteredJobs.forEach((job) => {
      jobToCompany.set(job.id, job.company_id);
    });

    filteredApplications.forEach((app) => {
      const companyId = jobToCompany.get(app.job_id);
      if (!companyId) return;
      applicationsByCompany.set(companyId, (applicationsByCompany.get(companyId) ?? 0) + 1);
    });

    return Array.from(new Set(rangeFilteredJobs.map((job) => job.company_id))).map((companyId) => ({
      companyId,
      companyName: companyNameById.get(companyId) ?? `Company ${companyId.slice(0, 8)}`,
      jobs: jobsByCompany.get(companyId) ?? 0,
      openJobs: openJobsByCompany.get(companyId) ?? 0,
      applications: applicationsByCompany.get(companyId) ?? 0,
    }));
  }, [companyNameById, filteredApplications, rangeFilteredJobs]);

  if (loading) {
    return <AdminLoadingState text="Loading command center..." />;
  }

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Admin Command Center"
        description="Read-only preview mode: monitor talent and company workspaces from one screen without switching accounts."
        aside={<Badge className="border border-primary/25 bg-primary/10 text-primary hover:bg-primary/10">Read-only Preview</Badge>}
      />

      <div className={`${adminClassTokens.panel} relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5`}>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10" />
        <div className="absolute -right-2 top-6 h-24 w-24 rounded-full bg-accent/15" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">Welcome back, Admin</h2>
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              One control room for talent and company visibility. Keep this page as your daily operations cockpit.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" className="gap-2">
                <Link to="/admin/talents">
                  Open talent admin
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link to="/admin/companies">
                  Open company admin
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <WelcomeStat icon={<Users className="h-4 w-4 text-primary" />} label="Active Talents" value={counts.talents} />
            <WelcomeStat icon={<Building2 className="h-4 w-4 text-accent-foreground" />} label="Companies" value={counts.companies} />
            <WelcomeStat icon={<CheckCircle className="h-4 w-4 text-secondary-foreground" />} label="Job Ready" value={counts.jobReady} />
          </div>
        </div>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Talent Profiles"
          value={counts.talents}
          tone="primary"
          icon={<Users className="h-5 w-5 text-primary" />}
          trend="up"
        />
        <AdminStatCard
          label="Active Companies"
          value={counts.companies}
          tone="accent"
          icon={<Building2 className="h-5 w-5 text-accent-foreground" />}
        />
        <AdminStatCard
          label="Applications"
          value={metrics.currentApplications}
          tone="secondary"
          icon={<FileText className="h-5 w-5 text-secondary-foreground" />}
          subtitle={`Last ${selectedDays} days`}
          trend={metrics.applicationsTrend.direction}
          trendLabel={metrics.applicationsTrend.label}
        />
        <AdminStatCard
          label="Interviews"
          value={metrics.currentInterviews}
          tone="primary"
          icon={<CalendarCheck className="h-5 w-5 text-primary" />}
          subtitle={`Last ${selectedDays} days`}
          trend={metrics.interviewsTrend.direction}
          trendLabel={metrics.interviewsTrend.label}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {[
          {
            title: "SkillCore",
            subtitle: "Training & Certification",
            description: "Structured learning paths, certification readiness, and cohort health overview.",
            bullets: ["Learning Progress", "Certification Prep", "Project Completion"],
            to: "/admin/skillcore",
          },
          {
            title: "Discovery+",
            subtitle: "Training + Tourism + Networking",
            description: "Premium retreat funnel with booking demand, segment split, and event execution snapshot.",
            bullets: ["Retreat Leads", "VIP Conversion", "Networking Sessions"],
            to: "/admin/discovery",
          },
          {
            title: "TalentFlow",
            subtitle: "Talent, Placement & Mobility",
            description: "Career transition pipeline from interview prep to placement and relocation milestones.",
            bullets: ["Interview Pipeline", "Placement Health", "Visa Readiness"],
            to: "/admin/talentflow",
          },
        ].map((program) => (
          <article key={program.title} className={`${adminClassTokens.panel} flex flex-col gap-4`}>
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">{program.title}</h3>
              <p className="text-sm font-medium text-primary">{program.subtitle}</p>
            </div>
            <p className="text-sm text-muted-foreground">{program.description}</p>
            <ul className="space-y-1 text-sm text-foreground/90">
              {program.bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {bullet}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-auto w-full" variant="outline">
              <Link to={program.to}>
                Open dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </article>
        ))}
      </section>

      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="grid h-auto grid-cols-1 gap-1 rounded-xl bg-muted/30 p-1 sm:grid-cols-3">
          <TabsTrigger value="overview" className="gap-2 rounded-lg py-2.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="talent" className="gap-2 rounded-lg py-2.5 text-xs font-semibold">
            <Eye className="h-3.5 w-3.5" />
            Talent View (Read-only)
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2 rounded-lg py-2.5 text-xs font-semibold">
            <Globe className="h-3.5 w-3.5" />
            Company View (Read-only)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5">
          <div className={adminClassTokens.panel}>
            <AdminPanelHeader title="Overview Filters" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Talent Track</p>
                <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All tracks" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTracks.map((track) => (
                      <SelectItem key={track} value={track}>
                        {track === "ALL" ? "All tracks" : track}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Date Window</p>
                <Select value={selectedWindow} onValueChange={setSelectedWindow}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Last 30 days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Application Stage</p>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All stages</SelectItem>
                    <SelectItem value="APPLIED">Applied</SelectItem>
                    <SelectItem value="SCREEN">Screen</SelectItem>
                    <SelectItem value="INTERVIEW">Interview</SelectItem>
                    <SelectItem value="OFFER">Offer</SelectItem>
                    <SelectItem value="HIRED">Hired</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <section className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
            <div className={adminClassTokens.panel}>
              <AdminPanelHeader title="Weekly Operations" badge="Live" showMenu />
              <p className="mt-1 text-[0.8125rem] text-muted-foreground">Jobs, applications, and interviews activity over the selected window.</p>
              <div className="mt-5 h-72 rounded-xl bg-muted/10 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivityData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="applications" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="interviews" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={adminClassTokens.panel}>
              <AdminPanelHeader title="Talent Placement" badge="Distribution" showMenu />
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={placementBreakdown} dataKey="value" nameKey="label" innerRadius={58} outerRadius={90} paddingAngle={2}>
                      {["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))"].map((color) => (
                        <Cell key={color} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                {placementBreakdown.map((item) => (
                  <div key={item.label} className="rounded-lg bg-muted/20 px-2 py-2">
                    <p className="text-[11px] text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
            <div className={adminClassTokens.panel}>
              <AdminPanelHeader title="Application Stage Pipeline" showMenu />
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {stageBreakdown.map((item, index) => (
                  <Link
                    key={item.label}
                    to={`/admin/applications?stage=${item.stage}`}
                    className="rounded-xl border border-border/40 bg-muted/15 px-3 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: stageDotColors[index] }}
                      />
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    </div>
                    <p className="text-xl font-bold tracking-tight text-foreground">{item.value}</p>
                  </Link>
                ))}
              </div>
            </div>

            <aside className={adminClassTokens.panel}>
              <AdminPanelHeader title="Quick Readouts" showMenu />
              <ul className="mt-4 space-y-3 text-sm">
                <li className={adminClassTokens.railItem}>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Target className="h-4 w-4" /></span>
                    <div>
                      <p className="font-medium text-foreground">{counts.jobReady} talents ready</p>
                      <p className="text-xs text-muted-foreground">Ready for interview matching</p>
                    </div>
                  </div>
                </li>
                <li className={adminClassTokens.railItem}>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary-foreground"><CalendarCheck className="h-4 w-4" /></span>
                    <div>
                      <p className="font-medium text-foreground">{metrics.currentInterviews} interviews tracked</p>
                      <p className="text-xs text-muted-foreground">Within last {selectedDays} days</p>
                    </div>
                  </div>
                </li>
                <li className={adminClassTokens.railItem}>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground"><Activity className="h-4 w-4" /></span>
                    <div>
                      <p className="font-medium text-foreground">{rangeFilteredJobs.filter((job) => job.status === "OPEN").length} open job postings</p>
                      <p className="text-xs text-muted-foreground">Within last {selectedDays} days</p>
                    </div>
                  </div>
                </li>
              </ul>
            </aside>
          </section>
        </TabsContent>

        <TabsContent value="talent" className="space-y-5">
          <div className={adminClassTokens.panel}>
            <AdminPanelHeader title="Talent Workspace Preview" badge="Read-only" />
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">You can inspect readiness, placement stage, and top profiles without switching to a talent account.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className={adminClassTokens.tableHead}>
                  <tr>
                    <th className="px-5 py-3 text-left">Talent</th>
                    <th className="px-5 py-3 text-left">Track</th>
                    <th className="px-5 py-3 text-left">Experience</th>
                    <th className="px-5 py-3 text-left">Readiness</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topTalents.map((talent) => (
                    <tr key={talent.id} className={adminClassTokens.tableRow}>
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">{talent.user_id.slice(0, 12)}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{talent.sap_track ?? "General"}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{talent.years_of_experience} years</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-1.5 w-24 rounded-full bg-muted/50">
                            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, talent.readiness_score)}%` }} />
                          </div>
                          <span className="text-xs tabular-nums text-foreground">{talent.readiness_score}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <AdminStatusBadge
                          text={talent.placement_status}
                          kind={talent.placement_status === "JOB_READY" ? "primary" : talent.placement_status === "PLACED" ? "accent" : "neutral"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="company" className="space-y-5">
          <div className={adminClassTokens.panel}>
            <AdminPanelHeader title="Company Workspace Preview" badge="Read-only" />
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">Admin can monitor hiring demand and application load by company from this screen.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {companySnapshots.slice(0, 8).map((snapshot) => (
                <div key={snapshot.companyId} className="rounded-xl border border-border/40 bg-muted/15 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{snapshot.companyName}</p>
                    <Badge variant="secondary" className="text-[10px]">Preview</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <MetricTile label="Jobs" value={snapshot.jobs} icon={<Briefcase className="h-3.5 w-3.5" />} />
                    <MetricTile label="Open" value={snapshot.openJobs} icon={<TrendingUp className="h-3.5 w-3.5" />} />
                    <MetricTile label="Applications" value={snapshot.applications} icon={<FileText className="h-3.5 w-3.5" />} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className={adminClassTokens.tableWrap}>
          <div className="flex items-center justify-between bg-card px-5 py-4">
            <h3 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-foreground">Recent Talents</h3>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-primary">
              <Link to="/admin/talents">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <table className="w-full">
            <thead className={adminClassTokens.tableHead}>
              <tr>
                <th className="px-5 py-3 text-left">Talent</th>
                <th className="px-5 py-3 text-left">Readiness</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTalents.slice(0, 5).map((talent) => (
                <tr key={talent.id} className={adminClassTokens.tableRow}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {talent.user_id?.slice(0, 2).toUpperCase() ?? "?"}
                      </div>
                      <span className="text-sm font-medium text-foreground">{talent.user_id?.slice(0, 8) ?? "-"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-20 rounded-full bg-muted/40">
                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, talent.readiness_score)}%` }} />
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-foreground">{talent.readiness_score}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <AdminStatusBadge
                      text={talent.placement_status}
                      kind={talent.placement_status === "JOB_READY" ? "primary" : talent.placement_status === "PLACED" ? "accent" : "neutral"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={adminClassTokens.tableWrap}>
          <div className="flex items-center justify-between bg-card px-5 py-4">
            <h3 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-foreground">Recent Jobs</h3>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-primary">
              <Link to="/admin/jobs">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <table className="w-full">
            <thead className={adminClassTokens.tableHead}>
              <tr>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rangeFilteredJobs.slice(0, 5).map((job) => (
                <tr key={job.id} className={adminClassTokens.tableRow}>
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">{job.title}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{job.location ?? "Remote"}</td>
                  <td className="px-5 py-3.5">
                    <AdminStatusBadge text={job.status} kind={job.status === "OPEN" ? "primary" : "neutral"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricTile({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-border/35 bg-card/80 px-2 py-2">
      <div className="mb-1 flex items-center justify-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function WelcomeStat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card shadow-sm">{icon}</div>
      <div>
        <p className="text-lg font-bold tracking-[-0.02em] text-foreground">{value}</p>
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
