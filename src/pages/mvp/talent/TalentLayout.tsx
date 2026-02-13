import { MvpDashboardLayout } from "@/pages/mvp/MvpDashboardLayout";

const navItems = [
  { label: "Home", to: "." },
  { label: "My Learning", to: "learning" },
  { label: "Assessments", to: "assessments" },
  { label: "Profile", to: "profile" },
  { label: "Jobs", to: "jobs" },
  { label: "Applications", to: "applications" },
  { label: "Coaching", to: "coaching" },
  { label: "Messages", to: "messages" },
  { label: "Alumni", to: "alumni" },
];

export default function TalentLayout() {
  return <MvpDashboardLayout title="Talent Dashboard" subtitle="Learning and placement" navItems={navItems} />;
}
