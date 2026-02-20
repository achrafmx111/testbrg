import { useMemo, useState } from "react";
import { AlertTriangle, Bot, BrainCircuit, CheckCircle2, Clock3, Eye, MessageSquare, Search, ShieldAlert, Terminal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AdminSectionHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type Sentiment = "positive" | "neutral" | "negative";
type RiskLevel = "none" | "low" | "medium" | "high";
type SessionType = "coach" | "interview" | "general";

type LogEntry = {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  sentiment?: Sentiment;
};

type AiSession = {
  id: string;
  userName: string;
  type: SessionType;
  topic: string;
  startedAt: string;
  lastActiveAt: string;
  messageCount: number;
  overallSentiment: Sentiment;
  riskLevel: RiskLevel;
  logs: LogEntry[];
};

const MOCK_SESSIONS: AiSession[] = [
  {
    id: "sess_001",
    userName: "Alex Johnson",
    type: "interview",
    topic: "SAP Consultant Interview (Expert)",
    startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    messageCount: 14,
    overallSentiment: "positive",
    riskLevel: "none",
    logs: [
      { id: "msg_1", sender: "ai", text: "Welcome Alex. Let's discuss your SAP S/4HANA migration experience.", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), sentiment: "neutral" },
      { id: "msg_2", sender: "user", text: "Sure. I led a migration for a manufacturing firm last year.", timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(), sentiment: "positive" },
      { id: "msg_3", sender: "ai", text: "Can you detail the downtime minimization strategy you used?", timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(), sentiment: "neutral" },
      { id: "msg_4", sender: "user", text: "We used nZDM (Near Zero Downtime) approach.", timestamp: new Date(Date.now() - 1000 * 60 * 27).toISOString(), sentiment: "positive" },
    ],
  },
  {
    id: "sess_002",
    userName: "Maria Garcia",
    type: "coach",
    topic: "Salary Negotiation",
    startedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    messageCount: 28,
    overallSentiment: "neutral",
    riskLevel: "medium",
    logs: [
      { id: "msg_1", sender: "user", text: "I feel like they are lowballing me.", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), sentiment: "negative" },
      { id: "msg_2", sender: "ai", text: "I understand your frustration. What represents your target range?", timestamp: new Date(Date.now() - 1000 * 60 * 119).toISOString(), sentiment: "positive" },
      { id: "msg_3", sender: "user", text: "I do not know, this process feels unfair.", timestamp: new Date(Date.now() - 1000 * 60 * 118).toISOString(), sentiment: "negative" },
    ],
  },
  {
    id: "sess_003",
    userName: "David Chen",
    type: "interview",
    topic: "Behavioral Screen",
    startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    messageCount: 8,
    overallSentiment: "positive",
    riskLevel: "none",
    logs: [],
  },
  {
    id: "sess_004",
    userName: "Sarah Smith",
    type: "general",
    topic: "CV Analysis",
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    messageCount: 45,
    overallSentiment: "negative",
    riskLevel: "high",
    logs: [
      { id: "msg_1", sender: "user", text: "This AI keeps missing my key skills.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), sentiment: "negative" },
      { id: "msg_2", sender: "ai", text: "I apologize. Could you upload the PDF again?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.9).toISOString(), sentiment: "neutral" },
      { id: "msg_3", sender: "user", text: "Forget it, logging off.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.8).toISOString(), sentiment: "negative" },
    ],
  },
];

export default function AdminAiLogsPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<SessionType | "all">("all");
  const [selectedSession, setSelectedSession] = useState<AiSession | null>(null);

  const filteredSessions = useMemo(() => {
    let rows = MOCK_SESSIONS;
    if (filterType !== "all") rows = rows.filter((session) => session.type === filterType);

    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((session) => session.userName.toLowerCase().includes(query) || session.topic.toLowerCase().includes(query));
  }, [filterType, search]);

  const stats = useMemo(() => {
    const highRisk = MOCK_SESSIONS.filter((session) => session.riskLevel === "high").length;
    const activeNow = MOCK_SESSIONS.filter((session) => new Date(session.lastActiveAt).getTime() > Date.now() - 1000 * 60 * 10).length;
    const totalMessages = MOCK_SESSIONS.reduce((sum, session) => sum + session.messageCount, 0);
    const avgDepth = (totalMessages / Math.max(MOCK_SESSIONS.length, 1)).toFixed(1);
    return {
      totalSessions: MOCK_SESSIONS.length,
      highRisk,
      activeNow,
      avgDepth,
    };
  }, []);

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="AI Session Oversight"
        description="Monitor AI conversations, detect risk patterns, and review transcript quality with one command view."
        aside={
          <Button variant="outline" className="gap-2">
            <Bot className="h-4 w-4" /> AI Health Snapshot
          </Button>
        }
      />

      <Card className="border-border/40 bg-gradient-to-r from-primary/10 via-card to-secondary/15">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Sessions" value={`${stats.totalSessions}`} helper="Today" icon={<MessageSquare className="h-4 w-4 text-primary" />} />
          <Metric label="High Risk" value={`${stats.highRisk}`} helper="Needs review" icon={<ShieldAlert className="h-4 w-4 text-rose-600" />} />
          <Metric label="Active Now" value={`${stats.activeNow}`} helper="Last 10 min" icon={<Clock3 className="h-4 w-4 text-emerald-600" />} />
          <Metric label="Avg Depth" value={`${stats.avgDepth}`} helper="Messages/session" icon={<BrainCircuit className="h-4 w-4 text-secondary" />} />
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-base">Session Monitor</CardTitle>
              <CardDescription>Live mock stream for coach, interview, and general assistant sessions.</CardDescription>
            </div>

            <div className="w-full max-w-sm">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user or topic..." className="pl-9" />
              </div>
            </div>
          </div>

          <Tabs value={filterType} onValueChange={(value) => setFilterType(value as SessionType | "all")} className="pt-3">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="interview">Interviews</TabsTrigger>
              <TabsTrigger value="coach">Coaching</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="space-y-2">
          {filteredSessions.map((session) => (
            <button
              key={session.id}
              type="button"
              className="group w-full rounded-xl border border-border/50 bg-card/60 p-4 text-left transition hover:border-primary/40 hover:bg-muted/30"
              onClick={() => setSelectedSession(session)}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{session.userName}</p>
                    <Badge variant="outline" className="text-[10px] uppercase">{session.type}</Badge>
                    <RiskBadge level={session.riskLevel} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{session.topic}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {session.messageCount} messages - active {formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <SentimentPill sentiment={session.overallSentiment} />
                  <Eye className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                </div>
              </div>
            </button>
          ))}

          {filteredSessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No sessions match this search/filter.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Sheet open={Boolean(selectedSession)} onOpenChange={() => setSelectedSession(null)}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="inline-flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" /> Session Transcript
            </SheetTitle>
            <SheetDescription>
              {selectedSession ? `Reviewing ${selectedSession.userName} - ${selectedSession.topic}` : "Transcript details"}
            </SheetDescription>
          </SheetHeader>

          {selectedSession ? (
            <div className="mt-4 flex h-[calc(100%-80px)] flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs">
                  <p className="text-muted-foreground">Risk</p>
                  <div className="mt-1"><RiskBadge level={selectedSession.riskLevel} /></div>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs">
                  <p className="text-muted-foreground">Sentiment</p>
                  <div className="mt-1"><SentimentPill sentiment={selectedSession.overallSentiment} /></div>
                </div>
              </div>

              <ScrollArea className="flex-1 rounded-xl border border-border/60 bg-muted/10 p-3">
                <div className="space-y-3">
                  {selectedSession.logs.map((log) => (
                    <div key={log.id} className={`flex ${log.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${log.sender === "user" ? "bg-primary text-primary-foreground" : "border border-border/60 bg-card"}`}>
                        <p>{log.text}</p>
                        <p className={`mt-1 text-[10px] ${log.sender === "user" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {new Date(log.timestamp).toLocaleTimeString()} {log.sentiment ? `- ${log.sentiment}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}

                  {selectedSession.logs.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No transcript logs found for this session.
                    </div>
                  ) : null}
                </div>
              </ScrollArea>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="destructive" disabled={selectedSession.riskLevel === "none"}>
                  <AlertTriangle className="mr-1.5 h-4 w-4" /> Flag for review
                </Button>
                <Button variant="outline" onClick={() => setSelectedSession(null)}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Close
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Metric({ label, value, helper, icon }: { label: string; value: string; helper: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/80 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="text-[11px] text-muted-foreground">{helper}</p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">{icon}</div>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    none: "bg-muted text-muted-foreground",
    low: "bg-blue-100 text-blue-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };
  return <Badge variant="outline" className={`capitalize ${styles[level]}`}>{level === "none" ? "No risk" : `${level} risk`}</Badge>;
}

function SentimentPill({ sentiment }: { sentiment: Sentiment }) {
  const styles: Record<Sentiment, string> = {
    positive: "bg-emerald-100 text-emerald-700",
    neutral: "bg-slate-100 text-slate-700",
    negative: "bg-rose-100 text-rose-700",
  };
  return <Badge className={`${styles[sentiment]} capitalize`}>{sentiment}</Badge>;
}
