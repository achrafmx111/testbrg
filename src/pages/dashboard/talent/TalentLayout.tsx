import { BookOpen, LayoutDashboard, Search, FileText, GraduationCap, Bell, Sparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors";

const TalentLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="h-4 w-4" />
            </div>
            <p className="text-base font-black tracking-tight text-slate-800">Bridging Academy</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center rounded-md border bg-slate-50 px-3 sm:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input readOnly value="Search courses" className="h-9 w-52 bg-transparent pl-2 text-sm text-slate-600 outline-none" />
            </div>
            <button className="rounded-md border border-slate-200 p-2 text-slate-500">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[250px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Learning Space</p>
          <nav className="space-y-1">
            <NavLink
              to="/dashboard/talent"
              end
              className={({ isActive }) => `${linkBase} ${isActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink
              to="/dashboard/talent/courses"
              className={({ isActive }) => `${linkBase} ${isActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <BookOpen className="h-4 w-4" /> My Courses
            </NavLink>
            <NavLink
              to="/dashboard/talent/course-details"
              className={({ isActive }) => `${linkBase} ${isActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <FileText className="h-4 w-4" /> Course Details
            </NavLink>
          </nav>
          <div className="mt-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/20 p-3">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs font-bold uppercase">Focus</p>
            </div>
            <p className="text-xs leading-relaxed text-slate-700">Complete one module today and keep your streak active.</p>
          </div>
        </aside>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TalentLayout;
