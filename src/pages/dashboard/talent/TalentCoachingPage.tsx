import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, CheckCircle2, ChevronRight, Clock3, MessageSquare, Sparkles, Star, Video } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Coach = {
  id: number;
  name: string;
  role: string;
  company: string;
  rating: number;
  reviews: number;
  skills: string[];
  image: string;
  available: boolean;
};

const COACHES: Coach[] = [
  {
    id: 1,
    name: "Dr. Sarah Weber",
    role: "Senior SAP Career Coach",
    company: "Ex-SAP HR Director",
    rating: 4.9,
    reviews: 124,
    skills: ["Interview Prep", "CV Review", "Salary Negotiation"],
    image: "https://i.pravatar.cc/150?u=sarah",
    available: true,
  },
  {
    id: 2,
    name: "Michael Schmidt",
    role: "Technical Interview Coach",
    company: "Senior Arch @ Allianz",
    rating: 4.8,
    reviews: 89,
    skills: ["Technical Mock", "System Design", "ABAP Code Review"],
    image: "https://i.pravatar.cc/150?u=michael",
    available: false,
  },
  {
    id: 3,
    name: "Elena Kowalski",
    role: "Relocation Specialist",
    company: "Global Mobility Expert",
    rating: 5.0,
    reviews: 210,
    skills: ["Visa Strategy", "Cultural Fit", "Housing Market"],
    image: "https://i.pravatar.cc/150?u=elena",
    available: true,
  },
];

export default function TalentCoachingPage() {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  const stats = useMemo(() => {
    const available = COACHES.filter((coach) => coach.available).length;
    const avgRating = (COACHES.reduce((sum, coach) => sum + coach.rating, 0) / COACHES.length).toFixed(1);
    return { available, avgRating, total: COACHES.length };
  }, []);

  const handleBookClick = (coach: Coach) => {
    setSelectedCoach(coach);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = () => {
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }

    setIsBookingOpen(false);
    toast.success(`Session booked with ${selectedCoach?.name}`, {
      description: `Scheduled for ${date} at ${time}. Calendar invite sent.`,
    });

    setDate("");
    setTime("");
    setNote("");
  };

  const handleWaitlist = (coachName: string) => {
    toast.success(`Added to waitlist for ${coachName}`, {
      description: "We'll notify you when a slot opens up.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Coaching Network
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Career coaching</h1>
            <p className="mt-1 text-sm text-muted-foreground">Book 1:1 sessions with industry experts to accelerate your placement outcomes.</p>
          </div>
          <Button className="shadow-lg shadow-primary/20" onClick={() => toast.info("Matching you with a coach...")}> 
            <Star className="mr-2 h-4 w-4 fill-current" /> Get matched
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MiniStat label="Experts" value={`${stats.total}`} helper="Verified mentors" />
        <MiniStat label="Available now" value={`${stats.available}`} helper="Ready this week" />
        <MiniStat label="Average rating" value={stats.avgRating} helper="Across all sessions" />
      </section>

      <Card className="border-l-4 border-l-primary bg-primary/5">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Next session: Mock interview</h3>
              <p className="text-sm text-muted-foreground">Tomorrow, 10:00 AM - with Dr. Sarah Weber</p>
            </div>
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <Button variant="outline" className="bg-white" onClick={() => toast.info("Rescheduling not available < 24h")}>Reschedule</Button>
            <Button onClick={() => toast.success("Joining meeting...")}> 
              <Video className="mr-2 h-4 w-4" /> Join link
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {COACHES.map((coach) => (
          <Card key={coach.id} className="group border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="mb-3 flex items-start justify-between">
                <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                  <AvatarImage src={coach.image} />
                  <AvatarFallback>{coach.name[0]}</AvatarFallback>
                </Avatar>
                {coach.available ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Available</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-100">Booked out</Badge>
                )}
              </div>
              <CardTitle className="text-xl">{coach.name}</CardTitle>
              <CardDescription className="font-medium text-primary">{coach.role}</CardDescription>
              <p className="text-xs text-muted-foreground">{coach.company}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-bold">{coach.rating}</span>
                <span className="text-muted-foreground">({coach.reviews} reviews)</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {coach.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-slate-50">{skill}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              {coach.available ? (
                <Button className="w-full" onClick={() => handleBookClick(coach)}>
                  Book session <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button variant="secondary" className="w-full" onClick={() => handleWaitlist(coach.name)}>
                  Join waitlist
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 md:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock3 className="h-4 w-4 text-primary" /> Typical session length
          </p>
          <p className="text-sm text-muted-foreground">45 to 60 minutes with actionable feedback and next-step checklist.</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessageSquare className="h-4 w-4 text-primary" /> Preparation format
          </p>
          <p className="text-sm text-muted-foreground">Share your target role and blocker notes so the coach tailors your session.</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Post-session output
          </p>
          <p className="text-sm text-muted-foreground">You receive clear improvement points and weekly follow-up checkpoints.</p>
        </div>
      </section>

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Book a session</DialogTitle>
            <DialogDescription>Schedule a 1:1 coaching slot with {selectedCoach?.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Topic or notes (optional)</Label>
              <Textarea id="note" placeholder="What would you like to focus on?" value={note} onChange={(event) => setNote(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmBooking}>Confirm booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiniStat({ label, value, helper }: { label: string; value: string; helper: string }) {
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
