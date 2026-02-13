import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Handshake, Building2, GraduationCap, Globe, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const partnerTypes = [
  {
    icon: Building2,
    title: 'Unternehmen',
    description: 'Werden Sie Talent-Partner und erhalten Sie Zugang zu qualifizierten SAP-Fachkräften.',
    benefits: ['Exklusiver Talent-Zugang', 'Maßgeschneiderte Vermittlung', 'Langfristige Partnerschaft'],
  },
  {
    icon: GraduationCap,
    title: 'Bildungseinrichtungen',
    description: 'Integrieren Sie unser SAP-Curriculum in Ihre Programme und erweitern Sie Ihr Angebot.',
    benefits: ['Lizenziertes Curriculum', 'Train-the-Trainer', 'Zertifizierungspartnerschaft'],
  },
  {
    icon: Globe,
    title: 'Regierungen & NGOs',
    description: 'Fördern Sie Beschäftigung und digitale Kompetenz durch SAP-Qualifizierung.',
    benefits: ['Beschäftigungsprogramme', 'Jugendförderung', 'Wirtschaftsentwicklung'],
  },
];

const whyPartner = [
  'Zugang zum deutschen SAP-Markt',
  'Realcore-Expertise im Rücken',
  'Bewährtes Curriculum',
  'Internationale Anerkennung',
];

const Partner = () => {
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
              {isGerman ? 'Partnerschaft' : 'Partnership'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {isGerman ? 'Partner werden' : 'Become a Partner'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Erweitern Sie Ihre Reichweite durch strategische Zusammenarbeit mit Bridging.Academy.'
                : 'Expand your reach through strategic collaboration with Bridging.Academy.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((type, idx) => (
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
                      <type.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-heading">{type.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{type.description}</p>
                    <ul className="space-y-2">
                      {type.benefits.map((benefit, bidx) => (
                        <li key={bidx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" />
                          {benefit}
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

      {/* Why Partner */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {isGerman ? 'Warum mit uns kooperieren?' : 'Why Partner With Us?'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {whyPartner.map((reason, idx) => (
              <motion.div
                key={idx}
                className="text-center p-6 bg-background rounded-2xl shadow-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <CheckCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
                <p className="font-medium text-sm">{reason}</p>
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
            <Handshake className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? 'Partnerschaft beginnen' : 'Start Partnership'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Lassen Sie uns gemeinsam die SAP-Welt transformieren.'
                : 'Let us transform the SAP world together.'}
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

export default Partner;
