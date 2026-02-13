import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Heart, Lightbulb, Users, Shield, Zap, Target, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Values = () => {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  const values = [
    {
      icon: Award,
      title: isGerman ? 'Exzellenz' : 'Excellence',
      description: isGerman 
        ? 'Deutsche Präzision in allem, was wir tun. Keine Abkürzungen, keine Kompromisse.'
        : 'German precision in everything we do. No shortcuts, no compromises.',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      icon: Heart,
      title: isGerman ? 'Integrität' : 'Integrity',
      description: isGerman 
        ? 'Ehrliche Beratung für jeden Studenten. Dein Erfolg ist unser Maßstab.'
        : 'Honest guidance for every student. Your success is our measure.',
      color: 'bg-red-500/10 text-red-600',
    },
    {
      icon: Lightbulb,
      title: isGerman ? 'Innovation' : 'Innovation',
      description: isGerman 
        ? 'Moderne Methoden für moderne Karrieren. Immer am Puls des SAP-Ökosystems.'
        : 'Modern methods for modern careers. Always evolving with the SAP ecosystem.',
      color: 'bg-yellow-500/10 text-yellow-600',
    },
    {
      icon: Users,
      title: isGerman ? 'Gemeinschaft' : 'Community',
      description: isGerman 
        ? 'Gemeinsam erreichen wir mehr. Ein Netzwerk, das unterstützt und fördert.'
        : 'Together we achieve more. A network that supports and elevates.',
      color: 'bg-green-500/10 text-green-600',
    },
    {
      icon: Shield,
      title: isGerman ? 'Qualität' : 'Quality',
      description: isGerman 
        ? 'Höchste Standards in Ausbildung und Betreuung. Made in Germany.'
        : 'Highest standards in training and support. Made in Germany.',
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      icon: Globe,
      title: isGerman ? 'Globalität' : 'Globality',
      description: isGerman 
        ? 'Denken ohne Grenzen. Talente weltweit mit Chancen verbinden.'
        : 'Thinking without borders. Connecting talent worldwide with opportunities.',
      color: 'bg-cyan-500/10 text-cyan-600',
    },
  ];

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
              {isGerman ? 'Unsere Überzeugungen' : 'Our Beliefs'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? 'Unsere Werte' : 'Our Values'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Die Prinzipien, die alles leiten, was wir tun – von der Ausbildung bis zur Karrierebegleitung.'
                : 'The principles that guide everything we do – from training to career support.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full card-hover border-0 shadow-card">
                  <CardContent className="pt-8 pb-8">
                    <div className={`w-16 h-16 rounded-xl ${value.color} flex items-center justify-center mb-6`}>
                      <value.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <blockquote className="text-2xl md:text-3xl font-heading font-medium text-foreground italic mb-6">
              {isGerman 
                ? '"Wir glauben, dass jeder Mensch das Potenzial hat, Großes zu erreichen – mit der richtigen Ausbildung und den richtigen Verbindungen."'
                : '"We believe that every person has the potential to achieve greatness – with the right training and the right connections."'}
            </blockquote>
            <p className="text-muted-foreground">— Bridging.Academy Team</p>
          </motion.div>
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
            <Heart className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? 'Erlebe unsere Werte' : 'Experience Our Values'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Werde Teil einer Gemeinschaft, die auf Exzellenz und gegenseitigem Respekt aufbaut.'
                : 'Join a community built on excellence and mutual respect.'}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/contact">
                {isGerman ? 'Kontakt aufnehmen' : 'Get in Touch'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Values;
