import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, ChevronDown, Users, Building2, GraduationCap, Briefcase, Award, FileText, UserPlus, BookOpen, TrendingUp, Globe2, Handshake, Send, Database, BarChart3, Code, Rocket, Target, ArrowRight, MapPin, Cloud, Eye, Heart, Compass, Workflow, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { languages } from '@/i18n';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';
import { MegaMenuDropdown, MobileAccordion } from './MegaMenu';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);
  const [openMobileAccordion, setOpenMobileAccordion] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const isGerman = i18n.language === 'de';
  const isArabic = i18n.language === 'ar';

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    const lang = languages.find(l => l.code === code);
    if (lang) {
      document.documentElement.dir = lang.dir;
      document.documentElement.lang = code;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Mega Menu Data Structure - Simplified flat lists
  const megaMenus = {
    talents: {
      label: isGerman ? 'Für Talente' : 'For Talents',
      sections: [
        {
          label: '',
          items: [
            { label: isGerman ? 'SAP Karrierepfade' : 'SAP Career Paths', path: '/talente/karrierepfade', icon: Target, description: isGerman ? 'Dein Weg zur SAP-Karriere' : 'Your path to SAP career' },
            { label: isGerman ? 'Training & Bootcamps' : 'Training & Bootcamps', path: '/skillcore', icon: Rocket, description: isGerman ? 'Intensive Lernprogramme' : 'Intensive learning programs' },
            { label: isGerman ? 'Bewerbung & Beratung' : 'Application & Consulting', path: '/talente/beratung', icon: FileText, description: isGerman ? 'Persönliche Karriereberatung' : 'Personal career consulting' },
            { label: 'Talent Pool', path: '/talente/talent-pool', icon: Users, description: isGerman ? 'Werde Teil unseres Netzwerks' : 'Join our network' },
          ]
        },
      ]
    },
    companies: {
      label: isGerman ? 'Für Unternehmen' : 'For Companies',
      sections: [
        {
          label: '',
          items: [
            { label: 'Corporate Trainings', path: '/unternehmen/corporate-training', icon: Building2, description: isGerman ? 'Maßgeschneiderte SAP-Schulungen' : 'Customized SAP training' },
            { label: 'Upskilling & Reskilling', path: '/unternehmen/upskilling', icon: TrendingUp, description: isGerman ? 'Teams weiterentwickeln' : 'Develop your teams' },
            { label: 'Talent Pool', path: '/unternehmen/talent-pool', icon: UserPlus, description: isGerman ? 'Qualifizierte SAP-Talente' : 'Qualified SAP talents' },
            { label: isGerman ? 'Preise' : 'Pricing', path: '/pricing', icon: Award, description: isGerman ? 'Pläne & Kosten' : 'Plans & Pricing' },
            { label: isGerman ? 'Warum Marokko?' : 'Why Morocco?', path: '/unternehmen/warum-marokko', icon: MapPin, description: isGerman ? 'Standort-Vorteile' : 'Location benefits' },
            { label: isGerman ? 'Partner werden' : 'Become Partner', path: '/unternehmen/partner', icon: Handshake, description: isGerman ? 'Strategische Kooperationen' : 'Strategic partnerships' },
            { label: isGerman ? 'Anfrage stellen' : 'Submit Inquiry', path: '/contactus', icon: Send, description: isGerman ? 'Sprechen Sie mit uns' : 'Talk to us' },
          ]
        },
      ]
    },
    programs: {
      label: isGerman ? 'Programme' : 'Programs',
      sections: [
        {
          label: '',
          items: [
            { label: 'SAP S/4HANA', path: '/skillcore/courses/sap-s4hana', icon: Database, description: isGerman ? 'Das intelligente ERP-System' : 'The intelligent ERP system' },
            { label: 'SAP BTP', path: '/skillcore/courses/sap-btp', icon: Cloud, description: isGerman ? 'Business Technology Platform' : 'Business Technology Platform', featured: true },
            { label: 'BW/4HANA & Datasphere', path: '/skillcore/courses/bw4hana-datasphere', icon: BarChart3, description: 'Business Intelligence' },
            { label: 'SAC & Analytics', path: '/skillcore/courses/sac-analytics', icon: BarChart3, description: isGerman ? 'Datenanalyse & Reporting' : 'Data Analysis & Reporting' },
            { label: 'SuccessFactors', path: '/skillcore/courses/successfactors', icon: Users, description: 'HR & Talent Management' },
            { label: 'ABAP & Fiori', path: '/skillcore/courses/abap-fiori', icon: Code, description: isGerman ? 'Entwicklung & UI' : 'Development & UI' },
          ]
        },
      ]
    },
    about: {
      label: 'About us',
      sections: [
        {
          label: '',
          items: [
            { label: isGerman ? 'Vision & Mission' : 'Vision & Mission', path: '/about/vision', icon: Eye, description: isGerman ? 'Unsere Ziele und Überzeugungen' : 'Our goals and beliefs' },
            { label: isGerman ? 'Unsere Werte' : 'Our Values', path: '/about/values', icon: Heart, description: isGerman ? 'Was uns antreibt' : 'What drives us' },
            { label: 'SkillCore', path: '/skillcore', icon: GraduationCap, description: isGerman ? 'Unser Ausbildungsprogramم' : 'Our training program' },
            { label: 'Discovery+', path: '/discovery', icon: Compass, description: isGerman ? 'Immersive SAP-Erlebnisse' : 'Immersive SAP experiences' },
            { label: 'TalentFlow', path: '/talentflow', icon: Workflow, description: isGerman ? 'Karriere & Vermittlung' : 'Career & placement' },
          ]
        },
      ]
    },
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom flex h-24 lg:h-28 items-center justify-between py-2">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img src={logo} alt="Bridging.Academy" className="h-16 sm:h-20 lg:h-24 w-auto drop-shadow-sm" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1">
          <Link to="/" className={cn("px-4 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground", isActive('/') && "text-primary bg-accent")}>
            Home
          </Link>

          <MegaMenuDropdown label={megaMenus.talents.label} sections={megaMenus.talents.sections} isOpen={openMegaMenu === 'talents'} onOpen={() => setOpenMegaMenu('talents')} onClose={() => setOpenMegaMenu(null)} />
          <MegaMenuDropdown label={megaMenus.companies.label} sections={megaMenus.companies.sections} isOpen={openMegaMenu === 'companies'} onOpen={() => setOpenMegaMenu('companies')} onClose={() => setOpenMegaMenu(null)} />
          <MegaMenuDropdown label={megaMenus.programs.label} sections={megaMenus.programs.sections} isOpen={openMegaMenu === 'programs'} onOpen={() => setOpenMegaMenu('programs')} onClose={() => setOpenMegaMenu(null)} />
          <MegaMenuDropdown label={megaMenus.about.label} sections={megaMenus.about.sections} isOpen={openMegaMenu === 'about'} onOpen={() => setOpenMegaMenu('about')} onClose={() => setOpenMegaMenu(null)} />

          <Link to="/realcore" className={cn("px-4 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground", isActive('/realcore') && "text-primary bg-accent")}>
            RealCore
          </Link>
          <Link to="/contactus" className={cn("px-4 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground", isActive('/contactus') && "text-primary bg-accent")}>
            {isGerman ? 'Kontakt' : 'Contact'}
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-9">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{currentLang.nativeName}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {languages.map((lang) => (
                <DropdownMenuItem key={lang.code} onClick={() => changeLanguage(lang.code)} className={cn("cursor-pointer", i18n.language === lang.code && "bg-accent text-accent-foreground")}>
                  {lang.nativeName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {session ? (
            <Button asChild size="lg" className="hidden sm:inline-flex bg-primary hover:bg-primary/90 font-semibold gap-2 px-6">
              <Link to="/dashboard">
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="hidden sm:inline-flex gap-2">
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  {isGerman ? 'Anmelden' : isArabic ? 'تسجيل الدخول' : 'Login'}
                </Link>
              </Button>
              <Button asChild size="lg" className="hidden sm:inline-flex bg-primary hover:bg-primary/90 font-semibold gap-2 px-6">
                <Link to="/talent-pool">
                  Talent Pool
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-border bg-background max-h-[calc(100vh-6rem)] overflow-y-auto">
          <nav>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center px-4 py-3 text-sm font-medium border-b border-border/50 transition-colors hover:bg-accent", isActive('/') && "bg-accent text-primary")}>Home</Link>
            <MobileAccordion label={megaMenus.talents.label} sections={megaMenus.talents.sections} isOpen={openMobileAccordion === 'talents'} onToggle={() => setOpenMobileAccordion(openMobileAccordion === 'talents' ? null : 'talents')} onItemClick={() => setMobileMenuOpen(false)} />
            <MobileAccordion label={megaMenus.companies.label} sections={megaMenus.companies.sections} isOpen={openMobileAccordion === 'companies'} onToggle={() => setOpenMobileAccordion(openMobileAccordion === 'companies' ? null : 'companies')} onItemClick={() => setMobileMenuOpen(false)} />
            <MobileAccordion label={megaMenus.programs.label} sections={megaMenus.programs.sections} isOpen={openMobileAccordion === 'programs'} onToggle={() => setOpenMobileAccordion(openMobileAccordion === 'programs' ? null : 'programs')} onItemClick={() => setMobileMenuOpen(false)} />
            <MobileAccordion label={megaMenus.about.label} sections={megaMenus.about.sections} isOpen={openMobileAccordion === 'about'} onToggle={() => setOpenMobileAccordion(openMobileAccordion === 'about' ? null : 'about')} onItemClick={() => setMobileMenuOpen(false)} />
            <Link to="/realcore" onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center px-4 py-3 text-sm font-medium border-b border-border/50 transition-colors hover:bg-accent", isActive('/realcore') && "bg-accent text-primary")}>RealCore</Link>
            <Link to="/contactus" onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center px-4 py-3 text-sm font-medium border-b border-border/50 transition-colors hover:bg-accent", isActive('/contactus') && "bg-accent text-primary")}>{isGerman ? 'Kontakt' : 'Contact'}</Link>
            <div className="p-4">
              {session ? (
                <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 font-semibold gap-2">
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard<ArrowRight className="h-4 w-4" /></Link>
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/5">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn className="h-4 w-4" />
                      {isGerman ? 'Anmelden' : isArabic ? 'تسجيل الدخول' : 'Login'}
                    </Link>
                  </Button>
                  <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 font-semibold gap-2">
                    <Link to="/talent-pool" onClick={() => setMobileMenuOpen(false)}>Talent Pool<ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
