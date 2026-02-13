import { useEffect, useState } from "react";
import { mvp, MvpMessage } from "@/integrations/supabase/mvp";

export default function CompanyMessagesPage() {
  const [messages, setMessages] = useState<MvpMessage[]>([]);

  useEffect(() => {
    mvp.listMessages().then(setMessages).catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Communication</h2>
      {messages.length === 0 ? <div className="rounded-lg border p-4 text-sm text-muted-foreground">No messages yet.</div> : null}
      {messages.map((message) => (
        <div key={message.id} className="rounded-lg border p-3">
          <p className="text-sm">{message.body}</p>
          <p className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
