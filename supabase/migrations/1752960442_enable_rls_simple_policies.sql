-- Migration: enable_rls_simple_policies
-- Created at: 1752960442

-- Re-enable RLS with very simple policies
ALTER TABLE wizard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create very simple, permissive policies for testing
CREATE POLICY "wizard_progress_allow_all" ON wizard_progress
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "tasks_allow_all" ON tasks
  FOR ALL USING (true) WITH CHECK (true);;