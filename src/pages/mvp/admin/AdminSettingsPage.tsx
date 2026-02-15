import { useEffect, useState } from "react";
import { Shield, Users2, KeyRound, ScrollText, TrendingUp } from "lucide-react";
import { mvp } from "@/integrations/supabase/mvp";
import { AdminSectionHeader, AdminStatCard } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogViewer } from "@/pages/dashboard/components/AuditLogViewer";
import { AdminReferralAnalytics } from "@/pages/dashboard/components/AdminReferralAnalytics";

export default function AdminSettingsPage() {
  const [auditCount, setAuditCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [permissionCount, setPermissionCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [logs, staff, permissions] = await Promise.all([
        mvp.listAuditLogs(),
        mvp.listStaffAssignments(),
        mvp.listRolePermissions(),
      ]);
      setAuditCount(logs.length);
      setStaffCount(staff.length);
      setPermissionCount(permissions.length);
    };

    load().catch(() => undefined);
  }, []);

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader title="Settings & Governance" description="Role policies, audit logs, and system configuration." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard
          label="Audit Logs"
          value={auditCount}
          tone="primary"
          icon={<ScrollText className="h-4 w-4 text-primary" />}
        />
        <AdminStatCard
          label="Staff Assignments"
          value={staffCount}
          tone="secondary"
          icon={<Users2 className="h-4 w-4 text-secondary-foreground" />}
        />
        <AdminStatCard
          label="Role Permissions"
          value={permissionCount}
          tone="accent"
          icon={<KeyRound className="h-4 w-4 text-accent-foreground" />}
        />
      </div>

      {/* Governance Tabs: Audit Logs + Referral Analytics */}
      <Tabs defaultValue="compliance" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance">
            <Shield className="h-3.5 w-3.5 mr-1.5" /> Compliance
          </TabsTrigger>
          <TabsTrigger value="growth">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Growth
          </TabsTrigger>
          <TabsTrigger value="governance">
            <KeyRound className="h-3.5 w-3.5 mr-1.5" /> Governance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="mt-4 space-y-4">
          <AuditLogViewer />
        </TabsContent>

        <TabsContent value="growth" className="mt-4 space-y-4">
          <AdminReferralAnalytics />
        </TabsContent>

        <TabsContent value="governance" className="mt-4">
          <div className={adminClassTokens.panel}>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-foreground">
                  Governance Center
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Role policies, language preferences and integration toggles are managed from this section.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
