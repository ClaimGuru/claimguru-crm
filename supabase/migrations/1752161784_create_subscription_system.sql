-- Migration: create_subscription_system
-- Created at: 1752161784

-- Phase 1: Create Subscription and Token System
-- Create subscription tiers and AI token management

-- Subscription tiers enum
CREATE TYPE subscription_tier AS ENUM ('individual', 'firm', 'enterprise');

-- User roles enum (enhanced hierarchy)
CREATE TYPE user_role AS ENUM ('system_admin', 'subscriber', 'admin', 'user', 'office_staff');

-- Feature modules enum
CREATE TYPE feature_module AS ENUM (
  'email_integration',
  'phone_recording', 
  'advanced_ai_analytics',
  'weather_intelligence',
  'fraud_detection',
  'property_analysis_pro',
  'vendor_network'
);

-- Organization subscriptions table
CREATE TABLE organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'individual',
  status TEXT NOT NULL DEFAULT 'active', -- active, trial, cancelled, suspended
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  subscription_start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_billing_date TIMESTAMPTZ,
  monthly_price DECIMAL(10,2),
  annual_discount DECIMAL(5,2) DEFAULT 0.20, -- 20% annual discount
  max_assignable_users INTEGER NOT NULL DEFAULT 1,
  max_office_staff INTEGER NOT NULL DEFAULT 0,
  ai_tokens_monthly INTEGER NOT NULL DEFAULT 1000,
  ai_tokens_current INTEGER NOT NULL DEFAULT 1000,
  ai_tokens_last_reset TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature module subscriptions
CREATE TABLE organization_feature_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  module feature_module NOT NULL,
  is_active BOOLEAN DEFAULT true,
  monthly_price DECIMAL(10,2) NOT NULL,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, module)
);

-- AI Token transactions tracking
CREATE TABLE ai_token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'usage', 'purchase', 'monthly_allocation', 'bonus'
  tokens_amount INTEGER NOT NULL, -- positive for additions, negative for usage
  tokens_remaining INTEGER NOT NULL,
  feature_used TEXT, -- 'document_analysis', 'policy_extraction', etc.
  cost_per_token DECIMAL(6,4) DEFAULT 0.01,
  total_cost DECIMAL(10,2),
  metadata JSONB, -- Additional context about the transaction
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles and permissions
CREATE TABLE user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, organization_id)
);

-- Feature access tracking
CREATE TABLE user_feature_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  feature_module feature_module NOT NULL,
  access_granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription tier pricing (system admin controlled)
CREATE TABLE subscription_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  max_assignable_users INTEGER NOT NULL,
  max_office_staff INTEGER NOT NULL,
  ai_tokens_monthly INTEGER NOT NULL,
  features JSONB, -- Array of included features
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tier)
);

-- Feature module pricing (system admin controlled)
CREATE TABLE feature_module_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module feature_module NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  bonus_tokens INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module)
);

-- Insert default subscription pricing
INSERT INTO subscription_pricing (tier, monthly_price, max_assignable_users, max_office_staff, ai_tokens_monthly, features) VALUES
('individual', 99.00, 1, 1, 1000, '["base_crm", "basic_analytics"]'),
('firm', 250.00, 3, 2, 3000, '["base_crm", "basic_analytics", "multi_user"]'),
('enterprise', 0.00, -1, -1, 10000, '["base_crm", "basic_analytics", "multi_user", "custom_features"]');

-- Insert default feature module pricing
INSERT INTO feature_module_pricing (module, monthly_price, bonus_tokens, description) VALUES
('email_integration', 29.00, 0, 'Gmail, Outlook, and email platform integrations'),
('phone_recording', 39.00, 0, 'VoIP integration and call recording'),
('advanced_ai_analytics', 49.00, 500, 'Advanced AI insights and predictive analytics'),
('weather_intelligence', 19.00, 0, 'Weather correlation and analysis'),
('fraud_detection', 59.00, 1000, 'Advanced fraud detection algorithms'),
('property_analysis_pro', 39.00, 200, 'AI-powered property analysis and valuation'),
('vendor_network', 29.00, 0, 'Access to vendor network and recommendations');

-- Functions for token management
CREATE OR REPLACE FUNCTION consume_ai_tokens(
  org_id UUID,
  user_id UUID,
  tokens_needed INTEGER,
  feature_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  current_tokens INTEGER;
  subscription_record RECORD;
BEGIN
  -- Get current subscription
  SELECT * INTO subscription_record
  FROM organization_subscriptions 
  WHERE organization_id = org_id AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active subscription found';
  END IF;
  
  -- Check if enough tokens
  IF subscription_record.ai_tokens_current < tokens_needed THEN
    RETURN FALSE;
  END IF;
  
  -- Consume tokens
  UPDATE organization_subscriptions 
  SET ai_tokens_current = ai_tokens_current - tokens_needed,
      updated_at = NOW()
  WHERE organization_id = org_id;
  
  -- Record transaction
  INSERT INTO ai_token_transactions (
    organization_id, user_id, transaction_type, tokens_amount, 
    tokens_remaining, feature_used, cost_per_token
  ) VALUES (
    org_id, user_id, 'usage', -tokens_needed,
    subscription_record.ai_tokens_current - tokens_needed, feature_name, 0.00
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly tokens
CREATE OR REPLACE FUNCTION reset_monthly_ai_tokens() RETURNS void AS $$
DECLARE
  sub_record RECORD;
BEGIN
  FOR sub_record IN 
    SELECT * FROM organization_subscriptions 
    WHERE status = 'active' 
    AND ai_tokens_last_reset < date_trunc('month', NOW())
  LOOP
    -- Reset tokens to monthly allocation
    UPDATE organization_subscriptions 
    SET ai_tokens_current = ai_tokens_monthly,
        ai_tokens_last_reset = NOW()
    WHERE id = sub_record.id;
    
    -- Record monthly allocation transaction
    INSERT INTO ai_token_transactions (
      organization_id, transaction_type, tokens_amount, 
      tokens_remaining, feature_used
    ) VALUES (
      sub_record.organization_id, 'monthly_allocation', sub_record.ai_tokens_monthly,
      sub_record.ai_tokens_monthly, 'monthly_reset'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to purchase additional tokens
CREATE OR REPLACE FUNCTION purchase_ai_tokens(
  org_id UUID,
  user_id UUID,
  tokens_to_add INTEGER,
  cost_per_token DECIMAL DEFAULT 0.01
) RETURNS BOOLEAN AS $$
DECLARE
  total_cost DECIMAL;
BEGIN
  total_cost := tokens_to_add * cost_per_token;
  
  -- Add tokens to current balance
  UPDATE organization_subscriptions 
  SET ai_tokens_current = ai_tokens_current + tokens_to_add,
      updated_at = NOW()
  WHERE organization_id = org_id AND status = 'active';
  
  -- Record purchase transaction
  INSERT INTO ai_token_transactions (
    organization_id, user_id, transaction_type, tokens_amount, 
    tokens_remaining, cost_per_token, total_cost
  ) VALUES (
    org_id, user_id, 'purchase', tokens_to_add,
    (SELECT ai_tokens_current FROM organization_subscriptions WHERE organization_id = org_id),
    cost_per_token, total_cost
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all new tables
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_feature_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_module_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization subscriptions
CREATE POLICY "Users can view their organization subscription" ON organization_subscriptions
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Subscribers can update their subscription" ON organization_subscriptions
FOR UPDATE USING (organization_id IN (
  SELECT organization_id FROM user_role_assignments 
  WHERE user_id = auth.uid() AND role IN ('subscriber', 'system_admin')
));

-- RLS Policies for feature modules
CREATE POLICY "Users can view organization feature modules" ON organization_feature_modules
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

-- RLS Policies for token transactions
CREATE POLICY "Users can view their organization token transactions" ON ai_token_transactions
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

-- RLS Policies for user roles
CREATE POLICY "Users can view role assignments in their organization" ON user_role_assignments
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

-- RLS Policies for feature access
CREATE POLICY "Users can view feature access in their organization" ON user_feature_access
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

-- Public read access for pricing (system admin controlled)
CREATE POLICY "Anyone can view subscription pricing" ON subscription_pricing
FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view feature module pricing" ON feature_module_pricing  
FOR SELECT USING (is_active = true);

-- Only system admins can modify pricing
CREATE POLICY "System admins can manage subscription pricing" ON subscription_pricing
FOR ALL USING (EXISTS (
  SELECT 1 FROM user_role_assignments 
  WHERE user_id = auth.uid() AND role = 'system_admin'
));

CREATE POLICY "System admins can manage feature pricing" ON feature_module_pricing
FOR ALL USING (EXISTS (
  SELECT 1 FROM user_role_assignments 
  WHERE user_id = auth.uid() AND role = 'system_admin'
));

-- Create indexes for performance
CREATE INDEX idx_org_subscriptions_org_id ON organization_subscriptions(organization_id);
CREATE INDEX idx_org_subscriptions_status ON organization_subscriptions(status);
CREATE INDEX idx_feature_modules_org_id ON organization_feature_modules(organization_id);
CREATE INDEX idx_ai_transactions_org_id ON ai_token_transactions(organization_id);
CREATE INDEX idx_ai_transactions_user_id ON ai_token_transactions(user_id);
CREATE INDEX idx_ai_transactions_created_at ON ai_token_transactions(created_at);
CREATE INDEX idx_user_roles_user_id ON user_role_assignments(user_id);
CREATE INDEX idx_user_roles_org_id ON user_role_assignments(organization_id);
CREATE INDEX idx_feature_access_user_id ON user_feature_access(user_id);;