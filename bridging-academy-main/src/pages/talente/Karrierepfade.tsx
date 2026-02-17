import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Target, TrendingUp, Award, Briefcase, GraduationCap, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const careerPaths = [
  {
    icon: Target,
    title: 'SAP Consultant',
    description: 'Beratung von Unternehmen bei SAP-Implementierungen und -Optimierungen.',
    duration: '6-12 Monate',
    salary: '€50.000 - €80.000',
  },
  {
    icon: TrendingUp,
    title: 'SAP Developer',
    description: 'Entwicklung maßgeschneiderter SAP-Lösungen mit ABAP, RAP und CAP.',
    duration: '8-14 Monate',
    salary: '€55.000 - €85.000',
  },
  {
    icon: Briefcase,
    title: 'SAP Project Manager',
    description: 'Leitung von SAP-Transformationsprojekten in Unternehmen.',
    duration: '12-18 Monate',
    salary: '€70.000 - €100.000',
  },
  {
    icon: Award,
    title: 'SAP Architect',
    description: 'Design komplexer SAP-Systemlandschaften und -Integrationen.',
    duration: '18-24 Monate',
    salary: '€80.000 - €120.000',
  },
];

const Karrierepfade = () => {
  const { t, i18n } = useTranslation();
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
              {isGerman ? 'Für Talente' : 'For Talents'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? 'SAP Karrierepfade' : 'SAP Career Paths'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Entdecken Sie die vielfältigen Karrieremöglichkeiten im SAP-Ökosystem und finden Sie Ihren Weg zum Erfolg.'
                : 'Discover the diverse career opportunities in the SAP ecosystem and find your path to success.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Career Paths Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {careerPaths.map((path, idx) => (
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
                        <path.icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-heading">{path.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{path.duration}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{path.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        {isGerman ? 'Gehaltsspanne' : 'Salary Range'}
                      </span>
                      <span className="font-semibold text-primary">{path.salary}</span>
                    </div>
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
            <GraduationCap className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? 'Starten Sie Ihre SAP-Karriere' : 'Start Your SAP Career'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Unsere Programme bereiten Sie auf alle diese Karrierewege vor.'
                : 'Our programs prepare you for all these career paths.'}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/skillcore">
                {isGerman ? 'Programme entdecken' : 'Explore Programs'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Karrierepfade;
