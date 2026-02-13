import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Globe, Award, Users, CheckCircle, Briefcase, TrendingUp, Building2, GraduationCap, Rocket, Shield, Zap, Target, BookOpen, Code, Settings, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SapBtpCourse = () => {
  const learningTopics = [{
    icon: Cloud,
    title: 'SAP BTP Architektur & Services',
    description: 'Grundlagen der Business Technology Platform verstehen'
  }, {
    icon: Settings,
    title: 'SAP Integration Suite',
    description: 'Enterprise-Integration und API Management'
  }, {
    icon: Code,
    title: 'Extension Suite',
    description: 'Side-by-Side Extensions für S/4HANA'
  }, {
    icon: Shield,
    title: 'Security, Connectivity & Identity',
    description: 'Sicherheitskonzepte und Authentifizierung'
  }, {
    icon: Building2,
    title: 'Enterprise Use Cases',
    description: 'Reale Projektszenarien aus der Praxis'
  }];

  const careerPath = [{
    title: 'SAP Trainee',
    salary: null
  }, {
    title: 'SAP BTP Junior Consultant',
    salary: '60.000 – 75.000 €'
  }, {
    title: 'SAP BTP Consultant',
    salary: '80.000 – 100.000 €'
  }, {
    title: 'Senior Consultant / Architect',
    salary: '100.000 €+'
  }];

  const futureOutlook = ['Langfristige Nachfrage durch S/4HANA Transformationen', 'Kombination mit AI, Data, Cloud und Integration', 'Internationale Projektmöglichkeiten (DACH, EU, MENA)', 'Zukunftssicheres Skillset bis weit über 2030 hinaus'];
  const targetAudience = ['IT-Absolventen mit Grundkenntnissen', 'Junior SAP Berater', 'Technische Quereinsteiger'];

  return <>
    {/* Hero Section */}
    <section className="relative overflow-hidden gradient-hero pattern-overlay">
      <div className="container-custom section-padding">
        <motion.div className="max-w-5xl mx-auto" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }}>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/skillcore" className="hover:text-primary transition-colors">SkillCore</Link>
            <span>/</span>
            <span className="text-foreground">SAP BTP</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-secondary/20 text-secondary-foreground border-secondary/30">
                PREMIUM TRAINING · Powered by Realcore
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 leading-tight">
                SAP BTP – Der Schlüssel zu den gefragtesten SAP-Karrieren in Deutschland
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Praxisnahe SAP BTP Ausbildung mit integriertem Projekt und Internship – powered by Realcore.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                  <Link to="/apply?course=sap-btp">
                    Jetzt Platz sichern (Early Bird)
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link to="/contactus">Beratungsgespräch buchen</Link>
                </Button>
              </div>
            </div>

            {/* Course Info Card */}
            <Card className="border-0 shadow-elegant bg-card/80 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Startdatum</p>
                      <p className="font-semibold text-foreground">11.02.2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gesamtdauer</p>
                      <p className="font-semibold text-foreground">3 Monate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Modell</p>
                      <p className="font-semibold text-foreground">Training + Projekt + Stage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Niveau</p>
                      <p className="font-semibold text-foreground">Anfänger</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sprache</p>
                      <p className="font-semibold text-foreground">Deutsch / Englisch / Arabic</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Besonderheit</p>
                      <p className="font-semibold text-foreground">Realcore Stage</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Why SAP BTP */}
    <section className="section-padding bg-muted/50">
      <div className="container-custom">
        <motion.div className="max-w-4xl mx-auto text-center mb-12" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
            Warum SAP BTP?
          </h2>
          <p className="text-lg text-muted-foreground">
            Die Business Technology Platform ist das Fundament moderner SAP-Landschaften.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[{
            icon: Zap,
            title: 'Technologische Basis',
            desc: 'SAP BTP als Fundament moderner S/4HANA Landschaften'
          }, {
            icon: TrendingUp,
            title: 'Hohe Nachfrage',
            desc: 'Stark gefragte Kompetenz im deutschen SAP Markt'
          }, {
            icon: Settings,
            title: 'Zentrale Rolle',
            desc: 'Integration, Erweiterung und Innovation in einem'
          }, {
            icon: Building2,
            title: 'Top-Arbeitgeber',
            desc: 'Gesuchtes Skillset bei SAP Partnern und Großunternehmen'
          }].map((item, idx) => <motion.div key={idx} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: idx * 0.1
          }}>
            <Card className="h-full border-0 shadow-card card-hover text-center">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </motion.div>)}
        </div>
      </div>
    </section>

    {/* What You Will Learn */}
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
            Was du lernen wirst
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Praxisnahe Inhalte für den direkten Einstieg in SAP BTP Projekte.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {learningTopics.map((topic, idx) => <motion.div key={idx} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: idx * 0.1
          }}>
            <Card className="h-full border-0 shadow-card card-hover">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                    <topic.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">{topic.title}</h3>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>)}
        </div>
      </div>
    </section>

    {/* Course Structure */}
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
            Ausbildungsstruktur (3 Monate Gesamtprogramm)
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Phase 1 */}
          <motion.div initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }}>
            <Card className="h-full border-0 shadow-card">
              <CardHeader className="pb-4">
                <Badge className="w-fit mb-2 bg-primary/10 text-primary border-0">Monat 1 & 2</Badge>
                <CardTitle className="text-xl font-heading">Phase 1 – Training</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Intensives SAP BTP Training', 'Hands-on Übungen & Labs', 'Integration- und Extension-Szenarien', 'Vorbereitung auf reale Projektarbeit'].map((item, idx) => <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>)}
              </CardContent>
            </Card>
          </motion.div>

          {/* Phase 2 */}
          <motion.div initial={{
            opacity: 0,
            x: 20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }}>
            <Card className="h-full border-0 shadow-card">
              <CardHeader className="pb-4">
                <Badge className="w-fit mb-2 bg-secondary/20 text-secondary-foreground border-0">Monat 3</Badge>
                <CardTitle className="text-xl font-heading">Phase 2 – Projektphase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Praxisprojekt auf Basis realer SAP-Anforderungen', 'Anwendung der gelernten Inhalte in End-to-End Szenarien', 'Projektarbeit unter Anleitung erfahrener SAP Berater'].map((item, idx) => <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>)}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Important Note */}
        <motion.div className="max-w-3xl mx-auto mt-8" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
          <Card className="border-2 border-secondary bg-secondary/5">
            <CardContent className="py-6 text-center">
              <p className="text-lg font-medium text-foreground">
                💡 Die Projektphase ist fester Bestandteil des Programms und wird vollständig als Stage / Internship angerechnet.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>

    {/* Internship with Realcore */}
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-custom">
        <motion.div className="max-w-4xl mx-auto text-center" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            Exklusiv bei Bridging.Academy
          </Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Integriertes Internship & Projektphase mit Realcore
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Kein separates Praktikum – das gesamte Programm ist praxisorientiert und internship-basiert.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[{
              icon: Award,
              text: 'Gesamtes Programm wird als Stage anerkannt'
            }, {
              icon: Briefcase,
              text: 'Reale Projektarbeit nach deutschem SAP-Standard'
            }, {
              icon: Users,
              text: 'Betreuung durch erfahrene SAP Berater'
            }, {
              icon: Building2,
              text: 'Einblick in echte Kunden- und Projektlandschaften'
            }].map((item, idx) => <motion.div key={idx} className="bg-white/10 rounded-xl p-5" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: idx * 0.1
            }}>
              <item.icon className="h-8 w-8 mb-3 opacity-90" />
              <p className="text-sm opacity-90">{item.text}</p>
            </motion.div>)}
          </div>

          <p className="mt-8 text-lg font-medium opacity-90">
            ✓ Teilnahmebestätigung & Empfehlung inklusive
          </p>
        </motion.div>
      </div>
    </section>

    {/* Career Path */}
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
            Typischer Karrierepfad nach dem Training
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SAP BTP öffnet Türen zu den gefragtesten Positionen im deutschen SAP Markt.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            {careerPath.map((step, idx) => <motion.div key={idx} className="relative" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: idx * 0.1
            }}>
              <Card className={`text-center border-0 ${idx === careerPath.length - 1 ? 'shadow-elegant ring-2 ring-primary' : 'shadow-card'}`}>
                <CardContent className="py-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold">{idx + 1}</span>
                  </div>
                  <h4 className="font-heading font-semibold text-foreground mb-2">{step.title}</h4>
                  {step.salary && <p className="text-sm text-secondary font-medium">{step.salary}</p>}
                </CardContent>
              </Card>
              {idx < careerPath.length - 1 && <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-border" />}
            </motion.div>)}
          </div>
        </div>
      </div>
    </section>

    {/* Salary & Job Market */}
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
            Gehaltsperspektive Deutschland *
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SAP BTP Berater gehören zu den bestbezahlten IT-Spezialisten.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[{
            level: 'Junior (0-2 Jahre)',
            salary: '60.000 – 75.000 €',
            highlight: false
          }, {
            level: 'Mid-Level (2-4 Jahre)',
            salary: '75.000 – 95.000 €',
            highlight: true
          }, {
            level: 'Senior (5+ Jahre)',
            salary: '95.000 – 120.000 €+',
            highlight: false
          }].map((item, idx) => <motion.div key={idx} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: idx * 0.1
          }}>
            <Card className={`text-center border-0 ${item.highlight ? 'shadow-elegant ring-2 ring-primary' : 'shadow-card'}`}>
              <CardContent className="py-8">
                <p className="text-sm text-muted-foreground mb-2">{item.level}</p>
                <p className="text-3xl font-heading font-bold text-primary">ca. {item.salary}</p>
                <p className="text-xs text-muted-foreground mt-2">pro Jahr</p>
              </CardContent>
            </Card>
          </motion.div>)}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
          * Abhängig von Erfahrung, Sprache, Projekt und Standort.
        </p>
      </div>
    </section>

    {/* Future Outlook */}
    <section className="section-padding bg-background">
      <div className="container-custom">
        <motion.div className="max-w-4xl mx-auto" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                Zukunft & Perspektive
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                SAP BTP ist nicht nur heute relevant – es ist die Grundlage für die SAP-Welt von morgen.
              </p>
              <ul className="space-y-4">
                {futureOutlook.map((item, idx) => <li key={idx} className="flex items-start gap-3">
                  <Rocket className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </li>)}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
              <div className="text-6xl font-heading font-bold text-primary mb-2">2030+</div>
              <p className="text-lg text-muted-foreground">Zukunftssicheres Skillset</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Pricing */}
    <section className="section-padding bg-muted/50">
      <div className="container-custom">
        <motion.div className="max-w-xl mx-auto text-center" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
          <Badge className="mb-4 bg-secondary text-secondary-foreground border-0">
            Early Bird Angebot
          </Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
            Investition in deine Zukunft
          </h2>

          <Card className="border-0 shadow-elegant">
            <CardContent className="py-10">
              <div className="text-5xl font-heading font-bold text-primary mb-2">
                8.000 <span className="text-2xl">MAD</span>
              </div>
              <p className="text-muted-foreground mb-8">Early-Bird Preis</p>

              <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
                {['2 Monate Training', '1 Monat Projektphase', 'Internship / Stage Anerkennung', 'Lernmaterialien', 'Teilnahmezertifikat'].map((item, idx) => <li key={idx} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">{item}</span>
                </li>)}
              </ul>

              <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-lg">
                <Link to="/apply?course=sap-btp">
                  Jetzt Early-Bird Platz sichern
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>

    {/* Target Audience */}
    <section className="section-padding bg-background">
      <div className="container-custom">
        <motion.div className="max-w-3xl mx-auto text-center" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-8">
            Für wen ist dieser Kurs?
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {targetAudience.map((audience, idx) => <Card key={idx} className="border-0 shadow-card">
              <CardContent className="py-8 text-center">
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                <p className="font-medium text-foreground">{audience}</p>
              </CardContent>
            </Card>)}
          </div>
        </motion.div>
      </div>
    </section>

    {/* Apply CTA Section - Replaces the old registration form */}
    <section className="section-padding bg-muted/50">
      <div className="container-custom">
        <motion.div className="max-w-2xl mx-auto text-center" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
          <Card className="border-0 shadow-elegant">
            <CardContent className="py-12">
              <GraduationCap className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
                Interesse am SAP BTP Bootcamp?
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                Bewirb dich jetzt und sichere dir deinen Platz im exklusiven Programm mit Realcore.
              </p>
              
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-12">
                <Link to="/apply?course=sap-btp">
                  Jetzt bewerben
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                Die Bewerbung dauert nur 2 Minuten. Der SAP BTP Kurs wird automatisch vorausgewählt.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>

    {/* Final CTA */}
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
            Bereit für den nächsten Karriereschritt?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Starte jetzt deine SAP BTP Karriere mit Bridging.Academy und Realcore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/apply?course=sap-btp">
                Jetzt bewerben (Early Bird)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white/10">
              <Link to="/contactus">Beratung buchen</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  </>;
};

export default SapBtpCourse;
