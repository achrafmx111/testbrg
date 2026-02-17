import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Send, Loader2, CheckCircle, Calendar, ArrowRight,
  GraduationCap, Globe, BookOpen, Clock, Award, FileText, Upload, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCourseOptions, getCourseBySlug, type CourseConfig } from "@/config/courses";

const learningModeOptions = [
  { value: "online", label: "Online", labelDe: "Online" },
  { value: "onsite", label: "Onsite", labelDe: "Vor Ort" },
  { value: "hybrid", label: "Hybrid", labelDe: "Hybrid" },
];

const Apply = () => {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === "de";
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const courseOptions = getCourseOptions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedCourseData, setSelectedCourseData] = useState<CourseConfig | null>(null);
  const [learningMode, setLearningMode] = useState<string>("");
  const [extraFieldValues, setExtraFieldValues] = useState<Record<string, string | string[]>>({});

  // Honeypot field for spam protection
  const [honeypot, setHoneypot] = useState("");

  // Pre-select course from URL parameter
  useEffect(() => {
    const courseParam = searchParams.get("course");
    if (courseParam && courseOptions.some(c => c.slug === courseParam)) {
      setSelectedCourse(courseParam);
    }
  }, [searchParams, courseOptions]);

  // Update course data when selection changes
  useEffect(() => {
    if (selectedCourse) {
      const course = getCourseBySlug(selectedCourse);
      setSelectedCourseData(course || null);
      setExtraFieldValues({}); // Reset extra fields when course changes
    } else {
      setSelectedCourseData(null);
    }
  }, [selectedCourse]);

  const handleExtraFieldChange = (fieldId: string, value: string | string[]) => {
    setExtraFieldValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: string, optionValue: string, checked: boolean) => {
    setExtraFieldValues(prev => {
      const current = (prev[fieldId] as string[]) || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, optionValue] };
      } else {
        return { ...prev, [fieldId]: current.filter(v => v !== optionValue) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Spam protection - if honeypot is filled, silently reject
    if (honeypot) {
      setIsSubmitted(true);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const applicationData = {
      type: "course_application",
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      country_city: formData.get("country_city") as string,
      course_slug: selectedCourse,
      course_name: selectedCourseData?.titleDe || selectedCourse,
      learning_mode: learningMode,
      message: formData.get("message") as string,
      extra_fields: extraFieldValues,
    };

    try {
      const { error } = await supabase.functions.invoke("send-unified-contact", {
        body: applicationData,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: isGerman ? "Bewerbung eingereicht!" : "Application submitted!",
        description: isGerman
          ? "Wir melden uns in Kürze bei Ihnen."
          : "We'll get back to you soon.",
      });
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: isGerman ? "Fehler" : "Error",
        description: isGerman
          ? "Bewerbung konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
          : "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="relative overflow-hidden gradient-hero pattern-overlay">
        <div className="container-custom section-padding">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {isGerman ? "Vielen Dank! 🎉" : "Thank You! 🎉"}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {isGerman
                ? "Wir haben Ihre Bewerbung erhalten und melden uns zeitnah persönlich bei Ihnen."
                : "We've received your application and will contact you personally soon."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/contactus">
                  <Calendar className="mr-2 h-5 w-5" />
                  {isGerman ? "Beratungsgespräch buchen" : "Book a Consultation"}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/skillcore">
                  {isGerman ? "Zur Kursübersicht" : "View All Courses"}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero pattern-overlay">
        <div className="container-custom section-padding">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
              <GraduationCap className="h-4 w-4" />
              {isGerman ? "Kursanmeldung" : "Course Application"}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? "Jetzt bewerben" : "Apply Now"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman
                ? "Starten Sie Ihre SAP-Karriere mit professioneller Ausbildung nach deutschen Standards."
                : "Start your SAP career with professional training following German standards."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Course Summary Box */}
              {selectedCourseData && (
                <Card className="border-2 border-primary/20 bg-primary/5 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <Badge className="mb-2">{selectedCourseData.categoryLabelDe}</Badge>
                        <h3 className="text-xl font-heading font-bold text-foreground">
                          {selectedCourseData.titleDe}
                        </h3>
                      </div>
                      {selectedCourseData.isPremium && (
                        <Badge variant="secondary">Premium</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{selectedCourseData.durationDe}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>{selectedCourseData.levelDe}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span>{selectedCourseData.language.split('/')[0].trim()}</span>
                      </div>
                      {selectedCourseData.price && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{selectedCourseData.price}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-elegant">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                    {isGerman ? "Kursanmeldung" : "Course Application"}
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-2">
                    {isGerman
                      ? "Füllen Sie das Formular aus – wir melden uns persönlich bei Ihnen."
                      : "Fill out the form – we'll contact you personally."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Honeypot field - hidden from users */}
                    <input
                      type="text"
                      name="company_website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    {/* Course Selection */}
                    <div className="space-y-2">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {isGerman ? "Kurs auswählen" : "Select Course"} *
                      </Label>
                      <Select
                        value={selectedCourse}
                        onValueChange={setSelectedCourse}
                        required
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder={isGerman ? "Kurs auswählen" : "Select a course"} />
                        </SelectTrigger>
                        <SelectContent>
                          {courseOptions.map((course) => (
                            <SelectItem key={course.slug} value={course.slug}>
                              {isGerman ? course.titleDe : course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide border-b pb-2">
                        {isGerman ? "Persönliche Daten" : "Personal Information"}
                      </h4>

                      <div className="space-y-2">
                        <Label htmlFor="name">{isGerman ? "Vollständiger Name" : "Full Name"} *</Label>
                        <Input id="name" name="name" required placeholder="Max Mustermann" className="h-12" />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">{isGerman ? "E-Mail" : "Email"} *</Label>
                          <Input id="email" name="email" type="email" required placeholder="max@example.com" className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">{isGerman ? "Telefon / WhatsApp" : "Phone / WhatsApp"} *</Label>
                          <Input id="phone" name="phone" type="tel" required placeholder="+49 170 1234567" className="h-12" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country_city">{isGerman ? "Land / Stadt" : "Country / City"}</Label>
                        <Input id="country_city" name="country_city" placeholder={isGerman ? "Deutschland, Berlin" : "Germany, Berlin"} className="h-12" />
                      </div>
                    </div>

                    {/* Learning Mode */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide border-b pb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {isGerman ? "Bevorzugtes Lernformat" : "Preferred Learning Mode"}
                      </h4>
                      <RadioGroup value={learningMode} onValueChange={setLearningMode} className="grid grid-cols-3 gap-3">
                        {learningModeOptions.map((mode) => (
                          <Label
                            key={mode.value}
                            htmlFor={`mode-${mode.value}`}
                            className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${learningMode === mode.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                              }`}
                          >
                            <RadioGroupItem value={mode.value} id={`mode-${mode.value}`} className="sr-only" />
                            <span className="font-medium">{isGerman ? mode.labelDe : mode.label}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Course-Specific Extra Fields */}
                    {selectedCourseData?.extraFields && selectedCourseData.extraFields.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide border-b pb-2">
                          {isGerman ? "Zusätzliche Angaben" : "Additional Information"}
                        </h4>

                        {selectedCourseData.extraFields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label className="text-sm font-medium">
                              {isGerman ? field.labelDe : field.label}
                              {field.required && " *"}
                            </Label>

                            {field.type === 'select' && field.options && (
                              <Select
                                value={(extraFieldValues[field.id] as string) || ""}
                                onValueChange={(value) => handleExtraFieldChange(field.id, value)}
                              >
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder={isGerman ? "Bitte auswählen" : "Please select"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {isGerman ? option.labelDe : option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            {field.type === 'radio' && field.options && (
                              <RadioGroup
                                value={(extraFieldValues[field.id] as string) || ""}
                                onValueChange={(value) => handleExtraFieldChange(field.id, value)}
                                className="grid sm:grid-cols-3 gap-2"
                              >
                                {field.options.map((option) => (
                                  <Label
                                    key={option.value}
                                    htmlFor={`${field.id}-${option.value}`}
                                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors text-sm ${extraFieldValues[field.id] === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                      }`}
                                  >
                                    <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                                    <span>{isGerman ? option.labelDe : option.label}</span>
                                  </Label>
                                ))}
                              </RadioGroup>
                            )}

                            {field.type === 'checkbox' && field.options && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {field.options.map((option) => {
                                  const currentValues = (extraFieldValues[field.id] as string[]) || [];
                                  return (
                                    <Label
                                      key={option.value}
                                      htmlFor={`${field.id}-${option.value}`}
                                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors text-sm ${currentValues.includes(option.value) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                        }`}
                                    >
                                      <Checkbox
                                        id={`${field.id}-${option.value}`}
                                        checked={currentValues.includes(option.value)}
                                        onCheckedChange={(checked) => handleCheckboxChange(field.id, option.value, checked as boolean)}
                                      />
                                      <span>{isGerman ? option.labelDe : option.label}</span>
                                    </Label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">{isGerman ? "Nachricht (optional)" : "Message (optional)"}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={4}
                        placeholder={isGerman
                          ? "Erzählen Sie uns von Ihren Zielen und Erwartungen..."
                          : "Tell us about your goals and expectations..."}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-lg"
                        disabled={isSubmitting || !selectedCourse}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {isGerman ? "Wird gesendet..." : "Submitting..."}
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            {isGerman ? "Bewerbung absenden" : "Submit Application"}
                          </>
                        )}
                      </Button>
                      <p className="text-center text-sm text-muted-foreground mt-3">
                        {isGerman
                          ? "Unverbindlich & kostenlos – wir melden uns zeitnah bei Ihnen."
                          : "No commitment – we'll get back to you soon."}
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Apply Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {isGerman ? "Warum bei uns bewerben?" : "Why Apply With Us?"}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: isGerman ? "Deutsche Standards" : "German Standards",
                description: isGerman
                  ? "Ausbildung nach höchsten deutschen Qualitätsstandards"
                  : "Training following the highest German quality standards",
              },
              {
                title: isGerman ? "Praxisorientiert" : "Practice-Oriented",
                description: isGerman
                  ? "Lernen an echten SAP-Systemen mit realen Projekten"
                  : "Learn on real SAP systems with real projects",
              },
              {
                title: isGerman ? "Karriereunterstützung" : "Career Support",
                description: isGerman
                  ? "Vermittlung an Partner-Unternehmen nach Abschluss"
                  : "Placement with partner companies after completion",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-0 shadow-card text-center">
                  <CardContent className="pt-8 pb-6">
                    <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding gradient-primary text-primary-foreground">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? "Noch Fragen?" : "Have Questions?"}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              {isGerman
                ? "Unser Team berät Sie gerne persönlich zu allen Kursen und Karrierewegen."
                : "Our team is happy to advise you personally on all courses and career paths."}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/contactus">
                {isGerman ? "Kontakt aufnehmen" : "Get in Touch"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Apply;
