import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeSkillGap } from "@/lib/talentUtils";
import { SkillGapAnalysis } from "./components/SkillGapAnalysis";
import { LearningPath } from "./components/LearningPath";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
    User, LogOut, Settings, BookOpen, FileText, Loader2,
    CheckCircle2, AlertTriangle, ArrowUpRight, LayoutDashboard,
    Sparkles, Trash2, Clock, Hourglass, Info, Zap, CheckCircle, School
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { Application, Profile } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminDashboard from "./AdminDashboard";
import EmployerDashboard from "./EmployerDashboard";
import ProfileSettings from "./ProfileSettings";

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
    const [previewRole, setPreviewRole] = useState<string | null>(null);

    // Derived state for global alerts
    const hasMissingDocs = applications.some(app =>
        app.status !== 'withdrawn' && app.missing_docs && app.missing_docs.length > 0
    );

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
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

                const { data: appsData } = await supabase
                    .from('applications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (appsData) setApplications(appsData);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, [navigate]);

    const talentAnalysis = applications.length > 0 ? analyzeSkillGap(applications[0] as any) : null;

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
        submitted: isGerman ? "Eingereicht" : isArabic ? "تم الإرسال" : "Submitted",
        docs: isGerman ? "Unterlagen geprüft" : isArabic ? "تم التحقق" : "Docs Verified",
        ai: isGerman ? "KI-Analyse" : isArabic ? "تحليل الذكاء" : "AI Review",
        admin: isGerman ? "Board-Prüfung" : isArabic ? "مراجعة اللجنة" : "Board Review",
        final: isGerman ? "Ergebnis" : isArabic ? "النتيجة" : "Result"
    };

    const displayRole = previewRole || profile?.role;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-slate-50 font-sans ${isArabic ? "rtl" : "ltr"}`} dir={isArabic ? "rtl" : "ltr"}>
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <School className="h-5 w-5" />
                        </div>
                        <h1 className="font-bold text-lg tracking-tight text-slate-900 hidden sm:block">
                            {isGerman ? "Kandidatenportal" : isArabic ? "بوابة المرشحين - Bridging" : "Bridging Candidate Portal"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-primary/10 p-1 rounded-lg border border-primary/20 mr-4 shadow-sm">
                            <span className="text-[10px] font-bold text-primary px-2 uppercase">Role Preview:</span>
                            {(['admin', 'business', 'talent'] as const).map((r) => (
                                <Button
                                    key={r}
                                    variant={displayRole === r ? "default" : "ghost"}
                                    size="sm"
                                    className="h-7 text-[10px] px-2 font-bold uppercase transition-all"
                                    onClick={() => setPreviewRole(r)}
                                >
                                    {r}
                                </Button>
                            ))}
                        </div>
                        <span className="text-xs font-medium text-slate-500 hidden sm:inline-block">
                            {isGerman ? "Willkommen zurück" : isArabic ? "مرحباً بعودتك" : "Welcome back"}
                        </span>
                    </div>
                </div>
            </header>
            <div className="container-custom py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Profile Card */}
                    <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card>
                                <CardHeader className="text-center">
                                    <Avatar className="w-24 h-24 mx-auto mb-4">
                                        <AvatarImage src={profile?.avatar_url} />
                                        <AvatarFallback className="text-2xl">
                                            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <CardTitle>{profile?.first_name} {profile?.last_name}</CardTitle>
                                    <CardDescription>{profile?.email}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" className="justify-start" onClick={() => setActiveTab("settings")}>
                                            <User className={`h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`} />
                                            {isGerman ? "Profil bearbeiten" : isArabic ? "تعديل الملف الشخصي" : "Edit Profile"}
                                        </Button>
                                        <Button variant="outline" className="justify-start">
                                            <Settings className={`h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`} />
                                            {isGerman ? "Einstellungen" : isArabic ? "الإعدادات" : "Settings"}
                                        </Button>
                                        <Button variant="destructive" className="justify-start" onClick={handleSignOut}>
                                            <LogOut className={`h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`} />
                                            {isGerman ? "Abmelden" : isArabic ? "تسجيل الخروج" : "Sign Out"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <div className="mb-8">
                                <h1 className="text-3xl font-heading font-bold mb-2">
                                    {isGerman ? `Willkommen, ${profile?.first_name}!` : isArabic ? `مرحباً، ${profile?.first_name}!` : `Welcome, ${profile?.first_name}!`}
                                </h1>
                                <p className="text-muted-foreground">
                                    {isGerman ? "Hier ist Ihr persönlicher Bereich." : isArabic ? "هنا لوحة التحكم الشخصية الخاصة بك." : "Here is your personal dashboard."}
                                </p>
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="courses">{isGerman ? "Meine Kurse" : isArabic ? "دوراتي" : "My Courses"}</TabsTrigger>
                                    {(displayRole === 'student' || displayRole === 'user' || displayRole === 'talent' || displayRole === 'admin' || !displayRole) && (
                                        <TabsTrigger value="roadmap" className="text-primary font-bold">
                                            {isGerman ? "Karriere-Roadmap" : isArabic ? "مسار المهني" : "Career Roadmap"}
                                        </TabsTrigger>
                                    )}
                                    <TabsTrigger value="applications">{isGerman ? "Bewerbungen" : isArabic ? "الطلبات" : "Applications"}</TabsTrigger>
                                    <TabsTrigger value="settings">{isGerman ? "Einstellungen" : isArabic ? "الإعدادات" : "Settings"}</TabsTrigger>
                                    {displayRole === 'admin' && (
                                        <TabsTrigger value="admin" className="text-primary font-bold">{isGerman ? "Verwaltung" : isArabic ? "لوحة الإدارة" : "Admin Panel"}</TabsTrigger>
                                    )}
                                    {(displayRole === 'admin' || displayRole === 'business') && (
                                        <TabsTrigger value="employer" className="text-primary font-bold">{isGerman ? "Talentsuche" : isArabic ? "بحث عن مواهب" : "Talent Search"}</TabsTrigger>
                                    )}
                                </TabsList>

                                <TabsContent value="courses">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{isGerman ? "Meine Kurse" : isArabic ? "دوراتي" : "My Courses"}</CardTitle>
                                            <CardDescription>{isGerman ? "Kurse, für die Sie eingeschrieben sind." : isArabic ? "الدورات التي أنت مسجل فيها." : "Courses you are enrolled in."}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                                                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                                <p>{isGerman ? "Sie sind noch in keinen Kurs eingeschrieben." : isArabic ? "لم تسجل في أي دورة بعد." : "You are not enrolled in any courses yet."}</p>
                                                <Button variant="link" onClick={() => navigate("/skillcore")}>
                                                    {isGerman ? "Kurse entdecken" : isArabic ? "تصفح الدورات" : "Browse Courses"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="roadmap">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {talentAnalysis ? (
                                            <>
                                                <SkillGapAnalysis analysis={talentAnalysis} />
                                                <LearningPath
                                                    missingSkills={talentAnalysis.missing}
                                                    track={talentAnalysis.track}
                                                />
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
                                                    className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4 shadow-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                            <AlertTriangle className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-amber-900 text-sm">{isGerman ? "Fehlende Unterlagen" : isArabic ? "وثائق مفقودة" : "Missing Documents"}</h5>
                                                            <p className="text-xs text-amber-700">{isGerman ? "Bitte vervollständigen Sie Ihre Bewerbung für eine schnellere Bearbeitung." : isArabic ? "يرجى استكمال طلبك لمعالجة أسرع." : "Please complete your application for faster processing."}</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100" onClick={() => navigate("/talent-pool")}>
                                                        {isGerman ? "Jetzt hochladen" : isArabic ? "الرفع الآن" : "Upload Now"}
                                                    </Button>
                                                </motion.div>
                                            )}

                                            {/* Summary KPI Box - Premium Redesign */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                {[
                                                    { label: isArabic ? "الإجمالي" : "Total Applications", value: kpis.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50/50", border: "border-blue-100" },
                                                    { label: isArabic ? "قيد المراجعة" : "Under Review", value: kpis.pending, icon: Hourglass, color: "text-amber-600", bg: "bg-amber-50/50", border: "border-amber-100" },
                                                    { label: isArabic ? "طلبات مقبولة" : "Approved Roles", value: kpis.accepted, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50/50", border: "border-green-100" },
                                                    { label: isArabic ? "سرعة الاستجابة" : "Avg Response", value: kpis.avgTime, icon: Clock, color: "text-purple-600", bg: "bg-purple-50/50", border: "border-purple-100" },
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
                                                                    <Badge className={`px-3 py-1 font-bold ${app.status === 'accepted' || app.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                                        app.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-50'
                                                                        }`}>
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
                                                                        className="h-8 w-8 text-slate-400 hover:text-red-500"
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
                                                                                <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-colors ${step.done ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                                                                                    {step.done ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />}
                                                                                </div>
                                                                                <span className={`text-[9px] font-bold uppercase tracking-tight ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</span>
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
                                                                            {doc.status === 'verified' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
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
                                                                        <p className={`text-sm text-slate-600 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1 transition-all duration-300 ${expandedAI[app.id] ? "" : "line-clamp-2"}`}>
                                                                            "{app.ai_analysis_summary}"
                                                                        </p>

                                                                        {/* 4. Recommendations CTA Section */}
                                                                        <div className="relative group/cta bg-gradient-to-br from-amber-50 to-orange-50/30 rounded-2xl p-5 border border-amber-100/50 shadow-sm overflow-hidden mt-6">
                                                                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                                                                <ArrowUpRight className="h-16 w-16" />
                                                                            </div>
                                                                            <div className="flex items-start gap-4">
                                                                                <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
                                                                                    <Zap className="h-5 w-5 fill-amber-500" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <h6 className="text-sm font-bold text-amber-900 tracking-tight">{isGerman ? "Smarte Karriereempfehlung" : isArabic ? "توصية مهنية ذكية" : "Smart Career Recommendation"}</h6>
                                                                                    <p className="text-xs text-amber-800/80 mt-1 leading-normal font-medium max-w-lg">
                                                                                        {app.next_steps?.text || (app.status_message?.includes('German') ?
                                                                                            (isGerman ? "Verbessern Sie Ihre Deutschkenntnisse, um mehr Möglichkeiten zu erschließen." : isArabic ? "حسن مستواك في اللغة الألمانية لفتح المزيد من الفرص." : "Upgrade your German proficiency to unlock more opportunities in the DACH region.") :
                                                                                            (isGerman ? "Absolvieren Sie den SAP-Grundlagenkurs, um Ihr Profil zu stärken." : isArabic ? "أكمل دورة أساسيات SAP لرفع نقاط ملفك الشخصي." : "Complete the SAP Fundamentals path to increase your Profile Score by 25%."))
                                                                                        }
                                                                                    </p>
                                                                                    <Button
                                                                                        variant="secondary"
                                                                                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 border-none font-bold text-xs h-8 px-4 mt-3 rounded-lg flex items-center gap-2 group/btn transition-all"
                                                                                        onClick={() => navigate(app.next_steps?.link || "/skillcore")}
                                                                                    >
                                                                                        {isGerman ? "Empfohlenen Pfad erkunden" : isArabic ? "استكشف المسار الموصى به" : "Explore Recommended Track"} <ArrowUpRight className={`h-3 w-3 transition-transform ${isArabic ? "group-hover/btn:-translate-x-0.5" : "group-hover/btn:translate-x-0.5"} group-hover/btn:-translate-y-0.5`} />
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
                                        <AdminDashboard />
                                    </TabsContent>
                                )}

                                {(displayRole === 'admin' || displayRole === 'business') && (
                                    <TabsContent value="employer">
                                        <EmployerDashboard />
                                    </TabsContent>
                                )}

                                <TabsContent value="settings">
                                    <ProfileSettings profile={profile} onUpdate={fetchProfile} />
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </div>
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
                            className="bg-red-600 hover:bg-red-700 text-white"
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
