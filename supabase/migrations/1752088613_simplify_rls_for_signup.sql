-- Migration: simplify_rls_for_signup
-- Created at: 1752088613

-- Temporarily allow all authenticated users to create organizations
-- This is needed because during signup, the user is authenticated but doesn't have a profile yet

DROP POLICY IF EXISTS "Allow public organization creation" ON organizations;
CREATE POLICY "Allow authenticated organization creation" ON organizations
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Also allow all authenticated users to create user profiles
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
CREATE POLICY "Allow authenticated profile creation" ON user_profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to read any organization (needed during signup)
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
CREATE POLICY "Users can read organizations" ON organizations
  FOR SELECT 
  TO authenticated
  USING (true);;