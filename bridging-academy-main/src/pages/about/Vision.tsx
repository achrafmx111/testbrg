import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Sparkles, Eye, Rocket, Globe, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Vision = () => {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  const visionPoints = [
    {
      icon: Globe,
      title: isGerman ? 'Globale Reichweite' : 'Global Reach',
      description: isGerman 
        ? 'SAP-Talente aus Marokko mit Unternehmen weltweit verbinden.'
        : 'Connecting SAP talent from Morocco with companies worldwide.',
    },
    {
      icon: Users,
      title: isGerman ? 'Brücken bauen' : 'Building Bridges',
      description: isGerman 
        ? 'Die Lücke zwischen deutschem Wissen und marokkanischem Potenzial schließen.'
        : 'Closing the gap between German expertise and Moroccan potential.',
    },
    {
      icon: Rocket,
      title: isGerman ? 'Karrieren transformieren' : 'Transforming Careers',
      description: isGerman 
        ? 'Menschen befähigen, erstklassige SAP-Professionals zu werden.'
        : 'Empowering individuals to become world-class SAP professionals.',
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
              {isGerman ? 'Unsere Überzeugung' : 'Our Belief'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? 'Vision & Mission' : 'Vision & Mission'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Wir glauben an eine Welt, in der Talent keine Grenzen kennt und Bildung Brücken baut.'
                : 'We believe in a world where talent knows no borders and education builds bridges.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-primary text-primary-foreground rounded-2xl p-10"
            >
              <Target className="h-14 w-14 mb-6 opacity-80" />
              <h2 className="text-3xl font-heading font-bold mb-4">
                {isGerman ? 'Unsere Mission' : 'Our Mission'}
              </h2>
              <p className="text-lg opacity-90 mb-6">
                {isGerman 
                  ? 'Wir bilden die nächste Generation von SAP-Experten aus, indem wir deutsches Know-how mit marokkanischem Talent verbinden.'
                  : 'We train the next generation of SAP experts by combining German know-how with Moroccan talent.'}
              </p>
              <p className="opacity-80">
                {isGerman 
                  ? 'Durch praxisnahe Ausbildung, echte Projekte und direkte Verbindungen zu europäischen Unternehmen schaffen wir nachhaltige Karrieren.'
                  : 'Through practical training, real projects, and direct connections to European companies, we create sustainable careers.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-muted/50 rounded-2xl p-10"
            >
              <Sparkles className="h-14 w-14 mb-6 text-secondary" />
              <h2 className="text-3xl font-heading font-bold mb-4">
                {isGerman ? 'Unsere Vision' : 'Our Vision'}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {isGerman 
                  ? 'Bridging.Academy als führende SAP-Akademie etablieren, die Talente aus dem MENA-Raum mit der globalen Wirtschaft verbindet.'
                  : 'Establish Bridging.Academy as the leading SAP academy connecting talent from the MENA region with the global economy.'}
              </p>
              <p className="text-muted-foreground">
                {isGerman 
                  ? 'Made in Germany. Based in Morocco. Serving the World.'
                  : 'Made in Germany. Based in Morocco. Serving the World.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision Points */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {isGerman ? 'Wofür wir stehen' : 'What We Stand For'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {visionPoints.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-0 shadow-card text-center">
                  <CardContent className="pt-8 pb-8">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <point.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold mb-3">{point.title}</h3>
                    <p className="text-muted-foreground">{point.description}</p>
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
            <Eye className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? 'Werde Teil unserer Vision' : 'Be Part of Our Vision'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Starte deine SAP-Karriere mit uns und werde Teil der Brücke zwischen Europa und Afrika.'
                : 'Start your SAP career with us and become part of the bridge between Europe and Africa.'}
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

export default Vision;
