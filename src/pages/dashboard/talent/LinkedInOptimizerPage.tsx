import { useState } from "react";
import { motion } from "framer-motion";
import {
    Linkedin,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Copy,
    RefreshCw,
    Search,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock AI Analysis Function (simulating backend)
const analyzeProfile = async (data: { headline: string; about: string; experience: string }) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

    let score = 60;
    const tips: string[] = [];
    const keywordsFound: string[] = [];

    // Basic Keyword Check
    const combinedText = (data.headline + data.about + data.experience).toLowerCase();
    const requiredKeywords = ["sap", "abap", "german", "deutsch", "consultant", "solution", "hana"];

    requiredKeywords.forEach(kw => {
        if (combinedText.includes(kw)) {
            score += 5;
            keywordsFound.push(kw);
        }
    });

    // Formatting Checks
    if (data.headline.length > 10 && data.headline.length < 50) score += 5;
    else tips.push("Your headline is either too short or too generic. Add your specific role + key tech stack.");

    if (data.about.length > 100) score += 5;
    else tips.push("Your 'About' section is very brief. Tell your story and mention your career goals in Germany.");

    if (score > 100) score = 100;

    return {
        score,
        keywordsFound,
        tips: tips.length > 0 ? tips : ["Great profile! Consider adding a link to your portfolio."],
        rewrittenHeadline: `Senior SAP Consultant | Specialized in ${keywordsFound[0] || "HANA"} & Migration | Targeting German Market`,
        rewrittenAbout: "Highly motivated SAP Specialist with 5+ years of experience in S/4HANA implementations. Passionate about leveraging technology to solve business problems. Currently learning German (B1) and actively seeking opportunities to contribute to DACH region projects."
    };
};

export default function LinkedInOptimizerPage() {
    const { toast } = useToast();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [formData, setFormData] = useState({
        headline: "",
        about: "",
        experience: ""
    });

    const handleAnalyze = async () => {
        if (!formData.headline && !formData.about) {
            toast({ variant: "destructive", title: "Empty Input", description: "Please fill in at least the Headline or About section." });
            return;
        }

        setIsAnalyzing(true);
        try {
            const analysis = await analyzeProfile(formData);
            setResult(analysis);
            toast({ title: "Analysis Complete", description: "Your profile has been optimized for German recruiters!" });
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Something went wrong during analysis." });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: "Text copied to clipboard." });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0077b5] to-[#00a0dc] p-8 md:p-12 text-white shadow-xl">
                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                        <Linkedin className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">LinkedIn Profile Optimizer</h1>
                        <p className="text-blue-100 max-w-xl mt-2 text-lg">
                            Tailor your professional brand for the German market. Our AI analyzes your profile and suggests improvements to attract DACH recruiters.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Input */}
                <Card className="border-border/60 shadow-lg h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-primary" />
                            Paste Your Profile Details
                        </CardTitle>
                        <CardDescription>
                            Copy content from your actual LinkedIn profile to get started.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <Tabs defaultValue="headline" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="headline">Headline</TabsTrigger>
                                <TabsTrigger value="about">About</TabsTrigger>
                                <TabsTrigger value="experience">Experience</TabsTrigger>
                            </TabsList>

                            <TabsContent value="headline" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Your Headline</Label>
                                    <Input
                                        placeholder="e.g. SAP Consultant | ABAP Developer"
                                        value={formData.headline}
                                        onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                        className="bg-muted/30 h-12 text-lg"
                                    />
                                    <p className="text-xs text-muted-foreground">This is the first thing recruiters see. Make it count.</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="about" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>About Section</Label>
                                    <Textarea
                                        rows={10}
                                        placeholder="Paste your 'About' summary here..."
                                        value={formData.about}
                                        onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                        className="bg-muted/30 resize-none font-mono text-sm"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="experience" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Experience Summaries</Label>
                                    <Textarea
                                        rows={10}
                                        placeholder="Paste summaries of your last 2-3 roles..."
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        className="bg-muted/30 resize-none font-mono text-sm"
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/10 p-6">
                        <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="w-full h-12 text-lg gap-2 shadow-lg shadow-primary/25"
                        >
                            {isAnalyzing ? (
                                <>Analyzing <Sparkles className="h-4 w-4 animate-spin" /></>
                            ) : (
                                <>Analyze Profile <Sparkles className="h-4 w-4" /></>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Right Column: Analysis Results */}
                <div className="space-y-6">
                    {/* Score Card */}
                    <Card className="border-border/60 shadow-lg relative overflow-hidden">
                        {!result ? (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-8">
                                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">Ready to Analyze</h3>
                                <p className="text-muted-foreground max-w-sm mt-1">Paste your profile details on the left and hit Analyze to see your German Market Score.</p>
                            </div>
                        ) : null}

                        <CardHeader>
                            <CardTitle>Optimization Score</CardTitle>
                            <CardDescription>Based on typical German recruiter criteria.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="relative h-32 w-32 flex items-center justify-center">
                                    <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                                        <motion.circle
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: (result?.score || 0) / 100 }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                                            className={`text-primary ${result?.score >= 80 ? 'text-green-500' : result?.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}
                                            strokeDasharray="1"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold">{result?.score || 0}</span>
                                        <span className="text-xs text-muted-foreground">/ 100</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Keyword Density</span>
                                            <span className="font-medium">{result?.keywordsFound.length > 3 ? 'High' : 'Low'}</span>
                                        </div>
                                        <Progress value={Math.min((result?.keywordsFound.length || 0) * 20, 100)} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Actionable Verbs</span>
                                            <span className="font-medium">Medium</span>
                                        </div>
                                        <Progress value={65} className="h-2" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Suggestions */}
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="border-border/60 shadow-lg border-l-4 border-l-purple-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-purple-500" />
                                        AI Suggestions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Suggested Headline</h4>
                                            <Button variant="ghost" size="sm" className="h-6 gap-1" onClick={() => copyToClipboard(result.rewrittenHeadline)}>
                                                <Copy className="h-3 w-3" /> Copy
                                            </Button>
                                        </div>
                                        <div className="p-4 bg-muted/40 rounded-lg border border-border/50 text-sm italic">
                                            "{result.rewrittenHeadline}"
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Suggested About Summary</h4>
                                            <Button variant="ghost" size="sm" className="h-6 gap-1" onClick={() => copyToClipboard(result.rewrittenAbout)}>
                                                <Copy className="h-3 w-3" /> Copy
                                            </Button>
                                        </div>
                                        <div className="p-4 bg-muted/40 rounded-lg border border-border/50 text-sm leading-relaxed">
                                            {result.rewrittenAbout}
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <h4 className="font-medium text-sm">Missing Keywords (Add these!)</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {["German B2", "Cloud Migration", "Team Lead"].map(k => (
                                                <Badge key={k} variant="outline" className="border-dashed border-primary text-primary bg-primary/5">
                                                    + {k}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
