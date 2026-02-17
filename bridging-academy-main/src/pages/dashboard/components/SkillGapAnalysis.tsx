import React from "react";
import { CheckCircle2, AlertCircle, XCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SkillGapAnalysisProps {
    analysis: {
        track: string;
        requirements: string[];
        matched: string[];
        missing: string[];
        readiness: number;
    };
}

export const SkillGapAnalysis = ({ analysis }: SkillGapAnalysisProps) => {
    return (
        <Card className="border-0 shadow-elegant overflow-hidden">
            <CardHeader className="bg-primary/5 pb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            {analysis.track} Role Readiness
                        </CardTitle>
                        <CardDescription>
                            Comparing your skills against market standards for this track.
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-black text-primary">{analysis.readiness}%</span>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Match Score</p>
                    </div>
                </div>
                <Progress value={analysis.readiness} className="h-2 bg-primary/10" />
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                {/* Matched Skills */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-green-600 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Verified Competencies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {analysis.matched.length > 0 ? analysis.matched.map((skill, i) => (
                            <Badge key={i} className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 px-3 py-1">
                                {skill}
                            </Badge>
                        )) : (
                            <p className="text-sm text-muted-foreground italic">No core competencies verified yet.</p>
                        )}
                    </div>
                </div>

                {/* Missing Skills / Gaps */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> Identified Skill Gaps
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {analysis.missing.length > 0 ? analysis.missing.map((skill, i) => (
                            <Badge key={i} variant="outline" className="border-amber-200 text-amber-700 bg-amber-50/50 px-3 py-1">
                                {skill}
                            </Badge>
                        )) : (
                            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-800 text-arabic">تبارك الله! لقد استوفيت جميع المتطلبات الأساسية لهذا المسار.</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
