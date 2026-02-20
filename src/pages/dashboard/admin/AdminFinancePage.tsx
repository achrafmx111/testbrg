import { FormEvent, useEffect, useMemo, useState } from "react";
import { DollarSign, Download, FileText, Loader2, Plus, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { mvp, MvpCompany, MvpInvoice } from "@/integrations/supabase/mvp";
import { AdminSectionHeader, AdminStatCard } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function AdminFinancePage() {
  const [invoices, setInvoices] = useState<MvpInvoice[]>([]);
  const [companies, setCompanies] = useState<MvpCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [invoiceRows, companyRows] = await Promise.all([mvp.listInvoices(), mvp.listCompanies()]);
      const mappedInvoices = invoiceRows.map((inv: any) => ({
        ...inv,
        companyName: inv.companies?.name || "Unknown Company"
      }));
      setInvoices(mappedInvoices);
      setCompanies(companyRows);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const finance = useMemo(() => {
    const paid = invoices.filter((invoice) => invoice.status === "PAID").reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    const issued = invoices.filter((invoice) => invoice.status === "ISSUED").reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    const overdue = invoices.filter((invoice) => invoice.status === "OVERDUE").reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    const draft = invoices.filter((invoice) => invoice.status === "DRAFT").length;
    return { paid, issued, overdue, draft };
  }, [invoices]);

  const handleCreateInvoice = async (event: FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const raw = {
      company_id: formData.get("company_id") as string,
      amount: Number(formData.get("amount")),
      currency: formData.get("currency") as string,
      due_date: (formData.get("due_date") as string) || null,
      status: "DRAFT",
    };

    const { invoiceSchema } = await import("@/lib/zodSchemas");
    const parsed = invoiceSchema.safeParse(raw);
    if (!parsed.success) {
      toast({ variant: "destructive", title: "Validation error", description: parsed.error.errors[0].message });
      return;
    }

    setCreating(true);
    try {
      await mvp.createInvoice({ ...parsed.data, status: "DRAFT" });
      toast({ title: "Invoice created" });
      setModalOpen(false);
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Create failed", description: error?.message || "Try again." });
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await mvp.updateInvoice(id, { status });
      toast({ title: "Status updated" });
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update failed", description: error?.message || "Try again." });
    }
  };

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Finance"
        description="Control invoicing lifecycle, payment visibility, and account health from one finance workspace."
        aside={
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create invoice
          </Button>
        }
      />

      <div className="rounded-2xl border border-border/40 bg-gradient-to-r from-primary/10 via-card to-secondary/15 p-4">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Revenue Pulse
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Paid Revenue" value={`$${finance.paid.toLocaleString()}`} tone="primary" icon={<DollarSign className="h-4 w-4 text-primary" />} />
          <AdminStatCard label="Issued" value={`$${finance.issued.toLocaleString()}`} tone="secondary" icon={<FileText className="h-4 w-4 text-secondary-foreground" />} />
          <AdminStatCard label="Overdue" value={`$${finance.overdue.toLocaleString()}`} tone="critical" icon={<DollarSign className="h-4 w-4 text-rose-600" />} />
          <AdminStatCard label="Draft invoices" value={`${finance.draft}`} tone="accent" icon={<FileText className="h-4 w-4 text-accent-foreground" />} />
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/80 p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No invoices found.</TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-xs">{invoice.id.slice(0, 8)}</TableCell>
                  <TableCell>{invoice.companies?.name || "Unknown"}</TableCell>
                  <TableCell>{invoice.amount} {invoice.currency}</TableCell>
                  <TableCell>{invoice.due_date ? format(new Date(invoice.due_date), "MMM d, yyyy") : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === "PAID" ? "default" : invoice.status === "OVERDUE" ? "destructive" : "secondary"}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      {invoice.status === "DRAFT" ? <Button size="sm" variant="outline" onClick={() => updateStatus(invoice.id, "ISSUED")}>Send</Button> : null}
                      {invoice.status === "ISSUED" ? <Button size="sm" variant="outline" onClick={() => updateStatus(invoice.id, "PAID")}>Mark paid</Button> : null}
                      <Button size="icon" variant="ghost" onClick={() => toast({ title: "Download started", description: `Invoice ${invoice.id.slice(0, 8)}.pdf` })}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create invoice</DialogTitle>
            <DialogDescription>Generate a new draft invoice for a company account.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <Select name="company_id" required>
              <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
              <SelectContent>
                {companies.map((company) => <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-3">
              <Input name="amount" type="number" placeholder="Amount" required />
              <Select name="currency" defaultValue="USD">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input name="due_date" type="date" required />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
