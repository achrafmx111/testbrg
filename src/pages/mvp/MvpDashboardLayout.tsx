import { NavLink, Outlet } from "react-router-dom";

interface NavItem {
  label: string;
  to: string;
}

interface MvpDashboardLayoutProps {
  title: string;
  subtitle: string;
  navItems: NavItem[];
}

export function MvpDashboardLayout({ title, subtitle, navItems }: MvpDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border bg-background p-3">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "."}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="rounded-lg border bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
