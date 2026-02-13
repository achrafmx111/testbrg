import EmployerDashboard from "./EmployerDashboard";
import { DashboardShell } from "./components/DashboardShell";

const CompanyWorkspace = () => {
  return (
    <DashboardShell
      title="Company Dashboard"
      subtitle="Talent search, shortlist pipeline, and interview requests"
    >
      <EmployerDashboard />
    </DashboardShell>
  );
};

export default CompanyWorkspace;
