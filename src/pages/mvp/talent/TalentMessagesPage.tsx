import { useEffect, useState } from "react";
import { mvp } from "@/integrations/supabase/mvp";

export default function TalentMessagesPage() {
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    mvp
      .listMessages()
      .then((rows) => setMessageCount(rows.length))
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Messages & Notifications</h2>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total messages</p>
        <p className="text-2xl font-semibold">{messageCount}</p>
      </div>
    </div>
  );
}
