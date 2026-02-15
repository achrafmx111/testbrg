-- Seed data for MVP demo
-- Companies
INSERT INTO mvp.companies (id, name, industry, country)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'SAP Deutschland AG', 'Technology / ERP', 'Germany'),
  ('c0000001-0000-0000-0000-000000000002', 'TechBridge GmbH', 'IT Consulting', 'Germany'),
  ('c0000001-0000-0000-0000-000000000003', 'Accenture Morocco', 'Management Consulting', 'Morocco')
ON CONFLICT (id) DO NOTHING;

-- Jobs
INSERT INTO mvp.jobs (id, company_id, title, description, required_skills, location, salary_range, status)
VALUES
  ('j0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'SAP S/4HANA Consultant', 'Configure and implement SAP S/4HANA solutions for enterprise clients.', '["S/4HANA","FI/CO","SD","ABAP"]'::jsonb, 'Berlin, Germany', '55k-75k EUR', 'OPEN'),
  ('j0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'ABAP Developer', 'Develop custom ABAP reports and enhancements for S/4HANA.', '["ABAP","CDS Views","Fiori","OData"]'::jsonb, 'Walldorf, Germany', '50k-70k EUR', 'OPEN'),
  ('j0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000002', 'SAP BTP Developer', 'Build cloud-native applications on SAP Business Technology Platform.', '["SAP BTP","Node.js","Cloud Foundry","CAP"]'::jsonb, 'Munich, Germany', '60k-80k EUR', 'OPEN'),
  ('j0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002', 'SAP Analytics Consultant', 'Design and deliver SAC dashboards and data models.', '["SAC","BW/4HANA","Datasphere","SQL"]'::jsonb, 'Frankfurt, Germany', '50k-65k EUR', 'OPEN'),
  ('j0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000003', 'SAP MM/SD Functional Consultant', 'Lead SAP procurement and sales distribution implementations.', '["MM","SD","WM","Integration"]'::jsonb, 'Casablanca, Morocco', '25k-40k EUR', 'OPEN')
ON CONFLICT (id) DO NOTHING;
