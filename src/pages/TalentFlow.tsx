import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Users, FileText, MessageSquare, Plane, 
  Briefcase, Building2, Globe, CheckCircle, TrendingUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const services = [
  {
    icon: FileText,
    title: 'German-Style CV',
    description: 'Professional CV preparation following German standards and expectations. Photo, format, and content optimized for the German job market.',
  },
  {
    icon: MessageSquare,
    title: 'Interview Preparation',
    description: 'Mock interviews with industry experts. Cultural training for German business etiquette and communication styles.',
  },
  {
    icon: Plane,
    title: 'Visa & Relocation',
    description: 'Complete guidance for German work visa applications, including documentation, appointments, and relocation support.',
  },
  {
    icon: Briefcase,
    title: 'Job Placement',
    description: 'Direct access to our network of partner companies actively hiring SAP professionals in Germany and Europe.',
  },
];

const partnerLogos = [
  'SAP Partner Company',
  'German Tech Corp',
  'EU Consulting Group',
  'Digital Solutions GmbH',
  'Enterprise Systems AG',
  'Innovation Partners',
];

const stats = [
  { value: '92%', label: 'Placement Rate' },
  { value: '45', label: 'Partner Companies' },
  { value: '3 months', label: 'Average Time to Job' },
  { value: '15+', label: 'Countries' },
];

const TalentFlow = () => {
  const { t } = useTranslation();

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
              {t('talentflow.hero.badge')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {t('talentflow.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('talentflow.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                <Link to="/contact">
                  {t('talentflow.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-4"
              >
                <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Complete Career Support
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to transition from training to your dream SAP career
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full card-hover border-0 shadow-card">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                      <service.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl font-heading">{service.title}</CardTitle>
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

      {/* How It Works Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Your Path to Germany
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A structured journey from training completion to job placement
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {[
              { step: 1, title: 'Complete Training', description: 'Finish your SkillCore certification and get TalentFlow eligible' },
              { step: 2, title: 'Profile Preparation', description: 'German CV, LinkedIn optimization, and portfolio development' },
              { step: 3, title: 'Interview Training', description: 'Mock interviews, cultural training, and communication coaching' },
              { step: 4, title: 'Company Matching', description: 'We connect you with our partner companies based on your profile' },
              { step: 5, title: 'Visa & Relocation', description: 'Full support for visa application and moving to Germany' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-6 mb-8"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {item.step}
                  </div>
                  {idx < 4 && <div className="w-0.5 h-12 bg-primary/20 mx-auto mt-2" />}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Companies Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Our Partner Companies
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leading SAP employers actively hiring our graduates
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {partnerLogos.map((logo, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-muted/50 p-6 rounded-xl flex items-center justify-center h-24"
              >
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
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
            <TrendingUp className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Ready to Launch Your SAP Career?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join TalentFlow and let us connect you with your dream job in Germany and Europe.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/contact">
                {t('talentflow.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default TalentFlow;
