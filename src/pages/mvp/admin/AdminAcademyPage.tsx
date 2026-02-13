import { useEffect, useState } from "react";
import { mvp } from "@/integrations/supabase/mvp";

export default function AdminAcademyPage() {
  const [courses, setCourses] = useState(0);
  const [enrollments, setEnrollments] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [courseRows, enrollmentRows] = await Promise.all([mvp.listCourses(), mvp.listAllEnrollments()]);
      setCourses(courseRows.length);
      setEnrollments(enrollmentRows.length);
    };

    load().catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Academy</h2>
      <p className="text-sm text-muted-foreground">Catalog, learning paths, cohorts, assessments and certifications.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Courses</p>
          <p className="text-2xl font-semibold">{courses}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Enrollments</p>
          <p className="text-2xl font-semibold">{enrollments}</p>
        </div>
      </div>
    </div>
  );
}
