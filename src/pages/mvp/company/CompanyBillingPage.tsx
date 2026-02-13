import { useEffect, useState } from "react";
import { mvp, MvpInvoice } from "@/integrations/supabase/mvp";

export default function CompanyBillingPage() {
  const [invoices, setInvoices] = useState<MvpInvoice[]>([]);

  useEffect(() => {
    mvp.listInvoices().then(setInvoices).catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Invoices & Contracts</h2>
      {invoices.length === 0 ? <div className="rounded-lg border p-4 text-sm text-muted-foreground">No invoices yet.</div> : null}
      {invoices.map((invoice) => (
        <div key={invoice.id} className="rounded-lg border p-3">
          <p className="font-medium">{invoice.amount} {invoice.currency}</p>
          <p className="text-sm text-muted-foreground">Status: {invoice.status}</p>
        </div>
      ))}
    </div>
  );
}
