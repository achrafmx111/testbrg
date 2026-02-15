import { Outlet } from "react-router-dom";
import { DashboardShell, NavItem } from "../components/DashboardShell";
import {
    LayoutDashboard,
    User,
    Briefcase,
    Users,
    FileText,
    CreditCard,
    MessageSquare,
    Gift
} from "lucide-react";

const companyNavItems: NavItem[] = [
    { label: "Home", to: ".", icon: LayoutDashboard },
    { label: "Profile", to: "profile", icon: User },
    { label: "Jobs", to: "jobs", icon: Briefcase },
    { label: "Talent Pool", to: "talent-pool", icon: Users },
    { label: "Applicants", to: "applicants", icon: FileText },
    { label: "Offers", to: "offers", icon: Gift },
    { label: "Billing", to: "billing", icon: CreditCard },
    { label: "Messages", to: "messages", icon: MessageSquare },
];

const CompanyLayout = () => {
    return (
        <DashboardShell navItems={companyNavItems}>
            <Outlet />
        </DashboardShell>
    );
};

export default CompanyLayout;
