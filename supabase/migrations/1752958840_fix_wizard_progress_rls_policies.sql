-- Migration: fix_wizard_progress_rls_policies
-- Created at: 1752958840

-- Drop existing policies
DROP POLICY IF EXISTS "Users can access wizard progress in their organization" ON wizard_progress;
DROP POLICY IF EXISTS "Users can create wizard progress in their organization" ON wizard_progress;

-- Create more robust RLS policies
CREATE POLICY "wizard_progress_select_policy" ON wizard_progress
  FOR SELECT USING (
    user_id = auth.uid() 
    OR 
    (organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up 
      WHERE up.id = auth.uid()
    ))
  );

CREATE POLICY "wizard_progress_insert_policy" ON wizard_progress
  FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND 
    organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up 
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "wizard_progress_update_policy" ON wizard_progress
  FOR UPDATE USING (
    user_id = auth.uid() 
    OR 
    (organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up 
      WHERE up.id = auth.uid()
    ))
  ) WITH CHECK (
    user_id = auth.uid() 
    AND 
    organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up 
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "wizard_progress_delete_policy" ON wizard_progress
  FOR DELETE USING (
    user_id = auth.uid() 
    OR 
    (organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up 
      WHERE up.id = auth.uid()
    ))
  );;