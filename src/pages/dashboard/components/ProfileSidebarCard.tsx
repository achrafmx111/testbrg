import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProfileSidebarCardProps {
    user: {
        name: string;
        email: string;
        avatarUrl?: string;
        role: string;
    } | null;
}

export const ProfileSidebarCard = ({ user }: ProfileSidebarCardProps) => {
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    if (!user) return null;

    // Get initials
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <Card className="border-none shadow-sm bg-white overflow-hidden sticky top-24">
            <CardContent className="flex flex-col items-center pt-8 pb-6 px-4">
                <Avatar className="h-24 w-24 mb-4 border-4 border-muted/20">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <h3 className="text-lg font-bold text-center text-foreground mb-1">
                    {user.name}
                </h3>
                {/* <p className="text-sm text-muted-foreground mb-6 text-center">
                    {user.email}
                </p> */}

                <div className="w-full space-y-2 mt-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        asChild
                    >
                        <Link to="/dashboard/profile">
                            <User className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        asChild
                    >
                        <Link to="/dashboard/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Link>
                    </Button>
                    <div className="pt-4 mt-2 border-t w-full">
                        <Button
                            variant="default"
                            className="w-full bg-[#fa5252] hover:bg-[#e03131] text-white shadow-sm"
                            onClick={handleSignOut}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
