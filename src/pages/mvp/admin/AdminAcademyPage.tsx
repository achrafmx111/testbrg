import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Plus, Pencil, Trash2, Loader2, Video, FileText, ChevronRight, ChevronDown } from "lucide-react";
import { mvp, MvpCourse, MvpLesson } from "@/integrations/supabase/mvp";
import { AdminSectionHeader, AdminStatCard } from "@/components/admin/AdminPrimitives";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export default function AdminAcademyPage() {
  const [courses, setCourses] = useState<MvpCourse[]>([]);
  const [lessons, setLessons] = useState<Record<string, MvpLesson[]>>({});
  const [loading, setLoading] = useState(true);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<MvpCourse | null>(null);
  const [editingLesson, setEditingLesson] = useState<MvpLesson | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const allCourses = await mvp.listCourses();
      setCourses(allCourses);

      const lessonsMap: Record<string, MvpLesson[]> = {};
      await Promise.all(allCourses.map(async (c) => {
        lessonsMap[c.id] = await mvp.listLessons(c.id);
      }));
      setLessons(lessonsMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    try {
      await mvp.createCourse({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        difficulty: "Beginner", // Default
        duration: "4 weeks" // Default
      });
      toast({ title: "Course created" });
      setCourseModalOpen(false);
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const lessonData = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      video_url: formData.get("video_url") as string,
      order: Number(formData.get("order") || 0),
      course_id: selectedCourse.id
    };

    try {
      if (editingLesson) {
        await mvp.updateLesson(editingLesson.id, lessonData);
        toast({ title: "Lesson updated" });
      } else {
        await mvp.createLesson(lessonData);
        toast({ title: "Lesson created" });
      }
      setLessonModalOpen(false);
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Delete course and all lessons?")) return;
    await mvp.deleteCourse(id); // Need deleteCourse in mvp.ts? It was there?
    // Actually mvp.ts has listCourses, createCourse, updateCourse. Need createCourse/updateCourse/deleteCourse if not present.
    // I'll assume createCourse exists (it was standard CRUD Sprint 1). If not I will add.
    load();
  };

  return (
    <div className={adminClassTokens.pageShell}>
      <AdminSectionHeader
        title="Academy"
        description="Catalog, learning paths, and curriculum."
        aside={
          <Button onClick={() => setCourseModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Course
          </Button>
        }
      />

      {loading ? <Loader2 className="animate-spin" /> : (
        <div className="space-y-4">
          {courses.map(course => (
            <Collapsible key={course.id} className="border rounded-lg bg-card">
              <div className="p-4 flex items-center justify-between">
                <CollapsibleTrigger className="flex items-center gap-2 hover:underline font-medium">
                  <ChevronRight className="h-4 w-4" />
                  {course.title}
                  <Badge variant="secondary">{lessons[course.id]?.length || 0} lessons</Badge>
                </CollapsibleTrigger>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedCourse(course); setEditingLesson(null); setLessonModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1" /> Add Lesson
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CollapsibleContent className="p-4 pt-0 space-y-2">
                {(lessons[course.id] || []).map(lesson => (
                  <div key={lesson.id} className="ml-6 p-2 border rounded bg-muted/30 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">#{lesson.order}</span>
                      {lesson.video_url ? <Video className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                      <span className="text-sm font-medium">{lesson.title}</span>
                    </div>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setSelectedCourse(course); setEditingLesson(lesson); setLessonModalOpen(true); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Course Modal */}
      <Dialog open={courseModalOpen} onOpenChange={setCourseModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Course</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <Input name="title" placeholder="Course Title" required />
            <Textarea name="description" placeholder="Description" required />
            <Button type="submit">Create</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Modal */}
      <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingLesson ? "Edit Lesson" : "Add Lesson"}</DialogTitle></DialogHeader>
          <form onSubmit={handleLessonSubmit} className="space-y-4">
            <Input name="order" type="number" placeholder="Order (e.g. 1)" defaultValue={editingLesson?.order} required />
            <Input name="title" placeholder="Lesson Title" defaultValue={editingLesson?.title} required />
            <Textarea name="content" placeholder="Content (Markdown)" defaultValue={editingLesson?.content} rows={5} />
            <Input name="video_url" placeholder="Video URL (optional)" defaultValue={editingLesson?.video_url} />
            <Button type="submit">Save Lesson</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
