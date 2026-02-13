import { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RecruitmentMessage } from "@/types";
import { Loader2, Send } from "lucide-react";

interface RecruitmentMessagingModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicationId: string;
    candidateLabel: string;
    pipelineStage?: string;
}

export const RecruitmentMessagingModal = ({
    isOpen,
    onClose,
    applicationId,
    candidateLabel,
    pipelineStage,
}: RecruitmentMessagingModalProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<RecruitmentMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [messagingEnabled, setMessagingEnabled] = useState(true);

    const canSend = useMemo(() => draft.trim().length > 0 && !sending, [draft, sending]);

    const loadMessages = async () => {
        if (!applicationId) return;
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from("recruitment_messages")
                .select("*")
                .eq("application_id", applicationId)
                .order("created_at", { ascending: true })
                .limit(200);

            if (error) {
                const tableMissing =
                    error.code === "PGRST205" ||
                    String(error.message || "").includes("recruitment_messages");
                if (tableMissing) {
                    setMessagingEnabled(false);
                    setMessages([]);
                    return;
                }
                throw error;
            }

            setMessagingEnabled(true);
            setMessages((data as RecruitmentMessage[]) || []);
        } catch (error) {
            console.error("Error loading messages:", error);
            const description = error instanceof Error ? error.message : "Please try again.";
            toast({
                variant: "destructive",
                title: "Failed to load messages",
                description,
            });
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        const body = draft.trim();
        if (!body) return;
        if (!messagingEnabled) {
            toast({
                variant: "destructive",
                title: "Messaging unavailable",
                description: "The recruitment_messages table is missing in Supabase.",
            });
            return;
        }

        setSending(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await (supabase as any)
                .from("recruitment_messages")
                .insert({
                    employer_id: user.id,
                    application_id: applicationId,
                    sender_id: user.id,
                    sender_role: "employer",
                    body,
                    metadata: {
                        pipeline_stage: pipelineStage || null,
                        moderation_status: "pending_review"
                    }
                });

            if (error) throw error;
            setDraft("");
            await loadMessages();
        } catch (error) {
            console.error("Error sending message:", error);
            const description = error instanceof Error ? error.message : "Please try again.";
            toast({
                variant: "destructive",
                title: "Message not sent",
                description,
            });
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, applicationId]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Messages</DialogTitle>
                    <DialogDescription>
                        Secure, mediated chat with <strong>{candidateLabel}</strong>.
                        <span className="block mt-1 text-[10px] text-amber-600 font-bold uppercase italic">Messages are reviewed by admins for quality assurance.</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl border bg-muted/10 overflow-hidden">
                    <ScrollArea className="h-[340px] p-4">
                        {!messagingEnabled ? (
                            <div className="py-16 text-center text-sm text-muted-foreground">
                                Messaging is disabled until <code>recruitment_messages</code> is created in Supabase.
                            </div>
                        ) : loading ? (
                            <div className="flex items-center justify-center py-16 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Loading messages...
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="py-16 text-center text-sm text-muted-foreground">
                                No messages yet. Start the conversation.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className={`flex ${m.sender_role === "employer" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm border ${m.sender_role === "employer"
                                                ? "bg-primary text-primary-foreground border-primary/30"
                                                : "bg-white text-foreground border-muted"
                                                }`}
                                        >
                                            <div className="whitespace-pre-wrap leading-relaxed">{m.body}</div>
                                            <div className={`mt-1 text-[10px] opacity-70 ${m.sender_role === "employer" ? "text-primary-foreground" : "text-muted-foreground"}`}>
                                                {new Date(m.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Write a message..."
                        rows={3}
                        className="resize-none"
                    />
                    <div className="flex items-center justify-between w-full gap-2">
                        <Button variant="outline" onClick={loadMessages} disabled={loading || sending || !messagingEnabled}>
                            Refresh
                        </Button>
                        <Button onClick={sendMessage} disabled={!canSend || !messagingEnabled}>
                            {sending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
