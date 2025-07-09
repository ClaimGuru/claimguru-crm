-- Migration: create_simple_rls_policies
-- Created at: 1752097873

-- Enable RLS for new tables
ALTER TABLE insurers ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_intake_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies for authenticated users
CREATE POLICY "Authenticated users can view insurers" ON insurers
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert insurers" ON insurers
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update insurers" ON insurers
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete insurers" ON insurers
FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for claim intake progress
CREATE POLICY "Authenticated users can view claim intake progress" ON claim_intake_progress
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage claim intake progress" ON claim_intake_progress
FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for notifications
CREATE POLICY "Authenticated users can view notifications" ON notifications
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert notifications" ON notifications
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update notifications" ON notifications
FOR UPDATE USING (auth.role() = 'authenticated');;