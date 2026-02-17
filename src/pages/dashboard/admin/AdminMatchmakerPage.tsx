import { useState, useMemo } from "react";
import {
    Check,
    X,
    RefreshCw,
    Zap,
    Briefcase,
    User,
    MapPin,
    Award,
    TrendingUp,
    BrainCircuit,
    Search,
    Sparkles
} from "lucide-react";
import { AdminSectionHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// --- Types ---

interface MatchCandidate {
    id: string;
    name: string;
    role: string;
    skills: string[];
    location: string;
    experience: string;
    avatar?: string;
    matchScore: number;
    matchReasons: string[];
    vectorDistance: number; // Simulated vector distance (lower is better, but we'll visualize score)
}

interface JobOpportunity {
    id: string;
    title: string;
    company: string;
    location: string;
    logo?: string;
    requirements: string[];
}

interface MatchPair {
    id: string;
    talent: MatchCandidate;
    job: JobOpportunity;
}

// --- Mock Data ---

const MOCK_MATCHES: MatchPair[] = [
    {
        id: "m_1",
        talent: {
            id: "t_1",
            name: "Omar Benali",
            role: "Senior SAP Consultant",
            skills: ["SAP S/4HANA", "Fiori", "ABAP", "German (B2)"],
            location: "Casablanca",
            experience: "5 years",
            matchScore: 92,
            matchReasons: ["Strong SAP S/4HANA expertise", "Valid work permit", "German language proficiency"],
            vectorDistance: 0.12
        },
        job: {
            id: "j_1",
            title: "SAP Solution Architect",
            company: "TechGiant GmbH",
            location: "Munich, Germany",
            requirements: ["S/4HANA", "German B2", "Migration Experience"]
        }
    },
    {
        id: "m_2",
        talent: {
            id: "t_2",
            name: "Sarah Amrani",
            role: "Java Developer",
            skills: ["Java", "Spring Boot", "React", "Docker"],
            location: "Rabat",
            experience: "3 years",
            matchScore: 78,
            matchReasons: ["Tech stack match", "Available immediately"],
            vectorDistance: 0.35
        },
        job: {
            id: "j_2",
            title: "Fullstack Engineer",
            company: "StartupBerlin",
            location: "Berlin (Remote)",
            requirements: ["Java", "React", "English C1"]
        }
    },
    {
        id: "m_3",
        talent: {
            id: "t_3",
            name: "Youssef Idrissi",
            role: "Data Scientist",
            skills: ["Python", "TensorFlow", "SQL", "Tableau"],
            location: "Marrakech",
            experience: "4 years",
            matchScore: 88,
            matchReasons: ["High skill overlap", "Portfolio quality"],
            vectorDistance: 0.18
        },
        job: {
            id: "j_3",
            title: "AI Engineer",
            company: "AutoDrive Corp",
            location: "Stuttgart, Germany",
            requirements: ["Python", "Machine Learning", "German A2"]
        }
    }
];

export default function AdminMatchmakerPage() {
    const [matches, setMatches] = useState<MatchPair[]>(MOCK_MATCHES);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [history, setHistory] = useState<{ id: string, action: 'approved' | 'rejected' }[]>([]);
    const { toast } = useToast();

    const currentMatch = matches[currentIndex];

    const handleAction = (action: 'approve' | 'reject') => {
        if (!currentMatch) return;

        // Simulate API call
        if (action === 'approve') {
            toast({
                title: "Match Confirmed! 🚀",
                description: `Notification sent to ${currentMatch.talent.name} and ${currentMatch.job.company}.`
            });
        } else {
            toast({
                title: "Match Skipped",
                description: "AI feedback recorded to improve future suggestions."
            });
        }

        setHistory(prev => [...prev, { id: currentMatch.id, action: action === 'approve' ? 'approved' : 'rejected' }]);

        // Animate out (simplified for now, just switch index)
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 200);
    };

    const reset = () => {
        setCurrentIndex(0);
        setHistory([]);
        toast({ title: "Session Reset", description: "Starting over matching session." });
    };

    if (!currentMatch) {
        return (
            <div className={adminClassTokens.pageShell}>
                <AdminSectionHeader title="Matchmaker Engine" description="AI-powered talent-job alignment." />
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                        <Check className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-semibold">All Caught Up!</h3>
                    <p className="text-muted-foreground max-w-md">
                        You've reviewed all pending AI suggestions. The engine is scanning for new matches...
                    </p>
                    <Button onClick={reset} variant="outline" className="mt-4">
                        <RefreshCw className="h-4 w-4 mr-2" /> Review Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={adminClassTokens.pageShell}>
            <AdminSectionHeader
                title="Matchmaker Engine"
                description="Review and confirm high-confidence AI matches."
                aside={
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border">
                        <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>AI Confidence Threshold: <strong>75%</strong></span>
                    </div>
                }
            />

            <div className="grid lg:grid-cols-3 gap-6 h-full">
                {/* Layout: Talent Card (Left), Job Card (Right), Controls/Info (Bottom/Center) */}

                {/* Talent Profile */}
                <Card className="lg:col-span-1 border-primary/20 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    <CardHeader className="pb-2">
                        <Badge variant="outline" className="w-fit mb-2 flex gap-1 items-center border-primary/30 text-primary bg-primary/5">
                            <User className="h-3 w-3" /> Talent Profile
                        </Badge>
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <Avatar className="h-14 w-14 border-2 border-background shadow-md">
                                    <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                                        {currentMatch.talent.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">{currentMatch.talent.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-1">
                                        <Briefcase className="h-3 w-3" /> {currentMatch.talent.role}
                                    </CardDescription>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <MapPin className="h-3 w-3" /> {currentMatch.talent.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Top Skills</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {currentMatch.talent.skills.map(skill => (
                                    <Badge key={skill} variant="secondary" className="font-normal">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Experience</h4>
                            <p className="text-sm">{currentMatch.talent.experience} in similar roles.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Center: Match Score & Action */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-6">
                    <div className="relative flex flex-col items-center justify-center">
                        <div className="relative h-32 w-32 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle className="text-muted/20 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                                <circle
                                    className="text-primary stroke-current transition-all duration-1000 ease-out"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={251.2 - (251.2 * currentMatch.talent.matchScore) / 100}
                                ></circle>
                            </svg>
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-bold">{currentMatch.talent.matchScore}%</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Match</span>
                            </div>
                        </div>

                        <div className="mt-6 w-full space-y-3 px-4">
                            <div className="bg-background border rounded-lg p-3 shadow-sm space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <BrainCircuit className="h-3 w-3" /> AI Reasoning
                                </div>
                                <ul className="text-sm space-y-1.5">
                                    {currentMatch.talent.matchReasons.map(reason => (
                                        <li key={reason} className="flex items-start gap-2">
                                            <Sparkles className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
                                            <span>{reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                                <span>Vector Distance</span>
                                <span className="font-mono">{currentMatch.talent.vectorDistance.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full justify-center pt-4">
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 w-14 rounded-full border-2 border-muted hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive transition-all"
                            onClick={() => handleAction('reject')}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        <Button
                            size="lg"
                            className="h-16 w-16 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_30px_rgba(var(--primary),0.6)] hover:scale-105 transition-all text-primary-foreground bg-primary"
                            onClick={() => handleAction('approve')}
                        >
                            <Check className="h-8 w-8" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Press <kbd className="border rounded px-1 bg-muted font-mono">←</kbd> to skip, <kbd className="border rounded px-1 bg-muted font-mono">→</kbd> to approve
                    </p>
                </div>

                {/* Job Card */}
                <Card className="lg:col-span-1 border-border/60 shadow-sm relative overflow-hidden bg-muted/10">
                    <CardHeader className="pb-2">
                        <Badge variant="outline" className="w-fit mb-2 flex gap-1 items-center">
                            <Briefcase className="h-3 w-3" /> Opportunity
                        </Badge>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-lg">{currentMatch.job.title}</CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1 font-medium text-foreground/80">
                                    {currentMatch.job.company}
                                </CardDescription>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                    <MapPin className="h-3 w-3" /> {currentMatch.job.location}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Requirements</h4>
                            <div className="flex flex-col gap-2">
                                {currentMatch.job.requirements.map(req => (
                                    <div key={req} className="flex items-center gap-2 text-sm">
                                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                                        {req}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
