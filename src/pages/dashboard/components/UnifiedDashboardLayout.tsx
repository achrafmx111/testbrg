import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSidebarCard } from "./ProfileSidebarCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const UnifiedDashboardLayout = () => {
    const [user, setUser] = useState<{ name: string; email: string; role: string; avatarUrl?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate("/login");
                    return;
                }

                // Fetch comprehensive profile data
                // Try fetching from profiles or talent_profiles depending on what exists
                // For MVP, we'll try profiles first
                const { data: profile, error } = await (supabase as any)
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (error) {
                    console.error("Error fetching profile:", error);
                    // Fallback or handling
                }

                if (profile) {
                    let name = profile.full_name || user.email?.split("@")[0] || "User";
                    // If no full name in profile, try to get it from metadata
                    if (!profile.full_name && user.user_metadata?.full_name) {
                        name = user.user_metadata.full_name;
                    }

                    setUser({
                        name,
                        email: user.email || "",
                        role: profile.role,
                        avatarUrl: user.user_metadata?.avatar_url
                    });
                }
            } catch (error) {
                console.error("Error in profile fetch:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F9]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Define tabs based on role
    const getTabs = () => {
        const tabs = [

        ];

        if (user?.role === 'TALENT') {
            tabs.push(
                { label: "My Courses", to: "/dashboard/talent/learning" },
                { label: "Applications", to: "/dashboard/talent/applications" },
                { label: "Settings", to: "/dashboard/talent/profile" }, // Mapping Settings to Profile for now or we can create settings page
                { label: "Talent Search", to: "/dashboard/company/talent-pool" }, // Just for demo, usually for companies
            );
        } else if (user?.role === 'COMPANY') {
            tabs.push(
                { label: "Talent Search", to: "/dashboard/company/talent-pool" },
                { label: "Applications", to: "/dashboard/company/applications" },
                { label: "Settings", to: "/dashboard/company/settings" },
            );
        } else if (user?.role === 'ADMIN') {
            // Admin sees everything for now
            tabs.push(
                { label: "My Courses", to: "/dashboard/talent/learning" },
                { label: "Applications", to: "/dashboard/talent/applications" },
                { label: "Settings", to: "/dashboard/admin/settings" },
                { label: "Admin Panel", to: "/dashboard/admin" },
                { label: "Talent Search", to: "/dashboard/company/talent-pool" },
            );
        }

        return tabs;
    };

    // Hardcoded tabs to match the "Legacy" design exactly for now, then we refine based on roles
    const tabs = [
        { label: "My Courses", to: "/dashboard/talent/learning" }, // Defaulting to talent routes for demo
        { label: "Applications", to: "/dashboard/talent/applications" },
        { label: "Settings", to: "/dashboard/talent/profile" },
        { label: "Admin Panel", to: "/dashboard/admin" }, // Show for demo; usually protected
        { label: "Talent Search", to: "/dashboard/company/talent-pool" },
    ];


    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans">
            {/* Global Header - Simplified for Dashboard */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2">
                            {/* Logo Placeholder */}
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                B
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900">Bridging<span className="text-primary">.Academy</span></span>
                        </Link>

                        {/* Desktop Nav - Hidden on mobile, typically */}
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                            <Link to="/talents" className="hover:text-primary transition-colors">For Talents</Link>
                            <Link to="/companies" className="hover:text-primary transition-colors">For Companies</Link>
                            <Link to="/programs" className="hover:text-primary transition-colors">Programs</Link>
                            <Link to="/about" className="hover:text-primary transition-colors">About us</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button asChild size="sm" className="hidden sm:inline-flex rounded-full px-6 font-semibold shadow-none">
                            <Link to="/dashboard">Dashboard &rarr;</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar Profile */}
                    <div className="lg:col-span-1">
                        <ProfileSidebarCard user={user} />
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Welcome Header */}
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                Welcome, {user?.name?.split(" ")[0]}!
                            </h1>
                            <p className="text-muted-foreground mt-1">Here is your personal dashboard.</p>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
                            {tabs.map((tab) => (
                                <NavLink
                                    key={tab.to}
                                    to={tab.to}
                                    end={tab.to !== "/dashboard/admin"} // Admin has sub-routes
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-t-lg text-sm font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${isActive
                                            ? "border-primary text-primary bg-primary/5"
                                            : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                        }`
                                    }
                                >
                                    {tab.label}
                                </NavLink>
                            ))}
                        </div>

                        {/* Content Outlet */}
                        <div className="min-h-[500px] fade-in-5 animate-in">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
