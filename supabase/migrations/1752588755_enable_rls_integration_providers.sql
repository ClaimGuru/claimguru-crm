-- Migration: enable_rls_integration_providers
-- Created at: 1752588755

-- Enable RLS on integration_providers table and create appropriate policies

-- Enable Row Level Security
ALTER TABLE public.integration_providers ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Allow all authenticated users to read integration providers
CREATE POLICY "integration_providers_select_policy" ON public.integration_providers
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy for INSERT: Only allow service_role to insert new providers
CREATE POLICY "integration_providers_insert_policy" ON public.integration_providers
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy for UPDATE: Only allow service_role to update providers
CREATE POLICY "integration_providers_update_policy" ON public.integration_providers
    FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy for DELETE: Only allow service_role to delete providers
CREATE POLICY "integration_providers_delete_policy" ON public.integration_providers
    FOR DELETE
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant necessary permissions to authenticated users for SELECT
GRANT SELECT ON public.integration_providers TO authenticated;

-- Ensure service_role has full access (should already have it, but being explicit)
GRANT ALL ON public.integration_providers TO service_role;;