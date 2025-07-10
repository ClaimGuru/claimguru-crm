-- Migration: enhance_claims_table
-- Created at: 1752097854

-- Enhance claims table for intake workflow
ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS insurance_carrier_id UUID REFERENCES insurers(id),
ADD COLUMN IF NOT EXISTS policy_number TEXT,
ADD COLUMN IF NOT EXISTS coverage_limits JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS deductible DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS referral_source TEXT,
ADD COLUMN IF NOT EXISTS referral_fee DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS referral_notes TEXT,
ADD COLUMN IF NOT EXISTS vendor_assessment JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assigned_vendors UUID[] DEFAULT '{}';;