import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TalentPoolPage = () => {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  return (
    <section className="min-h-[70vh] flex items-center justify-center gradient-hero pattern-overlay">
      <div className="container-custom section-padding">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Construction className="h-20 w-20 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Talent Pool
          </h1>
          <div className="inline-block px-6 py-3 mb-8 rounded-full bg-secondary/20 text-foreground border border-secondary/30">
            <span className="text-lg font-medium">
              🚧 {isGerman ? 'Seite im Aufbau – Registrierung bald verfügbar' : 'Page under construction – Registration coming soon'}
            </span>
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            {isGerman 
              ? 'Wir arbeiten an Ihrem exklusiven Zugang zum SAP-Talentmarkt. Kontaktieren Sie uns für weitere Informationen.'
              : 'We are working on your exclusive access to the SAP talent market. Contact us for more information.'}
          </p>
          <Button asChild size="lg">
            <Link to="/contact">
              {isGerman ? 'Kontakt aufnehmen' : 'Get in Touch'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default TalentPoolPage;
