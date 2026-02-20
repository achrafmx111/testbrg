import { useState } from "react";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, ChevronRight, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

const MOCK_RADAR_DATA = [
    { subject: 'SAP FICO', A: 120, B: 110, fullMark: 150 },
    { subject: 'German', A: 98, B: 130, fullMark: 150 },
    { subject: 'Communication', A: 86, B: 130, fullMark: 150 },
    { subject: 'Project Mgmt', A: 99, B: 100, fullMark: 150 },
    { subject: 'Integration', A: 85, B: 90, fullMark: 150 },
    { subject: 'HANA DB', A: 65, B: 85, fullMark: 150 },
];

const GAP_ANALYSIS = [
    { skill: "SAP S/4HANA Migration", status: "missing", impact: "high" },
    { skill: "German C1 Certificate", status: "missing", impact: "high" },
    { skill: "Agile/Scrum", status: "present", impact: "medium" },
    { skill: "Fiori UX", status: "partial", impact: "medium" },
];

export default function ResumeAnalysisPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            startAnalysis();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            startAnalysis();
        }
    };

    const startAnalysis = () => {
        setIsAnalyzing(true);
        // Simulate AI Processing
        setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisResult({
                score: 78,
                summary: "Strong candidate for Junior/Mid-level SAP Consultant roles. Technical foundation is solid, but German language proficiency needs documentation.",
                roleFit: "SAP Functional Consultant"
            });
        }, 2500);
    };

    const resetAnalysis = () => {
        setFile(null);
        setAnalysisResult(null);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Resume Analyzer</h1>
                    <p className="text-muted-foreground mt-1">Instant feedback on your CV's match with top German employers.</p>
                </div>
                {analysisResult && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={resetAnalysis}>
                            <RefreshCw className="mr-2 h-4 w-4" /> New Scan
                        </Button>
                        <Button onClick={() => toast.success("Report link copied to clipboard")}>
                            <Share2 className="mr-2 h-4 w-4" /> Share Report
                        </Button>
                    </div>
                )}
            </div>

            {!analysisResult ? (
                /* Upload State */
                <Card className={`border-2 border-dashed transition-all duration-300 ${isDragging ? "border-primary bg-primary/5" : "border-border/60"
                    }`}>
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className={`h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6 transition-transform duration-500 ${isAnalyzing ? "animate-pulse scale-110" : ""}`}>
                            {isAnalyzing ? (
                                <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                            ) : (
                                <Upload className="h-10 w-10 text-slate-400" />
                            )}
                        </div>

                        {isAnalyzing ? (
                            <div className="space-y-3 max-w-sm w-full">
                                <h3 className="text-xl font-semibold">Analyzing your CV...</h3>
                                <p className="text-sm text-muted-foreground">Extracting keywords, checking ATS compatibility, and matching against 500+ job descriptions.</p>
                                <Progress value={66} className="h-2 w-full mt-4" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">Drag & Drop your CV here</h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    Supported formats: PDF, DOCX (Max 5MB). We analyze your resume against German market standards.
                                </p>
                                <div className="pt-4">
                                    <input
                                        type="file"
                                        id="cv-upload"
                                        className="hidden"
                                        accept=".pdf,.docx"
                                        onChange={handleFileSelect}
                                    />
                                    <Button asChild variant="secondary" className="cursor-pointer">
                                        <label htmlFor="cv-upload">Browse Files</label>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                /* Results State */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score Card */}
                    <Card className="lg:col-span-1 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
                        <CardHeader>
                            <CardTitle>Match Score</CardTitle>
                            <CardDescription>Role: {analysisResult.roleFit}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center pt-2 pb-8">
                            <div className="relative h-48 w-48 flex items-center justify-center">
                                <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#eee"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke={analysisResult.score > 70 ? "#22c55e" : "#eab308"}
                                        strokeWidth="3"
                                        strokeDasharray={`${analysisResult.score}, 100`}
                                        className="animate-[dash_1.5s_ease-in-out_forwards]"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-5xl font-bold tracking-tighter">{analysisResult.score}</span>
                                    <span className="text-sm text-muted-foreground font-medium">/ 100</span>
                                </div>
                            </div>
                            <p className="text-center text-sm text-muted-foreground mt-2 px-4">
                                {analysisResult.summary}
                            </p>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t p-4 flex justify-between items-center text-sm">
                            <span className="font-medium text-slate-600">ATS Readability</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">98% Passed</Badge>
                        </CardFooter>
                    </Card>

                    {/* Detailed Analysis Tabs */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <Tabs defaultValue="skills" className="w-full">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Detailed Insights</CardTitle>
                                    <TabsList>
                                        <TabsTrigger value="skills">Skills Gap</TabsTrigger>
                                        <TabsTrigger value="keywords">Keywords</TabsTrigger>
                                        <TabsTrigger value="formatting">Formatting</TabsTrigger>
                                    </TabsList>
                                </div>

                                <CardContent className="p-0 pt-6">
                                    <TabsContent value="skills" className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="h-[250px] w-full">
                                <h4 className="text-sm font-semibold mb-4 text-center">Your Profile vs. Market Data</h4>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={MOCK_RADAR_DATA}>
                                                        <PolarGrid stroke="hsl(var(--border))" />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                                        <Radar
                                                            name="Market Avg"
                                                            dataKey="B"
                                                            stroke="hsl(var(--secondary))"
                                                            fill="hsl(var(--secondary))"
                                                            fillOpacity={0.2}
                                                        />
                                                        <Radar
                                                            name="You"
                                                            dataKey="A"
                                                            stroke="hsl(var(--primary))"
                                                            fill="hsl(var(--primary))"
                                                            fillOpacity={0.5}
                                                        />
                                                        <Tooltip />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold mb-2">Critical Action Items</h4>
                                                {GAP_ANALYSIS.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                                        <div className="flex items-center gap-3">
                                                            {item.status === "missing" ? (
                                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                                            ) : item.status === "partial" ? (
                                                                <AlertCircle className="h-5 w-5 text-yellow-500" />
                                                            ) : (
                                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-sm text-foreground">{item.skill}</p>
                                                                <p className="text-xs text-muted-foreground capitalize">{item.impact} Impact</p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="keywords" className="animate-in slide-in-from-right-4 duration-300">
                                        <div className="text-center py-12 text-muted-foreground">
                                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                            <p>Keyword analysis visualization coming soon...</p>
                                        </div>
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </CardHeader>
                    </Card>

                    {/* Recommendations */}
                    <Card className="lg:col-span-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-lg text-foreground">Recommended Learning Path</h3>
                                <p className="text-muted-foreground text-sm">Based on your gaps, we recommend the "SAP S/4HANA Migration Specialist" track.</p>
                            </div>
                            <Button className="shadow-lg shadow-primary/20" onClick={() => toast.info("Redirecting to course catalog...")}>
                                View Course
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
