-- Migration: create_integration_management_tables
-- Created at: 1752103181

-- Create third-party integration management system

-- Integration providers/services
CREATE TABLE IF NOT EXISTS integration_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL, -- email, sms, calendar, payment, ai, storage, etc.
  description TEXT,
  website_url TEXT,
  documentation_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  required_credentials JSONB DEFAULT '{}', -- {api_key: true, secret: true, etc.}
  supported_features JSONB DEFAULT '{}', -- {send_email: true, schedule_email: true, etc.}
  pricing_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization-specific integration configurations
CREATE TABLE IF NOT EXISTS organization_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES integration_providers(id),
  is_enabled BOOLEAN DEFAULT FALSE,
  configuration JSONB DEFAULT '{}', -- provider-specific settings
  credentials_encrypted TEXT, -- encrypted API keys, secrets, etc.
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(20) DEFAULT 'disconnected', -- connected, disconnected, error, syncing
  error_message TEXT,
  usage_stats JSONB DEFAULT '{}', -- API call counts, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, provider_id)
);

-- Integration activity logs
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- send_email, create_calendar_event, send_sms, etc.
  status VARCHAR(20) NOT NULL, -- success, error, pending
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API rate limiting and quotas
CREATE TABLE IF NOT EXISTS integration_quotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  quota_type VARCHAR(50) NOT NULL, -- daily, monthly, per_minute
  limit_value INTEGER NOT NULL,
  current_usage INTEGER DEFAULT 0,
  reset_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(integration_id, quota_type)
);

-- Pre-populate common integration providers
INSERT INTO integration_providers (name, category, description, required_credentials, supported_features) VALUES
('SendGrid', 'email', 'Email delivery service for transactional and marketing emails', 
 '{"api_key": true}', 
 '{"send_email": true, "templates": true, "tracking": true, "bounce_handling": true}'),
 
('Twilio', 'sms', 'SMS and voice communication platform',
 '{"account_sid": true, "auth_token": true}',
 '{"send_sms": true, "voice_calls": true, "number_lookup": true}'),
 
('Google Calendar', 'calendar', 'Google Calendar integration for scheduling',
 '{"client_id": true, "client_secret": true}',
 '{"create_events": true, "sync_calendar": true, "availability": true}'),
 
('Microsoft Outlook', 'calendar', 'Microsoft Outlook/Office 365 calendar integration',
 '{"client_id": true, "client_secret": true}',
 '{"create_events": true, "sync_calendar": true, "availability": true}'),
 
('Stripe', 'payment', 'Payment processing platform',
 '{"publishable_key": true, "secret_key": true}',
 '{"process_payments": true, "subscriptions": true, "invoicing": true}'),
 
('Anthropic Claude', 'ai', 'AI assistant for document analysis and insights',
 '{"api_key": true}',
 '{"text_analysis": true, "document_processing": true, "chat": true}'),
 
('Zoom', 'video', 'Video conferencing platform',
 '{"api_key": true, "api_secret": true}',
 '{"create_meetings": true, "schedule_meetings": true, "recordings": true}'),
 
('Dropbox', 'storage', 'Cloud storage and file sharing',
 '{"access_token": true}',
 '{"file_upload": true, "file_sharing": true, "sync": true}'),
 
('DocuSign', 'documents', 'Electronic signature platform',
 '{"integration_key": true, "user_id": true, "private_key": true}',
 '{"send_documents": true, "track_signatures": true, "templates": true}'),
 
('QuickBooks', 'accounting', 'Accounting and bookkeeping software',
 '{"client_id": true, "client_secret": true}',
 '{"sync_transactions": true, "invoicing": true, "expenses": true}');

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_org_integrations_org_id ON organization_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_org_id ON integration_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at);

-- RLS policies
ALTER TABLE organization_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organization isolation for integrations" ON organization_integrations 
FOR ALL USING (organization_id = get_user_organization_id());

ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organization isolation for integration logs" ON integration_logs 
FOR ALL USING (organization_id = get_user_organization_id());

ALTER TABLE integration_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organization isolation for integration quotas" ON integration_quotas 
FOR ALL USING (organization_id = get_user_organization_id());;