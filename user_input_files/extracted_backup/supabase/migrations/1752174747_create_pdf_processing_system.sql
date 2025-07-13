-- Migration: create_pdf_processing_system
-- Created at: 1752174747

-- PDF Processing Usage Tracking System for ClaimGuru
-- Tracks document processing costs and usage for billing

-- Processing usage log table
CREATE TABLE IF NOT EXISTS processing_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  document_path TEXT NOT NULL,
  document_name TEXT,
  page_count INTEGER NOT NULL DEFAULT 1,
  processing_type TEXT NOT NULL CHECK (processing_type IN ('client', 'textract_text', 'textract_forms', 'fallback')),
  cost_per_page DECIMAL(10,6) NOT NULL DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  processing_time_ms INTEGER,
  confidence_score DECIMAL(3,2),
  extracted_field_count INTEGER DEFAULT 0,
  processing_method TEXT NOT NULL CHECK (processing_method IN ('client', 'textract', 'fallback')),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_processing_usage_org_date ON processing_usage(organization_id, processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_processing_usage_type ON processing_usage(processing_type);
CREATE INDEX IF NOT EXISTS idx_processing_usage_cost ON processing_usage(total_cost);

-- Monthly processing summary view
CREATE OR REPLACE VIEW monthly_processing_summary AS
SELECT 
  organization_id,
  DATE_TRUNC('month', processed_at) as month,
  COUNT(*) as total_documents,
  SUM(page_count) as total_pages,
  SUM(CASE WHEN processing_method = 'client' THEN 1 ELSE 0 END) as free_processing_count,
  SUM(CASE WHEN processing_method = 'textract' THEN 1 ELSE 0 END) as premium_processing_count,
  SUM(total_cost) as total_cost,
  AVG(confidence_score) as avg_confidence,
  AVG(processing_time_ms) as avg_processing_time
FROM processing_usage
GROUP BY organization_id, DATE_TRUNC('month', processed_at);

-- Organization processing limits table
CREATE TABLE IF NOT EXISTS organization_processing_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  monthly_free_pages INTEGER NOT NULL DEFAULT 100,
  monthly_premium_pages INTEGER NOT NULL DEFAULT 50,
  auto_upgrade_premium BOOLEAN DEFAULT FALSE,
  cost_alert_threshold DECIMAL(10,2) DEFAULT 50.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PDF extraction cache table (to avoid reprocessing same documents)
CREATE TABLE IF NOT EXISTS pdf_extraction_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_hash TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  extracted_text TEXT,
  extracted_data JSONB,
  confidence_score DECIMAL(3,2),
  processing_method TEXT NOT NULL,
  extraction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for file hash lookup
CREATE INDEX IF NOT EXISTS idx_pdf_cache_hash ON pdf_extraction_cache(file_hash);
CREATE INDEX IF NOT EXISTS idx_pdf_cache_access ON pdf_extraction_cache(last_accessed);

-- AI token usage tracking (related to PDF processing)
CREATE TABLE IF NOT EXISTS ai_token_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  operation_type TEXT NOT NULL CHECK (operation_type IN ('document_analysis', 'policy_extraction', 'fraud_detection', 'weather_analysis', 'settlement_prediction', 'claim_review')),
  tokens_consumed INTEGER NOT NULL,
  document_id UUID,
  claim_id UUID,
  operation_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for AI token tracking
CREATE INDEX IF NOT EXISTS idx_ai_tokens_org_date ON ai_token_usage(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tokens_operation ON ai_token_usage(operation_type);

-- Monthly AI token summary view
CREATE OR REPLACE VIEW monthly_ai_token_summary AS
SELECT 
  organization_id,
  DATE_TRUNC('month', created_at) as month,
  operation_type,
  COUNT(*) as operation_count,
  SUM(tokens_consumed) as total_tokens,
  AVG(tokens_consumed) as avg_tokens_per_operation
FROM ai_token_usage
GROUP BY organization_id, DATE_TRUNC('month', created_at), operation_type;

-- RLS Policies
ALTER TABLE processing_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_processing_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_extraction_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_token_usage ENABLE ROW LEVEL SECURITY;

-- RLS for processing_usage
CREATE POLICY "Users can view their organization's processing usage" ON processing_usage
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert processing usage for their organization" ON processing_usage
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- RLS for organization_processing_limits
CREATE POLICY "Users can view their organization's processing limits" ON organization_processing_limits
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage their organization's processing limits" ON organization_processing_limits
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- RLS for pdf_extraction_cache (global cache, read-only for users)
CREATE POLICY "Users can read PDF extraction cache" ON pdf_extraction_cache
  FOR SELECT USING (true);

-- RLS for ai_token_usage
CREATE POLICY "Users can view their organization's AI token usage" ON ai_token_usage
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert AI token usage for their organization" ON ai_token_usage
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Function to check processing limits before expensive operations
CREATE OR REPLACE FUNCTION check_processing_limits(org_id UUID, requested_pages INTEGER, processing_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  monthly_limit INTEGER;
  current_month DATE;
BEGIN
  current_month := DATE_TRUNC('month', NOW());
  
  -- Get current month usage
  SELECT COALESCE(SUM(page_count), 0) INTO current_usage
  FROM processing_usage 
  WHERE organization_id = org_id 
    AND processing_method = CASE WHEN processing_type = 'premium' THEN 'textract' ELSE 'client' END
    AND DATE_TRUNC('month', processed_at) = current_month;
  
  -- Get monthly limit
  SELECT CASE WHEN processing_type = 'premium' THEN monthly_premium_pages ELSE monthly_free_pages END 
  INTO monthly_limit
  FROM organization_processing_limits 
  WHERE organization_id = org_id;
  
  -- If no limits set, use defaults
  IF monthly_limit IS NULL THEN
    monthly_limit := CASE WHEN processing_type = 'premium' THEN 50 ELSE 100 END;
  END IF;
  
  -- Check if request would exceed limit
  RETURN (current_usage + requested_pages) <= monthly_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate file hash for caching
CREATE OR REPLACE FUNCTION calculate_file_hash(file_content BYTEA)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(file_content, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to get processing cost estimate
CREATE OR REPLACE FUNCTION get_processing_cost_estimate(page_count INTEGER, processing_type TEXT)
RETURNS DECIMAL AS $$
BEGIN
  RETURN CASE 
    WHEN processing_type = 'textract_text' THEN page_count * 0.0015
    WHEN processing_type = 'textract_forms' THEN page_count * 0.05
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql;

-- Insert default processing limits for existing organizations
INSERT INTO organization_processing_limits (organization_id, monthly_free_pages, monthly_premium_pages)
SELECT id, 100, 50 
FROM organizations 
WHERE id NOT IN (SELECT organization_id FROM organization_processing_limits)
ON CONFLICT (organization_id) DO NOTHING;

COMMENT ON TABLE processing_usage IS 'Tracks PDF document processing usage for billing and analytics';
COMMENT ON TABLE organization_processing_limits IS 'Defines processing limits and preferences for each organization';
COMMENT ON TABLE pdf_extraction_cache IS 'Caches PDF extraction results to avoid reprocessing identical documents';
COMMENT ON TABLE ai_token_usage IS 'Tracks AI token consumption for billing and usage analytics';;