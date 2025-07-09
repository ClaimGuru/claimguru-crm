-- Migration: add_financial_management_tables
-- Created at: 1752090984

-- =====================================================
-- FINANCIAL MANAGEMENT TABLES
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fee_schedules_org_claim ON fee_schedules(organization_id, claim_id);
CREATE INDEX IF NOT EXISTS idx_expenses_org_claim ON expenses(organization_id, claim_id);
CREATE INDEX IF NOT EXISTS idx_payments_org_claim ON payments(organization_id, claim_id);

-- Enable RLS
ALTER TABLE fee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Organization isolation" ON fee_schedules FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON expenses FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Organization isolation" ON payments FOR ALL USING (organization_id = auth.uid()::text::uuid OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));;