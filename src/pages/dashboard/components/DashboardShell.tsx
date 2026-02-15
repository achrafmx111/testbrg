import { ReactNode, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ChevronDown,
  Compass,
  FileText,
  GraduationCap,
  Briefcase,
  Building2,
  Menu,
  MessageSquare,
  Radar,
  Sparkles,
  Target,
  Trophy,
  Users,
  Search,
  X,
  LogOut,
  MapPin,
  User,
  Settings,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavSection {
  heading?: string | null;
  items: NavItem[];
}

interface DashboardShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  navSections?: NavSection[];
  navItems?: NavItem[]; // Simple flat list alternative
}

export const DashboardShell = ({
  children,
  navSections,
  navItems
}: DashboardShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Normalize nav structure
  const sections: NavSection[] = navSections || (navItems ? [{ items: navItems }] : []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const pageContext = getPageContext(location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="mx-auto grid min-h-screen max-w-[1720px] grid-cols-1 lg:grid-cols-[260px_1fr]">

        {/* ── Sidebar ── */}
        <aside className="sticky top-0 hidden h-screen flex-col bg-card border-r border-border/50 lg:flex">
          {/* Brand header */}
          <div className="px-6 py-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <BarChart3 className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.9375rem] font-bold tracking-[-0.01em] text-foreground">
                  Bridging Academy
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className={sIdx > 0 ? "mt-5" : ""}>
                {section.heading && (
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
                    {section.heading}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end !== false} // Default to exact match unless specified
                        className={({ isActive }) =>
                          [
                            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.8125rem] font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                              : "text-foreground/65 hover:bg-primary/8 hover:text-foreground",
                          ].join(" ")
                        }
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0 transition-colors duration-150" />
                        <span className="truncate">{item.label}</span>
                        {item.to === "." && (
                          <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-50" />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User footer */}
          <div className="border-t border-border/50 px-4 py-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Avatar className="h-9 w-9 border border-border/50">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">ME</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[0.8125rem] font-semibold text-foreground">
                      My Account
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      Manage profile
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* ── Mobile header (visible on < lg) ── */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-card px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card text-foreground/70 hover:bg-muted/30"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-foreground">Bridging Academy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <nav className="absolute left-0 top-0 h-full w-[260px] bg-card border-r border-border/50 p-4 overflow-y-auto shadow-xl animate-in slide-in-from-left duration-200">
              <div className="mb-6 flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <BarChart3 className="h-[18px] w-[18px]" />
                </div>
                <p className="text-[0.9375rem] font-bold text-foreground">Bridging Academy</p>
              </div>
              {sections.map((section, sIdx) => (
                <div key={sIdx} className={sIdx > 0 ? "mt-5" : ""}>
                  {section.heading && (
                    <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
                      {section.heading}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end !== false}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            [
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.8125rem] font-medium transition-all duration-200",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                : "text-foreground/65 hover:bg-primary/8 hover:text-foreground",
                            ].join(" ")
                          }
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="mt-8 pt-4 border-t border-border/50">
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </nav>
          </div>
        )}

        {/* ── Top bar (desktop) ── */}
        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-border/40 bg-card/80 px-8 py-3 backdrop-blur-md lg:flex">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-full rounded-lg border border-border/50 bg-muted/20 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-foreground/60 hover:text-foreground">
                <Bell className="h-[18px] w-[18px]" />
              </Button>
              <div className="h-5 w-px bg-border/50" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/20 transition-colors cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">ME</AvatarFallback>
                    </Avatar>
                    <div className="hidden xl:block text-left">
                      <p className="text-[0.8125rem] font-medium text-foreground">My Account</p>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* ── Main content area ── */}
          <main className="min-w-0 flex-1 px-5 py-7 md:px-8 md:py-8 xl:px-10 xl:py-9 fade-in-10 animate-in">
            <section className={`relative mb-6 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br p-5 md:p-6 ${pageContext.shellTone}`}>
              <div className="absolute -top-16 right-2 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute -bottom-20 left-2 h-40 w-40 rounded-full bg-secondary/10 blur-2xl" />
              <div className="relative flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {pageContext.badgeIcon}
                    {pageContext.badge}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{pageContext.title}</h1>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{pageContext.subtitle}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {pageContext.quickStats.map((item) => (
                    <div key={item.label} className="rounded-xl border border-border/50 bg-card/80 px-3 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <div className="dashboard-main" data-dashboard-context={pageContext.key}>
              <div className="dashboard-content-grid">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

type ContextData = {
  key: "admin" | "skillcore" | "discovery" | "talentflow" | "talent" | "company" | "applications" | "jobs" | "messaging" | "workspace";
  title: string;
  subtitle: string;
  badge: string;
  badgeIcon: ReactNode;
  shellTone: string;
  quickStats: Array<{ label: string; value: string }>;
};

function getPageContext(pathname: string): ContextData {
  const routePresets: Array<{ match: (path: string) => boolean; context: ContextData }> = [
    {
      match: (path) => /skillcore/.test(path),
      context: {
        key: "skillcore",
        title: "SkillCore Operations",
        subtitle: "Education delivery, cohort quality, and certification progress.",
        badge: "Training",
        badgeIcon: <GraduationCap className="h-3 w-3" />,
        shellTone: "from-card via-primary/5 to-card",
        quickStats: [
          { label: "Learners", value: "1.2k" },
          { label: "Cohorts", value: "16" },
          { label: "Completion", value: "87%" },
        ],
      },
    },
    {
      match: (path) => /discovery/.test(path),
      context: {
        key: "discovery",
        title: "Discovery+ Programs",
        subtitle: "Retreat demand, premium packages, and event execution timeline.",
        badge: "Experience",
        badgeIcon: <Compass className="h-3 w-3" />,
        shellTone: "from-card via-secondary/10 to-card",
        quickStats: [
          { label: "Leads", value: "286" },
          { label: "Seats", value: "118" },
          { label: "Events", value: "24" },
        ],
      },
    },
    {
      match: (path) => /talentflow/.test(path),
      context: {
        key: "talentflow",
        title: "TalentFlow Pipeline",
        subtitle: "Readiness movement, interview progression, and mobility outcomes.",
        badge: "Placement",
        badgeIcon: <Target className="h-3 w-3" />,
        shellTone: "from-card via-accent/10 to-card",
        quickStats: [
          { label: "In Flow", value: "764" },
          { label: "Interviews", value: "146" },
          { label: "Placed", value: "63" },
        ],
      },
    },
    {
      match: (path) => /applications/.test(path),
      context: {
        key: "applications",
        title: "Applications Desk",
        subtitle: "Review candidate quality, apply filters, and move decisions faster.",
        badge: "Pipeline",
        badgeIcon: <FileText className="h-3 w-3" />,
        shellTone: "from-card via-accent/10 to-card",
        quickStats: [
          { label: "Pending", value: "42" },
          { label: "Review", value: "18" },
          { label: "Approved", value: "26" },
        ],
      },
    },
    {
      match: (path) => /jobs/.test(path),
      context: {
        key: "jobs",
        title: "Jobs Control",
        subtitle: "Track openings, monitor role demand, and tune hiring targets.",
        badge: "Jobs",
        badgeIcon: <Briefcase className="h-3 w-3" />,
        shellTone: "from-card via-primary/10 to-card",
        quickStats: [
          { label: "Open", value: "27" },
          { label: "Draft", value: "8" },
          { label: "Closed", value: "13" },
        ],
      },
    },
    {
      match: (path) => /messages|messaging/.test(path),
      context: {
        key: "messaging",
        title: "Messaging Center",
        subtitle: "Conversations, escalations, and communication quality at a glance.",
        badge: "Comms",
        badgeIcon: <MessageSquare className="h-3 w-3" />,
        shellTone: "from-card via-secondary/10 to-accent/10",
        quickStats: [
          { label: "Unread", value: "19" },
          { label: "Open", value: "12" },
          { label: "Resolved", value: "44" },
        ],
      },
    },
    {
      match: (path) => /\/admin(\/|$)/.test(path) && !/skillcore|discovery|talentflow/.test(path),
      context: {
        key: "admin",
        title: "Admin Command Workspace",
        subtitle: "Operations, governance, and system-wide monitoring in one admin layer.",
        badge: "Admin",
        badgeIcon: <Radar className="h-3 w-3" />,
        shellTone: "from-card via-card to-primary/5",
        quickStats: [
          { label: "Views", value: "14" },
          { label: "Queues", value: "6" },
          { label: "Alerts", value: "3" },
        ],
      },
    },
    {
      match: (path) => /roadmap/.test(path),
      context: {
        key: "talent",
        title: "Learning Journey",
        subtitle: "Visualize your path from beginner to certified pro.",
        badge: "Gamified",
        badgeIcon: <MapPin className="h-3 w-3" />,
        shellTone: "from-card via-purple-500/5 to-purple-500/10",
        quickStats: [
          { label: "Level", value: "3" },
          { label: "XP", value: "2,450" },
          { label: "Badges", value: "2" },
        ],
      },
    },
    {
      match: (path) => /resume-analysis/.test(path),
      context: {
        key: "talent",
        title: "AI CV Analyzer",
        subtitle: "Instant feedback on your resume's match with top German employers.",
        badge: "Beta",
        badgeIcon: <FileText className="h-3 w-3" />,
        shellTone: "from-card via-indigo-500/5 to-indigo-500/10",
        quickStats: [
          { label: "Scans", value: "0" },
          { label: "Top Score", value: "--" },
          { label: "Passed ATS", value: "Yes" },
        ],
      },
    },
    {
      match: (path) => /coach/.test(path),
      context: {
        key: "talent",
        title: "AI Career Coach",
        subtitle: "Practice technical and behavioral interviews in a safe environment.",
        badge: "Beta",
        badgeIcon: <Users className="h-3 w-3" />,
        shellTone: "from-card via-primary/5 to-primary/10",
        quickStats: [
          { label: "Sessions", value: "0" },
          { label: "Avg Score", value: "--" },
          { label: "Streak", value: "1 Day" },
        ],
      },
    },
    {
      match: (path) => /\/talent(\/|$)/.test(path),
      context: {
        key: "talent",
        title: "Talent Journey Hub",
        subtitle: "Learning momentum, applications, and personal career milestones.",
        badge: "Talent",
        badgeIcon: <Trophy className="h-3 w-3" />,
        shellTone: "from-card via-primary/5 to-secondary/10",
        quickStats: [
          { label: "Readiness", value: "84" },
          { label: "Applications", value: "6" },
          { label: "Interviews", value: "3" },
        ],
      },
    },
    {
      match: (path) => /\/company(\/|$)/.test(path),
      context: {
        key: "company",
        title: "Company Hiring Hub",
        subtitle: "Role demand, applicant quality, and recruitment pipeline execution.",
        badge: "Company",
        badgeIcon: <Building2 className="h-3 w-3" />,
        shellTone: "from-card via-secondary/10 to-primary/5",
        quickStats: [
          { label: "Open Roles", value: "11" },
          { label: "Applicants", value: "241" },
          { label: "Hires", value: "9" },
        ],
      },
    },
  ];

  const fallback: ContextData = {
    key: "workspace",
    title: "Dashboard",
    subtitle: "Operational overview with role-specific insights and workflow controls.",
    badge: "Workspace",
    badgeIcon: <Sparkles className="h-3 w-3" />,
    shellTone: "from-card to-muted/20",
    quickStats: [
      { label: "Widgets", value: "12" },
      { label: "Panels", value: "8" },
      { label: "Status", value: "Live" },
    ],
  };

  return routePresets.find((item) => item.match(pathname))?.context ?? fallback;
}
