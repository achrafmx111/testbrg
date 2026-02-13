import { useEffect, useState } from "react";
import { mvp } from "@/integrations/supabase/mvp";

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
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Settings & Governance</h2>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Recent audit logs</p>
        <p className="text-2xl font-semibold">{auditCount}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Staff assignments</p>
          <p className="text-2xl font-semibold">{staffCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Role permissions</p>
          <p className="text-2xl font-semibold">{permissionCount}</p>
        </div>
      </div>
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Role policies, language preferences and integration toggles are managed from this section.
      </div>
    </div>
  );
}
