
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const data = [
    { stage: 'Applied', count: 120 },
    { stage: 'Screening', count: 45 },
    { stage: 'Interview', count: 18 },
    { stage: 'Offer', count: 8 },
    { stage: 'Hired', count: 5 },
];

export function FunnelChart() {
    return (
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all border-slate-200 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Pipeline Funnel</CardTitle>
                <CardDescription>Conversion rates across hiring stages</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} width={80} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
