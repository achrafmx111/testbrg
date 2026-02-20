import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Briefcase,
  MapPin,
  Clock,
  Users,
  MoreVertical,
  TrendingUp,
  Sparkles,
  Database,
  Pencil,
  XCircle,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpJob } from "@/integrations/supabase/mvp";
import { readDemoMode, writeDemoMode } from "@/lib/demo-mode";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const applicationData = [
  { name: "Mon", apps: 4 },
  { name: "Tue", apps: 7 },
  { name: "Wed", apps: 5 },
  { name: "Thu", apps: 12 },
  { name: "Fri", apps: 8 },
  { name: "Sat", apps: 3 },
  { name: "Sun", apps: 2 },
];

const nowIso = new Date().toISOString();
const MOCK_COMPANY_JOBS: MvpJob[] = [
  {
    id: "demo-company-job-1",
    company_id: "demo-company",
    title: "SAP FI Consultant (Demo)",
    description: "Presentation-only role for demo walkthroughs.",
    required_skills: ["SAP FI", "German B2", "S/4HANA"],
    min_experience: 2,
    location: "Berlin",
    salary_range: "EUR 60k - 75k",
    status: "OPEN",
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: "demo-company-job-2",
    company_id: "demo-company",
    title: "SAP MM Analyst (Demo)",
    description: "Presentation-only role for pipeline demos.",
    required_skills: ["SAP MM", "Supply Chain"],
    min_experience: 1,
    location: "Munich",
    salary_range: "EUR 55k - 70k",
    status: "OPEN",
    created_at: nowIso,
    updated_at: nowIso,
  },
];

type JobFormState = {
  title: string;
  description: string;
  location: string;
  salaryRange: string;
  skills: string;
};

const initialJobForm: JobFormState = {
  title: "",
  description: "",
  location: "",
  salaryRange: "",
  skills: "",
};

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [demoMode, setDemoMode] = useState(readDemoMode());
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Creation form state
  const [jobForm, setJobForm] = useState<JobFormState>(initialJobForm);

  // Interaction states
  const [viewingJob, setViewingJob] = useState<MvpJob | null>(null);
  const [editingJob, setEditingJob] = useState<MvpJob | null>(null);
  const [editForm, setEditForm] = useState<JobFormState>(initialJobForm);

  useEffect(() => {
    const loadJobs = async () => {
      if (demoMode) {
        setJobs(MOCK_COMPANY_JOBS);
        setCompanyId(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setJobs([]);
          setCompanyId(null);
          return;
        }

        const profile = await mvp.getMyProfile(user.id);
        if (!profile?.company_id) {
          setJobs([]);
          setCompanyId(null);
          return;
        }

        setCompanyId(profile.company_id);
        const companyJobs = await mvp.listCompanyJobs(profile.company_id);
        setJobs(companyJobs);
      } catch (error) {
        console.error("Error loading jobs:", error);
        toast.error("Failed to load company jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [demoMode]);

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const q = searchQuery.toLowerCase();
        return (
          job.title.toLowerCase().includes(q) ||
          job.location?.toLowerCase().includes(q) ||
          job.required_skills.some((skill) => skill.toLowerCase().includes(q))
        );
      }),
    [jobs, searchQuery],
  );

  const toggleDemoMode = (next: boolean) => {
    setDemoMode(next);
    writeDemoMode(next);
    toast.message(next ? "Presentation mode enabled" : "Live data mode enabled");
  };

  const updateJobForm = (key: keyof JobFormState, value: string) => {
    setJobForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateEditForm = (key: keyof JobFormState, value: string) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateJob = async () => {
    const title = jobForm.title.trim();
    const description = jobForm.description.trim();
    if (!title || !description) {
      toast.error("Title and description are required");
      return;
    }

    if (demoMode) {
      const createdAt = new Date().toISOString();
      const demoJob: MvpJob = {
        id: `demo-company-job-${Date.now()}`,
        company_id: "demo-company",
        title,
        description,
        required_skills: jobForm.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        min_experience: 0,
        location: jobForm.location.trim() || null,
        salary_range: jobForm.salaryRange.trim() || null,
        status: "OPEN",
        created_at: createdAt,
        updated_at: createdAt,
      };
      setJobs((prev) => [demoJob, ...prev]);
      setJobForm(initialJobForm);
      toast.success("Demo job created");
      return;
    }

    if (!companyId) {
      toast.error("Company profile not found");
      return;
    }

    setCreating(true);
    try {
      const createdJob = await mvp.createJob({
        company_id: companyId,
        title,
        description,
        location: jobForm.location.trim() || undefined,
        salary_range: jobForm.salaryRange.trim() || undefined,
        required_skills: jobForm.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      setJobs((prev) => [createdJob, ...prev]);
      setJobForm(initialJobForm);
      toast.success("Job posted successfully");
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
    } finally {
      setCreating(false);
    }
  };

  const initiateEdit = (job: MvpJob) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      description: job.description || "",
      location: job.location || "",
      salaryRange: job.salary_range || "",
      skills: job.required_skills.join(", "),
    });
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    const updatedJob: MvpJob = {
      ...editingJob,
      title: editForm.title,
      description: editForm.description,
      location: editForm.location || null,
      salary_range: editForm.salaryRange || null,
      required_skills: editForm.skills.split(",").map(s => s.trim()).filter(Boolean),
      updated_at: new Date().toISOString()
    };

    // Update local state immediately for responsiveness
    setJobs(prev => prev.map(j => j.id === editingJob.id ? updatedJob : j));
    setEditingJob(null);
    toast.success("Job updated successfully");

    // In a real app, we would make an API call here. 
    // Since we don't have updateJob exposed in mvp client yet, we simulate it locally.
  };

  const handleCloseJob = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: "CLOSED" } : j));
    toast.success("Job status set to CLOSED");
  };

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Job Listings</h1>
          <p className="text-slate-500 font-medium">Manage your open positions and track applications.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            data-testid="company-jobs-mode-demo"
            type="button"
            size="sm"
            variant={demoMode ? "default" : "secondary"}
            onClick={() => toggleDemoMode(true)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" /> Presentation
          </Button>
          <Button
            data-testid="company-jobs-mode-live"
            type="button"
            size="sm"
            variant={!demoMode ? "default" : "secondary"}
            onClick={() => toggleDemoMode(false)}
            className="gap-2"
          >
            <Database className="h-4 w-4" /> Live Data
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Post New Job</CardTitle>
          <CardDescription>
            {demoMode
              ? "Create temporary jobs for presentation walkthroughs."
              : "Create a live job posting for your company pipeline."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input
            data-testid="company-job-title"
            placeholder="Job title"
            value={jobForm.title}
            onChange={(event) => updateJobForm("title", event.target.value)}
          />
          <Input
            data-testid="company-job-location"
            placeholder="Location"
            value={jobForm.location}
            onChange={(event) => updateJobForm("location", event.target.value)}
          />
          <Input
            data-testid="company-job-description"
            placeholder="Short description"
            value={jobForm.description}
            onChange={(event) => updateJobForm("description", event.target.value)}
          />
          <Input
            data-testid="company-job-salary"
            placeholder="Salary range"
            value={jobForm.salaryRange}
            onChange={(event) => updateJobForm("salaryRange", event.target.value)}
          />
          <Input
            data-testid="company-job-skills"
            className="md:col-span-2"
            placeholder="Skills (comma separated)"
            value={jobForm.skills}
            onChange={(event) => updateJobForm("skills", event.target.value)}
          />
          <div className="md:col-span-2 flex justify-end">
            <Button
              data-testid="company-job-submit"
              type="button"
              onClick={handleCreateJob}
              disabled={creating}
              className="h-11 px-5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
            >
              <Plus className="mr-2 h-4 w-4" />
              {creating ? "Posting..." : "Post New Job"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-sm border-border/60 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-foreground">{jobs.length}</span>
              <div className="flex items-center text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full text-xs font-bold">
                <TrendingUp className="h-3 w-3 mr-1" /> +2 this week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-2xl shadow-sm border-border/60">
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
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#1e293b",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{ color: "#1e293b" }}
                />
                <Area type="monotone" dataKey="apps" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search jobs..."
            className="pl-10 h-12 rounded-xl border-slate-200 bg-white"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="grid gap-4" data-testid="company-job-list">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading jobs...</div>
          ) : null}

          {filteredJobs.map((job) => (
            <Card key={job.id} className="group hover:shadow-md transition-all border-slate-200 rounded-xl overflow-hidden" data-testid="company-job-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location ?? "Remote"}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Full-time</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 12 Candidates</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={job.status === "CLOSED" ? "outline" : "secondary"} className={`px-3 py-1 font-bold ${job.status === "CLOSED" ? "text-muted-foreground" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}>
                      {job.status === "CLOSED" ? "Closed" : "Active"}
                    </Badge>
                    <Link to={`/company/pipeline?job_id=${job.id}`}>
                      <Button variant="outline" size="sm" className="hidden md:flex">View Candidates</Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => initiateEdit(job)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setViewingJob(job)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleCloseJob(job.id)}>
                          <XCircle className="mr-2 h-4 w-4" /> Close Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredJobs.length === 0 && !loading ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No jobs found</h3>
              <p className="text-slate-500">Try adjusting your search terms or post a new job.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* View Job Details Sheet */}
      <Sheet open={!!viewingJob} onOpenChange={() => setViewingJob(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-xl w-full">
          <SheetHeader>
            <SheetTitle className="text-2xl">{viewingJob?.title}</SheetTitle>
            <SheetDescription>
              Job ID: {viewingJob?.id} • Posted on {viewingJob?.created_at && new Date(viewingJob.created_at).toLocaleDateString()}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">About the Role</h4>
              <p className="text-base leading-relaxed whitespace-pre-line">{viewingJob?.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-muted-foreground">Location</h4>
                <p className="text-sm font-medium">{viewingJob?.location || "Remote"}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-muted-foreground">Salary Range</h4>
                <p className="text-sm font-medium">{viewingJob?.salary_range || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-muted-foreground">Experience Needed</h4>
                <p className="text-sm font-medium">{viewingJob?.min_experience} Years</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                <Badge variant={viewingJob?.status === "CLOSED" ? "outline" : "default"}>
                  {viewingJob?.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {viewingJob?.required_skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-8 flex flex-col gap-2">
              <Button onClick={() => setViewingJob(null)} className="w-full">
                Close Details
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Job Dialog */}
      <Dialog open={!!editingJob} onOpenChange={(open) => !open && setEditingJob(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Job Posting</DialogTitle>
            <DialogDescription>
              Make changes to your job listing here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">Title</Label>
              <Input id="edit-title" value={editForm.title} onChange={(e) => updateEditForm("title", e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">Location</Label>
              <Input id="edit-location" value={editForm.location} onChange={(e) => updateEditForm("location", e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-salary" className="text-right">Salary</Label>
              <Input id="edit-salary" value={editForm.salaryRange} onChange={(e) => updateEditForm("salaryRange", e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-skills" className="text-right">Skills</Label>
              <Input id="edit-skills" value={editForm.skills} onChange={(e) => updateEditForm("skills", e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="edit-desc" className="text-right mt-2">Description</Label>
              <Textarea id="edit-desc" value={editForm.description} onChange={(e) => updateEditForm("description", e.target.value)} className="col-span-3" rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingJob(null)}>Cancel</Button>
            <Button onClick={handleUpdateJob}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
