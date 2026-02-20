
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MatchAnalysis } from "@/services/job-matching.service";

interface MatchBreakdownProps {
    analysis: MatchAnalysis;
}

export function MatchBreakdown({ analysis }: MatchBreakdownProps) {
    const { score, matchingSkills, missingSkills, reason } = analysis;

    return (
        <div className="space-y-6 py-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Match Probability</h4>
                    <p className="text-3xl font-bold text-primary">{score}%</p>
                </div>
                <div className={`h-12 w-12 rounded-full border-4 flex items-center justify-center font-bold ${score >= 80 ? "border-green-500 text-green-600" :
                        score >= 50 ? "border-amber-500 text-amber-600" :
                            "border-slate-300 text-slate-400"
                    }`}>
                    {score >= 80 ? "A" : score >= 60 ? "B" : "C"}
                </div>
            </div>

            <Progress value={score} className="h-2" />

            <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">{reason}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <h5 className="text-xs font-bold flex items-center gap-2 text-green-600 uppercase">
                        <CheckCircle2 className="h-4 w-4" /> Skills Matched
                    </h5>
                    <div className="flex flex-wrap gap-2">
                        {matchingSkills.length > 0 ? (
                            matchingSkills.map(skill => (
                                <Badge key={skill} variant="secondary" className="bg-green-500/10 text-green-700 border-green-200/50">
                                    {skill}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground italic">No skills matched yet.</span>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <h5 className="text-xs font-bold flex items-center gap-2 text-amber-600 uppercase">
                        <AlertCircle className="h-4 w-4" /> Missing Skills
                    </h5>
                    <div className="flex flex-wrap gap-2">
                        {missingSkills.length > 0 ? (
                            missingSkills.map(skill => (
                                <Badge key={skill} variant="outline" className="text-amber-700 border-amber-200 bg-amber-50/50">
                                    {skill}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground italic">You have all the required skills!</span>
                        )}
                    </div>
                </div>
            </div>

            {missingSkills.length > 0 && (
                <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-primary">Pro Tip:</span> Adding <strong>{missingSkills[0]}</strong> to your profile could increase your score by up to 10%.
                    </p>
                </div>
            )}
        </div>
    );
}
