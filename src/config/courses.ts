// Shared course configuration - Single source of truth for all course data
// Used by: /apply form, course pages, dropdowns, course summary boxes

export interface CourseExtraField {
  id: string;
  type: 'text' | 'select' | 'radio' | 'checkbox';
  label: string;
  labelDe: string;
  placeholder?: string;
  placeholderDe?: string;
  required?: boolean;
  options?: { value: string; label: string; labelDe: string }[];
}

export interface CourseConfig {
  slug: string;
  title: string;
  titleDe: string;
  category: string;
  categoryLabel: string;
  categoryLabelDe: string;
  level: string;
  levelDe: string;
  duration: string;
  durationDe: string;
  language: string;
  description: string;
  descriptionDe: string;
  heroSubtitle: string;
  heroSubtitleDe: string;
  learningOutcomes: string[];
  curriculum: { phase: string; items: string[] }[];
  targetAudience: string[];
  price?: string;
  startDate?: string;
  highlights: string[];
  highlightsDe: string[];
  isPremium?: boolean;
  extraFields?: CourseExtraField[];
}

// Common extra fields used across multiple courses
const commonLocationField: CourseExtraField = {
  id: 'location',
  type: 'radio',
  label: 'Where do you currently live?',
  labelDe: 'Wo lebst du aktuell?',
  required: false,
  options: [
    { value: 'morocco', label: '🇲🇦 Morocco', labelDe: '🇲🇦 Marokko' },
    { value: 'germany', label: '🇩🇪 Germany', labelDe: '🇩🇪 Deutschland' },
    { value: 'other', label: '🌍 Other Country', labelDe: '🌍 Anderes Land' },
  ],
};

const commonLevelField: CourseExtraField = {
  id: 'current_level',
  type: 'radio',
  label: 'Current knowledge level',
  labelDe: 'Aktuelles Kenntnisniveau',
  required: false,
  options: [
    { value: 'beginner', label: 'Beginner', labelDe: 'Einsteiger' },
    { value: 'intermediate', label: 'Intermediate', labelDe: 'Fortgeschritten' },
    { value: 'experienced', label: 'Professional Experience in IT/SAP', labelDe: 'Berufserfahrung im IT/SAP Umfeld' },
  ],
};

const commonLanguageField: CourseExtraField = {
  id: 'preferred_language',
  type: 'checkbox',
  label: 'Preferred learning language',
  labelDe: 'Gewünschte Unterrichtssprache',
  required: false,
  options: [
    { value: 'de', label: 'German', labelDe: 'Deutsch' },
    { value: 'en', label: 'English', labelDe: 'Englisch' },
    { value: 'fr', label: 'French', labelDe: 'Französisch' },
    { value: 'ar', label: 'Arabic', labelDe: 'Arabisch' },
  ],
};

export const coursesConfig: Record<string, CourseConfig> = {
  's4hana-fundamentals': {
    slug: 's4hana-fundamentals',
    title: 'SAP S/4HANA Fundamentals',
    titleDe: 'SAP S/4HANA Grundlagen',
    category: 'basics',
    categoryLabel: 'Basics',
    categoryLabelDe: 'Grundlagen',
    level: 'beginner',
    levelDe: 'Einsteiger',
    duration: '6 weeks',
    durationDe: '6 Wochen',
    language: 'Deutsch / Englisch',
    description: 'Master the basics of SAP S/4HANA and understand the core business processes.',
    descriptionDe: 'Verstehe die Grundlagen von SAP S/4HANA und die zentralen Geschäftsprozesse.',
    heroSubtitle: 'The perfect entry into the SAP world – understand the architecture, navigation, and core modules of S/4HANA.',
    heroSubtitleDe: 'Der perfekte Einstieg in die Welt von SAP – verstehe die Architektur, Navigation und Kernmodule von S/4HANA.',
    learningOutcomes: [
      'SAP Systemarchitektur verstehen',
      'Navigation in S/4HANA beherrschen',
      'Kernmodule im Überblick (FI, CO, MM, SD)',
      'Geschäftsprozesse in SAP abbilden',
      'Grundlagen der SAP-Terminologie',
    ],
    curriculum: [
      { phase: 'Woche 1-2: Einführung', items: ['SAP Historie & Ökosystem', 'S/4HANA vs. ECC', 'Systemzugang & Navigation'] },
      { phase: 'Woche 3-4: Kernmodule', items: ['Finanzwesen (FI/CO)', 'Logistik (MM/SD)', 'Produktion (PP)'] },
      { phase: 'Woche 5-6: Praxis', items: ['Fallstudien', 'Übungen im System', 'Abschlussprojekt'] },
    ],
    targetAudience: ['Komplette Einsteiger', 'Studierende', 'IT-Interessierte'],
    price: '6.500 MAD',
    startDate: 'Laufender Einstieg',
    highlights: ['Certificate included', '6 weeks duration', 'Hands-on exercises'],
    highlightsDe: ['Zertifikat inklusive', '6 Wochen Dauer', 'Praktische Übungen'],
    extraFields: [commonLocationField, commonLevelField, commonLanguageField],
  },
  'fico': {
    slug: 'fico',
    title: 'SAP FI/CO Complete Course',
    titleDe: 'SAP FI/CO Komplettkurs',
    category: 'core',
    categoryLabel: 'Core Modules',
    categoryLabelDe: 'Kernmodule',
    level: 'intermediate',
    levelDe: 'Fortgeschritten',
    duration: '10 weeks',
    durationDe: '10 Wochen',
    language: 'Deutsch / Englisch',
    description: 'Deep dive into Financial Accounting and Controlling modules.',
    descriptionDe: 'Umfassende Ausbildung in Finanzwesen und Controlling.',
    heroSubtitle: 'Become an expert in SAP Finance – from financial accounting to strategic controlling.',
    heroSubtitleDe: 'Werde Experte für SAP Finanzwesen – von der Finanzbuchhaltung bis zum strategischen Controlling.',
    learningOutcomes: [
      'Hauptbuchhaltung (General Ledger)',
      'Debitorenbuchhaltung & Kreditorenbuchhaltung',
      'Anlagenbuchhaltung',
      'Kostenstellenrechnung',
      'Profit Center Accounting',
      'Reporting & Analyse',
    ],
    curriculum: [
      { phase: 'Woche 1-4: FI Grundlagen', items: ['Organisationsstrukturen', 'Hauptbuch', 'Debitoren & Kreditoren'] },
      { phase: 'Woche 5-7: FI Vertiefung', items: ['Anlagenbuchhaltung', 'Bankbuchhaltung', 'Abschlüsse'] },
      { phase: 'Woche 8-10: CO', items: ['Kostenarten', 'Kostenstellen', 'Innenaufträge', 'Profit Center'] },
    ],
    targetAudience: ['Buchhalter', 'Controller', 'Finance-Interessierte'],
    price: '5.500 MAD',
    startDate: '01.03.2026',
    highlights: ['10 weeks intensive', 'FI & CO combined', 'Real-world cases'],
    highlightsDe: ['10 Wochen intensiv', 'FI & CO kombiniert', 'Praxisnahe Fallstudien'],
    extraFields: [
      commonLocationField,
      {
        id: 'finance_background',
        type: 'radio',
        label: 'Do you have a finance/accounting background?',
        labelDe: 'Hast du einen Hintergrund in Finanzen/Buchhaltung?',
        options: [
          { value: 'yes', label: 'Yes', labelDe: 'Ja' },
          { value: 'no', label: 'No', labelDe: 'Nein' },
          { value: 'partial', label: 'Some experience', labelDe: 'Teilweise' },
        ],
      },
      commonLanguageField,
    ],
  },
  'mm': {
    slug: 'mm',
    title: 'SAP MM - Materials Management',
    titleDe: 'SAP MM – Materialwirtschaft',
    category: 'core',
    categoryLabel: 'Core Modules',
    categoryLabelDe: 'Kernmodule',
    level: 'intermediate',
    levelDe: 'Fortgeschritten',
    duration: '8 weeks',
    durationDe: '8 Wochen',
    language: 'Deutsch / Englisch',
    description: 'Complete procurement and inventory management training.',
    descriptionDe: 'Beschaffung und Bestandsführung in SAP meistern.',
    heroSubtitle: 'Learn the complete procurement chain – from demand planning to invoice verification.',
    heroSubtitleDe: 'Lerne die komplette Beschaffungskette – von der Bedarfsplanung bis zur Rechnungsprüfung.',
    learningOutcomes: [
      'Materialstammdaten pflegen',
      'Einkaufsprozesse abbilden',
      'Bestandsführung & Inventur',
      'Rechnungsprüfung',
      'Lieferantenbewertung',
    ],
    curriculum: [
      { phase: 'Woche 1-3: Stammdaten', items: ['Materialstämme', 'Lieferantenstämme', 'Infosätze'] },
      { phase: 'Woche 4-6: Beschaffung', items: ['Bestellanforderungen', 'Bestellungen', 'Wareneingänge'] },
      { phase: 'Woche 7-8: Bestand & Rechnung', items: ['Bestandsführung', 'Inventur', 'Rechnungsprüfung'] },
    ],
    targetAudience: ['Einkäufer', 'Supply Chain Interessierte', 'Logistiker'],
    price: '4.500 MAD',
    startDate: '15.03.2026',
    highlights: ['8 weeks practical', 'Procurement focus', 'Inventory management'],
    highlightsDe: ['8 Wochen praxisnah', 'Einkauf im Fokus', 'Bestandsführung'],
    extraFields: [commonLocationField, commonLevelField, commonLanguageField],
  },
  'abap': {
    slug: 'abap',
    title: 'ABAP Programming for Beginners',
    titleDe: 'ABAP Programmierung für Einsteiger',
    category: 'development',
    categoryLabel: 'Development',
    categoryLabelDe: 'Entwicklung',
    level: 'beginner',
    levelDe: 'Einsteiger',
    duration: '12 weeks',
    durationDe: '12 Wochen',
    language: 'Deutsch / Englisch',
    description: 'Start your journey as an SAP developer with ABAP fundamentals.',
    descriptionDe: 'Starte deine Karriere als SAP-Entwickler mit ABAP.',
    heroSubtitle: 'The classic entry into SAP development – learn ABAP from scratch.',
    heroSubtitleDe: 'Der klassische Einstieg in die SAP-Entwicklung – lerne ABAP von Grund auf.',
    learningOutcomes: [
      'ABAP Syntax & Grundlagen',
      'Datentypen & Strukturen',
      'Datenbankzugriffe (Open SQL)',
      'Reports & ALV',
      'Modularisierung (Funktionsbausteine)',
      'Debugging',
    ],
    curriculum: [
      { phase: 'Woche 1-4: Grundlagen', items: ['ABAP Workbench', 'Syntax', 'Datentypen', 'Kontrollstrukturen'] },
      { phase: 'Woche 5-8: Daten & Reports', items: ['Open SQL', 'Interne Tabellen', 'Reports', 'ALV'] },
      { phase: 'Woche 9-12: Modularisierung', items: ['Funktionsbausteine', 'Klassen & Objekte', 'Debugging'] },
    ],
    targetAudience: ['Entwickler', 'IT-Studierende', 'Quereinsteiger mit Programmiererfahrung'],
    price: '6.000 MAD',
    startDate: '01.04.2026',
    highlights: ['12 weeks comprehensive', 'Hands-on coding', 'SAP system access'],
    highlightsDe: ['12 Wochen umfassend', 'Praktisches Coding', 'SAP-Systemzugang'],
    extraFields: [
      commonLocationField,
      {
        id: 'programming_experience',
        type: 'radio',
        label: 'Programming experience',
        labelDe: 'Programmiererfahrung',
        options: [
          { value: 'none', label: 'None', labelDe: 'Keine' },
          { value: 'basic', label: 'Basic (some coding)', labelDe: 'Grundkenntnisse' },
          { value: 'professional', label: 'Professional', labelDe: 'Professionell' },
        ],
      },
      commonLanguageField,
    ],
  },
  'rap': {
    slug: 'rap',
    title: 'RAP - ABAP RESTful Programming',
    titleDe: 'RAP – ABAP RESTful Programmierung',
    category: 'development',
    categoryLabel: 'Development',
    categoryLabelDe: 'Entwicklung',
    level: 'advanced',
    levelDe: 'Fortgeschritten',
    duration: '8 weeks',
    durationDe: '8 Wochen',
    language: 'Deutsch / Englisch',
    description: 'Modern ABAP development with the RESTful Application Programming model.',
    descriptionDe: 'Moderne SAP-Entwicklung mit dem RESTful Application Programming Modell.',
    heroSubtitle: 'The modern SAP development model – build Fiori apps and OData services with RAP.',
    heroSubtitleDe: 'Das moderne SAP-Entwicklungsmodell – baue Fiori Apps und OData Services mit RAP.',
    learningOutcomes: [
      'RAP Architektur verstehen',
      'CDS Views entwickeln',
      'Behavior Definitions',
      'OData Services erstellen',
      'Fiori Elements Integration',
    ],
    curriculum: [
      { phase: 'Woche 1-3: Grundlagen', items: ['RAP Konzepte', 'CDS Views', 'Annotationen'] },
      { phase: 'Woche 4-6: Behavior', items: ['Behavior Definitions', 'Actions & Validations', 'Draft Handling'] },
      { phase: 'Woche 7-8: Integration', items: ['OData Exposure', 'Fiori Elements', 'Testing'] },
    ],
    targetAudience: ['ABAP-Entwickler', 'SAP-Entwickler mit Erfahrung'],
    price: '5.000 MAD',
    startDate: '01.05.2026',
    highlights: ['Modern development', 'Fiori integration', 'Cloud-ready skills'],
    highlightsDe: ['Moderne Entwicklung', 'Fiori-Integration', 'Cloud-ready Skills'],
    extraFields: [
      commonLocationField,
      {
        id: 'abap_experience',
        type: 'radio',
        label: 'ABAP experience level',
        labelDe: 'ABAP-Erfahrungslevel',
        required: true,
        options: [
          { value: 'basic', label: 'Basic ABAP knowledge', labelDe: 'ABAP Grundkenntnisse' },
          { value: 'intermediate', label: 'Intermediate', labelDe: 'Fortgeschritten' },
          { value: 'advanced', label: 'Advanced/Professional', labelDe: 'Experte/Professionell' },
        ],
      },
      commonLanguageField,
    ],
  },
  's4hana-migration': {
    slug: 's4hana-migration',
    title: 'S/4HANA Migration Specialist',
    titleDe: 'S/4HANA Migrationsspezialist',
    category: 'transformation',
    categoryLabel: 'Transformation',
    categoryLabelDe: 'Transformation',
    level: 'advanced',
    levelDe: 'Fortgeschritten',
    duration: '10 weeks',
    durationDe: '10 Wochen',
    language: 'Deutsch / Englisch',
    description: 'Lead enterprise S/4HANA transformation projects with confidence.',
    descriptionDe: 'Führe S/4HANA Transformationsprojekte in Unternehmen.',
    heroSubtitle: 'Guide companies through digital transformation – from ECC to S/4HANA.',
    heroSubtitleDe: 'Begleite Unternehmen bei der digitalen Transformation – von ECC zu S/4HANA.',
    learningOutcomes: [
      'Migrationsstrategien (Brownfield, Greenfield, Bluefield)',
      'Projektplanung & Roadmap',
      'Technische Migration',
      'Datenbereinigung',
      'Change Management',
      'Cutover-Planung',
    ],
    curriculum: [
      { phase: 'Woche 1-3: Strategien', items: ['Migrationsoptionen', 'Assessment', 'Business Case'] },
      { phase: 'Woche 4-7: Umsetzung', items: ['Technische Konvertierung', 'Datenqualität', 'Simplifikation'] },
      { phase: 'Woche 8-10: Go-Live', items: ['Teststrategien', 'Cutover', 'Hypercare'] },
    ],
    targetAudience: ['SAP Berater', 'Projektleiter', 'IT-Manager'],
    price: '7.000 MAD',
    startDate: '15.05.2026',
    highlights: ['Project leadership', 'Strategic planning', 'Enterprise focus'],
    highlightsDe: ['Projektleitung', 'Strategische Planung', 'Enterprise-Fokus'],
    extraFields: [
      commonLocationField,
      {
        id: 'sap_experience_years',
        type: 'select',
        label: 'Years of SAP experience',
        labelDe: 'Jahre SAP-Erfahrung',
        options: [
          { value: '0-1', label: '0-1 years', labelDe: '0-1 Jahre' },
          { value: '2-3', label: '2-3 years', labelDe: '2-3 Jahre' },
          { value: '4-5', label: '4-5 years', labelDe: '4-5 Jahre' },
          { value: '5+', label: '5+ years', labelDe: '5+ Jahre' },
        ],
      },
      commonLanguageField,
    ],
  },
  'sac': {
    slug: 'sac',
    title: 'SAP Analytics Cloud',
    titleDe: 'SAP Analytics Cloud',
    category: 'analytics',
    categoryLabel: 'Analytics & Data',
    categoryLabelDe: 'Analytics & Data',
    level: 'intermediate',
    levelDe: 'Fortgeschritten',
    duration: '6 weeks',
    durationDe: '6 Wochen',
    language: 'Deutsch / Englisch',
    description: 'Master data visualization and business intelligence with SAC.',
    descriptionDe: 'Datenvisualisierung und Business Intelligence mit SAP Analytics Cloud.',
    heroSubtitle: 'Modern cloud analytics – from dashboards to predictive analytics.',
    heroSubtitleDe: 'Moderne Analytics in der Cloud – von Dashboards bis Predictive Analytics.',
    learningOutcomes: [
      'SAC Navigation & Modellierung',
      'Stories & Dashboards erstellen',
      'Datenverbindungen konfigurieren',
      'Predictive Analytics',
      'Planning & Budgeting',
    ],
    curriculum: [
      { phase: 'Woche 1-2: Grundlagen', items: ['SAC Überblick', 'Datenmodelle', 'Verbindungen'] },
      { phase: 'Woche 3-4: Visualisierung', items: ['Stories', 'Charts', 'Dashboards'] },
      { phase: 'Woche 5-6: Erweitert', items: ['Predictive', 'Planning', 'Integration'] },
    ],
    targetAudience: ['Business Analysten', 'Controller', 'Data Enthusiasten'],
    price: '4.000 MAD',
    startDate: '01.06.2026',
    highlights: ['Cloud-based', 'Predictive analytics', 'BI & Planning'],
    highlightsDe: ['Cloud-basiert', 'Predictive Analytics', 'BI & Planung'],
    extraFields: [commonLocationField, commonLevelField, commonLanguageField],
  },
  'sap-btp': {
    slug: 'sap-btp',
    title: 'SAP BTP Developer Bootcamp',
    titleDe: 'SAP BTP Entwickler Bootcamp',
    category: 'btp',
    categoryLabel: 'SAP BTP',
    categoryLabelDe: 'SAP BTP',
    level: 'beginner',
    levelDe: 'Anfänger',
    duration: '3 months',
    durationDe: '3 Monate',
    language: 'Deutsch / Englisch / Arabic',
    description: 'Hands-on SAP BTP training with integrated project and internship – powered by Realcore.',
    descriptionDe: 'Praxisnahe SAP BTP Ausbildung mit integriertem Projekt und Internship – powered by Realcore.',
    heroSubtitle: 'SAP BTP – The key to the most sought-after SAP careers in Germany.',
    heroSubtitleDe: 'SAP BTP – Der Schlüssel zu den gefragtesten SAP-Karrieren in Deutschland.',
    learningOutcomes: [
      'SAP BTP Architektur & Services',
      'SAP Integration Suite',
      'Extension Suite',
      'Security, Connectivity & Identity',
      'Enterprise Use Cases',
    ],
    curriculum: [
      { phase: 'Monat 1 & 2: Training', items: ['Intensives SAP BTP Training', 'Hands-on Übungen & Labs', 'Integration- und Extension-Szenarien', 'Vorbereitung auf reale Projektarbeit'] },
      { phase: 'Monat 3: Projektphase', items: ['Praxisprojekt auf Basis realer SAP-Anforderungen', 'Anwendung der gelernten Inhalte in End-to-End Szenarien', 'Projektarbeit unter Anleitung erfahrener SAP Berater'] },
    ],
    targetAudience: ['IT-Absolventen mit Grundkenntnissen', 'Junior SAP Berater', 'Technische Quereinsteiger'],
    price: '8.000 MAD',
    startDate: '11.02.2026',
    highlights: ['Realcore internship', '3-month program', 'Project-based'],
    highlightsDe: ['Realcore Stage', '3-Monats-Programm', 'Projektbasiert'],
    isPremium: true,
    extraFields: [
      commonLocationField,
      commonLevelField,
      {
        id: 'german_level',
        type: 'select',
        label: 'German language level',
        labelDe: 'Deutschkenntnisse',
        options: [
          { value: 'A0', label: 'A0 - None', labelDe: 'A0 - Keine' },
          { value: 'A1', label: 'A1 - Basic', labelDe: 'A1 - Grundkenntnisse' },
          { value: 'A2', label: 'A2 - Elementary', labelDe: 'A2 - Elementar' },
          { value: 'B1', label: 'B1 - Intermediate', labelDe: 'B1 - Mittelstufe' },
          { value: 'B2', label: 'B2 - Upper Intermediate', labelDe: 'B2 - Gute Mittelstufe' },
          { value: 'C1', label: 'C1 - Advanced', labelDe: 'C1 - Fortgeschritten' },
        ],
      },
      commonLanguageField,
    ],
  },
};

// Helper function to get all courses as array
export const getAllCourses = (): CourseConfig[] => {
  return Object.values(coursesConfig);
};

// Helper function to get course by slug
export const getCourseBySlug = (slug: string): CourseConfig | undefined => {
  return coursesConfig[slug];
};

// Helper function to get course options for dropdown
export const getCourseOptions = () => {
  return Object.values(coursesConfig).map(course => ({
    slug: course.slug,
    title: course.title,
    titleDe: course.titleDe,
  }));
};
