import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Phone, MapPin, MessageCircle, Send, Loader2,
  User, GraduationCap, Building2, Briefcase, Globe, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mvp } from "@/integrations/supabase/mvp";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "info@bridging.academy",
    href: "mailto:info@bridging.academy",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+212719715080",
    href: "tel:+212719715080",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Chat with us",
    href: "https://wa.me/212719715080",
  },
  {
    icon: MapPin,
    title: "Locations",
    value: "Germany & Morocco",
    href: null,
  },
];

const faqs = [
  {
    question: "What are the prerequisites for joining a course?",
    answer: "Most beginner courses have no prerequisites. Intermediate and advanced courses require prior SAP experience or completion of foundational courses.",
  },
  {
    question: "Are the certifications recognized internationally?",
    answer: "Yes, our certifications are designed following German standards and are recognized by employers across Europe and internationally.",
  },
  {
    question: "Can I study while working full-time?",
    answer: "Absolutely. We offer flexible learning options including evening classes, weekend sessions, and self-paced online modules.",
  },
  {
    question: "How does the TalentFlow job placement work?",
    answer: "After completing your certification, you become eligible for TalentFlow. We help with CV preparation, interview coaching, and connect you with our partner companies.",
  },
  {
    question: "Do you offer corporate training for companies?",
    answer: "Yes, we offer customized training programs for companies. Contact us to discuss your specific requirements.",
  },
];

// Talent & Career form options
const currentStatusOptions = [
  { value: "student", label: "Student" },
  { value: "graduate", label: "Graduate" },
  { value: "professional", label: "Working Professional" },
];

const areaOfInterestOptions = [
  { value: "s4hana", label: "SAP S/4HANA" },
  { value: "bw4hana", label: "BW/4HANA & Datasphere" },
  { value: "btp", label: "SAP BTP" },
  { value: "sac", label: "SAC & Analytics" },
  { value: "abap", label: "ABAP / Fiori" },
];

const learningModeOptions = [
  { value: "online", label: "Online" },
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
];

const germanLevelOptions = [
  { value: "a0", label: "A0 (No German)" },
  { value: "a1", label: "A1 (Beginner)" },
  { value: "a2", label: "A2 (Elementary)" },
  { value: "b1", label: "B1 (Intermediate)" },
  { value: "b2", label: "B2 (Upper Intermediate)" },
  { value: "c1", label: "C1 (Advanced)" },
];

// Business & Partnerships form options
const businessSubcategoryOptions = [
  { value: "corporate", label: "Corporate / Company" },
  { value: "partner", label: "Partner" },
  { value: "university", label: "University / Academy" },
  { value: "hotel", label: "Hotel / Venue" },
  { value: "other", label: "Other Institution" },
];

const inquiryTypeOptions = [
  { value: "training", label: "Corporate Training" },
  { value: "partnership", label: "Partnership" },
  { value: "nearshoring", label: "Nearshoring" },
  { value: "event", label: "Event / Bootcamp Hosting" },
];

type RoleType = "talent_career" | "business_partnerships" | null;

const ContactUs = () => {
  const { t, i18n } = useTranslation();
  const isGerman = i18n.language === "de";
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);

  // Honeypot field for spam protection
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Spam protection - if honeypot is filled, silently reject
    if (honeypot) {
      toast({
        title: isGerman ? "Nachricht gesendet!" : "Message sent!",
        description: isGerman ? "Wir melden uns in Kürze." : "We'll get back to you soon.",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    let contactData: Record<string, any> = {
      role: selectedRole,
    };

    if (selectedRole === "talent_career") {
      contactData = {
        ...contactData,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        country_city: formData.get("country_city") as string,
        current_status: formData.get("current_status") as string,
        area_of_interest: formData.get("area_of_interest") as string,
        learning_mode: formData.get("learning_mode") as string,
        german_level: formData.get("german_level") as string,
        message: formData.get("message") as string,
        subject: "Talent Inquiry"
      };
    } else if (selectedRole === "business_partnerships") {
      contactData = {
        ...contactData,
        organization_name: formData.get("organization_name") as string,
        website: formData.get("website") as string,
        contact_person: formData.get("contact_person") as string,
        role_position: formData.get("role_position") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        subcategory: formData.get("subcategory") as string,
        inquiry_type: formData.get("inquiry_type") as string,
        message: formData.get("message") as string,
        subject: "Business Inquiry"
      };
    }

    try {
      // 1. Save to Supabase Database
      const { error: dbError } = await supabase
        .from('contacts')
        .insert({
          name: contactData.name || contactData.contact_person, // Handle difference in field names
          email: contactData.email,
          phone: contactData.phone,
          subject: contactData.subject,
          message: contactData.message,
          role: contactData.role,
          organization_name: contactData.organization_name,
          website: contactData.website,
          status: 'new'
        });

      if (dbError) {
        console.error("Database Error:", dbError);
        throw new Error(isGerman ? "Fehler beim Speichern der Nachricht." : "Error saving message.");
      }

      // 2. Send Email via Edge Function
      const { error: emailError } = await supabase.functions.invoke("send-unified-contact", {
        body: contactData,
      });

      if (emailError) {
        console.error("Email Error:", emailError);
        // We don't throw here if DB save was successful
      }

      toast({
        title: isGerman ? "Nachricht gesendet!" : "Message sent!",
        description: isGerman
          ? "Wir melden uns innerhalb von 24 Stunden."
          : "We'll get back to you within 24 hours.",
      });
      (e.target as HTMLFormElement).reset();
      setSelectedRole(null);
    } catch (error: any) {
      toast({
        description: error.message || (isGerman
          ? "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
          : "Failed to send message."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // State for company registration toggle
  const [isRegistering, setIsRegistering] = useState(false);

  // Registration handler
  const handleRegistration = async (formData: FormData) => {
    // 1. Extract raw data
    const rawData = {
      company_name: formData.get("organization_name"),
      contact_name: formData.get("contact_person"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      industry: formData.get("subcategory"),
      website: formData.get("website"),
      country: isGerman ? "Germany" : "International",
    };

    // 2. Validate with Zod
    // Dynamic import to avoid top-level if simple, but we can import at top.
    // Assuming imported at top. I will add import in next step or use require if needed?
    // Better to add import at top. But replace_file_content is block based. 
    // I'll assume I can add import in another block or use fully qualified if I didn't import.
    // I'll add the import in a separate call or just use a dynamic import/require? No, that's messy in Vite.
    // I'll do two chunks.

    // logic continued...
    const { registrationRequestSchema } = await import("@/lib/zodSchemas");
    const result = registrationRequestSchema.safeParse(rawData);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: result.error.errors[0].message
      });
      return;
    }

    try {
      // Create Registration Request
      await mvp.createRegistrationRequest({
        ...result.data,
        status: "PENDING"
      });

      // Success Message
      toast({
        title: isGerman ? "Anfrage gesendet!" : "Request Sent!",
        description: isGerman
          ? "Wir prüfen Ihre Registrierung und melden uns in Kürze."
          : "We are reviewing your registration and will get back to you shortly.",
      });

      setIsRegistering(false); // Reset form mode
      (document.querySelector('form') as HTMLFormElement)?.reset();

    } catch (error: any) {
      console.error("Registration Request Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit registration request."
      });
    }
  };

  // Modified submit wrapper
  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (honeypot) return;

    setIsSubmitting(true);
    try {
      if (selectedRole === "business_partnerships" && isRegistering) {
        await handleRegistration(new FormData(e.currentTarget));
      } else {
        await handleSubmit(e);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? "Kontaktieren Sie uns" : "Contact Us"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman
                ? "Ob Talent oder Unternehmen – wir freuen uns auf Ihre Nachricht."
                : "Whether you're a talent or a business – we'd love to hear from you."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading">
                    {isGerman ? "Nachricht senden" : "Send us a Message"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onFormSubmit} className="space-y-6">
                    {/* Honeypot field - hidden from users */}
                    <input
                      type="text"
                      name="website_url"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    {/* Role Selection */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">
                        {isGerman ? "Wer sind Sie?" : "Who are you?"} *
                      </Label>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div
                          onClick={() => setSelectedRole("talent_career")}
                          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedRole === "talent_career"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedRole === "talent_career"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                              }`}>
                              <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {isGerman ? "Talent & Karriere" : "Talent & Career"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {isGerman
                                  ? "Training · Zertifizierung · SAP Karrieren"
                                  : "Training · Certification · SAP Careers"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() => setSelectedRole("business_partnerships")}
                          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedRole === "business_partnerships"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedRole === "business_partnerships"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                              }`}>
                              <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {isGerman ? "Business & Partnerschaften" : "Business & Partnerships"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {isGerman
                                  ? "Corporate · Institutionen · Strategische Partner"
                                  : "Corporate · Institutions · Strategic Partners"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Form Fields */}
                    <AnimatePresence mode="wait">
                      {selectedRole === "talent_career" && (
                        <motion.div
                          key="talent-form"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6"
                        >
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">{isGerman ? "Vollständiger Name" : "Full Name"} *</Label>
                              <Input id="name" name="name" required placeholder="Max Mustermann" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">{isGerman ? "E-Mail" : "Email"} *</Label>
                              <Input id="email" name="email" type="email" required placeholder="max@example.com" />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="phone">{isGerman ? "Telefon / WhatsApp" : "Phone / WhatsApp"} *</Label>
                              <Input id="phone" name="phone" type="tel" required placeholder="+49 170 1234567" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="country_city">{isGerman ? "Land / Stadt" : "Country / City"}</Label>
                              <Input id="country_city" name="country_city" placeholder="Deutschland, Berlin" />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{isGerman ? "Aktueller Status" : "Current Status"}</Label>
                              <Select name="current_status">
                                <SelectTrigger>
                                  <SelectValue placeholder={isGerman ? "Bitte wählen" : "Please select"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {currentStatusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>{isGerman ? "Interessensgebiet" : "Area of Interest"}</Label>
                              <Select name="area_of_interest">
                                <SelectTrigger>
                                  <SelectValue placeholder={isGerman ? "Bitte wählen" : "Please select"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {areaOfInterestOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{isGerman ? "Bevorzugtes Lernformat" : "Preferred Learning Mode"}</Label>
                              <RadioGroup name="learning_mode" className="flex gap-4">
                                {learningModeOptions.map((opt) => (
                                  <div key={opt.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={opt.value} id={`mode - ${opt.value} `} />
                                    <Label htmlFor={`mode - ${opt.value} `} className="cursor-pointer">{opt.label}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                            <div className="space-y-2">
                              <Label>{isGerman ? "Deutschniveau" : "German Level"}</Label>
                              <Select name="german_level">
                                <SelectTrigger>
                                  <SelectValue placeholder="A0 – C1" />
                                </SelectTrigger>
                                <SelectContent>
                                  {germanLevelOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message">{isGerman ? "Nachricht (optional)" : "Message (optional)"}</Label>
                            <Textarea
                              id="message"
                              name="message"
                              rows={4}
                              placeholder={isGerman
                                ? "Erzählen Sie uns von Ihren Zielen und Fragen..."
                                : "Tell us about your goals and questions..."}
                            />
                          </div>
                        </motion.div>
                      )}

                      {selectedRole === "business_partnerships" && (
                        <motion.div
                          key="business-form"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6"
                        >
                          <div className="flex items-center space-x-2 border p-4 rounded-lg bg-muted/30">
                            <input
                              type="checkbox"
                              id="register-toggle"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={isRegistering}
                              onChange={(e) => setIsRegistering(e.target.checked)}
                            />
                            <Label htmlFor="register-toggle" className="flex-1 cursor-pointer font-medium">
                              {isGerman ? "Als Unternehmen im Portal registrieren" : "Register as a Company in Portal"}
                              <span className="block text-xs text-muted-foreground font-normal">
                                {isGerman
                                  ? "Erhalten Sie Zugang zu unserem Talentpool und verwalten Sie Stellenanzeigen."
                                  : "Get access to our talent pool and manage job postings."}
                              </span>
                            </Label>
                          </div>

                          <div className="space-y-2">
                            <Label>{isGerman ? "Art der Organisation" : "Organization Type"}</Label>
                            <Select name="subcategory" defaultValue="corporate">
                              <SelectTrigger>
                                <SelectValue placeholder={isGerman ? "Bitte wählen" : "Please select"} />
                              </SelectTrigger>
                              <SelectContent>
                                {businessSubcategoryOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="organization_name">{isGerman ? "Organisationsname" : "Organization Name"} *</Label>
                              <Input id="organization_name" name="organization_name" required placeholder="Firma GmbH" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="website">{isGerman ? "Webseite (optional)" : "Website (optional)"}</Label>
                              <Input id="website" name="website" type="url" placeholder="https://example.com" />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="contact_person">{isGerman ? "Ansprechpartner" : "Contact Person"} *</Label>
                              <Input id="contact_person" name="contact_person" required placeholder="Max Mustermann" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="role_position">{isGerman ? "Position / Rolle" : "Role / Position"}</Label>
                              <Input id="role_position" name="role_position" placeholder="HR Manager" />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="email">{isGerman ? "E-Mail" : "Email"} *</Label>
                              <Input id="email" name="email" type="email" required placeholder="contact@company.com" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">{isGerman ? "Telefon / WhatsApp" : "Phone / WhatsApp"}</Label>
                              <Input id="phone" name="phone" type="tel" placeholder="+49 123 456789" />
                            </div>
                          </div>

                          {isRegistering && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                              <Label htmlFor="password">{isGerman ? "Passwort erstellen" : "Create Password"} *</Label>
                              <Input id="password" name="password" type="password" required minLength={6} placeholder="******" />
                              <p className="text-xs text-muted-foreground">Min. 6 characters</p>
                            </div>
                          )}

                          {!isRegistering && (
                            <div className="space-y-2">
                              <Label>{isGerman ? "Art der Anfrage" : "Type of Inquiry"}</Label>
                              <Select name="inquiry_type">
                                <SelectTrigger>
                                  <SelectValue placeholder={isGerman ? "Bitte wählen" : "Please select"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {inquiryTypeOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="message">{isGerman ? "Nachricht (optional)" : "Message (optional)"}</Label>
                            <Textarea
                              id="message"
                              name="message"
                              rows={4}
                              placeholder={isGerman
                                ? "Beschreiben Sie Ihre Anforderungen..."
                                : "Describe your requirements..."}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    {selectedRole && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isGerman ? "Wird gesendet..." : "Sending..."}
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              {isGerman ? "Nachricht senden" : "Send Message"}
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-card sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xl font-heading">
                    {isGerman ? "Kontaktdaten" : "Contact Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo.map((info, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">{info.title}</div>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="font-medium hover:text-primary transition-colors"
                            target={info.href.startsWith("http") ? "_blank" : undefined}
                            rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          >
                            {info.value}
                          </a>
                        ) : (
                          <span className="font-medium">{info.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {isGerman ? "Häufige Fragen" : "Frequently Asked Questions"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isGerman
                ? "Antworten auf häufig gestellte Fragen zu unseren Programmen"
                : "Find answers to common questions about our programs"}
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item - ${idx} `}
                  className="bg-card rounded-lg border-0 shadow-card px-6"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactUs;
