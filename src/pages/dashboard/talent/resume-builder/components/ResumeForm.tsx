
import { useState } from "react";
import { Plus, Trash2, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { aiResumeService, ResumeData, ExperienceItem, EducationItem } from "@/services/ai-resume.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ResumeFormProps {
    data: ResumeData;
    updateData: (section: keyof ResumeData, value: any) => void;
}

export function ResumeForm({ data, updateData }: ResumeFormProps) {
    const [activeSection, setActiveSection] = useState<string | null>("personal");
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleAiOptimize = async (field: string, content: string) => {
        if (!content) return;
        setIsAiLoading(true);
        try {
            const optimized = await aiResumeService.optimizeContent(content);
            // specific logic to update the right field would be needed here, 
            // for now just showing toast with result
            toast.success("AI Suggestion Ready", {
                description: optimized,
                action: {
                    label: "Copy",
                    onClick: () => navigator.clipboard.writeText(optimized)
                }
            });
        } catch (e) {
            toast.error("AI Service Error");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handlePersonalInfoChange = (field: string, value: string) => {
        updateData("personalInfo", { ...data.personalInfo, [field]: value });
    };

    const addExperience = () => {
        const newItem: ExperienceItem = {
            id: crypto.randomUUID(),
            role: "",
            company: "",
            startDate: "",
            endDate: "",
            description: ""
        };
        updateData("experience", [...data.experience, newItem]);
    };

    const updateExperience = (id: string, field: keyof ExperienceItem, value: string) => {
        const updated = data.experience.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        updateData("experience", updated);
    };

    const removeExperience = (id: string) => {
        updateData("experience", data.experience.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* Personal Info */}
            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Full Name</Label>
                            <Input
                                value={data.personalInfo.fullName}
                                onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Job Title</Label>
                            <Input
                                placeholder="Software Engineer"
                                // Assuming we might want to store this in personal info too or just use it for summary generation
                                onChange={(e) => {/* Handle logic */ }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input
                                value={data.personalInfo.email}
                                onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Phone</Label>
                            <Input
                                value={data.personalInfo.phone}
                                onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                                placeholder="+1 234 567 890"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Professional Summary</Label>
                        <div className="relative">
                            <Textarea
                                className="min-h-[100px] pr-12"
                                value={data.personalInfo.summary}
                                onChange={(e) => handlePersonalInfoChange("summary", e.target.value)}
                                placeholder="Briefly describe your professional background..."
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-2 top-2 h-8 w-8 text-primary hover:bg-primary/10"
                                onClick={() => handleAiOptimize("summary", data.personalInfo.summary)}
                                disabled={isAiLoading}
                                title="Enhance with AI"
                            >
                                {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Experience Section */}
            <Card>
                <CardHeader className="py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Experience</CardTitle>
                    <Button size="sm" variant="outline" onClick={addExperience}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.experience.map((exp, index) => (
                        <div key={exp.id} className="border rounded-lg p-4 bg-muted/20">
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="grid gap-2">
                                    <Label>Role</Label>
                                    <Input value={exp.role} onChange={(e) => updateExperience(exp.id, "role", e.target.value)} placeholder="Senior Developer" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Company</Label>
                                    <Input value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} placeholder="Tech Corp" />
                                </div>
                            </div>
                            <div className="grid gap-2 mb-3">
                                <Label>Description (Bullet Points)</Label>
                                <div className="relative">
                                    <Textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                                        placeholder="• Led a team of..."
                                        className="min-h-[80px]"
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-2 top-2 h-6 w-6 text-primary"
                                        onClick={() => handleAiOptimize("exp", exp.description)}
                                    >
                                        <Wand2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive h-auto p-0" onClick={() => removeExperience(exp.id)}>
                                <Trash2 className="h-3 w-3 mr-1" /> Remove Role
                            </Button>
                        </div>
                    ))}
                    {data.experience.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No experience added yet.</p>
                    )}
                </CardContent>
            </Card>

            {/* Skills Section - Simplified for MVP */}
            <Card>
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="React, TypeScript, Node.js, Project Management..."
                        value={data.skills.join(", ")}
                        onChange={(e) => updateData("skills", e.target.value.split(",").map(s => s.trim()))}
                    />
                    <p className="text-xs text-muted-foreground mt-2">Separate skills with commas.</p>
                </CardContent>
            </Card>
        </div>
    );
}
