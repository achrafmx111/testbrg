import { useEffect, useState } from "react";
import { Building2, MapPin, Factory, Plus, Pencil, Trash2, Loader2, Eye } from "lucide-react";
import { mvp, MvpCompany } from "@/integrations/supabase/mvp";
import { useMvpUser } from "@/hooks/useMvpUser";
import { AdminEmptyState, AdminSectionHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<MvpCompany | null>(null);
  const { toast } = useToast();
  // const { startImpersonation } = useMvpUser(); // Not used yet for companies

  const load = async () => {
    setLoading(true);
    try {
      const comps = await mvp.listCompanies();
      setCompanies(comps);
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <div key={company.id} className={adminClassTokens.card}>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex gap-1">
                {/* Impersonation Simulation Button */}
                {/* 
                <Button variant="ghost" size="icon" title="Login As (Coming Soon)">
                   <Eye className="h-4 w-4" />
                </Button>
                */}
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
        {companies.length === 0 && (
          <AdminEmptyState
            icon={Building2}
            title="No companies yet"
            description="Add your first partner company to get started."
          />
        )}
      </div>

      <CompanyModal
        open={modalOpen}
        company={editingCompany}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
