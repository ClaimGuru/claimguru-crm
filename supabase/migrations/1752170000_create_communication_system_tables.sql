-- Migration: create_communication_system_tables
-- Created at: 1752170000

-- Enhanced Communication System Tables for Email Automation and Amazon Connect Integration
-- Created: 2025-07-11

-- Email Logs Table - Enhanced for advanced email automation
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT UNIQUE NOT NULL, -- Email message ID for deduplication
  claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  -- Email Details
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  recipient_emails TEXT[] NOT NULL, -- Array for multiple recipients
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  
  -- Classification and Processing
  extracted_claim_numbers TEXT[], -- Array of found claim numbers
  extracted_policy_numbers TEXT[], -- Array of found policy numbers
  classification_source TEXT CHECK (classification_source IN ('subject_line', 'body_text', 'ai_analysis', 'manual')),
  classification_confidence DECIMAL(3,2) DEFAULT 0.0, -- 0.00 to 1.00
  
  -- Status and Assignment
  status TEXT CHECK (status IN ('unprocessed', 'pending_review', 'assigned', 'excluded', 'processed')) DEFAULT 'unprocessed',
  assignment_status TEXT CHECK (assignment_status IN ('auto_assigned', 'manual_review', 'rejected', 'approved')) DEFAULT 'manual_review',
  excluded_reason TEXT, -- Reason for exclusion (insurer domain, spam, etc.)
  
  -- Metadata
  received_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  
  -- Email Headers and Technical Info
  email_headers JSONB, -- Store important email headers
  attachments JSONB, -- Array of attachment info
  thread_id TEXT, -- For email thread tracking
  in_reply_to TEXT, -- Reference to parent email
  
  -- Organization and User Association
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_by_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  reviewed_by_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call Logs Table - Enhanced for Amazon Connect integration
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Amazon Connect Integration
  connect_contact_id TEXT UNIQUE, -- Amazon Connect contact ID
  connect_instance_id TEXT, -- Amazon Connect instance ID
  connect_queue_id TEXT, -- Queue ID if applicable
  
  -- Call Details
  call_direction TEXT CHECK (call_direction IN ('inbound', 'outbound')) NOT NULL,
  caller_phone_number TEXT NOT NULL,
  recipient_phone_number TEXT NOT NULL,
  call_duration_seconds INTEGER DEFAULT 0,
  
  -- CRM Associations
  claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- CRM user who handled call
  
  -- Call Status and Quality
  call_status TEXT CHECK (call_status IN ('initiated', 'connected', 'completed', 'failed', 'abandoned', 'transferred')) DEFAULT 'initiated',
  call_quality_score DECIMAL(3,2), -- 0.00 to 5.00
  call_satisfaction_rating INTEGER CHECK (call_satisfaction_rating BETWEEN 1 AND 5),
  
  -- Recording and Transcription
  recording_url TEXT, -- S3 URL for call recording
  recording_duration_seconds INTEGER,
  transcript_text TEXT,
  transcript_confidence DECIMAL(3,2), -- Transcription confidence score
  transcript_language TEXT DEFAULT 'en-US',
  
  -- AI Analysis and Insights
  ai_summary TEXT, -- AI-generated call summary
  ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'neutral', 'negative')),
  ai_keywords TEXT[], -- Array of extracted keywords
  action_items TEXT[], -- Array of identified action items
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  
  -- Call Context and Notes
  call_purpose TEXT, -- Reason for call
  call_notes TEXT, -- Manual notes added by user
  call_outcome TEXT CHECK (call_outcome IN ('resolved', 'escalated', 'follow_up_needed', 'voicemail', 'no_answer')),
  
  -- Timing
  call_started_at TIMESTAMPTZ NOT NULL,
  call_ended_at TIMESTAMPTZ,
  
  -- Organization
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS Logs Table - For text message tracking
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- SMS Details
  message_direction TEXT CHECK (message_direction IN ('inbound', 'outbound')) NOT NULL,
  sender_phone_number TEXT NOT NULL,
  recipient_phone_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  
  -- Amazon Connect/SNS Integration
  connect_contact_id TEXT, -- If sent through Amazon Connect
  sns_message_id TEXT, -- AWS SNS message ID
  delivery_status TEXT CHECK (delivery_status IN ('sent', 'delivered', 'failed', 'pending')) DEFAULT 'pending',
  delivery_timestamp TIMESTAMPTZ,
  
  -- CRM Associations
  claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- Message Context
  message_type TEXT CHECK (message_type IN ('notification', 'reminder', 'update', 'request', 'marketing', 'emergency')),
  template_id UUID, -- Reference to SMS template if used
  
  -- Timestamps
  sent_at TIMESTAMPTZ NOT NULL,
  
  -- Organization
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication Templates Table - For email and SMS templates
CREATE TABLE communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template Details
  template_name TEXT NOT NULL,
  template_type TEXT CHECK (template_type IN ('email', 'sms', 'call_script')) NOT NULL,
  template_category TEXT, -- 'welcome', 'reminder', 'update', 'escalation', etc.
  
  -- Template Content
  subject_template TEXT, -- For emails
  body_template TEXT NOT NULL,
  variables JSONB, -- Available template variables
  
  -- Usage and Performance
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0, -- Response/engagement rate
  last_used_at TIMESTAMPTZ,
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,
  auto_send BOOLEAN DEFAULT FALSE,
  
  -- Organization and User
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication Preferences Table - User and contact communication preferences
CREATE TABLE communication_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Target (can be contact or user)
  contact_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Preferences
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'mail')) DEFAULT 'email',
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  call_notifications BOOLEAN DEFAULT TRUE,
  marketing_communications BOOLEAN DEFAULT FALSE,
  
  -- Timing Preferences
  best_contact_time_start TIME DEFAULT '09:00:00',
  best_contact_time_end TIME DEFAULT '17:00:00',
  timezone TEXT DEFAULT 'America/Chicago',
  do_not_contact_days INTEGER[] DEFAULT ARRAY[0, 6], -- 0=Sunday, 6=Saturday
  
  -- Communication Limits
  max_emails_per_day INTEGER DEFAULT 5,
  max_sms_per_day INTEGER DEFAULT 3,
  max_calls_per_week INTEGER DEFAULT 10,
  
  -- Organization
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure only one preference record per contact/user per org
  CONSTRAINT unique_contact_preferences UNIQUE (contact_id, organization_id),
  CONSTRAINT unique_user_preferences UNIQUE (user_id, organization_id),
  CONSTRAINT contact_or_user_required CHECK (
    (contact_id IS NOT NULL AND user_id IS NULL) OR 
    (contact_id IS NULL AND user_id IS NOT NULL)
  )
);

-- Amazon Connect Configuration Table - Store Connect settings per organization
CREATE TABLE connect_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- AWS Connect Details
  connect_instance_id TEXT NOT NULL,
  connect_instance_arn TEXT NOT NULL,
  aws_region TEXT NOT NULL DEFAULT 'us-east-1',
  
  -- Phone Number Management
  main_phone_number TEXT, -- Organization's main number
  available_phone_numbers TEXT[], -- Pool of available numbers
  number_assignment_strategy TEXT CHECK (number_assignment_strategy IN ('round_robin', 'user_specific', 'department_based')) DEFAULT 'user_specific',
  
  -- Configuration Settings
  call_recording_enabled BOOLEAN DEFAULT TRUE,
  transcription_enabled BOOLEAN DEFAULT TRUE,
  ai_analysis_enabled BOOLEAN DEFAULT TRUE,
  
  -- Pricing and Billing
  monthly_base_cost DECIMAL(10,2) DEFAULT 0.00,
  per_minute_cost DECIMAL(6,4) DEFAULT 0.018, -- Amazon Connect pricing
  per_sms_cost DECIMAL(6,4) DEFAULT 0.00581, -- SMS pricing
  markup_percentage DECIMAL(5,2) DEFAULT 25.00, -- 25% markup
  
  -- Usage Limits
  monthly_minute_limit INTEGER DEFAULT 10000,
  monthly_sms_limit INTEGER DEFAULT 5000,
  concurrent_call_limit INTEGER DEFAULT 50,
  
  -- Organization
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  configuration_status TEXT CHECK (configuration_status IN ('pending', 'active', 'suspended', 'error')) DEFAULT 'pending',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Phone Assignments Table - Assign phone numbers to users
CREATE TABLE user_phone_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User and Phone Details
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  phone_type TEXT CHECK (phone_type IN ('direct_line', 'shared_line', 'department_line')) DEFAULT 'direct_line',
  
  -- Assignment Details
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Usage Statistics
  total_calls_made INTEGER DEFAULT 0,
  total_calls_received INTEGER DEFAULT 0,
  total_minutes_used DECIMAL(10,2) DEFAULT 0.00,
  total_sms_sent INTEGER DEFAULT 0,
  
  -- Organization
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique phone number per organization
  CONSTRAINT unique_phone_per_org UNIQUE (phone_number, organization_id)
);

-- Create indexes for better performance
CREATE INDEX idx_email_logs_claim_id ON email_logs(claim_id);
CREATE INDEX idx_email_logs_contact_id ON email_logs(contact_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_received_at ON email_logs(received_at);
CREATE INDEX idx_email_logs_organization_id ON email_logs(organization_id);
CREATE INDEX idx_email_logs_sender_email ON email_logs(sender_email);
CREATE INDEX idx_email_logs_extracted_claim_numbers ON email_logs USING GIN(extracted_claim_numbers);

CREATE INDEX idx_call_logs_claim_id ON call_logs(claim_id);
CREATE INDEX idx_call_logs_contact_id ON call_logs(contact_id);
CREATE INDEX idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX idx_call_logs_organization_id ON call_logs(organization_id);
CREATE INDEX idx_call_logs_call_started_at ON call_logs(call_started_at);
CREATE INDEX idx_call_logs_connect_contact_id ON call_logs(connect_contact_id);

CREATE INDEX idx_sms_logs_claim_id ON sms_logs(claim_id);
CREATE INDEX idx_sms_logs_contact_id ON sms_logs(contact_id);
CREATE INDEX idx_sms_logs_organization_id ON sms_logs(organization_id);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at);

CREATE INDEX idx_communication_templates_organization_id ON communication_templates(organization_id);
CREATE INDEX idx_communication_templates_template_type ON communication_templates(template_type);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_logs_updated_at BEFORE UPDATE ON email_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_call_logs_updated_at BEFORE UPDATE ON call_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sms_logs_updated_at BEFORE UPDATE ON sms_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communication_templates_updated_at BEFORE UPDATE ON communication_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communication_preferences_updated_at BEFORE UPDATE ON communication_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connect_configurations_updated_at BEFORE UPDATE ON connect_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_phone_assignments_updated_at BEFORE UPDATE ON user_phone_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_phone_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Email Logs Policies
CREATE POLICY "Users can view their organization's email logs" ON email_logs FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert email logs for their organization" ON email_logs FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update their organization's email logs" ON email_logs FOR UPDATE USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- Call Logs Policies
CREATE POLICY "Users can view their organization's call logs" ON call_logs FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert call logs for their organization" ON call_logs FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update their organization's call logs" ON call_logs FOR UPDATE USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- SMS Logs Policies  
CREATE POLICY "Users can view their organization's sms logs" ON sms_logs FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert sms logs for their organization" ON sms_logs FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- Communication Templates Policies
CREATE POLICY "Users can view their organization's templates" ON communication_templates FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can manage their organization's templates" ON communication_templates FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- Communication Preferences Policies
CREATE POLICY "Users can view their organization's preferences" ON communication_preferences FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can manage their organization's preferences" ON communication_preferences FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- Connect Configurations Policies (Admin only)
CREATE POLICY "Admins can view their organization's connect config" ON connect_configurations FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can manage their organization's connect config" ON connect_configurations FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- User Phone Assignments Policies
CREATE POLICY "Users can view their organization's phone assignments" ON user_phone_assignments FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage phone assignments" ON user_phone_assignments FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON email_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON call_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sms_logs TO authenticated;
GRANT ALL ON communication_templates TO authenticated;
GRANT ALL ON communication_preferences TO authenticated;
GRANT ALL ON connect_configurations TO authenticated;
GRANT ALL ON user_phone_assignments TO authenticated;

-- Comments for documentation
COMMENT ON TABLE email_logs IS 'Stores all email communications with advanced classification and automation features';
COMMENT ON TABLE call_logs IS 'Stores call records from Amazon Connect with AI analysis and transcription';
COMMENT ON TABLE sms_logs IS 'Tracks SMS communications for comprehensive communication history';
COMMENT ON TABLE communication_templates IS 'Reusable templates for emails, SMS, and call scripts';
COMMENT ON TABLE communication_preferences IS 'Contact and user communication preferences and limits';
COMMENT ON TABLE connect_configurations IS 'Amazon Connect instance configuration per organization';
COMMENT ON TABLE user_phone_assignments IS 'Maps phone numbers to users for direct line management';;