import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
    User, LogOut, Settings, BookOpen, FileText, Loader2,
    CheckCircle2, AlertTriangle, ArrowUpRight,
    Sparkles, Trash2, Clock, Hourglass, Info, Zap, CheckCircle, LayoutDashboard, Target, GraduationCap, Award, Download, Gift,
    Search, Bell, Grid3X3, Moon, Menu, CalendarDays, Briefcase, ClipboardList, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Application, Profile, CourseEnrollment, JobReadyAnalysis } from "@/types";
import { analyzeSkillGap, calculateJobReadyScore } from "@/lib/talentUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SkillGapAnalysis = lazy(() => import("./components/SkillGapAnalysis").then((module) => ({ default: module.SkillGapAnalysis })));
const LearningPath = lazy(() => import("./components/LearningPath").then((module) => ({ default: module.LearningPath })));
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const EmployerDashboard = lazy(() => import("./EmployerDashboard"));
const ProfileSettings = lazy(() => import("./ProfileSettings"));
const ReferralDashboard = lazy(() => import("./components/ReferralDashboard").then((module) => ({ default: module.ReferralDashboard })));

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const isGerman = i18n.language === "de";
    const isArabic = i18n.language === "ar";
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [activeTab, setActiveTab] = useState("courses");
    const [applications, setApplications] = useState<Application[]>([]);
    const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);
    const [applicationToWithdraw, setApplicationToWithdraw] = useState<string | null>(null);
    const [expandedAI, setExpandedAI] = useState<{ [key: string]: boolean }>({});
    const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);

    const tabLoader = (
        <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
    );

    // Derived state for global alerts
    const hasMissingDocs = applications.some(app =>
        app.status !== 'withdrawn' && app.missing_docs && app.missing_docs.length > 0
    );

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!error) {
            setProfile(data);
            if (activeTab === "courses") {
                if (data.role === 'admin') setActiveTab("admin");
                else if (data.role === 'business') setActiveTab("employer");
            }
        }
    };

    const toggleAI = (id: string) => {
        setExpandedAI(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleWithdraw = async (appId: string) => {
        setIsWithdrawing(appId);
        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: 'withdrawn' } as any) // Type assertion might be needed if DB types aren't updated yet
                .eq('id', appId);

            if (error) throw error;
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'withdrawn' } : a));
            toast({
                title: isGerman ? "Bewerbung zurückgezogen" : isArabic ? "تم سحب الطلب" : "Application withdrawn",
                description: isGerman ? "Ihre Bewerbung wurde erfolgreich zurückgezogen." : isArabic ? "تم سحب طلبك بنجاح." : "Your application has been successfully withdrawn."
            });
        } catch (error) {
            console.error("Error withdrawing application:", error);
            toast({ variant: "destructive", title: "Error withdrawing application" });
        } finally {
            setIsWithdrawing(null);
            setApplicationToWithdraw(null);
        }
    };

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            navigate("/");
            toast({
                title: isGerman ? "Abgemeldet" : "Signed out",
                description: isGerman ? "Sie haben sich erfolgreich abgemeldet." : "You have successfully signed out.",
            });
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    useEffect(() => {
        const getData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate("/login");
                    return;
                }

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileData) setProfile(profileData);

                const { data: appsData } = await (supabase as any)
                    .from('applications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (appsData) setApplications(appsData);

                const { data: enrollmentsData, error: enrollmentsError } = await (supabase as any)
                    .from('course_enrollments')
                    .select('*, courses(*)')
                    .eq('user_id', user.id);

                if (enrollmentsError) {
                    const missingEnrollmentsTable =
                        enrollmentsError.code === "PGRST205" ||
                        String(enrollmentsError.message || "").includes("course_enrollments");

                    if (!missingEnrollmentsTable) {
                        throw enrollmentsError;
                    }
                    setEnrollments([]);
                } else if (enrollmentsData) {
                    setEnrollments(enrollmentsData as any);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, [navigate]);


    const talentAnalysis = applications.length > 0 ? analyzeSkillGap(applications[0] as any) : null;
    const jobReadyAnalysis = applications.length > 0 ? calculateJobReadyScore(applications[0] as any, enrollments) : null;
    const jobReadyScore = jobReadyAnalysis?.score;
    const profileId = profile?.id;
    const profileRole = profile?.role;
    const profileJobReadyScore = profile?.job_ready_score;
    const profileJobReadyUpdatedAt = profile?.job_ready_updated_at;

    // Cache Job Ready Score in DB for Employer Visibility
    useEffect(() => {
        const syncScore = async () => {
            if (!profileId || jobReadyScore === undefined || profileRole !== 'talent') return;

            // Only update if score is different or last update was > 24h ago
            const lastUpdate = profileJobReadyUpdatedAt ? new Date(profileJobReadyUpdatedAt).getTime() : 0;
            const now = Date.now();
            const shouldUpdate = profileJobReadyScore !== jobReadyScore || (now - lastUpdate > 24 * 60 * 60 * 1000);

            if (shouldUpdate) {
                console.log("Caching Job Ready Score:", jobReadyScore);
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        job_ready_score: jobReadyScore,
                        job_ready_updated_at: new Date().toISOString()
                    })
                    .eq('id', profileId);

                if (!error) {
                    setProfile(prev => prev ? { ...prev, job_ready_score: jobReadyScore } : null);
                }
            }
        };

        const timer = setTimeout(syncScore, 2000); // Debounce
        return () => clearTimeout(timer);
    }, [jobReadyScore, profileId, profileRole, profileJobReadyScore, profileJobReadyUpdatedAt]);

    const kpis = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending' || a.status === 'reviewed').length,
        accepted: applications.filter(a => a.status === 'approved' || a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        avgTime: "4.2 days"
    };

    const activeApps = applications.filter(a => a.status !== 'withdrawn');

    // Deduplication: Keep only the most recent application per course or type
    const groupedApps = activeApps.filter((app, index, self) =>
        index === self.findIndex((t) => (
            // Match same course OR same special type (talent pool)
            (t.course_slug && t.course_slug === app.course_slug) ||
            (t.type && t.type === app.type && !t.course_slug && !app.course_slug)
        ))
    );

    const stepperLabels = {
        submitted: isGerman ? "Eingereicht" : isArabic ? "تم التقديم" : "Submitted",
        docs: isGerman ? "Unterlagen" : isArabic ? "الوثائق" : "Docs",
        ai: isGerman ? "KI-Analyse" : isArabic ? "تحليل الذكاء" : "AI Review",
        admin: isGerman ? "Vorstand" : isArabic ? "المجلس" : "Board",
        final: isGerman ? "Ergebnis" : isArabic ? "النتيجة" : "Result"
    };

    const displayRole = profile?.role;
    const tabTriggerBase = "h-9 rounded-md px-3 text-xs font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm";
    const [workspaceView, setWorkspaceView] = useState<"analytics" | "academy" | "crm" | "calendar" | "kanban" | "users" | "referrals" | "admin">("analytics");
    const quickStats = [
        { label: "ACTIVE PROJECTS", value: Math.max(activeApps.length, 1), helper: "Projects this month", delta: "+5.02%", up: true, icon: Briefcase },
        { label: "NEW LEADS", value: Math.max(kpis.pending * 3, 6), helper: "Leads this month", delta: "+3.58%", up: true, icon: Users },
        { label: "TOTAL HOURS", value: `${Math.max(activeApps.length * 24, 120)}h`, helper: "Work this month", delta: "-10.35%", up: false, icon: Clock },
    ];
    const monthBars = [35, 62, 46, 68, 49, 61, 42, 45, 77, 52, 63, 66];
    const activeBars = [9, 13, 8, 17, 21, 12, 6, 10, 8, 29, 13, 34];
    const scheduleDays = Array.from({ length: 28 }, (_, i) => i + 1);
    const primaryMenu = [
        {
            section: "Dashboards",
            items: [
                { id: "analytics", label: "Analytics", icon: LayoutDashboard },
                ...(displayRole === "admin" || displayRole === "business" ? [{ id: "crm", label: "CRM", icon: Target }] : []),
                { id: "academy", label: "Academy", icon: GraduationCap },
            ]
        },
        {
            section: "Apps",
            items: [
                { id: "calendar", label: "Calendar", icon: CalendarDays },
                { id: "kanban", label: "Kanban", icon: ClipboardList },
                { id: "users", label: "Users", icon: Users },
            ]
        },
        {
            section: "Workspace",
            items: [
                { id: "referrals", label: "Referrals", icon: Gift },
                ...(displayRole === "admin" ? [{ id: "admin", label: "Admin Panel", icon: Settings }] : []),
            ]
        }
    ] as const;

    const viewTitle = {
        analytics: "Analytics Dashboard",
        academy: "Academy Workspace",
        crm: "CRM Dashboard",
        calendar: "Calendar",
        kanban: "Kanban Board",
        users: "Users & Settings",
        referrals: "Referral Center",
        admin: "Admin Operations",
    }[workspaceView];

    useEffect(() => {
        if (workspaceView === "academy") setActiveTab("courses");
        if (workspaceView === "crm" && (displayRole === "admin" || displayRole === "business")) setActiveTab("employer");
        if (workspaceView === "users") setActiveTab("settings");
        if (workspaceView === "referrals") setActiveTab("referrals");
        if (workspaceView === "admin" && displayRole === "admin") setActiveTab("admin");
    }, [workspaceView, displayRole]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-[#f3f3f9] font-sans ${isArabic ? "rtl" : "ltr"}`} dir={isArabic ? "rtl" : "ltr"}>
            <div className="flex min-h-screen">
                <aside className="hidden w-[250px] border-r border-slate-200 bg-[#f8f9fb] xl:flex xl:flex-col">
                    <div className="flex h-16 items-center border-b border-slate-200 px-6">
                        <p className="text-2xl font-black tracking-tight text-slate-700">bridging</p>
                    </div>
                    <div className="space-y-5 px-4 py-4">
                        {primaryMenu.map((section) => (
                            <div key={section.section}>
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{section.section}</p>
                                <div className="space-y-1">
                                    {section.items.map((item) => (
                                        <button
                                            key={item.id}
                                            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${workspaceView === item.id ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-100"}`}
                                            type="button"
                                            onClick={() => setWorkspaceView(item.id)}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                            {item.id === "analytics" ? <Badge className="ml-auto h-5 bg-primary px-1.5 text-[10px]">Live</Badge> : null}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                            <p className="text-xs font-semibold text-slate-700">Workspace</p>
                            <p className="mt-1 text-[11px] text-slate-500">Your modules are organized by your account role.</p>
                        </div>
                    </div>
                </aside>

                <div className="flex flex-1 flex-col">
                    <header className="sticky top-0 z-30 border-b border-slate-700 bg-slate-800">
                        <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
                            <div className="flex items-center gap-3">
                                <Button size="icon" variant="ghost" className="text-slate-200 hover:bg-slate-700 hover:text-white">
                                    <Menu className="h-4 w-4" />
                                </Button>
                                <div className="hidden items-center rounded-md bg-slate-700/80 px-3 sm:flex">
                                    <Search className="h-4 w-4 text-slate-400" />
                                    <input
                                        readOnly
                                        value="Search..."
                                        className="h-9 w-52 bg-transparent pl-2 text-sm text-slate-200 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-slate-200">
                                <Button size="icon" variant="ghost" className="hover:bg-slate-700"><Grid3X3 className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" className="hover:bg-slate-700"><Moon className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" className="relative hover:bg-slate-700">
                                    <Bell className="h-4 w-4" />
                                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-secondary" />
                                </Button>
                                <div className="ml-2 hidden items-center gap-2 sm:flex">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={profile?.avatar_url} />
                                        <AvatarFallback>{profile?.first_name?.[0]}{profile?.last_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="leading-tight">
                                        <p className="text-xs font-semibold text-white">{profile?.first_name} {profile?.last_name}</p>
                                        <p className="text-[11px] text-slate-400">Founder</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="space-y-6 p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-[0.08em] text-slate-700">{viewTitle}</h2>
                                <p className="text-xs text-slate-400">Dashboards / {viewTitle}</p>
                            </div>
                            <div className="hidden items-center gap-2 lg:flex">
                                <Button size="sm" variant="outline" onClick={() => setWorkspaceView("academy")}>Academy</Button>
                                {(displayRole === "admin" || displayRole === "business") ? <Button size="sm" variant="outline" onClick={() => setWorkspaceView("crm")}>CRM</Button> : null}
                                <Button size="sm" onClick={() => setWorkspaceView("analytics")}>Analytics</Button>
                            </div>
                        </div>

                        {workspaceView === "analytics" && (
                            <>
                        <div className="grid gap-4 lg:grid-cols-3">
                            {quickStats.map((item) => (
                                <Card key={item.label} className="border-slate-200 shadow-sm">
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                                            <p className="mt-2 text-3xl font-black text-slate-800">{item.value}</p>
                                            <p className="text-xs text-slate-400">{item.helper}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <Badge className={`${item.up ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent-foreground"} px-2 text-[10px]`}>
                                                {item.delta}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Projects Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid gap-2 sm:grid-cols-4">
                                    <div className="rounded-md border bg-slate-50 p-3 text-center"><p className="text-2xl font-black">9,851</p><p className="text-xs text-slate-400">Number of Projects</p></div>
                                    <div className="rounded-md border bg-slate-50 p-3 text-center"><p className="text-2xl font-black">1,026</p><p className="text-xs text-slate-400">Active Projects</p></div>
                                    <div className="rounded-md border bg-slate-50 p-3 text-center"><p className="text-2xl font-black">$228.89k</p><p className="text-xs text-slate-400">Revenue</p></div>
                                    <div className="rounded-md border bg-slate-50 p-3 text-center"><p className="text-2xl font-black text-primary">10,589h</p><p className="text-xs text-slate-400">Working Hours</p></div>
                                </div>
                                <div className="rounded-md border bg-white p-4">
                                    <div className="mb-2 flex items-end gap-2">
                                        {monthBars.map((v, idx) => (
                                            <div key={`m-${idx}`} className="flex h-40 flex-1 items-end gap-1">
                                                <div className="w-full rounded-t bg-primary/80" style={{ height: `${v}%` }} />
                                                <div className="w-full rounded-t bg-secondary/80" style={{ height: `${activeBars[idx]}%` }} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Number of Projects</span>
                                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-secondary" /> Active Projects</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 xl:grid-cols-3">
                            <Card className="border-slate-200 shadow-sm xl:col-span-2">
                                <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle className="text-lg">Upcoming Schedules</CardTitle>
                                    <Badge variant="outline">February 2026</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 grid grid-cols-7 gap-2 text-center text-xs text-slate-400">
                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
                                    </div>
                                    <div className="grid grid-cols-7 gap-2 text-center text-sm">
                                        {scheduleDays.map((d) => (
                                            <div key={d} className={`rounded-md border py-1.5 ${d === 13 ? "bg-primary text-primary-foreground" : "bg-white"}`}>{d}</div>
                                        ))}
                                    </div>
                                    <div className="mt-5 space-y-3">
                                        {[
                                            "Development planning",
                                            "Design new UI and check sales",
                                            "Weekly catch-up",
                                            "Client meeting"
                                        ].map((event, idx) => (
                                            <div key={event} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-secondary/30 text-secondary-foreground flex items-center justify-center text-xs font-bold">{idx + 9}</div>
                                                    <p className="text-sm font-medium text-slate-700">{event}</p>
                                                </div>
                                                <p className="text-xs text-slate-400">{idx + 9}:20 AM</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Team Members</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {groupedApps.slice(0, 6).map((app, idx) => (
                                        <div key={app.id} className="flex items-center justify-between rounded-md border bg-white p-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{idx + 1}</div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-700">{app.course_name || "Project Candidate"}</p>
                                                    <p className="text-[11px] text-slate-400">{app.status}</p>
                                                </div>
                                            </div>
                                            <CalendarDays className="h-4 w-4 text-slate-400" />
                                        </div>
                                    ))}
                                    {groupedApps.length === 0 && <p className="text-sm text-slate-400">No members yet.</p>}
                                </CardContent>
                            </Card>
                        </div>
                        </>
                        )}

                        {workspaceView === "calendar" && (
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle>Upcoming Schedules</CardTitle>
                                    <Badge variant="outline">February 2026</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 grid grid-cols-7 gap-2 text-center text-xs text-slate-400">
                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
                                    </div>
                                    <div className="grid grid-cols-7 gap-2 text-center text-sm">
                                        {scheduleDays.map((d) => (
                                            <div key={d} className={`rounded-md border py-2 ${d === 13 ? "bg-primary text-primary-foreground" : "bg-white"}`}>{d}</div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {workspaceView === "kanban" && (
                            <div className="grid gap-4 lg:grid-cols-3">
                                {[
                                    { key: "reviewed", label: "In Review" },
                                    { key: "approved", label: "Approved" },
                                    { key: "pending", label: "Pending" },
                                ].map((col) => (
                                    <Card key={col.key} className="border-slate-200 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-base">{col.label}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {groupedApps.filter((a) => a.status === col.key || (col.key === "approved" && a.status === "accepted")).slice(0, 4).map((app) => (
                                                <div key={app.id} className="rounded-md border bg-white p-3">
                                                    <p className="text-sm font-semibold text-slate-800">{app.course_name || "Talent Pool"}</p>
                                                    <p className="text-xs text-slate-500">{new Date(app.created_at).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                            {groupedApps.filter((a) => a.status === col.key || (col.key === "approved" && a.status === "accepted")).length === 0 && (
                                                <p className="text-xs text-slate-400">No tasks here.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {workspaceView !== "analytics" && workspaceView !== "calendar" && workspaceView !== "kanban" && (
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Workspace Modules</CardTitle>
                                    <CardDescription>All your old dashboard functionality is still here in tabs.</CardDescription>
                                </div>
                                <div className="hidden items-center gap-2 md:flex">
                                    <Button variant="outline" size="sm" onClick={() => setActiveTab("applications")}><ClipboardList className="mr-2 h-4 w-4" />Applications</Button>
                                    <Button variant="outline" size="sm" onClick={() => setActiveTab("settings")}><Settings className="mr-2 h-4 w-4" />Settings</Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm"><User className="mr-2 h-4 w-4" />Profile</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setActiveTab("settings")}>Edit Profile</DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleSignOut} className="text-primary focus:text-primary">Sign Out</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="mb-4 h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1">
                                        <TabsTrigger value="courses" className={tabTriggerBase}>{isGerman ? "Meine Kurse" : isArabic ? "دوراتي" : "My Courses"}</TabsTrigger>
                                        {(displayRole === 'student' || displayRole === 'user' || displayRole === 'talent' || displayRole === 'admin' || !displayRole) && (
                                            <TabsTrigger value="roadmap" className={`${tabTriggerBase} text-primary`}>
                                                {isGerman ? "Karriere-Roadmap" : isArabic ? "مسار المهني" : "Career Roadmap"}
                                            </TabsTrigger>
                                        )}
                                        <TabsTrigger value="applications" className={tabTriggerBase}>{isGerman ? "Bewerbungen" : isArabic ? "الطلبات" : "Applications"}</TabsTrigger>
                                        <TabsTrigger value="referrals" className={`${tabTriggerBase} text-secondary-foreground data-[state=active]:text-secondary-foreground`}>
                                            <Gift className="h-3 w-3 mr-1.5" />
                                            {isGerman ? "Freunde werben" : isArabic ? "دعوة صديق" : "Referrals"}
                                        </TabsTrigger>
                                        <TabsTrigger value="settings" className={tabTriggerBase}>{isGerman ? "Einstellungen" : isArabic ? "الإعدادات" : "Settings"}</TabsTrigger>
                                        {displayRole === 'admin' && (
                                            <TabsTrigger value="admin" className={`${tabTriggerBase} text-primary`}>{isGerman ? "Verwaltung" : isArabic ? "لوحة الإدارة" : "Admin Panel"}</TabsTrigger>
                                        )}
                                        {(displayRole === 'admin' || displayRole === 'business') && (
                                            <TabsTrigger value="employer" className={`${tabTriggerBase} text-primary`}>{isGerman ? "Talentsuche" : isArabic ? "بحث عن مواهب" : "Talent Search"}</TabsTrigger>
                                        )}
                                    </TabsList>

                                <TabsContent value="courses">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{isGerman ? "Meine Kurse" : isArabic ? "دوراتي" : "My Courses"}</CardTitle>
                                            <CardDescription>{isGerman ? "Kurse, für die Sie eingeschrieben sind." : isArabic ? "الدورات التي أنت مسجل فيها." : "Courses you are enrolled in."}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {enrollments.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {enrollments.map((enr: any) => (
                                                        <Card key={enr.id} className="overflow-hidden border border-primary/10 hover:border-primary/30 transition-all group">
                                                            <CardContent className="p-0">
                                                                <div className="h-2 bg-muted w-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${enr.progress_percent}%` }}
                                                                        className="h-full bg-primary"
                                                                    />
                                                                </div>
                                                                <div className="p-4 space-y-3">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-wider">
                                                                                {enr.courses?.sap_track || "SAP"}
                                                                            </Badge>
                                                                            <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                                                {enr.courses?.title || "Course"}
                                                                            </h4>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <span className="text-2xl font-black text-primary">{enr.progress_percent}%</span>
                                                                        </div>
                                                                    </div>
                                                                    <Button className="w-full gap-2" size="sm" onClick={() => navigate(`/skillcore`)}>
                                                                        <Zap className="h-4 w-4 fill-white" /> {isArabic ? "متابعة التعلم" : "Resume Learning"}
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                                                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                                    <p>{isGerman ? "Sie sind noch in keinen Kurs eingeschrieben." : isArabic ? "لم تسجل في أي دورة بعد." : "You are not enrolled in any courses yet."}</p>
                                                    <Button variant="link" onClick={() => navigate("/skillcore")}>
                                                        {isGerman ? "Kurse entdecken" : isArabic ? "تصفح الدورات" : "Browse Courses"}
                                                    </Button>
                                                </div>
                                            )}

                                            <Separator className="my-8" />

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-bold flex items-center gap-2">
                                                    <Award className="h-5 w-5 text-primary" /> {isArabic ? "الشهادات والاعتمادات" : "Certificates & Credentials"}
                                                </h3>
                                                {enrollments.some(e => e.status === 'completed') ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {enrollments.filter(e => e.status === 'completed').map((enr: any) => (
                                                            <div key={enr.id} className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/20 border border-primary/20 flex items-center justify-between group cursor-pointer hover:shadow-md transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                        <CheckCircle2 className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="font-bold text-slate-900 text-sm line-clamp-1">{enr.courses?.title}</h5>
                                                                        <p className="text-[10px] text-slate-600 uppercase font-medium">{isArabic ? "تاريخ الإنجاز" : "Completed"}: {new Date(enr.completed_at).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-8 rounded-2xl bg-muted/30 border border-dashed border-muted flex flex-col items-center text-center">
                                                        <Award className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                                                        <p className="text-sm text-muted-foreground italic">
                                                            {isArabic ? "أكمل دورة للحصول على شهادة معتمدة." : "Complete a course to earn your official certificate."}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="roadmap">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {talentAnalysis ? (
                                            <>
                                                {/* Job Ready Score Banner */}
                                                <Card className="lg:col-span-2 border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent overflow-hidden relative group">
                                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                                        <Target className="h-32 w-32" />
                                                    </div>
                                                    <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative">
                                                        <div className="relative h-32 w-32 shrink-0">
                                                            <svg className="h-full w-full" viewBox="0 0 36 36">
                                                                <path
                                                                    className="stroke-muted fill-none"
                                                                    strokeWidth="3"
                                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                />
                                                                <motion.path
                                                                    initial={{ strokeDasharray: "0, 100" }}
                                                                    animate={{ strokeDasharray: `${jobReadyAnalysis?.score || 0}, 100` }}
                                                                    className="stroke-primary fill-none"
                                                                    strokeWidth="3"
                                                                    strokeLinecap="round"
                                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                <span className="text-3xl font-black text-primary">{jobReadyAnalysis?.score}%</span>
                                                                <span className="text-[8px] uppercase font-bold text-muted-foreground">{isArabic ? "جاهز للعمل" : "Job Ready"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 text-center md:text-left">
                                                            <h3 className="text-2xl font-bold mb-2">
                                                                {jobReadyAnalysis?.status === 'job_ready' ? (isArabic ? "أنت مستعد تماماً للعمل!" : "You are Job Ready!") :
                                                                    jobReadyAnalysis?.status === 'near_ready' ? (isArabic ? "اقتربت جداً من الجاهزية!" : "So close to being Ready!") :
                                                                        (isArabic ? "اصنع مسارك المهني" : "Build Your Career Journey")}
                                                            </h3>
                                                            <p className="text-muted-foreground mb-4 max-w-lg">
                                                                {isArabic ? "نقوم بتحليل ملفك الشخصي ومهاراتك وتقدمك التعليمي لزيادة فرصك في التوظيف في ألمانيا." :
                                                                    "We analyze your profile, skills, and course progress to increase your employment chances in Germany."}
                                                            </p>
                                                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`h-2 w-2 rounded-full ${jobReadyAnalysis?.breakdown.profile === 40 ? 'bg-secondary' : 'bg-primary/30'}`} />
                                                                    <span className="text-xs font-bold">{isArabic ? "الملف الشخصي" : "Profile"}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`h-2 w-2 rounded-full ${jobReadyAnalysis?.breakdown.skills >= 20 ? 'bg-secondary' : 'bg-primary/30'}`} />
                                                                    <span className="text-xs font-bold">{isArabic ? "المهارات" : "Skills Match"}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`h-2 w-2 rounded-full ${jobReadyAnalysis?.breakdown.education >= 15 ? 'bg-secondary' : 'bg-primary/30'}`} />
                                                                    <span className="text-xs font-bold">{isArabic ? "التعليم" : "Education"}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Suspense fallback={tabLoader}>
                                                    <SkillGapAnalysis analysis={talentAnalysis} />
                                                    <LearningPath
                                                        missingSkills={talentAnalysis.missing}
                                                        track={talentAnalysis.track}
                                                    />
                                                </Suspense>
                                            </>
                                        ) : (
                                            <Card className="lg:col-span-2">
                                                <CardContent className="py-20 text-center">
                                                    <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                                                        <LayoutDashboard className="h-10 w-10 text-primary/30" />
                                                    </div>
                                                    <h3 className="text-xl font-bold mb-2">Roadmap not yet available</h3>
                                                    <p className="text-muted-foreground max-w-md mx-auto">
                                                        Please complete an application or upload your CV first so our AI can analyze your skills and generate a personalized learning path.
                                                    </p>
                                                    <Button className="mt-6" onClick={() => navigate("/skillcore")}>
                                                        Browse SAP Tracks
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="applications">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{isGerman ? "Meine Bewerbungen" : isArabic ? "طلباتي" : "My Applications"}</CardTitle>
                                            <CardDescription>{isGerman ? "Status Ihrer Kursbewerbungen." : isArabic ? "حالة طلباتك للدورات." : "Status of your course applications."}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Global Action Alert */}
                                            {hasMissingDocs && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="p-4 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-between gap-4 shadow-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-secondary/40 flex items-center justify-center text-secondary-foreground">
                                                            <AlertTriangle className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-secondary-foreground text-sm">{isGerman ? "Fehlende Unterlagen" : isArabic ? "وثائق مفقودة" : "Missing Documents"}</h5>
                                                            <p className="text-xs text-slate-700">{isGerman ? "Bitte vervollständigen Sie Ihre Bewerbung für eine schnellere Bearbeitung." : isArabic ? "يرجى استكمال طلبك لمعالجة أسرع." : "Please complete your application for faster processing."}</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="outline" className="border-secondary/60 text-secondary-foreground hover:bg-secondary/20" onClick={() => navigate("/talent-pool")}>
                                                        {isGerman ? "Jetzt hochladen" : isArabic ? "الرفع الآن" : "Upload Now"}
                                                    </Button>
                                                </motion.div>
                                            )}

                                            {/* Summary KPI Box - Premium Redesign */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                {[
                                                    { label: isArabic ? "الإجمالي" : "Total Applications", value: kpis.total, icon: FileText, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20" },
                                                    { label: isArabic ? "قيد المراجعة" : "Under Review", value: kpis.pending, icon: Hourglass, color: "text-secondary-foreground", bg: "bg-secondary/20", border: "border-secondary/40" },
                                                    { label: isArabic ? "طلبات مقبولة" : "Approved Roles", value: kpis.accepted, icon: CheckCircle, color: "text-primary", bg: "bg-primary/10", border: "border-primary/25" },
                                                    { label: isArabic ? "سرعة الاستجابة" : "Avg Response", value: kpis.avgTime, icon: Clock, color: "text-accent-foreground", bg: "bg-accent/20", border: "border-accent/35" },
                                                ].map((kpi, i) => (
                                                    <div key={i} className={`relative p-6 rounded-3xl bg-white border ${kpi.border} shadow-sm overflow-hidden group hover:shadow-md transition-all`}>
                                                        {/* Subtle Gradient Background Overlay */}
                                                        <div className={`absolute top-0 right-0 h-24 w-24 ${kpi.bg} blur-3xl rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150 opacity-60`} />

                                                        <div className="relative flex flex-col gap-4">
                                                            <div className={`h-10 w-10 rounded-xl ${kpi.bg} flex items-center justify-center border ${kpi.border}`}>
                                                                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                                                            </div>
                                                            <div>
                                                                <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{kpi.value}</p>
                                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">{kpi.label}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {groupedApps.length > 0 ? (
                                                <div className="space-y-6">
                                                    {groupedApps.map((app) => (
                                                        <div key={app.id} className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden font-sans">
                                                            {/* Header Section */}
                                                            <div className="p-5 border-b bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="h-12 w-12 rounded-xl bg-white border shadow-sm flex items-center justify-center text-primary">
                                                                        <FileText className="h-6 w-6" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-lg text-slate-900 leading-tight">
                                                                            {app.course_name || app.course_slug || (app.type === 'talent_pool_registration' ? (isGerman ? 'Talentpool Registrierung' : isArabic ? 'تسجيل في مجمع المواهب' : 'Talent Pool Registration') : (isArabic ? 'استفسار فني' : 'Technical Inquiry'))}
                                                                        </h4>
                                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(app.created_at).toLocaleDateString()}</span>
                                                                            <Badge variant="outline" className="text-[10px] h-5 bg-white">{app.type === 'talent_pool_registration' ? (isArabic ? 'موهبة' : 'Talent') : (isArabic ? 'دورة' : 'Course')}</Badge>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <Badge className={`px-3 py-1 font-bold ${app.status === 'accepted' || app.status === 'approved' ? 'bg-primary/10 text-primary hover:bg-primary/10' :
                                                                        app.status === 'rejected' ? 'bg-accent/20 text-accent-foreground hover:bg-accent/20' : 'bg-secondary/25 text-secondary-foreground hover:bg-secondary/25'
                                                                        } `}>
                                                                        {(isGerman ? (
                                                                            app.status === 'pending' ? 'Ausstehend' :
                                                                                app.status === 'approved' || app.status === 'accepted' ? 'Akzeptiert' :
                                                                                    app.status === 'reviewed' ? 'Überprüft' :
                                                                                        app.status === 'rejected' ? 'Abgelehnt' : app.status
                                                                        ) : isArabic ? (
                                                                            app.status === 'pending' ? 'قيد الانتظار' :
                                                                                app.status === 'approved' || app.status === 'accepted' ? 'مقبول' :
                                                                                    app.status === 'reviewed' ? 'تمت المراجعة' :
                                                                                        app.status === 'rejected' ? 'مرفوض' : app.status
                                                                        ) : app.status).toUpperCase()}
                                                                    </Badge>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-slate-400 hover:text-accent-foreground"
                                                                        onClick={() => setApplicationToWithdraw(app.id)}
                                                                        disabled={isWithdrawing === app.id}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="p-6 space-y-6">
                                                                {/* 1. Status Stepper / Timeline */}
                                                                <div className="relative">
                                                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />
                                                                    <div className="relative flex justify-between">
                                                                        {[
                                                                            { id: 'submitted', label: stepperLabels.submitted, done: true },
                                                                            { id: 'docs', label: stepperLabels.docs, done: app.status !== 'pending' },
                                                                            { id: 'ai', label: stepperLabels.ai, done: !!app.ai_skills },
                                                                            { id: 'admin', label: stepperLabels.admin, done: app.status === 'accepted' || app.status === 'rejected' || app.status === 'reviewed' },
                                                                            { id: 'final', label: stepperLabels.final, done: app.status === 'accepted' || app.status === 'rejected' }
                                                                        ].map((step, i) => (
                                                                            <div key={i} className="flex flex-col items-center gap-2 relative z-10 bg-white px-2">
                                                                                <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-colors ${step.done ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-300'} `}>
                                                                                    {step.done ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />}
                                                                                </div>
                                                                                <span className={`text-[9px] font-bold uppercase tracking-tight ${step.done ? 'text-slate-900' : 'text-slate-400'} `}>{step.label}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* 5. Status Support Message */}
                                                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                                                                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-slate-900">{app.status_message || (isGerman ? "Ihre Bewerbung wird derzeit von unserem akademischen Vorstand geprüft." : isArabic ? "طلبك قيد المراجعة حاليًا من قبل مجلسنا الأكاديمي." : "Your application is currently being reviewed by our academic board.")}</p>
                                                                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-bold">{isGerman ? "Aktualisiert:" : isArabic ? "تحديث:" : "Updated:"} {new Date(app.updated_at || app.created_at).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>

                                                                {/* 6. Document Matrix */}
                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                    {[
                                                                        { label: isGerman ? 'Lebenslauf' : isArabic ? 'السيرة الذاتية' : 'CV / Resume', status: 'verified' },
                                                                        { label: isGerman ? 'Reisepass/ID' : isArabic ? 'جواز السفر/الهوية' : 'Passport/ID', status: app.missing_docs?.includes('passport') ? 'missing' : 'verified' },
                                                                        { label: isGerman ? 'Zertifikate' : isArabic ? 'الشهادات' : 'Certificates', status: 'verified' }
                                                                    ].map((doc, i) => (
                                                                        <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm transition-colors hover:bg-white">
                                                                            <span className="text-xs font-bold text-slate-600">{doc.label}</span>
                                                                            {doc.status === 'verified' ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <AlertTriangle className="h-4 w-4 text-secondary-foreground" />}
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* 3. AI Analysis Section */}
                                                                {app.ai_skills && app.ai_skills.length > 0 && (
                                                                    <div className="space-y-4 pt-2 border-t border-slate-100">
                                                                        <div className="flex items-center justify-between">
                                                                            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                                <Sparkles className="h-3 w-3 text-primary" /> {isGerman ? "SkillCore KI-Engine Einblick" : isArabic ? "رؤى محرك SkillCore للذكاء الاصطناعي" : "SkillCore AI Engine Insight"}
                                                                            </h5>
                                                                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-primary hover:bg-primary/5" onClick={() => toggleAI(app.id)}>
                                                                                {expandedAI[app.id] ? (isGerman ? "Bericht einklappen" : isArabic ? "طي التقرير" : "Collapse Report") : (isGerman ? "Vollständigen Bericht anzeigen" : isArabic ? "عرض التقرير الكامل" : "View Full Report")}
                                                                            </Button>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {app.ai_skills.map((skill: any, idx: number) => (
                                                                                <Badge key={idx} variant="outline" className="text-[10px] bg-slate-50 font-bold border-slate-200">
                                                                                    {skill.skill} · {skill.level}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                        <p className={`text-sm text-slate-600 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1 transition-all duration-300 ${expandedAI[app.id] ? "" : "line-clamp-2"} `}>
                                                                            "{app.ai_analysis_summary}"
                                                                        </p>

                                                                        {/* 4. Recommendations CTA Section */}
                                                                        <div className="relative group/cta bg-gradient-to-br from-secondary/20 to-accent/15 rounded-2xl p-5 border border-secondary/40 shadow-sm overflow-hidden mt-6">
                                                                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                                                                <ArrowUpRight className="h-16 w-16" />
                                                                            </div>
                                                                            <div className="flex items-start gap-4">
                                                                                <div className="h-10 w-10 rounded-2xl bg-secondary/40 flex items-center justify-center text-secondary-foreground shrink-0 shadow-inner">
                                                                                    <Zap className="h-5 w-5 fill-secondary-foreground" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <h6 className="text-sm font-bold text-secondary-foreground tracking-tight">{isGerman ? "Smarte Karriereempfehlung" : isArabic ? "توصية مهنية ذكية" : "Smart Career Recommendation"}</h6>
                                                                                    <p className="text-xs text-slate-700 mt-1 leading-normal font-medium max-w-lg">
                                                                                        {app.next_steps?.text || (app.status_message?.includes('German') ?
                                                                                            (isGerman ? "Verbessern Sie Ihre Deutschkenntnisse, um mehr Möglichkeiten zu erschließen." : isArabic ? "حسن مستواك في اللغة الألمانية لفتح المزيد من الفرص." : "Upgrade your German proficiency to unlock more opportunities in the DACH region.") :
                                                                                            (isGerman ? "Absolvieren Sie den SAP-Grundlagenkurs, um Ihr Profil zu stärken." : isArabic ? "أكمل دورة أساسيات SAP لرفع نقاط ملفك الشخصي." : "Complete the SAP Fundamentals path to increase your Profile Score by 25%."))
                                                                                        }
                                                                                    </p>
                                                                                    <Button
                                                                                        variant="secondary"
                                                                                        className="bg-secondary/40 hover:bg-secondary/55 text-secondary-foreground border-none font-bold text-xs h-8 px-4 mt-3 rounded-lg flex items-center gap-2 group/btn transition-all"
                                                                                        onClick={() => navigate(app.next_steps?.link || "/skillcore")}
                                                                                    >
                                                                                        {isGerman ? "Empfohlenen Pfad erkunden" : isArabic ? "استكشف المسار الموصى به" : "Explore Recommended Track"} <ArrowUpRight className={`h-3 w-3 transition-transform group-hover/btn:-translate-y-0.5 ${isArabic ? "group-hover/btn:-translate-x-0.5" : "group-hover/btn:translate-x-0.5"}`} />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 text-muted-foreground bg-muted/10 rounded-3xl border-2 border-dashed border-slate-200">
                                                    <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border flex items-center justify-center mx-auto mb-4">
                                                        <FileText className="h-8 w-8 opacity-20" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{isGerman ? "Keine Bewerbungen" : isArabic ? "لا توجد طلبات بعد" : "No Applications Yet"}</h3>
                                                    <p className="max-w-xs mx-auto text-sm mb-6">{isGerman ? "Starten Sie Ihre Karriere heute, indem Sie sich für einen Kurs bewerben." : isArabic ? "ابدأ مسارك المهني اليوم بالتقديم في مجمع المواهب أو دورة محددة." : "Start your career journey today by applying to our talent pool or a specific course."}</p>
                                                    <Button className="rounded-xl px-6" onClick={() => navigate("/talent-pool")}>
                                                        {isGerman ? "Jetzt bewerben" : isArabic ? "قدم الآن" : "Apply to Talent Pool"}
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {displayRole === 'admin' && (
                                    <TabsContent value="admin">
                                        <Suspense fallback={tabLoader}>
                                            <AdminDashboard />
                                        </Suspense>
                                    </TabsContent>
                                )}

                                {(displayRole === 'admin' || displayRole === 'business') && (
                                    <TabsContent value="employer">
                                        <Suspense fallback={tabLoader}>
                                            <EmployerDashboard />
                                        </Suspense>
                                    </TabsContent>
                                )}

                                <TabsContent value="referrals">
                                    <Suspense fallback={tabLoader}>
                                        {profile && <ReferralDashboard profile={profile} />}
                                    </Suspense>
                                </TabsContent>

                                <TabsContent value="settings">
                                    <Suspense fallback={tabLoader}>
                                        <ProfileSettings profile={profile} onUpdate={fetchProfile} />
                                    </Suspense>
                                </TabsContent>
                            </Tabs>
                            </CardContent>
                        </Card>
                        )}
                    </main>
                </div>
            </div>

            <AlertDialog open={!!applicationToWithdraw} onOpenChange={(open) => !open && setApplicationToWithdraw(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{isGerman ? "Bewerbung zurückziehen?" : isArabic ? "هل أنت متأكد من سحب الطلب؟" : "Withdraw Application?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {isGerman
                                ? "Sind Sie sicher, dass Sie diese Bewerbung zurückziehen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
                                : isArabic
                                    ? "هل أنت متأكد أنك تريد سحب هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
                                    : "Are you sure you want to withdraw this application? This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{isGerman ? "Abbrechen" : isArabic ? "إلغاء" : "Cancel"}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => applicationToWithdraw && handleWithdraw(applicationToWithdraw)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {isGerman ? "Zurückziehen" : isArabic ? "سحب الطلب" : "Withdraw"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Dashboard;
