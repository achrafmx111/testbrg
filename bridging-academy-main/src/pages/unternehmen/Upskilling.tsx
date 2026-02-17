import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, RefreshCw, Target, Users, CheckCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const approaches = [
  {
    icon: TrendingUp,
    title: 'Upskilling',
    description: 'Erweitern Sie die Fähigkeiten Ihrer Mitarbeiter mit neuen SAP-Technologien und -Modulen.',
    points: ['Neue SAP-Module lernen', 'Cloud-Technologien', 'Moderne Entwicklung'],
  },
  {
    icon: RefreshCw,
    title: 'Reskilling',
    description: 'Qualifizieren Sie Mitarbeiter aus anderen Bereichen für SAP-Rollen um.',
    points: ['Karrierewechsel ermöglichen', 'IT-Quereinsteiger', 'Branchenwechsler'],
  },
];

const benefits = [
  { icon: Target, text: 'Individuelle Lernpfade' },
  { icon: Users, text: 'Team-synchronisiertes Lernen' },
  { icon: Lightbulb, text: 'Praxisnahe Projekte' },
  { icon: CheckCircle, text: 'Zertifizierte Abschlüsse' },
];

const Upskilling = () => {
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
              {isGerman ? 'Mitarbeiterentwicklung' : 'Employee Development'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? 'Upskilling & Reskilling' : 'Upskilling & Reskilling'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Entwickeln Sie Ihre Belegschaft weiter und bereiten Sie sie auf die SAP-Zukunft vor.'
                : 'Develop your workforce and prepare them for the SAP future.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                className="text-center p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <benefit.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">{benefit.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Approaches */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {approaches.map((approach, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full card-hover border-0 shadow-card">
                  <CardHeader>
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <approach.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-heading">{approach.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">{approach.description}</p>
                    <ul className="space-y-2">
                      {approach.points.map((point, pidx) => (
                        <li key={pidx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
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
            <TrendingUp className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? 'Entwickeln Sie Ihr Team weiter' : 'Develop Your Team Further'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Kontaktieren Sie uns für ein maßgeschneidertes Entwicklungsprogramm.'
                : 'Contact us for a customized development program.'}
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

export default Upskilling;
