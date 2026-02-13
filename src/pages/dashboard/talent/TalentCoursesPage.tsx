import { useMemo, useState } from "react";
import { Clock3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTalentLearningData } from "./useTalentLearningData";

const TalentCoursesPage = () => {
  const { loading, enrollments } = useTalentLearningData();
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">("all");

  const visibleEnrollments = useMemo(() => {
    if (filter === "all") return enrollments;
    return enrollments.filter((e) => e.status === filter);
  }, [enrollments, filter]);

  if (loading) {
    return <div className="text-sm text-slate-500">Loading your courses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <p className="text-xs font-bold uppercase tracking-wide">Academy Workspace</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">My Courses</h1>
          <p className="text-sm text-slate-500">Track progress, continue lessons, and open course details.</p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as "all" | "in_progress" | "completed")}> 
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </div>

      {visibleEnrollments.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5 text-sm text-slate-500">No courses found for this filter.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibleEnrollments.map((enrollment) => {
            const course = enrollment.courses;
            return (
              <Card key={enrollment.id} className="border-slate-200 shadow-sm transition-transform hover:-translate-y-0.5">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{course?.title || "Course"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-slate-600">{course?.description || "No description available."}</p>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> {course?.duration_hours || 0}h</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{enrollment.status}</span>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>Progress</span>
                      <span>{enrollment.progress_percent || 0}%</span>
                    </div>
                    <Progress value={enrollment.progress_percent || 0} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline">
                      <Link to={`/dashboard/talent/courses/${enrollment.course_id}`}>Course Details</Link>
                    </Button>
                    <Button asChild>
                      <Link to={`/dashboard/talent/courses/${enrollment.course_id}`}>Continue</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TalentCoursesPage;
