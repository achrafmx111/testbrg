import { useEffect, useState } from "react";
import { Server, Shield, Database, Activity, AlertOctagon } from "lucide-react";
import { AdminSectionHeader, AdminStatCard, AdminPanelHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminSystemPage() {
    const [systemHealth, setSystemHealth] = useState({
        apiStatus: "operational",
        dbLatency: "24ms",
        errorRate: "0.01%",
        lastBackup: "2 hours ago"
    });

    return (
        <div className={adminClassTokens.pageShell}>
            <AdminSectionHeader
                title="System Status"
                description="Monitor platform health, logs, and security events."
                aside={<Button variant="outline" size="sm" className="gap-2"><Activity className="h-4 w-4" /> View Live Logs</Button>}
            />

            {/* Health Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
                <AdminStatCard
                    label="API Status"
                    value={systemHealth.apiStatus === "operational" ? "Online" : "Issues"}
                    tone={systemHealth.apiStatus === "operational" ? "success" : "critical"}
                    icon={<Server className={`h-4 w-4 ${systemHealth.apiStatus === "operational" ? "text-green-600" : "text-red-600"}`} />}
                    subtitle="99.9% Uptime"
                />
                <AdminStatCard
                    label="Database Latency"
                    value={systemHealth.dbLatency}
                    tone={parseInt(systemHealth.dbLatency) < 50 ? "success" : "warning"}
                    icon={<Database className="h-4 w-4 text-blue-500" />}
                />
                <AdminStatCard
                    label="Error Rate"
                    value={systemHealth.errorRate}
                    tone="success"
                    icon={<AlertOctagon className="h-4 w-4 text-purple-500" />}
                />
                <AdminStatCard
                    label="Security Audits"
                    value="Clean"
                    tone="success"
                    icon={<Shield className="h-4 w-4 text-green-500" />}
                    subtitle={`Backup: ${systemHealth.lastBackup}`}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Audit Logs Placeholder */}
                <Card>
                    <CardHeader>
                        <AdminPanelHeader title="Recent Audit Logs" badge="Live" />
                        <CardDescription>Security and administrative actions logged in real-time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start gap-4 p-3 rounded-lg border bg-muted/20 text-sm">
                                    <Shield className="h-4 w-4 text-slate-400 mt-1" />
                                    <div>
                                        <p className="font-medium">User Role Updated</p>
                                        <p className="text-muted-foreground text-xs">Admin updated User #{1000 + i} to 'Verified'</p>
                                    </div>
                                    <span className="ml-auto text-xs text-muted-foreground">2m ago</span>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-muted-foreground">View All Logs</Button>
                    </CardContent>
                </Card>

                {/* System Alerts */}
                <Card>
                    <CardHeader>
                        <AdminPanelHeader title="System Alerts" />
                        <CardDescription>Critical warnings and performance bottlenecks.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/10 rounded-xl border border-dashed">
                            <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
                            <h4 className="font-semibold">All Systems Nominal</h4>
                            <p className="text-sm text-muted-foreground">No active alerts at this time.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Helper icon
function CheckCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    )
}
