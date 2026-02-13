import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2, Send } from "lucide-react";

interface InterviewRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (message: string) => Promise<void>;
    candidateId: string;
    isSubmitting: boolean;
}

export const InterviewRequestModal = ({
    isOpen,
    onClose,
    onSubmit,
    candidateId,
    isSubmitting,
}: InterviewRequestModalProps) => {
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        if (!message.trim()) return;
        await onSubmit(message);
        setMessage("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Request Interview
                    </DialogTitle>
                    <DialogDescription>
                        Send a request to interview <strong>Candidate #{candidateId.slice(0, 5)}</strong>. Our admin team will coordinate with the candidate and confirm the schedule.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="message">Message to Admin / Candidate</Label>
                        <Textarea
                            id="message"
                            placeholder="e.g., We are interested in this profile for a Senior SAP Consultant role. We are available next Tuesday or Thursday..."
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Please include role details and your general availability.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!message.trim() || isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Send Request
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
