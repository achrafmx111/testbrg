
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpJob, MvpTalentProfile } from "@/integrations/supabase/mvp";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Plus, Filter, Loader2, Sparkles } from "lucide-react";
import { PipelineColumn } from "./components/PipelineColumn";
import { DraggableCandidateCard } from "./components/DraggableCandidateCard";
import confetti from 'canvas-confetti';
import { createPortal } from "react-dom";

// Types
export type PipelineStage = "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";

export type KanbanCard = {
    id: string; // usually talent_id
    title: string; // candidate name
    subtitle: string; // rolw
    tags: string[];
    stage: PipelineStage;
    matchScore: number;
    avatarUrl?: string;
};

export type KanbanColumn = {
    id: PipelineStage;
    title: string;
    cards: KanbanCard[];
    color: string;
};

const INITIAL_COLUMNS: KanbanColumn[] = [
    { id: "applied", title: "Applied", color: "bg-slate-100 dark:bg-slate-800/50", cards: [] },
    { id: "screening", title: "Screening", color: "bg-blue-50 dark:bg-blue-900/10", cards: [] },
    { id: "interview", title: "Interview", color: "bg-purple-50 dark:bg-purple-900/10", cards: [] },
    { id: "offer", title: "Offer", color: "bg-orange-50 dark:bg-orange-900/10", cards: [] },
    { id: "hired", title: "Hired", color: "bg-green-50 dark:bg-green-900/10", cards: [] },
    { id: "rejected", title: "Rejected", color: "bg-red-50 dark:bg-red-900/10", cards: [] },
];

export default function CompanyPipelinePage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [jobs, setJobs] = useState<MvpJob[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>("all");
    const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
    const [loading, setLoading] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load Jobs
    useEffect(() => {
        const loadJobs = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const profile = await mvp.getMyProfile(user.id);
                if (profile?.company_id) {
                    const companyJobs = await mvp.listCompanyJobs(profile.company_id);
                    setJobs(companyJobs);
                    if (companyJobs.length > 0) {
                        setSelectedJobId(companyJobs[0].id);
                    }
                }
            } catch (error) {
                console.error("Error loading jobs:", error);
            } finally {
                setLoading(false);
            }
        };
        loadJobs();
    }, []);

    // Load Mock Candidates (WOW factor)
    useEffect(() => {
        if (!selectedJobId) return;

        // In a real app, this would fetch candidates for the selected job
        // For demo, we generate high-quality mock data to show the UI
        const generateMockCandidates = () => {
            const mockData: KanbanCard[] = [
                { id: "c1", title: "Sarah Weber", subtitle: "Senior SAP Consultant", tags: ["SAP FI", "German C1"], stage: "interview", matchScore: 92 },
                { id: "c2", title: "Karim Benali", subtitle: "ABAP Developer", tags: ["ABAP", "Fiori"], stage: "screening", matchScore: 88 },
                { id: "c3", title: "Thomas Muller", subtitle: "Project Manager", tags: ["PMP", "Agile"], stage: "applied", matchScore: 75 },
                { id: "c4", title: "Elena Popova", subtitle: "SAP MM Specialist", tags: ["SAP MM", "English C1"], stage: "offer", matchScore: 95 },
                { id: "c5", title: "John Smith", subtitle: "Junior Developer", tags: ["React", "Node"], stage: "rejected", matchScore: 60 },
            ];

            const newCols = INITIAL_COLUMNS.map(col => ({
                ...col,
                cards: mockData.filter(c => c.stage === col.id)
            }));
            setColumns(newCols);
        };

        generateMockCandidates();
    }, [selectedJobId]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);

        // Find the card object for the overlay
        let card: KanbanCard | null = null;
        for (const col of columns) {
            const found = col.cards.find(c => c.id === active.id);
            if (found) {
                card = found;
                break;
            }
        }
        setActiveCard(card);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find source and dest containers
        const sourceCol = columns.find(col => col.cards.some(c => c.id === activeId));
        const destCol = columns.find(col => col.id === overId || col.cards.some(c => c.id === overId));

        if (!sourceCol || !destCol || sourceCol === destCol) return;

        // Optimistic update for hover (optional, can be skipped for simpler implementation)
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveCard(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const sourceCol = columns.find(col => col.cards.some(c => c.id === activeId));

        // Determine destination column
        // If dropping on a container (column), destId is the column id
        // If dropping on a card, find that card's column
        let destCol = columns.find(col => col.id === overId);
        if (!destCol) {
            destCol = columns.find(col => col.cards.some(c => c.id === overId));
        }

        if (!sourceCol || !destCol || sourceCol.id === destCol.id) {
            return;
        }

        // Move the card
        const cardToMove = sourceCol.cards.find(c => c.id === activeId);
        if (cardToMove) {
            setColumns(prev => prev.map(col => {
                if (col.id === sourceCol.id) {
                    return { ...col, cards: col.cards.filter(c => c.id !== activeId) };
                }
                if (col.id === destCol!.id) {
                    return { ...col, cards: [...col.cards, { ...cardToMove, stage: destCol!.id }] };
                }
                return col;
            }));

            // Hired Effect
            if (destCol.id === 'hired') {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#0ea5e9', '#eab308', '#ffffff'] // Brand colors
                });
                toast({
                    title: "Candidate Hired! 🎉",
                    description: `${cardToMove.title} has been moved to the Hired stage.`,
                    className: "bg-green-50 border-green-200 text-green-900"
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 pb-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Pipeline <Sparkles className="h-6 w-6 text-gold animate-pulse" />
                    </h1>
                    <p className="text-slate-500 font-medium">Drag and drop candidates to update their status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                        <SelectTrigger className="w-[280px] h-12 rounded-xl bg-white dark:bg-slate-800 border-slate-200 shadow-sm font-bold">
                            <Briefcase className="mr-2 h-4 w-4 text-primary" />
                            <SelectValue placeholder="Select a job role..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Active Roles</SelectItem>
                            {jobs.map(job => (
                                <SelectItem key={job.id} value={job.id} className="font-medium">{job.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button className="h-12 px-6 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                        <Plus className="mr-2 h-5 w-5" /> Add Candidate
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="flex gap-4 h-full min-w-[1400px] pb-4 px-1">
                        {columns.map(col => (
                            <PipelineColumn key={col.id} column={col} />
                        ))}
                    </div>
                </div>

                {
                    createPortal(
                        <DragOverlay dropAnimation={defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })}>
                            {activeCard ? (
                                <div className="transform rotate-3 cursor-grabbing">
                                    <DraggableCandidateCard card={activeCard} isOverlay />
                                </div>
                            ) : null}
                        </DragOverlay>,
                        document.body
                    )
                }
            </DndContext >
        </div >
    );
}
