import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const blogPosts = [
  {
    id: 1,
    title: 'The Future of SAP Careers in 2025',
    excerpt: 'Explore the emerging trends and skills that will define SAP professional success in the coming years.',
    category: 'careers',
    date: '2024-12-15',
    readTime: 8,
    image: null,
  },
  {
    id: 2,
    title: 'S/4HANA Cloud: What You Need to Know',
    excerpt: 'A comprehensive guide to SAP S/4HANA Cloud and why enterprises are making the switch.',
    category: 'trends',
    date: '2024-12-10',
    readTime: 6,
    image: null,
  },
  {
    id: 3,
    title: 'Working in Germany: Visa and Relocation Guide',
    excerpt: 'Everything you need to know about moving to Germany for an SAP career.',
    category: 'mobility',
    date: '2024-12-05',
    readTime: 12,
    image: null,
  },
  {
    id: 4,
    title: 'New Partnership Announcement: Expanding Our Network',
    excerpt: 'We\'re excited to announce new partnerships that will benefit our students and graduates.',
    category: 'news',
    date: '2024-12-01',
    readTime: 4,
    image: null,
  },
  {
    id: 5,
    title: 'ABAP vs. CAP: Which Development Path to Choose?',
    excerpt: 'Compare traditional ABAP development with the modern Cloud Application Programming model.',
    category: 'trends',
    date: '2024-11-28',
    readTime: 10,
    image: null,
  },
  {
    id: 6,
    title: 'Success Story: From Morocco to Munich',
    excerpt: 'How one of our graduates landed their dream SAP job in Germany through TalentFlow.',
    category: 'careers',
    date: '2024-11-25',
    readTime: 5,
    image: null,
  },
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'careers', label: 'SAP Careers' },
  { id: 'trends', label: 'SAP Trends' },
  { id: 'mobility', label: 'Germany & Mobility' },
  { id: 'news', label: 'Academy News' },
];

const Blog = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredPosts = activeCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              {t('blog.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('blog.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-muted/50 border-b">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="h-full card-hover border-0 shadow-card overflow-hidden">
                  {/* Placeholder image */}
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {categories.find(c => c.id === post.category)?.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-heading line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(post.date)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime} {t('blog.minRead')}
                      </span>
                    </div>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      {t('blog.readMore')}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-padding bg-muted/50">
        <div className="container-custom">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
              {t('newsletter.title')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('newsletter.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t('newsletter.placeholder')}
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
              />
              <Button>{t('newsletter.button')}</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {t('newsletter.privacy')}
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Blog;
