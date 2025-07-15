-- Migration: fix_remaining_rls_performance_warnings
-- Created at: 1752589554

-- Fix remaining RLS performance warnings by optimizing auth function caching
-- Drop existing policies that have performance issues
DROP POLICY IF EXISTS subscription_pricing_policy ON public.subscription_pricing;
DROP POLICY IF EXISTS feature_module_pricing_policy ON public.feature_module_pricing;
DROP POLICY IF EXISTS integration_providers_select_policy ON public.integration_providers;
DROP POLICY IF EXISTS integration_providers_insert_policy ON public.integration_providers;
DROP POLICY IF EXISTS integration_providers_update_policy ON public.integration_providers;
DROP POLICY IF EXISTS integration_providers_delete_policy ON public.integration_providers;

-- Create optimized policies with proper auth function caching

-- 1. subscription_pricing table - Allow read access to all, admin full access
CREATE POLICY subscription_pricing_select_policy ON public.subscription_pricing
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY subscription_pricing_all_policy ON public.subscription_pricing
  FOR ALL
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'service_role');

-- 2. feature_module_pricing table - Allow read access to all, admin full access  
CREATE POLICY feature_module_pricing_select_policy ON public.feature_module_pricing
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY feature_module_pricing_all_policy ON public.feature_module_pricing
  FOR ALL
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'service_role');

-- 3. integration_providers table - Optimized policies with proper caching
CREATE POLICY integration_providers_select_policy ON public.integration_providers
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY integration_providers_insert_policy ON public.integration_providers
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY integration_providers_update_policy ON public.integration_providers
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY integration_providers_delete_policy ON public.integration_providers
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'role') = 'service_role');

-- Add comments for documentation
COMMENT ON POLICY subscription_pricing_select_policy ON public.subscription_pricing IS 'Allow authenticated users to read subscription pricing';
COMMENT ON POLICY subscription_pricing_all_policy ON public.subscription_pricing IS 'Allow service role full access to subscription pricing with optimized auth caching';

COMMENT ON POLICY feature_module_pricing_select_policy ON public.feature_module_pricing IS 'Allow authenticated users to read feature module pricing';
COMMENT ON POLICY feature_module_pricing_all_policy ON public.feature_module_pricing IS 'Allow service role full access to feature module pricing with optimized auth caching';

COMMENT ON POLICY integration_providers_select_policy ON public.integration_providers IS 'Allow authenticated users to read integration providers with optimized auth caching';
COMMENT ON POLICY integration_providers_insert_policy ON public.integration_providers IS 'Allow service role to insert integration providers with optimized auth caching';
COMMENT ON POLICY integration_providers_update_policy ON public.integration_providers IS 'Allow service role to update integration providers with optimized auth caching';
COMMENT ON POLICY integration_providers_delete_policy ON public.integration_providers IS 'Allow service role to delete integration providers with optimized auth caching';;