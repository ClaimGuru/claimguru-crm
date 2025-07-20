-- Migration: fix_wizard_type_constraint
-- Created at: 1752958858

-- Drop the existing wizard_type constraint
ALTER TABLE wizard_progress DROP CONSTRAINT IF EXISTS wizard_progress_wizard_type_check;

-- Add new constraint with correct wizard types
ALTER TABLE wizard_progress 
ADD CONSTRAINT wizard_progress_wizard_type_check 
CHECK (wizard_type = ANY (ARRAY[
  'claim'::text, 
  'claim_manual'::text, 
  'claim_ai'::text, 
  'client'::text, 
  'policy'::text
]));;