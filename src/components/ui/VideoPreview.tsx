import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Video, VideoOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Assuming you have a utils/cn or similar

interface VideoPreviewProps {
    stream: MediaStream | null;
    isLoading: boolean;
    error: Error | null;
    onEnable: () => void;
    onDisable: () => void;
    className?: string;
}

export function VideoPreview({ stream, isLoading, error, onEnable, onDisable, className }: VideoPreviewProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    if (error) {
        return (
            <Card className={cn("flex flex-col items-center justify-center bg-muted/50 p-6 text-center text-muted-foreground", className)}>
                <VideoOff className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">Camera access denied or unavailable</p>
                <Button variant="link" size="sm" onClick={onEnable} className="mt-2 text-primary">
                    Try Again
                </Button>
            </Card>
        );
    }

    if (!stream && !isLoading) {
        return (
            <Card className={cn("hidden", className)}> {/* Typically hidden if not enabled, handled by parent, or show placeholder */}
                {/* Optional: Placeholder state if you want it visible when off */}
            </Card>
        );
    }

    return (
        <Card className={cn("relative overflow-hidden bg-black/90 shadow-lg border-primary/20", className)}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white/70" />
                </div>
            )}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted // Self-view should always be muted to prevent echo
                className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
            />

            <div className="absolute bottom-3 right-3 z-20">
                <div className="flex gap-2">
                    <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 rounded-full shadow-md hover:bg-red-600"
                        onClick={onDisable}
                        title="Turn Off Camera"
                    >
                        <VideoOff className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="absolute top-3 left-3 z-20">
                <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    You
                </span>
            </div>
        </Card>
    );
}
