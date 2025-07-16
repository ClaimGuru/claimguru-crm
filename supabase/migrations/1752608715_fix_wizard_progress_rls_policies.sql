-- Migration: fix_wizard_progress_rls_policies
-- Created at: 1752608715

-- Fix wizard_progress RLS policies to resolve 406 errors and performance issues
-- This addresses the auth_rls_initplan and multiple_permissive_policies warnings

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can access wizard progress in their organization" ON wizard_progress;
DROP POLICY IF EXISTS "Users can create wizard progress in their organization" ON wizard_progress;

-- Create optimized RLS policies with proper auth function usage
-- Using (SELECT auth.uid()) instead of auth.uid() to avoid per-row re-evaluation

-- Single comprehensive policy for all operations (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "wizard_progress_organization_access" ON wizard_progress
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE user_id = (SELECT auth.uid())
        )
        AND user_id = (SELECT auth.uid())
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE user_id = (SELECT auth.uid())
        )
        AND user_id = (SELECT auth.uid())
    );

-- Enable access for anonymous users to create wizard progress during onboarding
CREATE POLICY "wizard_progress_anon_insert" ON wizard_progress
    FOR INSERT TO anon
    WITH CHECK (
        user_id IS NULL OR user_id = (SELECT auth.uid())
    );

-- Create index to support the RLS policy efficiently
CREATE INDEX IF NOT EXISTS idx_wizard_progress_rls_lookup 
ON wizard_progress(organization_id, user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON wizard_progress TO authenticated;
GRANT INSERT ON wizard_progress TO anon;;