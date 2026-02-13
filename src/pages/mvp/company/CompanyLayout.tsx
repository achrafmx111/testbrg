import { MvpDashboardLayout } from "@/pages/mvp/MvpDashboardLayout";

const navItems = [
  { label: "Home", to: "." },
  { label: "Profile", to: "profile" },
  { label: "Jobs", to: "jobs" },
  { label: "Talent Pool", to: "talent-pool" },
  { label: "Applicants", to: "applicants" },
  { label: "Offers", to: "offers" },
  { label: "Billing", to: "billing" },
  { label: "Messages", to: "messages" },
];

export default function CompanyLayout() {
  return <MvpDashboardLayout title="Company Dashboard" subtitle="Hiring pipeline" navItems={navItems} />;
}
