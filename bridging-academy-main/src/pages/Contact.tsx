import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
    answer:
      "Most beginner courses have no prerequisites. Intermediate and advanced courses require prior SAP experience or completion of foundational courses.",
  },
  {
    question: "Are the certifications recognized internationally?",
    answer:
      "Yes, our certifications are designed following German standards and are recognized by employers across Europe and internationally.",
  },
  {
    question: "Can I study while working full-time?",
    answer:
      "Absolutely. We offer flexible learning options including evening classes, weekend sessions, and self-paced online modules.",
  },
  {
    question: "How does the TalentFlow job placement work?",
    answer:
      "After completing your certification, you become eligible for TalentFlow. We help with CV preparation, interview coaching, and connect you with our partner companies.",
  },
  {
    question: "Do you offer corporate training for companies?",
    answer:
      "Yes, we offer customized training programs for companies. Contact us to discuss your specific requirements.",
  },
  {
    question: "What languages are courses available in?",
    answer:
      "Courses are primarily offered in English, with some available in German, French, and Arabic. Contact us for language-specific availability.",
  },
];

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const contactData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const { data, error } = await supabase.functions.invoke("send-contact-message", {
        body: contactData,
      });

      if (error) throw error;

      toast({
        title: t("contact.form.success"),
        description: "We'll get back to you within 24 hours.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
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
              {t("contact.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{t("contact.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t("contact.form.name")}</label>
                        <Input name="name" placeholder="John Doe" required />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t("contact.form.email")}</label>
                        <Input name="email" type="email" placeholder="john@example.com" required />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t("contact.form.phone")}</label>
                      <Input name="phone" type="tel" placeholder="+49 123 456 789" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t("contact.form.subject")}</label>
                      <Input name="subject" placeholder="How can we help?" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t("contact.form.message")}</label>
                      <Textarea name="message" placeholder="Tell us about your goals and questions..." rows={5} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          {t("contact.form.submit")}
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info & Calendly */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Contact Info */}
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading">{t("contact.info.title")}</CardTitle>
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
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">{t("footer.faq")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our programs
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="bg-card rounded-lg border-0 shadow-card px-6">
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Community Join Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-heading">{t("community.title")}</CardTitle>
                <p className="text-muted-foreground">{t("community.subtitle")}</p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t("community.form.name")}</label>
                      <Input placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t("community.form.email")}</label>
                      <Input type="email" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("community.form.interest")}</label>
                    <Input placeholder="e.g., SAP FI/CO, S/4HANA, ABAP Development" />
                  </div>
                  <Button type="submit" className="w-full">
                    {t("community.form.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Contact;
