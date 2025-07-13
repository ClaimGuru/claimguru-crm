-- Migration: fix_trigger_function_permissions
-- Created at: 1752089256

-- Drop and recreate the trigger function with proper error handling
DROP FUNCTION IF EXISTS handle_new_user_signup() CASCADE;

-- Create improved function with better error handling and permissions
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  org_id UUID;
  user_first_name TEXT;
  user_last_name TEXT;
  company_name TEXT;
  user_phone TEXT;
BEGIN
  -- Log the trigger execution (for debugging)
  RAISE NOTICE 'Trigger handle_new_user_signup executed for user: %', NEW.id;
  
  -- Check if user profile already exists
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = NEW.id) THEN
    RAISE NOTICE 'User profile already exists for user: %', NEW.id;
    RETURN NEW;
  END IF;

  -- Extract metadata safely
  user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'New Organization');
  user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

  RAISE NOTICE 'Creating organization: % for user: %', company_name, NEW.email;

  -- Create organization first
  INSERT INTO public.organizations (
    name,
    email,
    phone,
    subscription_tier,
    subscription_status
  ) VALUES (
    company_name,
    NEW.email,
    user_phone,
    'starter',
    'trial'
  ) RETURNING id INTO org_id;

  RAISE NOTICE 'Organization created with ID: %', org_id;

  -- Create user profile
  INSERT INTO public.user_profiles (
    id,
    organization_id,
    email,
    first_name,
    last_name,
    role,
    is_active
  ) VALUES (
    NEW.id,
    org_id,
    NEW.email,
    user_first_name,
    user_last_name,
    'admin',
    true
  );

  RAISE NOTICE 'User profile created for user: %', NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in handle_new_user_signup: %', SQLERRM;
    -- Don't fail the auth.users insert, just log the error
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_new_user_signup() TO postgres;
GRANT EXECUTE ON FUNCTION handle_new_user_signup() TO anon;
GRANT EXECUTE ON FUNCTION handle_new_user_signup() TO authenticated;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user_signup();;