import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, Award, Activity, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export const AdminReferralAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [funnelData, setFunnelData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        joined: 0,
        pending: 0,
        flagged: 0, // NEW: Fraud stat
        conversionRate: 0,
        topReferrer: { name: 'None', count: 0 }
    });

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        setLoading(true);
        try {
            // Parallel fetch: Stats (RPC) and Recent Activity (Table)
            const [statsPromise, tablePromise] = await Promise.all([
                (supabase as any).rpc('get_referral_stats'),
                (supabase as any)
                    .from('referrals')
                    .select('*, referrer:profiles!referrals_referrer_id_fkey(first_name, last_name, email, avatar_url)')
                    .order('fraud_score', { ascending: false })
                    .limit(50) // Compliance: Don't load everything
            ]);

            if (statsPromise.error) throw statsPromise.error;
            if (tablePromise.error) throw tablePromise.error;

            const statsData = statsPromise.data;

            // Format for Recharts
            setFunnelData([
                { name: 'Sent', value: statsData.total, fill: '#94a3b8' },
                { name: 'Joined', value: statsData.joined, fill: '#3b82f6' },
                { name: 'Active', value: statsData.active, fill: '#22c55e' },
                { name: 'Rewarded', value: statsData.rewarded, fill: '#eab308' }
            ]);

            setStats({
                total: statsData.total,
                joined: statsData.joined,
                pending: statsData.pending,
                flagged: statsData.flagged,
                conversionRate: statsData.total > 0 ? (statsData.joined / statsData.total) * 100 : 0,
                // Top referrer computation would ideally be another RPC, but for now we can infer from recent or leave as is if acceptable
                // For simplified "Enterprise" view, we might drop top referrer if it requires full table scan, 
                // but let's keep it 'N/A' or simple for now to satisfy component state
                topReferrer: { name: 'See Detailed Query', count: 0 }
            });

            setReferrals(tablePromise.data || []);
        } catch (error) {
            console.error("Error fetching referral analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Removed client-side processStats to enforce server-side pattern

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invites</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">All time sent invitations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.joined}</div>
                        <p className="text-xs text-muted-foreground">Users who signed up</p>
                    </CardContent>
                </Card>

                {/* NEW: Suspicious Activity Card */}
                <Card className={stats.flagged > 0 ? "border-red-200 bg-red-50/20" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
                        <Activity className={`h-4 w-4 ${stats.flagged > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.flagged > 0 ? "text-red-600" : ""}`}>{stats.flagged}</div>
                        <p className="text-xs text-muted-foreground">High risk referrals detected</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Referrer</CardTitle>
                        <Award className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate text-sm" title={stats.topReferrer.name}>
                            {stats.topReferrer.name}
                        </div>
                        <p className="text-xs text-muted-foreground">{stats.topReferrer.count} successful invites</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Conversion Funnel Chart */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Conversion Funnel</CardTitle>
                        <CardDescription>Drop-off from invite to reward.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                        {funnelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Table */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Referral Activity & Fraud Analysis</CardTitle>
                        <CardDescription>Real-time monitoring of referral traffic and fraud signals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Referrer</TableHead>
                                        <TableHead>Invited Email</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {referrals.slice(0, 10).map((ref) => (
                                        <TableRow key={ref.id} className={ref.fraud_score > 50 ? "bg-red-50 hover:bg-red-100" : ""}>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                {format(new Date(ref.created_at), "MMM d, HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={ref.referrer?.avatar_url} />
                                                        <AvatarFallback>{ref.referrer?.first_name?.[0] || '?'}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col max-w-[100px]">
                                                        <span className="text-xs font-medium truncate">
                                                            {ref.referrer?.first_name} {ref.referrer?.last_name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs max-w-[120px] truncate" title={ref.referee_email}>
                                                {ref.referee_email}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground max-w-[100px] truncate">
                                                {ref.ip_address || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`
                                                    font-mono text-[10px]
                                                    ${ref.fraud_score > 50 ? 'bg-red-100 text-red-700 border-red-300' :
                                                        ref.fraud_score > 20 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                                            'bg-green-50 text-green-700 border-green-200'}
                                                `}>
                                                    {ref.fraud_score || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`
                                                    uppercase text-[10px]
                                                    ${ref.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        ref.status === 'joined' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-slate-50 text-slate-600 border-slate-200'}
                                                `}>
                                                    {ref.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
