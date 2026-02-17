import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, Download, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpInvoice } from "@/integrations/supabase/mvp";

export default function CompanyBillingPage() {
  const [invoices, setInvoices] = useState<MvpInvoice[]>([]);
  const [loading, setLoading] = useState(true);

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
    const pending = invoices.filter((invoice) => invoice.status === "PENDING" || invoice.status === "DRAFT").reduce((sum, invoice) => sum + invoice.amount, 0);
    const overdue = invoices.filter((invoice) => invoice.status === "OVERDUE").reduce((sum, invoice) => sum + invoice.amount, 0);
    return { paid, pending, overdue };
  }, [invoices]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/10 p-5 md:p-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Billing & Finance Console</h2>
        <p className="mt-1 text-sm text-muted-foreground">Monitor invoice lifecycle, subscription status, and payment readiness.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Current Plan</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">Standard</p>
            <p className="text-xs text-muted-foreground">Billed monthly</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Paid Total</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{summary.paid.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Historical paid invoices</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{summary.pending.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Payment Method</CardTitle></CardHeader>
          <CardContent>
            <p className="inline-flex items-center gap-2 font-semibold text-foreground"><CreditCard className="h-4 w-4 text-primary" /> •••• 4242</p>
            <Button variant="link" className="h-auto p-0 text-xs">Update method</Button>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Invoice History</CardTitle>
          <CardDescription>View and export all invoices for accounting operations.</CardDescription>
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
                    <TableCell>{invoice.amount} {invoice.currency}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "PAID" ? "default" : invoice.status === "OVERDUE" ? "destructive" : "secondary"}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
