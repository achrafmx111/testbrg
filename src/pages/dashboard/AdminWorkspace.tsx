import AdminDashboard from "./AdminDashboard";
import { DashboardShell } from "./components/DashboardShell";

const AdminWorkspace = () => {
  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="Applications, interview governance, audit and system operations"
    >
      <AdminDashboard />
    </DashboardShell>
  );
};

export default AdminWorkspace;
