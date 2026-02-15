import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mvp } from "@/integrations/supabase/mvp";

interface InterviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    applicationId: string | null;
    onScheduled?: () => void;
}

export function InterviewModal({ open, onOpenChange, applicationId, onScheduled }: InterviewModalProps) {
    const [scheduledAt, setScheduledAt] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [feedback, setFeedback] = useState("");
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const handleSchedule = async () => {
        if (!applicationId) return;
        setSaving(true);
        try {
            await mvp.createInterview({
                application_id: applicationId,
                scheduled_at: new Date(scheduledAt).toISOString(),
                meeting_link: meetingLink,
                feedback: feedback
            });

            // Auto-update stage
            await mvp.updateApplicationStage(applicationId, "INTERVIEW");

            toast({ title: "Interview Scheduled", description: "Notification sent." });
            onOpenChange(false);
            onScheduled?.();

            // Reset form
            setScheduledAt("");
            setMeetingLink("");
            setFeedback("");
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed", description: error?.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                    <DialogDescription>
                        Schedule an interview and notify the candidate.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date & Time</label>
                        <Input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Meeting Link</label>
                        <Input
                            placeholder="https://meet.google.com/..."
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes / Instructions</label>
                        <Textarea
                            placeholder="Please prepare..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSchedule} disabled={saving || !scheduledAt}>
                        {saving ? "Scheduling..." : "Schedule"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
