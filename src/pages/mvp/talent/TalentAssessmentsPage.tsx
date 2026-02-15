import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mvp, MvpAssessment, MvpSubmission, MvpEnrollment } from "@/integrations/supabase/mvp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

export default function TalentAssessmentsPage() {
  const [assessments, setAssessments] = useState<MvpAssessment[]>([]);
  const [submissions, setSubmissions] = useState<MvpSubmission[]>([]);
  const [enrollments, setEnrollments] = useState<MvpEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<MvpAssessment | null>(null);
  const [takingOpen, setTakingOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [enr, subs, allAssessments] = await Promise.all([
        mvp.listTalentEnrollments(user.id),
        mvp.listSubmissions(user.id),
        mvp.listAssessments()
      ]);

      setEnrollments(enr);
      setSubmissions(subs);

      // Filter assessments for enrolled courses only
      const enrolledCourseIds = new Set(enr.map(e => e.course_id));
      const relevantAssessments = allAssessments.filter(a => enrolledCourseIds.has(a.course_id));
      setAssessments(relevantAssessments);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleTakeAssessment = (assessment: MvpAssessment) => {
    setActiveAssessment(assessment);
    setTakingOpen(true);
  };

  const submitAssessment = async () => {
    if (!activeAssessment || !userId) return;
    try {
      // Mock score simulation
      const score = Math.floor(Math.random() * 30) + 70; // 70-100
      const passed = score >= activeAssessment.passing_score;

      await mvp.createSubmission({
        assessment_id: activeAssessment.id,
        talent_id: userId,
        score,
        passed,
        answers: { "mock": "answer" }
      });

      toast({
        title: passed ? "Assessment Passed!" : "Assessment Completed",
        description: `You scored ${score}%. ${passed ? "Great job!" : "You can try again."}`,
        variant: passed ? "default" : "destructive"
      });
      setTakingOpen(false);
      load();

      // Update readiness score? (Ideally backend trigger or edge function does this)
    } catch (err: any) {
      toast({ variant: "destructive", title: "Submission failed", description: err.message });
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  const passedAssessmentIds = new Set(submissions.filter(s => s.passed).map(s => s.assessment_id));
  const pendingAssessments = assessments.filter(a => !passedAssessmentIds.has(a.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <p className="text-muted-foreground mt-1">Validate your skills and earn certifications to boost your readiness score.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Pending Assessments */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" /> Pending Assessments
          </h2>
          {pendingAssessments.length === 0 ? (
            <div className="p-6 border border-dashed rounded-lg text-center bg-muted/20">
              <p className="text-muted-foreground text-sm">No pending assessments. Enroll in more courses!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAssessments.map(assessment => (
                <Card key={assessment.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{assessment.title}</p>
                      <p className="text-xs text-muted-foreground">Passing Score: {assessment.passing_score}%</p>
                    </div>
                    <Button size="sm" onClick={() => handleTakeAssessment(assessment)}>Take Assessment</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Assessment History */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> History
          </h2>
          {submissions.length === 0 ? (
            <div className="p-6 border border-dashed rounded-lg text-center bg-muted/20">
              <p className="text-muted-foreground text-sm">No assessment history yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map(sub => {
                const assessment = assessments.find(a => a.id === sub.assessment_id);
                return (
                  <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      {sub.passed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />}
                      <div>
                        <p className="font-medium text-sm">{assessment?.title || "Unknown Assessment"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${sub.passed ? "text-green-600" : "text-destructive"}`}>{sub.score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <Dialog open={takingOpen} onOpenChange={setTakingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Assessment: {activeAssessment?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              This is a simulated assessment. In a real environment, you would answer multiple-choice questions here.
            </p>
            <div className="p-4 bg-muted/30 rounded text-sm italic border-l-2 border-primary">
              "Question 1: What is the primary purpose of React useEffect?"
            </div>
            <div className="p-4 bg-muted/30 rounded text-sm italic border-l-2 border-primary">
              "Question 2: Explain Supabase RLS policies."
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTakingOpen(false)}>Cancel</Button>
            <Button onClick={submitAssessment}>Submit Answers</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
