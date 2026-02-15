ALTER TABLE "mvp"."company_registration_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mvp"."lessons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mvp"."assessments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mvp"."submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mvp"."invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mvp"."matches" ENABLE ROW LEVEL SECURITY;

-- Registration Requests
DO $$ BEGIN
  CREATE POLICY "Public insert registration requests" ON "mvp"."company_registration_requests" FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin manage registration requests" ON "mvp"."company_registration_requests" USING (auth.uid() IN (SELECT id FROM mvp.profiles WHERE role = 'ADMIN'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Lessons
DO $$ BEGIN
  CREATE POLICY "Read lessons public" ON "mvp"."lessons" FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin manage lessons" ON "mvp"."lessons" USING (auth.uid() IN (SELECT id FROM mvp.profiles WHERE role = 'ADMIN'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Assessments
DO $$ BEGIN
  CREATE POLICY "Read assessments public" ON "mvp"."assessments" FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin manage assessments" ON "mvp"."assessments" USING (auth.uid() IN (SELECT id FROM mvp.profiles WHERE role = 'ADMIN'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Submissions
DO $$ BEGIN
  CREATE POLICY "Talent manage submissions" ON "mvp"."submissions" USING (auth.uid() = talent_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin view submissions" ON "mvp"."submissions" FOR SELECT USING (auth.uid() IN (SELECT id FROM mvp.profiles WHERE role = 'ADMIN'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Invoices
DO $$ BEGIN
  CREATE POLICY "Company view invoices" ON "mvp"."invoices" FOR SELECT USING (company_id IN (SELECT company_id FROM mvp.profiles WHERE id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin manage invoices" ON "mvp"."invoices" USING (auth.uid() IN (SELECT id FROM mvp.profiles WHERE role = 'ADMIN'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Matches
DO $$ BEGIN
  CREATE POLICY "Admin matches" ON "mvp"."matches" USING (auth.uid() IN (SELECT id FROM mvp.profiles WHERE role = 'ADMIN'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
