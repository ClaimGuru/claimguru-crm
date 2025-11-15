-- Migration: Simple Communications System Fix
-- Created: 1763132169 (2025-11-15)
-- Description: Create missing communication tables without complex indexes
-- This is a simplified version that focuses on table creation and basic RLS

-- ============================================================================
-- SECTION 1: CREATE MISSING COMMUNICATION TABLES
-- ============================================================================

-- Create twilio_phone_numbers if not exists
CREATE TABLE IF NOT EXISTS twilio_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  twilio_phone_sid VARCHAR(100) NOT NULL UNIQUE,
  number_type VARCHAR(20) NOT NULL DEFAULT 'dedicated' CHECK (number_type IN ('dedicated', 'forwarded', 'pool')),
  friendly_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  capabilities JSONB DEFAULT '{"voice": true, "sms": true}'::jsonb,
  incoming_call_url TEXT,
  incoming_sms_url TEXT,
  
  -- Usage tracking
  total_calls INTEGER DEFAULT 0,
  total_sms_sent INTEGER DEFAULT 0,
  total_sms_received INTEGER DEFAULT 0,
  
  -- Cost tracking
  monthly_cost_cents INTEGER DEFAULT 200,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Basic indexes only
CREATE INDEX IF NOT EXISTS idx_twilio_numbers_org ON twilio_phone_numbers(organization_id);
CREATE INDEX IF NOT EXISTS idx_twilio_numbers_sid ON twilio_phone_numbers(twilio_phone_sid);
CREATE INDEX IF NOT EXISTS idx_twilio_numbers_active ON twilio_phone_numbers(is_active) WHERE is_active = true;

-- Create claim_email_addresses if not exists
CREATE TABLE IF NOT EXISTS claim_email_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  
  email_address VARCHAR(255) NOT NULL UNIQUE,
  format VARCHAR(50) DEFAULT 'claim-{id}@claimguru.app',
  is_active BOOLEAN DEFAULT true,
  
  -- CC recipients
  cc_recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Linked communications
  total_emails_received INTEGER DEFAULT 0,
  total_emails_sent INTEGER DEFAULT 0,
  last_email_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claim_emails_org ON claim_email_addresses(organization_id);
CREATE INDEX IF NOT EXISTS idx_claim_emails_claim ON claim_email_addresses(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_emails_address ON claim_email_addresses(email_address);
CREATE INDEX IF NOT EXISTS idx_claim_emails_active ON claim_email_addresses(is_active) WHERE is_active = true;

-- Create call_recordings if not exists
CREATE TABLE IF NOT EXISTS call_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id UUID NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  
  recording_sid VARCHAR(100) NOT NULL UNIQUE,
  recording_url TEXT NOT NULL,
  recording_duration_seconds INTEGER,
  
  consent_obtained BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMP WITH TIME ZONE,
  consent_method VARCHAR(50),
  
  transcription_text TEXT,
  transcription_confidence DECIMAL(5,2),
  transcription_status VARCHAR(20) DEFAULT 'pending' CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed')),
  transcribed_at TIMESTAMP WITH TIME ZONE,
  
  storage_provider VARCHAR(50) DEFAULT 'twilio',
  storage_url TEXT,
  file_size_bytes BIGINT,
  
  expires_at TIMESTAMP WITH TIME ZONE,
  
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recordings_comm ON call_recordings(communication_id);
CREATE INDEX IF NOT EXISTS idx_recordings_org ON call_recordings(organization_id);
CREATE INDEX IF NOT EXISTS idx_recordings_sid ON call_recordings(recording_sid);
CREATE INDEX IF NOT EXISTS idx_recordings_expires ON call_recordings(expires_at) WHERE expires_at IS NOT NULL;

-- Create communication_queue if not exists
CREATE TABLE IF NOT EXISTS communication_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  
  communication_type VARCHAR(20) NOT NULL CHECK (communication_type IN ('call', 'sms', 'email', 'voicemail')),
  recipient_phone VARCHAR(20),
  recipient_email VARCHAR(255),
  
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 5, -- 1 = highest, 10 = lowest
  
  scheduled_for TIMESTAMP WITH TIME ZONE,
  attempted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queue_org ON communication_queue(organization_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON communication_queue(status) WHERE status IN ('pending', 'failed');
CREATE INDEX IF NOT EXISTS idx_queue_scheduled ON communication_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_queue_priority ON communication_queue(priority, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_queue_claim ON communication_queue(claim_id) WHERE claim_id IS NOT NULL;

-- ============================================================================
-- SECTION 2: RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE twilio_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_email_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_queue ENABLE ROW LEVEL SECURITY;

-- Twilio phone numbers - Organization isolation
CREATE POLICY "twilio_numbers_org_isolation" ON twilio_phone_numbers
  FOR SELECT USING (
    organization_id = auth.jwt() ->> 'org_id'
  );

CREATE POLICY "twilio_numbers_service_role" ON twilio_phone_numbers
  FOR ALL USING (auth.role() = 'service_role');

-- Claim email addresses - Organization + claim isolation
CREATE POLICY "claim_emails_org_isolation" ON claim_email_addresses
  FOR SELECT USING (
    organization_id = auth.jwt() ->> 'org_id'
  );

CREATE POLICY "claim_emails_service_role" ON claim_email_addresses
  FOR ALL USING (auth.role() = 'service_role');

-- Call recordings - Organization isolation
CREATE POLICY "recordings_org_isolation" ON call_recordings
  FOR SELECT USING (
    organization_id = auth.jwt() ->> 'org_id'
  );

CREATE POLICY "recordings_service_role" ON call_recordings
  FOR ALL USING (auth.role() = 'service_role');

-- Communication queue - Organization isolation
CREATE POLICY "queue_org_isolation" ON communication_queue
  FOR SELECT USING (
    organization_id = auth.jwt() ->> 'org_id'
  );

CREATE POLICY "queue_service_role" ON communication_queue
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- SECTION 3: GRANTS
-- ============================================================================

GRANT SELECT ON twilio_phone_numbers TO authenticated;
GRANT SELECT ON claim_email_addresses TO authenticated;
GRANT SELECT ON call_recordings TO authenticated;
GRANT SELECT ON communication_queue TO authenticated;

-- Service role can do everything
GRANT ALL ON twilio_phone_numbers TO service_role;
GRANT ALL ON claim_email_addresses TO service_role;
GRANT ALL ON call_recordings TO service_role;
GRANT ALL ON communication_queue TO service_role;

-- ============================================================================
-- SECTION 4: SUCCESS
-- ============================================================================

-- All 4 tables created with basic indexes and RLS policies
-- This completes the communication system setup
-- Performance optimization indexes can be added in a separate migration
