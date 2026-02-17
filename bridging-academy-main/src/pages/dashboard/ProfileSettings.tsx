import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { User, Phone, MapPin, Globe, Linkedin, Github, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types";
import { useToast } from "@/hooks/use-toast";

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
            const { error } = await supabase
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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
        </form>
    );
};

export default ProfileSettings;
