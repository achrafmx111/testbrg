import { useEffect, useState } from "react";
import { mvp } from "@/integrations/supabase/mvp";

export default function TalentCoachingPage() {
  const [interviewsCount, setInterviewsCount] = useState(0);

  useEffect(() => {
    mvp
      .listInterviews()
      .then((rows) => setInterviewsCount(rows.length))
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Coaching</h2>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Upcoming interviews and mock sessions</p>
        <p className="text-2xl font-semibold">{interviewsCount}</p>
      </div>
    </div>
  );
}
