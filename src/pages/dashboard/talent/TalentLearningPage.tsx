import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Clock3, Loader2, PlayCircle, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpCourse, MvpEnrollment } from "@/integrations/supabase/mvp";
import { useToast } from "@/hooks/use-toast";

export default function TalentLearningPage() {
  const [enrollments, setEnrollments] = useState<MvpEnrollment[]>([]);
  const [courses, setCourses] = useState<MvpCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      const [enr, crs] = await Promise.all([mvp.listTalentEnrollments(user.id), mvp.listCourses()]);
      setEnrollments(enr);
      setCourses(crs);
    } catch {
      toast({ variant: "destructive", title: "Failed to load learning data" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const enrolledCourseIds = useMemo(() => new Set(enrollments.map((enrollment) => enrollment.course_id)), [enrollments]);
  const availableCourses = useMemo(() => courses.filter((course) => !enrolledCourseIds.has(course.id)), [courses, enrolledCourseIds]);

  const learningStats = useMemo(() => {
    const completed = enrollments.filter((enrollment) => enrollment.status === "COMPLETED").length;
    const active = enrollments.filter((enrollment) => enrollment.status !== "COMPLETED").length;
    const avgProgress = enrollments.length === 0 ? 0 : Math.round(enrollments.reduce((sum, item) => sum + item.progress, 0) / enrollments.length);
    return {
      completed,
      active,
      avgProgress,
      total: enrollments.length,
    };
  }, [enrollments]);

  const handleEnroll = async (courseId: string) => {
    if (!userId) return;
    setEnrollingCourseId(courseId);
    try {
      await mvp.enrollInCourse(courseId, userId);
      toast({ title: "Enrolled successfully", description: "Course was added to your learning path." });
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Enrollment failed", description: error?.message ?? "Try again." });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
              <Sparkles className="h-3 w-3" />
              Learning Journey
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">SkillCore Learning Center</h2>
            <p className="mt-1 text-sm text-muted-foreground">Track course progress, complete assessments, and unlock readiness milestones.</p>
          </div>
          <Badge variant="secondary" className="h-fit">Mock-ready design</Badge>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enrolled Courses" value={`${learningStats.total}`} helper="Active learning path" icon={<BookOpen className="h-4 w-4 text-primary" />} />
        <StatCard label="In Progress" value={`${learningStats.active}`} helper="Courses currently running" icon={<PlayCircle className="h-4 w-4 text-primary" />} />
        <StatCard label="Completed" value={`${learningStats.completed}`} helper="Finished modules" icon={<CheckCircle2 className="h-4 w-4 text-primary" />} />
        <StatCard label="Avg Progress" value={`${learningStats.avgProgress}%`} helper="Across all enrollments" icon={<Trophy className="h-4 w-4 text-primary" />} />
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">My Enrollments</h3>
        {enrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center bg-muted/10">
            <p className="text-muted-foreground">You have no enrollments yet. Start with one of the recommendations below.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((enrollment) => {
              const course = courses.find((item) => item.id === enrollment.course_id);
              if (!course) return null;

              return (
                <Card key={enrollment.id} className="border-border/60 bg-card/95">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={enrollment.status === "COMPLETED" ? "default" : "secondary"}>{enrollment.status}</Badge>
                      <span className="text-[11px] text-muted-foreground">{course.level ?? "Foundation"}</span>
                    </div>
                    <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description || "Hands-on course with practical SAP scenarios."}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-semibold text-foreground">{enrollment.progress}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="h-2" />
                    <Button className="w-full" asChild variant={enrollment.status === "COMPLETED" ? "outline" : "default"}>
                      <Link to={`/talent/learning/${enrollment.course_id}`}>
                        {enrollment.status === "COMPLETED" ? "Review Content" : "Continue Learning"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {availableCourses.length > 0 && (
        <section className="space-y-4 rounded-2xl border border-border/60 bg-gradient-to-b from-card to-primary/5 p-5">
          <h3 className="text-lg font-semibold text-foreground">Recommended Next Courses</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {availableCourses.map((course) => (
              <Card key={course.id} className="group border-border/60 transition-colors hover:border-primary/40">
                <CardHeader className="pb-2">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <Badge variant="outline">{course.difficulty || "Beginner"}</Badge>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock3 className="h-3 w-3" />
                      {course.duration || "4 weeks"}
                    </span>
                  </div>
                  <CardTitle className="text-base group-hover:text-primary">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description || "Comprehensive learning plan with projects and mentor support."}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="secondary" onClick={() => handleEnroll(course.id)} disabled={enrollingCourseId === course.id}>
                    {enrollingCourseId === course.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      "Enroll Course"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">{icon}</span>
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
