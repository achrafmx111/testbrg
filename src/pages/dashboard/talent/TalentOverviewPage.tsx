import { BookOpen, Clock3, Target, Trophy, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTalentLearningData } from "./useTalentLearningData";

const TalentOverviewPage = () => {
  const { loading, profile, enrollments, stats } = useTalentLearningData();

  if (loading) {
    return <div className="text-sm text-slate-500">Loading your learning dashboard...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Welcome back</p>
        <h1 className="text-2xl font-black tracking-tight text-slate-800">
          {profile?.first_name || "Talent"}, keep pushing your learning goals.
        </h1>
        <p className="mt-1 text-sm text-slate-500">Your learner dashboard shows progress, remaining work, and your active courses only.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Hours Spent", value: `${stats.totalHours}h`, icon: Clock3 },
          { label: "Average Progress", value: `${stats.avgProgress}%`, icon: Target },
          { label: "Courses Completed", value: `${stats.completedCourses}`, icon: Trophy },
          { label: "Courses Remaining", value: `${stats.remainingCourses}`, icon: BookOpen },
        ].map((item) => (
          <Card key={item.label} className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-black text-slate-800">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Course Progress Overview</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/talent/courses">Open My Courses</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrollments.length === 0 ? (
              <p className="text-sm text-slate-500">You are not enrolled in any course yet.</p>
            ) : (
              enrollments.slice(0, 5).map((enrollment) => (
                <div key={enrollment.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">{enrollment.courses?.title || "Course"}</p>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{enrollment.progress_percent || 0}%</Badge>
                  </div>
                  <Progress value={enrollment.progress_percent || 0} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Remaining Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrollments.slice(0, 4).map((enrollment) => {
              const remaining = Math.max(100 - (enrollment.progress_percent || 0), 0);
              return (
                <div key={`remain-${enrollment.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{enrollment.courses?.title || "Course"}</p>
                    <p className="text-xs text-slate-500">{remaining}% remaining</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              );
            })}
            {enrollments.length === 0 ? <p className="text-sm text-slate-500">No active items.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Course You Are Taking</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.slice(0, 6).map((enrollment) => (
                <TableRow key={`tbl-${enrollment.id}`}>
                  <TableCell className="font-medium">{enrollment.courses?.title || "Course"}</TableCell>
                  <TableCell>{enrollment.courses?.duration_hours || 0}h</TableCell>
                  <TableCell>{enrollment.progress_percent || 0}%</TableCell>
                  <TableCell>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{enrollment.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TalentOverviewPage;
