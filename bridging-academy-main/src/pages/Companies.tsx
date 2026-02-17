import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Users, GraduationCap, Globe, CheckCircle, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const services = [
  {
    icon: GraduationCap,
    title: 'Corporate Training',
    description: 'Upskill your workforce with customized SAP training programs designed for your specific business needs.',
    features: ['Custom curriculum design', 'On-site or remote delivery', 'Progress tracking & reporting', 'Certification preparation'],
  },
  {
    icon: Users,
    title: 'Talent Placement',
    description: 'Access pre-vetted, trained SAP professionals ready for your projects. Skip the lengthy recruitment process.',
    features: ['Pre-screened candidates', 'Technical assessments included', 'Cultural fit evaluation', '90-day placement guarantee'],
  },
  {
    icon: Globe,
    title: 'Nearshoring Teams',
    description: 'Build dedicated SAP teams in Morocco with German standards. Cost-effective without compromising quality.',
    features: ['Dedicated team setup', 'German project management', 'Same timezone as Europe', 'Scalable resources'],
  },
];

const benefits = [
  'German methodology and quality standards',
  'Real-world project experience',
  'Multilingual professionals (EN, DE, FR, AR)',
  'Cost-effective compared to European rates',
  'Cultural alignment with European business practices',
  'Continuous support and talent pipeline',
];

const Companies = () => {
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
              Business Solutions
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {t('companies.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('companies.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                <Link to="/contact">
                  {t('companies.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              How We Support Your Business
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive SAP solutions tailored for corporate needs
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
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
                      <service.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl font-heading">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" />
                          {feature}
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

      {/* Benefits Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                Why Partner With Bridging.Academy?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We combine German SAP expertise with Moroccan talent to deliver exceptional value for your business.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground"
            >
              <Briefcase className="h-12 w-12 mb-6 opacity-80" />
              <h3 className="text-2xl font-heading font-bold mb-4">
                Ready to Discuss Your Needs?
              </h3>
              <p className="opacity-90 mb-6">
                Schedule a consultation with our business solutions team to explore how we can support your SAP initiatives.
              </p>
              <Button asChild variant="secondary" size="lg">
                <Link to="/contact">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
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
            <Building2 className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Let's Build Your SAP Success Story
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join the growing list of companies leveraging our talent and training solutions.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/contact">
                {t('companies.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Companies;
