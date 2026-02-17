-- Create explicit foreign key relationship with profiles table to allow joins
-- This is necessary for fetching profile data like full_name for team members

ALTER TABLE mvp.companies_team
ADD CONSTRAINT fk_companies_team_profiles -- Name of the constraint
FOREIGN KEY (user_id) REFERENCES mvp.profiles(id)
ON DELETE CASCADE;

-- Rename 'invited_email' column if it conflicts with profile email or simply ensure it's distinct
-- (No change needed, but documenting intent)
