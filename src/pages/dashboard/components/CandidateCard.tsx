import { MapPin, Zap, Target, HelpCircle, Star, ArrowRight, Calendar, User, MessageSquare } from "lucide-react";
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
import { TalentProfile, EmployerFavorite } from "@/types";
import { calculateJobReadyScore } from "@/lib/talentUtils";

const PIPELINE_OPTIONS = [
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interview_requested", label: "Interview Requested" },
    { value: "hired", label: "Hired" },
    { value: "rejected", label: "Rejected" },
] as const;

interface CandidateCardProps {
    candidate: TalentProfile;
    favorite?: EmployerFavorite;
    onToggleFavorite: (id: string) => void;
    onRequestInterview: (candidate: TalentProfile) => void;
    onViewProfile: (candidate: TalentProfile) => void;
    onSaveNote: (id: string, note: string) => void;
    onUpdatePipelineStatus: (id: string, status: string) => void;
    onMessageCandidate: (candidate: TalentProfile) => void;
    isRequestingInterview: boolean;
    isSavingNote: boolean;
    tempNote: string;
    setTempNote: (note: string) => void;
    editingNote: string | null;
    setEditingNote: (id: string | null) => void;
}

export const CandidateCard = ({
    candidate,
    favorite,
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
}: CandidateCardProps) => {
    const jobReady = calculateJobReadyScore(candidate);
    const pipelineStatus = favorite?.pipeline_status || "shortlisted";

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
                                <CardTitle className="text-lg">Candidate #{candidate.talent_id.slice(0, 5)}</CardTitle>
                                <Badge variant="outline" className="h-5 text-[10px] bg-white">
                                    {(candidate.experience_years || 0) >= 5 ? 'Senior' : (candidate.experience_years || 0) >= 2 ? 'Mid-Level' : 'Junior'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {candidate.country_city || 'Regional'}</span>
                                <span className="flex items-center gap-1">
                                    <div className={`h-2 w-2 rounded-full bg-green-500`} />
                                    Immediate
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="h-8 px-2.5 bg-white text-slate-700 border-slate-200">
                                        <span className="text-[10px] font-bold uppercase tracking-wide mr-1">Match</span>
                                        <span className="text-xs font-black">{Math.round(candidate.matchScore || 0)}%</span>
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Based on skills, language, and experience matching.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="h-8 px-2.5 bg-white text-primary border-primary/30">
                                        <Zap className="h-3.5 w-3.5 mr-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-wide mr-1">Ready</span>
                                        <span className="text-xs font-black">{jobReady.score}%</span>
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Overall Preparedness: {jobReady.status.replace('_', ' ')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-5 flex-1">
                {favorite && (
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] bg-white">
                                Pipeline
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                                {pipelineStatus}
                            </Badge>
                        </div>
                        <Select
                            value={pipelineStatus}
                            onValueChange={(v) => onUpdatePipelineStatus(candidate.talent_id, v)}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                                <Zap className="h-3 w-3 text-yellow-500" /> Why this match?
                            </h4>
                            <p className="text-xs text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-3 py-1 min-h-[72px]">
                                {candidate.ai_analysis_summary
                                    ? `${candidate.ai_analysis_summary.slice(0, 150)}...`
                                    : "Profile summary pending AI analysis."}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                                <Target className="h-3 w-3 text-primary" /> Core Competencies
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                {candidate.ai_skills?.slice(0, 6).map((s, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-primary/5 text-[9px] h-5 border-none">
                                        {s.skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 bg-muted/10 p-3 rounded-xl border border-dashed">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                            Recruitment Meta
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">SAP Track:</span>
                                <span className="font-bold text-primary">{candidate.sap_track || 'General'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">German Level:</span>
                                <Badge variant="outline" className="h-5 py-0 font-bold">{candidate.german_level || 'A2'}</Badge>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-muted-foreground">SKILL GAPS</span>
                                <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
                            </div>
                            <div className="flex gap-1">
                                <Badge variant="outline" className="text-[8px] h-4 border-red-200 text-red-500 opacity-70">
                                    Verify German
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Private Employer Note */}
                {favorite && (
                    <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-yellow-700 flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500" /> INTERNAL NOTE
                            </span>
                            <button
                                className="text-[10px] text-yellow-600 hover:underline"
                                onClick={() => {
                                    setEditingNote(candidate.talent_id);
                                    setTempNote(favorite.notes);
                                }}
                            >
                                {favorite.notes ? "Edit" : "Add Note"}
                            </button>
                        </div>
                        {editingNote === candidate.talent_id ? (
                            <div className="space-y-2">
                                <textarea
                                    className="w-full text-xs p-2 border rounded bg-white"
                                    value={tempNote}
                                    onChange={(e) => setTempNote(e.target.value)}
                                    placeholder="Add private evaluation notes..."
                                />
                                <div className="flex justify-end gap-1">
                                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditingNote(null)}>Cancel</Button>
                                    <Button size="sm" className="h-6 text-[10px]" onClick={() => onSaveNote(candidate.talent_id, tempNote)} disabled={isSavingNote}>
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
                        className={`h-10 w-10 shrink-0 transition-colors ${favorite ? 'bg-primary/5 text-primary border-primary/20' : ''}`}
                        onClick={() => onToggleFavorite(candidate.talent_id)}
                    >
                        <Star className={`h-5 w-5 ${favorite ? "fill-primary" : ""}`} />
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
                        title="Send Mediated Message"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMessageCandidate(candidate);
                        }}
                    >
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                </div>
            </CardContent>
        </Card >
    );
};
