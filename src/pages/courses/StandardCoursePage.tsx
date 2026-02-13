import { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Calendar, Clock, Globe, Award,
  CheckCircle, BookOpen, Target, Users, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from "@/integrations/supabase/client";

const StandardCoursePage = () => {
  const { courseSlug } = useParams();
  const [course, setCourse] = useState<any>(null); // Using any for flexibility during migration, ideally typed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseSlug) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('slug', courseSlug)
          .single();

        if (error) {
          console.error('Error fetching course:', error);
          setCourse(null);
        } else if (data) {
          // Map DB fields to what component expects
          setCourse({
            ...data,
            titleDe: data.title_de,
            categoryLabelDe: data.category_label_de,
            heroSubtitleDe: data.hero_subtitle_de,
            durationDe: data.duration_de,
            levelDe: data.level_de,
            descriptionDe: data.description_de,
            learningOutcomes: data.learning_outcomes,
            curriculum: data.curriculum,
            targetAudience: data.target_audience,
            startDate: data.start_date,
          });
        }
      } catch (err) {
        console.error("Unexpected error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseSlug]);

  // Redirect SAP BTP to its dedicated page
  if (courseSlug === 'sap-btp') {
    return <Navigate to="/skillcore/courses/sap-btp" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return <Navigate to="/skillcore" replace />;
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero pattern-overlay">
        <div className="container-custom section-padding">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link to="/skillcore" className="hover:text-primary transition-colors">SkillCore</Link>
              <span>/</span>
              <span className="text-foreground">{course.titleDe}</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  {course.categoryLabelDe}
                </Badge>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 leading-tight">
                  {course.titleDe}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                  {course.heroSubtitleDe}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                    <Link to={`/apply?course=${course.slug}`}>
                      Jetzt bewerben
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
                    {course.startDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Start</p>
                          <p className="font-semibold text-foreground">{course.startDate}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Dauer</p>
                        <p className="font-semibold text-foreground">{course.durationDe}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Niveau</p>
                        <p className="font-semibold text-foreground">{course.levelDe}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sprache</p>
                        <p className="font-semibold text-foreground">{course.language}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 col-span-2">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Zertifikat</p>
                        <p className="font-semibold text-foreground">Teilnahmezertifikat inklusive</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What You Will Learn */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Was du lernen wirst
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {course.descriptionDe}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {course.learningOutcomes.map((outcome, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 p-4 bg-background rounded-xl shadow-sm"
              >
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{outcome}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Kursaufbau
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {course.curriculum.map((phase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-0 shadow-card">
                  <CardHeader className="pb-4">
                    <Badge className="w-fit mb-2 bg-primary/10 text-primary border-0">Phase {idx + 1}</Badge>
                    <CardTitle className="text-lg font-heading">{phase.phase}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {phase.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-8">
              Für wen ist dieser Kurs?
            </h2>

            <div className="grid sm:grid-cols-3 gap-6">
              {course.targetAudience.map((audience, idx) => (
                <Card key={idx} className="border-0 shadow-card">
                  <CardContent className="py-8 text-center">
                    <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                    <p className="font-medium text-foreground">{audience}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      {course.price && (
        <section className="section-padding bg-background">
          <div className="container-custom">
            <motion.div
              className="max-w-xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                Investition
              </h2>

              <Card className="border-0 shadow-elegant">
                <CardContent className="py-10">
                  <div className="text-5xl font-heading font-bold text-primary mb-2">
                    {course.price}
                  </div>
                  <p className="text-muted-foreground mb-8">inkl. Lernmaterialien & Zertifikat</p>

                  <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-lg">
                    <Link to={`/apply?course=${course.slug}`}>
                      Jetzt Platz sichern
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Apply CTA Section - Replaces the old registration form */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-elegant">
              <CardContent className="py-12">
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
                  Interesse an {course.titleDe}?
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  Bewirb dich jetzt und sichere dir deinen Platz im Kurs.
                </p>

                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-12">
                  <Link to={`/apply?course=${course.slug}`}>
                    Jetzt bewerben
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <p className="text-sm text-muted-foreground mt-4">
                  Die Bewerbung dauert nur 2 Minuten. Dein Kurs wird automatisch vorausgewählt.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding gradient-primary text-primary-foreground">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Bereit für den nächsten Schritt?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              Starte deine SAP-Karriere mit Bridging.Academy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link to={`/apply?course=${course.slug}`}>
                  Jetzt bewerben
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
    </>
  );
};

export default StandardCoursePage;
