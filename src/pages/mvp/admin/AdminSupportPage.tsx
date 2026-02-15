import { LifeBuoy, Activity } from "lucide-react";
import { AdminSectionHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { AdminSystemHealth } from "@/pages/dashboard/components/AdminSystemHealth";

export default function AdminSupportPage() {
  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader title="Support & System Health" description="Ticket queue, SLA assignment, and platform health monitoring." />

      <div className={adminClassTokens.panel}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8">
            <LifeBuoy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-foreground">
              Support Center
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Ticket queue, SLA assignment, knowledge base and moderation controls will be managed from this section.
            </p>
          </div>
        </div>
      </div>

      {/* Legacy System Health — fully self-contained */}
      <div className="mt-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" /> System Health
        </h2>
        <AdminSystemHealth />
      </div>
    </div>
  );
}
