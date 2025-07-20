-- Migration: add_unique_constraint_wizard_progress
-- Created at: 1752960800

-- Add unique constraint to prevent duplicate wizard progress records
ALTER TABLE wizard_progress 
ADD CONSTRAINT wizard_progress_unique_user_org_type 
UNIQUE (user_id, organization_id, wizard_type);;