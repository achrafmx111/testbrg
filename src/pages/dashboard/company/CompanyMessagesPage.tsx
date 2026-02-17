import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquare, Search, Send, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpMessage, MvpProfile } from "@/integrations/supabase/mvp";

type ConversationsMap = Record<string, MvpMessage[]>;

export default function CompanyMessagesPage() {
  const [messages, setMessages] = useState<MvpMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, MvpProfile>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      const [allMessages, allProfiles] = await Promise.all([mvp.listMessages(), mvp.listProfiles()]);

      const myMessages = allMessages.filter((message) => message.from_user_id === user.id || message.to_user_id === user.id);
      const profileMap: Record<string, MvpProfile> = {};
      allProfiles.forEach((profile) => {
        profileMap[profile.id] = profile;
      });

      setMessages(myMessages);
      setProfiles(profileMap);
      if (myMessages.length > 0) {
        const firstOther = myMessages[0].from_user_id === user.id ? myMessages[0].to_user_id : myMessages[0].from_user_id;
        setSelectedUserId((prev) => prev ?? firstOther);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const conversations = useMemo<ConversationsMap>(() => {
    const grouped: ConversationsMap = {};
    messages.forEach((message) => {
      const otherId = message.from_user_id === userId ? message.to_user_id : message.from_user_id;
      if (!grouped[otherId]) grouped[otherId] = [];
      grouped[otherId].push(message);
    });

    Object.values(grouped).forEach((list) => list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    return grouped;
  }, [messages, userId]);

  const sortedUserIds = useMemo(
    () =>
      Object.keys(conversations)
        .filter((id) => (profiles[id]?.full_name || "Unknown").toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(conversations[b][0]?.created_at ?? 0).getTime() - new Date(conversations[a][0]?.created_at ?? 0).getTime()),
    [conversations, profiles, search],
  );

  const activeMessages = useMemo(() => {
    if (!selectedUserId) return [];
    return [...(conversations[selectedUserId] || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [conversations, selectedUserId]);

  const handleSend = async () => {
    if (!selectedUserId || !newMessage.trim()) return;
    setSending(true);
    try {
      await mvp.sendMessage(selectedUserId, newMessage.trim());
      setNewMessage("");
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Message failed", description: error?.message ?? "Try again." });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/10 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Recruitment Messaging Hub</h2>
            <p className="mt-1 text-sm text-muted-foreground">Talk with candidates and track ongoing conversations from one place.</p>
          </div>
          <Badge variant="secondary">{Object.keys(conversations).length} active threads</Badge>
        </div>
      </section>

      <div className="grid h-[calc(100vh-260px)] min-h-[560px] grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="border-border/60">
          <CardHeader className="space-y-3 pb-3">
            <CardTitle className="text-base">Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search candidate" className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-96px)] p-0">
            <ScrollArea className="h-full">
              <div className="divide-y divide-border/50">
                {sortedUserIds.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">No conversations found.</p>
                ) : (
                  sortedUserIds.map((id) => {
                    const profile = profiles[id];
                    const latest = conversations[id][0];
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedUserId(id)}
                        className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted/40 ${selectedUserId === id ? "bg-muted/50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>{(profile?.full_name?.[0] || "?").toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-medium text-foreground">{profile?.full_name || "Unknown user"}</p>
                              <span className="text-[10px] text-muted-foreground">{new Date(latest.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{latest.body}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          {selectedUserId ? (
            <>
              <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">{profiles[selectedUserId]?.full_name || "Conversation"}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex h-[calc(100%-73px)] flex-col p-0">
                <ScrollArea className="flex-1 px-4 py-4">
                  <div className="space-y-3">
                    {activeMessages.map((message) => {
                      const mine = message.from_user_id === userId;
                      return (
                        <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[78%] rounded-xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted/60 text-foreground"}`}>
                            <p>{message.body}</p>
                            <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <div className="border-t border-border/60 p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Write a message"
                    />
                    <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <MessageSquare className="mb-3 h-12 w-12 opacity-40" />
              <p>Select a conversation to start messaging.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
