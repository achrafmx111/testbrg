import { Outlet } from "react-router-dom";
import { DashboardShell, NavSection } from "../components/DashboardShell";
import {
    LayoutDashboard,
    Users,
    Building2,
    BadgeCheck,
    Briefcase,
    BookOpen,
    FileText,
    GraduationCap,
    Plane,
    Target,
    GitBranch,
    MessageSquare,
    DollarSign,
    LifeBuoy,
    TrendingUp,
    Settings,
    Bot,
    Sparkles,
} from "lucide-react";

const adminNavSections: NavSection[] = [
    {
        items: [
            { label: "Dashboard", to: ".", icon: LayoutDashboard },
        ],
    },
    {
        heading: "Apps & Pages",
        items: [
            { label: "SkillCore", to: "skillcore", icon: BookOpen },
            { label: "Discovery+", to: "discovery", icon: Plane },
            { label: "TalentFlow", to: "talentflow", icon: Target },
            { label: "Talents", to: "talents", icon: Users },
            { label: "Companies", to: "companies", icon: Building2 },
            { label: "Matchmaker", to: "matchmaker", icon: Sparkles },
            { label: "Jobs", to: "jobs", icon: Briefcase },
            { label: "Approvals", to: "approvals", icon: BadgeCheck },
            { label: "AI Session Logs", to: "ai-logs", icon: Bot },
            { label: "Applications", to: "applications", icon: FileText },
            { label: "Academy", to: "academy", icon: GraduationCap },
            { label: "Interviews", to: "interviews", icon: Target },
            { label: "Pipeline", to: "pipeline", icon: GitBranch },
        ],
    },
    {
        heading: "Operations",
        items: [
            { label: "Readiness", to: "readiness", icon: Target },
            { label: "Messaging", to: "messaging", icon: MessageSquare },
            { label: "Finance", to: "finance", icon: DollarSign },
            { label: "Analytics", to: "analytics", icon: TrendingUp },
            { label: "System", to: "system", icon: Settings },
        ],
    },
    {
        heading: "System",
        items: [
            { label: "Support", to: "support", icon: LifeBuoy },
            { label: "Settings", to: "settings", icon: Settings },
        ],
    },
];

const AdminLayout = () => {
    return (
        <DashboardShell navSections={adminNavSections}>
            <Outlet />
        </DashboardShell>
    );
};

export default AdminLayout;
