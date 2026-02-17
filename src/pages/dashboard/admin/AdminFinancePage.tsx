import { useEffect, useState } from "react";
import { DollarSign, FileText, Plus, Filter, Loader2, Download, MoreHorizontal } from "lucide-react";
import { mvp, MvpInvoice, MvpCompany } from "@/integrations/supabase/mvp";
import { AdminSectionHeader, AdminStatCard } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
      const [inv, comps] = await Promise.all([
        mvp.listInvoices(),
        mvp.listCompanies()
      ]);
      setInvoices(inv);
      setCompanies(comps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const rawData = {
      company_id: formData.get("company_id") as string,
      amount: Number(formData.get("amount")),
      currency: formData.get("currency") as string,
      due_date: formData.get("due_date") as string || null, // Allow null if optional in schema
      status: "DRAFT"
    };

    const { invoiceSchema } = await import("@/lib/zodSchemas");
    const result = invoiceSchema.safeParse(rawData);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: result.error.errors[0].message
      });
      return;
    }

    setCreating(true);
    try {
      await mvp.createInvoice({
        ...result.data,
        status: "DRAFT"
      });
      toast({ title: "Invoice created" });
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await mvp.updateInvoice(id, { status });
      toast({ title: "Status updated" });
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + Number(i.amount), 0);
  const pendingAmount = invoices.filter(i => i.status === 'ISSUED').reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Finance"
        description="Manage invoices, payments, and revenue."
        aside={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Invoice
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <AdminStatCard label="Total Revenue (Paid)" value={`$${totalRevenue.toLocaleString()}`} tone="primary" icon={<DollarSign className="h-4 w-4" />} />
        <AdminStatCard label="Pending Payment" value={`$${pendingAmount.toLocaleString()}`} tone="secondary" icon={<FileText className="h-4 w-4" />} />
      </div>

      <div className="rounded-lg border bg-card">
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
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell></TableRow>
            ) : invoices.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell></TableRow>
            ) : (
              invoices.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.id.slice(0, 8)}</TableCell>
                  <TableCell>{inv.companies?.name || "Unknown"}</TableCell>
                  <TableCell>{inv.amount} {inv.currency}</TableCell>
                  <TableCell>{inv.due_date ? format(new Date(inv.due_date), "MMM d, yyyy") : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === 'PAID' ? 'default' : inv.status === 'OVERDUE' ? 'destructive' : 'secondary'}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {inv.status === 'DRAFT' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(inv.id, "ISSUED")}>Send</Button>
                      )}
                      {inv.status === 'ISSUED' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(inv.id, "PAID")}>Mark Paid</Button>
                      )}
                      <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Company</label>
              <Select name="company_id" required>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Amount</label>
                <Input name="amount" type="number" required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Currency</label>
                <Select name="currency" defaultValue="USD">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Due Date</label>
              <Input name="due_date" type="date" required />
            </div>
            <Button type="submit" className="w-full" disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create Invoice
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
