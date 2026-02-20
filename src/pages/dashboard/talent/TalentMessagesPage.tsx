import { useEffect, useMemo, useState } from "react";
import { BellRing, CheckCheck, Clock3, MessageSquare, Search, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mvp, MvpMessage } from "@/integrations/supabase/mvp";

type ThreadItem = {
  id: string;
  title: string;
  preview: string;
  channel: "coach" | "company" | "system";
  unread: boolean;
  time: string;
};

const mockThreads: ThreadItem[] = [
  {
    id: "thread-1",
    title: "Coach Sarah",
    preview: "Great progress today. Focus next on STAR format for behavioral answers.",
    channel: "coach",
    unread: true,
    time: "3m ago",
  },
  {
    id: "thread-2",
    title: "Munich ERP Team",
    preview: "We liked your profile. Could you share your availability for next week?",
    channel: "company",
    unread: true,
    time: "1h ago",
  },
  {
    id: "thread-3",
    title: "Platform Notifications",
    preview: "Your profile completeness reached 88%. Add one more project to unlock boost.",
    channel: "system",
    unread: false,
    time: "Yesterday",
  },
];

export default function TalentMessagesPage() {
  const [messages, setMessages] = useState<MvpMessage[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    mvp
      .listMessages()
      .then((rows) => setMessages(rows))
      .catch(() => undefined);
  }, []);

  const threadSeed = useMemo(() => {
    if (!messages.length) return mockThreads;

    const derived = messages.slice(0, 6).map((item, index) => {
      const channel: ThreadItem["channel"] = item.thread_type === "coach" ? "coach" : item.thread_type === "system" ? "system" : "company";
      return {
        id: item.id,
        title: item.thread_type === "coach" ? "AI Coach" : item.thread_type === "system" ? "Platform Notifications" : "Hiring Team",
        preview: item.body,
        channel,
        unread: index % 2 === 0,
        time: new Date(item.created_at).toLocaleDateString(),
      };
    });

    return derived.length ? derived : mockThreads;
  }, [messages]);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threadSeed;
    return threadSeed.filter((thread) => thread.title.toLowerCase().includes(q) || thread.preview.toLowerCase().includes(q));
  }, [search, threadSeed]);

  const unreadCount = filteredThreads.filter((thread) => thread.unread).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/10 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <BellRing className="mr-1 h-3.5 w-3.5" /> Communication Hub
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Messages & notifications</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Keep every conversation in one place: coach feedback, recruiter updates, and system nudges.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Threads" value={`${threadSeed.length}`} />
            <Stat label="Unread" value={`${unreadCount}`} />
            <Stat label="Signals" value={`${messages.length || 12}`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.5fr]">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inbox</CardTitle>
            <CardDescription>Prioritized threads from coach, company, and platform.</CardDescription>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search thread..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredThreads.map((thread) => (
              <div key={thread.id} className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{thread.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{thread.preview}</p>
                  </div>
                  {thread.unread ? <span className="mt-1 h-2 w-2 rounded-full bg-primary" /> : null}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <ThreadBadge channel={thread.channel} />
                  <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> {thread.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conversation preview</CardTitle>
            <CardDescription>Sample thread view for the selected conversation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Bubble side="left" text="Hi! Your profile reached 88%. Add one more SAP project to unlock recruiter boost." />
            <Bubble side="right" text="Got it. I will add my S/4 migration project details tonight." />
            <Bubble side="left" text="Perfect. I can also suggest a stronger bullet-point format if you want." />

            <div className="mt-2 rounded-xl border border-border/60 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick reply templates</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline">Share availability</Button>
                <Button size="sm" variant="outline">Request interview details</Button>
                <Button size="sm" variant="outline">Ask for feedback</Button>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/60 p-3">
              <div className="flex items-center gap-2">
                <Input placeholder="Write a message..." />
                <Button size="icon"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/60 bg-gradient-to-r from-primary/10 via-card to-accent/10">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <CheckCheck className="h-4 w-4 text-primary" /> Communication hygiene score: 92%
          </p>
          <Button variant="outline">Mark all as read</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ThreadBadge({ channel }: { channel: "coach" | "company" | "system" }) {
  if (channel === "coach") return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Coach</Badge>;
  if (channel === "system") return <Badge variant="secondary">System</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Company</Badge>;
}

function Bubble({ side, text }: { side: "left" | "right"; text: string }) {
  return (
    <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${side === "right" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
        <p>{text}</p>
      </div>
    </div>
  );
}
