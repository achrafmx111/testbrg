import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BookOpen, Clock, Globe, Award, Search,
  Filter, ChevronDown, GraduationCap, Target, Users, Briefcase, Loader2
} from 'lucide-react'; // Added Loader2
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from "@/integrations/supabase/client";

// Interface matching the DB schema but mapped to camelCase for frontend
interface Course {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryLabel: string; // from category_label
  level: string;
  duration: string;
  language: string;
  description: string;
  outcomes: string[]; // from learning_outcomes
  certification: boolean; // hardcoded to true in DB migration usually, or we can add a column. The migration didn't have 'certification' boolean but we can assume true or check DB. 
  // Wait, the migration DID NOT have a 'certification' column, but it had 'is_premium'. 
  // The original code had 'certification: true' for all.
  premium: boolean; // from is_premium
}

const learningPaths = [
  {
    title: 'SAP Consultant Path',
    icon: Briefcase,
    duration: '6-9 months',
    courses: ['SAP Basics', 'FI/CO or MM/SD', 'Integration', 'Certification'],
    description: 'Become a certified SAP functional consultant',
  },
  {
    title: 'SAP Developer Path',
    icon: Target,
    duration: '9-12 months',
    courses: ['ABAP Basics', 'Advanced ABAP', 'RAP/CAP', 'BTP Development'],
    description: 'Master SAP development and extension',
  },
  {
    title: 'SAP Analytics Path',
    icon: GraduationCap,
    duration: '4-6 months',
    courses: ['SAP Basics', 'SAC', 'BW/4HANA', 'Data Integration'],
    description: 'Specialize in SAP analytics and BI',
  },
];

const SkillCore = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('courses')
          .select('*');

        if (error) {
          console.error('Error fetching courses:', error);
          return;
        }

        if (data) {
          const formattedCourses: Course[] = data.map(course => ({
            id: course.id,
            slug: course.slug,
            title: course.title,
            category: course.category,
            categoryLabel: course.category_label,
            level: course.level,
            duration: course.duration,
            language: course.language,
            description: course.description,
            outcomes: course.learning_outcomes as string[],
            certification: true, // Default to true as per original
            premium: course.is_premium
          }));
          setCourses(formattedCourses);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

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
              {t('pillars.skillcore.tagline')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {t('pillars.skillcore.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('pillars.skillcore.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                <a href="#courses">
                  {t('courses.title')}
                  <ArrowRight className="ml-2 h-5 w-5 inline" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/contact">{t('hero.ctaSecondary')}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Career Learning Paths
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Structured roadmaps to guide your SAP career journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {learningPaths.map((path, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full card-hover border-0 shadow-card">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                      <path.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl font-heading">{path.title}</CardTitle>
                    <CardDescription className="text-sm font-medium text-secondary">
                      {path.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">{path.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {path.courses.map((course, cIdx) => (
                        <Badge key={cIdx} variant="secondary" className="text-xs">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Catalog Section */}
      <section id="courses" className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t('courses.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('courses.subtitle')}
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('courses.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('courses.allModules')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('courses.allModules')}</SelectItem>
                <SelectItem value="basics">{t('courses.categories.basics')}</SelectItem>
                <SelectItem value="core">{t('courses.categories.core')}</SelectItem>
                <SelectItem value="btp">{t('courses.categories.btp')}</SelectItem>
                <SelectItem value="analytics">{t('courses.categories.analytics')}</SelectItem>
                <SelectItem value="development">{t('courses.categories.development')}</SelectItem>
                <SelectItem value="transformation">{t('courses.categories.transformation')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('courses.allLevels')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('courses.allLevels')}</SelectItem>
                <SelectItem value="beginner">{t('courses.beginner')}</SelectItem>
                <SelectItem value="intermediate">{t('courses.intermediate')}</SelectItem>
                <SelectItem value="advanced">{t('courses.advanced')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Course Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="h-full card-hover border-0 shadow-card">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {t(`courses.categories.${course.category}`)}
                        </Badge>
                        {course.certification && (
                          <Award className="h-4 w-4 text-secondary" />
                        )}
                      </div>
                      <CardTitle className="text-lg font-heading">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {t(`courses.${course.level}`)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {course.language.toUpperCase()}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {course.outcomes.map((outcome, oIdx) => (
                          <li key={oIdx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-1 h-1 rounded-full bg-secondary" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="w-full mt-4" size="sm" variant={course.premium ? 'default' : 'outline'}>
                        <Link to={course.slug === 'sap-btp' ? '/skillcore/courses/sap-btp' : `/skillcore/courses/${course.slug}`}>
                          {course.premium ? 'Premium Kurs ansehen' : 'Mehr erfahren'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
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
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/contact">
                {t('cta.button')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default SkillCore;
