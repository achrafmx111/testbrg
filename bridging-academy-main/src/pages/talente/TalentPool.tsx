import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Briefcase, Globe, CheckCircle, Star, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const benefits = [
  {
    icon: Briefcase,
    title: 'Direkter Zugang zu Jobs',
    description: 'Exklusive Stellenangebote von unseren Partnerunternehmen in Deutschland und Europa.',
  },
  {
    icon: Globe,
    title: 'Internationale Vernetzung',
    description: 'Verbinden Sie sich mit SAP-Profis und Unternehmen weltweit.',
  },
  {
    icon: Star,
    title: 'Bevorzugte Vermittlung',
    description: 'Als Pool-Mitglied werden Sie bevorzugt an unsere Partner vermittelt.',
  },
  {
    icon: CheckCircle,
    title: 'Kontinuierliche Betreuung',
    description: 'Regelmäßige Updates zu passenden Positionen und Karrieremöglichkeiten.',
  },
];

const stats = [
  { value: '500+', label: 'Talente im Pool' },
  { value: '50+', label: 'Partnerunternehmen' },
  { value: '85%', label: 'Vermittlungsquote' },
  { value: '3 Monate', label: 'Ø Zeit bis Vermittlung' },
];

const TalentPool = () => {
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
              {isGerman ? 'Karriere-Netzwerk' : 'Career Network'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? 'Talent Pool' : 'Talent Pool'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Werden Sie Teil unseres exklusiven Netzwerks und erhalten Sie Zugang zu den besten SAP-Karrieremöglichkeiten.'
                : 'Become part of our exclusive network and gain access to the best SAP career opportunities.'}
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
              {isGerman ? 'Ihre Vorteile im Talent Pool' : 'Your Benefits in the Talent Pool'}
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
            <Users className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? 'Jetzt dem Talent Pool beitreten' : 'Join the Talent Pool Now'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Registrieren Sie sich kostenlos und starten Sie Ihre internationale SAP-Karriere.'
                : 'Register for free and start your international SAP career.'}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/talent-pool">
                {isGerman ? 'Kostenlos registrieren' : 'Register for Free'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default TalentPool;
