import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, MapPin, Target, Zap, HelpCircle, Star,
    Calendar, Mail, Phone, Link as LinkIcon, Download,
    CheckCircle2, Clock, Award, Briefcase, GraduationCap,
    Globe, Shield, ChevronRight, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TalentProfile, ActivityLog, EmployerFavorite } from "@/types";
import { calculateMatchScore } from "@/lib/talentUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { InterviewRequestModal } from "./components/InterviewRequestModal";

const CandidateProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [candidate, setCandidate] = useState<TalentProfile | null>(null);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [favorite, setFavorite] = useState<EmployerFavorite | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [interviewModalOpen, setInterviewModalOpen] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [tempNote, setTempNote] = useState("");
    const [editingNote, setEditingNote] = useState(false);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, logsRes, userRes, favRes] = await Promise.all([
                (supabase as any).from('applications').select('*').eq('id', id).single(),
                (supabase as any).from('application_activity_logs').select('*').eq('application_id', id).order('created_at', { ascending: false }),
                supabase.auth.getUser(),
                (supabase as any).from('employer_favorites').select('*').eq('application_id', id).maybeSingle()
            ]);

            if (profileRes.error) throw profileRes.error;

            const candidateData = profileRes.data as TalentProfile;
            candidateData.matchScore = calculateMatchScore(candidateData, {
                track: "all",
                german: "all",
                exp: "all",
                avail: "all"
            });

            setCandidate(candidateData);
            setLogs((logsRes.data as any) || []);
            setFavorite((favRes.data as any) || null);
            setTempNote((favRes.data as any)?.notes || "");

            if (userRes.data.user) {
                const { data: userData } = await (supabase as any)
                    .from('profiles')
                    .select('*')
                    .eq('id', userRes.data.user.id)
                    .single();
                setUserProfile(userData);
            }
        } catch (error: any) {
            console.error("Error fetching candidate:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load candidate profile."
            });
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!candidate || !userProfile) return;

        try {
            if (favorite) {
                const { error } = await supabase
                    .from('employer_favorites')
                    .delete()
                    .eq('employer_id', userProfile.id)
                    .eq('application_id', candidate.id);
                if (error) throw error;
                setFavorite(null);
                toast({ title: "Removed from shortlist" });
            } else {
                const { data, error } = await (supabase as any)
                    .from('employer_favorites')
                    .insert({
                        employer_id: userProfile.id,
                        application_id: candidate.id,
                        pipeline_status: 'shortlisted'
                    })
                    .select()
                    .single();
                if (error) throw error;
                setFavorite(data as any);
                toast({ title: "Added to shortlist" });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error updating shortlist" });
        }
    };

    const handleSaveNote = async () => {
        if (!favorite || !userProfile) return;
        setIsSavingNote(true);
        try {
            const { error } = await supabase
                .from('employer_favorites')
                .update({ notes: tempNote })
                .eq('employer_id', userProfile.id)
                .eq('application_id', id);
            if (error) throw error;
            setFavorite({ ...favorite, notes: tempNote } as any);
            setEditingNote(false);
            toast({ title: "Note saved" });
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to save note" });
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleDownloadCV = async () => {
        if (!candidate?.cv_path) return;
        try {
            const { data, error } = await supabase.storage
                .from('application-docs')
                .createSignedUrl(candidate.cv_path, 60);
            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (error) {
            toast({ variant: "destructive", title: "Download failed" });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-10 space-y-8 animate-pulse">
                <Skeleton className="h-10 w-32" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-2 h-[600px] rounded-3xl" />
                    <Skeleton className="h-[400px] rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!candidate) return null;

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" className="group" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Talent Pool
                </Button>
                <div className="flex items-center gap-3">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleToggleFavorite}
                                    className={favorite ? "text-primary border-primary bg-primary/5 shadow-inner" : ""}
                                >
                                    <Star className={`h-5 w-5 ${favorite ? "fill-primary" : ""}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Shortlist Candidate</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button
                        onClick={() => setInterviewModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        Request Interview
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Hero Card */}
                    <Card className="border-0 shadow-elegant overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
                            <div className="absolute top-6 right-6">
                                <div className={`h-20 w-20 rounded-full border-4 flex flex-col items-center justify-center bg-white shadow-2xl ${(candidate.matchScore || 0) > 80 ? 'border-green-500 text-green-600' : (candidate.matchScore || 0) > 50 ? 'border-yellow-500 text-yellow-600' : 'border-gray-300 text-gray-500'}`}>
                                    <span className="text-xl font-black leading-none">{candidate.matchScore}%</span>
                                    <span className="text-[10px] uppercase font-black tracking-tighter">Match</span>
                                </div>
                            </div>
                        </div>
                        <CardContent className="relative px-8 pb-8">
                            <div className="flex flex-col md:flex-row gap-6 -mt-10">
                                <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-xl">
                                    <div className="h-full w-full rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                                        <User className="h-10 w-10" />
                                    </div>
                                </div>
                                <div className="mt-12 md:mt-10 flex-1">
                                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Candidate #{candidate.id.slice(0, 8)}</h1>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground font-medium">
                                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {candidate.country_city || 'Relocating'}</span>
                                        <Separator orientation="vertical" className="h-4 hidden md:block" />
                                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Active in Talent Pool</span>
                                        <Separator orientation="vertical" className="h-4 hidden md:block" />
                                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Registered {new Date(candidate.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-8" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                            <Shield className="h-4 w-4" /> Professional Snapshot
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl">
                                                <span className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4" /> SAP Expertise</span>
                                                <Badge className="bg-primary/10 text-primary border-0">{candidate.sap_track || 'Functional'}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl">
                                                <span className="text-sm text-muted-foreground flex items-center gap-2"><Globe className="h-4 w-4" /> German Proficiency</span>
                                                <Badge variant="outline" className="font-bold border-2">{candidate.german_level || 'A2'}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl">
                                                <span className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Relevant Experience</span>
                                                <span className="font-bold text-foreground">{candidate.experience_years || 0} Years</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                        <Zap className="h-4 w-4" /> AI Evaluation Summary
                                    </h3>
                                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Target className="h-20 w-20" />
                                        </div>
                                        <p className="text-sm leading-relaxed text-foreground/90 italic">
                                            "{candidate.ai_analysis_summary || "This candidate shows strong potential in the SAP ecosystem with balanced technical and linguistic skills."}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skill Tags & Timeline Tabs would go here, using simple vertical layout for now */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Skills Section */}
                        <Card className="border-0 shadow-elegant p-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Extracted Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {candidate.ai_skills?.map((s, idx) => (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <Badge variant="secondary" className="px-3 py-1 bg-muted/50 border-0 hover:bg-primary/10 transition-colors">
                                            {s.skill}
                                        </Badge>
                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-primary ${s.level === 'Advanced' ? 'w-full' : s.level === 'Intermediate' ? 'w-2/3' : 'w-1/3'}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Education/Links? Placeholder for now */}
                        <Card className="border-0 shadow-elegant p-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Contact & Links</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <span>{candidate.id.slice(0, 8)}@bridging-academy.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                        <LinkIcon className="h-4 w-4" />
                                    </div>
                                    <span className="text-muted-foreground italic">Profile protected by Bridging Academy</span>
                                </div>
                                <Button className="w-full mt-2 gap-2" variant="outline" onClick={handleDownloadCV} disabled={!candidate.cv_path}>
                                    <Download className="h-4 w-4" /> Request CV from Admin
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Timeline Section */}
                    <Card className="border-0 shadow-elegant">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" /> Candidate Journey & Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:left-3.5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-muted before:to-transparent">
                                {logs.length > 0 ? logs.map((log, idx) => (
                                    <div key={log.id} className="relative">
                                        <div className="absolute -left-[2.15rem] mt-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-white z-10" />
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-bold text-foreground capitalize">{log.action.replace('_', ' ')}</h4>
                                                <span className="text-[10px] font-medium text-muted-foreground uppercase">{new Date(log.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed italic">{log.description}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center text-muted-foreground">
                                        <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                                            <HelpCircle className="h-6 w-6 opacity-30" />
                                        </div>
                                        <p className="text-sm italic">No activity logs recorded yet for this candidate.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Sticky Actions/Notes */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-elegant sticky top-8">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Star className="h-4 w-4 fill-primary" /> Internal Evaluation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!editingNote ? (
                                <div className="space-y-4">
                                    <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 min-h-[120px]">
                                        <p className="text-sm text-yellow-800 italic leading-relaxed">
                                            {favorite?.notes || "No private notes yet. Use this space to track evaluation thoughts, interview feedback, or specific concerns."}
                                        </p>
                                    </div>
                                    <Button className="w-full h-11" variant="outline" onClick={() => setEditingNote(true)}>
                                        {favorite?.notes ? "Edit Evaluation" : "Add Evaluation"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                    <textarea
                                        className="w-full text-sm p-4 border rounded-2xl bg-white focus:ring-2 focus:ring-primary/20 transition-all min-h-[150px]"
                                        value={tempNote}
                                        onChange={(e) => setTempNote(e.target.value)}
                                        placeholder="Enter your internal observations here..."
                                    />
                                    <div className="flex gap-2">
                                        <Button className="flex-1" variant="ghost" onClick={() => setEditingNote(false)}>Cancel</Button>
                                        <Button className="flex-1" onClick={handleSaveNote} disabled={isSavingNote}>
                                            {isSavingNote ? <Clock className="animate-spin h-4 w-4 mr-2" /> : "Save Note"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick Status</h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs">Shortlist Status:</span>
                                    <Badge variant={favorite ? "secondary" : "outline"} className={favorite ? "bg-primary/10 text-primary" : ""}>
                                        {favorite ? favorite.pipeline_status.replace('_', ' ').toUpperCase() : "NOT SHORTLISTED"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Interview Modal */}
            <InterviewRequestModal
                isOpen={interviewModalOpen}
                onClose={() => setInterviewModalOpen(false)}
                onSubmit={async (msg) => {
                    if (!userProfile) return;
                    try {
                        const { error: reqError } = await (supabase as any)
                            .from('interview_requests')
                            .insert({
                                employer_id: userProfile.id,
                                application_id: candidate.id,
                                status: 'pending',
                                message: msg
                            });

                        if (reqError) throw reqError;

                        toast({
                            title: "Interview Request Sent",
                            description: "Our team has been notified and will coordinate with the candidate."
                        });
                        setInterviewModalOpen(false);
                    } catch (error: any) {
                        toast({
                            variant: "destructive",
                            title: "Request Failed",
                            description: "Unable to process your request at this time."
                        });
                    }
                }}
                candidateId={candidate.id}
                isSubmitting={false}
            />
        </div>
    );
};

export default CandidateProfile;
