
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { KanbanCard } from "../CompanyPipelinePage";
import { User, Sparkles } from "lucide-react";

interface DraggableCandidateCardProps {
    card: KanbanCard;
    isOverlay?: boolean;
}

export function DraggableCandidateCard({ card, isOverlay }: DraggableCandidateCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        data: {
            type: "Card",
            card,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    if (isOverlay) {
        return (
            <Card className="w-[320px] p-4 rounded-xl border-primary shadow-2xl bg-white dark:bg-slate-900 cursor-grabbing ring-2 ring-primary ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-950">
                <CardContent card={card} />
            </Card>
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
            <Card className="w-full p-4 rounded-xl border-slate-200 dark:border-slate-800 bg-white hover:border-primary/50 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing group">
                <CardContent card={card} />
            </Card>
        </div>
    );
}

function CardContent({ card }: { card: KanbanCard }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                        <AvatarImage src={card.avatarUrl} />
                        <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                            {card.title.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{card.title}</h4>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{card.subtitle}</p>
                    </div>
                </div>
                {card.matchScore >= 90 && (
                    <div className="flex items-center text-[10px] font-black text-gold bg-gold/10 px-1.5 py-0.5 rounded-md">
                        <Sparkles className="h-3 w-3 mr-1" /> {card.matchScore}%
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-1.5">
                {card.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px] font-bold px-1.5 py-0 h-5 bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                        {tag}
                    </Badge>
                ))}
            </div>

            <div className="text-[10px] text-slate-400 font-medium pt-1 flex justify-between items-center">
                <span>2 days ago</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-bold">View Profile -&gt;</span>
            </div>
        </div>
    );
}
