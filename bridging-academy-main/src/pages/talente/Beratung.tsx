import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Users, MessageCircle, Calendar, CheckCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const services = [
  {
    icon: FileText,
    title: 'CV-Check & Optimierung',
    description: 'Professionelle Überprüfung und Optimierung Ihres Lebenslaufs nach deutschen Standards.',
  },
  {
    icon: Users,
    title: 'Interview-Coaching',
    description: 'Individuelle Vorbereitung auf Vorstellungsgespräche mit echten Branchenexperten.',
  },
  {
    icon: MessageCircle,
    title: 'Karriereberatung',
    description: 'Persönliche Beratung zu Ihren Karrierezielen und dem optimalen Weg dorthin.',
  },
  {
    icon: Calendar,
    title: 'Bewerbungsstrategie',
    description: 'Entwicklung einer maßgeschneiderten Strategie für Ihre Jobsuche in Deutschland.',
  },
];

const steps = [
  { step: '01', title: 'Erstgespräch', description: 'Kostenlose 30-minütige Beratung' },
  { step: '02', title: 'Analyse', description: 'Bewertung Ihrer Qualifikationen und Ziele' },
  { step: '03', title: 'Strategie', description: 'Entwicklung eines individuellen Plans' },
  { step: '04', title: 'Begleitung', description: 'Kontinuierliche Unterstützung bis zum Erfolg' },
];

const Beratung = () => {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

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
              {isGerman ? 'Persönliche Betreuung' : 'Personal Support'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? 'Bewerbung & Beratung' : 'Application & Consulting'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Individuelle Karriereberatung und Bewerbungsunterstützung für Ihren Erfolg im SAP-Markt.'
                : 'Individual career consulting and application support for your success in the SAP market.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full card-hover border-0 shadow-card">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <service.icon className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-heading">{service.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {isGerman ? 'Unser Beratungsprozess' : 'Our Consulting Process'}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                className="text-center p-6 bg-background rounded-2xl shadow-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <span className="text-4xl font-heading font-bold text-primary/20">{step.step}</span>
                <h3 className="font-heading font-semibold text-lg mt-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding gradient-primary text-primary-foreground">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Phone className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? 'Kostenlose Erstberatung' : 'Free Initial Consultation'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Vereinbaren Sie jetzt Ihr kostenloses 30-minütiges Beratungsgespräch.'
                : 'Schedule your free 30-minute consultation now.'}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/contact">
                {isGerman ? 'Termin buchen' : 'Book Appointment'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Beratung;
