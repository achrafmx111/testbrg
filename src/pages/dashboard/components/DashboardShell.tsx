import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ChevronDown,
  Clock3,
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
  Pin,
  Plus,
  CheckCircle2,
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
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
};

type QuickAction = {
  label: string;
  to: string;
  icon: LucideIcon;
  description: string;
};

type ActivityItem = {
  id: string;
  title: string;
  meta: string;
};

type OnboardingStep = {
  id: string;
  title: string;
  detail: string;
};

const PINNED_NAV_KEY = "dashboard-pinned-nav:v1";
const ONBOARDING_SEEN_KEY = "dashboard-onboarding-seen:v1";

interface DashboardShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  navSections?: NavSection[];
  navItems?: NavItem[]; // Simple flat list alternative
  hideHeader?: boolean;
}

export const DashboardShell = ({
  children,
  navSections,
  navItems,
  hideHeader = false
}: DashboardShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getNotificationSeed("workspace"));
  const [pinnedPaths, setPinnedPaths] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(PINNED_NAV_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
    } catch {
      return [];
    }
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Normalize nav structure
  const sections: NavSection[] = useMemo(
    () => navSections || (navItems ? [{ items: navItems }] : []),
    [navSections, navItems],
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navCommandItems = useMemo(() => {
    const seen = new Set<string>();
    return sections
      .flatMap((section) => section.items)
      .filter((item) => {
        const key = `${item.label}-${item.to}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [sections]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleCommandNavigate = (to: string) => {
    setCommandOpen(false);
    navigate(to);
  };

  const pageContext = getPageContext(location.pathname);
  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    setNotifications(getNotificationSeed(pageContext.key));
  }, [pageContext.key]);

  const quickActions = useMemo(() => getQuickActions(pageContext.key), [pageContext.key]);


  const pinnedNavItems = useMemo(
    () => pinnedPaths
      .map((path) => navCommandItems.find((item) => item.to === path))
      .filter((item): item is NavItem => Boolean(item)),
    [navCommandItems, pinnedPaths],
  );

  useEffect(() => {
    localStorage.setItem(PINNED_NAV_KEY, JSON.stringify(pinnedPaths));
  }, [pinnedPaths]);



  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const openNotification = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const togglePinnedNav = (to: string) => {
    setPinnedPaths((prev) => (
      prev.includes(to)
        ? prev.filter((path) => path !== to)
        : [to, ...prev].slice(0, 8)
    ));
  };



  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="mx-auto grid min-h-screen max-w-[1720px] grid-cols-1 lg:grid-cols-[260px_1fr]">

        {/* ── Sidebar ── */}
        {/* ── Sidebar (Glassmorphism) ── */}
        <aside className="sticky top-0 hidden h-screen flex-col bg-card/60 backdrop-blur-xl border-r border-border/40 shadow-[1px_0_20px_0_rgba(0,0,0,0.05)] lg:flex z-40 supports-[backdrop-filter]:bg-card/30">
          {/* Brand header */}
          <div className="px-6 py-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                <BarChart3 className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.9375rem] font-bold tracking-[-0.01em] text-foreground group-hover:text-primary transition-colors">
                  Bridging Academy
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin">
            {pinnedNavItems.length > 0 ? (
              <div className="mb-5">
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">
                  Pinned
                </p>
                <div className="space-y-1">
                  {pinnedNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={`pinned-${item.to}`} className="group flex items-center gap-1">
                        <NavLink
                          to={item.to}
                          end={item.end !== false}
                          className={({ isActive }) =>
                            [
                              "flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-[0.8125rem] font-medium transition-all duration-300",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                : "text-foreground/70 hover:bg-primary/5 hover:text-foreground",
                            ].join(" ")
                          }
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => togglePinnedNav(item.to)}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {sections.map((section, sIdx) => (
              <div key={sIdx} className={sIdx > 0 ? "mt-5" : ""}>
                {section.heading && (
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">
                    {section.heading}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end !== false} // Default to exact match unless specified
                        className={({ isActive }) =>
                          [
                            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.8125rem] font-medium transition-all duration-300 relative overflow-hidden",
                            isActive
                              ? "text-primary-foreground shadow-md shadow-primary/25 translate-x-1"
                              : "text-foreground/70 hover:bg-primary/5 hover:text-foreground hover:translate-x-1",
                          ].join(" ")
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 opacity-100 -z-10" />
                            )}
                            <Icon className={`h-[18px] w-[18px] shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110 group-hover:text-primary"}`} />
                            <span className="truncate">{item.label}</span>
                            {item.to === "." && (
                              <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-50" />
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User footer */}
          <div className="border-t border-border/30 px-4 py-4 backdrop-blur-sm bg-card/20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer hover:bg-white/40 transition-colors border border-transparent hover:border-white/50 shadow-sm hover:shadow-md duration-200 group">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary text-xs font-bold">ME</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[0.8125rem] font-semibold text-foreground group-hover:text-primary transition-colors">
                      My Account
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      Manage profile
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
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
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* ── Mobile header (visible on < lg) ── */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-card/70 backdrop-blur-xl px-4 py-3 lg:hidden supports-[backdrop-filter]:bg-card/40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/50 text-foreground/70 hover:bg-muted/30 active:scale-95 transition-transform"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <BarChart3 className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-foreground">Bridging Academy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/5">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  <Button variant="ghost" className="h-7 px-2 text-[11px]" onClick={markAllNotificationsRead}>
                    Mark all read
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => openNotification(item.id)}
                    className="flex cursor-pointer flex-col items-start gap-0.5 py-2"
                  >
                    <p className={`text-xs font-semibold ${item.read ? "text-muted-foreground" : "text-foreground"}`}>
                      {item.title}
                    </p>
                    <p className="line-clamp-1 text-[11px] text-muted-foreground">{item.detail}</p>
                    <p className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/80">
                      <Clock3 className="h-3 w-3" /> {item.time}
                    </p>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="hover:bg-primary/5" onClick={() => setCommandOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <nav className="absolute left-0 top-0 h-full w-[280px] bg-card/90 backdrop-blur-2xl border-r border-border/50 p-4 overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="mb-8 flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <p className="text-lg font-bold text-foreground">Bridging Academy</p>
              </div>
              {pinnedNavItems.length > 0 ? (
                <div className="mb-6">
                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
                    Pinned
                  </p>
                  <div className="space-y-1">
                    {pinnedNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={`mobile-pinned-${item.to}`}
                          to={item.to}
                          end={item.end !== false}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            [
                              "flex items-center gap-3 rounded-xl px-3 py-3 text-[0.9rem] font-medium transition-all duration-200",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                : "text-foreground/70 hover:bg-primary/5 hover:text-foreground",
                            ].join(" ")
                          }
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {sections.map((section, sIdx) => (
                <div key={sIdx} className={sIdx > 0 ? "mt-6" : ""}>
                  {section.heading && (
                    <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
                      {section.heading}
                    </p>
                  )}
                  <div className="space-y-1">
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
                              "flex items-center gap-3 rounded-xl px-3 py-3 text-[0.9rem] font-medium transition-all duration-200",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                : "text-foreground/70 hover:bg-primary/5 hover:text-foreground hover:translate-x-1",
                            ].join(" ")
                          }
                        >
                          <Icon className="h-5 w-5 shrink-0" />
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
          <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-white/20 bg-white/60 px-8 py-3.5 backdrop-blur-xl lg:flex supports-[backdrop-filter]:bg-white/30 shadow-sm">
            <div className="relative w-80 group">
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="flex h-10 w-full items-center gap-2 rounded-xl border border-border/40 bg-white/50 px-3 text-left text-sm text-muted-foreground/70 outline-none transition-all hover:bg-white/80 hover:shadow-md focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/10"
              >
                <Search className="h-4 w-4 text-muted-foreground/50" />
                <span className="truncate">Search candidates, jobs, pages...</span>
                <kbd className="ml-auto hidden rounded-md border border-border/60 bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground xl:inline-flex">
                  Ctrl K
                </kbd>
              </button>
            </div>
            <div className="flex items-center gap-3">
              {/* XP Badge for Talents (Mock for now) */}
              <div className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">2,450 XP</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-foreground/60 hover:text-foreground">
                    <Bell className="h-[18px] w-[18px]" />
                    {unreadCount > 0 ? (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    Notifications
                    <Button variant="ghost" className="h-7 px-2 text-[11px]" onClick={markAllNotificationsRead}>
                      Mark all read
                    </Button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => openNotification(item.id)}
                      className="flex cursor-pointer flex-col items-start gap-0.5 py-2"
                    >
                      <p className={`text-xs font-semibold ${item.read ? "text-muted-foreground" : "text-foreground"}`}>
                        {item.title}
                      </p>
                      <p className="line-clamp-1 text-[11px] text-muted-foreground">{item.detail}</p>
                      <p className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/80">
                        <Clock3 className="h-3 w-3" /> {item.time}
                      </p>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
            <div className="dashboard-main" data-dashboard-context={pageContext.key}>
              {!hideHeader && (
                <>
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

                </>
              )}
              <div className="dashboard-content-grid">{children}</div>
            </div>
          </main>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:bg-primary/90">
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <DropdownMenuItem
                  key={action.label}
                  onClick={() => handleCommandNavigate(action.to)}
                  className="flex cursor-pointer items-start gap-2 py-2"
                >
                  <Icon className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">{action.label}</span>
                    <span className="text-[11px] text-muted-foreground">{action.description}</span>
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>



      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search pages and actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {pinnedNavItems.length > 0 ? (
            <CommandGroup heading="Pinned">
              {pinnedNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem key={`command-pinned-${item.to}`} onSelect={() => handleCommandNavigate(item.to)}>
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    <CommandShortcut>Pin</CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null}
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            {navCommandItems.map((item) => {
              const Icon = item.icon;
              const isPinned = pinnedPaths.includes(item.to);
              return (
                <CommandItem key={`${item.label}-${item.to}`} onSelect={() => handleCommandNavigate(item.to)}>
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-6 w-6"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      togglePinnedNav(item.to);
                    }}
                  >
                    <Pin className={`h-3.5 w-3.5 ${isPinned ? "fill-current text-primary" : "text-muted-foreground"}`} />
                  </Button>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => handleCommandNavigate("profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Open Profile</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandNavigate("settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Open Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => {
              setCommandOpen(false);
              handleSignOut().catch(() => undefined);
            }}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
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

function getNotificationSeed(contextKey: ContextData["key"]): NotificationItem[] {
  const byContext: Record<ContextData["key"], Array<Omit<NotificationItem, "read">>> = {
    admin: [
      { id: "admin-1", title: "SLA risk detected", detail: "Support queue exceeded 15 unresolved tickets.", time: "5m ago" },
      { id: "admin-2", title: "Approval backlog", detail: "4 company profiles are waiting compliance review.", time: "18m ago" },
      { id: "admin-3", title: "Audit digest ready", detail: "Weekly governance report is ready to publish.", time: "1h ago" },
    ],
    skillcore: [
      { id: "skillcore-1", title: "Cohort checkpoint", detail: "Cohort B reached 82% completion this week.", time: "7m ago" },
      { id: "skillcore-2", title: "Certificate export", detail: "16 certification badges were issued automatically.", time: "32m ago" },
      { id: "skillcore-3", title: "Learning alert", detail: "12 learners are inactive for 5+ days.", time: "2h ago" },
    ],
    discovery: [
      { id: "discovery-1", title: "Retreat demand spike", detail: "Berlin retreat lead volume increased by 14%.", time: "9m ago" },
      { id: "discovery-2", title: "Partner update", detail: "2 venue partners confirmed new slots.", time: "40m ago" },
      { id: "discovery-3", title: "Campaign threshold", detail: "Premium package reached 75% conversion goal.", time: "3h ago" },
    ],
    talentflow: [
      { id: "talentflow-1", title: "Interview wave", detail: "11 candidates moved to interview stage.", time: "11m ago" },
      { id: "talentflow-2", title: "Placement update", detail: "3 candidates accepted final offers today.", time: "46m ago" },
      { id: "talentflow-3", title: "Readiness dip", detail: "Cohort C average readiness dropped 4 points.", time: "2h ago" },
    ],
    talent: [
      { id: "talent-1", title: "New match found", detail: "A new role matches your top 3 skills.", time: "6m ago" },
      { id: "talent-2", title: "Coach reminder", detail: "Your coaching session starts in 2 hours.", time: "21m ago" },
      { id: "talent-3", title: "Learning streak", detail: "You are 1 day away from a weekly streak badge.", time: "1h ago" },
    ],
    company: [
      { id: "company-1", title: "New shortlisted candidate", detail: "Candidate #A61 reached 92% role match.", time: "8m ago" },
      { id: "company-2", title: "Offer status", detail: "2 offers are pending manager approval.", time: "33m ago" },
      { id: "company-3", title: "Talent pool refresh", detail: "6 new job-ready profiles were added.", time: "2h ago" },
    ],
    applications: [
      { id: "applications-1", title: "Pipeline moved", detail: "5 candidates moved from review to interview.", time: "14m ago" },
      { id: "applications-2", title: "Missing documents", detail: "2 applications need profile completion.", time: "52m ago" },
      { id: "applications-3", title: "Decision reminder", detail: "4 applications exceed review SLA.", time: "2h ago" },
    ],
    jobs: [
      { id: "jobs-1", title: "Role engagement", detail: "SAP BTP role got 19 new views.", time: "16m ago" },
      { id: "jobs-2", title: "Draft warning", detail: "3 job drafts are pending publish action.", time: "1h ago" },
      { id: "jobs-3", title: "Close recommendation", detail: "2 roles reached target applicants.", time: "3h ago" },
    ],
    messaging: [
      { id: "messaging-1", title: "Unread escalation", detail: "1 conversation flagged urgent by support.", time: "4m ago" },
      { id: "messaging-2", title: "Template used", detail: "Recruitment update template used 12 times today.", time: "34m ago" },
      { id: "messaging-3", title: "Response quality", detail: "Average response time improved by 9%.", time: "2h ago" },
    ],
    workspace: [
      { id: "workspace-1", title: "Workspace synced", detail: "Dashboard preferences were refreshed.", time: "12m ago" },
      { id: "workspace-2", title: "New activity", detail: "There are updates across your tracked panels.", time: "57m ago" },
      { id: "workspace-3", title: "Reminder", detail: "Review your pending tasks for today.", time: "2h ago" },
    ],
  };

  return (byContext[contextKey] ?? byContext.workspace).map((item) => ({ ...item, read: false }));
}

function getQuickActions(contextKey: ContextData["key"]): QuickAction[] {
  const actionMap: Record<ContextData["key"], QuickAction[]> = {
    admin: [
      { label: "Review Applications", to: "/admin/applications", icon: FileText, description: "Open approval and review queue." },
      { label: "Open Settings", to: "/admin/settings", icon: Settings, description: "Manage governance controls." },
      { label: "Support Desk", to: "/admin/support", icon: MessageSquare, description: "Track support incidents." },
    ],
    skillcore: [
      { label: "Learning Analytics", to: "/admin/skillcore", icon: GraduationCap, description: "Inspect cohort outcomes." },
      { label: "Talent Pipeline", to: "/admin/talentflow", icon: Target, description: "Review placement progression." },
      { label: "Admin Overview", to: "/admin", icon: Radar, description: "Return to command center." },
    ],
    discovery: [
      { label: "Discovery Dashboard", to: "/admin/discovery", icon: Compass, description: "See retreat and event flow." },
      { label: "Messaging Queue", to: "/admin/messaging", icon: MessageSquare, description: "Handle communication tasks." },
      { label: "Admin Overview", to: "/admin", icon: Radar, description: "Return to command center." },
    ],
    talentflow: [
      { label: "Pipeline Board", to: "/admin/talentflow", icon: Target, description: "Monitor readiness movement." },
      { label: "Talent Table", to: "/admin/talents", icon: Users, description: "Review candidate profiles." },
      { label: "Admin Overview", to: "/admin", icon: Radar, description: "Return to command center." },
    ],
    talent: [
      { label: "Open Jobs", to: "/talent/jobs", icon: Briefcase, description: "Browse and apply to roles." },
      { label: "Learning Plan", to: "/talent/learning", icon: GraduationCap, description: "Continue skill development." },
      { label: "My Applications", to: "/talent/applications", icon: FileText, description: "Track your pipeline status." },
    ],
    company: [
      { label: "Company Jobs", to: "/company/jobs", icon: Briefcase, description: "Manage open job postings." },
      { label: "Talent Pool", to: "/company/talent-pool", icon: Users, description: "Discover and shortlist talent." },
      { label: "Company Messages", to: "/company/messages", icon: MessageSquare, description: "Follow candidate conversations." },
    ],
    applications: [
      { label: "Applications Desk", to: "/admin/applications", icon: FileText, description: "Review incoming applications." },
      { label: "Interview Queue", to: "/admin/interviews", icon: Users, description: "Manage interview scheduling." },
      { label: "Admin Overview", to: "/admin", icon: Radar, description: "Return to command center." },
    ],
    jobs: [
      { label: "Open Roles", to: "/company/jobs", icon: Briefcase, description: "Track all job openings." },
      { label: "Talent Pool", to: "/company/talent-pool", icon: Users, description: "Find matching candidates." },
      { label: "Company Hub", to: "/company", icon: Building2, description: "Return to company overview." },
    ],
    messaging: [
      { label: "Messaging Queue", to: "/admin/messaging", icon: MessageSquare, description: "Handle urgent threads." },
      { label: "Support Desk", to: "/admin/support", icon: Bell, description: "Review escalations." },
      { label: "Admin Overview", to: "/admin", icon: Radar, description: "Return to command center." },
    ],
    workspace: [
      { label: "Open Profile", to: "profile", icon: User, description: "Go to your account profile." },
      { label: "Open Settings", to: "settings", icon: Settings, description: "Adjust workspace preferences." },
      { label: "Go Home", to: "/", icon: Sparkles, description: "Return to main landing page." },
    ],
  };

  return actionMap[contextKey] ?? actionMap.workspace;
}

function getRecentActivity(contextKey: ContextData["key"]): ActivityItem[] {
  const activityMap: Record<ContextData["key"], ActivityItem[]> = {
    admin: [
      { id: "admin-act-1", title: "2 compliance tickets escalated", meta: "6 minutes ago" },
      { id: "admin-act-2", title: "4 company approvals completed", meta: "22 minutes ago" },
      { id: "admin-act-3", title: "Weekly audit digest generated", meta: "1 hour ago" },
    ],
    skillcore: [
      { id: "skillcore-act-1", title: "Cohort B lesson 4 published", meta: "10 minutes ago" },
      { id: "skillcore-act-2", title: "16 certificates issued", meta: "39 minutes ago" },
      { id: "skillcore-act-3", title: "Readiness checkpoint synced", meta: "2 hours ago" },
    ],
    discovery: [
      { id: "discovery-act-1", title: "Retreat campaign hit 75% goal", meta: "9 minutes ago" },
      { id: "discovery-act-2", title: "New partner slot confirmed", meta: "47 minutes ago" },
      { id: "discovery-act-3", title: "Lead quality score updated", meta: "2 hours ago" },
    ],
    talentflow: [
      { id: "talentflow-act-1", title: "11 candidates moved to interview", meta: "12 minutes ago" },
      { id: "talentflow-act-2", title: "3 placements confirmed", meta: "51 minutes ago" },
      { id: "talentflow-act-3", title: "Pipeline health recalculated", meta: "2 hours ago" },
    ],
    talent: [
      { id: "talent-act-1", title: "New recommended role available", meta: "5 minutes ago" },
      { id: "talent-act-2", title: "Coach session reminder sent", meta: "29 minutes ago" },
      { id: "talent-act-3", title: "Learning streak extended", meta: "1 hour ago" },
    ],
    company: [
      { id: "company-act-1", title: "2 candidates added to shortlist", meta: "8 minutes ago" },
      { id: "company-act-2", title: "Offer approval pending manager", meta: "33 minutes ago" },
      { id: "company-act-3", title: "Talent pool synced with new profiles", meta: "2 hours ago" },
    ],
    applications: [
      { id: "applications-act-1", title: "5 applications moved to interview", meta: "13 minutes ago" },
      { id: "applications-act-2", title: "2 profiles missing required fields", meta: "44 minutes ago" },
      { id: "applications-act-3", title: "Decision SLA alert triggered", meta: "2 hours ago" },
    ],
    jobs: [
      { id: "jobs-act-1", title: "SAP BTP role views increased", meta: "17 minutes ago" },
      { id: "jobs-act-2", title: "3 drafts need publishing", meta: "1 hour ago" },
      { id: "jobs-act-3", title: "2 roles reached applicant target", meta: "3 hours ago" },
    ],
    messaging: [
      { id: "messaging-act-1", title: "Urgent thread flagged by support", meta: "4 minutes ago" },
      { id: "messaging-act-2", title: "Template response quality improved", meta: "35 minutes ago" },
      { id: "messaging-act-3", title: "Conversation backlog reduced", meta: "2 hours ago" },
    ],
    workspace: [
      { id: "workspace-act-1", title: "Dashboard widgets synced", meta: "15 minutes ago" },
      { id: "workspace-act-2", title: "Navigation preferences updated", meta: "49 minutes ago" },
      { id: "workspace-act-3", title: "Session remains secure", meta: "2 hours ago" },
    ],
  };

  return activityMap[contextKey] ?? activityMap.workspace;
}

function getOnboardingSteps(contextKey: ContextData["key"]): OnboardingStep[] {
  const stepsMap: Record<ContextData["key"], OnboardingStep[]> = {
    admin: [
      { id: "01", title: "Review command center", detail: "Track governance, support, and approval queues from one admin layer." },
      { id: "02", title: "Use quick actions", detail: "Create fast transitions to settings, support desk, and application review." },
      { id: "03", title: "Run compliance checks", detail: "Open logs and policy controls to keep operations stable." },
    ],
    skillcore: [
      { id: "01", title: "Check cohort metrics", detail: "Watch learner completion and training quality indicators." },
      { id: "02", title: "Watch intervention alerts", detail: "Spot inactive learners and assign follow-up actions." },
      { id: "03", title: "Publish outcomes", detail: "Share completion and certification highlights quickly." },
    ],
    discovery: [
      { id: "01", title: "Track campaign demand", detail: "Monitor lead and event momentum for premium programs." },
      { id: "02", title: "Coordinate partners", detail: "Use quick actions to align operations and communications." },
      { id: "03", title: "Review performance", detail: "Use activity and notifications to adjust strategy quickly." },
    ],
    talentflow: [
      { id: "01", title: "Follow pipeline moves", detail: "See readiness shifts and interview progression in real time." },
      { id: "02", title: "Prioritize actions", detail: "Use pinned links to jump to talent and interview pages." },
      { id: "03", title: "Close placement loops", detail: "Keep response times low and conversion high." },
    ],
    talent: [
      { id: "01", title: "Open your learning hub", detail: "Track progress and continue your roadmap milestones." },
      { id: "02", title: "Use command search", detail: "Jump to jobs, applications, and profile settings with Ctrl+K." },
      { id: "03", title: "Stay updated", detail: "Check notifications for new opportunities and coaching reminders." },
    ],
    company: [
      { id: "01", title: "Set hiring priorities", detail: "Pin jobs and talent pool pages for faster navigation." },
      { id: "02", title: "Use saved filters", detail: "Talent pool filters persist automatically for your next session." },
      { id: "03", title: "Review candidate flow", detail: "Keep shortlist and interview activity visible from dashboard." },
    ],
    applications: [
      { id: "01", title: "Triage applications", detail: "Focus pending and SLA-risk candidates first." },
      { id: "02", title: "Pin review routes", detail: "Save high-frequency pages for one-click access." },
      { id: "03", title: "Watch activity feed", detail: "See decision movement and updates continuously." },
    ],
    jobs: [
      { id: "01", title: "Monitor active roles", detail: "Track role engagement and draft status quickly." },
      { id: "02", title: "Jump to talent pool", detail: "Move from job demand to candidate discovery in one click." },
      { id: "03", title: "Use quick actions", detail: "Speed up recurring hiring operations." },
    ],
    messaging: [
      { id: "01", title: "Prioritize urgent threads", detail: "Unread and escalated conversations are surfaced in notifications." },
      { id: "02", title: "Use command palette", detail: "Navigate to support and queue pages without leaving context." },
      { id: "03", title: "Keep communication healthy", detail: "Watch activity signals and response patterns." },
    ],
    workspace: [
      { id: "01", title: "Discover your dashboard", detail: "Use the header cards and quick actions for fast orientation." },
      { id: "02", title: "Pin your frequent pages", detail: "Build a personalized navigation rail from command palette." },
      { id: "03", title: "Stay in control", detail: "Notifications and activity feed keep your daily workflow focused." },
    ],
  };

  return stepsMap[contextKey] ?? stepsMap.workspace;
}
