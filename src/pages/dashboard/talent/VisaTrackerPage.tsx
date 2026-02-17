import { useState } from "react";
import {
    CheckCircle2,
    Circle,
    FileText,
    Briefcase,
    Landmark,
    Plane,
    ChevronRight,
    ExternalLink,
    Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VisaStep {
    id: string;
    title: string;
    description: string;
    icon: any;
    status: "completed" | "current" | "upcoming";
    checklist: {
        id: string;
        text: string;
        isCompleted: boolean;
    }[];
}

const MOCK_VISA_STEPS: VisaStep[] = [
    {
        id: "step_1",
        title: "Job Offer & Contract",
        description: "Secure a valid employment contract from a German employer.",
        icon: Briefcase,
        status: "completed",
        checklist: [
            { id: "c_1", text: "Receive official employment contract", isCompleted: true },
            { id: "c_2", text: "Verify salary meets Blue Card threshold (€45,300/year for IT)", isCompleted: true },
            { id: "c_3", text: "Sign and return the contract", isCompleted: true }
        ]
    },
    {
        id: "step_2",
        title: "Diploma Recognition (ZAB)",
        description: "Get your university degree recognized in Germany (Anabin/ZAB).",
        icon: FileText,
        status: "current",
        checklist: [
            { id: "c_4", text: "Check degree status on Anabin database", isCompleted: true },
            { id: "c_5", text: "Prepare certified translations of degree/transcripts", isCompleted: true },
            { id: "c_6", text: "Submit Statement of Comparability application to ZAB", isCompleted: false },
            { id: "c_7", text: "Pay ZAB fees (€200)", isCompleted: false }
        ]
    },
    {
        id: "step_3",
        title: "Blocked Account & Insurance",
        description: "Prove financial stability and health coverage.",
        icon: Landmark,
        status: "upcoming",
        checklist: [
            { id: "c_8", text: "Open Blocked Account (Sperrkonto) - e.g., Expatrio, Coracle", isCompleted: false },
            { id: "c_9", text: "Deposit required amount (approx. €11,208)", isCompleted: false },
            { id: "c_10", text: "Get Incoming Health Insurance (Travel Insurance)", isCompleted: false }
        ]
    },
    {
        id: "step_4",
        title: "Visa Application",
        description: "Apply for the National Visa (Type D) at the German Embassy.",
        icon: Plane,
        status: "upcoming",
        checklist: [
            { id: "c_11", text: "Fill out VIDEX application form", isCompleted: false },
            { id: "c_12", text: "Book appointment at German Embassy (Rabat)", isCompleted: false },
            { id: "c_13", text: "Prepare biometric photos & passport copies", isCompleted: false },
            { id: "c_14", text: "Attend interview & submit documents", isCompleted: false }
        ]
    }
];

export default function VisaTrackerPage() {
    const [steps, setSteps] = useState<VisaStep[]>(MOCK_VISA_STEPS);
    const [selectedStepId, setSelectedStepId] = useState<string>(MOCK_VISA_STEPS[1].id);

    const activeStepIndex = steps.findIndex(s => s.status === "current");
    const overallProgress = (steps.reduce((acc, step) => {
        const completedTasks = step.checklist.filter(c => c.isCompleted).length;
        return acc + completedTasks;
    }, 0) / steps.reduce((acc, step) => acc + step.checklist.length, 0)) * 100;

    const handleToggleCheck = (stepId: string, checkId: string) => {
        setSteps(prev => prev.map(step => {
            if (step.id !== stepId) return step;
            return {
                ...step,
                checklist: step.checklist.map(ch =>
                    ch.id === checkId ? { ...ch, isCompleted: !ch.isCompleted } : ch
                )
            };
        }));
    };

    const selectedStep = steps.find(s => s.id === selectedStepId) || steps[0];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Relocation Tracker 🇩🇪</h2>
                    <p className="text-muted-foreground">Track your journey from Contract to Landing in Munich.</p>
                </div>
                <Card className="p-4 flex items-center gap-4 border-primary/20 bg-primary/5">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Overall Readiness</span>
                        <span className="text-2xl font-bold text-primary">{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="h-10 w-[1px] bg-border" />
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Next Milestone</span>
                        <span className="text-sm font-medium">ZAB Recognition</span>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                {/* Left Column: Vertical Stepper */}
                <div className="lg:col-span-4 overflow-y-auto pr-2 space-y-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = step.id === selectedStepId;
                        const isCompleted = step.status === "completed";
                        const isCurrent = step.status === "current";

                        return (
                            <div
                                key={step.id}
                                onClick={() => setSelectedStepId(step.id)}
                                className={cn(
                                    "relative flex gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:bg-muted/50",
                                    isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card",
                                    isCompleted && !isActive && "opacity-70"
                                )}
                            >
                                {index < steps.length - 1 && (
                                    <div className={cn(
                                        "absolute left-[29px] top-12 bottom-[-18px] w-[2px]",
                                        isCompleted ? "bg-primary" : "bg-muted"
                                    )} />
                                )}

                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2",
                                    isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                        isCurrent ? "bg-background border-primary text-primary animate-pulse" :
                                            "bg-muted border-muted-foreground/30 text-muted-foreground"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={cn("font-medium", isActive && "text-primary")}>{step.title}</h3>
                                        {isCurrent && <Badge variant="default" className="text-[10px] h-5">Current</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{step.description}</p>

                                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Progress value={(step.checklist.filter(c => c.isCompleted).length / step.checklist.length) * 100} className="h-1.5 w-16" />
                                        <span>{step.checklist.filter(c => c.isCompleted).length}/{step.checklist.length}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Column: Detail View */}
                <Card className="lg:col-span-8 h-full flex flex-col">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    selectedStep.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                )}>
                                    <selectedStep.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle>{selectedStep.title}</CardTitle>
                                    <CardDescription>{selectedStep.description}</CardDescription>
                                </div>
                            </div>
                            {selectedStep.status === "completed" && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-6">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                <Info className="h-4 w-4 text-primary" />
                                <span>Action Checklist</span>
                            </div>

                            <div className="space-y-3">
                                {selectedStep.checklist.map(item => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "flex items-start gap-3 p-3 rounded-lg border transition-all",
                                            item.isCompleted ? "bg-muted/30 border-muted" : "bg-card border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "h-5 w-5 rounded border flex items-center justify-center shrink-0 cursor-pointer mt-0.5",
                                                item.isCompleted ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground hover:border-primary"
                                            )}
                                            onClick={() => handleToggleCheck(selectedStep.id, item.id)}
                                        >
                                            {item.isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                                        </div>
                                        <span className={cn(
                                            "text-sm",
                                            item.isCompleted && "text-muted-foreground line-through"
                                        )}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg p-4 mt-6">
                                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" /> Recommended Resources
                                </h4>
                                <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1">
                                    {selectedStep.id === 'step_2' && (
                                        <>
                                            <li><a href="#" className="underline hover:text-blue-900">Anabin Database Guide</a></li>
                                            <li><a href="#" className="underline hover:text-blue-900">ZAB Application Portal</a></li>
                                        </>
                                    )}
                                    {selectedStep.id === 'step_4' && (
                                        <>
                                            <li><a href="#" className="underline hover:text-blue-900">VIDEX Online Form</a></li>
                                            <li><a href="#" className="underline hover:text-blue-900">Rabat Embassy Appointment System</a></li>
                                        </>
                                    )}
                                    {selectedStep.id !== 'step_2' && selectedStep.id !== 'step_4' && (
                                        <li><a href="#" className="underline hover:text-blue-900">Bridging Academy Wiki: {selectedStep.title}</a></li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/10 p-4 flex justify-end">
                        <Button disabled={selectedStep.status === "completed"}>
                            {selectedStep.status === "completed" ? "Step Completed" : "Mark Step as Done"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
