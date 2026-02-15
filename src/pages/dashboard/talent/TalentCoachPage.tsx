import { useState, useRef, useEffect } from "react";
import { Send, Mic, Play, RotateCcw, StopCircle, Award, Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface Message {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: Date;
}

interface InterviewConfig {
    role: string;
    difficulty: "beginner" | "intermediate" | "expert";
    status: "idle" | "intro" | "active" | "feedback" | "completed";
}

const MOCK_QUESTIONS: Record<string, string[]> = {
    "SAP Consultant": [
        "Can you explain the difference between SAP ECC and SAP S/4HANA?",
        "How do you handle a situation where a client requests a feature that deviates from standard SAP best practices?",
        "Describe a complex data migration project you've worked on. What were the challenges?",
        "What is your experience with SAP Fiori and how does it improve user experience?",
    ],
    "Soft Skills": [
        "Tell me about a time you had a conflict with a team member. How did you resolve it?",
        "How do you prioritize tasks when working on multiple projects with tight deadlines?",
        "Describe your communication style when explaining technical concepts to non-technical stakeholders.",
    ],
    "German Language": [
        "Können Sie sich kurz auf Deutsch vorstellen?",
        "Was sind Ihre Stärken und Schwächen?",
        "Warum wollen Sie in Deutschland arbeiten?",
    ]
};

export default function TalentCoachPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [config, setConfig] = useState<InterviewConfig>({
        role: "SAP Consultant",
        difficulty: "intermediate",
        status: "idle",
    });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isTyping]);

    const startInterview = () => {
        setConfig((prev) => ({ ...prev, status: "intro" }));
        setMessages([]);
        setCurrentQuestionIndex(0);

        // Simulate AI Intro
        setIsTyping(true);
        setTimeout(() => {
            addMessage("ai", `Hello! I'm Sarah, your AI Career Coach. I'll be conducting a mock interview for the ${config.role} position at ${config.difficulty} level today. Ready to start?`);
            setIsTyping(false);
            setConfig((prev) => ({ ...prev, status: "active" }));

            // Ask first question after a short delay
            setTimeout(() => {
                setIsTyping(true);
                setTimeout(() => {
                    askQuestion(0);
                    setIsTyping(false);
                }, 1500);
            }, 1000);
        }, 1500);
    };

    const askQuestion = (index: number) => {
        const questions = MOCK_QUESTIONS[config.role] || MOCK_QUESTIONS["SAP Consultant"];
        if (index < questions.length) {
            addMessage("ai", questions[index]);
        } else {
            endInterview();
        }
    };

    const endInterview = () => {
        setConfig((prev) => ({ ...prev, status: "completed" }));
        addMessage("ai", "That concludes our session! I'm analyzing your responses now...");

        setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
                addMessage("ai", "Based on our interaction, you showed strong technical knowledge. \n\n**Strengths:**\n- Clear explanation of S/4HANA architecture.\n- Good examples of problem-solving.\n\n**Areas for Improvement:**\n- Try to be more concise in your soft skills answers.\n- Use the STAR method (Situation, Task, Action, Result) more consistently.");
                setIsTyping(false);
            }, 3000);
        }, 1000);
    };

    const addMessage = (sender: "user" | "ai", text: string) => {
        setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), sender, text, timestamp: new Date() },
        ]);
    };

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        addMessage("user", inputValue);
        setInputValue("");

        if (config.status === "active") {
            setIsTyping(true);
            // Simulate "Listening" and "Thinking"
            setTimeout(() => {
                setIsTyping(false);
                // Move to next question
                const nextIndex = currentQuestionIndex + 1;
                setCurrentQuestionIndex(nextIndex);

                setTimeout(() => {
                    setIsTyping(true);
                    setTimeout(() => {
                        askQuestion(nextIndex);
                        setIsTyping(false);
                    }, 1000 + Math.random() * 1000); // Random delay for realism
                }, 500);

            }, 1500 + Math.random() * 1000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 p-4 md:p-6 animate-in fade-in duration-500">
            {/* Settings / Context Panel */}
            <div className="hidden w-80 flex-col gap-4 md:flex">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Award className="h-5 w-5 text-primary" />
                            Interview Context
                        </CardTitle>
                        <CardDescription>Configure your practice session</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Role</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={config.role}
                                onChange={(e) => setConfig({ ...config, role: e.target.value })}
                                disabled={config.status !== "idle"}
                            >
                                <option value="SAP Consultant">SAP Consultant</option>
                                <option value="Soft Skills">Soft Skills & Behavioral</option>
                                <option value="German Language">German Language Check</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Difficulty</label>
                            <div className="flex gap-2">
                                {(["beginner", "intermediate", "expert"] as const).map((level) => (
                                    <Badge
                                        key={level}
                                        variant={config.difficulty === level ? "default" : "outline"}
                                        className="cursor-pointer capitalize"
                                        onClick={() => config.status === "idle" && setConfig({ ...config, difficulty: level })}
                                    >
                                        {level}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {config.status !== "idle" && (
                            <div className="space-y-2 animate-in slide-in-from-top-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{Math.min(currentQuestionIndex, (MOCK_QUESTIONS[config.role]?.length || 4))} / {MOCK_QUESTIONS[config.role]?.length || 4} Questions</span>
                                </div>
                                <Progress value={(currentQuestionIndex / (MOCK_QUESTIONS[config.role]?.length || 4)) * 100} className="h-2" />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        {config.status === "idle" ? (
                            <Button className="w-full gap-2" onClick={startInterview}>
                                <Play className="h-4 w-4" /> Start Interview
                            </Button>
                        ) : (
                            <Button variant="destructive" className="w-full gap-2" onClick={() => setConfig({ ...config, status: "idle", role: "SAP Consultant" })}>
                                <StopCircle className="h-4 w-4" /> End Session
                            </Button>
                        )}

                    </CardFooter>
                </Card>

                <Card className="border-border/60 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
                    <CardContent className="p-4 flex items-start gap-4">
                        <div className="bg-background p-2 rounded-full shadow-sm">
                            <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Pro Tip</h4>
                            <p className="text-xs text-muted-foreground mt-1">Use the "STAR" method for behavioral questions: Situation, Task, Action, Result.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col border-border/60 shadow-md overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50" />

                <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarImage src="/placeholder-avatar.jpg" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">AI</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-base">Sarah (AI Recruiter)</CardTitle>
                            <CardDescription className="text-xs flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-full ${config.status === "active" ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
                                {config.status === "active" ? "Online" : "Away"}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="md:hidden" title="Settings">
                            <Award className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden bg-muted/5 relative">
                    {config.status === "idle" && messages.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                                <Mic className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Ready to practice?</h3>
                            <p className="max-w-md text-sm">Select a role and difficulty level on the left to begin your mock interview session. I'll provide real-time feedback on your answers.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full px-6 py-6" ref={scrollAreaRef}>
                            <div className="space-y-6">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                        <Avatar className="h-8 w-8 mt-1">
                                            {msg.sender === "ai" ? (
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
                                            ) : (
                                                <AvatarFallback className="bg-secondary/10 text-secondary text-xs">ME</AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div className={`flex flex-col gap-1 max-w-[80%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                                            <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.sender === "user"
                                                    ? "bg-primary text-primary-foreground rounded-tr-none shadow-md"
                                                    : "bg-background border shadow-sm rounded-tl-none"
                                                }`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground px-1">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex gap-3">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
                                        </Avatar>
                                        <div className="bg-background border shadow-sm rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1 h-[42px]">
                                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>

                <CardFooter className="p-4 border-t bg-background">
                    <form
                        className="flex w-full items-center gap-3"
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    >
                        <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                            <Mic className="h-5 w-5" />
                        </Button>
                        <div className="relative flex-1">
                            <Input
                                placeholder={config.status === "active" ? "Type your answer..." : "Start the session to type..."}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={config.status !== "active" || isTyping}
                                className="pr-12 bg-muted/20 border-muted-foreground/20 focus-visible:ring-primary/20"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!inputValue.trim() || config.status !== "active" || isTyping}
                            className="shrink-0 rounded-full h-10 w-10"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
