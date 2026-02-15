import { useEffect, useState } from "react";
import { BriefcaseBusiness, MapPin, Plus, Pencil, Trash2, Loader2, XCircle, Building2 } from "lucide-react";
import { mvp, MvpJob, MvpCompany, type JobStatus } from "@/integrations/supabase/mvp";
import { AdminEmptyState, AdminSectionHeader, AdminStatusBadge } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function JobModal({
  open,
  job,
  companies,
  onClose,
  onSaved,
}: {
  open: boolean;
  job: MvpJob | null;
  companies: MvpCompany[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [companyId, setCompanyId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (job) {
      setCompanyId(job.company_id);
      setTitle(job.title);
      setDescription(job.description);
      setSkills(job.required_skills.join(", "));
      setLocation(job.location ?? "");
      setSalaryRange(job.salary_range ?? "");
    } else {
      setCompanyId(companies[0]?.id ?? "");
      setTitle("");
      setDescription("");
      setSkills("");
      setLocation("");
      setSalaryRange("");
    }
  }, [job, open, companies]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !companyId) return;
    setSaving(true);
    try {
      const parsedSkills = skills.split(",").map((s) => s.trim()).filter(Boolean);
      if (job) {
        await mvp.updateJob(job.id, {
          title,
          description,
          required_skills: parsedSkills,
          location: location || null,
          salary_range: salaryRange || null,
        });
        toast({ title: "Job updated" });
      } else {
        await mvp.createJob({
          company_id: companyId,
          title,
          description,
          required_skills: parsedSkills,
          location: location || undefined,
          salary_range: salaryRange || undefined,
        });
        toast({ title: "Job posted" });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err?.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-lg font-semibold text-foreground">
          {job ? "Edit Job" : "Post New Job"}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Company *</label>
            <Select value={companyId} onValueChange={setCompanyId} disabled={!!job}>
              <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Job Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="SAP S/4HANA Consultant" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Description *</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Job responsibilities and requirements..." rows={3} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Required Skills (comma separated)</label>
            <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="S/4HANA, ABAP, Fiori" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Berlin, Germany" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Salary Range</label>
              <Input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="50k-70k EUR" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">Cancel</Button>
          <Button type="submit" disabled={saving} className="gap-1.5 rounded-lg">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {job ? "Update" : "Post Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<MvpJob[]>([]);
  const [companies, setCompanies] = useState<MvpCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<MvpJob | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [j, c] = await Promise.all([mvp.listJobs(), mvp.listCompanies()]);
      setJobs(j);
      setCompanies(c);
    } catch { /* ignored */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "Unknown";

  const handleClose = async (job: MvpJob) => {
    if (!window.confirm(`Close "${job.title}"? It will no longer appear to talents.`)) return;
    try {
      await mvp.updateJob(job.id, { status: "CLOSED" as JobStatus });
      toast({ title: "Job closed" });
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err?.message });
    }
  };

  const handleDelete = async (job: MvpJob) => {
    if (!window.confirm(`Delete "${job.title}" permanently?`)) return;
    try {
      await mvp.deleteJob(job.id);
      toast({ title: "Job deleted" });
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete failed", description: err?.message });
    }
  };

  return (
    <div className={adminClassTokens.pageShell}>
      <div className="flex items-center justify-between">
        <AdminSectionHeader title="Jobs" description="Open opportunities, requirements, and pipeline readiness." />
        <Button onClick={() => { setEditingJob(null); setModalOpen(true); }} className="gap-1.5 rounded-lg shadow-sm">
          <Plus className="h-4 w-4" /> Post Job
        </Button>
      </div>

      {!loading && jobs.length === 0 ? <AdminEmptyState text="No jobs yet. Click 'Post Job' to create the first opening." /> : null}

      <div className={adminClassTokens.tableWrap}>
        <table className="w-full">
          <thead className={adminClassTokens.tableHead}>
            <tr>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Company</th>
              <th className="px-5 py-3 text-left">Location</th>
              <th className="px-5 py-3 text-left">Skills</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className={adminClassTokens.tableRow}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/8 text-secondary-foreground">
                      <BriefcaseBusiness className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium tracking-[-0.01em] text-foreground">{job.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{job.salary_range ?? "Salary TBD"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    {companyName(job.company_id)}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {job.location ?? "Remote"}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.length > 0
                      ? job.required_skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="rounded-md border border-border/40 bg-muted/20 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          {skill}
                        </span>
                      ))
                      : <span className="text-xs text-muted-foreground/60">No skills listed</span>}
                    {job.required_skills.length > 3 && (
                      <span className="rounded-md border border-border/40 bg-muted/20 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        +{job.required_skills.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <AdminStatusBadge text={job.status} kind={job.status === "OPEN" ? "primary" : "neutral"} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      onClick={() => { setEditingJob(job); setModalOpen(true); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {job.status === "OPEN" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-amber-100 hover:text-amber-600"
                        onClick={() => handleClose(job)}
                        title="Close job"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(job)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <JobModal
        open={modalOpen}
        job={editingJob}
        companies={companies}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
