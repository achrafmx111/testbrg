import { useEffect, useMemo, useState } from "react";
import { mvp, MvpInvoice } from "@/integrations/supabase/mvp";

export default function AdminFinancePage() {
  const [invoices, setInvoices] = useState<MvpInvoice[]>([]);

  useEffect(() => {
    mvp.listInvoices().then(setInvoices).catch(() => undefined);
  }, []);

  const overdue = useMemo(() => {
    const now = new Date();
    return invoices.filter((invoice) => invoice.status !== "PAID" && invoice.due_date && new Date(invoice.due_date) < now).length;
  }, [invoices]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Finance</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Invoices</p>
          <p className="text-2xl font-semibold">{invoices.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Overdue invoices</p>
          <p className="text-2xl font-semibold">{overdue}</p>
        </div>
      </div>
    </div>
  );
}
