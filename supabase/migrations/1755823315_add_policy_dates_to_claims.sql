-- Migration: add_policy_dates_to_claims
-- Created at: 1755823315

-- Add policy dates columns to claims table
ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS policy_effective_date DATE,
ADD COLUMN IF NOT EXISTS policy_expiration_date DATE;
