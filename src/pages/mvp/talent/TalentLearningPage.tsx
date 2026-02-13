import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpCourse, MvpEnrollment } from "@/integrations/supabase/mvp";

export default function TalentLearningPage() {
  const [enrollments, setEnrollments] = useState<MvpEnrollment[]>([]);
  const [courses, setCourses] = useState<MvpCourse[]>([]);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [enr, crs] = await Promise.all([mvp.listTalentEnrollments(user.id), mvp.listCourses()]);
      setEnrollments(enr);
      setCourses(crs);
    };

    load().catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">My Learning</h2>
      {enrollments.map((enrollment) => {
        const course = courses.find((c) => c.id === enrollment.course_id);
        return (
          <div key={enrollment.id} className="rounded-lg border p-3">
            <p className="font-medium">{course?.title ?? enrollment.course_id}</p>
            <p className="text-sm text-muted-foreground">Status: {enrollment.status}</p>
            <p className="text-sm">Progress: {enrollment.progress}%</p>
          </div>
        );
      })}
    </div>
  );
}
