-- Migration: fix_signup_rls_policies
-- Created at: 1752088480

-- Allow public signup for organizations
CREATE POLICY "Allow public organization creation" ON organizations
  FOR INSERT WITH CHECK (true);

-- Allow users to create their own profile during signup
CREATE POLICY "Allow profile creation during signup" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- Update organizations policies to allow reading during signup
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (
    id = get_user_organization_id() OR 
    -- Allow reading during profile creation
    id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create a function to handle organization creation and user profile setup
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Check if user profile already exists
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- For now, we'll handle this in the frontend
  -- This trigger is for future enhancement
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();;