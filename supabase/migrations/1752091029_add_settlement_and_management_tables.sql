-- Migration: add_settlement_and_management_tables
-- Created at: 1752091029

-- =====================================================
-- SETTLEMENT MANAGEMENT TABLES
-- =====================================================

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

-- =====================================================
-- MODULE MANAGEMENT TABLES
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

-- =====================================================
-- INTEGRATION MANAGEMENT TABLES
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

-- =====================================================
-- ADVANCED SEARCH AND ANALYTICS TABLES
-- =====================================================

-- Saved searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  search_name VARCHAR(255) NOT NULL,
  search_type VARCHAR(50) NOT NULL, -- 'claims', 'clients', 'vendors', 'properties'
  search_criteria JSONB NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  shared_with UUID[], -- array of user IDs
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity tracking
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete', 'view'
  entity_type VARCHAR(50), -- 'claim', 'client', 'vendor', 'document'
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_settlement_line_items_settlement ON settlement_line_items(settlement_id);
CREATE INDEX IF NOT EXISTS idx_organization_modules_org ON organization_modules(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_org_type ON integrations(organization_id, integration_type);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_date ON user_activity_logs(user_id, created_at);

-- Enable RLS
ALTER TABLE settlement_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Organization isolation" ON settlement_line_items FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON organization_modules FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON integrations FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON saved_searches FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON user_activity_logs FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));;