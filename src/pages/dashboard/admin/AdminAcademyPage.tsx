import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Plus, Pencil, Trash2, Loader2, Video, FileText, ChevronRight, ChevronDown, MoreHorizontal, LayoutGrid, List } from "lucide-react";
import { AdminSectionHeader } from "@/components/admin/AdminPrimitives";
import { adminClassTokens } from "@/components/admin/designTokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// --- Types ---
interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: Lesson[];
  published: boolean;
  coverImage?: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}

// --- Mock Data ---
const MOCK_COURSES: Course[] = [
  {
    id: "c_1",
    title: "SAP BTP Fundamentals",
    description: "Master the basics of SAP Business Technology Platform including Cloud Foundry and Kyma runtime.",
    difficulty: "Beginner",
    duration: "4 weeks",
    published: true,
    lessons: [
      { id: "l_1_1", title: "Introduction to BTP", content: "Welcome to the course...", videoUrl: "https://youtu.be/xyz", order: 1 },
      { id: "l_1_2", title: "Setting up your Global Account", content: "Step 1: Go to...", order: 2 }
    ]
  },
  {
    id: "c_2",
    title: "Advanced ABAP Cloud",
    description: "Modern ABAP development on SAP S/4HANA Cloud.",
    difficulty: "Advanced",
    duration: "6 weeks",
    published: false,
    lessons: [
      { id: "l_2_1", title: "RAP Model Overview", content: "Restful ABAP Programming...", order: 1 }
    ]
  }
];

export default function AdminAcademyPage() {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [loading, setLoading] = useState(false); // No real loading needed for mock
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Dialog States
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const { toast } = useToast();

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const newCourseData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      difficulty: formData.get("difficulty") as "Beginner" | "Intermediate" | "Advanced",
      duration: formData.get("duration") as string,
      published: formData.get("published") === "on",
    };

    if (editingCourse) {
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...newCourseData } : c));
      toast({ title: "Course updated successfully" });
    } else {
      setCourses(prev => [...prev, {
        id: `c_${Date.now()}`,
        lessons: [],
        ...newCourseData
      }]);
      toast({ title: "Course created successfully" });
    }
    setCourseModalOpen(false);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm("Are you sure? This action cannot be undone.")) {
      setCourses(prev => prev.filter(c => c.id !== id));
      toast({ title: "Course deleted" });
    }
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const newLessonData = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      videoUrl: formData.get("videoUrl") as string,
      order: Number(formData.get("order")),
    };

    setCourses(prev => prev.map(c => {
      if (c.id !== selectedCourseId) return c;

      let updatedLessons = [...c.lessons];
      if (editingLesson) {
        updatedLessons = updatedLessons.map(l => l.id === editingLesson.id ? { ...l, ...newLessonData } : l);
      } else {
        updatedLessons.push({ id: `l_${Date.now()}`, ...newLessonData });
      }
      return { ...c, lessons: updatedLessons.sort((a, b) => a.order - b.order) };
    }));

    toast({ title: editingLesson ? "Lesson updated" : "Lesson added" });
    setLessonModalOpen(false);
  };

  const handleDeleteLesson = (courseId: string, lessonId: string) => {
    if (confirm("Delete this lesson?")) {
      setCourses(prev => prev.map(c => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          lessons: c.lessons.filter(l => l.id !== lessonId)
        };
      }));
      toast({ title: "Lesson deleted" });
    }
  };

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Academy CMS"
        description="Manage courses, curriculum, and educational content."
        aside={
          <div className="flex gap-2">
            <div className="border rounded-md flex p-1 bg-muted/20">
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("grid")}><LayoutGrid className="h-4 w-4" /></Button>
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
            </div>
            <Button onClick={() => { setEditingCourse(null); setCourseModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> New Course
            </Button>
          </div>
        }
      />

      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
        {courses.map(course => (
          viewMode === "grid" ? (
            // Grid View Card
            <Card key={course.id} className="overflow-hidden hover:border-primary/50 transition-colors group">
              <div className="h-32 bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                  <GraduationCap className="h-16 w-16" />
                </div>
                <Badge className="absolute top-2 right-2" variant={course.published ? "default" : "secondary"}>
                  {course.published ? "Published" : "Draft"}
                </Badge>
              </div>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg line-clamp-1" title={course.title}>{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1 h-10">{course.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingCourse(course); setCourseModalOpen(true); }}><Pencil className="h-4 w-4 mr-2" /> Edit Details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCourse(course.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Badge variant="outline">{course.difficulty}</Badge>
                  <span>•</span>
                  <span>{course.duration}</span>
                  <span>•</span>
                  <span>{course.lessons.length} lessons</span>
                </div>
                <Button variant="outline" className="w-full" onClick={() => { setSelectedCourseId(course.id); setEditingLesson(null); setLessonModalOpen(true); }}>
                  <Plus className="h-3 w-3 mr-2" /> Add Lesson
                </Button>
              </CardContent>
            </Card>
          ) : (
            // List View Collapsible
            <Collapsible key={course.id} className="border rounded-lg bg-card group">
              <div className="p-4 flex items-start md:items-center justify-between gap-4">
                <CollapsibleTrigger className="flex flex-1 items-center gap-3 hover:underline text-left">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {course.title}
                      {!course.published && <Badge variant="secondary" className="text-[10px] h-5 px-1">Draft</Badge>}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                  </div>
                </CollapsibleTrigger>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground hidden md:inline-block mr-2">{course.lessons.length} lessons</span>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedCourseId(course.id); setEditingLesson(null); setLessonModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1" /> Lesson
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingCourse(course); setCourseModalOpen(true); }}>Edit Course</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCourse(course.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4" /></Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              <CollapsibleContent className="border-t bg-muted/30">
                <div className="p-2 space-y-1">
                  {course.lessons.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">No lessons yet. Add one to get started.</div>}
                  {course.lessons.map(lesson => (
                    <div key={lesson.id} className="flex items-center justify-between p-2 hover:bg-background rounded-md group/lesson transition-colors">
                      <div className="flex items-center gap-3 pl-4">
                        <span className="font-mono text-xs text-muted-foreground w-6">#{lesson.order}</span>
                        {lesson.videoUrl ? <Video className="h-4 w-4 text-blue-500" /> : <FileText className="h-4 w-4 text-orange-500" />}
                        <span className="text-sm font-medium">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedCourseId(course.id); setEditingLesson(lesson); setLessonModalOpen(true); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteLesson(course.id, lesson.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        ))}
      </div>

      {/* Course Modal */}
      <Dialog open={courseModalOpen} onOpenChange={setCourseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCourse} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" defaultValue={editingCourse?.title} required placeholder="e.g. SAP Fiori Fundamentals" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" defaultValue={editingCourse?.description} required placeholder="What will students learn?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <select name="difficulty" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={editingCourse?.difficulty || "Beginner"}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input name="duration" defaultValue={editingCourse?.duration} placeholder="e.g. 4 weeks" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="published" id="published" className="h-4 w-4" defaultChecked={editingCourse?.published} />
              <Label htmlFor="published">Publish immediately</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCourseModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Course</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Modal */}
      <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveLesson} className="space-y-4 pt-4">
            <div className="flex gap-4">
              <div className="w-24 space-y-2">
                <Label>Order</Label>
                <Input name="order" type="number" defaultValue={editingLesson?.order ?? (selectedCourseId ? (courses.find(c => c.id === selectedCourseId)?.lessons.length || 0) + 1 : 1)} required />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Title</Label>
                <Input name="title" defaultValue={editingLesson?.title} required placeholder="Lesson Topic" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content (Markdown)</Label>
              <Textarea name="content" defaultValue={editingLesson?.content} className="font-mono text-xs" rows={6} placeholder="## Introduction..." />
            </div>

            <div className="space-y-2">
              <Label>Video Embed URL (Optional)</Label>
              <Input name="videoUrl" defaultValue={editingLesson?.videoUrl} placeholder="https://youtube.com/embed/..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLessonModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Lesson</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
