import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Users, CheckCircle2, CircleDollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mvp, MvpApplication } from "@/integrations/supabase/mvp";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<MvpApplication[]>([]);
  const [metrics, setMetrics] = useState({
    totalApplications: 0,
    hiredCount: 0,
    interviewingCount: 0,
    rejectedCount: 0
  });

  useEffect(() => {
    const load = async () => {
      try {
        const apps = await mvp.listApplications();
        setApplications(apps);
        setMetrics({
          totalApplications: apps.length,
          hiredCount: apps.filter(a => a.stage === "HIRED").length,
          interviewingCount: apps.filter(a => a.stage === "INTERVIEW").length,
          rejectedCount: apps.filter(a => a.stage === "REJECTED").length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const data = [
    { name: 'Applied', count: applications.filter(a => a.stage === 'APPLIED').length },
    { name: 'Screen', count: applications.filter(a => a.stage === 'SCREEN').length },
    { name: 'Interview', count: applications.filter(a => a.stage === 'INTERVIEW').length },
    { name: 'Offer', count: applications.filter(a => a.stage === 'OFFER').length },
    { name: 'Hired', count: applications.filter(a => a.stage === 'HIRED').length },
    { name: 'Rejected', count: applications.filter(a => a.stage === 'REJECTED').length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics & Insights</h2>
        <p className="text-muted-foreground">Platform performance metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalApplications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.hiredCount}</div>
            <p className="text-xs text-muted-foreground">
              {(metrics.hiredCount / (metrics.totalApplications || 1) * 100).toFixed(1)}% placement rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Interviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.interviewingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.rejectedCount / (metrics.totalApplications || 1) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
