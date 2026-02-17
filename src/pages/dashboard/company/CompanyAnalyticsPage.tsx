import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, Users, Clock, Target } from "lucide-react";
import { TimeToHireChart } from "./analytics/TimeToHireChart";
import { FunnelChart } from "./analytics/FunnelChart";

export default function CompanyAnalyticsPage() {
    return (
        <div className="space-y-8 p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Analytics Hub
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">BETA</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Data-driven insights to optimize your hiring process.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select defaultValue="30d">
                        <SelectTrigger className="w-[180px] h-10 rounded-lg bg-white dark:bg-slate-800 border-slate-200 shadow-sm font-medium">
                            <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last quarter</SelectItem>
                            <SelectItem value="1y">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="h-10 rounded-lg border-slate-200 shadow-sm">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Time to Hire" value="28 Days" trend="-12%" trendUp={true} icon={Clock} />
                <KPICard title="Offer Acceptance" value="85%" trend="+5%" trendUp={true} icon={Target} />
                <KPICard title="Total Applicants" value="248" trend="+22%" trendUp={true} icon={Users} />
                <KPICard title="Cost per Hire" value="€1,250" trend="-5%" trendUp={true} icon={TrendingUp} />
            </div>

            {/* Main Charts */}
            <Tabs defaultValue="hiring" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
                    <TabsTrigger value="hiring" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Hiring Performance</TabsTrigger>
                    <TabsTrigger value="pipeline" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Pipeline Health</TabsTrigger>
                    <TabsTrigger value="sourcing" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Sourcing Channels</TabsTrigger>
                </TabsList>

                <TabsContent value="hiring" className="space-y-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                        <TimeToHireChart />
                        <FunnelChart />
                    </div>
                </TabsContent>

                <TabsContent value="pipeline">
                    <div className="flex items-center justify-center h-[400px] bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">Detailed pipeline analytics coming soon...</p>
                    </div>
                </TabsContent>

                <TabsContent value="sourcing">
                    <div className="flex items-center justify-center h-[400px] bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">Sourcing channel analytics coming soon...</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function KPICard({ title, value, trend, trendUp, icon: Icon }: any) {
    return (
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-slate-500">{title}</p>
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{value}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
