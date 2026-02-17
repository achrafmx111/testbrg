
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Briefcase,
  MapPin,
  Clock,
  Users,
  MoreVertical,
  TrendingUp,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpJob } from "@/integrations/supabase/mvp";
import { formatDistanceToNow } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the chart
const applicationData = [
  { name: 'Mon', apps: 4 },
  { name: 'Tue', apps: 7 },
  { name: 'Wed', apps: 5 },
  { name: 'Thu', apps: 12 },
  { name: 'Fri', apps: 8 },
  { name: 'Sat', apps: 3 },
  { name: 'Sun', apps: 2 },
];

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await mvp.getMyProfile(user.id);
      if (profile?.company_id) {
        const companyJobs = await mvp.listCompanyJobs(profile.company_id);
        setJobs(companyJobs);
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Job Listings</h1>
          <p className="text-slate-500 font-medium">Manage your open positions and track applications.</p>
        </div>
        <Button className="h-12 px-6 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
          <Plus className="mr-2 h-5 w-5" /> Post New Job
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats Card */}
        <Card className="rounded-2xl shadow-sm border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-slate-900 dark:text-white">{jobs.length}</span>
              <div className="flex items-center text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full text-xs font-bold">
                <TrendingUp className="h-3 w-3 mr-1" /> +2 this week
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Activity Chart */}
        <Card className="lg:col-span-2 rounded-2xl shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Application Activity</CardTitle>
                <CardDescription>New applications received this week</CardDescription>
              </div>
              <Badge variant="outline" className="text-slate-500">Last 7 Days</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[120px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={applicationData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="apps" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search jobs..."
            className="pl-10 h-12 rounded-xl border-slate-200 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="group hover:shadow-md transition-all border-slate-200 rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.job_type}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 12 Candidates</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-3 py-1">Active</Badge>
                    <Button variant="outline" size="sm" className="hidden md:flex">View Candidates</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Job</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Close Job</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredJobs.length === 0 && !loading && (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No jobs found</h3>
              <p className="text-slate-500">Try adjusting your search terms or post a new job.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
