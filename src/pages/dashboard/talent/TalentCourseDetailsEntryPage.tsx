import { useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTalentLearningData } from "./useTalentLearningData";

const TalentCourseDetailsEntryPage = () => {
  const { loading, enrollments } = useTalentLearningData();

  const targetCourseId = useMemo(() => {
    const lastCourseId = window.localStorage.getItem("lastTalentCourseId");
    if (lastCourseId && enrollments.some((e) => e.course_id === lastCourseId)) {
      return lastCourseId;
    }
    return enrollments[0]?.course_id;
  }, [enrollments]);

  if (loading) {
    return <div className="text-sm text-slate-500">Loading course details...</div>;
  }

  if (targetCourseId) {
    return <Navigate to={`/dashboard/talent/courses/${targetCourseId}`} replace />;
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="space-y-3 p-5">
        <p className="text-sm text-slate-600">No course details available yet. Enroll in a course first.</p>
        <Button asChild variant="outline"><Link to="/dashboard/talent/courses">Go to My Courses</Link></Button>
      </CardContent>
    </Card>
  );
};

export default TalentCourseDetailsEntryPage;
