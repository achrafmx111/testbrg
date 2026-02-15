import { Outlet } from "react-router-dom";
import { DashboardShell, NavItem } from "../components/DashboardShell";
import {
  LayoutDashboard,
  GraduationCap,
  CheckSquare,
  User,
  Briefcase,
  FileText,
  MessageSquare,
  Users,
  MapPin
} from "lucide-react";

const talentNavItems: NavItem[] = [
  { label: "Home", to: ".", icon: LayoutDashboard },
  { label: "My Learning", to: "learning", icon: GraduationCap },
  { label: "Interactive Map", to: "roadmap", icon: MapPin },
  { label: "Assessments", to: "assessments", icon: CheckSquare },
  { label: "Profile", to: "profile", icon: User },
  { label: "Jobs", to: "jobs", icon: Briefcase },
  { label: "Applications", to: "applications", icon: FileText },
  { label: "AI CV Analyzer", to: "resume-analysis", icon: FileText },
  { label: "AI Career Coach", to: "coach", icon: Users },
  { label: "Coaching (Human)", to: "coaching", icon: Users },
  { label: "Messages", to: "messages", icon: MessageSquare },
  { label: "Alumni", to: "alumni", icon: GraduationCap },
];

const TalentLayout = () => {
  return (
    <DashboardShell navItems={talentNavItems}>
      <Outlet />
    </DashboardShell>
  );
};

export default TalentLayout;
