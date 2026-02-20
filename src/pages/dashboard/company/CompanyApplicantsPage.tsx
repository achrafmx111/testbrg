import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GripVertical, Briefcase, Filter, Loader2, Calendar, MoreHorizontal, Search, Circle, Sparkles, Users, Target, TrendingUp, Plus, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    TooltipPortal
} from "@/components/ui/tooltip";
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimation,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { restrictToWindowEdges, snapCenterToCursor } from '@dnd-kit/modifiers';

import { supabase } from "@/integrations/supabase/client";
import { ApplicationStage, mvp, MvpApplication, MvpJob, MvpProfile, MvpTalentProfile } from "@/integrations/supabase/mvp";
import { scoreTalentJob } from "@/lib/matchingEngine";
import { InterviewModal } from "@/components/mvp/InterviewModal";
import { HiringAgent } from "@/services/agents/HiringAgent";
import { AgentInsight } from "@/services/agents/types";


// Stages mapped to display names and colors
const STAGE_CONFIG: Record<ApplicationStage, { label: string; color: string; gradient: string }> = {
    APPLIED: { label: "Applied", color: "bg-slate-100", gradient: "from-slate-100/90 to-slate-100/30" },
    SCREEN: { label: "Screening", color: "bg-primary/20", gradient: "from-primary/20 to-primary/5" },
    INTERVIEW: { label: "Interview", color: "bg-secondary/20", gradient: "from-secondary/20 to-secondary/5" },
    OFFER: { label: "Offer", color: "bg-yellow-100", gradient: "from-amber-100/80 to-amber-50/20" },
    HIRED: { label: "Hired", color: "bg-green-100", gradient: "from-emerald-100/80 to-emerald-50/20" },
    REJECTED: { label: "Rejected", color: "bg-red-50", gradient: "from-rose-100/70 to-rose-50/20" },
};

const STAGES: ApplicationStage[] = ["APPLIED", "SCREEN", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

// --- Components ---

interface SortableItemProps {
    id: string;
    application: MvpApplication;
    profile?: MvpProfile;
    talent?: MvpTalentProfile;
    job?: MvpJob;
    onSchedule: (app: MvpApplication) => void;
    agentInsight?: AgentInsight;
}

function SortableItem({ id, application, profile, talent, job, onSchedule, agentInsight }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    let matchScore = 0;
    if (job && talent) {
        matchScore = scoreTalentJob(talent, job).score;
    }

    return (
        <div ref={setNodeRef} style={style} className="mb-3 touch-none group relative" data-testid="company-applicant-card">
            <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors border-r border-transparent hover:border-border group-hover:opacity-100 opacity-0 bg-muted/20"
                    title="Drag to move"
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>

                <CardContent className="p-3 pl-8">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {(profile?.full_name?.[0] || "U").toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-medium text-sm truncate max-w-[120px]" title={profile?.full_name || "Unknown"}>
                                    {profile?.full_name || "Unknown"}
                                </h4>
                                <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                    {job?.title}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {matchScore > 0 && (
                                <Badge variant={matchScore > 80 ? "default" : "secondary"} className="text-[10px] px-1 h-5">
                                    {matchScore}%
                                </Badge>
                            )}
                            {agentInsight && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] px-1 h-5 border-primary/40 bg-primary/10 text-primary cursor-help"
                                                onPointerDown={(e) => e.stopPropagation()}
                                            >
                                                AI Insight
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipPortal>
                                            <TooltipContent side="top" sideOffset={10} className="max-w-xs z-[100] p-3 space-y-2">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-xs uppercase tracking-wider text-primary">AI Match Analysis</p>
                                                    <p className="text-xs leading-relaxed">{agentInsight.reasoning}</p>
                                                </div>

                                                {agentInsight.strengths?.length > 0 && (
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-green-600 uppercase">Key Strengths</p>
                                                        <ul className="text-[10px] list-disc pl-3 text-muted-foreground">
                                                            {agentInsight.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                                        </ul>
                                                    </div>
                                                )}

                                                {agentInsight.risks?.length > 0 && (
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-amber-600 uppercase">Considerations</p>
                                                        <ul className="text-[10px] list-disc pl-3 text-muted-foreground">
                                                            {agentInsight.risks.map((r, i) => <li key={i}>{r}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                            </TooltipContent>
                                        </TooltipPortal>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 border-t pt-2">
                        <span>{new Date(application.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title="Schedule Interview"
                                onClick={(e) => { e.stopPropagation(); onSchedule(application); }}
                            >
                                <Calendar className="h-3 w-3" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link to={`/company/talent-pool?id=${application.talent_id}`}>View Profile</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

interface ApplicantColumnProps {
    stage: ApplicationStage;
    applications: MvpApplication[];
    profiles: Record<string, MvpProfile>;
    talentProfiles: Record<string, MvpTalentProfile>;
    jobs: MvpJob[];
    onSchedule: (app: MvpApplication) => void;
    agentInsights: Record<string, AgentInsight>;
}

function ApplicantColumn({ stage, applications, profiles, talentProfiles, jobs, onSchedule, agentInsights }: ApplicantColumnProps) {
    const { setNodeRef } = useDroppable({
        id: stage,
    });

    return (
        <div ref={setNodeRef} data-testid={`ats-column-${stage.toLowerCase()}`} className="w-[300px] flex-shrink-0 flex flex-col rounded-xl border border-border/60 bg-card/40">
            <div className={`p-4 rounded-t-xl border-b bg-gradient-to-br ${STAGE_CONFIG[stage].gradient} flex items-center justify-between sticky top-0 z-10`}>
                <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${STAGE_CONFIG[stage].color.replace('bg-', 'bg-').replace('100', '500')}`} />
                    <span className="font-bold text-sm text-foreground">{STAGE_CONFIG[stage].label}</span>
                </div>
                <Badge variant="secondary" className="border-0 bg-card/70 font-bold text-foreground h-5">
                    {applications.length}
                </Badge>
            </div>

            <SortableContext
                id={stage}
                items={applications.map(a => a.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 p-2 overflow-y-auto min-h-[150px]">
                    {applications.map(app => (
                        <SortableItem
                            key={app.id}
                            id={app.id}
                            application={app}
                            profile={profiles[app.talent_id]}
                            talent={talentProfiles[app.talent_id]}
                            job={jobs.find(j => j.id === app.job_id)}
                            onSchedule={onSchedule}
                            agentInsight={agentInsights[app.id]}
                        />
                    ))}
                    {applications.length === 0 && (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50 italic py-8 border-2 border-dashed border-slate-200 rounded-md">
                            Drop here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

// --- Main Page ---

export default function CompanyApplicantsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const filterJobId = searchParams.get("jobId") ?? "all";
    const focusStage = (searchParams.get("stage") as ApplicationStage | null) ?? "all";
    const { toast } = useToast();

    // Data
    const [applications, setApplications] = useState<MvpApplication[]>([]);
    const [jobs, setJobs] = useState<MvpJob[]>([]);
    const [profiles, setProfiles] = useState<Record<string, MvpProfile>>({});
    const [talentProfiles, setTalentProfiles] = useState<Record<string, MvpTalentProfile>>({});
    const [loading, setLoading] = useState(true);
    const [agentInsights, setAgentInsights] = useState<Record<string, AgentInsight>>({});


    // Modal
    const [interviewOpen, setInterviewOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<MvpApplication | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Dnd Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Require slight movement to start drag
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const [activeId, setActiveId] = useState<string | null>(null);

    // Load Data
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const companyProfile = await mvp.getMyProfile(user.id);
            if (!companyProfile?.company_id) return;

            const [apps, jobsData, allProfiles, allTalents] = await Promise.all([
                mvp.listCompanyApplications(companyProfile.company_id),
                mvp.listCompanyJobs(companyProfile.company_id),
                mvp.listProfiles("TALENT"),
                mvp.listTalentProfiles()
            ]);

            setApplications(apps);
            setJobs(jobsData);

            // Fix: Map using talent_id or user_id correctly.
            // MvpProfile.id is usually uuid. MvpApplication.talent_id should match MvpProfile.id or user_id.
            // Checking mvp.ts, MvpApplication.talent_id matches MvpTalentProfile.user_id usually.

            const profMap: Record<string, MvpProfile> = {};
            allProfiles.forEach(p => profMap[p.id] = p);
            setProfiles(profMap);

            const talentMap: Record<string, MvpTalentProfile> = {};
            allTalents.forEach(t => talentMap[t.user_id] = t);
            setTalentProfiles(talentMap);

        } catch (err) {
            console.error(err);
            toast({ variant: "destructive", title: "Error", description: "Failed to load applications." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const runAgent = useCallback(async (apps: MvpApplication[], jobsData: MvpJob[], talents: Record<string, MvpTalentProfile>) => {
        const agent = new HiringAgent();
        const newInsights: Record<string, AgentInsight> = {};

        for (const app of apps) {
            const job = jobsData.find(j => j.id === app.job_id);
            const talent = talents[app.talent_id];
            if (job && talent) {
                const insight = await agent.analyzeMatch(job, talent);
                newInsights[app.id] = insight;
            }
        }
        setAgentInsights(newInsights);
    }, []);

    useEffect(() => {
        if (!loading && applications.length > 0) {
            runAgent(applications, jobs, talentProfiles);
        }
    }, [loading, applications.length, runAgent, jobs, talentProfiles]);


    useEffect(() => {
        load();
    }, [load]);

    // Derived state for columns
    const filteredApps = applications.filter(app =>
        (filterJobId === "all" || app.job_id === filterJobId) &&
        (focusStage === "all" || app.stage === focusStage) &&
        (searchTerm.trim().length === 0 ||
            profiles[app.talent_id]?.full_name?.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
            jobs.find((job) => job.id === app.job_id)?.title?.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    );

    const stageCounts: Record<ApplicationStage, number> = {
        APPLIED: filteredApps.filter((a) => a.stage === "APPLIED").length,
        SCREEN: filteredApps.filter((a) => a.stage === "SCREEN").length,
        INTERVIEW: filteredApps.filter((a) => a.stage === "INTERVIEW").length,
        OFFER: filteredApps.filter((a) => a.stage === "OFFER").length,
        HIRED: filteredApps.filter((a) => a.stage === "HIRED").length,
        REJECTED: filteredApps.filter((a) => a.stage === "REJECTED").length,
    };

    const conversionRate = filteredApps.length
        ? Math.round(((stageCounts.HIRED + stageCounts.OFFER) / filteredApps.length) * 100)
        : 0;

    const columns: Record<ApplicationStage, MvpApplication[]> = {
        APPLIED: filteredApps.filter(a => a.stage === 'APPLIED'),
        SCREEN: filteredApps.filter(a => a.stage === 'SCREEN'),
        INTERVIEW: filteredApps.filter(a => a.stage === 'INTERVIEW'),
        OFFER: filteredApps.filter(a => a.stage === 'OFFER'),
        HIRED: filteredApps.filter(a => a.stage === 'HIRED'),
        REJECTED: filteredApps.filter(a => a.stage === 'REJECTED'),
    };

    // Drag Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        // Optional: Could add drop indicators here
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeAppId = active.id as string;
        const overId = over.id as string; // This could be a container ID (stage) or an item ID

        // Determine target stage
        let newStage: ApplicationStage | null = null;

        // If dropped on a container (column)
        if (STAGES.includes(overId as ApplicationStage)) {
            newStage = overId as ApplicationStage;
        } else {
            // If dropped on another item, find that item's stage
            const overApp = applications.find(a => a.id === overId);
            if (overApp) {
                newStage = overApp.stage;
            }
        }

        if (newStage) {
            const activeApp = applications.find(a => a.id === activeAppId);
            if (activeApp && activeApp.stage !== newStage) {
                // Optimistic UI Update
                setApplications(prev => prev.map(a =>
                    a.id === activeAppId ? { ...a, stage: newStage! } : a
                ));

                try {
                    await mvp.updateApplicationStage(activeAppId, newStage);
                    toast({ title: "Updated", description: `Moved to ${STAGE_CONFIG[newStage].label}` });

                    if (newStage === 'HIRED') {
                        confetti({
                            particleCount: 150,
                            spread: 68,
                            origin: { y: 0.65 },
                            colors: ["#22c55e", "#0ea5e9", "#f59e0b"],
                        });
                    }
                } catch (error) {
                    // Revert on failure
                    console.error(error);
                    setApplications(prev => prev.map(a =>
                        a.id === activeAppId ? { ...a, stage: activeApp.stage } : a
                    ));
                    toast({ variant: "destructive", title: "Error", description: "Failed to update stage." });
                }
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 pb-6 animate-in fade-in duration-500">
            <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
                            <Sparkles className="mr-1 h-3.5 w-3.5 text-primary" /> Hiring Intelligence
                        </Badge>
                        <h1 data-testid="company-ats-header" className="text-3xl font-bold tracking-tight text-foreground">Applicant Pipeline</h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            Move candidates across stages, monitor conversion health, and keep momentum visible for every role.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={filterJobId}
                            onValueChange={(val) => {
                                const nextStage = focusStage !== "all" ? { stage: focusStage } : {};
                                setSearchParams(val === "all" ? nextStage : { ...nextStage, jobId: val });
                            }}
                        >
                            <SelectTrigger className="h-10 w-[240px]">
                                <Briefcase className="mr-2 h-4 w-4 text-primary" />
                                <SelectValue placeholder="All active roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All active roles</SelectItem>
                                {jobs.map((job) => (
                                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Link to="/company/talent-pool">
                            <Button className="h-10 gap-2 shadow-sm">
                                <Plus className="h-4 w-4" /> Add candidate
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Candidates in flow" value={`${filteredApps.length}`} icon={<Users className="h-4 w-4 text-primary" />} />
                <MetricCard label="Interview stage" value={`${stageCounts.INTERVIEW}`} icon={<Target className="h-4 w-4 text-primary" />} />
                <MetricCard label="Hiring Conversion" value={`${conversionRate}%`} icon={<TrendingUp className="h-4 w-4 text-primary" />} />
                <MetricCard label="Hired" value={`${stageCounts.HIRED}`} icon={<Sparkles className="h-4 w-4 text-primary" />} />
            </section>

            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Filter className="h-4 w-4 text-primary" /> Drag and drop candidates across hiring stages
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-[280px]">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-9 pl-9 text-xs"
                                placeholder="Search candidate or role..."
                            />
                        </div>

                        <Select
                            value={focusStage}
                            onValueChange={(stage) => {
                                const nextJob = filterJobId !== "all" ? { jobId: filterJobId } : {};
                                setSearchParams(stage === "all" ? nextJob : { ...nextJob, stage });
                            }}
                        >
                            <SelectTrigger className="h-9 w-[160px] text-xs">
                                <SelectValue placeholder="Focus stage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stages</SelectItem>
                                {STAGES.map((stage) => (
                                    <SelectItem key={stage} value={stage}>{STAGE_CONFIG[stage].label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-1.5">
                    <StageQuickFilter active={focusStage === "all"} onClick={() => setSearchParams(filterJobId === "all" ? {} : { jobId: filterJobId })} label="All" />
                    {STAGES.map((stage) => (
                        <StageQuickFilter
                            key={stage}
                            active={focusStage === stage}
                            onClick={() => setSearchParams(filterJobId === "all" ? { stage } : { jobId: filterJobId, stage })}
                            label={`${STAGE_CONFIG[stage].label} (${stageCounts[stage]})`}
                        />
                    ))}
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToWindowEdges, snapCenterToCursor]}
                >
                    <div className="overflow-x-auto overflow-y-hidden">
                        <div className="flex h-full min-w-[1400px] gap-4 pb-4 px-1">
                            {STAGES.map((stage) => (
                                <ApplicantColumn
                                    key={stage}
                                    stage={stage}
                                    applications={columns[stage]}
                                    profiles={profiles}
                                    talentProfiles={talentProfiles}
                                    jobs={jobs}
                                    onSchedule={(app) => { setSelectedApp(app); setInterviewOpen(true); }}
                                    agentInsights={agentInsights}
                                />
                            ))}
                        </div>
                    </div>

                    <DragOverlay dropAnimation={defaultDropAnimation}>
                        {activeId ? (() => {
                            const activeApp = applications.find(a => a.id === activeId);
                            const activeProfile = activeApp ? profiles[activeApp.talent_id] : null;
                            const activeJob = activeApp ? jobs.find(j => j.id === activeApp.job_id) : null;

                            return (
                                <Card className="w-[300px] border-primary/60 p-3 opacity-95 shadow-2xl ring-2 ring-primary/20 bg-white border-2 z-[9999] pointer-events-none">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                            {(activeProfile?.full_name?.[0] || "U").toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-foreground truncate">
                                                {activeProfile?.full_name || "Unknown Candidate"}
                                            </h4>
                                            <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-tight">
                                                Moving candidate...
                                            </p>
                                            {activeJob && (
                                                <p className="text-[9px] text-primary font-medium truncate mt-0.5">
                                                    {activeJob.title}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })() : null}
                    </DragOverlay>
                </DndContext>

                <InterviewModal
                    open={interviewOpen}
                    onOpenChange={setInterviewOpen}
                    applicationId={selectedApp?.id ?? null}
                    onScheduled={() => {
                        if (selectedApp && selectedApp.stage !== "INTERVIEW") {
                            setApplications((prev) => prev.map((a) =>
                                a.id === selectedApp.id ? { ...a, stage: "INTERVIEW" } : a
                            ));
                            mvp.updateApplicationStage(selectedApp.id, "INTERVIEW").catch(console.error);
                        }
                    }}
                />
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
    return (
        <Card className="border-border/60 shadow-sm transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
                <div>
                    <p className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-foreground">{value}</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-primary shadow-sm">{icon}</div>
            </CardContent>
        </Card>
    );
}

function MetricChip({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
}

function StageQuickFilter({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${active
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
                }`}
        >
            <Circle className={`h-2.5 w-2.5 ${active ? "fill-current" : ""}`} />
            {label}
        </button>
    );
}
