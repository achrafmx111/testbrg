import { useState } from "react";
import { Trophy, Medal, Crown, Shield, Search, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// Mock Data
const LEADERBOARD_DATA = Array.from({ length: 20 }, (_, i) => ({
    rank: i + 1,
    name: i === 3 ? "You" : `User ${i + 1}`,
    role: i % 3 === 0 ? "Level 5 Scholar" : "Level 3 Explorer",
    xp: 20000 - i * 850,
    isUser: i === 3,
    avatar: ""
}));

export default function LeaderboardPage() {
    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/talent/community"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Global Leaderboard</h1>
                    <p className="text-muted-foreground">Top performing talents across the academy.</p>
                </div>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
                {/* 2nd Place */}
                <Card className="order-2 md:order-1 border-slate-200 bg-gradient-to-b from-slate-50 to-white transform translate-y-4">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <Avatar className="h-20 w-20 border-4 border-slate-300">
                                <AvatarFallback>U2</AvatarFallback>
                            </Avatar>
                            <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-400 border-white border-2">#2</Badge>
                        </div>
                        <h3 className="font-bold text-lg">Maria K.</h3>
                        <p className="text-sm text-muted-foreground">Level 7</p>
                        <p className="font-bold text-slate-600 mt-2">18,500 XP</p>
                    </CardContent>
                </Card>

                {/* 1st Place */}
                <Card className="order-1 md:order-2 border-secondary/20 bg-gradient-to-b from-secondary/10 to-card shadow-lg z-10">
                    <CardHeader className="text-center pb-2">
                        <Crown className="h-8 w-8 text-yellow-500 mx-auto" />
                    </CardHeader>
                    <CardContent className="p-6 pt-2 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <Avatar className="h-24 w-24 border-4 border-yellow-400">
                                <AvatarFallback>Y1</AvatarFallback>
                            </Avatar>
                            <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 border-white border-2">#1</Badge>
                        </div>
                        <h3 className="font-bold text-xl">Yassine T.</h3>
                        <p className="text-sm text-muted-foreground">Level 8</p>
                        <p className="font-bold text-yellow-600 mt-2 text-xl">20,000 XP</p>
                    </CardContent>
                </Card>

                {/* 3rd Place */}
                <Card className="order-3 border-amber-200 bg-gradient-to-b from-orange-50 to-white transform translate-y-8">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <Avatar className="h-20 w-20 border-4 border-amber-600">
                                <AvatarFallback>U3</AvatarFallback>
                            </Avatar>
                            <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 border-white border-2">#3</Badge>
                        </div>
                        <h3 className="font-bold text-lg">Ahmed B.</h3>
                        <p className="text-sm text-muted-foreground">Level 6</p>
                        <p className="font-bold text-amber-700 mt-2">17,200 XP</p>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Rankings</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search user..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {LEADERBOARD_DATA.slice(3).map((user) => (
                            <div
                                key={user.rank}
                                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${user.isUser ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="font-mono font-bold text-muted-foreground w-8 text-center">#{user.rank}</span>
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {user.name}
                                            {user.isUser && <Badge variant="secondary" className="text-[10px] h-5">You</Badge>}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{user.role}</div>
                                    </div>
                                </div>
                                <div className="font-bold tabular-nums">
                                    {user.xp.toLocaleString()} XP
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
