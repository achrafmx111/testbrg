import { ReactNode } from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const DashboardShell = ({ title, subtitle, children }: DashboardShellProps) => {
  return (
    <div className="min-h-screen bg-[#f3f3f9]">
      <header className="sticky top-0 z-30 border-b border-slate-700 bg-slate-800">
        <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <p className="text-lg font-black tracking-tight text-white">bridging</p>
            <div className="hidden items-center rounded-md bg-slate-700/80 px-3 sm:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                readOnly
                value="Search..."
                className="h-9 w-48 bg-transparent pl-2 text-sm text-slate-200 outline-none"
              />
            </div>
          </div>
          <Button size="icon" variant="ghost" className="text-slate-200 hover:bg-slate-700">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <Link to="/dashboard/admin" className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Admin</Link>
          <Link to="/dashboard/company" className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Company</Link>
          <Link to="/dashboard/talent" className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Talent Learner</Link>
          <Link to="/dashboard/talent-external" className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Talent External</Link>
        </div>
        <div className="mb-4">
          <h1 className="text-xl font-black tracking-tight text-slate-800 md:text-2xl">{title}</h1>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
};
