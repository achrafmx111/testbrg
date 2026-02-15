import { useEffect, useState } from "react";
import { Loader2, Send, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpMessage, MvpProfile } from "@/integrations/supabase/mvp";

export default function CompanyMessagesPage() {
  const [messages, setMessages] = useState<MvpMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, MvpProfile>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [msgs, allProfiles] = await Promise.all([
        mvp.listMessages(),
        mvp.listProfiles() // Fetch all profiles (talent & company users)
      ]);

      // Filter messages where I am involved
      const myMsgs = msgs.filter(m => m.from_user_id === user.id || m.to_user_id === user.id);
      setMessages(myMsgs);

      const profMap: Record<string, MvpProfile> = {};
      allProfiles.forEach(p => profMap[p.id] = p);
      setProfiles(profMap);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = async () => {
    if (!selectedUserId || !newMessage.trim()) return;
    setSending(true);
    try {
      await mvp.sendMessage(selectedUserId, newMessage);
      setNewMessage("");
      // Reload messages to show new one
      const msgs = await mvp.listMessages();
      if (userId) {
        setMessages(msgs.filter(m => m.from_user_id === userId || m.to_user_id === userId));
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  // Group messages by other user
  const conversations: Record<string, MvpMessage[]> = {};
  messages.forEach(m => {
    const otherId = m.from_user_id === userId ? m.to_user_id : m.from_user_id;
    if (!conversations[otherId]) conversations[otherId] = [];
    conversations[otherId].push(m);
  });

  // Sort conversations by latest message
  const sortedUserIds = Object.keys(conversations).sort((a, b) => {
    const lastA = conversations[a][0]; // Assuming listMessages returns ordered desc
    const lastB = conversations[b][0];
    return new Date(lastB.created_at).getTime() - new Date(lastA.created_at).getTime();
  });

  const activeMessages = selectedUserId ? (conversations[selectedUserId] || []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
      {/* Sidebar: Conversations */}
      <Card className="col-span-1 flex flex-col h-full">
        <div className="p-4 border-b font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Messaging
        </div>
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {sortedUserIds.length === 0 && <div className="p-4 text-center text-muted-foreground text-sm">No conversations yet.</div>}
            {sortedUserIds.map(uid => {
              const profile = profiles[uid];
              const lastMsg = conversations[uid][0];
              return (
                <div
                  key={uid}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedUserId === uid ? "bg-muted" : ""}`}
                  onClick={() => setSelectedUserId(uid)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{(profile?.full_name?.[0] || "?").toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="font-medium truncate">{profile?.full_name || "Unknown User"}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(lastMsg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{lastMsg.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="col-span-1 md:col-span-2 flex flex-col h-full">
        {selectedUserId ? (
          <>
            <div className="p-4 border-b font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              {profiles[selectedUserId]?.full_name || "Unknown User"}
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeMessages.map(msg => {
                  const isMe = msg.from_user_id === userId;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {msg.body}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="p-4 border-t flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
            <p>Select a conversation to viewing messages</p>
          </div>
        )}
      </Card>
    </div>
  );
}
