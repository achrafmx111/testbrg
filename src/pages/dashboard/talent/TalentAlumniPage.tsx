import { ReactNode } from "react";
import { ArrowUpRight, Briefcase, Globe2, Handshake, Sparkles, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const alumniHighlights = [
  {
    id: "alumni-1",
    name: "Nadia El Idrissi",
    role: "SAP FI Consultant @ Munich",
    impact: "Placed in 11 weeks",
    quote: "Mock interviews and alumni referrals were the fastest path to my first EU contract.",
  },
  {
    id: "alumni-2",
    name: "Youssef Ait Lahcen",
    role: "ABAP Developer @ Berlin",
    impact: "Salary +38%",
    quote: "The alumni network gave me real hiring insights and direct recruiter warm intros.",
  },
  {
    id: "alumni-3",
    name: "Salma Bensouda",
    role: "SAP MM Specialist @ Hamburg",
    impact: "2 offers received",
    quote: "Peer reviews and referral loops helped me close offers with more confidence.",
  },
];

const referralBoards = [
  { title: "German SAP Ecosystem", companies: 16, openings: 42, trend: "+8 this week" },
  { title: "DACH Consulting Partners", companies: 9, openings: 23, trend: "+3 this week" },
  { title: "Remote-friendly ERP Teams", companies: 12, openings: 18, trend: "+5 this week" },
];

const mentorCircles = [
  { title: "Interview Mastery Circle", mentors: 5, seats: "12 seats left" },
  { title: "Visa & Relocation Circle", mentors: 3, seats: "7 seats left" },
  { title: "Salary Negotiation Circle", mentors: 4, seats: "9 seats left" },
];

export default function TalentAlumniPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Alumni Network
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Placements, referrals, and mentor circles</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Connect with placed talents, unlock referral boards, and join focused mentor circles to accelerate your hiring outcomes.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Active alumni" value="184" icon={<Users className="h-3.5 w-3.5" />} />
            <Stat label="Live referrals" value="83" icon={<Handshake className="h-3.5 w-3.5" />} />
            <Stat label="EU markets" value="7" icon={<Globe2 className="h-3.5 w-3.5" />} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Featured alumni success stories</CardTitle>
            <CardDescription>Real outcomes from recent placement cycles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alumniHighlights.map((item) => (
              <div key={item.id} className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                  <Badge className="bg-primary/15 text-primary hover:bg-primary/15">{item.impact}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">"{item.quote}"</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mentor circles</CardTitle>
            <CardDescription>Small groups with weekly office hours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mentorCircles.map((circle) => (
              <div key={circle.title} className="rounded-lg border border-border/50 px-3 py-2.5">
                <p className="text-sm font-medium text-foreground">{circle.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{circle.mentors} mentors - {circle.seats}</p>
              </div>
            ))}
            <Button className="mt-1 w-full">
              Join next circle
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {referralBoards.map((board) => (
          <Card key={board.title} className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{board.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4 text-primary" /> {board.openings} open roles
              </p>
              <p className="text-xs text-muted-foreground">{board.companies} hiring companies</p>
              <Badge variant="outline" className="text-[11px]">{board.trend}</Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-border/60 bg-gradient-to-r from-secondary/15 via-card to-accent/10">
        <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Star className="h-4 w-4 text-amber-500" /> Weekly Alumni Drop
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Every Friday: hot roles, referral windows, and relocation tips from placed talents.</p>
          </div>
          <Button variant="outline">Subscribe to weekly drop</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-center">
      <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">{icon}{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
