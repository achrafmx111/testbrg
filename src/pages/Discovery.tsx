import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Plane, Star, Users, MapPin, Calendar, Crown, Briefcase, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const packages = [
  {
    icon: Crown,
    title: 'Executive',
    price: 'From €8,500',
    duration: '5 days',
    features: [
      'Private 1-on-1 training',
      'Luxury riad accommodation',
      'Executive networking dinners',
      'Private cultural tours',
      'Airport VIP transfer',
      'Personal concierge',
    ],
    highlight: true,
  },
  {
    icon: Briefcase,
    title: 'Professional',
    price: 'From €4,500',
    duration: '5 days',
    features: [
      'Small group training (max 8)',
      '4-star hotel accommodation',
      'Networking events',
      'Guided city experiences',
      'Airport transfer',
      'Certificate ceremony',
    ],
    highlight: false,
  },
  {
    icon: Users,
    title: 'Group',
    price: 'From €2,800',
    duration: '5 days',
    features: [
      'Group training (max 15)',
      'Comfortable hotel stay',
      'Team-building activities',
      'Cultural excursions',
      'Shared transfers',
      'Group certification',
    ],
    highlight: false,
  },
];

const highlights = [
  {
    icon: MapPin,
    title: 'Marrakech & Beyond',
    description: 'Learn in stunning riads and modern facilities across Morocco\'s most inspiring locations.',
  },
  {
    icon: Star,
    title: 'World-Class Training',
    description: 'Same German-standard curriculum, delivered in an immersive, distraction-free environment.',
  },
  {
    icon: Heart,
    title: 'Cultural Immersion',
    description: 'Experience Moroccan hospitality, cuisine, and traditions while advancing your career.',
  },
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Multiple retreat dates throughout the year. Corporate groups can book custom dates.',
  },
];

const Discovery = () => {
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
              {t('discovery.hero.badge')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {t('discovery.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('discovery.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                <Link to="/contact">
                  {t('discovery.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Training + Tourism + Networking
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A unique blend of professional development and cultural discovery
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card p-6 rounded-2xl shadow-card"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Choose Your Experience
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three tiers designed for different needs and budgets
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`h-full card-hover border-0 shadow-card relative ${pkg.highlight ? 'ring-2 ring-secondary' : ''}`}>
                  {pkg.highlight && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pt-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4">
                      <pkg.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-heading">{pkg.title}</CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">{pkg.price}</span>
                      <span className="text-muted-foreground"> / {pkg.duration}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {pkg.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full mt-6" variant={pkg.highlight ? 'default' : 'outline'}>
                      <Link to="/contact">
                        Inquire Now
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
            <Plane className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Ready for an Unforgettable Learning Experience?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Contact us to learn about upcoming retreat dates and customize your Discovery+ experience.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/contact">
                {t('discovery.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Discovery;
