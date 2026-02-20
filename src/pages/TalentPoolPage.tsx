import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Users,
  Upload,
  CheckCircle,
  FileText,
  User as UserIcon,
  Loader2,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Languages } from 'lucide-react';

const TalentPoolPage = () => {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);

  // File Upload States
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      // 1. Upload Files
      const uploadFile = async (file: File, folder: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user?.id || 'anonymous'}/${folder}/${Date.now()}_${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('application-docs')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        return data.path;
      };

      let cvPath = "";
      let passportPath = "";
      let certPath = "";

      if (cvFile) cvPath = await uploadFile(cvFile, 'cv');
      if (passportFile) passportPath = await uploadFile(passportFile, 'passport');
      if (certFile) certPath = await uploadFile(certFile, 'certificates');

      // Generate ID on client to avoid needing .select() and triggering RLS read error for anons
      const applicationId = crypto.randomUUID();

      const newApplication = {
        id: applicationId,
        type: 'talent_pool_registration',
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        country_city: formData.get("location") as string,
        course_slug: 'talent-pool',
        course_name: 'Talent Pool Registration',
        message: formData.get("message") as string,
        status: 'pending',
        user_id: user?.id || null,
        cv_path: cvPath,
        passport_path: passportPath,
        cert_path: certPath,
        german_level: formData.get("german_level") as string,
        sap_track: formData.get("sap_track") as string,
        experience_years: parseInt(formData.get("experience") as string || "0")
      };

      // 2. Create Application Record (Talent Pool Registration)
      const { error: dbError } = await supabase
        .from('applications')
        .insert(newApplication);

      let application = dbError ? null : newApplication;

      if (dbError) throw dbError;

      // 2b. Also write to MVP schema so talent appears in Admin dashboard
      if (application) {
        // Determine user_id: either from auth or use the application id as fallback
        const talentUserId = user?.id || application.id;

        // Create mvp.profiles entry
        try {
          const mvpSchema = (supabase as any).schema("mvp");
          await mvpSchema.from("profiles").upsert({
            id: talentUserId,
            role: "TALENT",
          }, { onConflict: "id" });

          // Parse form fields for talent profile
          const germanLevel = formData.get("german_level") as string || "none";
          const sapTrack = formData.get("sap_track") as string || "other";
          const experience = parseInt(formData.get("experience") as string || "0");

          // Build initial skills from SAP track + german level
          const initialSkills: string[] = [];
          if (sapTrack && sapTrack !== "other") initialSkills.push(`SAP ${sapTrack}`);
          const initialLanguages: string[] = ["English"];
          if (germanLevel && germanLevel !== "none") initialLanguages.push(`German (${germanLevel})`);

          await mvpSchema.from("talent_profiles").upsert({
            user_id: talentUserId,
            bio: formData.get("message") as string || null,
            skills: initialSkills,
            languages: initialLanguages,
            readiness_score: Math.min(experience * 10, 60), // Initial score from experience
            coach_rating: 0,
            availability: true,
            placement_status: "LEARNING",
          }, { onConflict: "user_id" });

          console.log("MVP talent profile created for:", talentUserId);
        } catch (mvpErr: any) {
          console.warn("MVP profile write skipped:", mvpErr?.message);
          // Non-blocking: don't fail the whole registration
        }
      }

      // 3. Send Confirmation Email & Notify Admin
      if (application) {
        await supabase.functions.invoke("send-unified-contact", {
          body: {
            role: "talent_career",
            name: application.name,
            email: application.email,
            phone: application.phone,
            country_city: application.country_city,
            message: application.message,
            type: "talent_pool_registration"
          },
        });

        // 4. Trigger AI Analysis
        await supabase.functions.invoke("extract-skills", {
          body: { applicationId: application.id },
        });
      }

      setIsSubmitted(true);
      toast({
        title: isGerman ? "Erfolgreich registriert!" : "Successfully registered!",
        description: isGerman
          ? "Willkommen im Talent Pool. Wir analysieren nun Ihre Unterlagen."
          : "Welcome to the Talent Pool. We are now analyzing your documents.",
      });

    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center gradient-hero pattern-overlay">
        <div className="container-custom section-padding">
          <motion.div
            className="max-w-md mx-auto text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-heading font-bold mb-4">
              {isGerman ? "Fast geschafft!" : "Almost there!"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {isGerman
                ? "Ihre Registrierung für den Talent Pool war erfolgreich. Unser KI-Agent analysiert nun Ihre Unterlagen."
                : "Your registration for the Talent Pool was successful. Our AI agent is now analyzing your documents."}
            </p>
            <Button asChild variant="outline">
              <a href="/dashboard">{isGerman ? "Zum Dashboard" : "Go to Dashboard"}</a>
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero pattern-overlay py-16 md:py-24">
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              {isGerman ? "Talent Pool Registrierung" : "Talent Pool Registration"}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? "Werden Sie Teil der Elite" : "Join the Elite Talent Pool"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {isGerman
                ? "Laden Sie Ihre Dokumente hoch و ستقوم تقنيات الذكاء الاصطناعي لدينا بتحليل مهاراتك ووضعك أمام كبرى الشركات."
                : "Upload your documents and our AI will analyze your skills to place you with top European employers."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Form */}
      <section className="py-12 md:py-20 -mt-12 relative z-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-primary/5 border-b py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-heading">
                        {isGerman ? "Ihre Informationen" : "Your Information"}
                      </CardTitle>
                      <CardDescription>
                        {isGerman ? "Bitte füllen Sie alle Felder aus" : "Please complete all fields below"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Info Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">{isGerman ? "Vollständiger Name" : "Full Name"} *</Label>
                        <Input id="name" name="name" required className="h-12" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{isGerman ? "E-Mail-Adresse" : "Email Address"} *</Label>
                        <Input id="email" name="email" type="email" required className="h-12" placeholder="john@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{isGerman ? "Telefonnummer" : "Phone Number"} *</Label>
                        <Input id="phone" name="phone" type="tel" required className="h-12" placeholder="+49..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">{isGerman ? "Wohnort (Stadt, Land)" : "Location (City, Country)"}</Label>
                        <Input id="location" name="location" className="h-12" placeholder="Casablanca, Morocco" />
                      </div>
                    </div>

                    {/* Recruitment Specific Info */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Languages className="h-4 w-4 text-primary" />
                          {isGerman ? "Deutsch-Niveau" : "German Level"}
                        </Label>
                        <Select name="german_level" defaultValue="none">
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None / A1</SelectItem>
                            <SelectItem value="A2">A2</SelectItem>
                            <SelectItem value="B1">B1</SelectItem>
                            <SelectItem value="B2">B2</SelectItem>
                            <SelectItem value="C1">C1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          {isGerman ? "SAP-Track" : "SAP Track"}
                        </Label>
                        <Select name="sap_track" defaultValue="other">
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select track" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FI">Financial (FI)</SelectItem>
                            <SelectItem value="MM">Materials (MM)</SelectItem>
                            <SelectItem value="SD">Sales (SD)</SelectItem>
                            <SelectItem value="BTP">Platform (BTP)</SelectItem>
                            <SelectItem value="ABAP">Dev (ABAP)</SelectItem>
                            <SelectItem value="other">Other / Not sure</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          {isGerman ? "Erfahrung (Jahre)" : "Experience (Years)"}
                        </Label>
                        <Input id="experience" name="experience" type="number" min="0" className="h-12" placeholder="0" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                        <Upload className="h-5 w-5 text-primary" />
                        {isGerman ? "Dokumente & Verifizierung" : "Documents & Verification"}
                      </h3>

                      {/* File Inputs - Custom UI */}
                      <div className="grid gap-6">
                        {/* CV Upload */}
                        <div className="space-y-2">
                          <Label className="flex justify-between items-center bg-background p-4 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {cvFile ? cvFile.name : (isGerman ? "Lebenslauf hochladen (PDF)" : "Upload CV (PDF)")}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase">Required *</p>
                              </div>
                            </div>
                            <Input
                              id="cv-upload"
                              type="file"
                              className="hidden"
                              accept=".pdf"
                              required
                              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                            />
                            <Button type="button" size="sm" variant="ghost" onClick={() => document.getElementById('cv-upload')?.click()}>Select</Button>
                          </Label>
                        </div>

                        {/* ID & Certs Grid */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-muted hover:border-primary/30 transition-all cursor-pointer bg-muted/5 group">
                            <UserIcon className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                            <span className="text-xs font-medium text-center">
                              {passportFile ? passportFile.name : (isGerman ? "Reisepass / ID" : "Passport / ID")}
                            </span>
                            <Input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                            />
                          </Label>

                          <Label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-muted hover:border-primary/30 transition-all cursor-pointer bg-muted/5 group">
                            <FileText className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                            <span className="text-xs font-medium text-center">
                              {certFile ? certFile.name : (isGerman ? "Zertifikate" : "Certificates")}
                            </span>
                            <Input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                            />
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="message">{isGerman ? "Zusätzliche Infos / Motivation" : "Additional Info / Motivation"}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder={isGerman ? "Beschreiben Sie kurz Ihre SAP-Erfahrungen..." : "Briefly describe your SAP experience..."}
                        className="resize-none"
                      />
                    </div>

                    <div className="pt-6">
                      <Button
                        type="submit"
                        className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 group"
                        disabled={isSubmitting || !cvFile}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {isGerman ? "Wird verarbeitet..." : "Processing..."}
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            {isGerman ? "Jetzt Registrieren" : "Register Now"}
                          </>
                        )}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground mt-4">
                        {isGerman
                          ? "Mit der Registrierung akzeptieren Sie unsere Datenschutzbestimmungen."
                          : "By registering, you agree to our privacy policy and terms."}
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Reminder */}
      <section className="py-20 bg-muted/30">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-background rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">Exklusiver Zugang</h3>
              <p className="text-sm text-muted-foreground">Zugang zu Stellen, die nicht öffentlich ausgeschrieben werden.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-background rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">Vorgeprüftes Profil</h3>
              <p className="text-sm text-muted-foreground">Unsere KI validiert Ihre Fähigkeiten für schnellere Vermittlung.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-background rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-primary/10">
                <ArrowRight className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">Direkte Verbindung</h3>
              <p className="text-sm text-muted-foreground">Wir bringen Sie direkt mit den HR-Entscheidern zusammen.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TalentPoolPage;
