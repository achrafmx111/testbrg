import { MapPin, Zap, Target, HelpCircle, Star, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { TalentProfile, EmployerFavorite } from "@/types";

interface CandidateCardProps {
    candidate: TalentProfile;
    favorite?: EmployerFavorite;
    onToggleFavorite: (id: string) => void;
    onRequestInterview: (candidate: TalentProfile) => void;
    onViewProfile: (candidate: TalentProfile) => void;
    onSaveNote: (id: string, note: string) => void;
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
    isRequestingInterview,
    isSavingNote,
    tempNote,
    setTempNote,
    editingNote,
    setEditingNote
}: CandidateCardProps) => {
    return (
        <Card className="overflow-hidden border-0 shadow-elegant hover:shadow-xl transition-all group flex flex-col relative">
            {/* Match Score Badge (Float) */}
            <div className="absolute top-4 right-4 z-10">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className={`h-12 w-12 rounded-full border-4 flex flex-col items-center justify-center bg-white shadow-lg ${(candidate.matchScore || 0) > 80 ? 'border-green-500 text-green-600' :
                                (candidate.matchScore || 0) > 50 ? 'border-yellow-500 text-yellow-600' : 'border-gray-300 text-gray-500'
                                }`}>
                                <span className="text-xs font-bold leading-none">{candidate.matchScore}%</span>
                                <span className="text-[8px] uppercase font-bold">Match</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Based on skills, language, and experience matching.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shadow-inner">
                        {(candidate.name || 'C').split(' ')[0][0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">Candidate #{candidate.id.slice(0, 5)}</CardTitle>
                            <Badge variant="outline" className="h-5 text-[10px] bg-white">
                                {(candidate.experience_years || 0) >= 5 ? 'Senior' : (candidate.experience_years || 0) >= 2 ? 'Mid-Level' : 'Junior'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {candidate.country_city || 'Regional'}</span>
                            <span className="flex items-center gap-1">
                                {/* Availability hardcoded or dynamic based on type, using 'Immediate' as fallback if not present */}
                                <div className={`h-2 w-2 rounded-full bg-green-500`} />
                                Immediate
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                                <Zap className="h-3 w-3 text-yellow-500" /> Why this match?
                            </h4>
                            <p className="text-xs text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-3 py-1">
                                {candidate.ai_analysis_summary?.slice(0, 150)}...
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

                        <Separator className="my-2" />

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-muted-foreground">SKILL GAPS</span>
                                <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
                            </div>
                            <div className="flex gap-1">
                                {/* Hardcoded for now as per original design */}
                                <Badge variant="outline" className="text-[8px] h-4 border-red-200 text-red-500 opacity-70">
                                    Verify German
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Private Employer Note */}
                {favorite && (
                    <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100 mt-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-yellow-700 flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500" /> INTERNAL NOTE
                            </span>
                            <button
                                className="text-[10px] text-yellow-600 hover:underline"
                                onClick={() => {
                                    setEditingNote(candidate.id);
                                    setTempNote(favorite.notes);
                                }}
                            >
                                {favorite.notes ? "Edit" : "Add Note"}
                            </button>
                        </div>
                        {editingNote === candidate.id ? (
                            <div className="space-y-2">
                                <textarea
                                    className="w-full text-xs p-2 border rounded bg-white"
                                    value={tempNote}
                                    onChange={(e) => setTempNote(e.target.value)}
                                    placeholder="Add private evaluation notes..."
                                />
                                <div className="flex justify-end gap-1">
                                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditingNote(null)}>Cancel</Button>
                                    <Button size="sm" className="h-6 text-[10px]" onClick={() => onSaveNote(candidate.id, tempNote)} disabled={isSavingNote}>
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

                <div className="pt-2 flex gap-2">
                    <Button
                        className="flex-1 h-10 shadow-lg shadow-primary/10 group-hover:bg-primary group-hover:scale-[1.02] transition-all"
                        variant="default"
                        onClick={() => onViewProfile(candidate)}
                    >
                        View Full Profile <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className={`h-10 w-10 transition-colors ${favorite ? 'bg-primary/5 text-primary border-primary/20' : ''}`}
                        onClick={() => onToggleFavorite(candidate.id)}
                    >
                        <Star className={`h-5 w-5 ${favorite ? "fill-primary" : ""}`} />
                    </Button>

                    {/* Request Interview Shortcut */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Quick Interview Request"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRequestInterview(candidate);
                        }}
                        disabled={isRequestingInterview || favorite?.pipeline_status === 'interview_requested'}
                    >
                        <Calendar className="h-5 w-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
