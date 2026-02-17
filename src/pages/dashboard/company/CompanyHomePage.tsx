import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Briefcase, Calendar, TrendingUp, Plus, Search, MessageSquare, Bell, Loader2, ArrowUpRight, CheckCircle2, UserPlus, FileText, Building2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpApplication, MvpInterview, MvpJob } from "@/integrations/supabase/mvp";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area
} from "recharts";

const funnelData = [
    { stage: "Applied", count: 450, color: "hsl(var(--primary))" },
    { stage: "Screening", count: 280, color: "hsl(var(--navy))" },
    { stage: "Interview", count: 120, color: "hsl(var(--gold))" },
    { stage: "Offer", count: 45, color: "hsl(var(--orange))" },
    { stage: "Hired", count: 22, color: "hsl(var(--primary))" },
];

const chartData = [
    { name: "Mon", apps: 12 },
    { name: "Tue", apps: 18 },
    { name: "Wed", apps: 15 },
    { name: "Thu", apps: 25 },
    { name: "Fri", apps: 32 },
    { name: "Sat", apps: 10 },
    { name: "Sun", apps: 8 },
];

export default function CompanyHomePage() {
    const [stats, setStats] = useState({
        activeJobs: 0,
        newApplicants: 0,
        interviews: 0,
        hired: 0
    });
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState("");

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const profile = await mvp.getMyProfile(user.id);
            if (!profile?.company_id) return;

            // Fetch Company Info
            const companies = await mvp.listCompanies();
            const myCompany = companies.find(c => c.id === profile.company_id);
            if (myCompany) setCompanyName(myCompany.name);

            // Fetch Jobs
            const jobs = await mvp.listCompanyJobs(profile.company_id);
            const activeJobs = jobs.filter(j => j.status === 'OPEN').length;

            // Fetch Applications
            const applications = await mvp.listCompanyApplications(profile.company_id);
            const newApplicants = applications.filter(a => a.stage === 'APPLIED').length;
            const hired = applications.filter(a => a.stage === 'HIRED').length;

            // Fetch Interviews
            const interviews = await mvp.listInterviews(profile.company_id);
            const myInterviews = interviews.filter(i => true); // RLS filtered

            setStats({
                activeJobs,
                newApplicants,
                interviews: myInterviews.length,
                hired
            });

            const recentApps = applications.slice(0, 3).map((app, i) => ({
                id: `app-${app.id}`,
                type: 'application',
                user: 'Candidate',
                role: jobs.find(j => j.id === app.job_id)?.title || 'Job',
                time: new Date(app.created_at).toLocaleDateString(),
                avatar: 'C'
            }));

            const systemActivities = [
                { id: 'sys-1', type: "system", title: "Premium Campaign Active", desc: "Your SAP consultant job is trending", time: "Just now", icon: Sparkles },
            ];

            setActivities([...recentApps, ...systemActivities]);

        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: "Active Jobs", value: stats.activeJobs, change: "+2 this week", icon: Briefcase, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20 shadow-primary/10" },
        { label: "New Applicants", value: stats.newApplicants, change: "+12.5%", icon: UserPlus, color: "text-gold", bg: "bg-gold/10", border: "border-gold/20 shadow-gold/10" },
        { label: "Interviews", value: stats.interviews, change: "4 today", icon: Calendar, color: "text-orange", bg: "bg-orange/10", border: "border-orange/20 shadow-orange/10" },
        { label: "Hired", value: stats.hired, change: "Target: 25", icon: CheckCircle2, color: "text-navy", bg: "bg-navy/10", border: "border-navy/20 shadow-navy/10" },
    ];

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-primary/40" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
            {/* Glassmorphic Hero Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group overflow-hidden rounded-[2.5rem] bg-navy-dark p-8 md:p-14 text-white shadow-2xl"
            >
                {/* Dynamic Background */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent blur-3xl -z-0"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold/5 rounded-full blur-[100px] -z-0"></div>

                <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold backdrop-blur-xl border border-white/10 text-primary-foreground/80 tracking-wide uppercase">
                            <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse"></span>
                            Recruiter Command Center
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                                <span className="text-white">Welcome back,</span><br />
                                <span className="bg-gradient-to-r from-primary via-gold to-orange bg-clip-text text-transparent">
                                    {companyName || "Partner"}
                                </span>
                            </h1>
                            <p className="text-slate-400 max-w-md text-lg leading-relaxed">
                                Your hiring pipeline is performing <span className="text-white font-medium">15% better</span> than last month. Ready to close some deals?
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link to="/company/jobs">
                                <Button size="lg" className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group">
                                    <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" /> Post a New Role
                                </Button>
                            </Link>
                            <Link to="/company/talent-pool">
                                <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 transition-all">
                                    <Search className="mr-2 h-5 w-5" /> Browse Talent
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Mini Chart Integration in Hero */}
                    <div className="hidden lg:block bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl h-64">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-slate-400">Application Velocity</p>
                            <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20">+24%</Badge>
                        </div>
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="apps" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards - Premium Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                        >
                            <Card className={`group border ${stat.border} bg-white/50 dark:bg-navy/20 backdrop-blur-xl shadow-lg transition-all duration-500 overflow-hidden rounded-3xl`}>
                                <CardContent className="p-8 relative">
                                    <div className={`absolute top-0 right-0 h-32 w-32 -mr-8 -mt-8 rounded-full ${stat.bg} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="space-y-4">
                                            <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:rotate-6 duration-300`}>
                                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                                <div className="flex items-baseline gap-2">
                                                    <h3 className="text-4xl font-extrabold text-navy dark:text-white tracking-tighter">{stat.value}</h3>
                                                    <span className={`text-xs font-bold ${stat.color} bg-current/5 px-2 py-0.5 rounded-full ring-1 ring-current/20`}>
                                                        {stat.change}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Hiring Funnel Chart */}
                <Card className="lg:col-span-2 rounded-[2rem] border-slate-200 dark:border-navy/40 bg-white/80 dark:bg-navy/10 backdrop-blur-md shadow-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-8">
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight">Hiring Pipeline Funnel</CardTitle>
                            <CardDescription>Visual breakdown of current recruitment stages.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl border-gold/20 text-gold hover:bg-gold/5">Current Quarter</Button>
                    </CardHeader>
                    <CardContent className="p-4 md:p-8 pt-0">
                        <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 40, top: 0, bottom: 0 }} barGap={20}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="stage"
                                        type="category"
                                        width={100}
                                        tick={{ fill: 'hsl(var(--navy))', fontSize: 13, fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', padding: '12px 16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                        itemStyle={{ color: '#1e293b' }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        radius={[0, 20, 20, 0]}
                                        barSize={40}
                                        animationDuration={1500}
                                    >
                                        {funnelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8 + (index * 0.05)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Real-time Activity Hub */}
                <div className="space-y-8">
                    <Card className="rounded-[2.5rem] border-slate-200 dark:border-navy/40 shadow-xl">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-gold" /> Recent Pulse
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className="space-y-8">
                                {activities.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.15 }}
                                        className="flex items-start gap-4"
                                    >
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${activity.type === 'system' ? 'bg-gold/10 text-gold' : 'bg-primary/5 text-primary'}`}>
                                            {activity.type === 'system' ? <activity.icon className="h-5 w-5" /> : <Avatar className="h-full w-full"><AvatarFallback className="rounded-2xl bg-primary/10 text-primary">{activity.avatar}</AvatarFallback></Avatar>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-navy dark:text-white truncate">
                                                {activity.type === 'system' ? activity.title : activity.user}
                                            </p>
                                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                                {activity.type === 'application' ? `Applied for ${activity.role}` : activity.desc}
                                            </p>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">
                                                {activity.time}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <Link to="/company/applicants">
                                <Button variant="secondary" className="w-full mt-10 h-12 rounded-2xl bg-slate-100 dark:bg-navy/20 hover:bg-slate-200 font-bold transition-all text-navy dark:text-white">
                                    View Detailed Activity
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Quick Referral/Share Card */}
                    <Card className="bg-primary rounded-[2.5rem] text-primary-foreground p-8 shadow-2xl shadow-primary/20 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="relative z-10 space-y-4">
                            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold">Refer a Company?</h3>
                            <p className="text-primary-foreground/70 text-sm">Get 3 months of Premium free for every successful referral.</p>
                            <Button className="w-full bg-white text-navy hover:bg-slate-100 rounded-2xl font-bold">Copy Invite Link</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

