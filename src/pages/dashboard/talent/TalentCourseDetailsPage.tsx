import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { CourseModule } from "@/types";
import { useTalentLearningData } from "./useTalentLearningData";

const TalentCourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { loading, enrollments } = useTalentLearningData();
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);

  const enrollment = useMemo(() => enrollments.find((item) => item.course_id === courseId), [enrollments, courseId]);

  useEffect(() => {
    const fetchModules = async () => {
      if (!courseId) {
        setModulesLoading(false);
        return;
      }

      try {
        const { data, error } = await (supabase as any)
          .schema("mvp")
          .from("lessons")
          .select("*")
          .eq("course_id", courseId)
          .order("order", { ascending: true });

        if (error) {
          const missingTable = error.code === "PGRST205" || String(error.message || "").includes("lessons");
          if (!missingTable) {
            throw error;
          }
        }

        const mappedModules = (data as any[] | null | undefined)?.map((module) => ({ ...module, order_index: module.order })) ?? [];
        setModules(mappedModules as CourseModule[]);
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
    return (
      <div className="flex h-56 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <Card className="border-border/60">
        <CardContent className="space-y-3 p-5">
          <p className="text-sm text-muted-foreground">Course details unavailable. This course is not part of your current enrollments.</p>
          <Button asChild variant="outline">
            <Link to="/talent/learning">Go to my courses</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const course = enrollment.courses;
  const progress = enrollment.progress_percent || 0;
  const completedModules = modules.length > 0 ? Math.floor((progress / 100) * modules.length) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Course Room
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{course?.title || "Course details"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{course?.description || "No description available."}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/talent/learning")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to my courses
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Progress" value={`${progress}%`} helper="Current completion" />
        <StatCard label="Total modules" value={`${modules.length}`} helper="Structured lessons" />
        <StatCard label="Completed" value={`${completedModules}`} helper="Modules done" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Course progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-4 w-4 text-primary" /> {course?.duration_hours || 0}h total
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" /> {enrollment.status}
              </span>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Completion</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
              Keep momentum by finishing the next pending module this week.
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Completion ratio</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{modules.length ? `${completedModules}/${modules.length}` : "0/0"}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium text-foreground">{enrollment.status}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Course modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {modulesLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading modules...
            </div>
          ) : modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No modules found for this course yet.</p>
          ) : (
            modules.map((module, index) => {
              const isDone = index < completedModules;
              return (
                <button
                  key={module.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-card p-3 text-left transition-colors hover:bg-muted/20"
                  onClick={() => setActiveModule(module)}
                >
                  <p className="text-sm font-semibold text-foreground">{module.order_index}. {module.title}</p>
                  <Badge variant={isDone ? "default" : "secondary"}>{isDone ? "Done" : "Pending"}</Badge>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={!!activeModule} onOpenChange={() => setActiveModule(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          {activeModule && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">{activeModule.title}</DialogTitle>
                <DialogDescription className="text-base">Module {activeModule.order_index}</DialogDescription>
              </DialogHeader>

              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-black">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="z-10 flex flex-col items-center gap-4">
                  <div className="cursor-pointer rounded-full border border-white/20 bg-white/10 p-4 backdrop-blur-md transition-transform hover:scale-105">
                    <div className="ml-1 h-0 w-0 border-b-[10px] border-l-[18px] border-t-[10px] border-b-transparent border-l-white border-t-transparent" />
                  </div>
                  <p className="font-medium tracking-wide text-white">Preview mode</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <h3 className="text-lg font-semibold">Lesson content</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    In this module we cover the core concepts of {activeModule.title}. Watch the lesson and use the exercises to validate understanding.
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Key concept introduction</li>
                    <li>Practical examples</li>
                    <li>Common pitfalls to avoid</li>
                  </ul>
                </div>

                <div className="flex justify-end border-t pt-4">
                  <Button
                    onClick={() => {
                      toast.success("Module marked as complete!");
                      setActiveModule(null);
                    }}
                  >
                    Mark as complete <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

export default TalentCourseDetailsPage;
