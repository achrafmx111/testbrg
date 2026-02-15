import { MapPin, Zap, Star, ArrowRight, Calendar, User, MessageSquare, Heart, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Card className="overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg transition-all group flex flex-col bg-white">
            <CardHeader className="pb-4 border-b bg-slate-50/60">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shadow-inner">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">Candidate #{candidate.user_id.slice(0, 5)}</CardTitle>
                                <Badge variant={isJobReady ? "default" : "secondary"} className="h-5 text-[10px]">
                                    {isJobReady ? 'Job Ready' : 'In Training'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Available</span>
                                <span className="flex items-center gap-1">
                                    <div className={`h-2 w-2 rounded-full ${isJobReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                    {isJobReady ? 'Immediate' : 'In Progress'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {matchScore !== undefined && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="outline" className="h-8 px-2.5 bg-white text-slate-700 border-slate-200">
                                            <span className="text-[10px] font-bold uppercase tracking-wide mr-1">Match</span>
                                            <span className="text-xs font-black">{Math.round(matchScore)}%</span>
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">Based on skills, language, and experience matching.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="h-8 px-2.5 bg-white text-primary border-primary/30">
                                        <Zap className="h-3.5 w-3.5 mr-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-wide mr-1">Ready</span>
                                        <span className="text-xs font-black">{readinessScore}%</span>
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Overall readiness score based on skills and training</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-5 flex-1">
                {isFavorite && (
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] bg-white">
                                Pipeline
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                                {pipelineStatus.replace('_', ' ')}
                            </Badge>
                        </div>
                        <Select
                            value={pipelineStatus}
                            onValueChange={(v) => onUpdatePipelineStatus(candidate.user_id, v)}
                            disabled={['hired', 'rejected'].includes(pipelineStatus)}
                        >
                            <SelectTrigger className={`h-8 w-[170px] bg-white ${['hired', 'rejected'].includes(pipelineStatus) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <SelectValue placeholder="Update stage" />
                            </SelectTrigger>
                            <SelectContent>
                                {PIPELINE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Match Breakdown */}
                {matchBreakdown && (
                    <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-2 rounded">
                        <div className="flex justify-between"><span>Skills:</span> <span>{matchBreakdown.skillsOverlap}%</span></div>
                        <div className="flex justify-between"><span>Language:</span> <span>{matchBreakdown.languageMatch}%</span></div>
                        <div className="flex justify-between"><span>Readiness:</span> <span>{matchBreakdown.readiness}%</span></div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                                <Zap className="h-3 w-3 text-yellow-500" /> Skills
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                {candidate.skills?.slice(0, 6).map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-primary/5 text-[9px] h-5 border-none">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                                Languages
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                {candidate.languages?.map((lang, idx) => (
                                    <span key={idx} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 bg-muted/10 p-3 rounded-xl border border-dashed">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                            Details
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Experience:</span>
                                <span className="font-bold text-primary">{candidate.years_of_experience} years</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Coach Rating:</span>
                                <span className="font-bold">{candidate.coach_rating}/5</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Availability:</span>
                                <Badge variant={candidate.availability ? "outline" : "secondary"} className="h-5 py-0 text-[10px]">
                                    {candidate.availability ? 'Available' : 'Not Available'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Private Employer Note */}
                {isFavorite && (
                    <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-yellow-700 flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500" /> INTERNAL NOTE
                            </span>
                            <button
                                className="text-[10px] text-yellow-600 hover:underline"
                                onClick={() => {
                                    setEditingNote(candidate.user_id);
                                    setTempNote(favorite.notes || "");
                                }}
                            >
                                {favorite.notes ? "Edit" : "Add Note"}
                            </button>
                        </div>
                        {editingNote === candidate.user_id ? (
                            <div className="space-y-2">
                                <textarea
                                    className="w-full text-xs p-2 border rounded bg-white"
                                    value={tempNote}
                                    onChange={(e) => setTempNote(e.target.value)}
                                    placeholder="Add private evaluation notes..."
                                    rows={2}
                                />
                                <div className="flex justify-end gap-1">
                                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditingNote(null)}>Cancel</Button>
                                    <Button size="sm" className="h-6 text-[10px]" onClick={() => onSaveNote(candidate.user_id, tempNote)} disabled={isSavingNote}>
                                        {isSavingNote ? "..." : "Save"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-yellow-800 italic">
                                {favorite.notes || "No notes yet. Add your evaluation here."}
                            </p>
                        )}
                    </div>
                )}

                <div className="pt-1 flex flex-wrap gap-2 sm:flex-nowrap">
                    <Button
                        className="h-10 w-full shadow-primary/10 transition-all group-hover:bg-primary sm:flex-1"
                        variant="default"
                        onClick={() => onViewProfile(candidate)}
                    >
                        View Full Profile <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className={`h-10 w-10 shrink-0 transition-colors ${isFavorite ? 'bg-primary/5 text-primary border-primary/20' : ''}`}
                        onClick={() => onToggleFavorite(candidate.user_id)}
                    >
                        <Heart className={`h-5 w-5 ${isFavorite ? "fill-primary text-primary" : ""}`} />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 shrink-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Quick Interview Request"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRequestInterview(candidate);
                        }}
                        disabled={isRequestingInterview || favorite?.pipeline_status === 'interview_requested'}
                    >
                        <Calendar className="h-5 w-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Send Message"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMessageCandidate(candidate);
                        }}
                    >
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default MvpCandidateCard;
