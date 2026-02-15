import { useCallback, useEffect, useState, useMemo } from "react";
import {
    FileText, CheckCircle, XCircle, Clock, MoreVertical,
    Search, Filter, Download, Cpu, User, Users,
    Star, Save, TrendingUp, Eye, Check, X,
    Mail, Calendar as CalendarIcon, Activity,
    FileJson, Shield, History, Info, Loader2,
    ChevronDown, ChevronUp, ChevronsUpDown
} from "lucide-react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
} from "@tanstack/react-table";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types";
import { AdminSectionHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";

/* ══════════════════════════════════════════════
   Admin Applications — Enhanced with TanStack Table
   ══════════════════════════════════════════════ */

export default function AdminApplicationsPage() {
    const { toast } = useToast();

    /* ── state ── */
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState<Application[]>([]);

    // Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeApp, setActiveApp] = useState<Application | null>(null);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);

    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
    const [updatingNotes, setUpdatingNotes] = useState<string | null>(null);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);

    /* ── fetch ── */
    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("applications")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            setApplications(data || []);
        } catch (error) {
            console.error("Error fetching applications:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to load applications." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchApplications(); }, [fetchApplications]);

    /* ── actions ── */
    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", id);
            if (error) throw error;
            toast({ title: "Status Updated", description: `Application changed to ${newStatus}.` });
            setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus as any } : a)));
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Unknown error" });
        }
    };

    const handleBulkStatusUpdate = async (newStatus: string) => {
        const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]); // Note: rowSelection keys are index or id depending on getRowId
        // Actually standard rowSelection uses the row ID if getRowId is set, or index otherwise.
        // Let's ensure we use IDs.
        const selectedAppIds = table.getSelectedRowModel().rows.map(row => row.original.id);

        if (selectedAppIds.length === 0) return;

        try {
            const { error } = await supabase.from("applications").update({ status: newStatus }).in("id", selectedAppIds);
            if (error) throw error;
            toast({ title: "Bulk Update", description: `Updated ${selectedAppIds.length} applications to ${newStatus}.` });
            setApplications((prev) => prev.map((a) => (selectedAppIds.includes(a.id) ? { ...a, status: newStatus as any } : a)));
            setRowSelection({});
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed bulk update." });
        }
    };

    const saveAdminData = async (id: string, rating: number, notes: string) => {
        setUpdatingNotes(id);
        try {
            const { error } = await supabase.from("applications").update({
                admin_rating: rating,
                admin_notes: notes,
                status_message: activeApp?.status_message,
                missing_docs: activeApp?.missing_docs,
                next_steps: activeApp?.next_steps,
            }).eq("id", id);
            if (error) throw error;
            toast({ title: "Saved", description: "Rating and notes updated." });
            setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, admin_rating: rating, admin_notes: notes } : a)));
        } catch (error) {
            toast({ variant: "destructive", title: "Save Failed", description: error instanceof Error ? error.message : "Unknown error" });
        } finally {
            setUpdatingNotes(null);
        }
    };

    const runAiAnalysis = async (id: string) => {
        setAnalyzingId(id);
        try {
            const { error } = await supabase.functions.invoke("extract-skills", { body: { applicationId: id } });
            if (error) throw error;
            toast({ title: "AI Analysis Complete", description: "Skills and summary updated." });
            fetchApplications();
        } catch (error) {
            toast({ variant: "destructive", title: "AI Analysis Failed", description: "This feature requires Edge Functions." });
        } finally {
            setAnalyzingId(null);
        }
    };

    const getDownloadUrl = async (path: string) => {
        try {
            const { data, error } = await supabase.storage.from("application-docs").createSignedUrl(path, 60);
            if (error) throw error;
            window.open(data.signedUrl, "_blank");
        } catch (error) {
            toast({ variant: "destructive", title: "Download Error", description: "Could not get file URL." });
        }
    };

    const fetchActivityLogs = async (id: string) => {
        try {
            const { data, error } = await supabase
                .from("application_activity_logs")
                .select("*")
                .eq("application_id", id)
                .order("created_at", { ascending: false });
            if (error) throw error;
            setActivityLogs(data || []);
        } catch { setActivityLogs([]); }
    };

    useEffect(() => {
        if (activeApp?.id && drawerOpen) fetchActivityLogs(activeApp.id);
    }, [activeApp, drawerOpen]);

    /* ── Column Definitions ── */
    const columns: ColumnDef<Application>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Applicant <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const app = row.original;
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-sm cursor-pointer hover:underline" onClick={() => { setActiveApp(app); setDrawerOpen(true); }}>{app.name}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "sap_track", // Use accessor here for filtering
            header: "Details",
            cell: ({ row }) => {
                const app = row.original;
                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 py-0">{app.sap_track || "No Track"}</Badge>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 py-0 bg-blue-50/50">{app.german_level || "No German"}</Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{app.type === "talent_pool_registration" ? "Talent Pool" : app.course_name}</span>
                    </div>
                );
            },
            filterFn: "includesString"
        },
        {
            id: "actions-col",
            header: "Documents",
            cell: ({ row }) => {
                const app = row.original;
                return (
                    <div className="flex gap-1">
                        {app.cv_path && <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" title="CV" onClick={() => getDownloadUrl(app.cv_path!)}><FileText className="h-3.5 w-3.5" /></Button>}
                        {app.passport_path && <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" title="Passport" onClick={() => getDownloadUrl(app.passport_path!)}><User className="h-3.5 w-3.5" /></Button>}
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                switch (status) {
                    case "approved": case "accepted":
                        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Approved</Badge>;
                    case "rejected":
                        return <Badge variant="destructive">Rejected</Badge>;
                    case "reviewed":
                        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Reviewed</Badge>;
                    default:
                        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
                }
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const app = row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => { setActiveApp(app); setDrawerOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => { setActiveApp(app); setDrawerOpen(true); }}>View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(app.id, "approved")}>Approve Application</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(app.id, "rejected")}>Reject Application</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Send Email</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: applications,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getRowId: (row) => row.id, // Use real ID for selection
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className={adminClassTokens.pageShell}>
            <AdminSectionHeader title="Applications" description="Monitor, filter, and manage all applicant records." />

            <Card className="border-0 shadow-xl shadow-primary/5">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Manage Applications</CardTitle>
                            <CardDescription>View and manage all course and talent pool applications.</CardDescription>
                        </div>

                        {/* ── Table Toolbar ── */}
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Filter applicants..."
                                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("name")?.setFilterValue(event.target.value)
                                }
                                className="max-w-sm"
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="ml-auto">
                                        Columns <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) =>
                                                        column.toggleVisibility(!!value)
                                                    }
                                                >
                                                    {column.id}
                                                </DropdownMenuCheckboxItem>
                                            );
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {Object.keys(rowSelection).length > 0 && (
                        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3 mt-4 animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{Object.keys(rowSelection).length} Selected</Badge>
                                <span className="text-xs font-medium">Bulk Actions:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" className="h-8 text-[10px] gap-1 text-green-600 border-green-200" onClick={() => handleBulkStatusUpdate('approved')}>
                                    <Check className="h-3 w-3" /> Approve All
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 text-[10px] gap-1 text-destructive border-red-200" onClick={() => handleBulkStatusUpdate('rejected')}>
                                    <X className="h-3 w-3" /> Reject All
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 text-[10px]" onClick={() => setRowSelection({})}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "No results."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                            {table.getFilteredRowModel().rows.length} row(s) selected.
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ═══════════════ Profile Drawer ═══════════════ */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent className="sm:max-w-xl w-full p-0 overflow-hidden flex flex-col">
                    {activeApp && (
                        <>
                            {/* Header */}
                            <div className="bg-primary/5 p-6 border-b">
                                <SheetHeader className="text-left">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                            {activeApp.type === "talent_pool_registration" ? "Talent Pool" : "Course Application"}
                                        </Badge>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className={`h-4 w-4 ${star <= (activeApp.admin_rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <SheetTitle className="text-2xl font-bold">{activeApp.name}</SheetTitle>
                                    <SheetDescription className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {activeApp.email}</span>
                                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {activeApp.phone}</span>
                                    </SheetDescription>
                                </SheetHeader>
                            </div>

                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-8 pb-10">
                                    {/* Quick Info Grid */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: "German", value: activeApp.german_level || "N/A" },
                                            { label: "SAP Track", value: activeApp.sap_track || "N/A" },
                                            { label: "Exp. Years", value: activeApp.experience_years || "0" },
                                        ].map((item) => (
                                            <div key={item.label} className="p-3 rounded-xl bg-muted/40 border text-center">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{item.label}</p>
                                                <p className="font-semibold">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Internal Notes */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-sm flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Internal Notes</h3>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button key={star} onClick={() => saveAdminData(activeApp.id, star, adminNotes[activeApp.id] ?? activeApp.admin_notes ?? "")}>
                                                        <Star className={`h-4 w-4 ${star <= (activeApp.admin_rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <textarea
                                                className="w-full h-32 p-3 text-sm rounded-xl bg-muted/40 border focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                                placeholder="Add your evaluation notes here…"
                                                value={adminNotes[activeApp.id] ?? activeApp.admin_notes ?? ""}
                                                onChange={(e) => setAdminNotes((prev) => ({ ...prev, [activeApp.id]: e.target.value }))}
                                            />

                                            <Button className="w-full shadow-lg shadow-primary/10 mt-4" onClick={() => saveAdminData(activeApp.id, activeApp.admin_rating || 0, adminNotes[activeApp.id] ?? activeApp.admin_notes ?? "")} disabled={updatingNotes === activeApp.id}>
                                                {updatingNotes === activeApp.id ? <Clock className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                Save Notes & Rating
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Documents */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Verification Documents</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {activeApp.cv_path && (
                                                <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => getDownloadUrl(activeApp.cv_path!)}>
                                                    <FileText className="h-5 w-5 text-red-500" />
                                                    <div className="text-left"><p className="text-xs font-bold">Curriculum Vitae</p><p className="text-[10px] text-muted-foreground">PDF Document</p></div>
                                                </Button>
                                            )}
                                            {activeApp.passport_path && (
                                                <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => getDownloadUrl(activeApp.passport_path!)}>
                                                    <Shield className="h-5 w-5 text-blue-500" />
                                                    <div className="text-left"><p className="text-xs font-bold">ID / Passport</p><p className="text-[10px] text-muted-foreground">Private Document</p></div>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Footer Actions */}
                            <div className="p-6 border-t bg-muted/10 flex gap-3">
                                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => updateStatus(activeApp.id, "approved")}><Check className="h-4 w-4 mr-2" /> Approve</Button>
                                <Button className="flex-1" variant="destructive" onClick={() => updateStatus(activeApp.id, "rejected")}><X className="h-4 w-4 mr-2" /> Reject</Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}


