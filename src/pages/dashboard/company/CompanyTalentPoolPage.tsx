import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Filter,
    Star,
    Briefcase,
    Users,
    Heart,
    Sparkles,
    ArrowRight,
    ChevronRight,
    ShieldCheck,
    Clock,
    Target,
    Zap,
    MessageSquare,
    Calendar,
    Trophy,
    GraduationCap,
    TrendingUp,
    MapPin,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpTalentProfile, MvpJob } from "@/integrations/supabase/mvp";
import { useToast } from "@/hooks/use-toast";
import { MvpCandidateCard } from "./MvpCandidateCard";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetClose
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
} from "recharts";
import { InterviewRequestModal } from "@/pages/dashboard/components/InterviewRequestModal";
import { RecruitmentMessagingModal } from "@/pages/dashboard/components/RecruitmentMessagingModal";
import { scoreTalentJob } from "@/lib/matchingEngine";
import { expandSemanticTerms, includesSemantic } from "@/lib/semanticSearch";

// Types
interface EmployerFavorite {
    talent_id: string;
    employer_id: string;
    notes: string;
    pipeline_status: string;
    created_at?: string;
}

interface ProcessedTalent extends MvpTalentProfile {
    _score?: number;
    _breakdown?: {
        skillsOverlap: number;
        languageMatch: number;
        readiness: number;
    };
    _reasons?: string[];
}

const PIPELINE_STAGES = [
    { value: "shortlisted", label: "Shortlisted", color: "bg-primary" },
    { value: "interview_requested", label: "Interview Requested", color: "bg-gold" },
    { value: "interviewing", label: "Interviewing", color: "bg-orange" },
    { value: "offered", label: "Offered", color: "bg-primary-light" },
    { value: "hired", label: "Hired", color: "bg-navy" },
    { value: "rejected", label: "Rejected", color: "bg-slate-400" },
];

export default function CompanyTalentPoolPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Data states
    const [loading, setLoading] = useState(true);
    const [talents, setTalents] = useState<MvpTalentProfile[]>([]);
    const [jobs, setJobs] = useState<MvpJob[]>([]);
    const [favorites, setFavorites] = useState<Record<string, EmployerFavorite>>({});
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [employerId, setEmployerId] = useState<string | null>(null);

    // Filter states
    const [query, setQuery] = useState("");
    const [selectedJobId, setSelectedJobId] = useState<string>("all");
    const [trackFilter, setTrackFilter] = useState<string>("all");
    const [expFilter, setExpFilter] = useState<string>("all");
    const [germanFilter, setGermanFilter] = useState<string>("all");
    const [minScore, setMinScore] = useState<number>(0);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [pipelineStageFilter, setPipelineStageFilter] = useState<string>("all");

    // Modal states
    const [interviewModalOpen, setInterviewModalOpen] = useState(false);
    const [messagingModalOpen, setMessagingModalOpen] = useState(false);
    const [selectedTalent, setSelectedTalent] = useState<MvpTalentProfile | null>(null);
    const [isRequestingInterview, setIsRequestingInterview] = useState(false);

    // Deep Dive state
    const [selectedCandidate, setSelectedCandidate] = useState<MvpTalentProfile | null>(null);
    const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);

    // Note editing states
    const [tempNote, setTempNote] = useState("");
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [isSavingNote, setIsSavingNote] = useState(false);

    const loadFavorites = useCallback(async (employerId: string, companyId: string | null) => {
        try {
            const { data, error } = await (supabase as any)
                .schema('mvp')
                .from('employer_favorites')
                .select('*')
                .eq('employer_id', employerId)
                .eq('company_id', companyId);

            if (error) throw error;

            const favMap: Record<string, EmployerFavorite> = {};
            data?.forEach((fav: EmployerFavorite) => {
                favMap[fav.talent_id] = fav;
            });
            setFavorites(favMap);
        } catch (err) {
            console.error("Error loading favorites:", err);
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            setEmployerId(user.id);

            // Load profile to get company_id
            const profile = await mvp.getMyProfile(user.id);
            if (profile?.company_id) {
                setCompanyId(profile.company_id);

                // Load company jobs
                const companyJobs = await mvp.listCompanyJobs(profile.company_id);
                setJobs(companyJobs.filter(j => j.status === 'OPEN'));

                // Load favorites for this employer
                await loadFavorites(user.id, profile.company_id);
            }

            // Load talents (only JOB_READY)
            const allTalents = await mvp.listTalentProfiles();
            setTalents(allTalents.filter(t => t.placement_status === 'JOB_READY'));

        } catch (err) {
            console.error("Error loading data:", err);
            toast({
                title: "Error",
                description: "Failed to load talent pool data",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [loadFavorites, navigate, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleFavorite = async (talentId: string) => {
        if (!employerId) return;

        try {
            const isFav = !!favorites[talentId];

            if (isFav) {
                const { error } = await (supabase as any)
                    .schema('mvp')
                    .from('employer_favorites')
                    .delete()
                    .eq('talent_id', talentId)
                    .eq('employer_id', employerId)
                    .eq('company_id', companyId);

                if (error) throw error;

                setFavorites(prev => {
                    const next = { ...prev };
                    delete next[talentId];
                    return next;
                });

                toast({
                    title: "Removed from favorites",
                    description: "Candidate removed from your shortlist",
                });
            } else {
                const { data, error } = await (supabase as any)
                    .schema('mvp')
                    .from('employer_favorites')
                    .insert({
                        talent_id: talentId,
                        employer_id: employerId,
                        company_id: companyId,
                        notes: "",
                        pipeline_status: "shortlisted",
                    })
                    .select()
                    .single();

                if (error) throw error;

                setFavorites(prev => ({
                    ...prev,
                    [talentId]: data
                }));

                toast({
                    title: "Added to favorites",
                    description: "Candidate added to your shortlist",
                });
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
            toast({
                title: "Error",
                description: "Failed to update favorites",
                variant: "destructive",
            });
        }
    };

    const handleSaveNote = async (talentId: string, note: string) => {
        if (!employerId || !companyId) return;

        setIsSavingNote(true);
        try {
            const { error } = await (supabase as any)
                .schema('mvp')
                .from('employer_favorites')
                .update({ notes: note })
                .eq('talent_id', talentId)
                .eq('employer_id', employerId)
                .eq('company_id', companyId);

            if (error) throw error;

            setFavorites(prev => ({
                ...prev,
                [talentId]: {
                    ...prev[talentId],
                    notes: note
                }
            }));

            setEditingNote(null);
            toast({
                title: "Note saved",
                description: "Your private note has been saved",
            });
        } catch (err) {
            console.error("Error saving note:", err);
            toast({
                title: "Error",
                description: "Failed to save note",
                variant: "destructive",
            });
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleUpdatePipelineStatus = async (talentId: string, status: string) => {
        if (!employerId || !companyId || !favorites[talentId]) return;

        try {
            const { error } = await (supabase as any)
                .schema('mvp')
                .from('employer_favorites')
                .update({ pipeline_status: status })
                .eq('talent_id', talentId)
                .eq('employer_id', employerId)
                .eq('company_id', companyId);

            if (error) throw error;

            setFavorites(prev => ({
                ...prev,
                [talentId]: {
                    ...prev[talentId],
                    pipeline_status: status
                }
            }));

            toast({
                title: "Status updated",
                description: `Candidate moved to ${status.replace('_', ' ')}`,
            });
        } catch (err) {
            console.error("Error updating pipeline:", err);
            toast({
                title: "Error",
                description: "Failed to update pipeline status",
                variant: "destructive",
            });
        }
    };

    const handleRequestInterview = (talent: MvpTalentProfile) => {
        setSelectedTalent(talent);
        setInterviewModalOpen(true);
    };

    const handleSubmitInterviewRequest = async (message: string) => {
        if (!selectedTalent || !employerId) return;

        setIsRequestingInterview(true);
        try {
            const { error } = await (supabase as any)
                .schema('mvp')
                .from('interview_requests')
                .insert({
                    employer_id: employerId,
                    talent_id: selectedTalent.user_id,
                    company_id: companyId,
                    status: 'pending',
                    notes: message,
                    created_at: new Date().toISOString(),
                });

            if (error) throw error;

            if (favorites[selectedTalent.user_id]) {
                await handleUpdatePipelineStatus(selectedTalent.user_id, 'interview_requested');
            }

            toast({
                title: "Interview requested",
                description: "Your interview request has been submitted for admin approval",
            });

            setInterviewModalOpen(false);
        } catch (err) {
            console.error("Error requesting interview:", err);
            toast({
                title: "Error",
                description: "Failed to submit interview request",
                variant: "destructive",
            });
        } finally {
            setIsRequestingInterview(false);
        }
    };

    const handleMessageCandidate = (talent: MvpTalentProfile) => {
        setSelectedTalent(talent);
        setMessagingModalOpen(true);
    };

    const handleViewProfile = (talent: MvpTalentProfile) => {
        setSelectedCandidate(talent);
        setIsDeepDiveOpen(true);
    };

    const handleResetFilters = () => {
        setQuery("");
        setTrackFilter("all");
        setExpFilter("all");
        setGermanFilter("all");
        setMinScore(0);
        setSelectedJobId("all");
        setPipelineStageFilter("all");
    };

    const processedTalents = useMemo(() => {
        let processed: ProcessedTalent[] = [...talents];
        const semanticTerms = expandSemanticTerms(query);

        if (query) {
            processed = processed.filter(t => {
                const skillsMatch = t.skills.some(s => includesSemantic(s, semanticTerms));
                const langMatch = t.languages.some(l => includesSemantic(l, semanticTerms));
                return skillsMatch || langMatch || includesSemantic(String(t.years_of_experience), semanticTerms);
            });
        }

        if (trackFilter !== "all") {
            processed = processed.filter(t =>
                t.skills.some(s => s.toLowerCase().includes(trackFilter.toLowerCase()))
            );
        }

        if (expFilter !== "all") {
            processed = processed.filter(t => {
                if (expFilter === "junior") return t.years_of_experience < 2;
                if (expFilter === "mid") return t.years_of_experience >= 2 && t.years_of_experience < 5;
                if (expFilter === "senior") return t.years_of_experience >= 5;
                return true;
            });
        }

        if (germanFilter !== "all") {
            processed = processed.filter(t => {
                const germanLevel = t.languages.find(l => l.toLowerCase().includes('german'));
                if (!germanLevel) return false;
                const level = germanLevel.match(/[A-C][1-2]/i)?.[0];
                if (!level) return false;
                const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                const candidateLevelIndex = levels.indexOf(level.toUpperCase());
                const filterLevelIndex = levels.indexOf(germanFilter);
                return candidateLevelIndex >= filterLevelIndex;
            });
        }

        if (selectedJobId && selectedJobId !== "all") {
            const job = jobs.find(j => j.id === selectedJobId);
            if (job) {
                processed = processed.map(t => {
                    const match = scoreTalentJob(t, job);
                    const reasons: string[] = [];
                    if ((match.breakdown.skillsOverlap ?? 0) >= 75) reasons.push("Strong skills overlap");
                    if ((match.breakdown.languageMatch ?? 0) >= 75) reasons.push("Language fit");
                    if ((match.breakdown.readiness ?? 0) >= 75) reasons.push("High readiness");
                    if (reasons.length === 0) reasons.push("General profile compatibility");
                    return {
                        ...t,
                        _score: match.score,
                        _breakdown: match.breakdown,
                        _reasons: reasons,
                    };
                });
                processed.sort((a, b) => (b._score || 0) - (a._score || 0));
            }
        }

        if (minScore > 0) {
            processed = processed.filter(t => (t._score || 0) >= minScore);
        }

        if (showFavoritesOnly) {
            processed = processed.filter(t => !!favorites[t.user_id]);
        }

        if (pipelineStageFilter !== "all") {
            processed = processed.filter(t =>
                favorites[t.user_id]?.pipeline_status === pipelineStageFilter
            );
        }

        return processed;
    }, [talents, query, trackFilter, expFilter, germanFilter, selectedJobId, jobs, minScore, showFavoritesOnly, pipelineStageFilter, favorites]);

    const radarData = useMemo(() => {
        if (!selectedCandidate) return [];
        return [
            { subject: 'Technical', A: 85, fullMark: 100 },
            { subject: 'Soft Skills', A: 92, fullMark: 100 },
            { subject: 'Language', A: 95, fullMark: 100 },
            { subject: 'Readiness', A: 88, fullMark: 100 },
            { subject: 'Adaptability', A: 90, fullMark: 100 },
        ];
    }, [selectedCandidate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white">
                                <Users className="h-6 w-6" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Talent Pool</h1>
                        </div>
                        <p className="text-slate-500 font-medium ml-1">Discover pre-vetted candidates matched to your open roles.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gold/5 dark:bg-gold/10 rounded-2xl border border-gold/10 dark:border-gold/20">
                            <Sparkles className="h-4 w-4 text-gold animate-pulse" />
                            <span className="text-xs font-bold text-gold uppercase tracking-widest">Smart Match Active</span>
                        </div>
                        <Button className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20 transition-all active:scale-95" onClick={() => navigate("/company/jobs")}>
                            Manage Jobs <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="border-none shadow-xl bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search by skills, languages, or background..."
                                className="h-14 pl-12 pr-4 rounded-2xl border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 focus:ring-primary/20 transition-all text-base font-medium shadow-sm"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                                <Button
                                    variant={selectedJobId === "all" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedJobId("all")}
                                    className={`h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${selectedJobId === "all" ? "shadow-lg" : "hover:bg-white dark:hover:bg-slate-700"
                                        }`}
                                >
                                    All Roles
                                </Button>
                                {jobs.slice(0, 2).map((job) => (
                                    <Button
                                        key={job.id}
                                        variant={selectedJobId === job.id ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setSelectedJobId(job.id)}
                                        className={`h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${selectedJobId === job.id ? "shadow-lg" : "hover:bg-white dark:hover:bg-slate-700"
                                            }`}
                                    >
                                        {job.title}
                                    </Button>
                                ))}
                            </div>

                            <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-200 font-bold gap-2 hover:bg-slate-50 transition-all" onClick={handleResetFilters}>
                                <X className="h-5 w-5" /> <span>Reset</span>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Experience</label>
                            <div className="flex gap-2">
                                {['all', 'junior', 'mid', 'senior'].map(exp => (
                                    <Button
                                        key={exp}
                                        variant={expFilter === exp ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setExpFilter(exp)}
                                        className="rounded-xl text-[10px] font-bold uppercase h-9 px-4 flex-1"
                                    >
                                        {exp}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Min. Match Score ({minScore}%)</label>
                            <div className="px-2 pt-2">
                                <Progress value={minScore} className="h-2 bg-slate-100" />
                                <div className="flex justify-between mt-2">
                                    {[0, 25, 50, 75, 100].map(v => (
                                        <button key={v} onClick={() => setMinScore(v)} className="text-[9px] font-bold text-slate-400 hover:text-primary">{v}%</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">SAP Specialization</label>
                            <div className="flex gap-2">
                                {['all', 'FI', 'MM', 'SD', 'BTP'].map(track => (
                                    <Button
                                        key={track}
                                        variant={trackFilter === track ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTrackFilter(track)}
                                        className="rounded-xl text-[10px] font-bold uppercase h-9 px-3 flex-1"
                                    >
                                        {track}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Main Tabs */}
            <Tabs defaultValue="discovery" className="space-y-8">
                <div className="flex justify-center">
                    <TabsList className="h-16 p-2 rounded-[2rem] bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 shadow-inner">
                        <TabsTrigger value="discovery" onClick={() => setShowFavoritesOnly(false)} className="h-full px-10 rounded-[1.5rem] text-sm font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xl transition-all gap-2">
                            <Target className="h-4 w-4" /> Discovery
                        </TabsTrigger>
                        <TabsTrigger value="favorites" onClick={() => setShowFavoritesOnly(true)} className="h-full px-10 rounded-[1.5rem] text-sm font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xl transition-all gap-2">
                            <Heart className="h-4 w-4" /> My Shortlist ({Object.keys(favorites).length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {processedTalents.map((talent) => (
                            <MvpCandidateCard
                                key={talent.user_id}
                                candidate={talent}
                                favorite={favorites[talent.user_id]}
                                matchScore={talent._score}
                                matchBreakdown={talent._breakdown}
                                matchReasons={talent._reasons}
                                onToggleFavorite={handleToggleFavorite}
                                onRequestInterview={handleRequestInterview}
                                onViewProfile={handleViewProfile}
                                onSaveNote={handleSaveNote}
                                onUpdatePipelineStatus={handleUpdatePipelineStatus}
                                onMessageCandidate={handleMessageCandidate}
                                isRequestingInterview={isRequestingInterview}
                                isSavingNote={isSavingNote && editingNote === talent.user_id}
                                tempNote={tempNote}
                                setTempNote={setTempNote}
                                editingNote={editingNote}
                                setEditingNote={setEditingNote}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {processedTalents.length === 0 && (
                    <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                            <Users className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No candidates found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your filters or search terms.</p>
                        <Button variant="outline" className="mt-6 rounded-xl font-bold" onClick={handleResetFilters}>Reset All Filters</Button>
                    </div>
                )}
            </Tabs>

            {/* Candidate Deep Dive Sheet */}
            <Sheet open={isDeepDiveOpen} onOpenChange={setIsDeepDiveOpen}>
                <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-none bg-slate-950 text-white shadow-2xl">
                    {selectedCandidate && (
                        <ScrollArea className="h-full">
                            <div className="p-8 space-y-8">
                                <SheetHeader className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="border-primary/50 text-primary font-black uppercase tracking-[0.2em] text-[10px] px-3">Candidate Deep Dive</Badge>
                                        <SheetClose className="rounded-full h-10 w-10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                            <X className="h-6 w-6" />
                                        </SheetClose>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-2xl shadow-primary/40">
                                            <Users size={40} className="text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <SheetTitle className="text-3xl font-black tracking-tight text-white">Candidate #{selectedCandidate.user_id.slice(0, 8)}</SheetTitle>
                                            <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Mobile / Available</span>
                                                <span className="h-1 w-1 rounded-full bg-slate-700" />
                                                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-500" /> Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                </SheetHeader>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                                        <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500">
                                            <span>AI Match Score</span>
                                            <Sparkles className="h-3 w-3 text-gold" />
                                        </div>
                                        <div className="text-3xl font-black text-primary">89%</div>
                                        <Progress value={89} className="h-1.5 bg-white/10" />
                                    </div>
                                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                                        <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500">
                                            <span>Coach Rating</span>
                                            <Trophy className="h-3 w-3 text-primary" />
                                        </div>
                                        <div className="text-3xl font-black text-primary">{selectedCandidate.coach_rating || 4.8} <span className="text-sm text-slate-600">/ 5</span></div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className={i <= 4 ? "fill-primary text-primary" : "text-white/10"} />)}
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-white/10" />

                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Technical Skills Radar</h4>
                                    <div className="h-[250px] w-full bg-white/5 rounded-[2.5rem] p-4 flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid stroke="#334155" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                                <Radar name="Candidate" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.6} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Professional Journey</h4>
                                    <div className="space-y-6 pl-4 border-l-2 border-primary/20">
                                        <div className="relative">
                                            <div className="absolute -left-[25px] top-1 h-4 w-4 rounded-full bg-primary shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
                                            <div className="space-y-1">
                                                <div className="text-sm font-black">AI Academy Certification</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Completed • Jan 2024</div>
                                                <p className="text-xs text-slate-300 leading-relaxed">Advanced training in prompt engineering and LLM orchestration.</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[25px] top-1 h-4 w-4 rounded-full bg-slate-800 border-2 border-slate-700" />
                                            <div className="space-y-1">
                                                <div className="text-sm font-black">Technical Internship</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bridging Academy Partner • 2023</div>
                                                <p className="text-xs text-slate-300 leading-relaxed">Assisted in frontend development using React and Tailwind CSS.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <Button className="h-16 flex-1 rounded-[1.5rem] bg-navy-dark hover:bg-navy text-white font-black text-lg shadow-2xl shadow-navy/20" onClick={() => handleRequestInterview(selectedCandidate)}>
                                        Request Interview <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                    <Button variant="outline" className="h-16 w-16 rounded-[1.5rem] border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold text-primary" onClick={() => handleMessageCandidate(selectedCandidate)}>
                                        <MessageSquare className="h-6 w-6" />
                                    </Button>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </SheetContent>
            </Sheet>

            {/* Modals */}
            {selectedTalent && (
                <InterviewRequestModal
                    isOpen={interviewModalOpen}
                    onClose={() => setInterviewModalOpen(false)}
                    onSubmit={handleSubmitInterviewRequest}
                    candidateId={selectedTalent.user_id}
                    isSubmitting={isRequestingInterview}
                />
            )}

            {selectedTalent && (
                <RecruitmentMessagingModal
                    isOpen={messagingModalOpen}
                    onClose={() => setMessagingModalOpen(false)}
                    applicationId={selectedTalent.user_id}
                    candidateLabel={`Candidate #${selectedTalent.user_id.slice(0, 5)}`}
                    pipelineStage={favorites[selectedTalent.user_id]?.pipeline_status}
                />
            )}
        </div>
    );
}
