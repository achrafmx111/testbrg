import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building, GraduationCap, Landmark, Handshake, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const partnerTypes = [
  {
    icon: Building,
    title: 'Training Centers',
    description: 'License our curriculum and methodology to offer German-standard SAP training at your institution.',
    benefits: ['Complete curriculum package', 'Trainer certification program', 'Marketing support', 'Quality assurance'],
  },
  {
    icon: GraduationCap,
    title: 'Universities',
    description: 'Integrate professional SAP training into academic programs and prepare students for industry careers.',
    benefits: ['Academic integration support', 'Student certification paths', 'Industry connections', 'Research collaboration'],
  },
  {
    icon: Landmark,
    title: 'Government Programs',
    description: 'Workforce development initiatives and employment programs that create real career outcomes.',
    benefits: ['Custom program design', 'Outcome tracking', 'Scalable delivery', 'Employment pathways'],
  },
];

const whyPartner = [
  { title: 'Proven Curriculum', description: 'German-designed, industry-validated SAP training programs' },
  { title: 'Realcore Backing', description: 'Powered by decades of German SAP consulting expertise' },
  { title: 'Career Outcomes', description: '92% placement rate through our TalentFlow network' },
  { title: 'Global Recognition', description: 'Certifications recognized in Germany and Europe' },
];

const Partners = () => {
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
              Strategic Partnerships
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {t('partners.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('partners.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                <Link to="/contact">
                  {t('partners.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partner Types Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Partnership Opportunities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Multiple ways to collaborate and expand your reach
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {partnerTypes.map((type, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full card-hover border-0 shadow-card">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-4">
                      <type.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl font-heading">{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {type.benefits.map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-center gap-2 text-sm text-muted-foreground">
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

      {/* Why Partner Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Why Partner With Us?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join a network backed by German excellence and proven outcomes
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyPartner.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card p-6 rounded-2xl shadow-card text-center"
              >
                <h3 className="font-heading font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
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
              Let's Explore Partnership Opportunities
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Contact us to discuss how we can collaborate and create value together.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/contact">
                {t('partners.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Partners;
