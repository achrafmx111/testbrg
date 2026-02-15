import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpCourse, MvpEnrollment } from "@/integrations/supabase/mvp";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, Clock, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function TalentLearningPage() {
  const [enrollments, setEnrollments] = useState<MvpEnrollment[]>([]);
  const [courses, setCourses] = useState<MvpCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [enr, crs] = await Promise.all([
        mvp.listTalentEnrollments(user.id),
        mvp.listCourses()
      ]);
      setEnrollments(enr);
      setCourses(crs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleEnroll = async (courseId: string) => {
    if (!userId) return;
    try {
      await mvp.enrollInCourse(courseId, userId);
      toast({ title: "Enrolled in course", description: "You can now start learning!" });
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Enrollment failed", description: err.message });
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  const enrolledCourseIds = new Set(enrollments.map(e => e.course_id));
  const availableCourses = courses.filter(c => !enrolledCourseIds.has(c.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Center</h1>
          <p className="text-muted-foreground mt-1">Upskill with our curated courses and track your progress.</p>
        </div>
      </div>

      {/* Enrollments */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          My Enrollments
        </h2>
        {enrollments.length === 0 ? (
          <div className="p-8 border border-dashed rounded-lg text-center bg-muted/20">
            <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map(enrollment => {
              const course = courses.find(c => c.id === enrollment.course_id);
              if (!course) return null;
              return (
                <Card key={enrollment.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant={enrollment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2 text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description || "No description available."}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                      <Button className="w-full" variant={enrollment.status === 'COMPLETED' ? "outline" : "default"}>
                        {enrollment.status === 'COMPLETED' ? "Review Course" : "Continue Learning"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <section className="space-y-4 pt-4 border-t">
          <h2 className="text-xl font-semibold text-foreground/90">Available Courses</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map(course => (
              <Card key={course.id} className="group hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs">{course.difficulty || "Beginner"}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {course.duration || "4 weeks"}
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description || "Upskill yourself with this comprehensive course."}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="secondary" onClick={() => handleEnroll(course.id)}>
                    Enroll Now
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
