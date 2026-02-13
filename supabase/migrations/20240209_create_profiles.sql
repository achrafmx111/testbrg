-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Profile fields
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'talent', -- 'talent', 'business', 'admin'
  avatar_url TEXT,
  
  -- Contact info
  phone TEXT,
  country TEXT,
  city TEXT,
  
  -- Professional info (for talents)
  title TEXT,
  bio TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  
  -- Preferences
  looking_for TEXT, -- 'job', 'training', 'freelance'
  
  CONSTRAINT username_length CHECK (char_length(first_name) >= 2)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Public Read (optional, if we want public talent profiles later)
-- For now, let's say authenticated users can read profiles.
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

-- 2. Users can insert their own profile
CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
