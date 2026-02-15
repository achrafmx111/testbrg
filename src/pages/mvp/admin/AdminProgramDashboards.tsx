import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { adminClassTokens } from "@/components/admin/designTokens";
import { AdminPanelHeader, AdminSectionHeader, AdminStatCard, AdminStatusBadge } from "@/components/admin/AdminPrimitives";

const skillcoreWeekly = [
  { day: "Mon", learningHours: 142, assessments: 34 },
  { day: "Tue", learningHours: 156, assessments: 38 },
  { day: "Wed", learningHours: 168, assessments: 42 },
  { day: "Thu", learningHours: 177, assessments: 47 },
  { day: "Fri", learningHours: 191, assessments: 53 },
  { day: "Sat", learningHours: 123, assessments: 29 },
  { day: "Sun", learningHours: 109, assessments: 24 },
];

const discoveryPackages = [
  { name: "Executive", value: 28, fill: "hsl(var(--primary))" },
  { name: "Professional", value: 49, fill: "hsl(var(--secondary))" },
  { name: "Group", value: 23, fill: "hsl(var(--accent))" },
];

const talentflowStages = [
  { stage: "Profile Ready", count: 214 },
  { stage: "Screening", count: 166 },
  { stage: "Interview", count: 96 },
  { stage: "Offer", count: 41 },
  { stage: "Placed", count: 24 },
];

const talentflowColumns = [
  {
    title: "Interview Ready",
    items: ["Y. El Idrissi", "O. Benali", "S. Naciri"],
  },
  {
    title: "Company Interviews",
    items: ["M. Zahiri", "K. Lahlou", "H. Benjelloun"],
  },
  {
    title: "Offer & Mobility",
    items: ["N. Boussaid", "R. Jbari"],
  },
];

function SkillCoreDashboard() {
  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="SkillCore Dashboard"
        description="Education-first command center focused on cohort performance, training pace, and certification quality."
        aside={<Badge className="border border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">Training Identity</Badge>}
      />

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Active Learners" value="1,248" trend="up" trendLabel="+8.3%" tone="primary" />
        <AdminStatCard label="Cohorts" value="16" trend="up" trendLabel="+2" tone="secondary" />
        <AdminStatCard label="Completion Rate" value="87%" trend="up" trendLabel="+4.1%" tone="accent" />
        <AdminStatCard label="Certificates" value="432" trend="flat" trendLabel="0.0%" tone="primary" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <article className={`${adminClassTokens.panel} bg-gradient-to-br from-card to-primary/5`}>
          <AdminPanelHeader title="Learning Intensity" badge="Weekly" showMenu />
          <p className="mt-1 text-xs text-muted-foreground">Hours consumed vs assessments completed by day.</p>
          <div className="mt-4 h-72 rounded-xl bg-muted/10 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={skillcoreWeekly}>
                <defs>
                  <linearGradient id="skillcore-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="learningHours" stroke="hsl(var(--primary))" fill="url(#skillcore-area)" strokeWidth={2.2} />
                <Area type="monotone" dataKey="assessments" stroke="hsl(var(--secondary))" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={adminClassTokens.panel}>
          <AdminPanelHeader title="Cohort Health" badge="Quality" showMenu />
          <div className="mt-4 space-y-3">
            {[
              { name: "FI Cohort 12", health: 92, status: "On Track" },
              { name: "MM Cohort 08", health: 68, status: "At Risk" },
              { name: "SD Cohort 15", health: 88, status: "On Track" },
              { name: "ABAP Cohort 06", health: 61, status: "Needs Coach" },
            ].map((row) => (
              <div key={row.name} className="rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{row.name}</p>
                  <AdminStatusBadge text={row.status} kind={row.status === "On Track" ? "primary" : "warning"} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 rounded-full bg-muted/40">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${row.health}%` }} />
                  </div>
                  <span className="text-xs text-foreground">{row.health}%</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function DiscoveryDashboard() {
  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Discovery+ Dashboard"
        description="Premium experience board focused on retreat demand, segment mix, and event execution quality."
        aside={<Badge className="border border-secondary/25 bg-secondary/20 text-secondary-foreground hover:bg-secondary/20">Premium Identity</Badge>}
      />

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Retreat Leads" value="286" trend="up" trendLabel="+12.6%" tone="secondary" />
        <AdminStatCard label="Confirmed Seats" value="118" trend="up" trendLabel="+9.4%" tone="accent" />
        <AdminStatCard label="Partner Events" value="24" trend="flat" trendLabel="0.0%" tone="primary" />
        <AdminStatCard label="VIP Upgrades" value="31" trend="up" trendLabel="+3.2%" tone="secondary" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <article className={`${adminClassTokens.panel} bg-gradient-to-b from-card to-secondary/10`}>
          <AdminPanelHeader title="Package Split" badge="Commercial" showMenu />
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={discoveryPackages} dataKey="value" nameKey="name" innerRadius={56} outerRadius={90} paddingAngle={3} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {discoveryPackages.map((segment) => (
              <div key={segment.name} className="rounded-lg bg-muted/15 px-2 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">{segment.name}</p>
                <p className="text-sm font-semibold text-foreground">{segment.value}%</p>
              </div>
            ))}
          </div>
        </article>

        <article className={adminClassTokens.panel}>
          <AdminPanelHeader title="Retreat Calendar Board" badge="Execution" showMenu />
          <div className="mt-4 space-y-3">
            {[
              { title: "Marrakech Executive Week", period: "May 18 - May 22", status: "Confirmed", occupancy: 95 },
              { title: "Atlas Networking Camp", period: "Jun 10 - Jun 14", status: "Pipeline", occupancy: 72 },
              { title: "Casablanca Leadership Day", period: "Jun 28", status: "Confirmed", occupancy: 83 },
              { title: "Agadir Immersion Sprint", period: "Jul 04 - Jul 07", status: "At Risk", occupancy: 58 },
            ].map((event) => (
              <div key={event.title} className="rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.period}</p>
                  </div>
                  <AdminStatusBadge text={event.status} kind={event.status === "Confirmed" ? "accent" : event.status === "Pipeline" ? "primary" : "warning"} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 rounded-full bg-muted/40">
                    <div className="h-1.5 rounded-full bg-secondary" style={{ width: `${event.occupancy}%` }} />
                  </div>
                  <span className="text-xs text-foreground">{event.occupancy}% seats</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function TalentFlowDashboard() {
  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="TalentFlow Dashboard"
        description="Pipeline-first command center focused on readiness movement, interviews, and placement velocity."
        aside={<Badge className="border border-accent/20 bg-accent/15 text-accent-foreground hover:bg-accent/15">Placement Identity</Badge>}
      />

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Talent in Flow" value="764" trend="up" trendLabel="+6.0%" tone="primary" />
        <AdminStatCard label="Interviews" value="146" trend="up" trendLabel="+11.8%" tone="accent" />
        <AdminStatCard label="Placements" value="63" trend="up" trendLabel="+5.7%" tone="secondary" />
        <AdminStatCard label="Visa Active" value="39" trend="down" trendLabel="-1.1%" tone="primary" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <article className={`${adminClassTokens.panel} bg-gradient-to-br from-card to-accent/10`}>
          <AdminPanelHeader title="Pipeline Volume by Stage" badge="Flow" showMenu />
          <div className="mt-4 h-72 rounded-xl bg-muted/10 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={talentflowStages}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="stage" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={adminClassTokens.panel}>
          <AdminPanelHeader title="Placement Velocity" badge="4 Weeks" showMenu />
          <div className="mt-4 space-y-3">
            {[
              { label: "Readiness to Interview", value: "8.2 days", trend: "+0.6" },
              { label: "Interview to Offer", value: "6.4 days", trend: "-0.8" },
              { label: "Offer to Mobility", value: "14.1 days", trend: "-1.3" },
              { label: "Mobility Completion", value: "11.7 days", trend: "+0.4" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-lg font-semibold text-foreground">{item.value}</p>
                  <span className="text-xs text-primary">{item.trend}d</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {talentflowColumns.map((column) => (
          <article key={column.title} className="rounded-2xl border border-border/60 bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{column.title}</h3>
            <div className="space-y-2">
              {column.items.map((person) => (
                <div key={person} className="rounded-lg border border-border/50 bg-muted/10 px-3 py-2 text-sm font-medium text-foreground">
                  {person}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export function AdminSkillCoreDashboardPage() {
  return <SkillCoreDashboard />;
}

export function AdminDiscoveryDashboardPage() {
  return <DiscoveryDashboard />;
}

export function AdminTalentFlowDashboardPage() {
  return <TalentFlowDashboard />;
}
