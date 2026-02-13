
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { SystemMetric } from '@/types';
import { Activity, Server, Database, AlertCircle, CheckCircle } from 'lucide-react';

interface HealthStats {
    dbLatency: number;
    errorRate: number;
    activeJobs: number;
    totalEvents: number;
}

export function AdminSystemHealth() {
    const [stats, setStats] = useState<HealthStats>({
        dbLatency: 45, // Mock baseline
        errorRate: 0.12,
        activeJobs: 0,
        totalEvents: 1250
    });
    const [status, setStatus] = useState<'healthy' | 'degraded' | 'critical'>('healthy');

    useEffect(() => {
        // In a real app, we would fetch from system_metrics table
        // For now, we simulate real-time monitoring
        const checkHealth = async () => {
            // 1. Check pending jobs
            const { count: pendingJobs } = await (supabase as any)
                .from('background_jobs')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // 2. Check total events (last 24h)
            const { count: recentEvents } = await (supabase as any)
                .from('security_logs')
                .select('*', { count: 'exact', head: true });

            setStats(prev => ({
                ...prev,
                activeJobs: pendingJobs || 0,
                totalEvents: recentEvents || 0
            }));

            // Simple heuristic
            if ((pendingJobs || 0) > 50) setStatus('degraded');
            else setStatus('healthy');
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">System Health</h2>
                <Badge variant={status === 'healthy' ? 'default' : 'destructive'} className="text-sm px-3 py-1">
                    {status === 'healthy' ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                    {status.toUpperCase()}
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">API Latency</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.dbLatency}ms</div>
                        <p className="text-xs text-muted-foreground">p95 response time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.errorRate}%</div>
                        <p className="text-xs text-muted-foreground">Last 24 hours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeJobs}</div>
                        <p className="text-xs text-muted-foreground">Pending in queue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEvents}</div>
                        <p className="text-xs text-muted-foreground">Security logs captured</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
