import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    MoreVertical,
    Search,
    Filter,
    Download,
    Cpu,
    User,
    Users,
    ChevronDown,
    ChevronUp,
    Star,
    Save,
    TrendingUp,
    PieChart as PieChartIcon,
    BarChart3,
    Eye,
    Check,
    X,
    Mail,
    Calendar as CalendarIcon,
    Activity,
    Trash2,
    FileJson,
    Settings,
    Shield,
    Lock,
    Unlock,
    History,
    Info,
    Loader2
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { AdminMessagingQueue } from "./components/AdminMessagingQueue";
import { AuditLogViewer } from "./components/AuditLogViewer";
import { AdminReferralAnalytics } from "./components/AdminReferralAnalytics";
import { AdminSystemHealth } from "./components/AdminSystemHealth";
import { Application, InterviewRequest } from "@/types";
import { format } from "date-fns";
import { mvpSchema } from "@/integrations/supabase/mvp";


const AdminDashboard = () => {
    const { t, i18n } = useTranslation();
    const isGerman = i18n.language === "de";
    const isArabic = i18n.language === "ar";
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState<Application[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [germanFilter, setGermanFilter] = useState("all");
    const [trackFilter, setTrackFilter] = useState("all");
    const [experienceFilter, setExperienceFilter] = useState("all");

    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeApp, setActiveApp] = useState<Application | null>(null);
    const [isEmployerMode, setIsEmployerMode] = useState(false);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);

    const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
    const [updatingNotes, setUpdatingNotes] = useState<string | null>(null);

    const [activityLogs, setActivityLogs] = useState<any[]>([]);

    // Interview Requests State
    const [interviewRequests, setInterviewRequests] = useState<InterviewRequest[]>([]);
    const [loadingInterviews, setLoadingInterviews] = useState(false);

    const fetchInterviewRequests = useCallback(async () => {
        setLoadingInterviews(true);
        try {
            const { data, error } = await mvpSchema
                .from('interview_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                const tableMissing =
                    error.code === "PGRST205" ||
                    String(error.message || "").includes("interview_requests");

                if (!tableMissing) {
                    console.warn("Interview requests not available:", error);
                }
                return;
            }
            setInterviewRequests(data as any || []);
        } catch (error) {
            console.error("Error fetching interview requests:", error);
        } finally {
            setLoadingInterviews(false);
        }
    }, []);

    const handleInterviewAction = async (id: string, action: 'approved' | 'rejected', applicationId: string) => {
        try {
            // 1. Update Request Status
            const { error } = await mvpSchema
                .from('interview_requests')
                .update({ status: action })
                .eq('id', id);

            if (error) throw error;

            // 2. Update Application/Favorite Status (Optional, keeping in sync)
            if (action === 'approved') {
                // Notify candidate logic would go here (Edge Function)
                toast({ title: "Interview Request Approved", description: "Candidate has been notified." });
            } else {
                toast({ title: "Interview Request Rejected" });
            }

            // Refresh
            fetchInterviewRequests();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Action Failed", description: error.message });
        }
    };

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (error) {
            console.error("Error fetching applications:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load applications."
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchApplications();
        fetchInterviewRequests();
    }, [fetchApplications, fetchInterviewRequests]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Status Updated",
                description: `Application status changed to ${newStatus}.`
            });

            setApplications(prev => prev.map(app =>
                app.id === id ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage
            });
        }
    };

    const saveAdminData = async (id: string, rating: number, notes: string) => {
        setUpdatingNotes(id);
        try {
            const { error } = await supabase
                .from('applications')
                .update({
                    admin_rating: rating,
                    admin_notes: notes,
                    status_message: activeApp.status_message,
                    missing_docs: activeApp.missing_docs,
                    next_steps: activeApp.next_steps
                })
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Information Saved",
                description: "Rating and notes updated for this candidate."
            });

            setApplications(prev => prev.map(app =>
                app.id === id ? { ...app, admin_rating: rating, admin_notes: notes } : app
            ));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: errorMessage
            });
        } finally {
            setUpdatingNotes(null);
        }
    };

    const runAiAnalysis = async (id: string) => {
        setAnalyzingId(id);
        try {
            const { data, error } = await supabase.functions.invoke('extract-skills', {
                body: { applicationId: id }
            });

            if (error) throw error;

            toast({
                title: "AI Analysis Complete",
                description: "Skills and summary have been updated."
            });

            fetchApplications(); // Refresh to see results
        } catch (error) {
            console.error("AI Analysis Error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast({
                variant: "destructive",
                title: "AI Analysis Failed",
                description: errorMessage
            });
        } finally {
            setAnalyzingId(null);
        }
    };

    const getDownloadUrl = async (path: string) => {
        try {
            const { data, error } = await supabase.storage
                .from('application-docs')
                .createSignedUrl(path, 60); // 60 seconds link

            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast({
                variant: "destructive",
                title: "Download Error",
                description: errorMessage
            });
        }
    };

    const fetchActivityLogs = async (id: string) => {
        try {
            const { data, error } = await mvpSchema
                .from('application_activity_logs')
                .select('*')
                .eq('application_id', id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setActivityLogs(data || []);
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    };

    useEffect(() => {
        if (activeApp?.id && drawerOpen) {
            fetchActivityLogs(activeApp.id);
        }
    }, [activeApp, drawerOpen]);
    const filteredApplications = applications.filter(app => {
        const matchesSearch =
            app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.course_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || app.status === statusFilter;
        const matchesType = typeFilter === "all" || app.type === typeFilter;
        const matchesGerman = germanFilter === "all" || app.german_level === germanFilter;
        const matchesTrack = trackFilter === "all" || app.sap_track === trackFilter;
        const matchesExperience = experienceFilter === "all" || (
            experienceFilter === "junior" ? (app.experience_years || 0) < 3 :
                experienceFilter === "mid" ? (app.experience_years || 0) >= 3 && (app.experience_years || 0) < 6 :
                    experienceFilter === "senior" ? (app.experience_years || 0) >= 6 : true
        );

        return matchesSearch && matchesStatus && matchesType && matchesGerman && matchesTrack && matchesExperience;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
            case 'accepted':
                return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">{isGerman ? "Akzeptiert" : isArabic ? "مقبول" : "Approved"}</Badge>;
            case 'rejected':
                return <Badge variant="destructive">{isGerman ? "Abgelehnt" : isArabic ? "مرفوض" : "Rejected"}</Badge>;
            case 'reviewed':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">{isGerman ? "Überprüft" : isArabic ? "تمت المراجعة" : "Reviewed"}</Badge>;
            case 'pending':
            default:
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{isGerman ? "Ausstehend" : isArabic ? "قيد الانتظار" : "Pending"}</Badge>;
        }
    };

    const stats = {
        total: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        reviewed: applications.filter(app => app.status === 'reviewed').length,
        accepted: applications.filter(app => app.status === 'accepted' || app.status === 'approved').length,
    };

    // Prepare data for charts
    const statusData = [
        { name: 'Pending', value: stats.pending, color: '#EAB308' },
        { name: 'Reviewed', value: stats.reviewed, color: '#3B82F6' },
        { name: 'Accepted', value: stats.accepted, color: '#22C55E' },
        { name: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: '#EF4444' }
    ].filter(d => d.value > 0);

    // Group by Date for Trend
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const trendData = last7Days.map(date => ({
        name: date.split('-').slice(1).join('/'),
        count: applications.filter(a => a.created_at.startsWith(date)).length
    }));

    // Group by Course
    const courseCounts: Record<string, number> = {};
    applications.forEach(a => {
        const name = a.type === 'talent_pool_registration' ? 'Talent Pool' : (a.course_name || 'Other');
        courseCounts[name] = (courseCounts[name] || 0) + 1;
    });

    const courseData = Object.entries(courseCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    return (
        <div className={`space-y-6 ${isArabic ? "rtl" : "ltr"}`} dir={isArabic ? "rtl" : "ltr"}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{isGerman ? "Gesamt Apps" : isArabic ? "مجموع الطلبات" : "Total Apps"}</p>
                                <h3 className="text-2xl font-bold">{stats.total}</h3>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-500/5 border-yellow-500/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{isGerman ? "Ausstehend" : isArabic ? "قيد الانتظار" : "Pending"}</p>
                                <h3 className="text-2xl font-bold">{stats.pending}</h3>
                            </div>
                            <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-600">
                                <Clock className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{isGerman ? "KI-Überprüft" : isArabic ? "مراجعة الذكاء" : "AI Reviewed"}</p>
                                <h3 className="text-2xl font-bold">{stats.reviewed}</h3>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-full text-blue-600">
                                <Cpu className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/5 border-green-500/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{isGerman ? "Akzeptiert" : isArabic ? "المقبولين" : "Accepted"}</p>
                                <h3 className="text-2xl font-bold">{stats.accepted}</h3>
                            </div>
                            <div className="p-2 bg-green-500/10 rounded-full text-green-600">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <PieChartIcon className="h-4 w-4 text-primary" /> {isGerman ? "Statusverteilung" : isArabic ? "توزيع الحالة" : "Status Distribution"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" /> {isGerman ? "Trend (Letzte 7 Tage)" : isArabic ? "الاتجاه (آخر 7 أيام)" : "Trend (Last 7 Days)"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#1D4ED8" strokeWidth={3} dot={{ r: 4, fill: '#1D4ED8' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" /> {isGerman ? "Interessengebiete" : isArabic ? "مجالات الاهتمام" : "Interest Areas"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={courseData} layout="vertical" margin={{ left: -10 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" fontSize={10} width={80} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#F1F5F9' }} />
                                    <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={15} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>



            <Tabs defaultValue="applications" className="w-full">
                <TabsList className="grid grid-cols-6 mb-6">
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                    <TabsTrigger value="interviews">Interviews</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="growth">
                        <TrendingUp className="h-3 w-3 mr-1.5" /> Growth
                    </TabsTrigger>
                    <TabsTrigger value="compliance">
                        <Shield className="h-3 w-3 mr-1.5" /> Compliance
                    </TabsTrigger>
                    <TabsTrigger value="health">
                        <Activity className="h-3 w-3 mr-1.5" /> Health
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="growth" className="space-y-4">
                    <AdminReferralAnalytics />
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                    <AdminSystemHealth />
                </TabsContent>

                <TabsContent value="applications">
                    <Card className="border-0 shadow-elegant">
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-heading font-bold">{isGerman ? "Admin-Dashboard" : isArabic ? "لوحة تحكم المسؤول" : "Bridging Admin Dashboard"}</CardTitle>
                                    <CardDescription>{isGerman ? "Bewerbungen überwachen und Dokumente verwalten" : isArabic ? "مراقبة الطلبات وإدارة الوثائق" : "Monitor applications and manage documents"}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative mr-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder={isGerman ? "Bewerber suchen..." : isArabic ? "البحث عن مرشحين..." : "Search applicants..."}
                                            className="pl-9 w-[150px] md:w-[200px] h-9"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-9 gap-2">
                                                <Filter className="h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    {typeFilter === "all" ? (isGerman ? "Alle Typen" : isArabic ? "كل الأنواع" : "All Types") : typeFilter === "talent_pool_registration" ? (isGerman ? "Talentpool" : isArabic ? "مجمع المواهب" : "Talent Pool") : (isGerman ? "Kursbewerbungen" : isArabic ? "طلبات الدورات" : "Course Apps")}
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={() => setTypeFilter("all")}>{isGerman ? "Alle Typen" : isArabic ? "كل الأنواع" : "All Types"}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTypeFilter("course_application")}>{isGerman ? "Kursbewerbungen" : isArabic ? "طلبات الدورات" : "Course Apps"}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTypeFilter("talent_pool_registration")}>{isGerman ? "Talentpool" : isArabic ? "مجمع المواهب" : "Talent Pool"}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-9 gap-2">
                                                <Filter className="h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    {isGerman ? (statusFilter === 'all' ? "Alle Status" : statusFilter) : isArabic ? (statusFilter === 'all' ? "كل الحالات" : statusFilter) : (statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1))}
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={() => setStatusFilter("all")}>{isGerman ? "Alle Status" : isArabic ? "كل الحالات" : "All Status"}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>{isGerman ? "Ausstehend" : isArabic ? "قيد الانتظار" : "Pending"}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setStatusFilter("reviewed")}>{isGerman ? "Überprüft" : isArabic ? "تمت المراجعة" : "Reviewed"}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setStatusFilter("contacted")}>{isGerman ? "Kontaktiert" : isArabic ? "تم الاتصال" : "Contacted"}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setStatusFilter("accepted")}>{isGerman ? "Akzeptiert" : isArabic ? "مقبول" : "Accepted"}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>{isGerman ? "Abgelehnt" : isArabic ? "مرفوض" : "Rejected"}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={fetchApplications}>
                                        <Clock className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    </Button>

                                    <Separator orientation="vertical" className="h-6 mx-1" />

                                    <div className="flex bg-muted p-1 rounded-lg">
                                        <Button
                                            variant={!isEmployerMode ? "secondary" : "ghost"}
                                            size="sm"
                                            className="h-7 text-[10px] px-3"
                                            onClick={() => setIsEmployerMode(false)}
                                        >
                                            <Shield className={`h-3 w-3 ${isArabic ? "ml-1" : "mr-1"}`} /> {isGerman ? "Admin" : isArabic ? "مسؤول" : "Admin"}
                                        </Button>
                                        <Button
                                            variant={isEmployerMode ? "secondary" : "ghost"}
                                            size="sm"
                                            className="h-7 text-[10px] px-3"
                                            onClick={() => setIsEmployerMode(true)}
                                        >
                                            <Users className={`h-3 w-3 ${isArabic ? "ml-1" : "mr-1"}`} /> {isGerman ? "Arbeitgeber" : isArabic ? "صاحب عمل" : "Employer"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Filters Row */}
                            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-dashed">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{isGerman ? "Filter:" : isArabic ? "تصفية:" : "Filters:"}</span>
                                </div>

                                <Select value={germanFilter} onValueChange={setGermanFilter}>
                                    <SelectTrigger className="h-8 w-[120px] text-xs">
                                        <SelectValue placeholder="German Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All levels</SelectItem>
                                        <SelectItem value="A2">A2</SelectItem>
                                        <SelectItem value="B1">B1</SelectItem>
                                        <SelectItem value="B2">B2</SelectItem>
                                        <SelectItem value="C1">C1</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={trackFilter} onValueChange={setTrackFilter}>
                                    <SelectTrigger className="h-8 w-[120px] text-xs">
                                        <SelectValue placeholder="SAP Track" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tracks</SelectItem>
                                        <SelectItem value="FI">Financial (FI)</SelectItem>
                                        <SelectItem value="MM">Materials (MM)</SelectItem>
                                        <SelectItem value="SD">Sales (SD)</SelectItem>
                                        <SelectItem value="BTP">Platform (BTP)</SelectItem>
                                        <SelectItem value="ABAP">Dev (ABAP)</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                                    <SelectTrigger className="h-8 w-[120px] text-xs">
                                        <SelectValue placeholder="Experience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any Exp.</SelectItem>
                                        <SelectItem value="junior">Junior (&lt; 3y)</SelectItem>
                                        <SelectItem value="mid">Mid (3-6y)</SelectItem>
                                        <SelectItem value="senior">Senior (6y+)</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs text-muted-foreground hover:text-primary"
                                    onClick={() => {
                                        setGermanFilter("all");
                                        setTrackFilter("all");
                                        setExperienceFilter("all");
                                        setStatusFilter("all");
                                        setTypeFilter("all");
                                        setSearchTerm("");
                                    }}
                                >
                                    {isGerman ? "Alle zurücksetzen" : isArabic ? "إعادة تعيين الكل" : "Reset All"}
                                </Button>
                            </div>

                            {/* Bulk Actions Bar */}
                            {selectedApps.length > 0 && (
                                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3 mt-4 animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary">{selectedApps.length} {isGerman ? "Ausgewählt" : isArabic ? "محدد" : "Selected"}</Badge>
                                        <span className="text-xs font-medium">{isGerman ? "Massenaktionen:" : isArabic ? "إجراءات جماعية:" : "Bulk Actions:"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" className="h-8 text-[10px] gap-1 text-green-600 border-green-200">
                                            <Check className="h-3 w-3" /> {isGerman ? "Alle genehmigen" : isArabic ? "قبول الكل" : "Approve All"}
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 text-[10px] gap-1 text-destructive border-red-200">
                                            <X className="h-3 w-3" /> {isGerman ? "Alle ablehnen" : isArabic ? "رفض الكل" : "Reject All"}
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 text-[10px] gap-1">
                                            <FileJson className="h-3 w-3" /> {isGerman ? "Auswahl exportieren" : isArabic ? "تصدير المحدد" : "Export Selection"}
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-8 text-[10px]" onClick={() => setSelectedApps([])}>
                                            {isGerman ? "Abbrechen" : isArabic ? "إلغاء" : "Cancel"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={selectedApps.length === filteredApplications.length && filteredApplications.length > 0}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setSelectedApps(filteredApplications.map(a => a.id));
                                                        else setSelectedApps([]);
                                                    }}
                                                />
                                            </TableHead>
                                            <TableHead>{isGerman ? "Bewerber" : isArabic ? "اسم المرشح" : "Applicant"}</TableHead>
                                            <TableHead>{isGerman ? "Details" : isArabic ? "التفاصيل" : "Details"}</TableHead>
                                            <TableHead>{isGerman ? "Dokumente" : isArabic ? "الوثائق" : "Documents"}</TableHead>
                                            <TableHead>{isGerman ? "Status" : isArabic ? "الحالة" : "Status"}</TableHead>
                                            <TableHead className="text-right">{isGerman ? "Schnellaktionen" : isArabic ? "إجراءات سريعة" : "Quick Actions"}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-10">
                                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                                    {isGerman ? "Anwendungen werden geladen..." : isArabic ? "جارٍ تحميل الطلبات..." : "Loading applications..."}
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredApplications.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                                    {isGerman ? "Keine Bewerbungen gefunden." : isArabic ? "لم يتم العثور على طلبات." : "No applications found."}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredApplications.map((app) => (
                                                <TableRow key={app.id} className="group hover:bg-muted/50 transition-colors">
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedApps.includes(app.id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) setSelectedApps(prev => [...prev, app.id]);
                                                                else setSelectedApps(prev => prev.filter(id => id !== app.id));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm">{app.name}</span>
                                                            <span className="text-[10px] text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1">
                                                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 py-0">
                                                                    {app.sap_track || 'No Track'}
                                                                </Badge>
                                                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 py-0 bg-blue-50/50">
                                                                    {app.german_level || 'No German'}
                                                                </Badge>
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                                                {app.type === 'talent_pool_registration' ? 'Talent Pool' : app.course_name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            {app.cv_path && (
                                                                <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" title="CV" onClick={() => getDownloadUrl(app.cv_path)}>
                                                                    <FileText className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                            {app.passport_path && (
                                                                <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" title="Passport" onClick={() => getDownloadUrl(app.passport_path)}>
                                                                    <User className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(app.status)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                onClick={() => {
                                                                    setActiveApp(app);
                                                                    setDrawerOpen(true);
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => updateStatus(app.id, 'approved')}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => updateStatus(app.id, 'rejected')}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => {
                                                                        setActiveApp(app);
                                                                        setDrawerOpen(true);
                                                                    }}>
                                                                        <User className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} /> {isGerman ? "Vollständiges Profil anzeigen" : isArabic ? "عرض الملف الشخصي بالكامل" : "View Full Profile"}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <CalendarIcon className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} /> {isGerman ? "Interview planen" : isArabic ? "جدولة مقابلة" : "Schedule Interview"}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Mail className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} /> {isGerman ? "E-Mail senden" : isArabic ? "إرسال بريد إلكتروني" : "Send Email"}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Applicant Profile Drawer */}
                    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                        <SheetContent className="sm:max-w-xl w-full p-0 overflow-hidden flex flex-col">
                            {activeApp && (
                                <>
                                    <div className="bg-primary/5 p-6 border-b">
                                        <SheetHeader className="text-left">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                    {activeApp.type === 'talent_pool_registration' ? (isGerman ? 'Talent Pool' : isArabic ? 'مجمع المواهب' : 'Talent Pool') : (isGerman ? 'Kursbewerbung' : isArabic ? 'طلب دورة' : 'Course Application')}
                                                </Badge>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${star <= (activeApp.admin_rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <SheetTitle className="text-2xl font-bold">{activeApp.name}</SheetTitle>
                                            <SheetDescription className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {activeApp.email}</span>
                                                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {activeApp.phone}</span>
                                            </SheetDescription>
                                        </SheetHeader>
                                    </div>

                                    <ScrollArea className="flex-1 p-6">
                                        <div className="space-y-8 pb-10">
                                            {/* Quick Info Grid */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="p-3 rounded-xl bg-muted/40 border text-center">
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{isGerman ? "Deutsch" : isArabic ? "الألمانية" : "German"}</p>
                                                    <p className="font-semibold">{activeApp.german_level || 'N/A'}</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-muted/40 border text-center">
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{isGerman ? "SAP-Pfad" : isArabic ? "مسار SAP" : "SAP Track"}</p>
                                                    <p className="font-semibold">{activeApp.sap_track || 'N/A'}</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-muted/40 border text-center">
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{isGerman ? "Erfahrung" : isArabic ? "الخبرة" : "Exp. Years"}</p>
                                                    <p className="font-semibold">{activeApp.experience_years || '0'}</p>
                                                </div>
                                            </div>

                                            {/* AI Insights */}
                                            <div className="space-y-4">
                                                <h3 className="font-bold text-sm flex items-center gap-2">
                                                    <Cpu className="h-4 w-4 text-primary" /> {isGerman ? "KI-Analyse & Kompetenzen" : isArabic ? "تحليل الذكاء والمهارات" : "AI Analysis & Skills"}
                                                </h3>
                                                {activeApp.ai_skills ? (
                                                    <div className="space-y-4">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {activeApp.ai_skills.map((s: any, idx: number) => (
                                                                <Badge key={idx} variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                                                                    {s.skill} • {s.level}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 relative">
                                                            <span className="absolute -top-2 left-4 px-2 bg-background text-[10px] font-bold text-primary">SUMMARY</span>
                                                            <p className="text-sm italic text-muted-foreground leading-relaxed">
                                                                "{activeApp.ai_analysis_summary}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 rounded-xl bg-muted/20 border-2 border-dashed">
                                                        <Button size="sm" onClick={() => runAiAnalysis(activeApp.id)} disabled={analyzingId === activeApp.id}>
                                                            {analyzingId === activeApp.id ? <Clock className={`animate-spin h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`} /> : <Cpu className={`h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`} />}
                                                            {isGerman ? "KI-Analyse starten" : isArabic ? "بدء تحليل الذكاء" : "Run AI Analysis"}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <Separator />

                                            {/* Documents */}
                                            {!isEmployerMode && (
                                                <div className="space-y-4">
                                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-primary" /> {isGerman ? "Verifikationsdokumente" : isArabic ? "وثائق التحقق" : "Verification Documents"}
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {activeApp.cv_path && (
                                                            <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => getDownloadUrl(activeApp.cv_path)}>
                                                                <FileText className="h-5 w-5 text-red-500" />
                                                                <div className={`text-${isArabic ? "right" : "left"}`}>
                                                                    <p className="text-xs font-bold">{isGerman ? "Lebenslauf" : isArabic ? "السيرة الذاتية" : "Curriculum Vitae"}</p>
                                                                    <p className="text-[10px] text-muted-foreground">PDF Document</p>
                                                                </div>
                                                            </Button>
                                                        )}
                                                        {activeApp.passport_path && (
                                                            <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => getDownloadUrl(activeApp.passport_path)}>
                                                                <Shield className="h-5 w-5 text-blue-500" />
                                                                <div className={`text-${isArabic ? "right" : "left"}`}>
                                                                    <p className="text-xs font-bold">{isGerman ? "ID / Reisepass" : isArabic ? "الهوية / جواز السفر" : "ID / Passport"}</p>
                                                                    <p className="text-[10px] text-muted-foreground">Private Document</p>
                                                                </div>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <Separator />

                                            {/* Internal Notes */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                                        <History className="h-4 w-4 text-primary" /> {isGerman ? "Interne Notizen" : isArabic ? "ملاحظات داخلية" : "Internal Notes"}
                                                    </h3>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                onClick={() => saveAdminData(activeApp.id, star, adminNotes[activeApp.id] ?? activeApp.admin_notes ?? "")}
                                                            >
                                                                <Star className={`h-4 w-4 ${star <= (activeApp.admin_rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <textarea
                                                        className="w-full h-32 p-3 text-sm rounded-xl bg-muted/40 border focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                                        placeholder="Add your evaluation notes here..."
                                                        value={adminNotes[activeApp.id] ?? activeApp.admin_notes ?? ""}
                                                        onChange={(e) => setAdminNotes(prev => ({ ...prev, [activeApp.id]: e.target.value }))}
                                                    />
                                                    <div className="space-y-4 pt-4 border-t border-dashed">
                                                        <h3 className="font-bold text-sm flex items-center gap-2">
                                                            <Info className="h-4 w-4 text-primary" /> {isGerman ? "Kandidaten-Feedback (Phase 9)" : isArabic ? "ملاحظات المرشح (المرحلة 9)" : "Candidate Feedback (Phase 9)"}
                                                        </h3>

                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className={`text-[10px] font-bold uppercase text-muted-foreground ${isArabic ? "mr-1" : "ml-1"}`}>{isGerman ? "Statusnachricht für Kandidaten" : isArabic ? "رسالة الحالة للمرشح" : "Status Message for Candidate"}</label>
                                                                <Input
                                                                    placeholder={isGerman ? "z.B. Dokumente geprüft..." : isArabic ? "مثلاً: تم التحقق من الوثائق..." : "e.g. Documents verified, board is reviewing..."}
                                                                    value={activeApp.status_message || ""}
                                                                    onChange={(e) => setActiveApp({ ...activeApp, status_message: e.target.value })}
                                                                    className="text-xs h-9"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className={`text-[10px] font-bold uppercase text-muted-foreground ${isArabic ? "mr-1" : "ml-1"}`}>{isGerman ? "Fehlende Dokumente" : isArabic ? "الوثائق المفقودة" : "Missing Documents"}</label>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {['passport', 'cv', 'certificates'].map(doc => (
                                                                        <Badge
                                                                            key={doc}
                                                                            variant={activeApp.missing_docs?.includes(doc) ? "destructive" : "outline"}
                                                                            className="cursor-pointer text-[10px] uppercase font-bold"
                                                                            onClick={() => {
                                                                                const current = activeApp.missing_docs || [];
                                                                                const updated = current.includes(doc)
                                                                                    ? current.filter((d: string) => d !== doc)
                                                                                    : [...current, doc];
                                                                                setActiveApp({ ...activeApp, missing_docs: updated });
                                                                            }}
                                                                        >
                                                                            {doc} {activeApp.missing_docs?.includes(doc) ? "❌" : "✅"}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className={`text-[10px] font-bold uppercase text-muted-foreground ${isArabic ? "mr-1" : "ml-1"}`}>{isGerman ? "Smarte Empfehlung (CTA)" : isArabic ? "توصية ذكية" : "Smart Recommendation (CTA)"}</label>
                                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                                    <Input
                                                                        placeholder="Recommendation text..."
                                                                        value={activeApp.next_steps?.text || ""}
                                                                        onChange={(e) => setActiveApp({
                                                                            ...activeApp,
                                                                            next_steps: { ...(activeApp.next_steps || {}), text: e.target.value }
                                                                        })}
                                                                        className="text-xs h-9"
                                                                    />
                                                                    <Input
                                                                        placeholder="/link-to-course"
                                                                        value={activeApp.next_steps?.link || ""}
                                                                        onChange={(e) => setActiveApp({
                                                                            ...activeApp,
                                                                            next_steps: { ...(activeApp.next_steps || {}), link: e.target.value }
                                                                        })}
                                                                        className="text-xs h-9"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        className="w-full shadow-lg shadow-primary/10 mt-4"
                                                        onClick={() => saveAdminData(activeApp.id, activeApp.admin_rating || 0, adminNotes[activeApp.id] ?? activeApp.admin_notes ?? "")}
                                                        disabled={updatingNotes === activeApp.id}
                                                    >
                                                        {updatingNotes === activeApp.id ? <Clock className={`animate-spin h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`} /> : <Save className={`h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`} />}
                                                        {isGerman ? "Bewertung speichern" : isArabic ? "حفظ التقييم والملاحظات" : "Save Candidate Evaluation & Feedback"}
                                                    </Button>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Activity Timeline */}
                                            <div className="space-y-4">
                                                <h3 className="font-bold text-sm flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-primary" /> {isGerman ? "Aktivitätsverlauf" : isArabic ? "سجل النشاطات" : "Activity History"}
                                                </h3>
                                                <div className={`space-y-4 relative ${isArabic ? "before:right-2" : "before:left-2"} before:absolute before:top-2 before:bottom-2 before:w-0.5 before:bg-muted`}>
                                                    {activityLogs.length > 0 ? activityLogs.map((log, idx) => (
                                                        <div key={idx} className={`relative ${isArabic ? "pr-8" : "pl-8"}`}>
                                                            <div className={`absolute ${isArabic ? "right-0" : "left-0"} top-1 h-4 w-4 rounded-full bg-background border-2 border-primary flex items-center justify-center`}>
                                                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold leading-none">{log.action.replace(/_/g, ' ').toUpperCase()}</span>
                                                                <span className="text-[10px] text-muted-foreground mt-1">{new Date(log.created_at).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="text-center py-4">
                                                            <p className="text-xs text-muted-foreground">{isGerman ? "Noch keine Aktivitäten aufgezeichnet." : isArabic ? "لم يتم تسجيل أي نشاط بعد." : "No activity recorded yet."}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollArea>

                                    {/* Footer Actions */}
                                    <div className="p-6 border-t bg-muted/10 flex gap-3">
                                        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => updateStatus(activeApp.id, 'approved')}>
                                            <Check className={`h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`} /> {isGerman ? "Genehmigen" : isArabic ? "قبول" : "Approve"}
                                        </Button>
                                        <Button className="flex-1" variant="destructive" onClick={() => updateStatus(activeApp.id, 'rejected')}>
                                            <X className={`h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`} /> {isGerman ? "Ablehnen" : isArabic ? "رفض" : "Reject"}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </SheetContent>
                    </Sheet>
                </TabsContent>

                <TabsContent value="interviews">
                    <Card className="border-0 shadow-elegant">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-purple-600" />
                                {isGerman ? "Interviewanfragen" : isArabic ? "طلبات المقابلة" : "Interview Requests"}
                            </CardTitle>
                            <CardDescription>
                                {isGerman ? "Anfragen von Arbeitgebern verwalten" : isArabic ? "إدارة طلبات أصحاب العمل" : "Manage interview requests from employers"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border p-0 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Employer</TableHead>
                                            <TableHead>Candidate</TableHead>
                                            <TableHead>Message</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {interviewRequests.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                    No interview requests found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            interviewRequests.map((req: any) => {
                                                const statusClass =
                                                    req.status === "pending"
                                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                        : req.status === "approved"
                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                            : "bg-red-50 text-red-700 border-red-200";

                                                return (
                                                    <TableRow key={req.id}>
                                                        <TableCell className="font-medium text-xs">{req.employer?.email || "Unknown Employer"}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-xs">{req.application?.name || "Unknown Candidate"}</span>
                                                                <span className="text-[10px] text-muted-foreground">{req.application?.sap_track}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px]">
                                                            <p className="truncate text-xs text-muted-foreground" title={req.notes}>{req.notes || "No message"}</p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={`text-[10px] ${statusClass}`}>
                                                                {req.status?.toUpperCase() || "UNKNOWN"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {req.status === "pending" && (
                                                                <div className="flex justify-end gap-1">
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-7 text-[10px] bg-green-600 hover:bg-green-700"
                                                                        onClick={() => handleInterviewAction(req.id, "approved", req.application_id)}
                                                                    >
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-7 text-[10px] text-red-600 border-red-200 hover:bg-red-50"
                                                                        onClick={() => handleInterviewAction(req.id, "rejected", req.application_id)}
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="messages">
                    <AdminMessagingQueue />
                </TabsContent>

                <TabsContent value="compliance">
                    <AuditLogViewer />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;
