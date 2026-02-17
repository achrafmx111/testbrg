
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DraggableCandidateCard } from "./DraggableCandidateCard";
import { KanbanColumn } from "../CompanyPipelinePage";
import { Badge } from "@/components/ui/badge";

interface PipelineColumnProps {
    column: KanbanColumn;
}

export function PipelineColumn({ column }: PipelineColumnProps) {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: "Column",
            column,
        }
    });

    return (
        <div className="flex flex-col h-full w-[350px] shrink-0">
            {/* Column Header */}
            <div className={`p-4 rounded-t-2xl border-b border-white/20 backdrop-blur-sm ${column.color}`}>
                <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">{column.title}</h3>
                    <Badge variant="secondary" className="bg-white/50 border-0 text-slate-600 font-bold dark:bg-black/20 dark:text-slate-300">
                        {column.cards.length}
                    </Badge>
                </div>
                {/* Decorative Line */}
                <div className="h-1 w-12 bg-primary/20 rounded-full mt-3" />
            </div>

            {/* Droppable Area */}
            <div ref={setNodeRef} className={`flex-1 p-3 rounded-b-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 overflow-y-auto ${column.color}`}>
                <div className="flex flex-col gap-3 min-h-[150px]">
                    <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {column.cards.map(card => (
                            <DraggableCandidateCard key={card.id} card={card} />
                        ))}
                    </SortableContext>

                    {column.cards.length === 0 && (
                        <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium uppercase tracking-widest opacity-50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl m-2 py-8">
                            Drop Here
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
