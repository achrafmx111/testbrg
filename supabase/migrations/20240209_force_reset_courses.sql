-- FORCE RESET COURSES TABLE
-- Run this if "Courses Loaded: 0" persists.

-- 1. DROP Table (Clean Slate)
DROP TABLE IF EXISTS public.courses CASCADE;

-- 2. Create Table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    title_de TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT NOT NULL,
    category_label_de TEXT NOT NULL,
    level TEXT NOT NULL,
    level_de TEXT NOT NULL,
    duration TEXT NOT NULL,
    duration_de TEXT NOT NULL,
    language TEXT NOT NULL,
    
    -- Content fields
    description TEXT NOT NULL,
    description_de TEXT NOT NULL,
    hero_subtitle TEXT NOT NULL,
    hero_subtitle_de TEXT NOT NULL,
    
    -- JSONB for arrays and complex objects
    learning_outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
    curriculum JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_audience JSONB NOT NULL DEFAULT '[]'::jsonb,
    highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
    highlights_de JSONB NOT NULL DEFAULT '[]'::jsonb,
    extra_fields JSONB DEFAULT '[]'::jsonb, -- Form configuration
    
    -- Meta
    price TEXT,
    start_date TEXT,
    is_premium BOOLEAN DEFAULT false,
    image_url TEXT
);

-- 3. Enable RLS & Policies
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access" ON public.courses FOR SELECT USING (true);

GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.courses TO authenticated;
GRANT SELECT ON public.courses TO service_role;

-- 4. Insert Data
INSERT INTO public.courses (
    slug, title, title_de, category, category_label, category_label_de, 
    level, level_de, duration, duration_de, language, 
    description, description_de, hero_subtitle, hero_subtitle_de,
    learning_outcomes, curriculum, target_audience, highlights, highlights_de, 
    price, start_date, is_premium, extra_fields
)
VALUES 
(
    's4hana-fundamentals',
    'SAP S/4HANA Fundamentals',
    'SAP S/4HANA Grundlagen',
    'basics',
    'Basics',
    'Grundlagen',
    'beginner',
    'Einsteiger',
    '6 weeks',
    '6 Wochen',
    'Deutsch / Englisch',
    'Master the basics of SAP S/4HANA and understand the core business processes.',
    'Verstehe die Grundlagen von SAP S/4HANA und die zentralen Geschäftsprozesse.',
    'The perfect entry into the SAP world – understand the architecture, navigation, and core modules of S/4HANA.',
    'Der perfekte Einstieg in die Welt von SAP – verstehe die Architektur, Navigation und Kernmodule von S/4HANA.',
    '["SAP Systemarchitektur verstehen", "Navigation in S/4HANA beherrschen", "Kernmodule im Überblick (FI, CO, MM, SD)", "Geschäftsprozesse in SAP abbilden", "Grundlagen der SAP-Terminologie"]'::jsonb,
    '[
      {"phase": "Woche 1-2: Einführung", "items": ["SAP Historie & Ökosystem", "S/4HANA vs. ECC", "Systemzugang & Navigation"]},
      {"phase": "Woche 3-4: Kernmodule", "items": ["Finanzwesen (FI/CO)", "Logistik (MM/SD)", "Produktion (PP)"]},
      {"phase": "Woche 5-6: Praxis", "items": ["Fallstudien", "Übungen im System", "Abschlussprojekt"]}
    ]'::jsonb,
    '["Komplette Einsteiger", "Studierende", "IT-Interessierte"]'::jsonb,
    '["Certificate included", "6 weeks duration", "Hands-on exercises"]'::jsonb,
    '["Zertifikat inklusive", "6 Wochen Dauer", "Praktische Übungen"]'::jsonb,
    '6.500 MAD',
    'Laufender Einstieg',
    false,
    '[
      {"id": "location", "type": "radio", "label": "Where do you currently live?", "labelDe": "Wo lebst du aktuell?", "options": [{"value": "morocco", "label": "🇲🇦 Morocco", "labelDe": "🇲🇦 Marokko"}, {"value": "germany", "label": "🇩🇪 Germany", "labelDe": "🇩🇪 Deutschland"}, {"value": "other", "label": "🌍 Other Country", "labelDe": "🌍 Anderes Land"}]},
      {"id": "current_level", "type": "radio", "label": "Current knowledge level", "labelDe": "Aktuelles Kenntnisniveau", "options": [{"value": "beginner", "label": "Beginner", "labelDe": "Einsteiger"}, {"value": "intermediate", "label": "Intermediate", "labelDe": "Fortgeschritten"}, {"value": "experienced", "label": "Professional Experience in IT/SAP", "labelDe": "Berufserfahrung im IT/SAP Umfeld"}]},
      {"id": "preferred_language", "type": "checkbox", "label": "Preferred learning language", "labelDe": "Gewünschte Unterrichtssprache", "options": [{"value": "de", "label": "German", "labelDe": "Deutsch"}, {"value": "en", "label": "English", "labelDe": "Englisch"}, {"value": "fr", "label": "French", "labelDe": "Französisch"}, {"value": "ar", "label": "Arabic", "labelDe": "Arabisch"}]}
    ]'::jsonb
),
(
    'fico',
    'SAP FI/CO Complete Course',
    'SAP FI/CO Komplettkurs',
    'core',
    'Core Modules',
    'Kernmodule',
    'intermediate',
    'Fortgeschritten',
    '10 weeks',
    '10 Wochen',
    'Deutsch / Englisch',
    'Deep dive into Financial Accounting and Controlling modules.',
    'Umfassende Ausbildung in Finanzwesen und Controlling.',
    'Become an expert in SAP Finance – from financial accounting to strategic controlling.',
    'Werde Experte für SAP Finanzwesen – von der Finanzbuchhaltung bis zum strategischen Controlling.',
    '["Hauptbuchhaltung (General Ledger)", "Debitorenbuchhaltung & Kreditorenbuchhaltung", "Anlagenbuchhaltung", "Kostenstellenrechnung", "Profit Center Accounting", "Reporting & Analyse"]'::jsonb,
    '[
      {"phase": "Woche 1-4: FI Grundlagen", "items": ["Organisationsstrukturen", "Hauptbuch", "Debitoren & Kreditoren"]},
      {"phase": "Woche 5-7: FI Vertiefung", "items": ["Anlagenbuchhaltung", "Bankbuchhaltung", "Abschlüsse"]},
      {"phase": "Woche 8-10: CO", "items": ["Kostenarten", "Kostenstellen", "Innenaufträge", "Profit Center"]}
    ]'::jsonb,
    '["Buchhalter", "Controller", "Finance-Interessierte"]'::jsonb,
    '["10 weeks intensive", "FI & CO combined", "Real-world cases"]'::jsonb,
    '["10 Wochen intensiv", "FI & CO kombiniert", "Praxisnahe Fallstudien"]'::jsonb,
    '5.500 MAD',
    '01.03.2026',
    false,
    '[
      {"id": "location", "type": "radio", "label": "Where do you currently live?", "labelDe": "Wo lebst du aktuell?", "options": [{"value": "morocco", "label": "🇲🇦 Morocco", "labelDe": "🇲🇦 Marokko"}, {"value": "germany", "label": "🇩🇪 Germany", "labelDe": "🇩🇪 Deutschland"}, {"value": "other", "label": "🌍 Other Country", "labelDe": "🌍 Anderes Land"}]},
      {"id": "finance_background", "type": "radio", "label": "Do you have a finance/accounting background?", "labelDe": "Hast du einen Hintergrund in Finanzen/Buchhaltung?", "options": [{"value": "yes", "label": "Yes", "labelDe": "Ja"}, {"value": "no", "label": "No", "labelDe": "Nein"}, {"value": "partial", "label": "Some experience", "labelDe": "Teilweise"}]},
      {"id": "preferred_language", "type": "checkbox", "label": "Preferred learning language", "labelDe": "Gewünschte Unterrichtssprache", "options": [{"value": "de", "label": "German", "labelDe": "Deutsch"}, {"value": "en", "label": "English", "labelDe": "Englisch"}, {"value": "fr", "label": "French", "labelDe": "Französisch"}, {"value": "ar", "label": "Arabic", "labelDe": "Arabisch"}]}
    ]'::jsonb
),
(
    'mm',
    'SAP MM - Materials Management',
    'SAP MM – Materialwirtschaft',
    'core',
    'Core Modules',
    'Kernmodule',
    'intermediate',
    'Fortgeschritten',
    '8 weeks',
    '8 Wochen',
    'Deutsch / Englisch',
    'Complete procurement and inventory management training.',
    'Beschaffung und Bestandsführung in SAP meistern.',
    'Learn the complete procurement chain – from demand planning to invoice verification.',
    'Lerne die komplette Beschaffungskette – von der Bedarfsplanung bis zur Rechnungsprüfung.',
    '["Materialstammdaten pflegen", "Einkaufsprozesse abbilden", "Bestandsführung & Inventur", "Rechnungsprüfung", "Lieferantenbewertung"]'::jsonb,
    '[
      {"phase": "Woche 1-3: Stammdaten", "items": ["Materialstämme", "Lieferantenstämme", "Infosätze"]},
      {"phase": "Woche 4-6: Beschaffung", "items": ["Bestellanforderungen", "Bestellungen", "Wareneingänge"]},
      {"phase": "Woche 7-8: Bestand & Rechnung", "items": ["Bestandsführung", "Inventur", "Rechnungsprüfung"]}
    ]'::jsonb,
    '["Einkäufer", "Supply Chain Interessierte", "Logistiker"]'::jsonb,
    '["8 weeks practical", "Procurement focus", "Inventory management"]'::jsonb,
    '["8 Wochen praxisnah", "Einkauf im Fokus", "Bestandsführung"]'::jsonb,
    '4.500 MAD',
    '15.03.2026',
    false,
    '[
      {"id": "location", "type": "radio", "label": "Where do you currently live?", "labelDe": "Wo lebst du aktuell?", "options": [{"value": "morocco", "label": "🇲🇦 Morocco", "labelDe": "🇲🇦 Marokko"}, {"value": "germany", "label": "🇩🇪 Germany", "labelDe": "🇩🇪 Deutschland"}, {"value": "other", "label": "🌍 Other Country", "labelDe": "🌍 Anderes Land"}]},
      {"id": "current_level", "type": "radio", "label": "Current knowledge level", "labelDe": "Aktuelles Kenntnisniveau", "options": [{"value": "beginner", "label": "Beginner", "labelDe": "Einsteiger"}, {"value": "intermediate", "label": "Intermediate", "labelDe": "Fortgeschritten"}, {"value": "experienced", "label": "Professional Experience in IT/SAP", "labelDe": "Berufserfahrung im IT/SAP Umfeld"}]},
      {"id": "preferred_language", "type": "checkbox", "label": "Preferred learning language", "labelDe": "Gewünschte Unterrichtssprache", "options": [{"value": "de", "label": "German", "labelDe": "Deutsch"}, {"value": "en", "label": "English", "labelDe": "Englisch"}, {"value": "fr", "label": "French", "labelDe": "Französisch"}, {"value": "ar", "label": "Arabic", "labelDe": "Arabisch"}]}
    ]'::jsonb
),
(
    'abap',
    'ABAP Programming for Beginners',
    'ABAP Programmierung für Einsteiger',
    'development',
    'Development',
    'Entwicklung',
    'beginner',
    'Einsteiger',
    '12 weeks',
    '12 Wochen',
    'Deutsch / Englisch',
    'Start your journey as an SAP developer with ABAP fundamentals.',
    'Starte deine Karriere als SAP-Entwickler mit ABAP.',
    'The classic entry into SAP development – learn ABAP from scratch.',
    'Der klassische Einstieg in die SAP-Entwicklung – lerne ABAP von Grund auf.',
    '["ABAP Syntax & Grundlagen", "Datentypen & Strukturen", "Datenbankzugriffe (Open SQL)", "Reports & ALV", "Modularisierung (Funktionsbausteine)", "Debugging"]'::jsonb,
    '[
      {"phase": "Woche 1-4: Grundlagen", "items": ["ABAP Workbench", "Syntax", "Datentypen", "Kontrollstrukturen"]},
      {"phase": "Woche 5-8: Daten & Reports", "items": ["Open SQL", "Interne Tabellen", "Reports", "ALV"]},
      {"phase": "Woche 9-12: Modularisierung", "items": ["Funktionsbausteine", "Klassen & Objekte", "Debugging"]}
    ]'::jsonb,
    '["Entwickler", "IT-Studierende", "Quereinsteiger mit Programmiererfahrung"]'::jsonb,
    '["12 weeks comprehensive", "Hands-on coding", "SAP system access"]'::jsonb,
    '["12 Wochen umfassend", "Praktisches Coding", "SAP-Systemzugang"]'::jsonb,
    '6.000 MAD',
    '01.04.2026',
    false,
    '[
      {"id": "location", "type": "radio", "label": "Where do you currently live?", "labelDe": "Wo lebst du aktuell?", "options": [{"value": "morocco", "label": "🇲🇦 Morocco", "labelDe": "🇲🇦 Marokko"}, {"value": "germany", "label": "🇩🇪 Germany", "labelDe": "🇩🇪 Deutschland"}, {"value": "other", "label": "🌍 Other Country", "labelDe": "🌍 Anderes Land"}]},
      {"id": "programming_experience", "type": "radio", "label": "Programming experience", "labelDe": "Programmiererfahrung", "options": [{"value": "none", "label": "None", "labelDe": "Keine"}, {"value": "basic", "label": "Basic (some coding)", "labelDe": "Grundkenntnisse"}, {"value": "professional", "label": "Professional", "labelDe": "Professionell"}]},
      {"id": "preferred_language", "type": "checkbox", "label": "Preferred learning language", "labelDe": "Gewünschte Unterrichtssprache", "options": [{"value": "de", "label": "German", "labelDe": "Deutsch"}, {"value": "en", "label": "English", "labelDe": "Englisch"}, {"value": "fr", "label": "French", "labelDe": "Französisch"}, {"value": "ar", "label": "Arabic", "labelDe": "Arabisch"}]}
    ]'::jsonb
),
(
    'rap',
    'RAP - ABAP RESTful Programming',
    'RAP – ABAP RESTful Programmierung',
    'development',
    'Development',
    'Entwicklung',
    'advanced',
    'Fortgeschritten',
    '8 weeks',
    '8 Wochen',
    'Deutsch / Englisch',
    'Modern ABAP development with the RESTful Application Programming model.',
    'Moderne SAP-Entwicklung mit dem RESTful Application Programming Modell.',
    'The modern SAP development model – build Fiori apps and OData services with RAP.',
    'Das moderne SAP-Entwicklungsmodell – baue Fiori Apps und OData Services mit RAP.',
    '["RAP Architektur verstehen", "CDS Views entwickeln", "Behavior Definitions", "OData Services erstellen", "Fiori Elements Integration"]'::jsonb,
    '[
      {"phase": "Woche 1-3: Grundlagen", "items": ["RAP Konzepte", "CDS Views", "Annotationen"]},
      {"phase": "Woche 4-6: Behavior", "items": ["Behavior Definitions", "Actions & Validations", "Draft Handling"]},
      {"phase": "Woche 7-8: Integration", "items": ["OData Exposure", "Fiori Elements", "Testing"]}
    ]'::jsonb,
    '["ABAP-Entwickler", "SAP-Entwickler mit Erfahrung"]'::jsonb,
    '["Modern development", "Fiori integration", "Cloud-ready skills"]'::jsonb,
    '["Moderne Entwicklung", "Fiori-Integration", "Cloud-ready Skills"]'::jsonb,
    '5.000 MAD',
    '01.05.2026',
    false,
    '[
      {"id": "location", "type": "radio", "label": "Where do you currently live?", "labelDe": "Wo lebst du aktuell?", "options": [{"value": "morocco", "label": "🇲🇦 Morocco", "labelDe": "🇲🇦 Marokko"}, {"value": "germany", "label": "🇩🇪 Germany", "labelDe": "🇩🇪 Deutschland"}, {"value": "other", "label": "🌍 Other Country", "labelDe": "🌍 Anderes Land"}]},
      {"id": "abap_experience", "type": "radio", "label": "ABAP experience level", "labelDe": "ABAP-Erfahrungslevel", "options": [{"value": "basic", "label": "Basic ABAP knowledge", "labelDe": "ABAP Grundkenntnisse"}, {"value": "intermediate", "label": "Intermediate", "labelDe": "Fortgeschritten"}, {"value": "advanced", "label": "Advanced/Professional", "labelDe": "Experte/Professionell"}]},
      {"id": "preferred_language", "type": "checkbox", "label": "Preferred learning language", "labelDe": "Gewünschte Unterrichtssprache", "options": [{"value": "de", "label": "German", "labelDe": "Deutsch"}, {"value": "en", "label": "English", "labelDe": "Englisch"}, {"value": "fr", "label": "French", "labelDe": "Französisch"}, {"value": "ar", "label": "Arabic", "labelDe": "Arabisch"}]}
    ]'::jsonb
),
(
    's4hana-migration',
    'S/4HANA Migration Specialist',
    'S/4HANA Migrationsspezialist',
    'transformation',
    'Transformation',
    'Transformation',
    'advanced',
    'Fortgeschritten',
    '10 weeks',
    '10 Wochen',
    'Deutsch / Englisch',
    'Lead enterprise S/4HANA transformation projects with confidence.',
    'Führe S/4HANA Transformationsprojekte in Unternehmen.',
    'Guide companies through digital transformation – from ECC to S/4HANA.',
    'Begleite Unternehmen bei der digitalen Transformation – von ECC zu S/4HANA.',
    '["Migrationsstrategien (Brownfield, Greenfield, Bluefield)", "Projektplanung & Roadmap", "Technische Migration", "Datenbereinigung", "Change Management", "Cutover-Planung"]'::jsonb,
    '[
      {"phase": "Woche 1-3: Strategien", "items": ["Migrationsoptionen", "Assessment", "Business Case"]},
      {"phase": "Woche 4-7: Umsetzung", "items": ["Technische Konvertierung", "Datenqualität", "Simplifikation"]},
      {"phase": "Woche 8-10: Go-Live", "items": ["Teststrategien", "Cutover", "Hypercare"]}
    ]'::jsonb,
    '["SAP Berater", "Projektleiter", "IT-Manager"]'::jsonb,
    '["Project leadership", "Strategic planning", "Enterprise focus"]'::jsonb,
    '["Projektleitung", "Strategische Planung", "Enterprise-Fokus"]'::jsonb,
    '7.000 MAD',
    '15.05.2026',
    false,
    '[
      {"id": "location", "type": "radio", "label": "Where do you currently live?", "labelDe": "Wo lebst du aktuell?", "options": [{"value": "morocco", "label": "🇲🇦 Morocco", "labelDe": "🇲🇦 Marokko"}, {"value": "germany", "label": "🇩🇪 Germany", "labelDe": "🇩🇪 Deutschland"}, {"value": "other", "label": "🌍 Other Country", "labelDe": "🌍 Anderes Land"}]},
      {"id": "sap_experience_years", "type": "select", "label": "Years of SAP experience", "labelDe": "Jahre SAP-Erfahrung", "options": [{"value": "0-1", "label": "0-1 years", "labelDe": "0-1 Jahre"}, {"value": "2-3", "label": "2-3 years", "labelDe": "2-3 Jahre"}, {"value": "4-5", "label": "4-5 years", "labelDe": "4-5 Jahre"}, {"value": "5+", "label": "5+ years", "labelDe": "5+ Jahre"}]},
      {"id": "preferred_language", "type": "checkbox", "label": "Preferred learning language", "labelDe": "Gewünschte Unterrichtssprache", "options": [{"value": "de", "label": "German", "labelDe": "Deutsch"}, {"value": "en", "label": "English", "labelDe": "Englisch"}, {"value": "fr", "label": "French", "labelDe": "Französisch"}, {"value": "ar", "label": "Arabic", "labelDe": "Arabisch"}]}
    ]'::jsonb
),
(
    'sac',
    'SAP Analytics Cloud',
    'SAP Analytics Cloud',
    'analytics',
    'Analytics & Data',
    'Analytics & Data',
    'intermediate',
    'Fortgeschritten',
    '6 weeks',
    '6 Wochen',
    'Deutsch / Englisch',
    'Master data visualization and business intelligence with SAC.',
    'Datenvisualisierung und Business Intelligence mit SAP Analytics Cloud.',
    'Modern cloud analytics – from dashboards to predictive analytics.',
    'Moderne Analytics in der Cloud – von Dashboards bis Predictive Analytics.',
    '["SAC Navigation & Modellierung", "Stories & Dashboards erstellen", "Datenverbindungen konfigurieren", "Predictive Analytics", "Planning & Budgeting"]'::jsonb,
    '[
      {"phase": "Woche 1-2: Grundlagen", "items": ["SAC Überblick", "Datenmodelle", "Verbindungen"]},
      {"phase": "Woche 3-4: Visualisierung", "items": ["Stories", "Charts", "Dashboards"]},
      {"phase": "Woche 5-6: Erweitert", "items": ["Predictive", "Planning", "Integration"]}
    ]'::jsonb,
    '["Business Analysten", "Controller", "Data Enthusiasten"]'::jsonb,
    '["Cloud-based", "Predictive analytics", "BI & Planning"]'::jsonb,
    '["Cloud-basiert", "Predictive Analytics", "BI & Planung"]'::jsonb,
    '4.000 MAD',
    '01.06.2026',
    false,
    '[
      {"id": "location", "type": "radio", "label": "Where do you currently live?", "labelDe": "Wo lebst du aktuell?", "options": [{"value": "morocco", "label": "🇲🇦 Morocco", "labelDe": "🇲🇦 Marokko"}, {"value": "germany", "label": "🇩🇪 Germany", "labelDe": "🇩🇪 Deutschland"}, {"value": "other", "label": "🌍 Other Country", "labelDe": "🌍 Anderes Land"}]},
      {"id": "current_level", "type": "radio", "label": "Current knowledge level", "labelDe": "Aktuelles Kenntnisniveau", "options": [{"value": "beginner", "label": "Beginner", "labelDe": "Einsteiger"}, {"value": "intermediate", "label": "Intermediate", "labelDe": "Fortgeschritten"}, {"value": "experienced", "label": "Professional Experience in IT/SAP", "labelDe": "Berufserfahrung im IT/SAP Umfeld"}]},
      {"id": "preferred_language", "type": "checkbox", "label": "Preferred learning language", "labelDe": "Gewünschte Unterrichtssprache", "options": [{"value": "de", "label": "German", "labelDe": "Deutsch"}, {"value": "en", "label": "English", "labelDe": "Englisch"}, {"value": "fr", "label": "French", "labelDe": "Französisch"}, {"value": "ar", "label": "Arabic", "labelDe": "Arabisch"}]}
    ]'::jsonb
),
(
    'sap-btp',
    'SAP BTP Developer Bootcamp',
    'SAP BTP Entwickler Bootcamp',
    'btp',
    'SAP BTP',
    'SAP BTP',
    'beginner',
    'Anfänger',
    '3 months',
    '3 Monate',
    'Deutsch / Englisch / Arabic',
    'Hands-on SAP BTP training with integrated project and internship – powered by Realcore.',
    'Praxisnahe SAP BTP Ausbildung mit integriertem Projekt und Internship – powered by Realcore.',
    'SAP BTP – The key to the most sought-after SAP careers in Germany.',
    'SAP BTP – Der Schlüssel zu den gefragtesten SAP-Karrieren in Deutschland.',
    '["SAP BTP Architektur & Services", "SAP Integration Suite", "Extension Suite", "Security, Connectivity & Identity", "Enterprise Use Cases"]'::jsonb,
    '[
      {"phase": "Monat 1 & 2: Training", "items": ["Intensives SAP BTP Training", "Hands-on Übungen & Labs", "Integration- und Extension-Szenarien", "Vorbereitung auf reale Projektarbeit"]},
      {"phase": "Monat 3: Projektphase", "items": ["Praxisprojekt auf Basis realer SAP-Anforderungen", "Anwendung der gelernten Inhalte in End-to-End Szenarien", "Projektarbeit unter Anleitung erfahrener SAP Berater"]}
    ]'::jsonb,
    '["IT-Absolventen mit Grundkenntnissen", "Junior SAP Berater", "Technische Quereinsteiger"]'::jsonb,
    '["Realcore internship", "3-month program", "Project-based"]'::jsonb,
    '["Realcore Stage", "3-Monats-Programm", "Projektbasiert"]'::jsonb,
    '8.000 MAD',
    '11.02.2026',
    true,
    '[
      {"id": "location", "type": "radio", "label": "Where do you currently live?", "labelDe": "Wo lebst du aktuell?", "options": [{"value": "morocco", "label": "🇲🇦 Morocco", "labelDe": "🇲🇦 Marokko"}, {"value": "germany", "label": "🇩🇪 Germany", "labelDe": "🇩🇪 Deutschland"}, {"value": "other", "label": "🌍 Other Country", "labelDe": "🌍 Anderes Land"}]},
      {"id": "current_level", "type": "radio", "label": "Current knowledge level", "labelDe": "Aktuelles Kenntnisniveau", "options": [{"value": "beginner", "label": "Beginner", "labelDe": "Einsteiger"}, {"value": "intermediate", "label": "Intermediate", "labelDe": "Fortgeschritten"}, {"value": "experienced", "label": "Professional Experience in IT/SAP", "labelDe": "Berufserfahrung im IT/SAP Umfeld"}]},
       {"id": "german_level", "type": "select", "label": "German language level", "labelDe": "Deutschkenntnisse", "options": [{"value": "A0", "label": "A0 - None", "labelDe": "A0 - Keine"}, {"value": "A1", "label": "A1 - Basic", "labelDe": "A1 - Grundkenntnisse"}, {"value": "A2", "label": "A2 - Elementary", "labelDe": "A2 - Elementar"}, {"value": "B1", "label": "B1 - Intermediate", "labelDe": "B1 - Mittelstufe"}, {"value": "B2", "label": "B2 - Upper Intermediate", "labelDe": "B2 - Gute Mittelstufe"}, {"value": "C1", "label": "C1 - Advanced", "labelDe": "C1 - Fortgeschritten"}]},
      {"id": "preferred_language", "type": "checkbox", "label": "Preferred learning language", "labelDe": "Gewünschte Unterrichtssprache", "options": [{"value": "de", "label": "German", "labelDe": "Deutsch"}, {"value": "en", "label": "English", "labelDe": "Englisch"}, {"value": "fr", "label": "French", "labelDe": "Französisch"}, {"value": "ar", "label": "Arabic", "labelDe": "Arabisch"}]}
    ]'::jsonb
);
