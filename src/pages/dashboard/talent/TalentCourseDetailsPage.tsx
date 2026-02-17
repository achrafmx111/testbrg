import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CourseModule } from "@/types";
import { useTalentLearningData } from "./useTalentLearningData";

const TalentCourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { loading, enrollments } = useTalentLearningData();
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [modulesLoading, setModulesLoading] = useState(true);

  const enrollment = useMemo(
    () => enrollments.find((e) => e.course_id === courseId),
    [enrollments, courseId],
  );

  useEffect(() => {
    const fetchModules = async () => {
      if (!courseId) {
        setModulesLoading(false);
        return;
      }
      try {
        const { data, error } = await (supabase as any)
          .from("course_modules")
          .select("*")
          .eq("course_id", courseId)
          .order("order_index", { ascending: true });

        if (error) {
          const missingTable =
            error.code === "PGRST205" || String(error.message || "").includes("course_modules");
          if (!missingTable) {
            throw error;
          }
        }
        setModules((data as CourseModule[]) || []);
      } finally {
        setModulesLoading(false);
      }
    };

    fetchModules();
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      window.localStorage.setItem("lastTalentCourseId", courseId);
    }
  }, [courseId]);

  if (loading) {
    return <div className="text-sm text-slate-500">Loading course details...</div>;
  }

  if (!enrollment) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="space-y-3 p-5">
          <p className="text-sm text-slate-600">Course details unavailable. This course is not part of your enrollments.</p>
          <Button asChild variant="outline"><Link to="/talent/learning">Go to My Courses</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const course = enrollment.courses;
  const completedModules = modules.length > 0 ? Math.floor(((enrollment.progress_percent || 0) / 100) * modules.length) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/talent/learning")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Courses
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-2xl">{course?.title || "Course Details"}</CardTitle>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{enrollment.progress_percent || 0}%</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">{course?.description || "No description available."}</p>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4 text-primary" /> {course?.duration_hours || 0}h total</span>
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> {enrollment.status}</span>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Completion</span>
                <span>{enrollment.progress_percent || 0}%</span>
              </div>
              <Progress value={enrollment.progress_percent || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Course Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total Modules</p>
              <p className="text-2xl font-black text-slate-800">{modules.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Completed Modules</p>
              <p className="text-2xl font-black text-slate-800">{completedModules}</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-slate-700">
              Focus on the next uncompleted module to keep steady progress.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Course Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {modulesLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading modules...</div>
          ) : modules.length === 0 ? (
            <p className="text-sm text-slate-500">No modules found for this course yet.</p>
          ) : (
            modules.map((module, index) => {
              const isDone = index < completedModules;
              return (
                <div key={module.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-800">{module.order_index}. {module.title}</p>
                  <Badge className={isDone ? "bg-primary/10 text-primary hover:bg-primary/10" : "bg-slate-100 text-slate-600 hover:bg-slate-100"}>
                    {isDone ? "Done" : "Pending"}
                  </Badge>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TalentCourseDetailsPage;
