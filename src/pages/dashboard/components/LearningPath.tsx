import React from "react";
import { BookOpen, Star, Rocket, ChevronRight, PlayCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LearningPathProps {
    missingSkills: string[];
    track: string;
}

export const LearningPath = ({ missingSkills, track }: LearningPathProps) => {
    const phases = [
        {
            title: "Phase 1: Foundation",
            description: "Master the fundamental concepts and basic tools.",
            skills: missingSkills.slice(0, 2),
            icon: BookOpen,
            status: "current"
        },
        {
            title: "Phase 2: Core Expertise",
            description: "Deep dive into functional and technical specialization.",
            skills: missingSkills.slice(2, 4),
            icon: Star,
            status: "locked"
        },
        {
            title: "Phase 3: Job Ready",
            description: "Final certification prep and real-world projects.",
            skills: missingSkills.slice(4),
            icon: Rocket,
            status: "locked"
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">Personalized Learning Roadmap</h3>
                <Badge variant="outline" className="text-primary border-primary/20">
                    Generated for {track}
                </Badge>
            </div>

            <div className="relative space-y-12 before:absolute before:inset-0 before:left-6 before:h-full before:w-0.5 before:bg-slate-100">
                {phases.map((phase, i) => (
                    <div key={i} className="relative pl-14">
                        {/* Phase Icon Bubble */}
                        <div className={`absolute left-0 top-0 h-12 w-12 rounded-2xl flex items-center justify-center z-10 shadow-sm border-2 transition-all ${phase.status === 'current'
                                ? 'bg-primary border-primary text-white scale-110 shadow-primary/20'
                                : 'bg-white border-slate-100 text-slate-300'
                            }`}>
                            <phase.icon className="h-6 w-6" />
                        </div>

                        {/* Content Card */}
                        <div className={`p-6 rounded-3xl border transition-all ${phase.status === 'current'
                                ? 'bg-white shadow-elegant border-primary/10'
                                : 'bg-slate-50/50 border-slate-100 opacity-80'
                            }`}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h4 className={`font-bold ${phase.status === 'current' ? 'text-slate-900' : 'text-slate-500'}`}>
                                        {phase.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                                </div>
                                {phase.status === 'locked' && <Lock className="h-4 w-4 text-slate-300" />}
                            </div>

                            {phase.skills.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Focused Gaps:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {phase.skills.map((skill, idx) => (
                                                <Badge key={idx} variant="secondary" className="bg-white border shadow-sm text-xs py-1">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {phase.status === 'current' && (
                                        <Button className="w-full gap-2 rounded-xl h-11" onClick={() => window.open('/skillcore', '_blank')}>
                                            <PlayCircle className="h-4 w-4" /> Start Learning <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-green-600 font-medium">Phase completed! You have mastered these skills.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
