import { useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Compass, Rocket, Sparkles } from "lucide-react";
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
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="h-10 w-56 rounded-lg bg-muted/50" />
        <div className="h-24 rounded-xl bg-muted/40" />
        <div className="h-24 rounded-xl bg-muted/40" />
      </div>
    );
  }

  if (targetCourseId) {
    return <Navigate to={`/talent/learning/${targetCourseId}`} replace />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
          <Sparkles className="mr-1 h-3.5 w-3.5" /> Learning Navigation
        </Badge>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">No course opened yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your next learning route and jump directly into a detailed course view.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60">
          <CardContent className="space-y-3 p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <Compass className="h-4 w-4 text-primary" /> Resume your journey
            </p>
            <p className="text-sm text-muted-foreground">
              Browse your active courses, continue where you left off, and unlock next modules.
            </p>
            <Button asChild className="w-full">
              <Link to="/talent/learning">
                Go to my courses
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="space-y-3 p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <Rocket className="h-4 w-4 text-primary" /> Fast-track tips
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>- Complete one module daily for streak bonus</li>
              <li>- Finish checkpoints before mock interviews</li>
              <li>- Keep profile skills synced with course progress</li>
            </ul>
            <Button variant="outline" asChild className="w-full">
              <Link to="/talent/roadmap">Open learning roadmap</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TalentCourseDetailsEntryPage;
