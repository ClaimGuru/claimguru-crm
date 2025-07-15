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
CREATE INDEX idx_wizard_progress_user_org ON wizard_progress(user_id, organization_id);
CREATE INDEX idx_wizard_progress_type ON wizard_progress(wizard_type);
CREATE INDEX idx_wizard_progress_active ON wizard_progress(last_active_at);
CREATE INDEX idx_wizard_progress_expires ON wizard_progress(expires_at);

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
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wizard_progress_updated_at
    BEFORE UPDATE ON wizard_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to cleanup expired wizard progress
CREATE OR REPLACE FUNCTION cleanup_expired_wizard_progress()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Cancel reminder tasks for expired progress
    UPDATE tasks 
    SET status = 'cancelled', updated_at = NOW()
    WHERE id IN (
        SELECT reminder_task_id 
        FROM wizard_progress 
        WHERE expires_at < NOW() 
        AND reminder_task_id IS NOT NULL
    );
    
    -- Delete expired wizard progress
    DELETE FROM wizard_progress 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_expired_wizard_progress() TO authenticated;

-- Create function to get user's incomplete wizards
CREATE OR REPLACE FUNCTION get_incomplete_wizards(target_organization_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    wizard_type TEXT,
    current_step INTEGER,
    total_steps INTEGER,
    progress_percentage INTEGER,
    last_active_at TIMESTAMPTZ,
    wizard_data JSONB,
    step_statuses JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    user_org_id UUID;
BEGIN
    -- Get user's organization ID
    SELECT organization_id INTO user_org_id
    FROM user_profiles
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    -- Use provided organization_id or fall back to user's organization
    IF target_organization_id IS NOT NULL THEN
        user_org_id := target_organization_id;
    END IF;
    
    -- Return incomplete wizards for the organization
    RETURN QUERY
    SELECT 
        wp.id,
        wp.wizard_type,
        wp.current_step,
        wp.total_steps,
        wp.progress_percentage,
        wp.last_active_at,
        wp.wizard_data,
        wp.step_statuses
    FROM wizard_progress wp
    WHERE wp.organization_id = user_org_id
    AND wp.user_id = auth.uid()
    AND wp.progress_percentage < 100
    ORDER BY wp.last_active_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_incomplete_wizards(UUID) TO authenticated;

-- Create function to restore wizard progress
CREATE OR REPLACE FUNCTION restore_wizard_progress(progress_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    progress_data JSONB;
    user_org_id UUID;
BEGIN
    -- Get user's organization ID
    SELECT organization_id INTO user_org_id
    FROM user_profiles
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    -- Get the wizard progress
    SELECT row_to_json(wp)::JSONB INTO progress_data
    FROM wizard_progress wp
    WHERE wp.id = progress_id
    AND wp.organization_id = user_org_id
    AND wp.user_id = auth.uid();
    
    IF progress_data IS NULL THEN
        RAISE EXCEPTION 'Wizard progress not found or access denied';
    END IF;
    
    -- Update last_active_at
    UPDATE wizard_progress
    SET last_active_at = NOW()
    WHERE id = progress_id;
    
    RETURN progress_data;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION restore_wizard_progress(UUID) TO authenticated;

-- Add helpful comments
COMMENT ON TABLE wizard_progress IS 'Stores wizard progress to allow users to resume incomplete wizards';
COMMENT ON COLUMN wizard_progress.wizard_type IS 'Type of wizard: claim, client, or policy';
COMMENT ON COLUMN wizard_progress.current_step IS 'Zero-based index of current step';
COMMENT ON COLUMN wizard_progress.progress_percentage IS 'Completion percentage (0-100)';
COMMENT ON COLUMN wizard_progress.wizard_data IS 'Complete wizard form data as JSON';
COMMENT ON COLUMN wizard_progress.step_statuses IS 'Per-step completion and validation status';
COMMENT ON COLUMN wizard_progress.expires_at IS 'When this progress expires and can be cleaned up';
COMMENT ON COLUMN wizard_progress.reminder_task_id IS 'ID of associated reminder task';

COMMENT ON FUNCTION cleanup_expired_wizard_progress() IS 'Cleans up expired wizard progress and cancels associated tasks';
COMMENT ON FUNCTION get_incomplete_wizards(UUID) IS 'Returns incomplete wizards for the current user';
COMMENT ON FUNCTION restore_wizard_progress(UUID) IS 'Restores wizard progress by ID with access verification';
