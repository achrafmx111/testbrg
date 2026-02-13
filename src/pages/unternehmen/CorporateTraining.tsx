import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Users, Target, Award, CheckCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const offerings = [
  {
    icon: Target,
    title: 'Maßgeschneiderte Programme',
    description: 'Individuelle Schulungsprogramme, die auf die Bedürfnisse Ihres Unternehmens zugeschnitten sind.',
  },
  {
    icon: Users,
    title: 'Team-Trainings',
    description: 'Schulen Sie ganze Teams effizient und synchronisiert in SAP-Technologien.',
  },
  {
    icon: Award,
    title: 'Zertifizierungsvorbereitung',
    description: 'Bereiten Sie Ihre Mitarbeiter auf offizielle SAP-Zertifizierungen vor.',
  },
  {
    icon: BookOpen,
    title: 'Praxisorientiertes Lernen',
    description: 'Lernen anhand realer Szenarien und Projekte aus der Praxis.',
  },
];

const modules = [
  'SAP S/4HANA',
  'SAP BTP',
  'BW/4HANA',
  'SAC & Analytics',
  'SuccessFactors',
  'ABAP & Fiori',
];

const CorporateTraining = () => {
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
              {isGerman ? 'Für Unternehmen' : 'For Companies'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? 'Corporate Trainings' : 'Corporate Training'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Maßgeschneiderte SAP-Schulungen für Ihr Unternehmen – entwickelt und durchgeführt von deutschen Experten.'
                : 'Customized SAP training for your company – developed and delivered by German experts.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Offerings Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {offerings.map((offering, idx) => (
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
                        <offering.icon className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-heading">{offering.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{offering.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Modules */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {isGerman ? 'Verfügbare SAP-Module' : 'Available SAP Modules'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isGerman 
                ? 'Schulungen für alle wichtigen SAP-Technologien'
                : 'Training for all major SAP technologies'}
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {modules.map((module, idx) => (
              <motion.span
                key={idx}
                className="px-6 py-3 bg-background rounded-full shadow-card font-medium"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                {module}
              </motion.span>
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
            <Building2 className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? 'Individuelle Beratung für Ihr Unternehmen' : 'Individual Consultation for Your Company'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Lassen Sie uns gemeinsam Ihre SAP-Schulungsstrategie entwickeln.'
                : 'Let us develop your SAP training strategy together.'}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/unternehmen/anfrage">
                {isGerman ? 'Anfrage stellen' : 'Submit Inquiry'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default CorporateTraining;
