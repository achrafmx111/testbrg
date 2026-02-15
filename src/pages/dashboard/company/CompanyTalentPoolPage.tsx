import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Star, Briefcase, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpTalentProfile, MvpJob } from "@/integrations/supabase/mvp";
import { scoreTalentJob } from "@/lib/matchingEngine";
import { MvpCandidateCard } from "./MvpCandidateCard";
import { InterviewRequestModal } from "@/pages/dashboard/components/InterviewRequestModal";
import { RecruitmentMessagingModal } from "@/pages/dashboard/components/RecruitmentMessagingModal";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

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
}

const PIPELINE_STAGES = [
    { value: "shortlisted", label: "Shortlisted", color: "bg-blue-500" },
    { value: "interview_requested", label: "Interview Requested", color: "bg-purple-500" },
    { value: "interviewing", label: "Interviewing", color: "bg-orange-500" },
    { value: "offered", label: "Offered", color: "bg-yellow-500" },
    { value: "hired", label: "Hired", color: "bg-green-500" },
    { value: "rejected", label: "Rejected", color: "bg-red-500" },
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
    
    // Note editing states
    const [tempNote, setTempNote] = useState("");
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
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
    };

    const loadFavorites = async (employerId: string, companyId: string | null) => {
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
    };

    // Toggle favorite
    const handleToggleFavorite = async (talentId: string) => {
        if (!employerId) return;
        
        try {
            const isFav = !!favorites[talentId];
            
            if (isFav) {
                // Remove from favorites
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
                // Add to favorites
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

    // Save note
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

    // Update pipeline status
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

    // Interview request
    const handleRequestInterview = (talent: MvpTalentProfile) => {
        setSelectedTalent(talent);
        setInterviewModalOpen(true);
    };

    const handleSubmitInterviewRequest = async (message: string) => {
        if (!selectedTalent || !employerId) return;
        
        setIsRequestingInterview(true);
        try {
            // Create interview request in database
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
            
            // Update pipeline status to interview_requested if favorite exists
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

    // Message candidate
    const handleMessageCandidate = (talent: MvpTalentProfile) => {
        setSelectedTalent(talent);
        setMessagingModalOpen(true);
    };

    // View profile
    const handleViewProfile = (talent: MvpTalentProfile) => {
        // Navigate to talent profile or show modal
        toast({
            title: "Profile view",
            description: `Viewing profile for Candidate #${talent.user_id.slice(0, 5)}`,
        });
    };

    // Reset filters
    const handleResetFilters = () => {
        setQuery("");
        setTrackFilter("all");
        setExpFilter("all");
        setGermanFilter("all");
        setMinScore(0);
        setSelectedJobId("all");
        setPipelineStageFilter("all");
    };

    // Process and filter talents
    const processedTalents = useMemo(() => {
        let processed: ProcessedTalent[] = [...talents];

        // Text search
        if (query) {
            const q = query.toLowerCase();
            processed = processed.filter(t => {
                const skillsMatch = t.skills.some(s => s.toLowerCase().includes(q));
                const langMatch = t.languages.some(l => l.toLowerCase().includes(q));
                return skillsMatch || langMatch;
            });
        }

        // Track filter (simulate track from skills)
        if (trackFilter !== "all") {
            processed = processed.filter(t => 
                t.skills.some(s => s.toLowerCase().includes(trackFilter.toLowerCase()))
            );
        }

        // Experience filter
        if (expFilter !== "all") {
            processed = processed.filter(t => {
                if (expFilter === "junior") return t.years_of_experience < 2;
                if (expFilter === "mid") return t.years_of_experience >= 2 && t.years_of_experience < 5;
                if (expFilter === "senior") return t.years_of_experience >= 5;
                return true;
            });
        }

        // German level filter
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

        // Job matching
        if (selectedJobId && selectedJobId !== "all") {
            const job = jobs.find(j => j.id === selectedJobId);
            if (job) {
                processed = processed.map(t => {
                    const match = scoreTalentJob(t, job);
                    return { 
                        ...t, 
                        _score: match.score, 
                        _breakdown: match.breakdown 
                    };
                });
                processed.sort((a, b) => (b._score || 0) - (a._score || 0));
            }
        }

        // Min score filter
        if (minScore > 0) {
            processed = processed.filter(t => (t._score || 0) >= minScore);
        }

        // Show favorites only
        if (showFavoritesOnly) {
            processed = processed.filter(t => !!favorites[t.user_id]);
        }

        // Pipeline stage filter
        if (pipelineStageFilter !== "all") {
            processed = processed.filter(t => 
                favorites[t.user_id]?.pipeline_status === pipelineStageFilter
            );
        }

        return processed;
    }, [talents, query, trackFilter, expFilter, germanFilter, selectedJobId, jobs, minScore, showFavoritesOnly, pipelineStageFilter, favorites]);

    // Pipeline counts
    const pipelineCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        PIPELINE_STAGES.forEach(stage => {
            counts[stage.value] = Object.values(favorites).filter(
                f => f.pipeline_status === stage.value
            ).length;
        });
        return counts;
    }, [favorites]);

    const totalFavorites = Object.keys(favorites).length;

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                <div className="h-4 w-96 bg-muted rounded animate-pulse" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-96 bg-muted rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Talent Pool</h2>
                    <p className="text-muted-foreground">Discover pre-vetted candidates for your open roles.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="h-8 px-3">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {talents.length} Available
                    </Badge>
                    <Badge variant="outline" className="h-8 px-3">
                        <Heart className="h-3.5 w-3.5 mr-1" />
                        {totalFavorites} Shortlisted
                    </Badge>
                </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Discovery Filters</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground h-8 text-xs hover:text-primary gap-2"
                            onClick={handleResetFilters}
                        >
                            Reset Filters
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by skill or language..."
                                className="pl-9 h-10 bg-white border-slate-200"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        {/* Job Select */}
                        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                            <SelectTrigger className="h-10 bg-white border-slate-200">
                                <SelectValue placeholder="Match against Job..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Jobs</SelectItem>
                                {jobs.map(job => (
                                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Track Filter */}
                        <Select value={trackFilter} onValueChange={setTrackFilter}>
                            <SelectTrigger className="h-10 bg-white border-slate-200">
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
                    </div>

                    <div className="flex flex-col gap-4 border-t border-slate-200/80 pt-4 mt-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            {/* Experience Filter */}
                            <div className="flex w-full items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 sm:w-auto">
                                <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Experience:</span>
                                <div className="flex gap-1">
                                    {['all', 'junior', 'mid', 'senior'].map(exp => (
                                        <button
                                            key={exp}
                                            onClick={() => setExpFilter(exp)}
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${expFilter === exp ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-primary/10 border"}`}
                                        >
                                            {exp === 'all' ? 'All' : exp.charAt(0).toUpperCase() + exp.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* German Level Filter */}
                            <div className="flex w-full items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 sm:w-auto">
                                <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">German Level:</span>
                                <div className="flex gap-1">
                                    {['A2', 'B1', 'B2', 'C1'].map(L => (
                                        <button
                                            key={L}
                                            onClick={() => setGermanFilter(germanFilter === L ? "all" : L)}
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${germanFilter === L ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-primary/10 border"}`}
                                        >
                                            {L}+
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Min Score Slider */}
                            {selectedJobId !== "all" && (
                                <div className="flex w-full items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 sm:w-auto">
                                    <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Min. Match Score:</span>
                                    <div className="flex w-full items-center gap-2 sm:w-36">
                                        <Slider
                                            value={[minScore]}
                                            onValueChange={(v) => setMinScore(v[0])}
                                            max={100}
                                            step={5}
                                            className="py-1"
                                        />
                                        <span className="text-[10px] font-bold text-primary w-8">{minScore}%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="all" onClick={() => setShowFavoritesOnly(false)}>
                        All Talents ({processedTalents.length})
                    </TabsTrigger>
                    <TabsTrigger value="favorites" onClick={() => setShowFavoritesOnly(true)}>
                        <Heart className="h-3.5 w-3.5 mr-1" />
                        Shortlisted ({totalFavorites})
                    </TabsTrigger>
                    {PIPELINE_STAGES.map(stage => (
                        <TabsTrigger 
                            key={stage.value} 
                            value={stage.value}
                            onClick={() => {
                                setShowFavoritesOnly(true);
                                setPipelineStageFilter(stage.value);
                            }}
                            className="hidden lg:flex"
                        >
                            <div className={`h-2 w-2 rounded-full ${stage.color} mr-1`} />
                            {stage.label} ({pipelineCounts[stage.value] || 0})
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <TalentGrid 
                        talents={processedTalents.filter(t => !showFavoritesOnly)}
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                        onRequestInterview={handleRequestInterview}
                        onViewProfile={handleViewProfile}
                        onSaveNote={handleSaveNote}
                        onUpdatePipelineStatus={handleUpdatePipelineStatus}
                        onMessageCandidate={handleMessageCandidate}
                        isRequestingInterview={isRequestingInterview}
                        isSavingNote={isSavingNote}
                        tempNote={tempNote}
                        setTempNote={setTempNote}
                        editingNote={editingNote}
                        setEditingNote={setEditingNote}
                    />
                </TabsContent>

                <TabsContent value="favorites" className="mt-6">
                    <TalentGrid 
                        talents={processedTalents}
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                        onRequestInterview={handleRequestInterview}
                        onViewProfile={handleViewProfile}
                        onSaveNote={handleSaveNote}
                        onUpdatePipelineStatus={handleUpdatePipelineStatus}
                        onMessageCandidate={handleMessageCandidate}
                        isRequestingInterview={isRequestingInterview}
                        isSavingNote={isSavingNote}
                        tempNote={tempNote}
                        setTempNote={setTempNote}
                        editingNote={editingNote}
                        setEditingNote={setEditingNote}
                    />
                </TabsContent>

                {PIPELINE_STAGES.map(stage => (
                    <TabsContent key={stage.value} value={stage.value} className="mt-6">
                        <TalentGrid 
                            talents={processedTalents.filter(t => 
                                favorites[t.user_id]?.pipeline_status === stage.value
                            )}
                            favorites={favorites}
                            onToggleFavorite={handleToggleFavorite}
                            onRequestInterview={handleRequestInterview}
                            onViewProfile={handleViewProfile}
                            onSaveNote={handleSaveNote}
                            onUpdatePipelineStatus={handleUpdatePipelineStatus}
                            onMessageCandidate={handleMessageCandidate}
                            isRequestingInterview={isRequestingInterview}
                            isSavingNote={isSavingNote}
                            tempNote={tempNote}
                            setTempNote={setTempNote}
                            editingNote={editingNote}
                            setEditingNote={setEditingNote}
                        />
                    </TabsContent>
                ))}
            </Tabs>

            {/* Interview Request Modal */}
            {selectedTalent && (
                <InterviewRequestModal
                    isOpen={interviewModalOpen}
                    onClose={() => setInterviewModalOpen(false)}
                    onSubmit={handleSubmitInterviewRequest}
                    candidateId={selectedTalent.user_id}
                    isSubmitting={isRequestingInterview}
                />
            )}

            {/* Messaging Modal */}
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

// Sub-component for talent grid
interface TalentGridProps {
    talents: ProcessedTalent[];
    favorites: Record<string, EmployerFavorite>;
    onToggleFavorite: (talentId: string) => void;
    onRequestInterview: (talent: MvpTalentProfile) => void;
    onViewProfile: (talent: MvpTalentProfile) => void;
    onSaveNote: (talentId: string, note: string) => void;
    onUpdatePipelineStatus: (talentId: string, status: string) => void;
    onMessageCandidate: (talent: MvpTalentProfile) => void;
    isRequestingInterview: boolean;
    isSavingNote: boolean;
    tempNote: string;
    setTempNote: (note: string) => void;
    editingNote: string | null;
    setEditingNote: (id: string | null) => void;
}

function TalentGrid({
    talents,
    favorites,
    onToggleFavorite,
    onRequestInterview,
    onViewProfile,
    onSaveNote,
    onUpdatePipelineStatus,
    onMessageCandidate,
    isRequestingInterview,
    isSavingNote,
    tempNote,
    setTempNote,
    editingNote,
    setEditingNote
}: TalentGridProps) {
    if (talents.length === 0) {
        return (
            <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No talents found matching your criteria.</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {talents.map((talent) => (
                <MvpCandidateCard
                    key={talent.user_id}
                    candidate={talent}
                    favorite={favorites[talent.user_id]}
                    matchScore={talent._score}
                    matchBreakdown={talent._breakdown}
                    onToggleFavorite={onToggleFavorite}
                    onRequestInterview={onRequestInterview}
                    onViewProfile={onViewProfile}
                    onSaveNote={onSaveNote}
                    onUpdatePipelineStatus={onUpdatePipelineStatus}
                    onMessageCandidate={onMessageCandidate}
                    isRequestingInterview={isRequestingInterview}
                    isSavingNote={isSavingNote}
                    tempNote={tempNote}
                    setTempNote={setTempNote}
                    editingNote={editingNote}
                    setEditingNote={setEditingNote}
                />
            ))}
        </div>
    );
}
