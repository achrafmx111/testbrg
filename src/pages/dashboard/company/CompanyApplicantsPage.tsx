import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Calendar, MoreHorizontal, Search, Circle } from "lucide-react";
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
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
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

import { supabase } from "@/integrations/supabase/client";
import { ApplicationStage, mvp, MvpApplication, MvpJob, MvpProfile, MvpTalentProfile } from "@/integrations/supabase/mvp";
import { scoreTalentJob } from "@/lib/matchingEngine";
import { InterviewModal } from "@/components/mvp/InterviewModal";

// Stages mapped to display names and colors
const STAGE_CONFIG: Record<ApplicationStage, { label: string; color: string }> = {
    APPLIED: { label: "Applied", color: "bg-slate-100" },
    SCREEN: { label: "Screening", color: "bg-blue-100" },
    INTERVIEW: { label: "Interview", color: "bg-purple-100" },
    OFFER: { label: "Offer", color: "bg-yellow-100" },
    HIRED: { label: "Hired", color: "bg-green-100" },
    REJECTED: { label: "Rejected", color: "bg-red-50" },
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
}

function SortableItem({ id, application, profile, talent, job, onSchedule }: SortableItemProps) {
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
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 touch-none">
            <Card className="cursor-grab hover:shadow-md transition-shadow">
                <CardContent className="p-3">
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
                    if (newStage === 'INTERVIEW') {
                        // Optionally prompt for scheduling
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
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="sticky top-0 z-10 space-y-4 rounded-xl border border-border/60 bg-background/80 p-6 backdrop-blur-xl shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div data-testid="company-ats-header">
                        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Applicant Pipeline</h2>
                        <p className="text-muted-foreground mt-1">Kanban ATS view for interview flow, offers, and hiring outcomes.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                        <MetricChip label="Total" value={filteredApps.length} />
                        <MetricChip label="Interview" value={stageCounts.INTERVIEW} />
                        <MetricChip label="Offers" value={stageCounts.OFFER} />
                        <MetricChip label="Conversion" value={`${conversionRate}%`} />
                    </div>
                </div>

                <div className="grid gap-2 md:grid-cols-[1.2fr_1fr_1fr]">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                            placeholder="Search candidate or role..."
                        />
                    </div>
                    <Select
                        value={filterJobId}
                        onValueChange={(val) => {
                            const nextStage = focusStage !== "all" ? { stage: focusStage } : {};
                            setSearchParams(val === "all" ? nextStage : { ...nextStage, jobId: val });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Job" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Jobs</SelectItem>
                            {jobs.map(job => (
                                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={focusStage}
                        onValueChange={(stage) => {
                            const nextJob = filterJobId !== "all" ? { jobId: filterJobId } : {};
                            setSearchParams(stage === "all" ? nextJob : { ...nextJob, stage });
                        }}
                    >
                        <SelectTrigger>
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

                <div className="flex flex-wrap items-center gap-1.5">
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
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto min-h-0">
                    <div className="flex gap-4 min-w-max h-full pb-4 px-1">
                        {STAGES.map(stage => (
                            <div data-testid={`ats-column-${stage.toLowerCase()}`} key={stage} className={`w-[280px] flex-shrink-0 flex flex-col rounded-lg border bg-slate-50/50 ${//columns[stage].length === 0 ? 'opacity-70' : ''
                                ""
                                }`}>
                                <div className={`p-3 rounded-t-lg border-b bg-white flex items-center justify-between sticky top-0 z-10`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${STAGE_CONFIG[stage].color.replace('bg-', 'bg-').replace('100', '500')}`} />
                                        <span className="font-semibold text-sm">{STAGE_CONFIG[stage].label}</span>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] h-5">{columns[stage].length}</Badge>
                                </div>

                                <SortableContext
                                    id={stage} // This allows dropping onto empty columns
                                    items={columns[stage].map(a => a.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="flex-1 p-2 overflow-y-auto min-h-[150px]">
                                        {columns[stage].map(app => (
                                            <SortableItem
                                                key={app.id}
                                                id={app.id}
                                                application={app}
                                                profile={profiles[app.talent_id]}
                                                talent={talentProfiles[app.talent_id]}
                                                job={jobs.find(j => j.id === app.job_id)}
                                                onSchedule={() => { setSelectedApp(app); setInterviewOpen(true); }}
                                            />
                                        ))}
                                        {columns[stage].length === 0 && (
                                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50 italic py-8 border-2 border-dashed border-slate-200 rounded-md">
                                                Drop here
                                            </div>
                                        )}
                                    </div>
                                </SortableContext>
                            </div>
                        ))}
                    </div>
                </div>

                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                    {activeId ? (
                        <Card className="w-[260px] shadow-xl rotate-2 opacity-80 cursor-grabbing">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">...</div>
                                    <div>
                                        <h4 className="font-medium text-sm">Moving Candidate...</h4>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}
                </DragOverlay>

            </DndContext>

            <InterviewModal
                open={interviewOpen}
                onOpenChange={setInterviewOpen}
                applicationId={selectedApp?.id ?? null}
                onScheduled={() => {
                    if (selectedApp) {
                        // Optimistically update to INTERVIEW if not already
                        if (selectedApp.stage !== 'INTERVIEW') {
                            setApplications(prev => prev.map(a =>
                                a.id === selectedApp.id ? { ...a, stage: 'INTERVIEW' } : a
                            ));
                            mvp.updateApplicationStage(selectedApp.id, 'INTERVIEW').catch(console.error);
                        }
                    }
                }}
            />
        </div>
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
