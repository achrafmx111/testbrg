import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';
import logo from '@/assets/logo.png';
const Footer = () => {
  const {
    t
  } = useTranslation();
  const footerLinks = {
    programs: [{
      path: '/skillcore',
      label: t('nav.skillcore')
    }, {
      path: '/discovery',
      label: t('nav.discoveryPlus')
    }, {
      path: '/talentflow',
      label: t('nav.talentflow')
    }],
    company: [{
      path: '/about',
      label: t('nav.about')
    }, {
      path: '/realcore',
      label: t('nav.poweredByRealcore')
    }, {
      path: '/blog',
      label: t('nav.blog')
    }],
    support: [{
      path: '/contactus',
      label: t('nav.contact')
    }, {
      path: '/contactus#faq',
      label: t('footer.faq')
    }, {
      path: '/apply',
      label: t('footer.community')
    }]
  };
  return <footer className="bg-primary text-primary-foreground">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="Bridging.Academy" className="h-12 w-auto brightness-0 invert" />
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6 max-w-sm">
              {t('footer.description')}
            </p>
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@bridging.academy</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+212719715080</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Morocco & Germany</span>
              </div>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.programs')}</h4>
            <ul className="space-y-2">
              {footerLinks.programs.map(link => <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2">
              {footerLinks.company.map(link => <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2">
              {footerLinks.support.map(link => <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>)}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
            <Link to="/privacy" className="hover:text-primary-foreground transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="hover:text-primary-foreground transition-colors">
              {t('footer.terms')}
            </Link>
            <Link to="/imprint" className="hover:text-primary-foreground transition-colors">
              {t('footer.imprint')}
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;