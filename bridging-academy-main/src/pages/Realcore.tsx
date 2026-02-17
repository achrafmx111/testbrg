import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Award, Users, Globe, CheckCircle, ExternalLink, Cpu, Building2, MapPin, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Award,
    title: 'Deep SAP Expertise',
    titleDe: 'Tiefgehende SAP-Expertise',
    description: '20+ years of SAP consulting experience across industries, from manufacturing to finance.',
    descriptionDe: '20+ Jahre SAP-Beratungserfahrung in allen Branchen, von der Fertigung bis zum Finanzwesen.',
  },
  {
    icon: Shield,
    title: 'Real Project Experience',
    titleDe: 'Echte Projekterfahrung',
    description: 'Our curriculum is built from actual enterprise implementations, not theoretical examples.',
    descriptionDe: 'Unser Lehrplan basiert auf echten Unternehmens­implementierungen, nicht auf theoretischen Beispielen.',
  },
  {
    icon: Cpu,
    title: 'SAP & AI Focus',
    titleDe: 'SAP & KI Fokus',
    description: 'Pioneering the integration of AI technologies with SAP solutions for next-gen business.',
    descriptionDe: 'Pionierarbeit bei der Integration von KI-Technologien mit SAP-Lösungen für Unternehmen der Zukunft.',
  },
  {
    icon: Globe,
    title: 'German Methodology',
    titleDe: 'Deutsche Methodik',
    description: 'Structured, thorough approach to professional development with measurable outcomes.',
    descriptionDe: 'Strukturierter, gründlicher Ansatz für professionelle Entwicklung mit messbaren Ergebnissen.',
  },
];

const achievements = [
  { text: '200+ SAP implementations', textDe: '200+ SAP-Implementierungen' },
  { text: 'Present in 12+ countries', textDe: 'Präsent in 12+ Ländern' },
  { text: 'S/4HANA expertise since day one', textDe: 'S/4HANA-Expertise seit Tag eins' },
  { text: 'BTP and cloud transformation specialists', textDe: 'BTP- und Cloud-Transformations­spezialisten' },
  { text: 'Long-term client relationships', textDe: 'Langfristige Kundenbeziehungen' },
  { text: 'Full SAP partner certification', textDe: 'Vollständige SAP-Partner­zertifizierung' },
];

const Realcore = () => {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  return (
    <>
      {/* Hero Section with Green Accent */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent"></div>
        <div className="container-custom section-padding relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-4 py-2 mb-6 text-sm font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {isGerman ? 'Strategischer Partner' : 'Strategic Partner'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              RealCore Group
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Die treibende Kraft hinter Bridging.Academy: Deutsches SAP-Consulting mit internationaler Reichweite.'
                : 'The driving force behind Bridging.Academy: German SAP consulting with international reach.'}
            </p>
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold text-lg px-8">
              <a href="https://realcore.de" target="_blank" rel="noopener noreferrer">
                {isGerman ? 'RealCore Website besuchen' : 'Visit RealCore Website'}
                <ExternalLink className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </motion.div>
        </div>
        {/* Green accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400"></div>
      </section>

      {/* About RealCore Group */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {isGerman ? 'Über die Gruppe' : 'About the Group'}
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                {isGerman ? 'Wer ist RealCore?' : 'Who is RealCore?'}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {isGerman 
                  ? 'Die RealCore Group ist eine führende deutsche SAP-Beratungsgruppe mit über 20 Jahren Erfahrung in der digitalen Transformation von Unternehmen.'
                  : 'The RealCore Group is a leading German SAP consulting group with over 20 years of experience in digital transformation.'}
              </p>
              <p className="text-muted-foreground mb-6">
                {isGerman 
                  ? 'Von der Zentrale in Deutschland aus hat RealCore Hunderte erfolgreicher SAP-Transformationen für Unternehmen in ganz Europa und darüber hinaus durchgeführt. Diese Praxiserfahrung fließt direkt in unseren Lehrplan ein.'
                  : 'From their headquarters in Germany, RealCore has delivered hundreds of successful SAP transformations for enterprises across Europe and beyond. This real-world experience directly informs our curriculum.'}
              </p>
              <Button asChild variant="outline" className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                <a href="https://realcore.de" target="_blank" rel="noopener noreferrer">
                  {isGerman ? 'RealCore Website besuchen' : 'Visit RealCore Website'}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-8 border border-emerald-200/50"
            >
              <h3 className="font-heading font-semibold text-foreground mb-6 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Track Record
              </h3>
              <ul className="space-y-4">
                {achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                    <span className="text-foreground">{isGerman ? achievement.textDe : achievement.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Group Vision */}
      <section className="section-padding bg-emerald-900 text-white">
        <div className="container-custom">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              {isGerman ? 'Die Vision der Gruppe' : 'Group Vision'}
            </h2>
            <p className="text-lg text-emerald-100 mb-8">
              {isGerman 
                ? 'RealCore verbindet deutsche Ingenieurskunst mit globaler Innovation. Unsere Mission: Unternehmen weltweit durch intelligente SAP-Lösungen und KI-Integration in die Zukunft führen.'
                : 'RealCore combines German engineering excellence with global innovation. Our mission: Leading companies worldwide into the future through intelligent SAP solutions and AI integration.'}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-emerald-800/50 rounded-xl p-6 border border-emerald-700/50">
                <Globe className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{isGerman ? 'Internationale Präsenz' : 'International Presence'}</h3>
                <p className="text-sm text-emerald-200">
                  {isGerman ? 'Aktiv in 12+ Ländern weltweit' : 'Active in 12+ countries worldwide'}
                </p>
              </div>
              <div className="bg-emerald-800/50 rounded-xl p-6 border border-emerald-700/50">
                <Cpu className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{isGerman ? 'SAP & KI Fokus' : 'SAP & AI Focus'}</h3>
                <p className="text-sm text-emerald-200">
                  {isGerman ? 'Zukunfts­technologien verbinden' : 'Connecting future technologies'}
                </p>
              </div>
              <div className="bg-emerald-800/50 rounded-xl p-6 border border-emerald-700/50">
                <Building2 className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{isGerman ? 'Enterprise Focus' : 'Enterprise Focus'}</h3>
                <p className="text-sm text-emerald-200">
                  {isGerman ? 'Lösungen für Großunternehmen' : 'Solutions for large enterprises'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* RealCore Morocco */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">🇲🇦</div>
                  <div className="text-5xl">🤝</div>
                  <div className="text-5xl">🇩🇪</div>
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">
                  {isGerman ? 'Die Brücke zwischen zwei Welten' : 'The Bridge Between Two Worlds'}
                </h3>
                <p className="text-emerald-100">
                  {isGerman 
                    ? 'RealCore Morocco verbindet deutsches Know-how mit marokkanischem Talent. Diese strategische Expansion schafft Chancen für beide Seiten.'
                    : 'RealCore Morocco connects German know-how with Moroccan talent. This strategic expansion creates opportunities for both sides.'}
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {isGerman ? 'Strategische Expansion' : 'Strategic Expansion'}
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                RealCore Morocco
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {isGerman 
                  ? 'Mit RealCore Morocco und der Bridging.Academy erweitert die Gruppe ihre Reichweite nach Afrika. Marokko dient als strategischer Hub, der Europa und den MENA-Raum verbindet.'
                  : 'With RealCore Morocco and Bridging.Academy, the group extends its reach to Africa. Morocco serves as a strategic hub connecting Europe and the MENA region.'}
              </p>
              <ul className="space-y-3">
                {[
                  isGerman ? 'Strategischer Standort zwischen Europa und Afrika' : 'Strategic location between Europe and Africa',
                  isGerman ? 'Talentpool für den europäischen Markt' : 'Talent pool for the European market',
                  isGerman ? 'Deutsche Qualitätsstandards vor Ort' : 'German quality standards on site',
                  isGerman ? 'Nearshoring-Hub für SAP-Projekte' : 'Nearshoring hub for SAP projects',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What This Means For You Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {isGerman ? 'Was das für dich bedeutet' : 'What This Means For You'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isGerman 
                ? 'Deutsche SAP-Expertise direkt in deiner Ausbildung'
                : 'German SAP expertise directly powering your education'}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full card-hover border-0 shadow-card border-t-4 border-t-emerald-500">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-lg font-heading">
                      {isGerman ? feature.titleDe : feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {isGerman ? feature.descriptionDe : feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Rocket className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {isGerman ? 'Erlebe deutsche SAP-Exzellenz' : 'Experience German SAP Excellence'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Starte deine Reise mit einem Training, das von echter deutscher SAP-Expertise angetrieben wird.'
                : 'Start your journey with training powered by real German SAP expertise.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-8">
                <Link to="/skillcore">
                  {isGerman ? 'Programme entdecken' : 'Explore Programs'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8">
                <a href="https://realcore.de" target="_blank" rel="noopener noreferrer">
                  {isGerman ? 'Mehr über RealCore' : 'More about RealCore'}
                  <ExternalLink className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Realcore;
