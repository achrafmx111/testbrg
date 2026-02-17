import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Heart, Lightbulb, Users, MapPin, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const values = [
  {
    icon: Award,
    title: 'Excellence',
    description: 'German precision in everything we do. No shortcuts, no compromises.',
  },
  {
    icon: Heart,
    title: 'Integrity',
    description: 'Honest guidance for every student. Your success is our measure.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Modern methods for modern careers. Always evolving with the SAP ecosystem.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Together we achieve more. A network that supports and elevates.',
  },
];

const team = [
  {
    name: 'Dr. Marcus Weber',
    role: 'Founding Director',
    description: 'Former SAP Principal Consultant with 20+ years in enterprise transformations.',
  },
  {
    name: 'Fatima El-Amrani',
    role: 'Head of Academy',
    description: 'Educational leader bridging German methodology with regional expertise.',
  },
  {
    name: 'Thomas Müller',
    role: 'Technical Director',
    description: 'S/4HANA architect leading curriculum development and certification paths.',
  },
  {
    name: 'Youssef Benali',
    role: 'Career Success Director',
    description: 'TalentFlow lead connecting graduates with German employers.',
  },
];

const locations = [
  { flag: '🇩🇪', name: 'Germany', description: 'Headquarters & Strategic Direction' },
  { flag: '🇲🇦', name: 'Morocco', description: 'Academy Campus & Operations' },
  { flag: '🌍', name: 'Global', description: 'Remote Learning & Partner Network' },
];

const About = () => {
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
              Our Story
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {t('about.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('about.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-primary text-primary-foreground rounded-2xl p-8"
            >
              <Target className="h-12 w-12 mb-6 opacity-80" />
              <h2 className="text-2xl font-heading font-bold mb-4">{t('about.mission.title')}</h2>
              <p className="opacity-90">{t('about.mission.description')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-muted/50 rounded-2xl p-8"
            >
              <Sparkles className="h-12 w-12 mb-6 text-secondary" />
              <h2 className="text-2xl font-heading font-bold mb-4">{t('about.vision.title')}</h2>
              <p className="text-muted-foreground">{t('about.vision.description')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('about.values.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full card-hover border-0 shadow-card text-center">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-primary mx-auto flex items-center justify-center mb-4">
                      <value.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg font-heading">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Leadership Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experienced professionals dedicated to your success
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-muted/50 rounded-2xl p-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-primary/50" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-secondary mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Our Presence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Made in Germany. Based in Morocco. Serving the world.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {locations.map((location, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card rounded-2xl p-6 text-center shadow-card"
              >
                <div className="text-4xl mb-3">{location.flag}</div>
                <h3 className="font-heading font-semibold text-foreground mb-1">{location.name}</h3>
                <p className="text-sm text-muted-foreground">{location.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Join Our Journey
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Whether you're a student, company, or partner, we'd love to connect with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link to="/contact">
                  Get in Touch
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/skillcore">
                  Explore Programs
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default About;
