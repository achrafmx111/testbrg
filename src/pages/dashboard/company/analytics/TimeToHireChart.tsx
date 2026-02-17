
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const data = [
    { month: 'Jan', days: 45 },
    { month: 'Feb', days: 42 },
    { month: 'Mar', days: 38 },
    { month: 'Apr', days: 35 },
    { month: 'May', days: 32 },
    { month: 'Jun', days: 28 },
];

export function TimeToHireChart() {
    return (
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all border-slate-200 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Time to Hire Trend</CardTitle>
                <CardDescription>Average days to hire over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="days" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorDays)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
