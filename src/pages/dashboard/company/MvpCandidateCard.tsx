import { MapPin, Zap, Star, ArrowRight, Calendar, User, MessageSquare, Heart, MoreHorizontal, Trophy, Target, Sparkles, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MvpTalentProfile } from "@/integrations/supabase/mvp";

const PIPELINE_OPTIONS = [
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interview_requested", label: "Interview Requested" },
    { value: "interviewing", label: "Interviewing" },
    { value: "offered", label: "Offered" },
    { value: "hired", label: "Hired" },
    { value: "rejected", label: "Rejected" },
] as const;

interface EmployerFavorite {
    talent_id: string;
    employer_id: string;
    notes: string;
    pipeline_status: string;
    created_at?: string;
}

interface MvpCandidateCardProps {
    candidate: MvpTalentProfile;
    favorite?: EmployerFavorite;
    matchScore?: number;
    matchBreakdown?: {
        skillsOverlap: number;
        languageMatch: number;
        readiness: number;
    };
    matchReasons?: string[];
    onToggleFavorite: (talentId: string) => void;
    onRequestInterview: (candidate: MvpTalentProfile) => void;
    onViewProfile: (candidate: MvpTalentProfile) => void;
    onSaveNote: (talentId: string, note: string) => void;
    onUpdatePipelineStatus: (talentId: string, status: string) => void;
    onMessageCandidate: (candidate: MvpTalentProfile) => void;
    isRequestingInterview: boolean;
    isSavingNote: boolean;
    tempNote: string;
    setTempNote: (note: string) => void;
    editingNote: string | null;
    setEditingNote: (id: string | null) => void;
}

export const MvpCandidateCard = ({
    candidate,
    favorite,
    matchScore,
    matchBreakdown,
    matchReasons,
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
}: MvpCandidateCardProps) => {
    const pipelineStatus = favorite?.pipeline_status || "shortlisted";
    const isFavorite = !!favorite;

    // Calculate readiness score from candidate data
    const readinessScore = candidate.readiness_score || 0;
    const isJobReady = candidate.placement_status === 'JOB_READY';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60 shadow-xl hover:shadow-2xl transition-all duration-500 group flex flex-col bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl rounded-[2.5rem]">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                <CardHeader className="pb-4 border-b border-border/40">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-primary shadow-inner group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-500">
                                    <User className="h-8 w-8 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                                {isJobReady && (
                                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-secondary rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center shadow-lg">
                                        <Zap className="h-3 w-3 text-secondary-foreground fill-secondary-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold tracking-tight text-foreground">Candidate #{candidate.user_id.slice(0, 5)}</h3>
                                    {matchScore !== undefined && matchScore > 85 && (
                                        <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-primary" /> {candidate.years_of_experience}y Exp</span>
                                    <span className="flex items-center gap-1.5"><Badge variant="outline" className="text-[10px] rounded-full border-primary/20 text-primary bg-primary/5 uppercase tracking-widest">{candidate.placement_status === 'JOB_READY' ? 'Ready' : 'Vetting'}</Badge></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            {matchScore !== undefined && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="relative group/score cursor-help">
                                                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover/score:opacity-100 transition-opacity"></div>
                                                <Badge variant="outline" className="relative h-10 px-4 bg-primary/5 text-primary border-primary/20 rounded-2xl">
                                                    <span className="text-[10px] font-black uppercase tracking-widest mr-2">Match</span>
                                                    <span className="text-lg font-black">{Math.round(matchScore)}%</span>
                                                </Badge>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-card text-foreground border p-4 rounded-xl shadow-2xl">
                                            <div className="space-y-2 w-48">
                                                <p className="font-bold text-xs uppercase tracking-widest text-slate-400">AI Score Breakdown</p>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[11px]"><span>Technical Skills</span> <span className="font-bold text-primary">{matchBreakdown?.skillsOverlap}%</span></div>
                                                    <div className="flex justify-between text-[11px]"><span>Language Proficiency</span> <span className="font-bold text-primary">{matchBreakdown?.languageMatch}%</span></div>
                                                    <div className="flex justify-between text-[11px]"><span>Professional Readiness</span> <span className="font-bold text-primary">{matchBreakdown?.readiness}%</span></div>
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6 flex-1">
                    {isFavorite && (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/40">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-primary shadow-lg shadow-primary/20 text-[10px] px-3 font-black uppercase tracking-widest rounded-full">
                                    {pipelineStatus.replace('_', ' ')}
                                </Badge>
                            </div>
                            <Select
                                value={pipelineStatus}
                                onValueChange={(v) => onUpdatePipelineStatus(candidate.user_id, v)}
                                disabled={['hired', 'rejected'].includes(pipelineStatus)}
                            >
                                <SelectTrigger className="h-9 w-40 bg-background border-none rounded-xl text-xs font-bold shadow-sm text-foreground">
                                    <SelectValue placeholder="Update Stage" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-2xl bg-background">
                                    {PIPELINE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value} className="font-medium">
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                                    <Zap className="h-3 w-3 text-secondary fill-secondary" /> Key Skills
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {candidate.skills?.slice(0, 4).map((skill, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-muted text-[10px] h-6 px-2.5 font-bold rounded-lg border-none hover:bg-primary/10 hover:text-primary transition-colors cursor-default text-foreground">
                                            {skill}
                                        </Badge>
                                    ))}
                                    {candidate.skills && candidate.skills.length > 4 && (
                                        <Badge variant="outline" className="text-[10px] h-6 border-slate-200 text-slate-400 font-bold">+{candidate.skills.length - 4}</Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                                    <Languages className="h-3 w-3 text-primary" /> Languages
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {candidate.languages?.map((lang, idx) => (
                                        <Badge key={idx} variant="outline" className="text-[10px] h-6 px-2.5 font-bold border-slate-200 text-slate-500 rounded-lg">
                                            {lang}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 rounded-3xl bg-muted/40 border border-border/60">
                        <div className="text-center space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coach</span>
                            <div className="flex justify-center items-center gap-1 text-primary">
                                <Trophy className="h-3 w-3" />
                                <span className="text-sm font-black">{candidate.coach_rating || 4.5}</span>
                            </div>
                        </div>
                        <div className="text-center space-y-1 border-x border-slate-200 dark:border-navy/40">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</span>
                            <div className="flex justify-center items-center gap-1 text-secondary">
                                <Star className="h-3 w-3 fill-secondary" />
                                <span className="text-sm font-black">4.8</span>
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                            <div className="flex justify-center items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] animate-pulse" />
                                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Private Employer Note */}
                    {isFavorite && (
                        <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-secondary flex items-center gap-2 tracking-widest uppercase">
                                    <Star className="h-3 w-3 fill-secondary" /> Recruiter Notes
                                </span>
                                <button
                                    className="text-[10px] font-black text-secondary hover:text-secondary/80 transition-colors uppercase tracking-widest"
                                    onClick={() => {
                                        setEditingNote(candidate.user_id);
                                        setTempNote(favorite.notes || "");
                                    }}
                                >
                                    {favorite.notes ? "Edit" : "Add Note"}
                                </button>
                            </div>
                            {editingNote === candidate.user_id ? (
                                <div className="space-y-3">
                                    <textarea
                                        className="w-full text-xs p-3 border-none rounded-xl bg-background shadow-inner resize-none focus:ring-1 focus:ring-secondary/20 text-foreground"
                                        value={tempNote}
                                        onChange={(e) => setTempNote(e.target.value)}
                                        placeholder="Add private evaluation notes..."
                                        rows={3}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" className="h-8 text-[10px] font-bold rounded-lg uppercase tracking-widest" onClick={() => setEditingNote(null)}>Cancel</Button>
                                        <Button size="sm" className="h-8 px-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-[10px] font-bold rounded-lg uppercase tracking-widest" onClick={() => onSaveNote(candidate.user_id, tempNote)} disabled={isSavingNote}>
                                            {isSavingNote ? "Saving..." : "Save Note"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-secondary/90 italic leading-relaxed">
                                    {favorite.notes || "No private notes. Add your evaluation to keep track of this candidate."}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            className="h-14 flex-1 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold tracking-tight shadow-xl shadow-primary/20 transition-all active:scale-95 text-lg"
                            variant="default"
                            onClick={() => onViewProfile(candidate)}
                        >
                            Candidate Profile <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>

                        <div className="flex gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-14 w-14 rounded-2xl transition-all duration-300 ${isFavorite ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
                                            onClick={() => onToggleFavorite(candidate.user_id)}
                                        >
                                            <Heart className={`h-6 w-6 ${isFavorite ? "fill-primary text-primary scale-110" : ""}`} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p className="text-xs font-bold">{isFavorite ? "Remove from Talent Pool" : "Add to Shortlist"}</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-muted hover:bg-muted/80 text-muted-foreground">
                                        <MoreHorizontal className="h-6 w-6" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl bg-background">
                                    <DropdownMenuItem className="h-11 rounded-xl gap-3 font-semibold focus:bg-primary/5 cursor-pointer text-foreground" onClick={() => onRequestInterview(candidate)}>
                                        <Calendar className="h-4 w-4 text-secondary" /> Request Interview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="h-11 rounded-xl gap-3 font-semibold focus:bg-primary/5 cursor-pointer text-foreground" onClick={() => onMessageCandidate(candidate)}>
                                        <MessageSquare className="h-4 w-4 text-primary" /> Direct Message
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default MvpCandidateCard;
