import { useEffect, useState } from "react";
import { Building2, MapPin, Factory, Plus, Pencil, Trash2, Loader2, CheckCircle, XCircle } from "lucide-react";
import { mvp, MvpCompany, MvpRegistrationRequest } from "@/integrations/supabase/mvp";
import { AdminEmptyState, AdminSectionHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

function CompanyModal({
  open,
  company,
  onClose,
  onSaved,
}: {
  open: boolean;
  company: MvpCompany | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (company) {
      setName(company.name);
      setIndustry(company.industry ?? "");
      setCountry(company.country ?? "");
    } else {
      setName("");
      setIndustry("");
      setCountry("");
    }
  }, [company, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (company) {
        await mvp.updateCompany(company.id, { name, industry: industry || null, country: country || null });
        toast({ title: "Company updated" });
      } else {
        await mvp.createCompany({ name, industry: industry || undefined, country: country || undefined });
        toast({ title: "Company created" });
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
        className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-xl space-y-4"
      >
        <h2 className="text-lg font-semibold text-foreground">
          {company ? "Edit Company" : "Add Company"}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Company Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="SAP Deutschland AG" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Industry</label>
            <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Technology / ERP" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Country</label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Germany" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">Cancel</Button>
          <Button type="submit" disabled={saving} className="gap-1.5 rounded-lg">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {company ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<MvpCompany[]>([]);
  const [requests, setRequests] = useState<MvpRegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<MvpCompany | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [comps, reqs] = await Promise.all([
        mvp.listCompanies(),
        mvp.listRegistrationRequests()
      ]);
      setCompanies(comps);
      setRequests(reqs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      await mvp.deleteCompany(id);
      toast({ title: "Company deleted" });
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err?.message });
    }
  };

  const handleApprove = async (req: MvpRegistrationRequest) => {
    if (!confirm(`Approve registration for ${req.company_name}? This will invite ${req.email}.`)) return;
    setApprovingId(req.id);
    try {
      const { error } = await supabase.functions.invoke("admin-approve-company", {
        body: { request_id: req.id }
      });
      if (error) throw error;
      toast({ title: "Approved", description: "Company account created and invitation sent." });
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Approval Failed", description: err.message });
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Companies"
        description="Manage partner organizations"
        aside={
          <Button onClick={() => { setEditingCompany(null); setModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Company
          </Button>
        }
      />

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Companies ({companies.length})</TabsTrigger>
          <TabsTrigger value="requests">
            Registration Requests
            {requests.filter(r => r.status === 'PENDING').length > 0 &&
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{requests.filter(r => r.status === 'PENDING').length}</Badge>
            }
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {companies.length === 0 ? (
            <AdminEmptyState
              icon={Building2}
              title="No companies yet"
              description="Add your first partner company to get started."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <div key={company.id} className={adminClassTokens.card}>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => { setEditingCompany(company); setModalOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-foreground">{company.name}</h3>
                    <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4 opacity-70" />
                        <span>{company.industry || "No industry"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 opacity-70" />
                        <span>{company.country || "Global"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {requests.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No registration requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{req.company_name}</CardTitle>
                      <Badge variant={req.status === 'APPROVED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                        {req.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Contact</p>
                        <p>{req.contact_name}</p>
                        <p className="text-muted-foreground">{req.email}</p>
                        <p className="text-muted-foreground">{req.phone || "No phone"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Company Details</p>
                        <p>{req.industry || "-"}</p>
                        <p>{req.country || "-"}</p>
                        <p className="text-muted-foreground">{req.website || "No website"}</p>
                      </div>
                    </div>
                    {req.status === 'PENDING' && (
                      <div className="mt-4 flex gap-2 justify-end">
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(req)}
                          disabled={!!approvingId}
                        >
                          {approvingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                          Approve & Create Account
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CompanyModal
        open={modalOpen}
        company={editingCompany}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
