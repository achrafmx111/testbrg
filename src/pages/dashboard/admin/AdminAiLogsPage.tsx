import { useState, useMemo } from "react";
import {
    Bot,
    Search,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Clock,
    MoreHorizontal,
    User,
    Filter,
    Eye,
    Terminal,
    BrainCircuit
} from "lucide-react";
import { AdminSectionHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

// --- Types ---

type Sentiment = "positive" | "neutral" | "negative";
type RiskLevel = "none" | "low" | "medium" | "high";
type SessionType = "coach" | "interview" | "general";

interface LogEntry {
    id: string;
    sender: "ai" | "user";
    text: string;
    timestamp: string;
    sentiment?: Sentiment;
}

interface AiSession {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    type: SessionType;
    topic: string;
    startedAt: string;
    lastActiveAt: string;
    messageCount: number;
    overallSentiment: Sentiment;
    riskLevel: RiskLevel;
    logs: LogEntry[];
}

// --- Mock Data ---

const MOCK_SESSIONS: AiSession[] = [
    {
        id: "sess_001",
        userId: "usr_123",
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
            { id: "msg_4", sender: "user", text: "We used nZDM (Near Zero Downtime) approach.", timestamp: new Date(Date.now() - 1000 * 60 * 27).toISOString(), sentiment: "positive" }
        ]
    },
    {
        id: "sess_002",
        userId: "usr_456",
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
            { id: "msg_3", sender: "user", text: "I don't know, I just hate this process! It's unfair.", timestamp: new Date(Date.now() - 1000 * 60 * 118).toISOString(), sentiment: "negative" }
        ]
    },
    {
        id: "sess_003",
        userId: "usr_789",
        userName: "David Chen",
        type: "interview",
        topic: "Behavioral Screen",
        startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
        messageCount: 8,
        overallSentiment: "positive",
        riskLevel: "none",
        logs: []
    },
    {
        id: "sess_004",
        userId: "usr_101",
        userName: "Sarah Smith",
        type: "general",
        topic: "CV Analysis",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        messageCount: 45,
        overallSentiment: "negative",
        riskLevel: "high",
        logs: [
            { id: "msg_1", sender: "user", text: "This AI is useless. It keeps missing my skills.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), sentiment: "negative" },
            { id: "msg_2", sender: "ai", text: "I apologize. Could you upload the PDF again?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.9).toISOString(), sentiment: "neutral" },
            { id: "msg_3", sender: "user", text: "Forget it, logging off.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.8).toISOString(), sentiment: "negative" }
        ]
    }
];

// --- Components ---

function RiskBadge({ level }: { level: RiskLevel }) {
    const styles = {
        none: "bg-muted text-muted-foreground hover:bg-muted",
        low: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
        medium: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200",
        high: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
    };

    return (
        <Badge variant="outline" className={`${styles[level]} border px-2 py-0.5 capitalize`}>
            {level === "none" ? "No Risk" : `${level} Risk`}
        </Badge>
    );
}

function SentimentIndicator({ sentiment }: { sentiment: Sentiment }) {
    const styles = {
        positive: "bg-emerald-500",
        neutral: "bg-slate-400",
        negative: "bg-rose-500"
    };

    return (
        <div className="flex items-center gap-1.5" title={`${sentiment} sentiment`}>
            <div className={`h-2.5 w-2.5 rounded-full ${styles[sentiment]}`} />
            <span className="text-xs text-muted-foreground capitalize hidden sm:inline">{sentiment}</span>
        </div>
    );
}

export default function AdminAiLogsPage() {
    const [search, setSearch] = useState("");
    const [selectedSession, setSelectedSession] = useState<AiSession | null>(null);
    const [filterType, setFilterType] = useState<SessionType | "all">("all");

    const filteredSessions = useMemo(() => {
        let result = MOCK_SESSIONS;

        if (filterType !== "all") {
            result = result.filter(s => s.type === filterType);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(s =>
                s.userName.toLowerCase().includes(q) ||
                s.topic.toLowerCase().includes(q)
            );
        }

        return result;
    }, [search, filterType]);

    const stats = useMemo(() => {
        return {
            total: MOCK_SESSIONS.length,
            highRisk: MOCK_SESSIONS.filter(s => s.riskLevel === "high").length,
            activeToday: 12, // mock
            avgScore: "8.4"
        };
    }, []);

    return (
        <div className={adminClassTokens.pageShell}>
            <AdminSectionHeader
                title="AI Session Oversight"
                description="Monitor active AI sessions, analyze sentiment, and flag potential risks."
                aside={
                    <Button variant="outline" className="gap-2">
                        <Bot className="h-4 w-4" />
                        AI System Health
                    </Button>
                }
            />

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Flagged Risks</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.highRisk}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
                        <BrainCircuit className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgScore}/10</div>
                        <p className="text-xs text-muted-foreground">Based on message depth</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                        <Bot className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="border-border/60">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Session Logs</CardTitle>
                            <CardDescription>Real-time feed of user interactions with AI agents.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search user or topic..."
                                    className="pl-9"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="all" className="pt-4" onValueChange={v => setFilterType(v as any)}>
                        <TabsList>
                            <TabsTrigger value="all">All Sessions</TabsTrigger>
                            <TabsTrigger value="interview">Interviews</TabsTrigger>
                            <TabsTrigger value="coach">Coaching</TabsTrigger>
                            <TabsTrigger value="general">CV & General</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {filteredSessions.map(session => (
                            <div
                                key={session.id}
                                className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all cursor-pointer"
                                onClick={() => setSelectedSession(session)}
                            >
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarFallback><User className="h-5 w-5 opacity-50" /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-sm">{session.userName}</h4>
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">{session.type}</Badge>
                                            {session.riskLevel !== "none" && <RiskBadge level={session.riskLevel} />}
                                        </div>
                                        <p className="text-sm text-foreground/80 mt-0.5 font-medium">{session.topic}</p>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}
                                            </div>
                                            <span>•</span>
                                            <div>{session.messageCount} messages</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mt-4 md:mt-0 pl-14 md:pl-0">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs text-muted-foreground">Sentiment</span>
                                        <SentimentIndicator sentiment={session.overallSentiment} />
                                    </div>
                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Session Details Sheet */}
            <Sheet open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
                <SheetContent className="sm:max-w-xl w-full flex flex-col h-full">
                    <SheetHeader className="pb-4 border-b">
                        <SheetTitle className="flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-primary" />
                            Simulation Log: {selectedSession?.id}
                        </SheetTitle>
                        <SheetDescription>
                            Viewing live transcript for <strong>{selectedSession?.userName}</strong>.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-hidden relative bg-muted/20 my-4 rounded-md border flex flex-col">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {selectedSession?.logs.map(log => (
                                    <div key={log.id} className={`flex gap-3 ${log.sender === "user" ? "flex-row-reverse" : ""}`}>
                                        <Avatar className="h-8 w-8 border bg-background">
                                            {log.sender === "ai" ? (
                                                <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                                            ) : (
                                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div className={`flex flex-col max-w-[80%] ${log.sender === "user" ? "items-end" : "items-start"}`}>
                                            <div className={`px-3 py-2 rounded-lg text-sm ${log.sender === "user"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-background border shadow-sm"
                                                }`}>
                                                {log.text}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground mt-1 opacity-70">
                                                {new Date(log.timestamp).toLocaleTimeString()} • {log.sentiment}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {selectedSession?.logs.length === 0 && (
                                    <div className="flex h-full items-center justify-center p-8 text-muted-foreground text-sm italic">
                                        No transcript logs available for this session.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="pt-4 border-t space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Risk Assessment</label>
                                <div className="flex items-center gap-2">
                                    <RiskBadge level={selectedSession?.riskLevel || "none"} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Metadata</label>
                                <p className="text-xs font-mono bg-muted/50 p-1 rounded">{selectedSession?.id}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button className="w-full" variant="destructive" disabled={selectedSession?.riskLevel === "none"}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Flag for Review
                            </Button>
                            <Button className="w-full" variant="outline" onClick={() => setSelectedSession(null)}>
                                Close Log
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
