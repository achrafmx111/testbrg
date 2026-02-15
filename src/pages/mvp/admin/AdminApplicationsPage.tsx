import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  Check,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Filter,
  Mail,
  Search,
  Sparkles,
  Star,
  User,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminPanelHeader, AdminSectionHeader, AdminStatusBadge } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { MockApplication, MockPipelineStage, mockActivityByApplicationId, mockAdminApplications } from "./mockData";

const STAGE_OPTIONS: Array<"ALL" | MockPipelineStage> = ["ALL", "APPLIED", "SCREEN", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

const STATUS_OPTIONS = ["all", "pending", "reviewed", "contacted", "approved", "accepted", "rejected"];

export default function AdminApplicationsPage() {
  const [searchParams] = useSearchParams();
  const initialStage = (searchParams.get("stage") as MockPipelineStage | null) ?? "ALL";

  const [applications, setApplications] = useState<MockApplication[]>(mockAdminApplications);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState<"ALL" | MockPipelineStage>(
    STAGE_OPTIONS.includes(initialStage as "ALL" | MockPipelineStage) ? initialStage : "ALL",
  );
  const [trackFilter, setTrackFilter] = useState("ALL");
  const [germanFilter, setGermanFilter] = useState("ALL");
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<MockApplication | null>(null);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});

  const availableTracks = useMemo(
    () => ["ALL", ...Array.from(new Set(applications.map((a) => a.sap_track || "Unknown")))],
    [applications],
  );

  const availableGerman = useMemo(
    () => ["ALL", ...Array.from(new Set(applications.map((a) => a.german_level || "Unknown")))],
    [applications],
  );

  const filteredApplications = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesSearch =
        !s ||
        app.name?.toLowerCase().includes(s) ||
        app.email?.toLowerCase().includes(s) ||
        app.sap_track?.toLowerCase().includes(s);
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const matchesStage = stageFilter === "ALL" || app.pipeline_stage === stageFilter;
      const matchesTrack = trackFilter === "ALL" || (app.sap_track || "Unknown") === trackFilter;
      const matchesGerman = germanFilter === "ALL" || (app.german_level || "Unknown") === germanFilter;
      return matchesSearch && matchesStatus && matchesStage && matchesTrack && matchesGerman;
    });
  }, [applications, germanFilter, searchTerm, stageFilter, statusFilter, trackFilter]);

  const summary = useMemo(() => {
    return {
      total: filteredApplications.length,
      shortlisted: filteredApplications.filter((a) => ["INTERVIEW", "OFFER", "HIRED"].includes(a.pipeline_stage)).length,
      approved: filteredApplications.filter((a) => a.status === "approved" || a.status === "accepted").length,
      needsAction: filteredApplications.filter((a) => a.status === "pending" || a.status === "reviewed").length,
    };
  }, [filteredApplications]);

  const onOpenDetails = (app: MockApplication) => {
    setActiveApp(app);
    setDrawerOpen(true);
  };

  const updateApplication = (id: string, patch: Partial<MockApplication>) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, ...patch } : app)));
    setActiveApp((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  };

  const handleBulkStatus = (status: MockApplication["status"]) => {
    setApplications((prev) =>
      prev.map((app) =>
        selectedApps.includes(app.id)
          ? {
              ...app,
              status,
            }
          : app,
      ),
    );
    setSelectedApps([]);
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved" || status === "accepted") {
      return <AdminStatusBadge text="Approved" kind="success" />;
    }
    if (status === "rejected") {
      return <AdminStatusBadge text="Rejected" kind="danger" />;
    }
    if (status === "contacted" || status === "reviewed") {
      return <AdminStatusBadge text={status === "contacted" ? "Contacted" : "Reviewed"} kind="warning" />;
    }
    return <AdminStatusBadge text="Pending" kind="neutral" />;
  };

  const getStageBadge = (stage: MockPipelineStage) => {
    if (stage === "HIRED") return <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Hired</Badge>;
    if (stage === "INTERVIEW") return <Badge className="bg-secondary/20 text-secondary-foreground hover:bg-secondary/20">Interview</Badge>;
    if (stage === "OFFER") return <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20">Offer</Badge>;
    if (stage === "REJECTED") return <Badge variant="destructive">Rejected</Badge>;
    if (stage === "SCREEN") return <Badge variant="secondary">Screen</Badge>;
    return <Badge variant="outline">Applied</Badge>;
  };

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Applications Control Room"
        description="Design mockup mode: complete admin flow and interactions are visual-first and ready for demo."
        aside={<Badge className="border border-primary/25 bg-primary/10 text-primary hover:bg-primary/10">Mockup Mode</Badge>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Visible Applications</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{summary.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Shortlisted Pipeline</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{summary.shortlisted}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Approved</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{summary.approved}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Needs Action</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{summary.needsAction}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-xl">Application Pipeline</CardTitle>
              <CardDescription>Advanced filters, bulk actions, and profile drawer interactions.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-2 text-xs">
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
              <Button size="sm" className="h-9 gap-2 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                AI Summary Pack
              </Button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name, email, track..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "all" ? "All status" : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stageFilter} onValueChange={(value) => setStageFilter(value as "ALL" | MockPipelineStage)}>
              <SelectTrigger>
                <SelectValue placeholder="Pipeline stage" />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage === "ALL" ? "All stages" : stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Select value={trackFilter} onValueChange={setTrackFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Track" />
                </SelectTrigger>
                <SelectContent>
                  {availableTracks.map((track) => (
                    <SelectItem key={track} value={track}>
                      {track}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setStageFilter("ALL");
                  setTrackFilter("ALL");
                  setGermanFilter("ALL");
                }}
                title="Reset filters"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <Select value={germanFilter} onValueChange={setGermanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="German level" />
              </SelectTrigger>
              <SelectContent>
                {availableGerman.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="md:col-span-2 flex items-center justify-end gap-2">
              {selectedApps.length > 0 ? (
                <>
                  <Badge variant="secondary">{selectedApps.length} selected</Badge>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatus("approved")}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatus("rejected")}>Reject</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedApps([])}>Clear</Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Select rows to activate bulk actions.</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={filteredApplications.length > 0 && selectedApps.length === filteredApplications.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedApps(filteredApplications.map((app) => app.id));
                          return;
                        }
                        setSelectedApps([]);
                      }}
                    />
                  </TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pipeline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      No applications match current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/35">
                      <TableCell>
                        <Checkbox
                          checked={selectedApps.includes(app.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedApps((prev) => [...prev, app.id]);
                              return;
                            }
                            setSelectedApps((prev) => prev.filter((id) => id !== app.id));
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-foreground">{app.name}</p>
                          <p className="text-xs text-muted-foreground">{app.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline">{app.sap_track || "No track"}</Badge>
                            <Badge variant="outline">DE {app.german_level || "N/A"}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{app.experience_years || 0} years experience</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>{getStageBadge(app.pipeline_stage)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => onOpenDetails(app)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                           <Button variant="ghost" size="icon" onClick={() => updateApplication(app.id, { status: "approved" })}>
                             <Check className="h-4 w-4 text-primary" />
                           </Button>
                          <Button variant="ghost" size="icon" onClick={() => updateApplication(app.id, { status: "rejected", pipeline_stage: "REJECTED" })}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full p-0 sm:max-w-2xl">
          {activeApp ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-border/60 bg-muted/20 p-6">
                <SheetHeader>
                  <Badge className="mb-2 w-fit border border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">
                    Candidate Details
                  </Badge>
                  <SheetTitle className="text-2xl font-bold">{activeApp.name}</SheetTitle>
                  <SheetDescription className="mt-2 flex flex-wrap gap-4 text-xs">
                    <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {activeApp.email}</span>
                    <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {activeApp.phone}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(activeApp.created_at).toLocaleDateString()}</span>
                  </SheetDescription>
                </SheetHeader>
              </div>

              <ScrollArea className="flex-1 px-6 py-5">
                <div className="space-y-6 pb-8">
                  <div className="grid grid-cols-3 gap-3">
                    <MetricCard label="Track" value={activeApp.sap_track || "N/A"} />
                    <MetricCard label="German" value={activeApp.german_level || "N/A"} />
                    <MetricCard label="Experience" value={`${activeApp.experience_years || 0}y`} />
                  </div>

                  <Card className="border-border/60">
                    <CardHeader className="pb-2">
                      <AdminPanelHeader title="AI Insights" badge="Mock" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(activeApp.ai_skills || []).map((skill) => (
                          <Badge key={`${activeApp.id}-${skill.skill}`} variant="secondary" className="text-xs">
                            {skill.skill} - {skill.level}
                          </Badge>
                        ))}
                      </div>
                      <p className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm text-muted-foreground">
                        {activeApp.ai_analysis_summary || "No analysis summary yet."}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60">
                    <CardHeader className="pb-2">
                      <AdminPanelHeader title="Admin Evaluation" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => updateApplication(activeApp.id, { admin_rating: star })}>
                            <Star className={`h-4 w-4 ${star <= (activeApp.admin_rating || 0) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="min-h-28 w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={localNotes[activeApp.id] ?? activeApp.admin_notes ?? ""}
                        onChange={(e) => setLocalNotes((prev) => ({ ...prev, [activeApp.id]: e.target.value }))}
                        placeholder="Write private admin notes..."
                      />
                      <Button
                        className="w-full"
                        onClick={() =>
                          updateApplication(activeApp.id, {
                            admin_notes: localNotes[activeApp.id] ?? activeApp.admin_notes,
                          })
                        }
                      >
                        Save Evaluation
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60">
                    <CardHeader className="pb-2">
                      <AdminPanelHeader title="Activity Timeline" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(mockActivityByApplicationId[activeApp.id] || []).map((log) => (
                          <div key={`${activeApp.id}-${log.action}-${log.created_at}`} className="rounded-lg border border-border/50 bg-muted/15 px-3 py-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{log.action.replace(/_/g, " ")}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" /> CV</Button>
                    <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Passport</Button>
                    <Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" /> Schedule Interview</Button>
                  </div>
                </div>
              </ScrollArea>

              <div className="border-t border-border/60 bg-muted/20 p-4">
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      updateApplication(activeApp.id, { status: "approved", pipeline_stage: "OFFER" });
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      updateApplication(activeApp.id, { status: "rejected", pipeline_stage: "REJECTED" });
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
