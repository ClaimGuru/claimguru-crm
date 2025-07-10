-- Migration: add_notification_user_id
-- Created at: 1752097844

-- Add user_id column to notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_insurers_organization_id ON insurers(organization_id);
CREATE INDEX IF NOT EXISTS idx_insurers_name ON insurers(name);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_claim_intake_claim_id ON claim_intake_progress(claim_id);;