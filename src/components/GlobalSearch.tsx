import * as React from "react";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Search,
    Briefcase,
    Building2,
    FileText,
    LayoutDashboard,
    Target,
    Plane,
    BookOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Suggestions">
                    <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/talent/jobs"))}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Jobs</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/talent/learning"))}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Learning</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Admin Tools">
                    <CommandItem onSelect={() => runCommand(() => navigate("/admin/talents"))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Manage Talents</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/admin/companies"))}>
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>Manage Companies</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/admin/approvals"))}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Approvals Inbox</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/admin/ai-logs"))}>
                        <Target className="mr-2 h-4 w-4" />
                        <span>AI Session Logs</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Mock Data (Demo)">
                    <CommandItem onSelect={() => runCommand(() => navigate("/profile/usr_123"))}>
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Talent: Omar Benali</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/company/cmp_456"))}>
                        <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Company: TechGiant GmbH</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
