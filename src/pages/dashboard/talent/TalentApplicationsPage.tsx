import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    CalendarDays,
    CheckCircle2,
    Clock,
    MoreHorizontal,
    Plus,
    Search,
    XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock Data for Premium Feel
type Application = {
    id: string;
    role: string;
    company: string;
    logo: string;
    date: string;
    stage: "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "REJECTED";
    salary: string;
    location: string;
    nextStep?: string;
};

const MOCK_APPLICATIONS: Application[] = [
    {
        id: "1",
        role: "Senior SAP Consultant",
        company: "TechSolutions GmbH",
        logo: "TS",
        date: "2 days ago",
        stage: "INTERVIEW",
        salary: "€65k - €80k",
        location: "Berlin (Hybrid)",
        nextStep: "Tech Interview on Feb 20"
    },
    {
        id: "2",
        role: "SAP FICO Analyst",
        company: "Global Corp",
        logo: "GC",
        date: "1 week ago",
        stage: "APPLIED",
        salary: "€55k - €70k",
        location: "Munich",
    },
    {
        id: "3",
        role: "Junior ABAP Developer",
        company: "InnovateX",
        logo: "IX",
        date: "3 days ago",
        stage: "SCREENING",
        salary: "€45k - €55k",
        location: "Remote",
        nextStep: "HR Screening Call"
    },
    {
        id: "4",
        role: "SAP Project Manager",
        company: "AutoSystems",
        logo: "AS",
        date: "2 weeks ago",
        stage: "OFFER",
        salary: "€85k+",
        location: "Stuttgart",
        nextStep: "Review Offer Letter"
    },
    {
        id: "5",
        role: "Integration Specialist",
        company: "CloudNet",
        logo: "CN",
        date: "1 month ago",
        stage: "REJECTED",
        salary: "€60k",
        location: "Hamburg",
    }
];

const COLUMNS = [
    { id: "APPLIED", label: "Applied", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { id: "SCREENING", label: "Screening", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { id: "INTERVIEW", label: "Interview", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    { id: "OFFER", label: "Offer", color: "bg-green-500/10 text-green-500 border-green-500/20" },
];

export default function TalentApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
                    <p className="text-muted-foreground mt-1">Track your job search progress in real-time.</p>
                </div>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" /> New Application
                </Button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-[1000px] h-full">
                    {COLUMNS.map((column) => (
                        <div key={column.id} className="flex-1 min-w-[300px] flex flex-col gap-4">
                            {/* Column Header */}
                            <div className={`p-3 rounded-xl border ${column.color} flex items-center justify-between backdrop-blur-sm`}>
                                <span className="font-semibold text-sm uppercase tracking-wider">{column.label}</span>
                                <span className="bg-background/50 px-2 py-0.5 rounded-md text-xs font-bold">
                                    {applications.filter(a => a.stage === column.id).length}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <ScrollArea className="flex-1">
                                <div className="space-y-3 pr-4 pb-2">
                                    {applications
                                        .filter(app => app.stage === column.id)
                                        .map((app) => (
                                            <motion.div
                                                key={app.id}
                                                layoutId={app.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                                className="group"
                                            >
                                                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:shadow-lg transition-all duration-300">
                                                    <CardHeader className="p-4 pb-3 space-y-2">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8 rounded-lg border border-border/50">
                                                                    <AvatarImage src={`https://avatar.vercel.sh/${app.company}.png`} />
                                                                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">{app.logo}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <h3 className="font-semibold text-sm leading-none">{app.company}</h3>
                                                                    <p className="text-xs text-muted-foreground mt-1">{app.location}</p>
                                                                </div>
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <MoreHorizontal className="h-3 w-3" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                                    <DropdownMenuItem>Move to...</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-red-500">Archive</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        <h4 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">{app.role}</h4>
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-0 pb-3">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                                            <Briefcase className="h-3 w-3" /> {app.salary}
                                                        </div>
                                                        {app.nextStep && (
                                                            <div className="bg-primary/5 border border-primary/10 rounded-lg p-2 flex items-start gap-2">
                                                                <Clock className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                                                <p className="text-[10px] font-medium leading-tight text-primary/80">{app.nextStep}</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                    <CardFooter className="p-3 pt-0 flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/30 mt-2 bg-muted/20 rounded-b-xl group-hover:bg-muted/30 transition-colors">
                                                        <span>Updated {app.date}</span>
                                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] hover:text-primary px-2">
                                                            View
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            </motion.div>
                                        ))}
                                </div>
                            </ScrollArea>

                            {/* Empty State for Column */}
                            {applications.filter(a => a.stage === column.id).length === 0 && (
                                <div className="h-24 rounded-xl border border-dashed border-border/50 flex items-center justify-center text-muted-foreground/40 text-xs uppercase tracking-wide">
                                    No Applications
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
