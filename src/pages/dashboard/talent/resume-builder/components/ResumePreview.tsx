
import { ResumeData } from "@/services/ai-resume.service";
import { MapPin, Mail, Phone, Linkedin } from "lucide-react";

interface ResumePreviewProps {
    data: ResumeData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
    return (
        <div id="resume-preview" className="bg-white text-black p-8 min-h-[1056px] w-full shadow-lg print:shadow-none print:w-full print:min-h-0">
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-wide text-slate-900 mb-2">
                    {data.personalInfo.fullName || "Your Name"}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    {data.personalInfo.email && (
                        <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {data.personalInfo.email}
                        </div>
                    )}
                    {data.personalInfo.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {data.personalInfo.phone}
                        </div>
                    )}
                    {data.personalInfo.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {data.personalInfo.location}
                        </div>
                    )}
                    {data.personalInfo.linkedin && (
                        <div className="flex items-center gap-1">
                            <Linkedin className="h-3 w-3" /> {data.personalInfo.linkedin}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary */}
            {data.personalInfo.summary && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
                        Professional Summary
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-700">
                        {data.personalInfo.summary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {data.experience.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">
                        Experience
                    </h2>
                    <div className="space-y-4">
                        {data.experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-slate-800">{exp.role}</h3>
                                    <span className="text-xs text-slate-500 font-medium">{exp.startDate} - {exp.endDate || "Present"}</span>
                                </div>
                                <div className="text-sm text-slate-600 font-medium mb-1">{exp.company}</div>
                                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                                    {exp.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {data.skills.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
                        Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-medium border border-slate-200">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Education - Placeholder if empty for now */}
            <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
                    Education
                </h2>
                {data.education && data.education.length > 0 ? (
                    data.education.map(edu => (
                        <div key={edu.id} className="mb-2">
                            <div className="flex justify-between">
                                <h3 className="text-sm font-bold text-slate-800">{edu.school}</h3>
                                <span className="text-xs text-slate-500">{edu.year}</span>
                            </div>
                            <div className="text-xs text-slate-600">{edu.degree}</div>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-slate-400 italic">Add education in the form to display here.</p>
                )}
            </div>

        </div>
    );
}
