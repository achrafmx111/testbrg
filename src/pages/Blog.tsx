import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string; // UUID from Supabase
  title: string;
  excerpt: string;
  category: string;
  date: string; // We'll map 'published_date' to this
  readTime: number; // We'll map 'read_time_minutes' to this
  image: string | null; // We'll map 'image_url' to this
  slug: string;
}

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
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .order('published_date', { ascending: false });

        if (error) {
          console.error('Error fetching posts:', error);
          return;
        }

        if (data) {
          const formattedPosts: BlogPost[] = data.map(post => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            category: post.category,
            date: post.published_date,
            readTime: post.read_time_minutes,
            image: post.image_url,
            slug: post.slug
          }));
          setPosts(formattedPosts);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(post => post.category === activeCategory);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
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
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="h-full card-hover border-0 shadow-card overflow-hidden flex flex-col">
                    {/* Placeholder image if no image provided */}
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                      {post.image && (
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {categories.find(c => c.id === post.category)?.label || post.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-heading line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <span>{formatDate(post.date)}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime} {t('blog.minRead')}
                          </span>
                        </div>
                        <Button variant="link" className="p-0 h-auto text-primary" asChild>
                          <Link to={`/blog/${post.slug}`}>
                            {t('blog.readMore')}
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>No posts found.</p>
            </div>
          )}
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
