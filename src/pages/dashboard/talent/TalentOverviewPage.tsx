import { ReactNode } from "react";
import { BookOpen, ChevronRight, Clock3, Sparkles, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTalentLearningData } from "./useTalentLearningData";

const TalentOverviewPage = () => {
  const { loading, profile, enrollments, stats } = useTalentLearningData();

  if (loading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="h-12 w-72 rounded-lg bg-muted/50" />
        <div className="h-28 rounded-xl bg-muted/40" />
        <div className="h-56 rounded-xl bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
          <Sparkles className="mr-1 h-3.5 w-3.5" /> Learner Console
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {profile?.first_name || "Talent"}, keep pushing your learning goals.
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Your overview combines progression, remaining effort, and high-value actions for this week.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Hours spent" value={`${stats.totalHours}h`} icon={<Clock3 className="h-4 w-4 text-primary" />} />
        <Stat label="Average progress" value={`${stats.avgProgress}%`} icon={<Target className="h-4 w-4 text-primary" />} />
        <Stat label="Completed" value={`${stats.completedCourses}`} icon={<Trophy className="h-4 w-4 text-primary" />} />
        <Stat label="Remaining" value={`${stats.remainingCourses}`} icon={<BookOpen className="h-4 w-4 text-primary" />} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="border-border/60">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">Course progress overview</CardTitle>
              <CardDescription>Priority courses and completion trajectory.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm"><Link to="/talent/learning">Open courses</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrollments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No active enrollments yet.</div>
            ) : (
              enrollments.slice(0, 5).map((enrollment) => (
                <div key={enrollment.id} className="rounded-xl border border-border/60 bg-card/70 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-semibold text-foreground">{enrollment.courses?.title || "Course"}</p>
                    <Badge className="bg-primary/15 text-primary hover:bg-primary/15">{enrollment.progress_percent || 0}%</Badge>
                  </div>
                  <Progress value={enrollment.progress_percent || 0} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Remaining work</CardTitle>
            <CardDescription>Where to focus next.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrollments.slice(0, 4).map((enrollment) => {
              const remaining = Math.max(100 - (enrollment.progress_percent || 0), 0);
              return (
                <div key={`remain-${enrollment.id}`} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                  <div>
                    <p className="line-clamp-1 text-sm font-semibold text-foreground">{enrollment.courses?.title || "Course"}</p>
                    <p className="text-xs text-muted-foreground">{remaining}% remaining</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            })}
            {enrollments.length === 0 ? <p className="text-sm text-muted-foreground">No active work items.</p> : null}
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Current courses table</CardTitle>
          <CardDescription>Compact view for your ongoing and completed tracks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.slice(0, 8).map((enrollment) => (
                <TableRow key={`tbl-${enrollment.id}`}>
                  <TableCell className="font-medium">{enrollment.courses?.title || "Course"}</TableCell>
                  <TableCell>{enrollment.courses?.duration_hours || 0}h</TableCell>
                  <TableCell>{enrollment.progress_percent || 0}%</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{enrollment.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5">{icon}</div>
      </CardContent>
    </Card>
  );
}

export default TalentOverviewPage;
