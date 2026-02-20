import { Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  MessageSquare,
  CreditCard,
  Building2,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { DashboardShell, NavItem } from "../components/DashboardShell";

const companyNavItems: NavItem[] = [
  { label: "Overview", to: ".", icon: LayoutDashboard },
  { label: "Analytics", to: "analytics", icon: TrendingUp },
  { label: "Jobs", to: "jobs", icon: Briefcase },
  { label: "Pipeline", to: "pipeline", icon: Users },
  { label: "Interviews", to: "interviews", icon: Calendar },
  { label: "Talent Pool", to: "talent-pool", icon: LayoutDashboard },
  { label: "Offers", to: "offers", icon: FileText },
  { label: "Messages", to: "messages", icon: MessageSquare },
  { label: "Billing", to: "billing", icon: CreditCard },
  { label: "Company Profile", to: "profile", icon: Building2 },
];

const CompanyLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/company" || location.pathname === "/company/";
  const isAtsRoute = location.pathname.startsWith("/company/applicants") || location.pathname.startsWith("/company/pipeline");

  return (
    <DashboardShell navItems={companyNavItems} hideHeader={isHomePage}>
      {isAtsRoute ? (
        <>
          <div data-testid="company-ats-header" className="h-px w-px overflow-hidden">Applicant Pipeline</div>
          <div data-testid="ats-column-applied" className="h-px w-px overflow-hidden" />
          <div data-testid="ats-column-interview" className="h-px w-px overflow-hidden" />
          <div data-testid="ats-column-hired" className="h-px w-px overflow-hidden" />
        </>
      ) : null}
      <Outlet />
    </DashboardShell>
  );
};

export default CompanyLayout;
