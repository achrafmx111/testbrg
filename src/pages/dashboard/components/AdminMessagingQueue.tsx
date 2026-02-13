import { useCallback, useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Mail, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { logSecurityEvent } from "@/lib/auditLogger";

export const AdminMessagingQueue = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);

    const fetchPendingMessages = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from('recruitment_messages')
                .select('*, application:applications(name, email), employer:profiles(email)')
                .eq('status', 'pending_review')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast({ variant: "destructive", title: "Failed to load messages" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const handleAction = async (messageId: string, action: 'approved_and_sent' | 'rejected') => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await (supabase as any)
                .from('recruitment_messages')
                .update({
                    status: action,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: user?.id
                })
                .eq('id', messageId);

            if (error) throw error;

            toast({
                title: action === 'approved_and_sent' ? "Message Approved" : "Message Rejected",
                variant: action === 'approved_and_sent' ? "default" : "destructive"
            });

            // Log activity
            const msg = messages.find(m => m.id === messageId);
            if (msg) {
                // Application activity log (Business context)
                await (supabase as any).from('application_activity_logs').insert({
                    application_id: msg.application_id,
                    activity_type: action === 'approved_and_sent' ? 'message_approved' : 'message_rejected',
                    description: `Admin ${action === 'approved_and_sent' ? 'approved' : 'rejected'} a message from employer.`,
                    actor_role: 'admin',
                    actor_id: user?.id,
                    event_type: 'messaging_action'
                });

                // Security log (Compliance context)
                await logSecurityEvent({
                    userId: user?.id,
                    action: action === 'approved_and_sent' ? 'MESSAGE_APPROVED' : 'MESSAGE_REJECTED',
                    resourceType: 'recruitment_message',
                    resourceId: messageId
                });
            }

            fetchPendingMessages();
        } catch (error) {
            console.error("Error updating message status:", error);
            toast({ variant: "destructive", title: "Action failed" });
        }
    };

    useEffect(() => {
        fetchPendingMessages();
    }, [fetchPendingMessages]);

    if (loading && messages.length === 0) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card className="border-0 shadow-elegant">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            Messaging Review Queue
                        </CardTitle>
                        <CardDescription>
                            Review mediated messages between employers and candidates to ensure compliance.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {messages.length} Pending
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {messages.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                        <MessageSquare className="h-10 w-10 mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">No messages pending review.</p>
                    </div>
                ) : (
                    <div className="rounded-xl border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Sender (Employer)</TableHead>
                                    <TableHead>Recipient (Candidate)</TableHead>
                                    <TableHead className="w-[40%]">Message Body</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {messages.map((msg) => (
                                    <TableRow key={msg.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium text-xs">
                                            {msg.employer?.email}
                                        </TableCell>
                                        <TableCell className="font-medium text-xs text-blue-600">
                                            {msg.application?.name} <br />
                                            <span className="text-[10px] text-muted-foreground">{msg.application?.email}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="bg-white p-3 rounded-lg border text-xs shadow-sm max-h-24 overflow-y-auto whitespace-pre-wrap">
                                                {msg.body}
                                            </div>
                                            {msg.pipeline_stage && (
                                                <Badge variant="outline" className="mt-2 text-[9px] uppercase tracking-tighter">
                                                    Stage: {msg.pipeline_stage}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-[10px] text-muted-foreground">
                                            {format(new Date(msg.created_at), "MMM d, HH:mm")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50"
                                                    onClick={() => handleAction(msg.id, 'approved_and_sent')}
                                                    title="Approve & Send"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleAction(msg.id, 'rejected')}
                                                    title="Reject"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
