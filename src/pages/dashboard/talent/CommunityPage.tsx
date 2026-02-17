import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, Trophy, MessageSquare, Heart, Share2, MapPin, Clock, Video, Swords, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// Mock Data
const FEED_POSTS = [
    {
        id: 1,
        user: { name: "Sarah Ahmed", role: "Alumni • Software Engineer at SAP", avatar: "" },
        content: "Just celebrated my 1-year work anniversary in Munich! 🇩🇪 Huge thanks to Bridging Academy for the preparation. To all current students: Keep pushing, it's worth it!",
        likes: 45,
        comments: 12,
        time: "2 hours ago",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
    },
    {
        id: 2,
        user: { name: "Omar Benali", role: "Student • Level 5", avatar: "" },
        content: "Finally passed the B1 German exam! 🎉 The vocabulary lists in the learning module were a lifesaver.",
        likes: 32,
        comments: 8,
        time: "5 hours ago",
        image: null
    },
    {
        id: 3,
        user: { name: "Bridging Academy Team", role: "Admin", avatar: "" },
        content: "📢 New Workshop Alert: 'Mastering the Technical Interview' with Senior Devs from Berlin. Sign up in the Events tab!",
        likes: 89,
        comments: 4,
        time: "1 day ago",
        image: null
    }
];

const EVENTS = [
    {
        id: 1,
        title: "Technical Interview Masterclass",
        date: "Feb 20, 2026",
        time: "18:00 CET",
        type: "Webinar",
        attendees: 124,
        image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80"
    },
    {
        id: 2,
        title: "Alumni Q&A Session",
        date: "Feb 25, 2026",
        time: "19:30 CET",
        type: "Live Stream",
        attendees: 85,
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80"
    }
];

const LEADERBOARD_PREVIEW = [
    { rank: 1, name: "Yassine T.", xp: 12500, avatar: "" },
    { rank: 2, name: "Maria K.", xp: 11200, avatar: "" },
    { rank: 3, name: "You", xp: 8450, avatar: "", isUser: true },
];

export default function CommunityPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Community Hub</h1>
                    <p className="text-muted-foreground mt-1">Connect, learn, and grow with your fellow talents.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline" className="gap-2">
                        <Link to="/talent/duel">
                            <Swords className="h-4 w-4 text-orange-500" />
                            Defy a Friend
                        </Link>
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <MessageSquare className="h-4 w-4" />
                        New Post
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="feed" className="w-full">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="feed" className="flex-1 max-w-[150px]">Activity Feed</TabsTrigger>
                            <TabsTrigger value="events" className="flex-1 max-w-[150px]">Events</TabsTrigger>
                        </TabsList>

                        <TabsContent value="feed" className="space-y-6 mt-6">
                            {FEED_POSTS.map((post) => (
                                <Card key={post.id} className="overflow-hidden">
                                    <CardHeader className="flex flex-row items-start gap-4 pb-4">
                                        <Avatar>
                                            <AvatarImage src={post.user.avatar} />
                                            <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold">{post.user.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{post.user.role}</p>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{post.time}</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pb-6">
                                        <p className="text-sm leading-relaxed">{post.content}</p>
                                        {post.image && (
                                            <img
                                                src={post.image}
                                                alt="Post content"
                                                className="w-full h-64 object-cover rounded-md"
                                            />
                                        )}
                                        <div className="flex items-center gap-6 pt-2 text-muted-foreground">
                                            <button className="flex items-center gap-1.5 text-sm hover:text-red-500 transition-colors">
                                                <Heart className="h-4 w-4" />
                                                <span>{post.likes}</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 text-sm hover:text-blue-500 transition-colors">
                                                <MessageSquare className="h-4 w-4" />
                                                <span>{post.comments}</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 text-sm hover:text-green-500 transition-colors ml-auto">
                                                <Share2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>

                        <TabsContent value="events" className="space-y-6 mt-6">
                            {EVENTS.map((event) => (
                                <Card key={event.id} className="overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                                    <div className="md:w-48 h-32 md:h-auto shrink-0 bg-muted">
                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">{event.type}</Badge>
                                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                    <Users className="h-3 w-3" /> {event.attendees} going
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {event.date}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.time}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Button size="sm" className="w-full md:w-auto">Register Now</Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Leaderboard Preview */}
                    <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-50/50 to-transparent">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Top Performers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {LEADERBOARD_PREVIEW.map((user) => (
                                <div key={user.rank} className={`flex items-center justify-between p-2 rounded-lg ${user.isUser ? "bg-white shadow-sm border" : ""}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold w-6 text-center ${user.rank === 1 ? "text-yellow-500" : user.rank === 2 ? "text-slate-400" : user.rank === 3 ? "text-amber-700" : "text-muted-foreground"}`}>
                                            #{user.rank}
                                        </span>
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className={`text-sm font-medium ${user.isUser ? "text-indigo-600" : ""}`}>{user.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground">{user.xp.toLocaleString()} XP</span>
                                </div>
                            ))}
                            <Button asChild variant="ghost" size="sm" className="w-full text-indigo-600 hover:text-indigo-700">
                                <Link to="/talent/leaderboard">View Full Leaderboard <ArrowRight className="ml-1 h-3 w-3" /></Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quiz Duel Promo */}
                    <Card className="bg-slate-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 translate-x-10 -translate-y-10" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Swords className="h-5 w-5 text-indigo-400" />
                                Daily Challenge
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Win 50 XP in a quick 1v1 battle!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full bg-indigo-500 hover:bg-indigo-600">
                                <Link to="/talent/duel">Terminer Le Challenge</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
