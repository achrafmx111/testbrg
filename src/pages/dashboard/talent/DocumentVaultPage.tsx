import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    FileText,
    Upload,
    Shield,
    Lock,
    CheckCircle2,
    AlertCircle,
    Clock,
    Eye,
    Trash2,
    FileCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

// Mock Document Data
interface DocItem {
    id: string;
    title: string;
    description: string;
    status: "missing" | "pending" | "verified";
    category: "identity" | "qualification" | "relocation";
    fileName?: string;
    uploadDate?: string;
}

const INITIAL_DOCS: DocItem[] = [
    {
        id: "doc_1",
        title: "Passport",
        description: "Valid for at least 6 months",
        status: "verified",
        category: "identity",
        fileName: "passport_scan_2024.pdf",
        uploadDate: "2024-01-15"
    },
    {
        id: "doc_2",
        title: "University Diploma",
        description: "Original degree certificate + translation",
        status: "pending",
        category: "qualification",
        fileName: "diploma_en_translation.pdf",
        uploadDate: "2024-02-10"
    },
    {
        id: "doc_3",
        title: "ZAB Statement of Comparability",
        description: "Official recognition of your degree in Germany",
        status: "missing",
        category: "qualification"
    },
    {
        id: "doc_4",
        title: "Work Contract",
        description: "Signed contract with German employer",
        status: "missing",
        category: "relocation"
    },
    {
        id: "doc_5",
        title: "Blocked Account Confirmation",
        description: "Proof of financial resources (Sperrkonto)",
        status: "missing",
        category: "relocation"
    }
];

export default function DocumentVaultPage() {
    const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
    const [uploading, setUploading] = useState<string | null>(null);

    const handleUpload = (id: string) => {
        // Simulate upload
        setUploading(id);
        setTimeout(() => {
            setDocs(current => current.map(doc => {
                if (doc.id === id) {
                    return {
                        ...doc,
                        status: "pending",
                        fileName: "new_upload_scan.pdf",
                        uploadDate: new Date().toISOString().split('T')[0]
                    };
                }
                return doc;
            }));
            setUploading(null);
        }, 1500);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "verified": return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "pending": return "bg-amber-100 text-amber-800 border-amber-200";
            default: return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "verified": return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
            case "pending": return <Clock className="h-4 w-4 text-amber-600" />;
            default: return <AlertCircle className="h-4 w-4 text-slate-400" />;
        }
    };

    const verifiedCount = docs.filter(d => d.status === "verified").length;
    const progress = (verifiedCount / docs.length) * 100;

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Shield className="h-8 w-8 text-blue-600" />
                        Document Vault
                    </h1>
                    <p className="text-muted-foreground">
                        Securely store and manage your critical visa & relocation documents.
                        <br className="hidden md:inline" /> Verified by Bridging Academy compliance team.
                    </p>
                </div>

                <Card className="bg-slate-900 text-white border-slate-800 px-6 py-3 shadow-lg">
                    <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-emerald-400" />
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Security Level</p>
                            <p className="font-bold text-emerald-400">AES-256 Encrypted</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Progress */}
            <Card className="border-blue-100 bg-blue-50/50">
                <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-blue-900">Relocation Readiness</span>
                            <span className="text-blue-700">{Math.round(progress)}% Complete</span>
                        </div>
                        <Progress value={progress} className="h-3 bg-blue-200 [&>div]:bg-blue-600" />
                    </div>
                    <div className="hidden md:block h-10 w-[1px] bg-blue-200"></div>
                    <div className="flex gap-8 text-sm">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{docs.length}</p>
                            <p className="text-muted-foreground">Required</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">{verifiedCount}</p>
                            <p className="text-muted-foreground">Verified</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-amber-600">{docs.filter(d => d.status === "pending").length}</p>
                            <p className="text-muted-foreground">Pending</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 gap-4">
                {["identity", "qualification", "relocation"].map((category) => (
                    <div key={category} className="space-y-3">
                        <h3 className="text-lg font-semibold capitalize flex items-center gap-2 text-slate-800 mt-4">
                            {category === "identity" && <UserIcon className="h-5 w-5 text-slate-500" />}
                            {category === "qualification" && <GradIcon className="h-5 w-5 text-slate-500" />}
                            {category === "relocation" && <PlaneIcon className="h-5 w-5 text-slate-500" />}
                            {category} Documents
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {docs.filter(d => d.category === category).map((doc) => (
                                <Card key={doc.id} className={`transition-all hover:shadow-md ${doc.status === 'missing' ? 'border-dashed' : ''}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div className={`p-2 rounded-lg ${doc.status === 'missing' ? 'bg-slate-100' : 'bg-blue-50 text-blue-600'}`}>
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <Badge variant="outline" className={`${getStatusColor(doc.status)} flex items-center gap-1`}>
                                                {getStatusIcon(doc.status)}
                                                <span className="capitalize">{doc.status}</span>
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base mt-3 leading-tight">{doc.title}</CardTitle>
                                        <CardDescription className="text-xs mt-1">{doc.description}</CardDescription>
                                    </CardHeader>

                                    <Separator />

                                    <CardFooter className="pt-3 pb-3 bg-slate-50/50 min-h-[60px] flex items-center">
                                        {doc.status === "missing" ? (
                                            <Button
                                                variant="outline"
                                                className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                                onClick={() => handleUpload(doc.id)}
                                                disabled={uploading === doc.id}
                                            >
                                                {uploading === doc.id ? (
                                                    <>Uploading...</>
                                                ) : (
                                                    <><Upload className="h-4 w-4 mr-2" /> Upload Document</>
                                                )}
                                            </Button>
                                        ) : (
                                            <div className="w-full flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-slate-600 truncate max-w-[120px]">
                                                    <FileCheck className="h-4 w-4 text-slate-400" />
                                                    <span className="truncate" title={doc.fileName}>{doc.fileName}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Quick icons for section headers
function UserIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> }
function GradIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> }
function PlaneIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20" /><path d="M13 12l2-7-5 1H8" /><path d="M13 12l2 7-5-1H8" /><path d="M22 2l-1.5 5.5" /></svg> }
