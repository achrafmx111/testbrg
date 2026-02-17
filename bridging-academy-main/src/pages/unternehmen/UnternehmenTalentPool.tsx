import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, CheckCircle, Clock, Award, Shield, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const benefits = [
  {
    icon: CheckCircle,
    title: 'Vorgeprüfte Kandidaten',
    description: 'Alle Talente durchlaufen einen strengen Prüfungsprozess und sind zertifiziert.',
  },
  {
    icon: Clock,
    title: 'Schnelle Besetzung',
    description: 'Reduzieren Sie die Time-to-Hire mit unserem Ready-to-Work Talent Pool.',
  },
  {
    icon: Award,
    title: 'Deutsche Standards',
    description: 'Nach deutschen Qualitätsstandards ausgebildete SAP-Fachkräfte.',
  },
  {
    icon: Shield,
    title: 'Garantierte Qualität',
    description: '90 Tage Garantie auf alle vermittelten Kandidaten.',
  },
];

const stats = [
  { value: '500+', label: 'Verfügbare Talente' },
  { value: '< 2 Wochen', label: 'Ø Besetzungszeit' },
  { value: '95%', label: 'Zufriedenheit' },
  { value: '6+', label: 'SAP-Module' },
];

const UnternehmenTalentPool = () => {
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
              {isGerman ? 'Talent Pool für Unternehmen' : 'Talent Pool for Companies'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Zugang zu vorgeprüften, zertifizierten SAP-Talenten für Ihre Projekte und Teams.'
                : 'Access to pre-vetted, certified SAP talent for your projects and teams.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                className="text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <p className="text-3xl md:text-4xl font-heading font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {isGerman ? 'Ihre Vorteile' : 'Your Benefits'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, idx) => (
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
                        <benefit.icon className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-heading">{benefit.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
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
            <Briefcase className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? 'Finden Sie Ihr nächstes SAP-Talent' : 'Find Your Next SAP Talent'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Teilen Sie uns Ihre Anforderungen mit und wir finden die passenden Kandidaten.'
                : 'Share your requirements and we will find the right candidates.'}
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

export default UnternehmenTalentPool;
