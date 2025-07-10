-- Migration: enhance_vendors_table
-- Created at: 1752097849

-- Enhance vendors table with categories and specialties
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'contractor',
ADD COLUMN IF NOT EXISTS specialty TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS insurance_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS service_areas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS emergency_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_jobs INTEGER DEFAULT 0;

-- Create indexes for vendors
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_specialty ON vendors(specialty);;