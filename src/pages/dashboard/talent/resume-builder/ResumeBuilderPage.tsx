
import { useState, useRef } from "react";
import { ResumeForm } from "./components/ResumeForm";
import { ResumePreview } from "./components/ResumePreview";
import { ResumeData } from "@/services/ai-resume.service";
import { Button } from "@/components/ui/button";
import { Download, LayoutTemplate, Sparkles } from "lucide-react";
import { useReactToPrint } from "react-to-print";
// Note: In a real app we'd install react-to-print, but for now we'll just use window.print with a print stylesheet
// or simulate it. I'll add a simple print handler.

const INITIAL_DATA: ResumeData = {
    personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        linkedin: "",
        location: "",
        summary: ""
    },
    experience: [],
    education: [],
    skills: []
};

export default function ResumeBuilderPage() {
    const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_DATA);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const updateData = (section: keyof ResumeData, value: any) => {
        setResumeData(prev => ({
            ...prev,
            [section]: value
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 animate-in fade-in duration-500 print:p-0 print:bg-white">
            {/* Header - Hidden in Print */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print:hidden">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutTemplate className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">AI Resume Builder</h1>
                    </div>
                    <p className="text-muted-foreground">Draft, optimize, and export your resume in minutes.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" /> Auto-Fill from Profile
                    </Button>
                    <Button onClick={handlePrint} className="gap-2">
                        <Download className="h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
                {/* Editor Side - Hidden in Print */}
                <div className="space-y-6 print:hidden">
                    <ResumeForm data={resumeData} updateData={updateData} />
                </div>

                {/* Preview Side - Full width in Print */}
                <div className="print:w-full">
                    <div className="lg:sticky lg:top-6">
                        <div className="border rounded-xl overflow-hidden shadow-xl bg-white print:shadow-none print:border-none">
                            <div ref={printRef}>
                                <ResumePreview data={resumeData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { margin: 0; padding: 0; background: white; }
          /* Hide everything except the resume preview */
          body > * { display: none; }
          #root, #root > div { display: block; }
          /* We need to ensure the preview is visible and takes up the page */
          #resume-preview { 
             display: block !important; 
             width: 100%; 
             height: 100%; 
             box-shadow: none;
             padding: 0; /* Adjust as needed */
          }
          /* Hide the interactive UI parts */
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
        </div>
    );
}
