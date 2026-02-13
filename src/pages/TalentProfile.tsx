import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Linkedin, Github, Globe, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Profile, Application } from "@/types";

const TalentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isGerman = i18n.language === "de";
  const isArabic = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [latestApplication, setLatestApplication] = useState<Application | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      setLoading(true);

      const { data: profileData, error: profileError } = await (supabase as any)
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, title, bio, country, city, linkedin_url, github_url, website_url, status")
        .eq("id", id)
        .maybeSingle();

      if (profileError || !profileData || profileData.status === "deleted") {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const { data: applicationData } = await (supabase as any)
        .from("applications")
        .select("id, user_id, created_at, status, ai_skills, ai_analysis_summary, course_name, sap_track")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (applicationData) {
        setLatestApplication(applicationData as Application);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container-custom py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle>{isGerman ? "Profil nicht gefunden" : isArabic ? "الملف غير موجود" : "Profile not found"}</CardTitle>
            <CardDescription>
              {isGerman
                ? "Dieses Talentprofil ist nicht verfugbar oder wurde entfernt."
                : isArabic
                  ? "هذا الملف غير متاح حالياً أو تمت إزالته."
                  : "This talent profile is unavailable or has been removed."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>{isGerman ? "Zuruck" : isArabic ? "الرجوع" : "Go back"}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const name = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Talent";

  return (
    <div className="container-custom py-12 space-y-8">
      <Card className="border-primary/15 bg-gradient-to-br from-primary/10 via-background to-background">
        <CardContent className="pt-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl font-bold">
                {profile.first_name?.[0]}
                {profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-3 flex-1">
              <h1 className="text-3xl font-bold">{name}</h1>
              {profile.title && <p className="text-muted-foreground font-medium">{profile.title}</p>}
              {(profile.city || profile.country) && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{isGerman ? "Uber das Talent" : isArabic ? "نبذة عن المرشح" : "About this talent"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-slate-700">
              {profile.bio || (isGerman ? "Keine Biografie verfugbar." : isArabic ? "لا توجد نبذة شخصية حالياً." : "No bio added yet.")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isGerman ? "Links" : isArabic ? "روابط" : "Links"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-sm text-primary flex items-center gap-2 hover:underline">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-sm text-primary flex items-center gap-2 hover:underline">
                <Github className="h-4 w-4" /> GitHub
              </a>
            )}
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-sm text-primary flex items-center gap-2 hover:underline">
                <Globe className="h-4 w-4" /> Website
              </a>
            )}
            {!profile.linkedin_url && !profile.github_url && !profile.website_url && (
              <p className="text-sm text-muted-foreground">{isGerman ? "Keine Links vorhanden." : isArabic ? "لا توجد روابط متاحة." : "No links available."}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {latestApplication?.ai_skills && latestApplication.ai_skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {isGerman ? "Skills Snapshot" : isArabic ? "ملخص المهارات" : "Skills Snapshot"}
            </CardTitle>
            <CardDescription>
              {isGerman
                ? "Automatisch erkannte Kompetenzbereiche aus dem letzten Profil-Check."
                : isArabic
                  ? "المهارات المستخرجة تلقائياً من آخر تحليل للملف."
                  : "Auto-detected skills from the latest profile analysis."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {latestApplication.ai_skills.map((skill, index) => (
                <Badge key={`${skill.skill}-${index}`} variant="outline" className="font-semibold">
                  {skill.skill} - {skill.level}
                </Badge>
              ))}
            </div>
            {latestApplication.ai_analysis_summary && (
              <p className="text-sm text-muted-foreground">{latestApplication.ai_analysis_summary}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">{isGerman ? "Mochten Sie dieses Talent kontaktieren?" : isArabic ? "هل تريد التواصل مع هذا المرشح؟" : "Want to contact this talent?"}</p>
            <p className="text-sm text-muted-foreground">{isGerman ? "Senden Sie uns eine Anfrage und wir koordinieren den nachsten Schritt." : isArabic ? "أرسل لنا طلباً وسنقوم بتنسيق الخطوة التالية معك." : "Send us an inquiry and we will coordinate the next step."}</p>
          </div>
          <Button onClick={() => navigate("/contactus")}>{isGerman ? "Anfrage senden" : isArabic ? "إرسال طلب" : "Send inquiry"}</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TalentProfile;
