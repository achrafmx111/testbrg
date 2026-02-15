import { useCallback, useEffect, useState } from "react";
import {
    Calendar, CheckCircle, XCircle, Clock, MoreVertical,
    Search, Filter, Video, Building2, User
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewRequest } from "@/types";
import { AdminSectionHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";

export default function AdminInterviewsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [interviews, setInterviews] = useState<InterviewRequest[]>([]);

    // Table State
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const fetchInterviews = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("interview_requests")
                .select(`
                    *,
                    application:applications(id, name, course_name),
                    company:companies(id, name, logo_url),
                    talent:profiles!talent_id(id, first_name, last_name, email),
                    recruiter:profiles!recruiter_id(id, first_name, last_name)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setInterviews(data as unknown as InterviewRequest[]);
        } catch (error) {
            console.error("Error fetching interviews:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to load interviews." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("interview_requests")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            toast({ title: "Updated", description: `Interview marked as ${newStatus}.` });
            setInterviews(prev => prev.map(i => i.id === id ? { ...i, status: newStatus as any } : i));
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update status." });
        }
    };

    const columns: ColumnDef<InterviewRequest>[] = [
        {
            accessorKey: "company.name",
            id: "companyName",
            header: "Company",
            cell: ({ row }) => {
                const company = row.original.company;
                return (
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center overflow-hidden">
                            {company?.logo_url ? <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover" /> : <Building2 className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <span className="font-medium text-sm">{company?.name || "Unknown"}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "talent",
            header: "Candidate",
            cell: ({ row }) => {
                const talent = row.original.talent;
                const app = row.original.application;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{talent?.first_name} {talent?.last_name}</span>
                        <span className="text-[10px] text-muted-foreground">{app?.course_name || "Talent Pool"}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const colorMap: Record<string, string> = {
                    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
                    approved: "bg-blue-100 text-blue-800 border-blue-200",
                    scheduled: "bg-purple-100 text-purple-800 border-purple-200",
                    completed: "bg-green-100 text-green-800 border-green-200",
                    rejected: "bg-red-100 text-red-800 border-red-200",
                    cancelled: "bg-gray-100 text-gray-800 border-gray-200"
                };
                return <Badge variant="outline" className={colorMap[status] || ""}>{status}</Badge>;
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "date",
            header: "Date/Time",
            cell: ({ row }) => {
                const req = row.original;
                if (req.confirmed_time) {
                    return <div className="flex items-center gap-1 text-sm font-medium"><Calendar className="h-3 w-3" /> {new Date(req.confirmed_time).toLocaleString()}</div>;
                }
                return <span className="text-xs text-muted-foreground italic">Not scheduled</span>;
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const req = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateStatus(req.id, "approved")}>Approve Request</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(req.id, "rejected")} className="text-destructive">Reject Request</DropdownMenuItem>
                            {req.meeting_link && (
                                <DropdownMenuItem onClick={() => window.open(req.meeting_link, '_blank')}>
                                    <Video className="h-4 w-4 mr-2" /> Join Meeting
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }
    ];

    const table = useReactTable({
        data: interviews,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    return (
        <div className={adminClassTokens.pageShell}>
            <AdminSectionHeader title="Interviews" description="Manage interview requests between companies and candidates." />

            <Card className="border-0 shadow-xl shadow-primary/5">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Interview Requests</CardTitle>
                            <CardDescription>Monitor approvals and schedules.</CardDescription>
                        </div>
                        <Input
                            placeholder="Search..."
                            value={(table.getColumn("company.name")?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn("company.name")?.setFilterValue(event.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            {loading ? "Loading..." : "No interviews found."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
