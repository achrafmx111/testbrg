import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    Building2,
    Star,
    MapPin,
    Briefcase,
    Target,
    Cpu,
    CheckCircle2,
    ArrowRight
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
import { calculateMatchScore } from "@/lib/talentUtils";
import { EmployerFilters } from "./components/EmployerFilters";
import { CandidateCard } from "./components/CandidateCard";
import { InterviewRequestModal } from "./components/InterviewRequestModal";

const EmployerDashboard = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
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

    // Phase 8 State
    const [userProfile, setUserProfile] = useState<any>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeTalent, setActiveTalent] = useState<TalentProfile | null>(null);
    const [isRequestingInterview, setIsRequestingInterview] = useState(false);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

    // Interview Modal State
    const [interviewModalOpen, setInterviewModalOpen] = useState(false);
    const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState<TalentProfile | null>(null);

    useEffect(() => {
        const init = async () => {
            await Promise.all([
                fetchTalent(),
                fetchFavorites(),
                fetchUserProfile()
            ]);
        };
        init();
    }, []);

    const fetchTalent = async () => {
        setLoading(true);
        try {
            // Fetch only talent_pool_registration type
            const { data, error } = await (supabase as any)
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
    };

    const fetchUserProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data, error } = await (supabase as any)
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (error) throw error;
            setUserProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchFavorites = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await (supabase as any)
                .from('employer_favorites')
                .select('application_id, employer_id, notes, pipeline_status')
                .eq('employer_id', user.id);

            if (error) throw error;
            const favMap: { [key: string]: EmployerFavorite } = {};
            (data || []).forEach((f: any) => {
                favMap[f.application_id] = f;
            });
            setFavorites(favMap);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    const toggleFavorite = async (applicationId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({ title: "Please log in", variant: "destructive" });
                return;
            }

            const isFav = !!favorites[applicationId];

            if (isFav) {
                const { error } = await (supabase as any)
                    .from('employer_favorites')
                    .delete()
                    .eq('employer_id', user.id)
                    .eq('application_id', applicationId);

                if (error) throw error;
                setFavorites(prev => {
                    const newFavs = { ...prev };
                    delete newFavs[applicationId];
                    return newFavs;
                });
                toast({ title: "Removed from shortlist" });
            } else {
                const { error } = await (supabase as any)
                    .from('employer_favorites')
                    .insert({
                        employer_id: user.id,
                        application_id: applicationId,
                        pipeline_status: 'shortlisted'
                    });

                if (error) throw error;
                setFavorites(prev => ({
                    ...prev,
                    [applicationId]: {
                        application_id: applicationId,
                        employer_id: user.id,
                        notes: "",
                        pipeline_status: "shortlisted"
                    }
                }));
                toast({ title: "Added to shortlist" });
            }
        } catch (error: any) {
            console.error("Error toggling favorite:", error);
            toast({
                variant: "destructive",
                title: "Action Failed",
                description: "Failed to update shortlist."
            });
        }
    };

    const updatePipelineStatus = async (applicationId: string, status: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await (supabase as any)
                .from('employer_favorites')
                .update({ pipeline_status: status })
                .eq('employer_id', user.id)
                .eq('application_id', applicationId);

            if (error) throw error;
            setFavorites(prev => ({
                ...prev,
                [applicationId]: { ...prev[applicationId], pipeline_status: status }
            }));
            toast({ title: `Status updated to ${status}` });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };


    const handleOpenInterviewModal = (candidate: TalentProfile) => {
        const isGerman = i18n.language === 'de';
        const isAdmin = userProfile?.role === 'admin' || (userProfile as any)?.is_admin === true;
        const isPremium = userProfile?.subscription_plan && ['pro', 'enterprise', 'premium'].includes(userProfile.subscription_plan.toLowerCase());

        if (!isAdmin && !isPremium) {
            toast({
                title: isGerman ? "Premium-Funktion" : "Premium Feature",
                description: isGerman
                    ? `Direkte Interview-Anfragen sind in Pro-Plänen verfügbar. (Ihr Status: ${userProfile?.role || 'Guest'} / ${userProfile?.subscription_plan || 'Free'})`
                    : `Direct interview requests are available for Pro and Enterprise plans. (Your status: ${userProfile?.role || 'Guest'} / ${userProfile?.subscription_plan || 'Free'})`,
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
            const { error: reqError } = await (supabase as any)
                .from('interview_requests')
                .insert({
                    employer_id: user.id,
                    application_id: applicationId,
                    status: 'pending',
                    message: message
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

    const fetchActivityLogs = async (id: string) => {
        try {
            const { data, error } = await (supabase as any)
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

    const saveNote = async (applicationId: string, note: string) => {
        setIsSavingNote(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await (supabase as any)
                .from('employer_favorites')
                .update({ notes: note })
                .eq('employer_id', user.id)
                .eq('application_id', applicationId);

            if (error) throw error;
            setFavorites(prev => ({
                ...prev,
                [applicationId]: { ...prev[applicationId], notes: note }
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
        const matchesShortlist = !showShortlistOnly || !!favorites[item.id];

        // Attach calculated score to the item for sorting
        item.matchScore = score;

        return matchesSearch && matchesTrack && matchesShortlist;
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-elegant bg-gradient-to-br from-primary/5 via-transparent to-transparent">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <Building2 className="h-6 w-6 text-primary" />
                                Talent Marketplace
                            </CardTitle>
                            <CardDescription>Advanced candidate matching for our strategic partners.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={showShortlistOnly ? "default" : "outline"}
                                size="sm"
                                className="h-8 gap-2"
                                onClick={() => setShowShortlistOnly(!showShortlistOnly)}
                            >
                                <Star className={`h-4 w-4 ${showShortlistOnly ? "fill-white" : ""}`} />
                                Shortlist {Object.keys(favorites).length > 0 && `(${Object.keys(favorites).length})`}
                            </Button>
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
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredTalent.map((candidate) => (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            favorite={favorites[candidate.id]}
                            onToggleFavorite={toggleFavorite}
                            onRequestInterview={handleOpenInterviewModal}
                            onViewProfile={(c) => {
                                navigate(`/dashboard/candidate/${c.id}`);
                            }}
                            onSaveNote={saveNote}
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
                candidateName={selectedCandidateForInterview?.name || "Candidate"}
                isSubmitting={isRequestingInterview}
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
                                    <SheetTitle className="text-2xl font-bold">Candidate Profile</SheetTitle>
                                    <SheetDescription className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {activeTalent.country_city || 'Regional'}</span>
                                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {activeTalent.sap_track || 'General SAP'}</span>
                                    </SheetDescription>
                                </SheetHeader>
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
