import { useEffect, useState } from "react";
import { mvp } from "@/integrations/supabase/mvp";

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
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Messaging & Notifications</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Messages</p>
          <p className="text-2xl font-semibold">{messagesCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Notifications</p>
          <p className="text-2xl font-semibold">{notificationsCount}</p>
        </div>
      </div>
    </div>
  );
}
