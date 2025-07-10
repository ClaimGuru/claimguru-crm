-- Migration: add_vendor_and_communication_tables
-- Created at: 1752091004

-- =====================================================
-- VENDOR MANAGEMENT TABLES
-- =====================================================

-- Vendor assignments to claims
CREATE TABLE IF NOT EXISTS claim_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  assignment_type VARCHAR(50) NOT NULL, -- 'estimate', 'repair', 'inspection', 'expert'
  assignment_status VARCHAR(20) DEFAULT 'assigned', -- 'assigned', 'in_progress', 'completed', 'cancelled'
  assigned_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  completion_date DATE,
  amount_quoted DECIMAL(12,2),
  amount_final DECIMAL(12,2),
  notes TEXT,
  assigned_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor reviews and ratings
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES claims(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_categories JSONB, -- quality, timeliness, communication, pricing
  reviewed_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMMUNICATION MANAGEMENT TABLES
-- =====================================================

-- Communication history
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES claims(id),
  client_id UUID REFERENCES clients(id),
  vendor_id UUID REFERENCES vendors(id),
  communication_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'phone', 'letter', 'meeting'
  direction VARCHAR(10) NOT NULL, -- 'inbound', 'outbound'
  subject VARCHAR(255),
  content TEXT,
  status VARCHAR(20) DEFAULT 'sent', -- 'draft', 'sent', 'delivered', 'read', 'failed'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  attachments JSONB,
  metadata JSONB, -- additional data like email headers, phone duration
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication preferences
CREATE TABLE IF NOT EXISTS communication_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  vendor_id UUID REFERENCES vendors(id),
  preferred_method VARCHAR(50) DEFAULT 'email', -- 'email', 'sms', 'phone'
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  phone_notifications BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  frequency_preference VARCHAR(20) DEFAULT 'normal', -- 'minimal', 'normal', 'frequent'
  time_zone VARCHAR(50) DEFAULT 'America/New_York',
  best_contact_time VARCHAR(50), -- 'morning', 'afternoon', 'evening'
  do_not_contact_after TIME,
  do_not_contact_before TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property inspections
CREATE TABLE IF NOT EXISTS property_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES claims(id),
  inspector_id UUID REFERENCES user_profiles(id),
  inspection_type VARCHAR(50) NOT NULL, -- 'initial', 'follow_up', 'final', 'damage_assessment'
  inspection_date DATE NOT NULL,
  inspection_status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  findings TEXT,
  damage_areas JSONB,
  photos JSONB,
  documents JSONB,
  recommendations TEXT,
  estimated_repair_cost DECIMAL(12,2),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_claim_vendors_claim ON claim_vendors(claim_id);
CREATE INDEX IF NOT EXISTS idx_communications_org_claim ON communications(organization_id, claim_id);

-- Enable RLS
ALTER TABLE claim_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inspections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Organization isolation" ON claim_vendors FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON vendor_reviews FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON communications FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON communication_preferences FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON property_inspections FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));;