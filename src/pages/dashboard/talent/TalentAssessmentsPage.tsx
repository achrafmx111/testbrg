import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, Sparkles, Trophy, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpAssessment, MvpEnrollment, MvpSubmission } from "@/integrations/supabase/mvp";
import { useToast } from "@/hooks/use-toast";

export default function TalentAssessmentsPage() {
  const [assessments, setAssessments] = useState<MvpAssessment[]>([]);
  const [submissions, setSubmissions] = useState<MvpSubmission[]>([]);
  const [enrollments, setEnrollments] = useState<MvpEnrollment[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<MvpAssessment | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      const [talentEnrollments, talentSubmissions, allAssessments] = await Promise.all([
        mvp.listTalentEnrollments(user.id),
        mvp.listSubmissions(user.id),
        mvp.listAssessments(),
      ]);

      const enrolledCourseIds = new Set(talentEnrollments.map((item) => item.course_id));
      setEnrollments(talentEnrollments);
      setSubmissions(talentSubmissions);
      setAssessments(allAssessments.filter((assessment) => enrolledCourseIds.has(assessment.course_id)));
    } catch (error: any) {
      console.error("Error loading assessments data:", error);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Failed to load assessments. The service might be temporarily unavailable.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const passedAssessmentIds = useMemo(() => new Set(submissions.filter((item) => item.passed).map((item) => item.assessment_id)), [submissions]);
  const pendingAssessments = useMemo(() => assessments.filter((assessment) => !passedAssessmentIds.has(assessment.id)), [assessments, passedAssessmentIds]);

  const stats = useMemo(
    () => ({
      total: assessments.length,
      passed: submissions.filter((submission) => submission.passed).length,
      pending: pendingAssessments.length,
      avgScore: submissions.length === 0 ? 0 : Math.round(submissions.reduce((sum, item) => sum + item.score, 0) / submissions.length),
    }),
    [assessments.length, pendingAssessments.length, submissions],
  );

  const submitAssessment = async () => {
    if (!activeAssessment || !userId) return;
    setSubmitting(true);
    try {
      const score = Math.floor(Math.random() * 30) + 70;
      const passed = score >= activeAssessment.passing_score;
      await mvp.createSubmission({
        assessment_id: activeAssessment.id,
        talent_id: userId,
        score,
        passed,
        answers: { q1: "Mock answer", q2: "Mock answer" },
      });
      toast({
        title: passed ? "Assessment passed" : "Assessment submitted",
        description: `Score ${score}%` + (passed ? " - excellent work." : " - keep practicing and retry."),
      });
      setActiveAssessment(null);
      await load();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission failed", description: error?.message ?? "Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-accent/10 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-foreground">
              <Sparkles className="h-3 w-3" />
              Validation Track
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Assessments Lab</h2>
            <p className="mt-1 text-sm text-muted-foreground">Validate your learning progress and increase your readiness score.</p>
          </div>
          <Badge variant="secondary">{enrollments.length} enrolled courses</Badge>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assessments" value={`${stats.total}`} helper="Available in your courses" icon={<FileText className="h-4 w-4 text-primary" />} />
        <StatCard label="Passed" value={`${stats.passed}`} helper="Completed successfully" icon={<CheckCircle2 className="h-4 w-4 text-primary" />} />
        <StatCard label="Pending" value={`${stats.pending}`} helper="Ready to attempt" icon={<AlertCircle className="h-4 w-4 text-primary" />} />
        <StatCard label="Average" value={`${stats.avgScore}%`} helper="Across submissions" icon={<Trophy className="h-4 w-4 text-primary" />} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Pending Assessments</CardTitle>
            <CardDescription>Complete these to unlock more opportunities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingAssessments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center text-sm text-muted-foreground">
                No pending assessments right now.
              </div>
            ) : (
              pendingAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{assessment.title}</p>
                    <p className="text-xs text-muted-foreground">Pass mark: {assessment.passing_score}%</p>
                  </div>
                  <Button size="sm" onClick={() => setActiveAssessment(assessment)}>Take now</Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Submission History</CardTitle>
            <CardDescription>Recent attempts and outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {submissions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center text-sm text-muted-foreground">
                No submissions yet.
              </div>
            ) : (
              submissions.map((submission) => {
                const assessment = assessments.find((item) => item.id === submission.assessment_id);
                return (
                  <div key={submission.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {submission.passed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <div>
                        <p className="text-sm font-medium text-foreground">{assessment?.title || "Assessment"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(submission.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${submission.passed ? "text-primary" : "text-destructive"}`}>{submission.score}%</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={Boolean(activeAssessment)} onOpenChange={(open) => !open && setActiveAssessment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Assessment: {activeAssessment?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm text-muted-foreground">
            <p>This is a simulated assessment preview for the design phase.</p>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">Question 1: Explain the purpose of React `useEffect` with practical examples.</div>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">Question 2: Describe how Supabase RLS secures tenant data in SaaS applications.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveAssessment(null)} disabled={submitting}>Cancel</Button>
            <Button onClick={submitAssessment} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Answers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, helper, icon }: { label: string; value: string; helper: string; icon: ReactNode }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">{icon}</span>
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
