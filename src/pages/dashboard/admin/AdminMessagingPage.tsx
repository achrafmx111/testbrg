import { useEffect, useState } from "react";
import { MessageSquare, Bell, CheckCircle, AlertTriangle } from "lucide-react";
import { mvp } from "@/integrations/supabase/mvp";
import { AdminSectionHeader, AdminStatCard } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { AdminMessagingQueue } from "@/pages/dashboard/components/AdminMessagingQueue";

export default function AdminMessagingPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalMessages: 0,
        pendingReview: 0,
        notifications: 0,
        flagged: 0
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [messages, notifications] = await Promise.all([
                    mvp.listMessages(),
                    mvp.listNotifications()
                ]);

                setStats({
                    totalMessages: messages.length,
                    pendingReview: messages.filter(m => m.status === 'pending_review').length, // Assuming status exists on message type or we filter differently
                    notifications: notifications.length,
                    flagged: 0 // Placeholder for future flagged content logic
                });
            } catch (error) {
                console.error("Failed to load messaging stats", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className={adminClassTokens.pageShell}>
            <AdminSectionHeader
                title="Messaging Center"
                description="Moderate communications and manage system notifications."
            />

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
                <AdminStatCard
                    label="Total Messages"
                    value={stats.totalMessages}
                    tone="neutral"
                    icon={<MessageSquare className="h-4 w-4 text-slate-500" />}
                />
                <AdminStatCard
                    label="Pending Review"
                    value={stats.pendingReview}
                    tone={stats.pendingReview > 0 ? "warning" : "success"}
                    icon={<AlertTriangle className={`h-4 w-4 ${stats.pendingReview > 0 ? "text-amber-500" : "text-green-500"}`} />}
                />
                <AdminStatCard
                    label="System Notifications"
                    value={stats.notifications}
                    tone="primary"
                    icon={<Bell className="h-4 w-4 text-primary" />}
                />
                <AdminStatCard
                    label="Flagged Content"
                    value={stats.flagged}
                    tone="critical"
                    icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
                />
            </div>

            {/* Main Content: Messaging Queue */}
            <div className="space-y-6">
                <AdminMessagingQueue />
            </div>
        </div>
    );
}
