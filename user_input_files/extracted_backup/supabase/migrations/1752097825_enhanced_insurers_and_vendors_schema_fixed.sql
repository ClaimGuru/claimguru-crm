-- Migration: enhanced_insurers_and_vendors_schema_fixed
-- Created at: 1752097825

-- Create insurers table
CREATE TABLE IF NOT EXISTS insurers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  license_number TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  website TEXT,
  address JSONB,
  regional_offices JSONB,
  coverage_types TEXT[],
  claims_reporting JSONB,
  preferred_communication TEXT DEFAULT 'email',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claim intake progress tracking
CREATE TABLE IF NOT EXISTS claim_intake_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id),
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',
  intake_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id TEXT, -- Store as text to avoid auth.users reference issues
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, error
  entity_type TEXT, -- claim, client, vendor, document, etc.
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhance vendors table with categories and specialties
DO $$ BEGIN
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'contractor';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS specialty TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS insurance_info JSONB DEFAULT '{}';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS service_areas TEXT[] DEFAULT '{}';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS emergency_available BOOLEAN DEFAULT false;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE vendors ADD COLUMN IF NOT EXISTS total_jobs INTEGER DEFAULT 0;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insurers_organization_id ON insurers(organization_id);
CREATE INDEX IF NOT EXISTS idx_insurers_name ON insurers(name);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_claim_intake_claim_id ON claim_intake_progress(claim_id);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_specialty ON vendors(specialty);

-- Enable RLS for new tables
ALTER TABLE insurers ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_intake_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;;