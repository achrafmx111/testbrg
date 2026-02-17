import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Clock, Zap, Trophy, XCircle, CheckCircle, Loader2, User, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { fireConfetti } from "@/utils/confetti";
import { playCaChingSound } from "@/utils/sound";
import { Link } from "react-router-dom";

// Mock Questions for the Duel (German Focus)
const QUESTIONS = [
    {
        id: 1,
        question: "Which German article is used for 'Mädchen' (Girl)?",
        options: ["Der", "Die", "Das", "Den"],
        correct: 2 // Das (Index)
    },
    {
        id: 2,
        question: "What is the capital of the German state of Bavaria?",
        options: ["Berlin", "Hamburg", "Munich", "Frankfurt"],
        correct: 2 // Munich
    },
    {
        id: 3,
        question: "Which verb means 'to work' in German?",
        options: ["Arbeiten", "Spielen", "Schlafen", "Essen"],
        correct: 0 // Arbeiten
    },
    {
        id: 4,
        question: "How do you say 'Good Morning' in German?",
        options: ["Guten Tag", "Guten Morgen", "Gute Nacht", "Hallo"],
        correct: 1 // Guten Morgen
    },
    {
        id: 5,
        question: "What is 'The Car' in German?",
        options: ["Der Wagen", "Das Auto", "Die Maschine", "Der Bus"],
        correct: 1 // Das Auto
    }
];

export default function DuelPage() {
    const [gameState, setGameState] = useState<"matching" | "ready" | "playing" | "finished">("matching");
    const [opponent, setOpponent] = useState<{ name: string; avatar: string; score: number } | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [userScore, setUserScore] = useState(0);
    const [answers, setAnswers] = useState<(boolean | null)[]>([null, null, null, null, null]);
    const [isAnswered, setIsAnswered] = useState(false);
    const [roundQuestions, setRoundQuestions] = useState<typeof QUESTIONS>([]);

    // Initialize Game
    useEffect(() => {
        // Pick 3 random questions for the round
        const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
        setRoundQuestions(shuffled.slice(0, 3));
    }, []);

    // Simulate Matchmaking
    useEffect(() => {
        if (gameState === "matching") {
            const timer = setTimeout(() => {
                setOpponent({
                    name: "Hans Muller",
                    avatar: "",
                    score: 0
                });
                setGameState("ready");
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [gameState]);

    // Auto-start game after "ready"
    useEffect(() => {
        if (gameState === "ready") {
            const timer = setTimeout(() => setGameState("playing"), 2000);
            return () => clearTimeout(timer);
        }
    }, [gameState]);

    const handleAnswer = useCallback((optionIndex: number) => {
        if (isAnswered) return;
        setIsAnswered(true);

        const currentQ = roundQuestions[currentQuestionIndex];
        const isCorrect = optionIndex === currentQ.correct;

        // Update User Score
        if (isCorrect) {
            setUserScore((prev) => prev + 10 + timeLeft); // Base 10 + Time Bonus
        }

        // Simulate Opponent Score (Randomly correct/wrong)
        if (opponent) {
            const opponentCorrect = Math.random() > 0.4; // 60% chance opponent is correct
            if (opponentCorrect) {
                setOpponent(prev => prev ? ({ ...prev, score: prev.score + 10 + Math.floor(Math.random() * 8) }) : null);
            }
        }

        // Record Answer
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = isCorrect;
        setAnswers(newAnswers);

        // Next Question or Finish
        setTimeout(() => {
            if (currentQuestionIndex < roundQuestions.length - 1) {
                setCurrentQuestionIndex((prev) => prev + 1);
                setTimeLeft(10);
                setIsAnswered(false);
            } else {
                setGameState("finished");
                if (userScore > (opponent?.score || 0)) {
                    fireConfetti();
                    playCaChingSound();
                }
            }
        }, 1500);
    }, [answers, currentQuestionIndex, isAnswered, opponent, roundQuestions, timeLeft, userScore]);

    // Timer Logic
    useEffect(() => {
        if (gameState === "playing" && timeLeft > 0 && !isAnswered) {
            const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        }
        if (timeLeft === 0 && !isAnswered) {
            handleAnswer(-1);
        }
    }, [gameState, handleAnswer, isAnswered, timeLeft]);

    if (gameState === "matching") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse" />
                    <Loader2 className="h-16 w-16 text-indigo-600 animate-spin relative z-10" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Finding Opponent...</h2>
                    <p className="text-muted-foreground">Searching for a suitable match in your league</p>
                </div>
                <div className="flex gap-4 opacity-50">
                    <Avatar className="h-12 w-12 border-2 border-dashed">
                        <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                    <Swords className="h-12 w-12 text-muted-foreground" />
                    <Avatar className="h-12 w-12">
                        <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        );
    }

    if (gameState === "ready") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in zoom-in duration-300">
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 uppercase tracking-widest">
                    VS
                </h1>
                <div className="flex items-center justify-center gap-12">
                    <div className="text-center space-y-2">
                        <Avatar className="h-24 w-24 border-4 border-indigo-500 shadow-xl">
                            <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                        <p className="font-bold text-lg">You</p>
                    </div>
                    <div className="text-center space-y-2">
                        <Avatar className="h-24 w-24 border-4 border-red-500 shadow-xl">
                            <AvatarFallback>{opponent?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-bold text-lg">{opponent?.name}</p>
                    </div>
                </div>
                <p className="text-2xl font-medium animate-pulse text-indigo-600">Get Ready!</p>
            </div>
        );
    }

    if (gameState === "finished") {
        const isWin = userScore >= (opponent?.score || 0);
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in zoom-in">
                <div className={`p-6 rounded-full ${isWin ? "bg-yellow-100" : "bg-slate-100"}`}>
                    {isWin ? <Trophy className="h-20 w-20 text-yellow-500" /> : <XCircle className="h-20 w-20 text-slate-500" />}
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-bold">{isWin ? "Victory!" : "Defeat"}</h1>
                    <p className="text-xl text-muted-foreground">
                        {isWin ? "+50 XP Earned" : "+10 XP Participation Bonus"}
                    </p>
                </div>

                <div className="flex gap-12 text-4xl font-mono font-bold items-center py-4">
                    <div className="text-indigo-600 flex flex-col items-center">
                        <span>{userScore}</span>
                        <span className="text-xs text-muted-foreground font-sans font-normal">You</span>
                    </div>
                    <div className="text-slate-300">-</div>
                    <div className="text-red-500 flex flex-col items-center">
                        <span>{opponent?.score}</span>
                        <span className="text-xs text-muted-foreground font-sans font-normal">{opponent?.name}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => window.location.reload()} className="w-32">
                        Rematch
                    </Button>
                    <Button asChild className="w-32 bg-indigo-600 hover:bg-indigo-700">
                        <Link to="/talent/community">Back to Hub</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Gameplay State
    if (roundQuestions.length === 0) return null;
    const currentQ = roundQuestions[currentQuestionIndex];

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-12 animate-in fade-in min-h-[80vh] flex flex-col justify-center">
            {/* Header: Scores & Timer */}
            <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-4 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-indigo-500">
                        <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">You</span>
                        <span className="font-bold text-2xl text-indigo-700">{userScore}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center w-full max-w-xs px-8">
                    <div className={`text-4xl font-black font-mono ${timeLeft <= 3 ? "text-red-500 animate-pulse" : "text-slate-700"}`}>
                        {timeLeft}
                    </div>
                    <Progress value={(timeLeft / 10) * 100} className="w-full h-3 mt-2" />
                </div>

                <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{opponent?.name}</span>
                        <span className="font-bold text-2xl text-red-500">{opponent?.score}</span>
                    </div>
                    <Avatar className="h-12 w-12 border-2 border-red-500">
                        <AvatarFallback>{opponent?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* Question Card */}
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardContent className="p-8 md:p-12 text-center space-y-12">
                    <div className="space-y-4">
                        <span className="text-xs font-bold tracking-widest text-indigo-500 uppercase border border-indigo-200 px-3 py-1 rounded-full bg-indigo-50">
                            Question {currentQuestionIndex + 1} / {roundQuestions.length}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">{currentQ.question}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {currentQ.options.map((option, idx) => {
                            const isTheCorrectAnswer = idx === currentQ.correct;
                            let buttonStyle = "h-20 text-xl border-2 hover:border-indigo-500 hover:bg-indigo-50 transition-all shadow-sm active:scale-95";

                            if (isAnswered) {
                                if (isTheCorrectAnswer) buttonStyle = "h-20 text-xl bg-green-100 border-green-500 text-green-800 pointer-events-none shadow-md ring-2 ring-green-200";
                                else buttonStyle = "h-20 text-xl opacity-40 pointer-events-none grayscale";
                            }

                            return (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    className={buttonStyle}
                                    onClick={() => handleAnswer(idx)}
                                >
                                    {option}
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
