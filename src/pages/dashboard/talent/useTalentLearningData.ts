import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Course, CourseEnrollment, Profile } from "@/types";

export type EnrollmentWithCourse = CourseEnrollment & { courses?: Course | null };

export const useTalentLearningData = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        setEnrollments([]);
        return;
      }

      const [{ data: profileData }, { data: enrollmentsData, error: enrollmentsError }] = await Promise.all([
        (supabase as any).from("profiles").select("*").eq("id", user.id).single(),
        (supabase as any)
          .from("course_enrollments")
          .select("*, courses(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setProfile((profileData as Profile) || null);

      if (enrollmentsError) {
        const missingTable =
          enrollmentsError.code === "PGRST205" ||
          String(enrollmentsError.message || "").includes("course_enrollments");
        if (!missingTable) {
          throw enrollmentsError;
        }
        setEnrollments([]);
      } else {
        setEnrollments((enrollmentsData as EnrollmentWithCourse[]) || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter((e) => e.status === "completed").length;
    const avgProgress =
      totalCourses > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / totalCourses)
        : 0;
    const totalHours = enrollments.reduce(
      (sum, e) => sum + Math.round(((e.courses?.duration_hours || 0) * (e.progress_percent || 0)) / 100),
      0,
    );

    return {
      totalCourses,
      completedCourses,
      avgProgress,
      totalHours,
      remainingCourses: Math.max(totalCourses - completedCourses, 0),
    };
  }, [enrollments]);

  return {
    loading,
    profile,
    enrollments,
    stats,
    refetch: fetchData,
  };
};
