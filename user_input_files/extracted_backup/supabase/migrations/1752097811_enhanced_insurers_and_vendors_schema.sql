-- Migration: enhanced_insurers_and_vendors_schema
-- Created at: 1752097811

-- Create insurers table
CREATE TABLE IF NOT EXISTS insurers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  license_number TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  website TEXT,
  address JSONB,
  regional_offices JSONB,
  coverage_types TEXT[],
  claims_reporting JSONB,
  preferred_communication TEXT DEFAULT 'email',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claim intake progress tracking
CREATE TABLE IF NOT EXISTS claim_intake_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id),
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',
  intake_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, error
  entity_type TEXT, -- claim, client, vendor, document, etc.
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
ADD COLUMN IF NOT EXISTS assigned_vendors UUID[] DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insurers_organization_id ON insurers(organization_id);
CREATE INDEX IF NOT EXISTS idx_insurers_name ON insurers(name);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_claim_intake_claim_id ON claim_intake_progress(claim_id);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_specialty ON vendors(specialty);

-- Enable RLS for new tables
ALTER TABLE insurers ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_intake_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view organization insurers" ON insurers
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert organization insurers" ON insurers
FOR INSERT WITH CHECK (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update organization insurers" ON insurers
FOR UPDATE USING (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view claim intake progress" ON claim_intake_progress
FOR SELECT USING (claim_id IN (
  SELECT id FROM claims WHERE organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Users can manage claim intake progress" ON claim_intake_progress
FOR ALL USING (claim_id IN (
  SELECT id FROM claims WHERE organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Users can view organization notifications" ON notifications
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
) OR user_id = auth.uid());

CREATE POLICY "Users can insert notifications" ON notifications
FOR INSERT WITH CHECK (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their notifications" ON notifications
FOR UPDATE USING (user_id = auth.uid());;