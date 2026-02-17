import { useMemo, useState, useEffect } from "react";
import { BadgeCheck, Building2, CalendarClock, Check, FileText, Landmark, Search, ShieldAlert, X, Loader2 } from "lucide-react";
import { AdminSectionHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { mvp, MvpRegistrationRequest } from "@/integrations/supabase/mvp";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

type ApprovalType = "company" | "job" | "interview" | "refund";
type ApprovalState = "pending" | "approved" | "rejected";

type ApprovalItem = {
  id: string;
  type: ApprovalType;
  title: string;
  owner: string;
  createdAt: string;
  risk: "low" | "medium" | "high";
  state: ApprovalState;
  raw?: any; // Keep raw data for actions
};

const seed: ApprovalItem[] = [
  { id: "APR-1101", type: "job", title: "SAP BTP Architect role publishing", owner: "Hiring Ops", createdAt: "25m ago", risk: "low", state: "pending" },
  { id: "APR-1099", type: "interview", title: "Priority interview waiver request", owner: "Program Team", createdAt: "42m ago", risk: "high", state: "pending" },
  { id: "APR-1097", type: "refund", title: "Partial training refund request", owner: "Finance", createdAt: "1h ago", risk: "medium", state: "pending" },
  { id: "APR-1094", type: "company", title: "Data policy exception form", owner: "Legal", createdAt: "2h ago", risk: "high", state: "pending" },
];

export default function AdminApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>(seed);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      // 1. Fetch Company Requests
      const requests = await mvp.listRegistrationRequests();

      // 2. Map to Approval Items
      const companyItems: ApprovalItem[] = requests.map(req => ({
        id: req.id,
        type: "company",
        title: `Registration: ${req.company_name}`,
        owner: req.contact_name || req.email,
        createdAt: req.created_at ? formatDistanceToNow(new Date(req.created_at), { addSuffix: true }) : "recently",
        risk: "medium", // Default risk logic could be enhanced later
        state: req.status.toLowerCase() as ApprovalState,
        raw: req
      }));

      // 3. Merge with seed (non-company items)
      // Filter out seed company items to favor real ones, or keep them if intended? 
      // User had "NovaTech" as seed, let's keep non-company seeds.
      const mixedItems = [...companyItems, ...seed];
      setItems(mixedItems);
    } catch (error) {
      console.error("Failed to load approvals", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (item: ApprovalItem, action: "approve" | "reject") => {
    if (processingId) return;

    if (item.type === "company" && item.raw) {
      const req = item.raw as MvpRegistrationRequest;
      if (!confirm(`${action === "approve" ? "Approve" : "Reject"} registration for ${req.company_name}?`)) return;

      setProcessingId(item.id);
      try {
        if (action === "approve") {
          const { error } = await supabase.functions.invoke("admin-approve-company", {
            body: { request_id: req.id }
          });
          if (error) throw error;
          toast({ title: "Approved", description: "Company account created." });
        } else {
          // Reject logic (MVP usually just update status)
          await supabase.from("mvp_company_registration_requests")
            .update({ status: "REJECTED" })
            .eq("id", req.id);
          toast({ title: "Rejected", description: "Request marked as rejected." });
        }
        await load(); // Reload to get fresh state
      } catch (err: any) {
        toast({ variant: "destructive", title: "Action Failed", description: err.message });
      } finally {
        setProcessingId(null);
      }
    } else {
      // Simulation for seed items
      toast({ title: "Simulation", description: `${action} action recorded for ${item.id}` });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, state: action === "approve" ? "approved" : "rejected" } : i));
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!q) return true;
      return item.id.toLowerCase().includes(q) || item.title.toLowerCase().includes(q) || item.owner.toLowerCase().includes(q);
    });
  }, [items, query]);

  const summary = useMemo(() => {
    return {
      pending: items.filter((item) => item.state === "pending").length,
      approved: items.filter((item) => item.state === "approved").length,
      rejected: items.filter((item) => item.state === "rejected").length,
      highRisk: items.filter((item) => item.risk === "high" && item.state === "pending").length,
    };
  }, [items]);

  const sections: Array<{ key: "all" | ApprovalType; label: string; icon: JSX.Element }> = [
    { key: "all", label: "All", icon: <BadgeCheck className="h-3.5 w-3.5" /> },
    { key: "company", label: "Company", icon: <Building2 className="h-3.5 w-3.5" /> },
    { key: "job", label: "Jobs", icon: <FileText className="h-3.5 w-3.5" /> },
    { key: "interview", label: "Interviews", icon: <CalendarClock className="h-3.5 w-3.5" /> },
    { key: "refund", label: "Finance", icon: <Landmark className="h-3.5 w-3.5" /> },
  ];

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Unified Approval Inbox"
        description="One queue for company verification, jobs, interview exceptions, and financial requests."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pending" value={summary.pending} />
        <MetricCard label="Approved" value={summary.approved} />
        <MetricCard label="Rejected" value={summary.rejected} />
        <MetricCard label="High Risk" value={summary.highRisk} tone="danger" />
      </section>

      <Card className="border-border/60">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Approval Queue</CardTitle>
            <CardDescription>Review requests quickly with contextual risk signals.</CardDescription>
          </div>
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search id, request title, owner..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4 w-full justify-start overflow-x-auto">
              {sections.map((section) => (
                <TabsTrigger key={section.key} value={section.key} className="gap-1.5">
                  {section.icon}
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {sections.map((section) => {
              const rows = filtered.filter((item) => section.key === "all" || item.type === section.key);
              return (
                <TabsContent key={section.key} value={section.key} className="space-y-3">
                  {rows.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                      No requests for this segment.
                    </div>
                  ) : (
                    rows.map((item) => (
                      <div key={item.id} data-testid={`approval-row-${item.id}`} className="rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-muted/5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{item.title}</p>
                              {item.state === "pending" ? (
                                <Badge variant="secondary">Pending</Badge>
                              ) : item.state === "approved" ? (
                                <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Approved</Badge>
                              ) : (
                                <Badge variant="destructive">Rejected</Badge>
                              )}
                              <RiskPill risk={item.risk} />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground flex gap-2">
                              <span className="font-mono text-xs">{item.id}</span>
                              <span>•</span>
                              <span>{item.owner}</span>
                              <span>•</span>
                              <span>{item.createdAt}</span>
                            </p>
                          </div>

                          {item.state === "pending" && (
                            <div className="flex flex-wrap items-center gap-2">
                              {processingId === item.id ? (
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              ) : (
                                <>
                                  <Button data-testid={`approval-approve-${item.id}`} size="sm" variant="outline" className="h-8 gap-1 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" onClick={() => handleAction(item, "approve")}>
                                    <Check className="h-3.5 w-3.5" /> Approve
                                  </Button>
                                  <Button data-testid={`approval-reject-${item.id}`} size="sm" variant="outline" className="h-8 gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={() => handleAction(item, "reject")}>
                                    <X className="h-3.5 w-3.5" /> Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "danger" }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${tone === "danger" ? "text-destructive" : "text-foreground"}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function RiskPill({ risk }: { risk: ApprovalItem["risk"] }) {
  if (risk === "high") {
    return (
      <Badge variant="destructive" className="gap-1">
        <ShieldAlert className="h-3.5 w-3.5" /> High risk
      </Badge>
    );
  }
  if (risk === "medium") {
    return <Badge variant="secondary">Medium risk</Badge>;
  }
  return <Badge variant="outline">Low risk</Badge>;
}
