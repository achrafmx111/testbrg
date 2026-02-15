import { useEffect, useState } from "react";
import { MessageSquare, Bell } from "lucide-react";
import { mvp } from "@/integrations/supabase/mvp";
import { AdminSectionHeader, AdminStatCard } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { AdminMessagingQueue } from "@/pages/dashboard/components/AdminMessagingQueue";

export default function AdminMessagingPage() {
  const [messagesCount, setMessagesCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [messages, notifications] = await Promise.all([mvp.listMessages(), mvp.listNotifications()]);
      setMessagesCount(messages.length);
      setNotificationsCount(notifications.length);
    };
    load().catch(() => undefined);
  }, []);

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader title="Messaging & Notifications" description="Communication hub for all platform messages and notifications." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Messages"
          value={messagesCount}
          tone="primary"
          icon={<MessageSquare className="h-4 w-4 text-primary" />}
        />
        <AdminStatCard
          label="Notifications"
          value={notificationsCount}
          tone="accent"
          icon={<Bell className="h-4 w-4 text-accent-foreground" />}
        />
      </div>

      {/* Legacy Messaging Queue — fully self-contained */}
      <div className="mt-6">
        <AdminMessagingQueue />
      </div>
    </div>
  );
}
