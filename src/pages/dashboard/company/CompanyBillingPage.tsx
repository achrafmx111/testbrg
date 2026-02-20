import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, Download, FileText, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpInvoice } from "@/integrations/supabase/mvp";
import { toast } from "sonner";

export default function CompanyBillingPage() {
  const [invoices, setInvoices] = useState<MvpInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodOpen, setMethodOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const profile = await mvp.getMyProfile(user.id);
      if (!profile?.company_id) return;
      setInvoices(await mvp.listInvoices(profile.company_id));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const paid = invoices.filter((invoice) => invoice.status === "PAID").reduce((sum, invoice) => sum + invoice.amount, 0);
    const pending = invoices.filter((invoice) => invoice.status === "PENDING" || invoice.status === "DRAFT" || invoice.status === "ISSUED").reduce((sum, invoice) => sum + invoice.amount, 0);
    const overdue = invoices.filter((invoice) => invoice.status === "OVERDUE").reduce((sum, invoice) => sum + invoice.amount, 0);
    return { paid, pending, overdue };
  }, [invoices]);

  const handleUpdatePaymentMethod = async (event: FormEvent) => {
    event.preventDefault();
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setMethodOpen(false);
      toast.success("Payment method updated");
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Finance Desk
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Billing & finance console</h2>
            <p className="mt-1 text-sm text-muted-foreground">Monitor invoice lifecycle, account risk, and payment method readiness.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setMethodOpen(true)}>
            <CreditCard className="h-4 w-4" /> Update payment method
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinanceCard label="Current plan" value="Standard" helper="Billed monthly" />
        <FinanceCard label="Paid total" value={`€${summary.paid.toFixed(2)}`} helper="Historical paid invoices" />
        <FinanceCard label="Pending" value={`€${summary.pending.toFixed(2)}`} helper="Awaiting payment" />
        <FinanceCard label="Overdue" value={`€${summary.overdue.toFixed(2)}`} helper="Needs follow-up" />
      </section>

      <Card className="border-border/60 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> Payment compliance checks are healthy and webhook sync is stable.
          </p>
          <Badge variant="outline">Mockup mode</Badge>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Invoice history</CardTitle>
          <CardDescription>Download and track invoices for accounting operations.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/10 p-10 text-center text-sm text-muted-foreground">
              <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
              No invoices found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-xs">{invoice.id.slice(0, 8)}</TableCell>
                    <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>€{invoice.amount} {invoice.currency}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "PAID" ? "default" : invoice.status === "OVERDUE" ? "destructive" : "secondary"}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => toast.info(`Downloading invoice ${invoice.id.slice(0, 8)}.pdf`)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={methodOpen} onOpenChange={setMethodOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update payment method</DialogTitle>
            <DialogDescription>Replace your company card for upcoming invoice cycles.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePaymentMethod}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="holder">Cardholder name</Label>
                <Input id="holder" placeholder="John Doe" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="number">Card number</Label>
                <Input id="number" placeholder="0000 0000 0000 0000" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input id="expiry" placeholder="MM/YY" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMethodOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updating}>{updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Update card</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FinanceCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
