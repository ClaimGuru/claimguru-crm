-- Add policy effective date and expiration date columns to claims table
ALTER TABLE claims
ADD COLUMN IF NOT EXISTS policy_effective_date DATE,
ADD COLUMN IF NOT EXISTS policy_expiration_date DATE;
