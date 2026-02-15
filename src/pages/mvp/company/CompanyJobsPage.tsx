import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, MapPin, DollarSign, Users, MoreHorizontal, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpJob, MvpApplication } from "@/integrations/supabase/mvp";

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [applications, setApplications] = useState<MvpApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [skills, setSkills] = useState("");
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await mvp.getMyProfile(user.id);
      if (!profile?.company_id) return;

      const [data, apps] = await Promise.all([
        mvp.listCompanyJobs(profile.company_id),
        mvp.listCompanyApplications(profile.company_id)
      ]);
      setJobs(data);
      setApplications(apps);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Form State
  const [minExperience, setMinExperience] = useState(0);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const profile = await mvp.getMyProfile(user.id);
    if (!profile?.company_id) {
      toast({ variant: "destructive", title: "Error", description: "Company profile not found." });
      return;
    }

    // Prepare data
    const rawData = {
      title,
      description,
      location,
      salary_range: salaryRange,
      min_experience: Number(minExperience),
      required_skills: skills.split(",").map((value) => value.trim()).filter(Boolean),
    };

    // Validate
    const { jobPostSchema } = await import("@/lib/zodSchemas");
    const result = jobPostSchema.safeParse(rawData);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: result.error.errors[0].message
      });
      return;
    }

    setSaving(true);
    try {
      await mvp.createJob({
        company_id: profile.company_id,
        ...result.data,
        status: "OPEN" as const
      });

      setTitle("");
      setDescription("");
      setLocation("");
      setSalaryRange("");
      setSkills("");
      setMinExperience(0);
      setOpen(false);
      toast({ title: "Job created", description: "Your vacancy was posted successfully." });
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Job creation failed", description: error?.message });
    } finally {
      setSaving(false);
    }
  };

  const getApplicantCount = (jobId: string) => {
    return applications.filter(a => a.job_id === jobId).length;
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
          <p className="text-muted-foreground">Manage your open positions and view applicants.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Post Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Post a New Job</DialogTitle>
              <DialogDescription>
                Create a new job listing for your company.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior React Developer"
                  required
                  disabled={saving}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote / Berlin"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Salary Range</label>
                  <Input
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. €50k - €70k"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min. Experience (Years)</label>
                  <Input
                    type="number"
                    min="0"
                    value={minExperience}
                    onChange={(e) => setMinExperience(Number(e.target.value))}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Required Skills</label>
                  <Input
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, TypeScript, Node.js"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                  rows={5}
                  disabled={saving}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Posting..." : "Post Job"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">No active jobs</h3>
            <p className="text-muted-foreground">Get started by posting your first job opening.</p>
            <Button onClick={() => setOpen(true)} variant="link" className="mt-2">
              Post a Job
            </Button>
          </div>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || 'Remote'}</span>
                      {job.salary_range && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {job.salary_range}</span>}
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 font-medium">
                        {job.status}
                      </span>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.required_skills.slice(0, 5).map((skill, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                      {skill}
                    </span>
                  ))}
                  {job.required_skills.length > 5 && (
                    <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground text-muted-foreground">
                      +{job.required_skills.length - 5}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-medium text-foreground">{getApplicantCount(job.id)}</span> Applicants
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/company/applicants?jobId=${job.id}`}>View Applicants</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
