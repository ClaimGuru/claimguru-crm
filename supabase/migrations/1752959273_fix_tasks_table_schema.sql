-- Migration: fix_tasks_table_schema
-- Created at: 1752959273

-- Add missing columns that the frontend expects
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS related_entity_type varchar(50);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS related_entity_id uuid;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Make assigned_to and assigned_by nullable since user_id will be used instead
ALTER TABLE tasks ALTER COLUMN assigned_to DROP NOT NULL;
ALTER TABLE tasks ALTER COLUMN assigned_by DROP NOT NULL;

-- Add defaults for required fields
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 'medium';
ALTER TABLE tasks ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE tasks ALTER COLUMN updated_at SET DEFAULT now();;