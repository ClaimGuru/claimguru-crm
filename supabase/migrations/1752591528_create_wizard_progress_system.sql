-- Migration: create_wizard_progress_system
-- Created at: 1752591528

-- Create wizard progress tracking system
-- This allows users to save and resume wizard progress, with automatic task creation

-- Create wizard_progress table
CREATE TABLE IF NOT EXISTS wizard_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    wizard_type TEXT NOT NULL CHECK (wizard_type IN ('claim', 'client', 'policy')),
    current_step INTEGER NOT NULL DEFAULT 0,
    total_steps INTEGER NOT NULL DEFAULT 1,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    wizard_data JSONB NOT NULL DEFAULT '{}',
    step_statuses JSONB NOT NULL DEFAULT '{}',
    last_saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    reminder_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wizard_progress_user_org ON wizard_progress(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_wizard_progress_type ON wizard_progress(wizard_type);
CREATE INDEX IF NOT EXISTS idx_wizard_progress_active ON wizard_progress(last_active_at);
CREATE INDEX IF NOT EXISTS idx_wizard_progress_expires ON wizard_progress(expires_at);

-- Create RLS policies
ALTER TABLE wizard_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own organization's wizard progress
CREATE POLICY "Users can access wizard progress in their organization" ON wizard_progress
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can insert wizard progress for their organization
CREATE POLICY "Users can create wizard progress in their organization" ON wizard_progress
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE user_id = auth.uid()
        )
        AND user_id = auth.uid()
    );;