-- Migration: add_comprehensive_crm_features
-- Created at: 1752090951

-- =====================================================
-- COMPREHENSIVE CRM FEATURES - DATABASE SCHEMA EXTENSION
-- =====================================================

-- 1. FINANCIAL MANAGEMENT TABLES
-- =====================================================

-- Fee and billing management
CREATE TABLE IF NOT EXISTS fee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  fee_type VARCHAR(50) NOT NULL, -- 'percentage', 'flat_fee', 'hourly', 'contingency'
  fee_amount DECIMAL(12,2),
  fee_percentage DECIMAL(5,2),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'invoiced', 'paid'
  due_date DATE,
  invoice_number VARCHAR(100),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense tracking
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id),
  expense_type VARCHAR(50) NOT NULL, -- 'travel', 'equipment', 'expert', 'legal', 'other'
  category VARCHAR(50),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  receipt_url TEXT,
  expense_date DATE NOT NULL,
  is_billable BOOLEAN DEFAULT true,
  is_reimbursed BOOLEAN DEFAULT false,
  approval_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment tracking
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES claims(id),
  fee_schedule_id UUID REFERENCES fee_schedules(id),
  payment_type VARCHAR(50) NOT NULL, -- 'fee_payment', 'settlement', 'expense_reimbursement'
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50), -- 'check', 'wire', 'ach', 'credit_card'
  payment_date DATE,
  reference_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  notes TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. VENDOR MANAGEMENT TABLES
-- =====================================================

-- Vendors table (create if not exists)
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

-- 3. PROPERTY MANAGEMENT TABLES
-- =====================================================

-- Properties table (create if not exists)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  property_type VARCHAR(50) NOT NULL, -- 'residential', 'commercial', 'industrial'
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(50) DEFAULT 'US',
  year_built INTEGER,
  square_footage INTEGER,
  lot_size DECIMAL(10,2),
  construction_type VARCHAR(50),
  roof_type VARCHAR(50),
  foundation_type VARCHAR(50),
  heating_type VARCHAR(50),
  cooling_type VARCHAR(50),
  electrical_system VARCHAR(50),
  plumbing_system VARCHAR(50),
  estimated_value DECIMAL(12,2),
  replacement_cost DECIMAL(12,2),
  property_photos JSONB,
  property_documents JSONB,
  inspection_history JSONB,
  notes TEXT,
  created_by UUID REFERENCES user_profiles(id),
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

-- 4. COMMUNICATION MANAGEMENT TABLES
-- =====================================================

-- Communication templates
CREATE TABLE IF NOT EXISTS communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'letter'
  category VARCHAR(50), -- 'welcome', 'follow_up', 'payment_reminder', 'settlement'
  subject VARCHAR(255),
  content TEXT NOT NULL,
  variables JSONB, -- template variables like {{client_name}}, {{claim_number}}
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 5. SETTLEMENT MANAGEMENT TABLES
-- =====================================================

-- Settlements
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  settlement_type VARCHAR(50) NOT NULL, -- 'dwelling', 'contents', 'ale', 'total_loss'
  settlement_stage VARCHAR(50) DEFAULT 'initial', -- 'initial', 'supplemental', 'final'
  carrier_offer_amount DECIMAL(12,2),
  demanded_amount DECIMAL(12,2),
  negotiated_amount DECIMAL(12,2),
  final_settlement_amount DECIMAL(12,2),
  settlement_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'negotiating', 'agreed', 'disputed', 'finalized'
  settlement_date DATE,
  payment_schedule JSONB, -- payment breakdown and schedule
  deductible_amount DECIMAL(12,2),
  our_fee_amount DECIMAL(12,2),
  client_net_amount DECIMAL(12,2),
  settlement_documents JSONB,
  notes TEXT,
  negotiated_by UUID REFERENCES user_profiles(id),
  approved_by UUID REFERENCES user_profiles(id),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settlement line items
CREATE TABLE IF NOT EXISTS settlement_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- 'dwelling', 'contents', 'ale', 'code_upgrade'
  item_description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_cost DECIMAL(12,2),
  total_cost DECIMAL(12,2),
  carrier_approved_amount DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'disputed', 'excluded'
  dispute_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MODULE MANAGEMENT TABLE
-- =====================================================

-- Module management and billing
CREATE TABLE IF NOT EXISTS organization_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  module_name VARCHAR(100) NOT NULL, -- 'claims', 'clients', 'ai_insights', 'financial', etc.
  is_active BOOLEAN DEFAULT true,
  activation_date DATE DEFAULT CURRENT_DATE,
  deactivation_date DATE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  billing_tier VARCHAR(50) DEFAULT 'basic', -- 'basic', 'professional', 'enterprise'
  monthly_fee DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, module_name)
);

-- 7. INTEGRATION MANAGEMENT TABLE
-- =====================================================

-- Third-party integrations
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_type VARCHAR(50) NOT NULL, -- 'xactimate', 'quickbooks', 'email', 'calendar'
  integration_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'inactive', -- 'inactive', 'active', 'error', 'suspended'
  configuration JSONB, -- integration-specific settings
  credentials_encrypted TEXT, -- encrypted API keys and credentials
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency VARCHAR(20) DEFAULT 'manual', -- 'manual', 'hourly', 'daily', 'weekly'
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fee_schedules_org_claim ON fee_schedules(organization_id, claim_id);
CREATE INDEX IF NOT EXISTS idx_expenses_org_claim ON expenses(organization_id, claim_id);
CREATE INDEX IF NOT EXISTS idx_payments_org_claim ON payments(organization_id, claim_id);
CREATE INDEX IF NOT EXISTS idx_vendors_org_type ON vendors(organization_id, vendor_type);
CREATE INDEX IF NOT EXISTS idx_claim_vendors_claim ON claim_vendors(claim_id);
CREATE INDEX IF NOT EXISTS idx_properties_org_client ON properties(organization_id, client_id);
CREATE INDEX IF NOT EXISTS idx_communications_org_claim ON communications(organization_id, claim_id);
CREATE INDEX IF NOT EXISTS idx_settlements_org_claim ON settlements(organization_id, claim_id);

-- Update RLS policies for new tables
ALTER TABLE fee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Organization isolation" ON fee_schedules FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON expenses FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON payments FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON vendors FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON claim_vendors FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON vendor_reviews FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON properties FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON property_inspections FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON communication_templates FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON communications FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON communication_preferences FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON settlements FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON settlement_line_items FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON organization_modules FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON integrations FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));;