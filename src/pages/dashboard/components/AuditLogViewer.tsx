import { useCallback, useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Search, Clock, Activity, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { format } from "date-fns";

export const AuditLogViewer = () => {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 15;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            let query = (supabase as any)
                .from('security_logs')
                .select('*, profile:profiles(email, first_name, last_name)', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (debouncedSearchTerm) {
                // Server-side filtering
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(debouncedSearchTerm);
                if (isUUID) {
                    query = query.or(`correlation_id.eq.${debouncedSearchTerm},resource_id.eq.${debouncedSearchTerm},user_id.eq.${debouncedSearchTerm}`);
                } else {
                    query = query.or(`action.ilike.%${debouncedSearchTerm}%,resource_type.ilike.%${debouncedSearchTerm}%`);
                }
            }

            if (startDate) {
                query = query.gte('created_at', format(new Date(startDate), "yyyy-MM-dd'T'00:00:00"));
            }
            if (endDate) {
                query = query.lte('created_at', format(new Date(endDate), "yyyy-MM-dd'T'23:59:59"));
            }

            const { data, error, count } = await query;

            if (error) throw error;
            setLogs(data || []);
            setTotalCount(count || 0);
        } catch (error) {
            console.error("Error fetching audit logs:", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, endDate, page, startDate]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch on page change or dates
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const [selectedLog, setSelectedLog] = useState<any | null>(null);

    const handleExportCSV = async () => {
        try {
            // 1. Fetch filtered data (streaming-like, capped at 1000 for client safety)
            let query = (supabase as any)
                .from('security_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1000);

            if (searchTerm) {
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm);
                if (isUUID) {
                    query = query.or(`correlation_id.eq.${searchTerm},resource_id.eq.${searchTerm},user_id.eq.${searchTerm}`);
                } else {
                    query = query.or(`action.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%`);
                }
            }

            const { data, error } = await query;
            if (error) throw error;
            if (!data || data.length === 0) return;

            // 2. Convert to CSV
            const headers = ['ID', 'Date', 'Action', 'Actor', 'IP', 'Resource', 'Metadata', 'Correlation ID', 'Hash'];
            const csvRows = [headers.join(',')];

            data.forEach((log: any) => {
                const row = [
                    log.id,
                    log.created_at,
                    log.action,
                    log.user_id,
                    log.ip_address || '',
                    log.resource_type,
                    `"${JSON.stringify(log.metadata).replace(/"/g, '""')}"`,
                    log.correlation_id || '',
                    log.event_hash || ''
                ];
                csvRows.push(row.join(','));
            });

            // 3. Download
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // 4. AUDIT THE EXPORT (Security Requirement)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await (supabase as any).from('security_logs').insert({
                    user_id: user.id,
                    action: 'AUDIT_CSV_EXPORTED',
                    resource_type: 'audit_log',
                    ip_address: 'admin-export',
                    metadata: { count: data.length, search_term: searchTerm }
                });
            }

        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    const getActionBadge = (action: string) => {
        const criticalActions = ['ROLE_CHANGED', 'ACCOUNT_DELETED', 'ACCOUNT_DELETION_REQUEST', 'UNAUTHORIZED_ACCESS', 'PIPELINE_STAGE_CHANGED'];
        const isCritical = criticalActions.includes(action);

        return (
            <Badge variant={isCritical ? "destructive" : "outline"} className="text-[10px] uppercase font-bold">
                {action.replace(/_/g, ' ')}
            </Badge>
        );
    };

    return (
        <>
            <Card className="border-0 shadow-elegant">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                System Audit Logs
                            </CardTitle>
                            <CardDescription>
                                Forensic immutable record of all security-sensitive actions.
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    className="h-10 w-36 text-xs"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    type="date"
                                    className="h-10 w-36 text-xs"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by action, resource, or UUID..."
                                    className="pl-9 h-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                                <Activity className="h-4 w-4" />
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[180px]">Timestamp</TableHead>
                                    <TableHead>Actor</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Resource</TableHead>
                                    <TableHead>Device/IP</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20">
                                            <Activity className="h-8 w-8 animate-spin mx-auto text-primary/20" />
                                            <p className="mt-2 text-sm text-muted-foreground">Loading audit trail...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                            No security logs found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : logs.map((log) => (
                                    <TableRow
                                        key={log.id}
                                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        <TableCell className="text-[10px] font-mono whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold">{log.profile?.first_name} {log.profile?.last_name}</span>
                                                <span className="text-[10px] text-muted-foreground">{log.profile?.email || 'System'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getActionBadge(log.action)}
                                        </TableCell>
                                        <TableCell>
                                            {log.resource_type ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{log.resource_type}</span>
                                                    <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[100px]" title={log.resource_id}>{log.resource_id}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground italic">System-wide</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                                    <Globe className="h-2.5 w-2.5" />
                                                    {log.ip_address || 'Captured'}
                                                </div>
                                                <span className="text-[9px] text-muted-foreground max-w-[120px] truncate" title={log.user_agent}>
                                                    {log.user_agent}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{(page - 1) * pageSize + 1}</strong> to <strong>{Math.min(page * pageSize, totalCount)}</strong> of <strong>{totalCount}</strong> logs
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * pageSize >= totalCount || loading}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            {/* Log Details Dialog */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
                    <div className="bg-background rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Log Details</h3>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>Close</Button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-muted-foreground font-bold">Event ID</label>
                                    <p className="text-xs font-mono bg-muted p-1 rounded">{selectedLog.id}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-bold">Correlation ID</label>
                                    <p className="text-xs font-mono bg-muted p-1 rounded">{selectedLog.correlation_id || 'N/A'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-muted-foreground font-bold">Forensic Event Hash (SHA256)</label>
                                <p className="text-xs font-mono bg-slate-100 text-slate-800 p-2 rounded break-all border border-slate-200">
                                    {selectedLog.event_hash || 'Legacy Event (No Hash)'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <label className="text-xs text-muted-foreground font-bold">Actor</label>
                                    <p className="text-sm">{selectedLog.profile?.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-bold">Action</label>
                                    <p className="text-sm">{selectedLog.action}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-bold">IP Address</label>
                                    <p className="text-sm font-mono">{selectedLog.ip_address}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-bold">Timestamp</label>
                                    <p className="text-sm font-mono">{selectedLog.created_at}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-muted-foreground font-bold">Metadata Payload</label>
                                <pre className="text-xs font-mono bg-slate-950 text-slate-50 p-3 rounded-lg overflow-x-auto mt-1">
                                    {JSON.stringify(selectedLog.metadata, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
