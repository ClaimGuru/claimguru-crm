-- Create tables for PDF processing, usage tracking, and cache

-- Create the processing usage table to track API calls
CREATE TABLE IF NOT EXISTS "processing_usage" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "document_name" TEXT,
  "page_count" INTEGER NOT NULL DEFAULT 1,
  "cost" DECIMAL(10, 4) NOT NULL DEFAULT 0,
  "processing_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Reference the organizations table if it exists
  CONSTRAINT "organization_id_fk" FOREIGN KEY ("organization_id") 
    REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create a monthly summary view for billing and reporting
CREATE OR REPLACE VIEW "monthly_processing_summary" AS
SELECT 
  organization_id,
  service,
  DATE_TRUNC('month', processing_date) as month,
  COUNT(*) as document_count,
  SUM(page_count) as total_pages,
  SUM(cost) as total_cost
FROM "processing_usage"
GROUP BY organization_id, service, DATE_TRUNC('month', processing_date);

-- Create the organization processing limits table
CREATE TABLE IF NOT EXISTS "organization_processing_limits" (
  "organization_id" TEXT PRIMARY KEY,
  "monthly_page_limit" INTEGER NOT NULL DEFAULT 1000,
  "maximum_cost_limit" DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
  "default_processing_method" TEXT NOT NULL DEFAULT 'auto',
  "enable_textract" BOOLEAN NOT NULL DEFAULT TRUE,
  "enable_vision" BOOLEAN NOT NULL DEFAULT TRUE,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Reference the organizations table if it exists
  CONSTRAINT "org_limits_fk" FOREIGN KEY ("organization_id") 
    REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create the PDF extraction cache table
CREATE TABLE IF NOT EXISTS "pdf_extraction_cache" (
  "file_hash" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "file_name" TEXT,
  "file_size" INTEGER,
  "extracted_text" TEXT,
  "page_count" INTEGER,
  "confidence" DECIMAL(5, 4),
  "processing_method" TEXT,
  "policy_data" JSONB,
  "form_fields" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY ("file_hash", "organization_id"),
  
  -- Reference the organizations table if it exists
  CONSTRAINT "cache_org_fk" FOREIGN KEY ("organization_id") 
    REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create the AI token usage tracking table
CREATE TABLE IF NOT EXISTS "ai_token_usage" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "feature" TEXT NOT NULL,
  "token_count" INTEGER NOT NULL DEFAULT 0,
  "cost" DECIMAL(10, 4) NOT NULL DEFAULT 0,
  "usage_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Reference the organizations table if it exists
  CONSTRAINT "ai_usage_org_fk" FOREIGN KEY ("organization_id") 
    REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create a monthly AI token usage summary view
CREATE OR REPLACE VIEW "monthly_ai_token_summary" AS
SELECT 
  organization_id,
  feature,
  DATE_TRUNC('month', usage_date) as month,
  SUM(token_count) as total_tokens,
  SUM(cost) as total_cost
FROM "ai_token_usage"
GROUP BY organization_id, feature, DATE_TRUNC('month', usage_date);

-- Create RLS policies
ALTER TABLE "processing_usage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_processing_limits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pdf_extraction_cache" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_token_usage" ENABLE ROW LEVEL SECURITY;

-- Processing Usage policies
CREATE POLICY "Processing usage visible to organization members"
  ON "processing_usage"
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE organization_id = processing_usage.organization_id
  ));
  
CREATE POLICY "Processing usage insertable by organization members"
  ON "processing_usage"
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE organization_id = processing_usage.organization_id
  ));

-- Organization Processing Limits policies
CREATE POLICY "Processing limits visible to organization members"
  ON "organization_processing_limits"
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE organization_id = organization_processing_limits.organization_id
  ));
  
CREATE POLICY "Processing limits updateable by organization admins"
  ON "organization_processing_limits"
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM user_profiles 
    WHERE organization_id = organization_processing_limits.organization_id
    AND role = 'admin'
  ));

-- PDF Extraction Cache policies
CREATE POLICY "PDF cache visible to organization members"
  ON "pdf_extraction_cache"
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE organization_id = pdf_extraction_cache.organization_id
  ));
  
CREATE POLICY "PDF cache insertable by organization members"
  ON "pdf_extraction_cache"
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE organization_id = pdf_extraction_cache.organization_id
  ));

-- AI Token Usage policies
CREATE POLICY "AI token usage visible to organization members"
  ON "ai_token_usage"
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE organization_id = ai_token_usage.organization_id
  ));
  
CREATE POLICY "AI token usage insertable by organization members"
  ON "ai_token_usage"
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE organization_id = ai_token_usage.organization_id
  ));