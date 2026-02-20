import { ReactNode, useMemo, useState } from "react";
import { BookOpen, Clock3, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTalentLearningData } from "./useTalentLearningData";

const TalentCoursesPage = () => {
  const { loading, enrollments } = useTalentLearningData();
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">("all");

  const visibleEnrollments = useMemo(() => {
    if (filter === "all") return enrollments;
    return enrollments.filter((item) => item.status === filter);
  }, [enrollments, filter]);

  const stats = useMemo(() => {
    const completed = enrollments.filter((item) => item.status === "completed").length;
    const inProgress = enrollments.filter((item) => item.status === "in_progress").length;
    const avg = enrollments.length
      ? Math.round(enrollments.reduce((sum, item) => sum + (item.progress_percent || 0), 0) / enrollments.length)
      : 0;

    return {
      total: enrollments.length,
      completed,
      inProgress,
      avg,
    };
  }, [enrollments]);

  if (loading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="h-12 w-72 rounded-lg bg-muted/50" />
        <div className="h-28 rounded-xl bg-muted/40" />
        <div className="h-52 rounded-xl bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Academy Workspace
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My courses</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Track progression, continue modules, and open details with one consistent workflow.</p>
          </div>

          <Select value={filter} onValueChange={(value) => setFilter(value as "all" | "in_progress" | "completed") }>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total" value={`${stats.total}`} icon={<BookOpen className="h-4 w-4 text-primary" />} />
        <Metric label="In progress" value={`${stats.inProgress}`} icon={<Clock3 className="h-4 w-4 text-primary" />} />
        <Metric label="Completed" value={`${stats.completed}`} icon={<Target className="h-4 w-4 text-primary" />} />
        <Metric label="Average progress" value={`${stats.avg}%`} icon={<Sparkles className="h-4 w-4 text-primary" />} />
      </section>

      {visibleEnrollments.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">No courses found for this filter.</CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibleEnrollments.map((enrollment) => {
            const course = enrollment.courses;
            return (
              <Card key={enrollment.id} className="border-border/60 bg-card/80 transition hover:border-primary/40 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-lg">{course?.title || "Course"}</CardTitle>
                    <Badge variant="secondary" className="capitalize">{enrollment.status}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{course?.description || "No description available."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {course?.duration_hours || 0} hours</span>
                    <span>{enrollment.progress_percent || 0}%</span>
                  </div>
                  <Progress value={enrollment.progress_percent || 0} className="h-2" />
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline"><Link to={`/talent/learning/${enrollment.course_id}`}>Course details</Link></Button>
                    <Button asChild><Link to={`/talent/learning/${enrollment.course_id}`}>Continue</Link></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
};

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
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

export default TalentCoursesPage;
