import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpJob } from "@/integrations/supabase/mvp";

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [skills, setSkills] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await mvp.getMyProfile(user.id);
      if (!profile?.company_id) return;

      const data = await mvp.listCompanyJobs(profile.company_id);
      setJobs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const profile = await mvp.getMyProfile(user.id);
    if (!profile?.company_id) return;

    setSaving(true);
    try {
      await mvp.createJob({
        company_id: profile.company_id,
        title,
        description,
        location,
        salary_range: salaryRange,
        required_skills: skills
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      });

      setTitle("");
      setDescription("");
      setLocation("");
      setSalaryRange("");
      setSkills("");
      toast({ title: "Job created", description: "Your vacancy was added successfully." });
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Job creation failed", description: error?.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Jobs</h2>

      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border p-4">
        <p className="font-medium">Create Job</p>
        <Input
          data-testid="company-job-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Job title"
          required
          disabled={saving}
        />
        <Input
          data-testid="company-job-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
          disabled={saving}
        />
        <Input
          data-testid="company-job-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          disabled={saving}
        />
        <Input
          data-testid="company-job-salary"
          value={salaryRange}
          onChange={(e) => setSalaryRange(e.target.value)}
          placeholder="Salary range"
          disabled={saving}
        />
        <Input
          data-testid="company-job-skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Skills (comma separated)"
          disabled={saving}
        />
        <Button data-testid="company-job-submit" type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create"}
        </Button>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading jobs...
        </div>
      ) : null}

      <div className="space-y-3" data-testid="company-job-list">
        {!loading && jobs.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">No jobs yet. Create your first one above.</div>
        ) : null}
        {jobs.map((job) => (
          <div key={job.id} className="rounded-lg border p-3" data-testid="company-job-card">
            <p className="font-medium">{job.title}</p>
            <p className="text-xs text-muted-foreground" data-testid="company-job-id">
              ID: {job.id}
            </p>
            <p className="text-sm text-muted-foreground">{job.location ?? "Remote"}</p>
            <p className="text-sm">{job.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
