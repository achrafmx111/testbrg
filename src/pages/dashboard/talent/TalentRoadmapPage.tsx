import { motion } from "framer-motion";
import { Check, Lock, Star, Trophy, Zap, MapPin, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { fireConfetti } from "@/utils/confetti";

// Mock Data for the Roadmap
const MILESTONES = [
    { id: 1, title: "Introduction to SAP", status: "completed", type: "course", position: "left" },
    { id: 2, title: "ERP Fundamentals", status: "completed", type: "course", position: "right" },
    { id: 3, title: "ABAP Basic Programming", status: "in-progress", type: "code", position: "left" },
    { id: 4, title: "Data Dictionary", status: "locked", type: "course", position: "right" },
    { id: 5, title: "Mid-Term Assessment", status: "locked", type: "quiz", position: "center" },
    { id: 6, title: "Object Oriented ABAP", status: "locked", type: "code", position: "left" },
    { id: 7, title: "SAP Fiori UX", status: "locked", type: "course", position: "right" },
    { id: 8, title: "Final Certification", status: "locked", type: "certificate", position: "center" },
];

const BADGES = [
    { id: 1, name: "Fast Starter", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10", earned: true },
    { id: 2, name: "Bug Hunter", icon: Check, color: "text-green-500", bg: "bg-green-500/10", earned: true },
    { id: 3, name: "Code Ninja", icon: Star, color: "text-blue-500", bg: "bg-blue-500/10", earned: false },
    { id: 4, name: "Certified Pro", icon: Trophy, color: "text-purple-500", bg: "bg-purple-500/10", earned: false },
];

export default function TalentRoadmapPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Zap className="h-6 w-6 text-yellow-300" />
                        </div>
                        <div>
                            <p className="text-indigo-100 font-medium">Current Streak</p>
                            <h3 className="text-3xl font-bold">12 Days</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Star className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-muted-foreground font-medium">Total XP</p>
                            <h3 className="text-3xl font-bold text-slate-900">2,450</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-muted-foreground font-medium">Badges Earned</p>
                            <h3 className="text-3xl font-bold text-slate-900">2 / 12</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Map Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 relative overflow-hidden bg-slate-50/50 border-slate-200">
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]"
                            style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                        />

                        <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-2">
                            <MapPin className="h-6 w-6 text-primary" /> Your Learning Journey
                        </h2>

                        <div className="relative max-w-md mx-auto min-h-[800px] flex flex-col items-center">
                            {/* Central Line */}
                            <div className="absolute top-4 bottom-4 w-1 bg-slate-200 rounded-full left-1/2 -ml-0.5" />

                            {MILESTONES.map((milestone, index) => (
                                <motion.div
                                    key={milestone.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative w-full flex items-center mb-16 ${milestone.position === "left" ? "justify-end pr-[50%] mr-8 text-right" :
                                        milestone.position === "right" ? "justify-start pl-[50%] ml-8 text-left" :
                                            "justify-center z-10"
                                        }`}
                                >
                                    {/* Node Connector */}
                                    <div className={`absolute top-1/2 left-1/2 w-8 h-1 bg-slate-200 -mt-0.5 -ml-4 ${milestone.position === "center" ? "hidden" : ""
                                        }`} />

                                    {/* Node Content */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div
                                                    className={`relative z-10 flex flex-col items-center group cursor-pointer transition-transform hover:scale-110 ${milestone.position === "left" ? "items-end" :
                                                        milestone.position === "right" ? "items-start" : "items-center"
                                                        }`}
                                                    onClick={() => {
                                                        if (milestone.status === "completed") {
                                                            fireConfetti();
                                                        } else if (milestone.status === "locked") {
                                                            // Maybe shake animation?
                                                        }
                                                    }}
                                                >
                                                    <div className={`h-16 w-16 rounded-full border-4 flex items-center justify-center shadow-lg transition-all duration-300 ${milestone.status === "completed" ? "bg-green-100 border-green-500 text-green-600" :
                                                        milestone.status === "in-progress" ? "bg-white border-blue-500 text-blue-600 animate-pulse ring-4 ring-blue-500/20" :
                                                            "bg-slate-100 border-slate-300 text-slate-400 grayscale"
                                                        }`}>
                                                        {milestone.status === "locked" ? <Lock className="h-6 w-6" /> :
                                                            milestone.type === "code" ? <Zap className="h-6 w-6" /> :
                                                                milestone.type === "quiz" ? <FileText className="h-6 w-6" /> :
                                                                    milestone.type === "certificate" ? <Award className="h-6 w-6" /> :
                                                                        <Star className="h-6 w-6" />
                                                        }
                                                    </div>

                                                    <div className={`absolute top-full mt-3 w-40 p-2 bg-white rounded-lg shadow-md border text-center ${milestone.status === "locked" ? "opacity-50" : ""
                                                        } ${milestone.position === "center" ? "bg-yellow-50 border-yellow-200" : ""}`}>
                                                        <h4 className="font-bold text-sm text-slate-800">{milestone.title}</h4>
                                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{milestone.status}</span>
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{milestone.title} - {milestone.status}</p>
                                                {milestone.status === "completed" && <p className="text-xs text-green-400">Click to celebrate!</p>}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </motion.div>
                            ))}

                            {/* Finish Line */}
                            <div className="absolute bottom-0 z-10">
                                <div className="h-12 w-32 bg-slate-800 text-white rounded-lg flex items-center justify-center shadow-xl border-4 border-white font-bold tracking-widest uppercase text-xs">
                                    Finish Line
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Trophy Case</CardTitle>
                            <CardDescription>Collect badges to unlock perks.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {BADGES.map((badge) => (
                                    <div key={badge.id} className={`flex flex-col items-center p-3 rounded-lg text-center transition-all ${badge.earned ? badge.bg : "bg-slate-50 grayscale opacity-60"
                                        }`}>
                                        <badge.icon className={`h-8 w-8 mb-2 ${badge.earned ? badge.color : "text-slate-400"}`} />
                                        <span className="text-xs font-bold text-slate-700">{badge.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg">Daily Quest</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span>Complete 1 Code Challenge</span>
                                <span className="text-green-400 font-bold">0/1</span>
                            </div>
                            <Progress value={0} className="h-2 bg-slate-700" />

                            <div className="flex items-center justify-between text-sm">
                                <span>Read 2 Articles</span>
                                <span className="text-green-400 font-bold">1/2</span>
                            </div>
                            <Progress value={50} className="h-2 bg-slate-700" />

                            <Button size="sm" className="w-full mt-2 bg-white/10 hover:bg-white/20 text-white border-none">
                                View All Quests
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Helper icon component since FileText was missing in import
function FileText(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
    )
}
