import { ReactNode, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, CalendarDays, CheckCircle2, Clock3, Filter, MoreHorizontal, Plus, Search, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type ApplicationStage = "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "REJECTED";

type Application = {
  id: string;
  company: string;
  role: string;
  location: string;
  stage: ApplicationStage;
  date: string;
  logo: string;
  salary: string;
  nextStep?: string;
};

const COLUMNS: Array<{ id: ApplicationStage; label: string; color: string }> = [
  { id: "APPLIED", label: "Applied", color: "from-slate-100/80 to-slate-50/20" },
  { id: "SCREENING", label: "Screening", color: "from-primary/20 to-primary/5" },
  { id: "INTERVIEW", label: "Interview", color: "from-secondary/20 to-secondary/5" },
  { id: "OFFER", label: "Offer", color: "from-emerald-100/80 to-emerald-50/20" },
];

const MOCK_APPLICATIONS: Application[] = [
  {
    id: "1",
    company: "TechCorp",
    role: "Senior Frontend Developer",
    location: "Remote",
    stage: "APPLIED",
    date: "2 days ago",
    logo: "TC",
    salary: "$120k - $150k",
    nextStep: "Waiting for recruiter review",
  },
  {
    id: "2",
    company: "InnovateLabs",
    role: "Full Stack Engineer",
    location: "Berlin (Hybrid)",
    stage: "SCREENING",
    date: "1 week ago",
    logo: "IL",
    salary: "EUR 65k - 80k",
    nextStep: "HR screen scheduled for Thursday",
  },
  {
    id: "3",
    company: "DataSystems",
    role: "React Native Developer",
    location: "London",
    stage: "INTERVIEW",
    date: "3 weeks ago",
    logo: "DS",
    salary: "GBP 60k - 75k",
    nextStep: "Technical interview panel pending",
  },
  {
    id: "4",
    company: "ERP Core",
    role: "SAP UI5 Engineer",
    location: "Munich",
    stage: "OFFER",
    date: "4 days ago",
    logo: "EC",
    salary: "EUR 72k - 88k",
    nextStep: "Offer deadline in 48h",
  },
];

export default function TalentApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [search, setSearch] = useState("");

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return applications;
    return applications.filter((application) =>
      [application.company, application.role, application.location, application.stage].join(" ").toLowerCase().includes(query),
    );
  }, [applications, search]);

  const stats = useMemo(() => {
    const interviews = applications.filter((item) => item.stage === "INTERVIEW").length;
    const offers = applications.filter((item) => item.stage === "OFFER").length;
    const rejected = applications.filter((item) => item.stage === "REJECTED").length;
    return {
      total: applications.length,
      interviews,
      offers,
      rejected,
    };
  }, [applications]);

  const handleArchive = (id: string) => {
    setApplications((prev) => prev.filter((item) => item.id !== id));
    if (selectedApp?.id === id) setSelectedApp(null);
    toast.success("Application archived");
  };

  const handleStatusChange = (id: string, next: ApplicationStage) => {
    setApplications((prev) => prev.map((item) => (item.id === id ? { ...item, stage: next } : item)));
    toast.success(`Application moved to ${next}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <Briefcase className="mr-1 h-3.5 w-3.5" /> Career Pipeline
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Application tracker</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Track every role, next step, and interview milestone in one visual board.</p>
          </div>
          <Button className="gap-2" onClick={() => toast.success("Starting new application wizard...")}> 
            <Plus className="h-4 w-4" /> New application
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total" value={`${stats.total}`} icon={<Briefcase className="h-4 w-4 text-primary" />} />
        <Metric label="Interviews" value={`${stats.interviews}`} icon={<CalendarDays className="h-4 w-4 text-primary" />} />
        <Metric label="Offers" value={`${stats.offers}`} icon={<CheckCircle2 className="h-4 w-4 text-primary" />} />
        <Metric label="Closed" value={`${stats.rejected}`} icon={<XCircle className="h-4 w-4 text-primary" />} />
      </section>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Pipeline board</CardTitle>
              <CardDescription>Filter and monitor progress by stage.</CardDescription>
            </div>
            <div className="flex w-full items-center gap-2 md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company, role, location..." className="pl-9" />
              </div>
              <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-[1100px] gap-4">
              {COLUMNS.map((column) => {
                const columnApps = filteredApplications.filter((application) => application.stage === column.id);

                return (
                  <div key={column.id} className="w-[280px] shrink-0">
                    <div className={`mb-3 rounded-xl border border-border/60 bg-gradient-to-br px-3 py-2 ${column.color}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">{column.label}</p>
                        <Badge variant="secondary">{columnApps.length}</Badge>
                      </div>
                    </div>

                    <ScrollArea className="h-[520px] pr-2">
                      <div className="space-y-3">
                        {columnApps.map((application) => (
                          <motion.div key={application.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="group border-border/60 bg-card/80 transition hover:border-primary/40 hover:shadow-lg">
                              <CardHeader className="space-y-2 p-3 pb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <Avatar className="h-8 w-8 rounded-lg border border-border/60">
                                      <AvatarImage src={`https://avatar.vercel.sh/${application.company}.png`} />
                                      <AvatarFallback className="rounded-lg bg-primary/10 text-[11px] font-bold text-primary">{application.logo}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">{application.company}</p>
                                      <p className="text-[11px] text-muted-foreground">{application.location}</p>
                                    </div>
                                  </div>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100">
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setSelectedApp(application)}>View details</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStatusChange(application.id, "INTERVIEW")}>Move to interview</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStatusChange(application.id, "OFFER")}>Move to offer</DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive" onClick={() => handleArchive(application.id)}>Archive</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <p className="line-clamp-1 text-sm font-bold text-foreground">{application.role}</p>
                              </CardHeader>

                              <CardContent className="p-3 pt-1">
                                <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                  <Briefcase className="h-3.5 w-3.5" /> {application.salary}
                                </p>
                                {application.nextStep ? (
                                  <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-2">
                                    <p className="inline-flex items-center gap-1 text-[11px] text-primary/90">
                                      <Clock3 className="h-3.5 w-3.5" /> {application.nextStep}
                                    </p>
                                  </div>
                                ) : null}
                              </CardContent>

                              <CardFooter className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                                <span>Updated {application.date}</span>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => setSelectedApp(application)}>View</Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}

                        {columnApps.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-[11px] uppercase tracking-wide text-muted-foreground">
                            No applications
                          </div>
                        ) : null}
                      </div>
                    </ScrollArea>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={Boolean(selectedApp)} onOpenChange={() => setSelectedApp(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selectedApp ? (
            <div className="space-y-5">
              <SheetHeader>
                <SheetTitle className="text-2xl">{selectedApp.role}</SheetTitle>
                <SheetDescription>{selectedApp.company} - {selectedApp.location}</SheetDescription>
              </SheetHeader>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Current stage</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{selectedApp.stage}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Timeline</h4>
                {COLUMNS.map((column, index) => {
                  const current = COLUMNS.findIndex((item) => item.id === selectedApp.stage);
                  const reached = current >= index;
                  return (
                    <div key={column.id} className="flex items-center gap-2 text-sm">
                      <span className={`h-2.5 w-2.5 rounded-full ${reached ? "bg-primary" : "bg-muted-foreground/40"}`} />
                      <span className={reached ? "text-foreground" : "text-muted-foreground"}>{column.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  <CalendarDays className="h-4 w-4" /> Next step
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedApp.nextStep || "Waiting for employer response"}</p>
              </div>

              <Button variant="destructive" className="w-full" onClick={() => handleArchive(selectedApp.id)}>Withdraw application</Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5">{icon}</div>
      </CardContent>
    </Card>
  );
}
