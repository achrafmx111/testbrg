import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  DollarSign,
  Search,
  Filter,
  Sparkles,
  Zap,
  Building2,
  Clock,
  ArrowRight,
  Database,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpJob } from "@/integrations/supabase/mvp";
import { readDemoMode, writeDemoMode } from "@/lib/demo-mode";

type JobView = {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  match: number;
  skills: string[];
  description: string;
};

const MOCK_JOBS: JobView[] = [
  {
    id: "1",
    title: "Senior SAP FI/CO Consultant",
    company: "TechSolutions GmbH",
    logo: "TS",
    location: "Berlin (Hybrid)",
    salary: "EUR 75k - 90k",
    type: "Full-time",
    posted: "2 days ago",
    match: 95,
    skills: ["SAP FI", "SAP CO", "German C1", "S/4HANA"],
    description: "Leading implementation projects for enterprise clients.",
  },
  {
    id: "2",
    title: "SAP MM Functional Analyst",
    company: "Global Corp",
    logo: "GC",
    location: "Munich",
    salary: "EUR 65k - 80k",
    type: "Contract",
    posted: "1 day ago",
    match: 88,
    skills: ["SAP MM", "Supply Chain", "English B2"],
    description: "Support and optimize material management processes.",
  },
];

function postedLabel(createdAt: string): string {
  const created = new Date(createdAt).getTime();
  const deltaHours = Math.max(1, Math.floor((Date.now() - created) / (1000 * 60 * 60)));
  if (deltaHours < 24) return `${deltaHours}h ago`;
  const days = Math.floor(deltaHours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function toView(job: MvpJob, companyName: string): JobView {
  const text = `${job.title} ${job.description}`.toLowerCase();
  const match = text.includes("sap") ? 90 : 72;
  return {
    id: job.id,
    title: job.title,
    company: companyName,
    logo: companyName.slice(0, 2).toUpperCase(),
    location: job.location ?? "Remote",
    salary: job.salary_range ?? "Negotiable",
    type: "Full-time",
    posted: postedLabel(job.created_at),
    match,
    skills: job.required_skills,
    description: job.description,
  };
}

export default function TalentJobsPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobView[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [demoMode, setDemoMode] = useState(readDemoMode());
  const [talentUserId, setTalentUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (demoMode) {
        setJobs(MOCK_JOBS);
        setAppliedJobs(new Set());
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setJobs([]);
          setAppliedJobs(new Set());
          return;
        }

        setTalentUserId(user.id);
        const [openJobs, companies, applications] = await Promise.all([
          mvp.listOpenJobs(),
          mvp.listCompanies(),
          mvp.listTalentApplications(user.id),
        ]);

        const companyMap = new Map(companies.map((c) => [c.id, c.name]));
        setJobs(openJobs.map((job) => toView(job, companyMap.get(job.company_id) ?? "Company")));
        setAppliedJobs(new Set(applications.map((app) => app.job_id)));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load jobs");
      }
    };

    load();
  }, [demoMode]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = search.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q));
      const matchesType = filterType === "all" || job.type.toLowerCase().includes(filterType);
      return matchesSearch && matchesType;
    });
  }, [filterType, jobs, search]);

  const handleApply = async (jobId: string) => {
    if (appliedJobs.has(jobId)) return;

    if (demoMode) {
      setApplyingId(jobId);
      setTimeout(() => {
        setApplyingId(null);
        setAppliedJobs((prev) => new Set(prev).add(jobId));
        toast.success("Demo application submitted");
      }, 900);
      return;
    }

    if (!talentUserId) {
      toast.error("Please login first");
      return;
    }

    try {
      setApplyingId(jobId);
      await mvp.applyToJob(jobId, talentUserId);
      setAppliedJobs((prev) => new Set(prev).add(jobId));
      toast.success("Application sent successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply");
    } finally {
      setApplyingId(null);
    }
  };

  const toggleDemoMode = (next: boolean) => {
    setDemoMode(next);
    writeDemoMode(next);
    toast.message(next ? "Presentation mode enabled" : "Live data mode enabled");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto p-6">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-medium mb-4 border border-white/10">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span>{demoMode ? "Presentation Mode" : "Live Data Mode"}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Find Your Next <br /> <span className="text-indigo-200">SAP Dream Job</span>
          </h1>

          <p className="text-indigo-100 text-lg mb-6 max-w-lg leading-relaxed">
            You can switch instantly between mock presentation and real database data.
          </p>

          <div className="flex items-center gap-2 mb-6">
            <Button type="button" size="sm" variant={demoMode ? "default" : "secondary"} onClick={() => toggleDemoMode(true)} className="gap-2 bg-white text-indigo-700 hover:bg-white/90">
              <Sparkles className="h-4 w-4" /> Presentation
            </Button>
            <Button type="button" size="sm" variant={!demoMode ? "default" : "secondary"} onClick={() => toggleDemoMode(false)} className="gap-2 bg-slate-900/40 text-white hover:bg-slate-900/60">
              <Database className="h-4 w-4" /> Live Data
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-200" />
              <input
                type="text"
                placeholder="Job title, skill, or keyword..."
                className="w-full bg-transparent border-none text-white placeholder:text-indigo-300 focus:ring-0 pl-9 h-10 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="h-px sm:h-auto sm:w-px bg-white/20 mx-2" />
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] bg-transparent border-none text-white focus:ring-0 h-10">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-white text-indigo-600 hover:bg-white/90 font-semibold rounded-xl px-6">Search</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="hidden lg:block space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Your Market Value</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Avg. Salary</span><span className="font-semibold">EUR 55k - 75k</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Top Skill</span><span className="font-semibold text-primary">SAP FI</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Locations</span><span className="font-semibold">Remote, Berlin</span></div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-gradient-to-b from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Optimize your CV with keywords like "S/4HANA" to increase your match score.
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{filteredJobs.length} Positions Found</h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Filter className="w-4 h-4 mr-2" /> Sort by: Recommended
            </Button>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {filteredJobs.map((job) => {
                const isApplied = appliedJobs.has(job.id);
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group"
                    data-testid="talent-job-card"
                  >
                    <Card className="overflow-hidden border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-md group-hover:bg-accent/5">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className={`w-full sm:w-1.5 h-1 sm:h-auto ${job.match >= 90 ? "bg-green-500" : job.match >= 80 ? "bg-amber-500" : "bg-blue-500"}`} />

                          <div className="flex-1 p-5 md:p-6 space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-white border border-border/50 flex items-center justify-center shadow-sm text-lg font-bold text-primary">{job.logo}</div>
                                <div>
                                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {job.company}
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="text-xs">{job.posted}</span>
                                  </div>
                                </div>
                              </div>
                              {job.match > 80 && (
                                <Badge variant="outline" className={`hidden sm:flex items-center gap-1 ${job.match >= 90 ? "border-green-500/30 text-green-600 bg-green-500/5" : "border-amber-500/30 text-amber-600 bg-amber-500/5"}`}>
                                  <Sparkles className="w-3 h-3" /> {job.match}% Match
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 opacity-70" />{job.location}</div>
                              <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 opacity-70" />{job.salary}</div>
                              <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 opacity-70" />{job.type}</div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {job.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="font-normal text-xs bg-muted/50 text-muted-foreground border-transparent">{skill}</Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center justify-between sm:justify-center p-5 border-t sm:border-t-0 sm:border-l border-border/50 gap-3 bg-muted/5 min-w-[140px]">
                            <div className="sm:hidden flex items-center gap-2">
                              <span className="font-bold text-primary text-lg">{job.match}%</span>
                              <span className="text-xs text-muted-foreground">Match</span>
                            </div>
                            <Button onClick={() => handleApply(job.id)} disabled={applyingId === job.id || isApplied} className="w-full sm:w-auto">
                              {isApplied ? "Applied" : applyingId === job.id ? "Sending..." : "Apply"}
                              {!isApplied && applyingId !== job.id && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full sm:w-auto text-xs text-muted-foreground">View Details</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
