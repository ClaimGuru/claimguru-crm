-- Migration: create_rls_policies
-- Created at: 1752097862

-- Enable RLS for new tables
ALTER TABLE insurers ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_intake_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for insurers
CREATE POLICY "Users can view organization insurers" ON insurers
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert organization insurers" ON insurers
FOR INSERT WITH CHECK (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update organization insurers" ON insurers
FOR UPDATE USING (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

-- Create RLS policies for claim intake progress
CREATE POLICY "Users can view claim intake progress" ON claim_intake_progress
FOR SELECT USING (claim_id IN (
  SELECT id FROM claims WHERE organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Users can manage claim intake progress" ON claim_intake_progress
FOR ALL USING (claim_id IN (
  SELECT id FROM claims WHERE organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
));

-- Create RLS policies for notifications
CREATE POLICY "Users can view organization notifications" ON notifications
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
) OR user_id = auth.uid()::text);

CREATE POLICY "Users can insert notifications" ON notifications
FOR INSERT WITH CHECK (organization_id IN (
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their notifications" ON notifications
FOR UPDATE USING (user_id = auth.uid()::text);;