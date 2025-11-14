-- Migration: Create Communication Integration System
-- Created at: 1763132166 (2025-11-14)
-- Description: Complete communication system with Twilio/SendGrid integration and AI matching

-- ============================================================================
-- CORE COMMUNICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
  
  -- Communication metadata
  type VARCHAR(20) NOT NULL CHECK (type IN ('call', 'sms', 'email', 'voicemail')),
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sent', 'delivered', 'failed', 'received', 'in_progress', 'completed')),
  
  -- Contact information
  from_number VARCHAR(100),
  to_number VARCHAR(100),
  from_email VARCHAR(255),
  to_email VARCHAR(255),
  cc_emails TEXT[], -- Carbon copy recipients
  
  -- Content
  subject VARCHAR(500),
  body TEXT,
  message_content TEXT, -- For SMS
  
  -- External IDs
  twilio_sid VARCHAR(100) UNIQUE, -- Call SID or Message SID
  sendgrid_message_id VARCHAR(255) UNIQUE,
  
  -- Threading (for emails)
  thread_id VARCHAR(255), -- Groups related communications
  parent_communication_id UUID REFERENCES communications(id) ON DELETE SET NULL,
  message_id VARCHAR(255), -- Email Message-ID header
  in_reply_to VARCHAR(255), -- Email In-Reply-To header
  
  -- Call-specific fields
  call_duration_seconds INTEGER,
  call_recording_url TEXT,
  call_recording_sid VARCHAR(100),
  recording_consent_given BOOLEAN DEFAULT false,
  
  -- AI Analysis
  ai_matched BOOLEAN DEFAULT false,
  ai_match_confidence DECIMAL(5,2), -- 0-100
  ai_extracted_data JSONB, -- Extracted policy numbers, names, dates
  ai_sentiment VARCHAR(20), -- positive, neutral, negative, urgent
  ai_summary TEXT,
  requires_manual_review BOOLEAN DEFAULT false,
  
  -- Analytics
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Cost tracking
  cost_cents INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT valid_phone_or_email CHECK (
    (type IN ('call', 'sms') AND from_number IS NOT NULL) OR
    (type = 'email' AND from_email IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_communications_organization ON communications(organization_id);
CREATE INDEX idx_communications_claim ON communications(claim_id) WHERE claim_id IS NOT NULL;
CREATE INDEX idx_communications_type_status ON communications(type, status);
CREATE INDEX idx_communications_created_at ON communications(created_at DESC);
CREATE INDEX idx_communications_twilio_sid ON communications(twilio_sid) WHERE twilio_sid IS NOT NULL;
CREATE INDEX idx_communications_thread ON communications(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX idx_communications_ai_matched ON communications(ai_matched, requires_manual_review);
CREATE INDEX idx_communications_from_number ON communications(from_number) WHERE from_number IS NOT NULL;
CREATE INDEX idx_communications_from_email ON communications(from_email) WHERE from_email IS NOT NULL;

-- Full-text search on content
CREATE INDEX idx_communications_content_search ON communications USING gin (
  to_tsvector('english', COALESCE(subject, '') || ' ' || COALESCE(body, '') || ' ' || COALESCE(message_content, ''))
);

-- ============================================================================
-- TWILIO PHONE NUMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS twilio_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  
  -- Phone number details
  phone_number VARCHAR(50) NOT NULL UNIQUE,
  friendly_name VARCHAR(255),
  phone_number_sid VARCHAR(100) UNIQUE, -- Twilio Phone Number SID
  
  -- Configuration
  number_type VARCHAR(20) NOT NULL CHECK (number_type IN ('dedicated', 'forwarded', 'pool')),
  forward_to_number VARCHAR(50), -- For forwarded numbers
  
  -- Capabilities
  voice_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  mms_enabled BOOLEAN DEFAULT false,
  
  -- Assignment
  assigned_to VARCHAR(100), -- department, user, or claim type
  region VARCHAR(100),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Usage tracking
  total_calls INTEGER DEFAULT 0,
  total_sms INTEGER DEFAULT 0,
  monthly_cost_cents INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_twilio_numbers_org ON twilio_phone_numbers(organization_id);
CREATE INDEX idx_twilio_numbers_status ON twilio_phone_numbers(status);
CREATE INDEX idx_twilio_numbers_type ON twilio_phone_numbers(number_type);

-- ============================================================================
-- CLAIM EMAIL ADDRESSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS claim_email_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  
  -- Email configuration
  email_address VARCHAR(255) NOT NULL UNIQUE,
  email_prefix VARCHAR(100) NOT NULL, -- e.g., "claim-12345"
  
  -- CC recipients for all emails to this claim
  default_cc_emails TEXT[],
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'bounced')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(claim_id) -- One email per claim
);

CREATE INDEX idx_claim_emails_org ON claim_email_addresses(organization_id);
CREATE INDEX idx_claim_emails_claim ON claim_email_addresses(claim_id);
CREATE INDEX idx_claim_emails_address ON claim_email_addresses(email_address);

-- ============================================================================
-- COMMUNICATION TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  
  -- Template metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('sms', 'email', 'voice')),
  category VARCHAR(100), -- e.g., "status_update", "document_request", "appointment"
  
  -- Content
  subject VARCHAR(500), -- For emails
  body TEXT NOT NULL,
  
  -- Variables available for substitution
  available_variables TEXT[], -- e.g., ["claimant_name", "claim_number", "adjuster_name"]
  
  -- Usage
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_comm_templates_org ON communication_templates(organization_id);
CREATE INDEX idx_comm_templates_type ON communication_templates(type);
CREATE INDEX idx_comm_templates_active ON communication_templates(is_active);
CREATE INDEX idx_comm_templates_category ON communication_templates(category);

-- ============================================================================
-- CALL RECORDINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS call_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id UUID NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  
  -- Recording details
  recording_sid VARCHAR(100) NOT NULL UNIQUE,
  recording_url TEXT NOT NULL,
  recording_duration_seconds INTEGER,
  
  -- Consent
  consent_obtained BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMP WITH TIME ZONE,
  consent_method VARCHAR(50), -- e.g., "ivr_prompt", "explicit_verbal"
  
  -- Transcription
  transcription_text TEXT,
  transcription_confidence DECIMAL(5,2),
  transcription_status VARCHAR(20) CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed')),
  transcribed_at TIMESTAMP WITH TIME ZONE,
  
  -- Storage
  storage_provider VARCHAR(50) DEFAULT 'twilio',
  storage_url TEXT,
  file_size_bytes BIGINT,
  
  -- Retention
  expires_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recordings_comm ON call_recordings(communication_id);
CREATE INDEX idx_recordings_org ON call_recordings(organization_id);
CREATE INDEX idx_recordings_sid ON call_recordings(recording_sid);
CREATE INDEX idx_recordings_expires ON call_recordings(expires_at) WHERE expires_at IS NOT NULL;

-- Full-text search on transcriptions
CREATE INDEX idx_recordings_transcript_search ON call_recordings USING gin (
  to_tsvector('english', COALESCE(transcription_text, ''))
) WHERE transcription_text IS NOT NULL;

-- ============================================================================
-- COMMUNICATION QUEUE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS communication_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  
  -- Queue entry details
  type VARCHAR(20) NOT NULL CHECK (type IN ('call', 'sms', 'email')),
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10), -- 1 = highest
  
  -- Recipient
  recipient_phone VARCHAR(100),
  recipient_email VARCHAR(255),
  
  -- Content
  subject VARCHAR(500),
  body TEXT NOT NULL,
  template_id UUID REFERENCES communication_templates(id) ON DELETE SET NULL,
  template_variables JSONB,
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  send_after TIMESTAMP WITH TIME ZONE,
  send_before TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  
  -- Result
  communication_id UUID REFERENCES communications(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_comm_queue_org ON communication_queue(organization_id);
CREATE INDEX idx_comm_queue_status ON communication_queue(status) WHERE status IN ('pending', 'failed');
CREATE INDEX idx_comm_queue_scheduled ON communication_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_comm_queue_priority ON communication_queue(priority, scheduled_for);
CREATE INDEX idx_comm_queue_claim ON communication_queue(claim_id) WHERE claim_id IS NOT NULL;

-- ============================================================================
-- COMMUNICATION ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS communication_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Volume metrics
  total_communications INTEGER DEFAULT 0,
  total_calls INTEGER DEFAULT 0,
  total_sms INTEGER DEFAULT 0,
  total_emails INTEGER DEFAULT 0,
  
  -- Direction breakdown
  inbound_count INTEGER DEFAULT 0,
  outbound_count INTEGER DEFAULT 0,
  
  -- Status breakdown
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  
  -- Call metrics
  total_call_duration_seconds BIGINT DEFAULT 0,
  average_call_duration_seconds INTEGER DEFAULT 0,
  
  -- AI metrics
  ai_matched_count INTEGER DEFAULT 0,
  ai_match_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
  manual_review_count INTEGER DEFAULT 0,
  
  -- Response metrics
  average_response_time_minutes INTEGER,
  
  -- Cost metrics
  total_cost_cents INTEGER DEFAULT 0,
  cost_per_communication_cents INTEGER DEFAULT 0,
  
  -- Created/updated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, date)
);

CREATE INDEX idx_comm_analytics_org_date ON communication_analytics(organization_id, date DESC);
CREATE INDEX idx_comm_analytics_date ON communication_analytics(date DESC);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_communications_updated_at BEFORE UPDATE ON communications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_twilio_phone_numbers_updated_at BEFORE UPDATE ON twilio_phone_numbers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_email_addresses_updated_at BEFORE UPDATE ON claim_email_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_templates_updated_at BEFORE UPDATE ON communication_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_recordings_updated_at BEFORE UPDATE ON call_recordings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_queue_updated_at BEFORE UPDATE ON communication_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_analytics_updated_at BEFORE UPDATE ON communication_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE twilio_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_email_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_analytics ENABLE ROW LEVEL SECURITY;

-- Communications policies
CREATE POLICY "org_isolation_communications_select" ON communications
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_communications_insert" ON communications
    FOR INSERT WITH CHECK (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_communications_update" ON communications
    FOR UPDATE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_communications_delete" ON communications
    FOR DELETE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

-- Twilio phone numbers policies
CREATE POLICY "org_isolation_twilio_numbers_select" ON twilio_phone_numbers
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_twilio_numbers_insert" ON twilio_phone_numbers
    FOR INSERT WITH CHECK (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_twilio_numbers_update" ON twilio_phone_numbers
    FOR UPDATE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_twilio_numbers_delete" ON twilio_phone_numbers
    FOR DELETE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

-- Claim email addresses policies
CREATE POLICY "org_isolation_claim_emails_select" ON claim_email_addresses
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_claim_emails_insert" ON claim_email_addresses
    FOR INSERT WITH CHECK (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_claim_emails_update" ON claim_email_addresses
    FOR UPDATE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_claim_emails_delete" ON claim_email_addresses
    FOR DELETE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

-- Communication templates policies
CREATE POLICY "org_isolation_templates_select" ON communication_templates
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_templates_insert" ON communication_templates
    FOR INSERT WITH CHECK (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_templates_update" ON communication_templates
    FOR UPDATE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_templates_delete" ON communication_templates
    FOR DELETE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

-- Call recordings policies
CREATE POLICY "org_isolation_recordings_select" ON call_recordings
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_recordings_insert" ON call_recordings
    FOR INSERT WITH CHECK (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_recordings_update" ON call_recordings
    FOR UPDATE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_recordings_delete" ON call_recordings
    FOR DELETE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

-- Communication queue policies
CREATE POLICY "org_isolation_queue_select" ON communication_queue
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_queue_insert" ON communication_queue
    FOR INSERT WITH CHECK (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_queue_update" ON communication_queue
    FOR UPDATE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_queue_delete" ON communication_queue
    FOR DELETE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

-- Communication analytics policies
CREATE POLICY "org_isolation_analytics_select" ON communication_analytics
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_analytics_insert" ON communication_analytics
    FOR INSERT WITH CHECK (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_analytics_update" ON communication_analytics
    FOR UPDATE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

CREATE POLICY "org_isolation_analytics_delete" ON communication_analytics
    FOR DELETE USING (
        organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to aggregate daily communication analytics
CREATE OR REPLACE FUNCTION aggregate_communication_analytics(target_date DATE, target_org_id TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO communication_analytics (
        organization_id,
        date,
        total_communications,
        total_calls,
        total_sms,
        total_emails,
        inbound_count,
        outbound_count,
        delivered_count,
        failed_count,
        total_call_duration_seconds,
        average_call_duration_seconds,
        ai_matched_count,
        ai_match_rate,
        manual_review_count,
        total_cost_cents
    )
    SELECT
        target_org_id,
        target_date,
        COUNT(*),
        COUNT(*) FILTER (WHERE type = 'call'),
        COUNT(*) FILTER (WHERE type = 'sms'),
        COUNT(*) FILTER (WHERE type = 'email'),
        COUNT(*) FILTER (WHERE direction = 'inbound'),
        COUNT(*) FILTER (WHERE direction = 'outbound'),
        COUNT(*) FILTER (WHERE status IN ('delivered', 'completed')),
        COUNT(*) FILTER (WHERE status = 'failed'),
        COALESCE(SUM(call_duration_seconds), 0),
        COALESCE(AVG(call_duration_seconds)::INTEGER, 0),
        COUNT(*) FILTER (WHERE ai_matched = true),
        CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE ai_matched = true)::DECIMAL / COUNT(*) * 100) ELSE 0 END,
        COUNT(*) FILTER (WHERE requires_manual_review = true),
        COALESCE(SUM(cost_cents), 0)
    FROM communications
    WHERE organization_id = target_org_id
      AND DATE(created_at) = target_date
    ON CONFLICT (organization_id, date) 
    DO UPDATE SET
        total_communications = EXCLUDED.total_communications,
        total_calls = EXCLUDED.total_calls,
        total_sms = EXCLUDED.total_sms,
        total_emails = EXCLUDED.total_emails,
        inbound_count = EXCLUDED.inbound_count,
        outbound_count = EXCLUDED.outbound_count,
        delivered_count = EXCLUDED.delivered_count,
        failed_count = EXCLUDED.failed_count,
        total_call_duration_seconds = EXCLUDED.total_call_duration_seconds,
        average_call_duration_seconds = EXCLUDED.average_call_duration_seconds,
        ai_matched_count = EXCLUDED.ai_matched_count,
        ai_match_rate = EXCLUDED.ai_match_rate,
        manual_review_count = EXCLUDED.manual_review_count,
        total_cost_cents = EXCLUDED.total_cost_cents,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA: DEFAULT COMMUNICATION TEMPLATES
-- ============================================================================

INSERT INTO communication_templates (organization_id, name, description, type, category, subject, body, available_variables, is_active)
VALUES
-- SMS Templates
('default', 'Claim Status Update', 'Notify claimant of claim status change', 'sms', 'status_update', NULL, 
  'Hi {{claimant_name}}, your claim #{{claim_number}} status has been updated to {{new_status}}. Contact us at {{office_phone}} with questions.',
  ARRAY['claimant_name', 'claim_number', 'new_status', 'office_phone'],
  true),

('default', 'Document Request', 'Request documents from claimant', 'sms', 'document_request', NULL,
  'Hi {{claimant_name}}, we need additional documents for claim #{{claim_number}}. Please upload: {{document_list}}. Reply HELP for assistance.',
  ARRAY['claimant_name', 'claim_number', 'document_list'],
  true),

('default', 'Appointment Reminder', 'Remind claimant of upcoming appointment', 'sms', 'appointment', NULL,
  'Reminder: Your appointment for claim #{{claim_number}} is on {{appointment_date}} at {{appointment_time}}. Address: {{location}}. Reply CONFIRM to confirm.',
  ARRAY['claim_number', 'appointment_date', 'appointment_time', 'location'],
  true),

-- Email Templates
('default', 'Claim Opened Confirmation', 'Confirm new claim has been opened', 'email', 'status_update',
  'Your Claim #{{claim_number}} Has Been Opened',
  'Dear {{claimant_name}},\n\nThank you for filing your claim with us. Your claim number is {{claim_number}}.\n\nYour assigned adjuster is {{adjuster_name}} and can be reached at {{adjuster_email}} or {{adjuster_phone}}.\n\nWe will review your claim and contact you within 2-3 business days.\n\nBest regards,\n{{company_name}}',
  ARRAY['claimant_name', 'claim_number', 'adjuster_name', 'adjuster_email', 'adjuster_phone', 'company_name'],
  true),

('default', 'Payment Processed', 'Notify claimant of payment', 'email', 'payment',
  'Payment Processed for Claim #{{claim_number}}',
  'Dear {{claimant_name}},\n\nYour payment of ${{payment_amount}} for claim #{{claim_number}} has been processed.\n\nPayment method: {{payment_method}}\nExpected delivery: {{expected_delivery_date}}\n\nIf you have questions, contact your adjuster {{adjuster_name}} at {{adjuster_email}}.\n\nBest regards,\n{{company_name}}',
  ARRAY['claimant_name', 'claim_number', 'payment_amount', 'payment_method', 'expected_delivery_date', 'adjuster_name', 'adjuster_email', 'company_name'],
  true),

('default', 'Document Receipt Confirmation', 'Confirm document received', 'email', 'document_request',
  'Documents Received for Claim #{{claim_number}}',
  'Dear {{claimant_name}},\n\nWe have received the following documents for claim #{{claim_number}}:\n\n{{document_list}}\n\nWe will review these documents and contact you if we need additional information.\n\nThank you,\n{{adjuster_name}}\n{{company_name}}',
  ARRAY['claimant_name', 'claim_number', 'document_list', 'adjuster_name', 'company_name'],
  true);

-- ============================================================================
-- GRANTS (for authenticated users)
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON communications TO authenticated;
GRANT SELECT ON twilio_phone_numbers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON claim_email_addresses TO authenticated;
GRANT SELECT ON communication_templates TO authenticated;
GRANT SELECT ON call_recordings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON communication_queue TO authenticated;
GRANT SELECT ON communication_analytics TO authenticated;

-- Grant execute on helper function
GRANT EXECUTE ON FUNCTION aggregate_communication_analytics TO authenticated;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE communications IS 'Central log of all communications (calls, SMS, emails) with AI matching and analytics';
COMMENT ON TABLE twilio_phone_numbers IS 'Managed Twilio phone numbers for voice and SMS';
COMMENT ON TABLE claim_email_addresses IS 'Unique email addresses generated per claim for organized communication';
COMMENT ON TABLE communication_templates IS 'Reusable templates for outbound communications with variable substitution';
COMMENT ON TABLE call_recordings IS 'Call recording metadata, transcriptions, and consent tracking';
COMMENT ON TABLE communication_queue IS 'Queue for scheduled and retry-based outbound communications';
COMMENT ON TABLE communication_analytics IS 'Aggregated daily analytics for communication metrics and costs';

-- Migration complete
