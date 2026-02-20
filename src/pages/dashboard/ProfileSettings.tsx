import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { User, Phone, Globe, Linkedin, Github, Save, Loader2, FileJson, Trash2, AlertTriangle, Info, Shield, Download, CheckCircle2, CircleDashed, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { mvpSchema } from "@/integrations/supabase/mvp";
import { Profile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { logSecurityEvent } from "@/lib/auditLogger";

interface ProfileSettingsProps {
    profile: Profile | null;
    onUpdate: () => void;
}

const ProfileSettings = ({ profile, onUpdate }: ProfileSettingsProps) => {
    const { t, i18n } = useTranslation();
    const isGerman = i18n.language === "de";
    const isArabic = i18n.language === "ar";
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [formData, setFormData] = useState({
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        phone: profile?.phone || "",
        country: profile?.country || "",
        city: profile?.city || "",
        title: profile?.title || "",
        bio: profile?.bio || "",
        linkedin_url: profile?.linkedin_url || "",
        github_url: profile?.github_url || "",
        website_url: profile?.website_url || "",
    });

    const profileChecklist = [
        { key: "first_name", label: isGerman ? "Vorname" : isArabic ? "الاسم الأول" : "First name", completed: Boolean(formData.first_name.trim()) },
        { key: "last_name", label: isGerman ? "Nachname" : isArabic ? "الاسم الأخير" : "Last name", completed: Boolean(formData.last_name.trim()) },
        { key: "phone", label: isGerman ? "Telefon" : isArabic ? "رقم الهاتف" : "Phone", completed: Boolean(formData.phone.trim()) },
        { key: "country", label: isGerman ? "Land" : isArabic ? "الدولة" : "Country", completed: Boolean(formData.country.trim()) },
        { key: "city", label: isGerman ? "Stadt" : isArabic ? "المدينة" : "City", completed: Boolean(formData.city.trim()) },
        { key: "title", label: isGerman ? "Berufstitel" : isArabic ? "المسمى الوظيفي" : "Professional title", completed: Boolean(formData.title.trim()) },
        { key: "bio", label: isGerman ? "Biografie" : isArabic ? "نبذة" : "Bio", completed: Boolean(formData.bio.trim()) },
        { key: "linkedin_url", label: "LinkedIn", completed: Boolean(formData.linkedin_url.trim()) },
    ];
    const completedChecklistItems = profileChecklist.filter((item) => item.completed).length;
    const profileCompletion = Math.round((completedChecklistItems / profileChecklist.length) * 100);
    const missingChecklistItems = profileChecklist.filter((item) => !item.completed).slice(0, 3);

    useEffect(() => {
        if (profile) {
            setFormData({
                first_name: profile.first_name || "",
                last_name: profile.last_name || "",
                phone: profile.phone || "",
                country: profile.country || "",
                city: profile.city || "",
                title: profile.title || "",
                bio: profile.bio || "",
                linkedin_url: profile.linkedin_url || "",
                github_url: profile.github_url || "",
                website_url: profile.website_url || "",
            });
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await mvpSchema
                .from('profiles')
                .update(formData)
                .eq('id', profile.id);

            if (error) throw error;

            toast({
                title: isGerman ? "Profil aktualisiert" : isArabic ? "تم تحديث الملف الشخصي" : "Profile Updated",
                description: isGerman ? "Ihre Änderungen wurden erfolgreich gespeichert." : isArabic ? "تم حفظ التغييرات بنجاح." : "Your changes have been saved successfully."
            });
            onUpdate();
        } catch (error) {
            console.error("Error updating profile:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast({
                variant: "destructive",
                title: isGerman ? "Aktualisierung fehlgeschlagen" : isArabic ? "فشل التحديث" : "Update Failed",
                description: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            toast({ title: isGerman ? "Daten werden vorbereitet..." : isArabic ? "جاري تحضير البيانات..." : "Preparing data export..." });

            // Fetch everything related to user
            const [
                { data: applications },
                { data: enrollments },
                { data: interviewRequests },
                { data: employerFavorites },
                { data: referrals },
                { data: activityLogs }
            ] = await Promise.all([
                mvpSchema.from('applications').select('*').eq('user_id', profile?.id),
                mvpSchema.from('course_enrollments').select('*').eq('user_id', profile?.id),
                mvpSchema.from('interview_requests').select('*').eq('employer_id', profile?.id), // Or candidate side if applicable
                mvpSchema.from('employer_favorites').select('*').eq('user_id', profile?.id),
                mvpSchema.from('referrals').select('*').eq('referrer_id', profile?.id),
                mvpSchema.from('application_activity_logs').select('*').eq('actor_id', profile?.id)
            ]);

            const exportBundle = {
                profile,
                applications,
                enrollments,
                interviewRequests,
                employerFavorites,
                referrals,
                activityLogs,
                exported_at: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `BridgingAcademy_Data_${profile?.id}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            await logSecurityEvent({
                action: 'PROFILE_EXPORTED',
                resourceType: 'profile',
                resourceId: profile?.id
            });

            toast({ title: isGerman ? "Daten exportiert" : isArabic ? "تم تصدير البيانات" : "Data Exported Successfully" });
        } catch (error) {
            console.error("Export error:", error);
            toast({ variant: "destructive", title: "Export failed" });
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await logSecurityEvent({
                action: 'ACCOUNT_DELETION_REQUEST',
                resourceType: 'profile',
                resourceId: profile?.id
            });

            // Schedule deletion for 30 days from now (Grace Period)
            const deletionDate = new Date();
            deletionDate.setDate(deletionDate.getDate() + 30);

            const { error } = await mvpSchema
                .from('profiles')
                .update({
                    status: 'deleted',
                    email: `deleted_${profile.id.substring(0, 8)}@deleted.local`,
                    first_name: 'Deleted',
                    last_name: 'User',
                    bio: null,
                    phone: null,
                    deleted_at: new Date().toISOString()
                } as any)
                .eq('id', profile.id);

            if (error) throw error;

            toast({
                title: isGerman ? "Löschung eingeplant" : isArabic ? "تم جدولة الحذف" : "Deletion Scheduled",
                description: isGerman ? "Ihr Konto wird in 30 Tagen gelöscht." : isArabic ? "سيتم حذف حسابك خلال 30 يوماً." : "Your account will be permanently deleted in 30 days."
            });

            // Sign out
            await supabase.auth.signOut();
            window.location.href = '/';
        } catch (error) {
            console.error("Deletion error:", error);
            toast({ variant: "destructive", title: "Deletion failed" });
        } finally {
            setLoading(false);
        }
    };

    const jumpToField = (fieldId: string) => {
        const target = document.getElementById(fieldId);
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        target?.focus();
    };

    const publicProfileUrl = profile?.id && typeof window !== "undefined"
        ? `${window.location.origin}/talent/${profile.id}`
        : "";

    const handleCopyProfileLink = async () => {
        if (!publicProfileUrl) return;
        await navigator.clipboard.writeText(publicProfileUrl);
        setLinkCopied(true);
        toast({
            title: isGerman ? "Link kopiert" : isArabic ? "تم نسخ الرابط" : "Link copied",
            description: isGerman ? "Offentliches Profil kann jetzt geteilt werden." : isArabic ? "يمكنك الآن مشاركة رابط الملف العام." : "Public profile link is ready to share."
        });
        setTimeout(() => setLinkCopied(false), 1500);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-background to-background">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-4">
                        <span>{isGerman ? "Profilstarke" : isArabic ? "قوة الملف الشخصي" : "Profile Strength"}</span>
                        <span className="text-2xl font-black text-primary">{profileCompletion}%</span>
                    </CardTitle>
                    <CardDescription>
                        {isGerman
                            ? "Ein vollständiges Profil erhöht Ihre Sichtbarkeit bei Recruitern erheblich."
                            : isArabic
                                ? "اكتمال الملف الشخصي يزيد بشكل واضح من فرص ظهورك لدى أصحاب العمل."
                                : "A complete profile significantly increases your visibility to employers."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {profileChecklist.map((item) => (
                            <div key={item.key} className="flex items-center gap-2 text-sm">
                                {item.completed ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                    <CircleDashed className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {missingChecklistItems.length > 0 && (
                        <div className="rounded-lg border bg-muted/30 p-3">
                            <p className="text-xs font-semibold mb-2">
                                {isGerman ? "Schnell verbessern:" : isArabic ? "تحسين سريع:" : "Quick boosts:"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {missingChecklistItems.map((item) => (
                                    <Button key={item.key} type="button" size="sm" variant="outline" onClick={() => jumpToField(item.key)}>
                                        {item.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{isGerman ? "Persönliche Daten" : isArabic ? "المعلومات الشخصية" : "Personal Information"}</CardTitle>
                    <CardDescription>{isGerman ? "Aktualisieren Sie Ihre grundlegenden Kontakt- und Standortdaten." : isArabic ? "قم بتحديث تفاصيل الاتصال والموقع الأساسية." : "Update your basic contact and location details."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">{isGerman ? "Vorname" : isArabic ? "الاسم الأول" : "First Name"}</Label>
                            <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">{isGerman ? "Nachname" : isArabic ? "الاسم الأخير" : "Last Name"}</Label>
                            <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">{isGerman ? "Telefonnummer" : isArabic ? "رقم الهاتف" : "Phone Number"}</Label>
                        <div className="relative">
                            <Phone className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isArabic ? "right-3" : "left-3"}`} />
                            <Input id="phone" name="phone" className={isArabic ? "pr-9" : "pl-9"} value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">{isGerman ? "Land" : isArabic ? "الدولة" : "Country"}</Label>
                            <Input id="country" name="country" value={formData.country} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">{isGerman ? "Stadt" : isArabic ? "المدينة" : "City"}</Label>
                            <Input id="city" name="city" value={formData.city} onChange={handleChange} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{isGerman ? "Berufliches Profil" : isArabic ? "الملف المهني" : "Professional Profile"}</CardTitle>
                    <CardDescription>{isGerman ? "Teilen Sie Ihre Karriere-Highlights und sozialen Links." : isArabic ? "شارك أبرز إنجازاتك المهنية والروابط الاجتماعية." : "Share your career highlights and social links."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">{isGerman ? "Berufstitel" : isArabic ? "المسمى الوظيفي" : "Professional Title"}</Label>
                        <Input id="title" name="title" placeholder={isGerman ? "z.B. SAP-Berater, Backend-Entwickler" : isArabic ? "مثال: استشاري SAP، مطور Backend" : "e.g. SAP Consultant, Backend Developer"} value={formData.title} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">{isGerman ? "Biografie" : isArabic ? "نبذة شخصية" : "Bio"}</Label>
                        <Textarea id="bio" name="bio" placeholder={isGerman ? "Erzählen Sie uns etwas über sich..." : isArabic ? "أخبرنا عن نفسك..." : "Tell us about yourself..."} className="h-32" value={formData.bio} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="linkedin_url">{isGerman ? "LinkedIn URL" : isArabic ? "رابط LinkedIn" : "LinkedIn URL"}</Label>
                            <div className="relative">
                                <Linkedin className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isArabic ? "right-3" : "left-3"}`} />
                                <Input id="linkedin_url" name="linkedin_url" className={isArabic ? "pr-9" : "pl-9"} placeholder="https://linkedin.com/in/..." value={formData.linkedin_url} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="github_url">{isGerman ? "GitHub URL" : isArabic ? "رابط GitHub" : "GitHub URL"}</Label>
                            <div className="relative">
                                <Github className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isArabic ? "right-3" : "left-3"}`} />
                                <Input id="github_url" name="github_url" className={isArabic ? "pr-9" : "pl-9"} placeholder="https://github.com/..." value={formData.github_url} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website_url">{isGerman ? "Persönliche Webseite" : isArabic ? "الموقع الشخصي" : "Personal Website"}</Label>
                        <div className="relative">
                            <Globe className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isArabic ? "right-3" : "left-3"}`} />
                            <Input id="website_url" name="website_url" className={isArabic ? "pr-9" : "pl-9"} placeholder="https://..." value={formData.website_url} onChange={handleChange} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6 bg-muted/10">
                    <Button type="submit" disabled={loading} className="gap-2 px-8">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isGerman ? "Änderungen speichern" : isArabic ? "حفظ التغييرات" : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{isGerman ? "Offentliches Talentprofil" : isArabic ? "الملف العام للمواهب" : "Public Talent Profile"}</CardTitle>
                    <CardDescription>
                        {isGerman
                            ? "Teilen Sie Ihr Profil mit Recruitern oder Partnerunternehmen."
                            : isArabic
                                ? "شارك ملفك المهني مع أصحاب العمل والشركاء."
                                : "Share your profile with recruiters and partner companies."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input readOnly value={publicProfileUrl} className="font-mono text-xs md:text-sm" />
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={handleCopyProfileLink} className="gap-2">
                            <Copy className="h-4 w-4" />
                            {linkCopied ? (isGerman ? "Kopiert" : isArabic ? "تم النسخ" : "Copied") : (isGerman ? "Link kopieren" : isArabic ? "نسخ الرابط" : "Copy link")}
                        </Button>
                        <Button type="button" onClick={() => window.open(publicProfileUrl, "_blank")} className="gap-2" disabled={!publicProfileUrl}>
                            <ExternalLink className="h-4 w-4" />
                            {isGerman ? "Profil ansehen" : isArabic ? "عرض الملف" : "View profile"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Phase 9: GDPR & Privacy Section */}
            <Card className="border-red-100 bg-red-50/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        {isGerman ? "Datenschutz & Privatsphäre (GDPR)" : isArabic ? "الخصوصية والبيانات" : "Privacy & Data (GDPR)"}
                    </CardTitle>
                    <CardDescription>
                        {isGerman ? "Verwalten Sie Ihre Daten gemäß der DSGVO." : isArabic ? "إدارة بياناتك وفقاً للقوانين العامة لحماية البيانات." : "Manage your data according to GDPR regulations."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                        <div className="space-y-1">
                            <p className="font-bold text-sm flex items-center gap-2">
                                <FileJson className="h-4 w-4 text-blue-500" />
                                {isGerman ? "Daten exportieren" : isArabic ? "تصدير البيانات" : "Export My Data"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {isGerman ? "Laden Sie eine Kopie aller Ihrer Daten im JSON-Format herunter." : isArabic ? "قم بتنزيل نسخة من جميع بياناتك بتنسيق JSON." : "Download a machine-readable copy of all your profile and application data."}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleExportData} className="gap-2 shrink-0">
                            <Download className="h-4 w-4" />
                            {isGerman ? "Herunterladen" : isArabic ? "تحميل" : "Download JSON"}
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 border border-red-100">
                        <div className="space-y-1">
                            <p className="font-bold text-sm flex items-center gap-2 text-red-600">
                                <Trash2 className="h-4 w-4" />
                                {isGerman ? "Konto löschen" : isArabic ? "حذف الحساب" : "Delete Account"}
                            </p>
                            <p className="text-xs text-red-600/70 italic">
                                {isGerman ? "Dies wird Ihr Profil anonymisieren. Diese Aktion ist endgültig." : isArabic ? "سيؤدي هذا إلى جعل ملفك الشخصي مجهولاً. هذا الإجراء نهائي." : "This will permanently anonymize your data. This action cannot be undone."}
                            </p>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="gap-2 shrink-0">
                                    <AlertTriangle className="h-4 w-4" />
                                    {isGerman ? "Konto löschen" : isArabic ? "حذف الحساب" : "Delete Permanent"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                        {isGerman ? "Sind Sie absolut sicher?" : isArabic ? "هل أنت متأكد تماماً؟" : "Are you absolutely sure?"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {isGerman ? "Dies wird Ihr Konto anonymisieren. Ihre Fortschritte und Bewerbungen werden entkoppelt." : isArabic ? "سيؤدي هذا إلى جعل حسابك مجهولاً. سيتم فصل تقدمك وطلباتك." : "This will anonymize your account. Your progress and applications will be decoupled from your identity."}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{isGerman ? "Abbrechen" : isArabic ? "إلغاء" : "Cancel"}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                                        {isGerman ? "Ja, Konto löschen" : isArabic ? "نعم، احذف الحساب" : "Yes, Delete Account"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/5 p-4 flex gap-2">
                    <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-[10px] text-muted-foreground leading-tight">
                        {isGerman ? "Wir verarbeiten Daten gemäß der DSGVO Art. 15 (Recht auf Auskunft) und Art. 17 (Recht auf Löschung)." : isArabic ? "نحن نعالج البيانات وفقاً للمادة 15 (حق الوصول) والمادة 17 (حق الحذف) من اللائحة العامة لحماية البيانات." : "We process data in compliance with GDPR Art. 15 (Right to Access) and Art. 17 (Right to Erasure)."}
                    </p>
                </CardFooter>
            </Card>
        </form>
    );
};

export default ProfileSettings;
