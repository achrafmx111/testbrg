import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  GraduationCap,
  Target,
  GitBranch,
  MessageSquare,
  DollarSign,
  LifeBuoy,
  TrendingUp,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

/* ── Nav structure with section groups ── */
const navSections = [
  {
    heading: null, // Primary nav — no heading
    items: [
      { label: "Dashboard", to: ".", icon: LayoutDashboard },
    ],
  },
  {
    heading: "Apps & Pages",
    items: [
      { label: "Talents", to: "talents", icon: Users },
      { label: "Companies", to: "companies", icon: Building2 },
      { label: "Jobs", to: "jobs", icon: Briefcase },
      { label: "Applications", to: "applications", icon: FileText },
      { label: "Academy", to: "academy", icon: GraduationCap },
      { label: "Pipeline", to: "pipeline", icon: GitBranch },
    ],
  },
  {
    heading: "Operations",
    items: [
      { label: "Readiness", to: "readiness", icon: Target },
      { label: "Messaging", to: "messaging", icon: MessageSquare },
      { label: "Finance", to: "finance", icon: DollarSign },
      { label: "Analytics", to: "analytics", icon: TrendingUp },
    ],
  },
  {
    heading: "System",
    items: [
      { label: "Support", to: "support", icon: LifeBuoy },
      { label: "Settings", to: "settings", icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F9] text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1720px] grid-cols-1 lg:grid-cols-[260px_1fr]">

        {/* ── Sidebar ── */}
        <aside className="sticky top-0 hidden h-screen flex-col bg-card border-r border-border/50 lg:flex">
          {/* Brand header */}
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <BarChart3 className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.9375rem] font-bold tracking-[-0.01em] text-foreground">
                  Bridging Academy
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin">
            {navSections.map((section, sIdx) => (
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
                        end={item.to === "."}
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
            <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                BA
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8125rem] font-semibold text-foreground">
                  Admin User
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  admin@bridging.academy
                </p>
              </div>
            </div>
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
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/50 hover:bg-muted/30">
              <Search className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/50 hover:bg-muted/30">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <nav className="absolute left-0 top-0 h-full w-[260px] bg-card border-r border-border/50 p-4 overflow-y-auto shadow-xl">
              <div className="mb-6 flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <BarChart3 className="h-[18px] w-[18px]" />
                </div>
                <p className="text-[0.9375rem] font-bold text-foreground">Bridging Academy</p>
              </div>
              {navSections.map((section, sIdx) => (
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
                          end={item.to === "."}
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
                placeholder="Search (Ctrl+K)"
                className="h-10 w-full rounded-lg border border-border/50 bg-muted/20 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground/50 hover:bg-muted/30 transition-colors">
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>
              <div className="h-5 w-px bg-border/50" />
              <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/20 transition-colors cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  BA
                </div>
                <div className="hidden xl:block">
                  <p className="text-[0.8125rem] font-medium text-foreground">Admin</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </header>

          {/* ── Main content area ── */}
          <main className="min-w-0 flex-1 px-5 py-7 md:px-8 md:py-8 xl:px-10 xl:py-9">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
