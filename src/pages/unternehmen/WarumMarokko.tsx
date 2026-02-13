import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Globe2, Clock, Plane, Euro, GraduationCap, Languages, Sun, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const advantages = [
  {
    icon: Clock,
    title: 'Gleiche Zeitzone',
    description: 'Nur 1-2 Stunden Zeitunterschied zu Mitteleuropa – perfekt für Echtzeit-Zusammenarbeit.',
  },
  {
    icon: Plane,
    title: 'Kurze Flugzeit',
    description: 'Nur 3-4 Stunden Flug von deutschen Städten – ideal für regelmäßige Vor-Ort-Besuche.',
  },
  {
    icon: Euro,
    title: 'Kosteneffizienz',
    description: 'Wettbewerbsfähige Kosten bei hoher Qualität – optimales Preis-Leistungs-Verhältnis.',
  },
  {
    icon: GraduationCap,
    title: 'Qualifizierte Talente',
    description: 'Starkes Bildungssystem mit technisch orientierten Universitäten und Fachschulen.',
  },
  {
    icon: Languages,
    title: 'Sprachkompetenz',
    description: 'Mehrsprachige Talente: Französisch, Arabisch, Englisch – und zunehmend Deutsch.',
  },
  {
    icon: Sun,
    title: 'Kulturelle Nähe',
    description: 'Europäisch orientierte Arbeitskultur mit Verständnis für deutsche Geschäftspraktiken.',
  },
];

const facts = [
  'Freihandelsabkommen mit der EU',
  'Stabile politische Lage',
  'Wachsender IT-Sektor',
  'Deutsche Unternehmen bereits vor Ort',
  'Investitionsfreundliches Klima',
  'Moderne Infrastruktur',
];

const WarumMarokko = () => {
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
              🇲🇦 {isGerman ? 'Standort-Vorteile' : 'Location Benefits'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? 'Warum Marokko?' : 'Why Morocco?'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Entdecken Sie die strategischen Vorteile Marokkos als Nearshoring-Standort für SAP-Expertise.'
                : 'Discover the strategic advantages of Morocco as a nearshoring location for SAP expertise.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Advantages Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full card-hover border-0 shadow-card">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <advantage.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-heading">{advantage.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{advantage.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facts Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                {isGerman ? 'Marokko auf einen Blick' : 'Morocco at a Glance'}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {isGerman 
                  ? 'Marokko hat sich als führender Nearshoring-Standort für europäische Unternehmen etabliert.'
                  : 'Morocco has established itself as a leading nearshoring location for European companies.'}
              </p>
              <ul className="space-y-4">
                {facts.map((fact, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-background rounded-2xl p-8 shadow-card"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🇲🇦 ↔️ 🇩🇪</div>
                <h3 className="font-heading font-semibold text-xl mb-2">
                  {isGerman ? 'Brücke nach Europa' : 'Bridge to Europe'}
                </h3>
                <p className="text-muted-foreground">
                  {isGerman 
                    ? 'Made in Germany. Based in Morocco.'
                    : 'Made in Germany. Based in Morocco.'}
                </p>
              </div>
            </motion.div>
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
            <Globe2 className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? 'Entdecken Sie die Möglichkeiten' : 'Discover the Possibilities'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Lassen Sie uns über Ihre Nearshoring-Strategie sprechen.'
                : 'Let us discuss your nearshoring strategy.'}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/unternehmen/anfrage">
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

export default WarumMarokko;
