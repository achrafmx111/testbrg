import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Building2,
    Star,
    MapPin,
    Briefcase,
    Target,
    Cpu,
    CheckCircle2,
    ArrowRight,
    MessageSquareText,
    Eye,
    Users,
    CalendarDays,
    TrendingUp,
    Clock3
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TalentProfile, EmployerFavorite, ActivityLog } from "@/types";
import { calculateMatchScore, calculateJobReadyScore } from "@/lib/talentUtils";
import { EmployerFilters } from "./components/EmployerFilters";
import { CandidateCard } from "./components/CandidateCard";
import { InterviewRequestModal } from "./components/InterviewRequestModal";
import { RecruitmentMessagingModal } from "./components/RecruitmentMessagingModal";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { mvpSchema } from "@/integrations/supabase/mvp";


type PipelineStage = "shortlisted" | "interview_requested" | "hired" | "rejected";

const pipelineStages: { key: PipelineStage; label: string; tone: string }[] = [
    { key: "shortlisted", label: "Shortlisted", tone: "border-slate-200 bg-slate-50/60" },
    { key: "interview_requested", label: "Interview", tone: "border-blue-200 bg-blue-50/60" },
    { key: "hired", label: "Hired", tone: "border-green-200 bg-green-50/60" },
    { key: "rejected", label: "Rejected", tone: "border-red-200 bg-red-50/60" },
];

const EmployerDashboard = () => {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [talent, setTalent] = useState<TalentProfile[]>([]);
    const [favorites, setFavorites] = useState<{ [key: string]: EmployerFavorite }>({});

    // Advanced Filters
    const [trackFilter, setTrackFilter] = useState("all");
    const [expFilter, setExpFilter] = useState("all");
    const [germanFilter, setGermanFilter] = useState("all");
    const [availFilter, setAvailFilter] = useState("all");
    const [minScore, setMinScore] = useState(0);
    const [showShortlistOnly, setShowShortlistOnly] = useState(false);
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [tempNote, setTempNote] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [viewMode, setViewMode] = useState<"cards" | "kanban">("cards");
    const [pipelineStageFilter, setPipelineStageFilter] = useState("all");
    const [readinessFilter, setReadinessFilter] = useState("all");
    const [supportsPipelineStatus, setSupportsPipelineStatus] = useState(true);
    const [supportsNotes, setSupportsNotes] = useState(true);

    // Phase 8 State
    const [userProfile, setUserProfile] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeTalent, setActiveTalent] = useState<TalentProfile | null>(null);
    const [isRequestingInterview, setIsRequestingInterview] = useState(false);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

    // Interview Modal State
    const [interviewModalOpen, setInterviewModalOpen] = useState(false);
    const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState<TalentProfile | null>(null);

    // Messaging Modal State
    const [messageModalOpen, setMessageModalOpen] = useState(false);
    const [selectedCandidateForMessage, setSelectedCandidateForMessage] = useState<TalentProfile | null>(null);

    const isMissingColumnError = (error: any, column: string) =>
        error?.code === "PGRST204" && String(error?.message || "").includes(`'${column}'`);

    const fetchTalent = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch only talent_pool_registration type
            const { data, error } = await mvpSchema
                .from('applications')
                .select('*')
                .eq('type', 'talent_pool_registration')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTalent((data as any[]) || []);
        } catch (error: any) {
            console.error("Error fetching talent:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load talent pool."
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const fetchUserProfile = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const profile = await mvp.getMyProfile(user.id);
            setUserProfile(profile);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }, []);

    const fetchFavorites = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const data = await mvp.listFavorites(user.id);

            const favMap: { [key: string]: EmployerFavorite } = {};
            (data || []).forEach((f: any) => {
                favMap[f.talent_id] = {
                    talent_id: f.talent_id,
                    employer_id: f.employer_id,
                    notes: f.notes || "",
                    pipeline_status: f.pipeline_status || "shortlisted"
                };
            });

            setSupportsPipelineStatus(true);
            setSupportsNotes(true);
            setFavorites(favMap);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await Promise.all([
                fetchTalent(),
                fetchFavorites(),
                fetchUserProfile()
            ]);
        };
        init();
    }, [fetchTalent, fetchFavorites, fetchUserProfile]);

    const toggleFavorite = async (talentId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({ title: "Please log in", variant: "destructive" });
                return;
            }

            const isNowFav = await mvp.toggleFavorite(user.id, talentId);

            if (isNowFav) {
                setFavorites(prev => ({
                    ...prev,
                    [talentId]: {
                        talent_id: talentId,
                        employer_id: user.id,
                        notes: "",
                        pipeline_status: "shortlisted"
                    }
                }));
                toast({ title: "Added to shortlist" });
            } else {
                setFavorites(prev => {
                    const newFavs = { ...prev };
                    delete newFavs[talentId];
                    return newFavs;
                });
                toast({ title: "Removed from shortlist" });
            }
        } catch (error: any) {
            console.error("Error toggling favorite:", error);
            toast({
                variant: "destructive",
                title: "Action Failed",
                description: error?.message || "Failed to update shortlist."
            });
        }
    };

    const updatePipelineStatus = async (talentId: string, status: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Find favorite record ID
            const favorite = favorites[talentId];
            if (!favorite) return;

            // We need the numeric/UUID ID from the database record, but my mvp call uses talent_id filter
            // Let's refine mvp.updateFavoriteStatus to accept employer_id and talent_id if needed, 
            // but for now I'll fetch the record first or update by composite key.

            const { data: favRecord } = await mvpSchema
                .from('employer_favorites')
                .select('id')
                .eq('employer_id', user.id)
                .eq('talent_id', talentId)
                .maybeSingle();

            if (favRecord) {
                await mvp.updateFavoriteStatus(favRecord.id, status);
            }

            setFavorites(prev => ({
                ...prev,
                [talentId]: { ...prev[talentId], pipeline_status: status }
            }));
            toast({ title: `Status updated to ${status}` });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };


    const handleOpenInterviewModal = (candidate: TalentProfile) => {
        const isGerman = i18n.language === 'de';
        const isAdmin = userProfile?.role === 'admin' || (userProfile as any)?.is_admin === true;
        const plan = (userProfile?.subscription_tier || userProfile?.subscription_plan || "free").toString().toLowerCase();
        const isPremium = ['pro', 'enterprise', 'premium'].includes(plan);

        if (!isAdmin && !isPremium) {
            toast({
                title: isGerman ? "Premium-Funktion" : "Premium Feature",
                description: isGerman
                    ? `Direkte Interview-Anfragen sind in Pro-Plänen verfügbar. (Ihr Status: ${userProfile?.role || 'Guest'} / ${plan})`
                    : `Direct interview requests are available for Pro and Enterprise plans. (Your status: ${userProfile?.role || 'Guest'} / ${plan})`,
                variant: "destructive"
            });
            return;
        }
        setSelectedCandidateForInterview(candidate);
        setInterviewModalOpen(true);
    };

    const handleSendInterviewRequest = async (message: string) => {
        if (!selectedCandidateForInterview) return;
        setIsRequestingInterview(true);
        const applicationId = selectedCandidateForInterview.id;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Create formal request
            const { error: reqError } = await mvpSchema
                .from('interview_requests')
                .insert({
                    employer_id: user.id,
                    application_id: applicationId,
                    status: 'pending',
                    notes: message
                });

            if (reqError) throw reqError;

            // 2. Update pipeline status
            await updatePipelineStatus(applicationId, 'interview_requested');

            // 3. Notify Admin via Edge Function
            await supabase.functions.invoke("send-unified-contact", {
                body: {
                    type: "interview_request",
                    employer_email: user.email,
                    candidate_id: applicationId,
                    message: message
                }
            });

            toast({
                title: "Interview Request Sent",
                description: "Our team has been notified and will coordinate with the candidate."
            });
            setInterviewModalOpen(false);
        } catch (error: any) {
            console.error("Error requesting interview:", error);
            toast({
                variant: "destructive",
                title: "Request Failed",
                description: "You might have already requested an interview for this candidate."
            });
        } finally {
            setIsRequestingInterview(false);
        }
    };

    const handleOpenMessageModal = (candidate: TalentProfile) => {
        if (!favorites[candidate.id]) {
            toast({
                title: "Shortlist required",
                description: "Add this candidate to your shortlist to enable secure messaging.",
                variant: "destructive",
            });
            return;
        }
        setSelectedCandidateForMessage(candidate);
        setMessageModalOpen(true);
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
        } catch (error: any) {
            console.error("Error fetching logs:", error);
        }
    };

    const saveNote = async (talentId: string, note: string) => {
        setIsSavingNote(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Find favorite record ID
            const { data: favRecord } = await mvpSchema
                .from('employer_favorites')
                .select('id')
                .eq('employer_id', user.id)
                .eq('talent_id', talentId)
                .maybeSingle();

            if (favRecord) {
                await mvp.updateFavoriteNote(favRecord.id, note);
            }

            setFavorites(prev => ({
                ...prev,
                [talentId]: { ...prev[talentId], notes: note }
            }));
            setEditingNote(null);
            toast({ title: "Note saved" });
        } catch (error) {
            console.error("Error saving note:", error);
        } finally {
            setIsSavingNote(false);
        }
    };

    const filteredTalent = talent.filter(item => {
        const score = calculateMatchScore(item, {
            track: trackFilter,
            german: germanFilter,
            exp: expFilter,
            avail: availFilter
        });
        if (score < minScore) return false;

        const matchesSearch =
            item.ai_analysis_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.ai_skills?.some((s: any) => s.skill.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesTrack = trackFilter === "all" || item.sap_track === trackFilter;
        const matchesGerman = germanFilter === "all" || (item.german_level && item.german_level >= germanFilter);
        const matchesShortlist = !showShortlistOnly || !!favorites[item.talent_id];
        const matchesPipelineStage =
            !showShortlistOnly ||
            pipelineStageFilter === "all" ||
            (favorites[item.talent_id] && favorites[item.talent_id].pipeline_status === pipelineStageFilter);

        const readiness = calculateJobReadyScore(item);
        const matchesReadiness =
            readinessFilter === "all" ? true :
                readinessFilter === "job_ready_70" ? readiness.score >= 70 :
                    readiness.status === readinessFilter;

        // Attach calculated score to the item for sorting
        item.matchScore = score;
        item.jobReadyScore = readiness.score;

        return matchesSearch && matchesTrack && matchesShortlist && matchesPipelineStage && matchesReadiness;
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    const pipelineCounts = Object.values(favorites).reduce((acc: Record<string, number>, f) => {
        const key = (f.pipeline_status || "shortlisted").toString();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const pipelineTotal = Object.keys(favorites).length;
    const shortlistedCount = pipelineCounts["shortlisted"] || 0;
    const interviewCount = pipelineCounts["interview_requested"] || 0;
    const hiredCount = pipelineCounts["hired"] || 0;
    const rejectedCount = pipelineCounts["rejected"] || 0;

    // Readiness KPI (Phase 7/8 Flywheel)
    const jobReadyCount = talent.filter(t => calculateJobReadyScore(t).score >= 80).length;

    const shortlistedTalent = filteredTalent.filter((candidate) => !!favorites[candidate.talent_id]);
    const topCandidates = filteredTalent.slice(0, 5);
    const kanbanColumns: Record<PipelineStage, TalentProfile[]> = {
        shortlisted: shortlistedTalent.filter((candidate) => (favorites[candidate.talent_id]?.pipeline_status || "shortlisted") === "shortlisted"),
        interview_requested: shortlistedTalent.filter((candidate) => favorites[candidate.talent_id]?.pipeline_status === "interview_requested"),
        hired: shortlistedTalent.filter((candidate) => favorites[candidate.talent_id]?.pipeline_status === "hired"),
        rejected: shortlistedTalent.filter((candidate) => favorites[candidate.talent_id]?.pipeline_status === "rejected"),
    };

    const moveToNextStage = (talentId: string) => {
        const current = favorites[talentId]?.pipeline_status || "shortlisted";
        if (current === "shortlisted") updatePipelineStatus(talentId, "interview_requested");
        if (current === "interview_requested") updatePipelineStatus(talentId, "hired");
    };

    const stageBreakdown = [
        { key: "shortlisted", label: "Shortlisted", count: shortlistedCount, color: "bg-slate-500" },
        { key: "interview_requested", label: "Interviews", count: interviewCount, color: "bg-blue-500" },
        { key: "hired", label: "Hired", count: hiredCount, color: "bg-emerald-500" },
        { key: "rejected", label: "Rejected", count: rejectedCount, color: "bg-rose-500" },
    ] as const;

    const shortlistBase = pipelineTotal || 1;
    const hireConversion = Math.round((hiredCount / shortlistBase) * 100);

    return (
        <div className="space-y-6">
            <Card className="relative overflow-hidden border border-slate-200 bg-gradient-to-br from-primary/10 via-background to-background shadow-sm">
                <div className="pointer-events-none absolute -top-20 -right-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
                <CardContent className="relative p-5 md:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                                <TrendingUp className="h-3.5 w-3.5" /> Recruitment Command Center
                            </div>
                            <div className="text-[11px] font-medium text-slate-500">
                                Dashboard / Talent Search / Employer Workspace
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Talent Search Dashboard</h2>
                            <p className="max-w-2xl text-sm text-muted-foreground">
                                Smart shortlist tracking, pipeline visibility, and faster hiring decisions in one streamlined view.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[460px]">
                            <div className="rounded-xl border border-slate-200 bg-background/95 px-3 py-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Talent Pool</p>
                                <p className="mt-1 text-xl font-black text-slate-900">{talent.length}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-background/95 px-3 py-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Shortlist</p>
                                <p className="mt-1 text-xl font-black text-slate-900">{shortlistedCount}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-background/95 px-3 py-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Interviews</p>
                                <p className="mt-1 text-xl font-black text-slate-900">{interviewCount}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-background/95 px-3 py-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hire Rate</p>
                                <p className="mt-1 text-xl font-black text-primary">{hireConversion}%</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Card className="border border-primary/15 bg-primary/5 shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Job Ready</div>
                        <div className="text-2xl font-black mt-1 text-primary">{jobReadyCount}</div>
                        <div className="text-xs text-primary/80 mt-1">80%+ readiness</div>
                    </CardContent>
                </Card>
                <Card className="border border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shortlisted</div>
                        <div className="text-2xl font-black mt-1">{shortlistedCount}</div>
                        <div className="text-xs text-muted-foreground mt-1">Ready to review</div>
                    </CardContent>
                </Card>
                <Card className="border border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Interviews</div>
                        <div className="text-2xl font-black mt-1">{interviewCount}</div>
                        <div className="text-xs text-muted-foreground mt-1">Requested</div>
                    </CardContent>
                </Card>
                <Card className="border border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hired</div>
                        <div className="text-2xl font-black mt-1">{hiredCount}</div>
                        <div className="text-xs text-muted-foreground mt-1">Successful matches</div>
                    </CardContent>
                </Card>
                <Card className="border border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rejected</div>
                        <div className="text-2xl font-black mt-1">{rejectedCount}</div>
                        <div className="text-xs text-muted-foreground mt-1">Not a fit</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="space-y-4 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                                <Building2 className="h-6 w-6 text-primary" />
                                Talent Marketplace
                            </CardTitle>
                            <CardDescription>Velzon-style workspace adapted to your hiring flow and brand identity.</CardDescription>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                            <Badge variant={viewMode === "cards" ? "default" : "outline"} className="text-[10px]">
                                Candidate Cards
                            </Badge>
                            <Badge variant={viewMode === "kanban" ? "default" : "outline"} className="text-[10px]">
                                Pipeline Kanban
                            </Badge>
                            {showShortlistOnly && (
                                <Badge variant="secondary" className="text-[10px]">
                                    Shortlist Focus
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant={showShortlistOnly ? "default" : "outline"}
                                size="sm"
                                className="h-8 gap-2"
                                onClick={() => {
                                    const next = !showShortlistOnly;
                                    setShowShortlistOnly(next);
                                    if (!next && viewMode === "kanban") {
                                        setViewMode("cards");
                                    }
                                }}
                            >
                                <Star className={`h-4 w-4 ${showShortlistOnly ? "fill-white" : ""}`} />
                                Shortlist {Object.keys(favorites).length > 0 && `(${Object.keys(favorites).length})`}
                            </Button>

                            <Select value={readinessFilter} onValueChange={setReadinessFilter}>
                                <SelectTrigger className="h-8 w-[160px] bg-white">
                                    <SelectValue placeholder="Readiness Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Readiness</SelectItem>
                                    <SelectItem value="job_ready_70">Job Ready (70%+)</SelectItem>
                                    <SelectItem value="job_ready">Job Ready (80%+)</SelectItem>
                                    <SelectItem value="near_ready">Near Ready (50-79%)</SelectItem>
                                    <SelectItem value="learning">Learning (Under 50%)</SelectItem>
                                </SelectContent>
                            </Select>

                            {showShortlistOnly && (
                                <Select value={pipelineStageFilter} onValueChange={setPipelineStageFilter}>
                                    <SelectTrigger className="h-8 w-[200px] bg-white">
                                        <SelectValue placeholder="Pipeline stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All stages</SelectItem>
                                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                        <SelectItem value="interview_requested">Interview requested</SelectItem>
                                        <SelectItem value="hired">Hired</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            <div className="flex items-center rounded-md border bg-white p-1">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={viewMode === "cards" ? "default" : "ghost"}
                                    className="h-7 px-2"
                                    onClick={() => setViewMode("cards")}
                                >
                                    Cards
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={viewMode === "kanban" ? "default" : "ghost"}
                                    className="h-7 px-2"
                                    onClick={() => {
                                        setShowShortlistOnly(true);
                                        setViewMode("kanban");
                                    }}
                                >
                                    Kanban
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <EmployerFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    trackFilter={trackFilter}
                    setTrackFilter={setTrackFilter}
                    expFilter={expFilter}
                    setExpFilter={setExpFilter}
                    germanFilter={germanFilter}
                    setGermanFilter={setGermanFilter}
                    minScore={minScore}
                    setMinScore={setMinScore}
                    onReset={() => {
                        setTrackFilter("all");
                        setExpFilter("all");
                        setGermanFilter("all");
                        setAvailFilter("all");
                        setMinScore(0);
                        setSearchTerm("");
                    }}
                />
            </Card>

            {!loading && filteredTalent.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                    <Card className="xl:col-span-8 border border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg font-bold">Pipeline Overview</CardTitle>
                                    <CardDescription>Structured snapshot inspired by modern project dashboards.</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                    <TrendingUp className="h-3 w-3 mr-1" /> {hireConversion}% hire conversion
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stageBreakdown.map((stage) => {
                                    const percent = Math.round((stage.count / shortlistBase) * 100);
                                    return (
                                        <div key={stage.key} className="rounded-lg border border-slate-200 p-3 bg-white">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="font-medium text-slate-700">{stage.label}</span>
                                                <span className="font-bold text-slate-900">{stage.count}</span>
                                            </div>
                                            <Progress value={percent} className="h-2" />
                                            <p className="text-[11px] text-muted-foreground mt-2">{percent}% of shortlist pipeline</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="rounded-lg border border-slate-200 overflow-hidden">
                                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    <span className="col-span-4">Candidate</span>
                                    <span className="col-span-3">Track</span>
                                    <span className="col-span-2">Match</span>
                                    <span className="col-span-3 text-right">Action</span>
                                </div>
                                {topCandidates.map((candidate) => (
                                    <div key={candidate.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-t items-center text-sm">
                                        <div className="col-span-4">
                                            <p className="font-semibold text-slate-800">Candidate #{candidate.id.slice(0, 5)}</p>
                                            <p className="text-[11px] text-muted-foreground">{candidate.country_city || "Regional"}</p>
                                        </div>
                                        <p className="col-span-3 text-slate-700">{candidate.sap_track || "General SAP"}</p>
                                        <p className="col-span-2">
                                            <Badge variant="outline">{Math.round(candidate.matchScore || 0)}%</Badge>
                                        </p>
                                        <div className="col-span-3 flex justify-end">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8"
                                                onClick={() => {
                                                    setActiveTalent(candidate);
                                                    setDrawerOpen(true);
                                                    fetchActivityLogs(candidate.id);
                                                }}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="xl:col-span-4 space-y-5">
                        <Card className="border border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-primary" /> Upcoming Schedules
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {shortlistedTalent.slice(0, 4).map((candidate, index) => (
                                    <div key={candidate.id} className="rounded-lg border border-slate-200 p-3">
                                        <p className="text-sm font-semibold">Review Candidate #{candidate.id.slice(0, 5)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{candidate.sap_track || "General SAP"} - {candidate.german_level || "A2"}</p>
                                        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                                            <Clock3 className="h-3.5 w-3.5" /> Slot {index + 1}
                                        </div>
                                    </div>
                                ))}
                                {shortlistedTalent.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No shortlisted candidates yet.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" /> Recent Pipeline Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {topCandidates.slice(0, 4).map((candidate) => {
                                    const stage = favorites[candidate.id]?.pipeline_status || "discovery";
                                    return (
                                        <div key={candidate.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Candidate #{candidate.id.slice(0, 5)}</p>
                                                <p className="text-[11px] text-muted-foreground">{candidate.sap_track || "General SAP"}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] capitalize">{stage.replace("_", " ")}</Badge>
                                        </div>
                                    );
                                })}
                                {topCandidates.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 shadow-sm bg-primary/5">
                            <CardContent className="p-4 space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Quick Notes</p>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    Use shortlist + pipeline to keep momentum: move candidates to interview within 24h for better conversion.
                                </p>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => setShowShortlistOnly(true)}>Focus shortlist</Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setShowShortlistOnly(true);
                                            setViewMode("kanban");
                                        }}
                                    >
                                        Open kanban
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="animate-pulse h-48 bg-muted/50" />
                    ))}
                </div>
            ) : filteredTalent.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium">No candidates found</h3>
                    <p className="text-muted-foreground">Try adjusting your search criteria.</p>
                </div>
            ) : viewMode === "kanban" && showShortlistOnly ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Pipeline board shows shortlisted candidates by stage.</p>
                        <Badge variant="outline" className="bg-white">{shortlistedTalent.length} in pipeline</Badge>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-start">
                        {pipelineStages.map((stage) => {
                            const stageCandidates = kanbanColumns[stage.key];
                            return (
                                <Card key={stage.key} className={`border ${stage.tone} min-h-[280px]`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-semibold">{stage.label}</CardTitle>
                                            <Badge variant="secondary">{stageCandidates.length}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {stageCandidates.length === 0 ? (
                                            <div className="rounded-md border border-dashed bg-white/80 p-4 text-xs text-muted-foreground text-center">
                                                No candidates here
                                            </div>
                                        ) : stageCandidates.map((candidate) => (
                                            <div key={candidate.talent_id} className="rounded-lg border bg-white p-3 space-y-3 shadow-sm">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="text-sm font-semibold">Candidate #{candidate.talent_id.slice(0, 5)}</div>
                                                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                                                            <Briefcase className="h-3 w-3" /> {candidate.sap_track || "General SAP"}
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {Math.round(candidate.matchScore || 0)}%
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs"
                                                        onClick={() => {
                                                            setActiveTalent(candidate);
                                                            setDrawerOpen(true);
                                                            fetchActivityLogs(candidate.id);
                                                        }}
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" /> View
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs"
                                                        onClick={() => handleOpenMessageModal(candidate)}
                                                    >
                                                        <MessageSquareText className="h-3 w-3 mr-1" /> Message
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs"
                                                        onClick={() => toggleFavorite(candidate.talent_id)}
                                                    >
                                                        <Star className="h-3 w-3 mr-1" /> Remove
                                                    </Button>
                                                </div>

                                                <Select
                                                    value={favorites[candidate.talent_id]?.pipeline_status || "shortlisted"}
                                                    onValueChange={(v) => updatePipelineStatus(candidate.talent_id, v)}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue placeholder="Stage" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                                        <SelectItem value="interview_requested">Interview requested</SelectItem>
                                                        <SelectItem value="hired">Hired</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <div className="flex gap-2">
                                                    {stage.key === "shortlisted" && (
                                                        <Button size="sm" className="h-7 text-xs flex-1" onClick={() => handleOpenInterviewModal(candidate)}>
                                                            Request interview
                                                        </Button>
                                                    )}
                                                    {(stage.key === "shortlisted" || stage.key === "interview_requested") && (
                                                        <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => moveToNextStage(candidate.talent_id)}>
                                                            <ArrowRight className="h-3 w-3 mr-1" /> Move
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {filteredTalent.map((candidate) => (
                        <CandidateCard
                            key={candidate.talent_id}
                            candidate={candidate}
                            favorite={favorites[candidate.talent_id]}
                            onToggleFavorite={toggleFavorite}
                            onRequestInterview={handleOpenInterviewModal}
                            onViewProfile={(c) => {
                                setActiveTalent(c);
                                setDrawerOpen(true);
                                fetchActivityLogs(c.id);
                            }}
                            onSaveNote={saveNote}
                            onUpdatePipelineStatus={updatePipelineStatus}
                            onMessageCandidate={handleOpenMessageModal}
                            isRequestingInterview={isRequestingInterview}
                            isSavingNote={isSavingNote}
                            tempNote={tempNote}
                            setTempNote={setTempNote}
                            editingNote={editingNote}
                            setEditingNote={setEditingNote}
                        />
                    ))}
                </div>
            )}



            <InterviewRequestModal
                isOpen={interviewModalOpen}
                onClose={() => setInterviewModalOpen(false)}
                onSubmit={handleSendInterviewRequest}
                candidateId={selectedCandidateForInterview?.id || "0"}
                isSubmitting={isRequestingInterview}
            />

            <RecruitmentMessagingModal
                isOpen={messageModalOpen}
                onClose={() => setMessageModalOpen(false)}
                applicationId={selectedCandidateForMessage?.id || ""}
                candidateLabel={selectedCandidateForMessage ? `Candidate #${selectedCandidateForMessage.id.slice(0, 5)}` : "Candidate"}
                pipelineStage={selectedCandidateForMessage ? favorites[selectedCandidateForMessage.id]?.pipeline_status : undefined}
            />

            {/* Candidate Detail Drawer */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent className="sm:max-w-xl w-full p-0 overflow-hidden flex flex-col">
                    {activeTalent && (
                        <>
                            <div className="bg-primary/5 p-6 border-b">
                                <SheetHeader className="text-left">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                            #{activeTalent.id.slice(0, 8)}
                                        </Badge>
                                        <div className={`h-12 w-12 rounded-full border-4 flex flex-col items-center justify-center bg-white shadow-lg ${(activeTalent.matchScore || 0) > 80 ? 'border-green-500 text-green-600' :
                                            (activeTalent.matchScore || 0) > 50 ? 'border-yellow-500 text-yellow-600' : 'border-gray-300 text-gray-500'
                                            }`}>
                                            <span className="text-xs font-bold leading-none">{activeTalent.matchScore}%</span>
                                            <span className="text-[8px] uppercase font-bold">Match</span>
                                        </div>
                                    </div>
                                    <SheetTitle className="text-2xl font-bold">Candidate #{activeTalent.id.slice(0, 5)}</SheetTitle>
                                    <SheetDescription className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {activeTalent.country_city || 'Regional'}</span>
                                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {activeTalent.sap_track || 'General SAP'}</span>
                                    </SheetDescription>
                                </SheetHeader>

                                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                    {favorites[activeTalent.id] ? (
                                        <>
                                            <Select
                                                value={favorites[activeTalent.id].pipeline_status || "shortlisted"}
                                                onValueChange={(v) => updatePipelineStatus(activeTalent.id, v)}
                                            >
                                                <SelectTrigger className="h-9 bg-white sm:w-[220px]">
                                                    <SelectValue placeholder="Pipeline stage" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                                    <SelectItem value="interview_requested">Interview requested</SelectItem>
                                                    <SelectItem value="hired">Hired</SelectItem>
                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button className="h-9" onClick={() => handleOpenMessageModal(activeTalent)}>
                                                Message
                                            </Button>
                                        </>
                                    ) : (
                                        <Button className="h-9" onClick={() => toggleFavorite(activeTalent.id)}>
                                            Add to Shortlist
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-8 pb-10">
                                    {/* AI Discovery Timeline */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-sm flex items-center gap-2">
                                            <Target className="h-4 w-4 text-primary" /> Professional Timeline
                                        </h3>
                                        <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                                            <div className="relative pl-8">
                                                <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary border-2 border-white" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold">AI ANALYSIS COMPLETED</span>
                                                    <span className="text-[10px] text-muted-foreground mt-1">Skills extracted and verified by Bridging Academy AI.</span>
                                                </div>
                                            </div>
                                            {favorites[activeTalent.id] && (
                                                <div className="relative pl-8">
                                                    <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-yellow-500 border-2 border-white" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold uppercase">Added to Shortlist</span>
                                                        <span className="text-[10px] text-muted-foreground mt-1">You favorited this candidate. Current status: {favorites[activeTalent.id].pipeline_status}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Skills & AI Insights */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-sm flex items-center gap-2">
                                            <Cpu className="h-4 w-4 text-primary" /> Full AI Analysis
                                        </h3>
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                            <p className="text-sm italic text-muted-foreground leading-relaxed">
                                                "{activeTalent.ai_analysis_summary}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-sm">Verified Competencies</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {activeTalent.ai_skills?.map((s, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-primary/10">
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                    <span className="text-xs font-medium">{s.skill}</span>
                                                    {s.level && <Badge variant="secondary" className="text-[9px] h-4">{s.level}</Badge>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div >
    );
};

export default EmployerDashboard;
