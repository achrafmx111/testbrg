
import { useState } from "react";
import { useNavigate, Link, useLocation, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  GraduationCap,
  MapPin,
  CheckSquare,
  User,
  Briefcase,
  FileText,
  Users,
  Swords,
  MessageSquare,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  Plane,
  Calculator,
  Shield,
  Crown,
  ChevronDown,
  TrendingUp,
  Globe,
  LayoutTemplate
} from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Define local type for sidebar items with nesting support
type SidebarItem = {
  label: string;
  icon: any;
  to?: string; // Optional if it has children
  children?: SidebarItem[];
  exact?: boolean; // For Home route matching
};

const talentNavGroups: SidebarItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: ".",
    exact: true
  },
  {
    label: "My Learning",
    icon: GraduationCap,
    children: [
      { label: "My Courses", to: "learning", icon: GraduationCap },
      { label: "Interactive Map", to: "roadmap", icon: MapPin },
      { label: "Assessments", to: "assessments", icon: CheckSquare },
    ]
  },
  {
    label: "Career Center",
    icon: Briefcase,
    children: [
      { label: "Job Board", to: "jobs", icon: Briefcase },
      { label: "Applications", to: "applications", icon: FileText },
      { label: "AI CV Analyzer", to: "resume-analysis", icon: FileText },
      { label: "Resume Builder", to: "resume-builder", icon: LayoutTemplate },
      { label: "LinkedIn Optimizer", to: "linkedin-optimizer", icon: TrendingUp },
    ]
  },
  {
    label: "Coaching",
    icon: Users,
    children: [
      { label: "AI Career Coach", to: "coach", icon: Users },
      { label: "Expert Coaching", to: "coaching", icon: User },
    ]
  },
  {
    label: "Community",
    icon: Globe,
    children: [
      { label: "Community Hub", to: "community", icon: Users },
      { label: "Quiz Duel", to: "duel", icon: Swords },
      { label: "XP Shop", to: "shop", icon: ShoppingBag },
      { label: "Alumni Network", to: "alumni", icon: GraduationCap },
    ]
  },
  {
    label: "Relocation",
    icon: Plane,
    children: [
      { label: "Visa Tracker", to: "visa", icon: Plane },
      { label: "Cost of Living", to: "cost-of-living", icon: Calculator },
      { label: "Document Vault", to: "vault", icon: Shield },
    ]
  },
  {
    label: "Account",
    icon: User,
    children: [
      { label: "My Profile", to: "profile", icon: User },
      { label: "Messages", to: "messages", icon: MessageSquare },
      { label: "Upgrade to Pro", to: "pricing", icon: Crown },
    ]
  }
];

export default function TalentLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isInstallable, installApp } = usePWAInstall();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Helper to check if a group is active (any child is active)
  const isGroupActive = (item: SidebarItem) => {
    if (item.to && location.pathname === `/talent/${item.to}`) return true;
    if (item.children) {
      return item.children.some(child =>
        child.to && location.pathname.includes(`/talent/${child.to}`)
      );
    }
    return false;
  };

  // Helper to check if a specific link is active
  const isLinkActive = (to?: string, exact?: boolean) => {
    if (!to) return false;
    const path = `/talent${to === '.' ? '' : '/' + to}`;
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 border-r bg-card/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col shadow-xl md:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center border-b px-6 justify-between bg-muted/20">
          <Link to="/talent" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Bridging</span>
            <span className="text-foreground">Academy</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-6 px-4">
          <nav className="space-y-2">
            {talentNavGroups.map((item, index) => {
              // If it's a single item (like Dashboard)
              if (!item.children) {
                const isActive = isLinkActive(item.to, item.exact);
                return (
                  <Link
                    key={index}
                    to={item.to || "#"}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground/70")} />
                    {item.label}
                  </Link>
                );
              }

              // If it's a group
              const isOpenDefault = isGroupActive(item);

              return (
                <Collapsible
                  key={index}
                  defaultOpen={isOpenDefault}
                  className="group/collapsible space-y-1"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between hover:bg-muted/50 px-3 py-2.5 h-auto font-medium",
                        isOpenDefault ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-muted-foreground/70" />
                        {item.label}
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground/50 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="border-l-2 border-muted pl-4">
                      {item.children.map((child, childIndex) => {
                        const isChildActive = isLinkActive(child.to);
                        return (
                          <Link
                            key={childIndex}
                            to={child.to || "#"}
                            onClick={() => setIsSidebarOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              isChildActive
                                ? "text-primary font-medium bg-primary/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                          >
                            <span className="truncate">{child.label}</span>
                            {child.label === "Upgrade to Pro" && (
                              <Crown className="ml-auto h-3 w-3 text-amber-500" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t p-4 space-y-2 bg-muted/10">
          {isInstallable && (
            <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={installApp}>
              <TrendingUp className="h-4 w-4" />
              Install App
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>

          {/* User Mini Profile */}
          <div className="flex items-center gap-3 pt-4 mt-2 border-t border-border/50">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src="" />
              <AvatarFallback>TB</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-sm font-semibold truncate">Talent User</span>
              <span className="text-xs text-muted-foreground truncate">Free Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/20">
        {/* Mobile Header */}
        <header className="md:hidden flex h-16 items-center gap-4 border-b bg-background px-6 sticky top-0 z-40 shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-bold text-lg">Bridging Academy</span>
        </header>

        <ScrollArea className="flex-1 h-[calc(100vh-4rem)] md:h-screen">
          <div className="container p-4 md:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
