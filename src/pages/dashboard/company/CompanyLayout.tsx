import { Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Briefcase, MessageSquare, CreditCard, Building2, TrendingUp } from "lucide-react";
import { DashboardShell, NavItem } from "../components/DashboardShell";

const companyNavItems: NavItem[] = [
  { label: "Overview", to: ".", icon: LayoutDashboard },
  { label: "Analytics", to: "analytics", icon: TrendingUp },
  { label: "Jobs", to: "jobs", icon: Briefcase },
  { label: "Pipeline", to: "pipeline", icon: LayoutDashboard },
  { label: "Talent Pool", to: "talent-pool", icon: Users },
  { label: "Applicants", to: "applicants", icon: FileText },
  { label: "Offers", to: "offers", icon: FileText },
  { label: "Messages", to: "messages", icon: MessageSquare },
  { label: "Billing", to: "billing", icon: CreditCard },
  { label: "Company Profile", to: "profile", icon: Building2 },
];

const CompanyLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/company" || location.pathname === "/company/";

  return (
    <DashboardShell navItems={companyNavItems} hideHeader={isHomePage}>
      <Outlet />
    </DashboardShell>
  );
};

export default CompanyLayout;
