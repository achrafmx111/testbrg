import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Rocket, Clock, Users, Award, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const bootcamps = [
  {
    title: 'SAP BTP Intensive',
    duration: '12 Wochen',
    format: 'Hybrid',
    level: 'Anfänger',
    highlights: ['Cloud Fundamentals', 'Integration Suite', 'CAP Development', 'Praktische Projekte'],
    featured: true,
  },
  {
    title: 'S/4HANA Bootcamp',
    duration: '10 Wochen',
    format: 'Online',
    level: 'Fortgeschritten',
    highlights: ['Core Modules', 'Migration Strategies', 'Best Practices', 'Case Studies'],
    featured: false,
  },
  {
    title: 'ABAP & Fiori Development',
    duration: '8 Wochen',
    format: 'Präsenz',
    level: 'Fortgeschritten',
    highlights: ['Clean ABAP', 'RAP Framework', 'Fiori Elements', 'UI5 Basics'],
    featured: false,
  },
  {
    title: 'SAP Analytics Cloud',
    duration: '6 Wochen',
    format: 'Online',
    level: 'Anfänger',
    highlights: ['Data Modeling', 'Story Building', 'Planning', 'Predictive Analytics'],
    featured: false,
  },
];

const Bootcamps = () => {
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
              {isGerman ? 'Intensiv-Training' : 'Intensive Training'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? 'Programme & Bootcamps' : 'Programs & Bootcamps'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Intensive Lernprogramme, die Sie in kürzester Zeit auf SAP-Karrieren vorbereiten.'
                : 'Intensive learning programs that prepare you for SAP careers in the shortest time.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bootcamps Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {bootcamps.map((bootcamp, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`h-full card-hover border-0 shadow-card ${bootcamp.featured ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl font-heading">{bootcamp.title}</CardTitle>
                      {bootcamp.featured && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {bootcamp.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {bootcamp.format}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {bootcamp.level}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {bootcamp.highlights.map((highlight, hidx) => (
                        <li key={hidx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full mt-6">
                      <Link to="/skillcore">
                        {isGerman ? 'Details ansehen' : 'View Details'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
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
            <Rocket className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? 'Bereit für den nächsten Schritt?' : 'Ready for the Next Step?'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Kontaktieren Sie uns für eine persönliche Beratung zu unseren Bootcamps.'
                : 'Contact us for personal consultation about our bootcamps.'}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/contact">
                {isGerman ? 'Beratung buchen' : 'Book Consultation'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Bootcamps;
