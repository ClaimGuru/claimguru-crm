-- Migration: auto_create_org_and_profile
-- Created at: 1752088810

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Check if user profile already exists
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Create organization first
  INSERT INTO organizations (
    name,
    email,
    phone,
    subscription_tier,
    subscription_status
  ) VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'New Organization'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'starter',
    'trial'
  ) RETURNING id INTO org_id;

  -- Create user profile
  INSERT INTO user_profiles (
    id,
    organization_id,
    email,
    first_name,
    last_name,
    role
  ) VALUES (
    NEW.id,
    org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'admin'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();;