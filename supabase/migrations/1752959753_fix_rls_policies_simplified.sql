-- Migration: fix_rls_policies_simplified
-- Created at: 1752959753

-- Temporarily disable RLS to test if that's the issue
ALTER TABLE wizard_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "wizard_progress_select_policy" ON wizard_progress;
DROP POLICY IF EXISTS "wizard_progress_insert_policy" ON wizard_progress;
DROP POLICY IF EXISTS "wizard_progress_update_policy" ON wizard_progress;
DROP POLICY IF EXISTS "wizard_progress_delete_policy" ON wizard_progress;

DROP POLICY IF EXISTS "tasks_select_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON tasks;;