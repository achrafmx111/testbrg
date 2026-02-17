import { useMvpUser } from "@/hooks/useMvpUser";
import { Button } from "@/components/ui/button";
import { EyeOff } from "lucide-react";

export function GodModeControl() {
    const { isImpersonating, stopImpersonation, user, profile } = useMvpUser();

    if (!isImpersonating) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex flex-col items-end gap-2">
                <div className="rounded-lg border border-red-500/50 bg-black/90 p-3 shadow-2xl backdrop-blur text-white max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <p className="font-bold text-xs uppercase tracking-wider text-red-400">God Mode Active</p>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">
                        Viewing as: <span className="font-semibold text-white">{profile?.full_name || user?.id}</span>
                    </p>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-full gap-2 h-8 text-xs font-semibold"
                        onClick={stopImpersonation}
                    >
                        <EyeOff className="h-3 w-3" />
                        Exit View
                    </Button>
                </div>
            </div>
        </div>
    );
}
