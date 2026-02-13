import { NavLink, Outlet } from "react-router-dom";
import { BarChart3 } from "lucide-react";

const navItems = [
  { label: "Overview", to: "." },
  { label: "Talents", to: "talents" },
  { label: "Companies", to: "companies" },
  { label: "Jobs", to: "jobs" },
  { label: "Applications", to: "applications" },
  { label: "Academy", to: "academy" },
  { label: "Readiness", to: "readiness" },
  { label: "Pipeline", to: "pipeline" },
  { label: "Messaging", to: "messaging" },
  { label: "Finance", to: "finance" },
  { label: "Support", to: "support" },
  { label: "Analytics", to: "analytics" },
  { label: "Settings", to: "settings" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gradient-hero text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1680px] grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-border/40 bg-[hsl(var(--navy))] text-white shadow-[0_24px_40px_-24px_hsl(var(--navy-dark)/0.9)]">
          <div className="px-7 py-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/10 p-2.5">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/70">Bridging Academy</p>
                <p className="text-lg font-semibold tracking-[-0.01em]">Admin System</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 px-4 pb-7">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "."}
                className={({ isActive }) =>
                  `block rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-white/15 font-semibold text-white shadow-[inset_0_1px_0_hsl(0_0%_100%_/_0.22)]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="px-5 py-6 md:px-8 md:py-8 xl:px-10 xl:py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
