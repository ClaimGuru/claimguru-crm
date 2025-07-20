-- Migration: fix_tasks_rls_policies
-- Created at: 1752959295

-- Drop existing policy
DROP POLICY IF EXISTS "Organization isolation for tasks" ON tasks;

-- Create more robust RLS policies for tasks
CREATE POLICY "tasks_select_policy" ON tasks
  FOR SELECT USING (
    (user_id = auth.uid() OR assigned_to = auth.uid())
    OR 
    (organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up 
      WHERE up.id = auth.uid()
    ))
  );

CREATE POLICY "tasks_insert_policy" ON tasks
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up 
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "tasks_update_policy" ON tasks
  FOR UPDATE USING (
    (user_id = auth.uid() OR assigned_to = auth.uid())
    OR 
    (organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up 
      WHERE up.id = auth.uid()
    ))
  ) WITH CHECK (
    organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up 
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "tasks_delete_policy" ON tasks
  FOR DELETE USING (
    (user_id = auth.uid() OR assigned_to = auth.uid())
    OR 
    (organization_id IN (
      SELECT up.organization_id 
      FROM user_profiles up 
      WHERE up.id = auth.uid()
    ))
  );;