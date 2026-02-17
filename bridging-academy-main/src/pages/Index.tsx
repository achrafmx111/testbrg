import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Plane, Users, Award, Globe, Shield, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
const fadeInUp = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0
  },
  transition: {
    duration: 0.5
  }
};
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
const Index = () => {
  const {
    t
  } = useTranslation();
  const stats = [{
    value: t('hero.stats.students'),
    label: t('hero.stats.studentsLabel')
  }, {
    value: t('hero.stats.partners'),
    label: t('hero.stats.partnersLabel')
  }, {
    value: t('hero.stats.placement'),
    label: t('hero.stats.placementLabel')
  }, {
    value: t('hero.stats.countries'),
    label: t('hero.stats.countriesLabel')
  }];
  const pillars = [{
    icon: BookOpen,
    title: t('pillars.skillcore.title'),
    tagline: t('pillars.skillcore.tagline'),
    description: t('pillars.skillcore.description'),
    features: t('pillars.skillcore.features', {
      returnObjects: true
    }) as string[],
    cta: t('pillars.skillcore.cta'),
    path: '/skillcore',
    color: 'bg-primary'
  }, {
    icon: Plane,
    title: t('pillars.discovery.title'),
    tagline: t('pillars.discovery.tagline'),
    description: t('pillars.discovery.description'),
    features: t('pillars.discovery.features', {
      returnObjects: true
    }) as string[],
    cta: t('pillars.discovery.cta'),
    path: '/discovery',
    color: 'bg-secondary'
  }, {
    icon: Users,
    title: t('pillars.talentflow.title'),
    tagline: t('pillars.talentflow.tagline'),
    description: t('pillars.talentflow.description'),
    features: t('pillars.talentflow.features', {
      returnObjects: true
    }) as string[],
    cta: t('pillars.talentflow.cta'),
    path: '/talentflow',
    color: 'bg-accent'
  }];
  const features = [{
    icon: Award,
    ...getFeature('germanStandards')
  }, {
    icon: Shield,
    ...getFeature('realProjects')
  }, {
    icon: GraduationCap,
    ...getFeature('careerFocus')
  }, {
    icon: Globe,
    ...getFeature('globalNetwork')
  }];
  function getFeature(key: string) {
    return {
      title: t(`features.${key}.title`),
      description: t(`features.${key}.description`)
    };
  }
  return <>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero pattern-overlay">
        <div className="container-custom section-padding">
          <motion.div className="max-w-4xl mx-auto text-center" initial="initial" animate="animate" variants={staggerContainer}>
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <span className="inline-block px-4 py-2 mb-6 text-sm font-medium rounded-full bg-secondary/20 text-primary border border-secondary/30">
                {t('hero.badge')}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6" variants={fadeInUp}>
              {t('hero.title')}{' '}
              <span className="text-primary">{t('hero.titleHighlight')}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto" variants={fadeInUp}>
              {t('hero.subtitle')}
            </motion.p>

            {/* Slogan */}
            <motion.p className="text-xl md:text-2xl font-heading font-semibold mb-8" style={{
            color: '#f5993d'
          }} variants={fadeInUp}>
              {t('hero.slogan')}
            </motion.p>

            {/* CTAs */}
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeInUp}>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                <Link to="/skillcore">
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/contact">{t('hero.ctaSecondary')}</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.5,
          duration: 0.5
        }}>
            {stats.map((stat, idx) => <div key={idx} className="text-center p-4 rounded-xl bg-card shadow-card">
                <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>)}
          </motion.div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div className="text-center mb-12" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('pillars.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pillars.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar, idx) => <motion.div key={idx} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: idx * 0.1
          }}>
                <Card className="h-full card-hover border-0 shadow-card">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl ${pillar.color} flex items-center justify-center mb-4`}>
                      <pillar.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl font-heading">{pillar.title}</CardTitle>
                    <CardDescription className="text-sm font-medium text-secondary">
                      {pillar.tagline}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">{pillar.description}</p>
                    <ul className="space-y-2">
                      {pillar.features.map((feature, fIdx) => <li key={fIdx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          {feature}
                        </li>)}
                    </ul>
                    <Button asChild variant="outline" className="w-full mt-4">
                      <Link to={pillar.path}>
                        {pillar.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Why Bridging.Academy Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div className="text-center mb-12" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => <motion.div key={idx} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: idx * 0.1
          }} className="bg-card p-6 rounded-2xl shadow-card">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding gradient-primary text-primary-foreground">
        <div className="container-custom text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link to="/skillcore">
                  {t('cta.button')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm opacity-75">
              
            </p>
          </motion.div>
        </div>
      </section>
    </>;
};
export default Index;