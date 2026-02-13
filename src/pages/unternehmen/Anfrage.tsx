import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send, Building2, Mail, Phone, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const inquiryTypes = [
  { value: 'training', label: 'Corporate Training' },
  { value: 'talent', label: 'Talent Pool / Vermittlung' },
  { value: 'upskilling', label: 'Upskilling / Reskilling' },
  { value: 'partnership', label: 'Partnerschaft' },
  { value: 'other', label: 'Sonstiges' },
];

const Anfrage = () => {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      phone: formData.get('phone') as string,
      type: formData.get('type') as string,
      message: formData.get('message') as string,
    };

    try {
      const { error } = await supabase.functions.invoke('send-contact-message', {
        body: {
          name: data.name,
          email: data.email,
          subject: `[Unternehmensanfrage - ${data.type}] von ${data.company}`,
          message: `Firma: ${data.company}\nTelefon: ${data.phone}\n\n${data.message}`,
        },
      });

      if (error) throw error;

      toast.success(isGerman ? 'Anfrage erfolgreich gesendet!' : 'Inquiry sent successfully!');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error(isGerman ? 'Fehler beim Senden. Bitte versuchen Sie es erneut.' : 'Error sending. Please try again.');
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
            <span className="inline-block px-4 py-2 mb-6 text-sm font-medium rounded-full bg-secondary/20 text-primary border border-secondary/30">
              {isGerman ? 'Für Unternehmen' : 'For Companies'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? 'Anfrage stellen' : 'Submit Inquiry'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Teilen Sie uns Ihre Anforderungen mit und wir melden uns innerhalb von 24 Stunden.'
                : 'Share your requirements and we will get back to you within 24 hours.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading text-center">
                    {isGerman ? 'Kontaktformular' : 'Contact Form'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {isGerman ? 'Name' : 'Name'}
                        </label>
                        <Input name="name" required placeholder={isGerman ? 'Ihr Name' : 'Your name'} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {isGerman ? 'Unternehmen' : 'Company'}
                        </label>
                        <Input name="company" required placeholder={isGerman ? 'Firmenname' : 'Company name'} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {isGerman ? 'E-Mail' : 'Email'}
                        </label>
                        <Input name="email" type="email" required placeholder="email@company.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {isGerman ? 'Telefon' : 'Phone'}
                        </label>
                        <Input name="phone" placeholder="+49 123 456789" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {isGerman ? 'Art der Anfrage' : 'Type of Inquiry'}
                      </label>
                      <select 
                        name="type" 
                        required
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">{isGerman ? 'Bitte wählen' : 'Please select'}</option>
                        {inquiryTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {isGerman ? 'Ihre Nachricht' : 'Your Message'}
                      </label>
                      <Textarea 
                        name="message" 
                        required 
                        rows={5}
                        placeholder={isGerman ? 'Beschreiben Sie Ihre Anforderungen...' : 'Describe your requirements...'}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        isGerman ? 'Wird gesendet...' : 'Sending...'
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {isGerman ? 'Anfrage senden' : 'Send Inquiry'}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Anfrage;
