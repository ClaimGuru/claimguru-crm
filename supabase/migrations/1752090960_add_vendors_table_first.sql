-- Migration: add_vendors_table_first
-- Created at: 1752090960

-- Create vendors table first
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_type VARCHAR(50) NOT NULL, -- 'contractor', 'expert', 'attorney', 'engineer', 'adjuster'
  company_name VARCHAR(255) NOT NULL,
  contact_first_name VARCHAR(100),
  contact_last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'US',
  website VARCHAR(255),
  license_number VARCHAR(100),
  insurance_info JSONB,
  specialties TEXT[],
  hourly_rate DECIMAL(10,2),
  rating DECIMAL(3,2), -- 1.00 to 5.00
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for vendors
CREATE POLICY "Organization isolation" ON vendors FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- Create index
CREATE INDEX IF NOT EXISTS idx_vendors_org_type ON vendors(organization_id, vendor_type);;