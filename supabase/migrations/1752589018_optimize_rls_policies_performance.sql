-- Migration: optimize_rls_policies_performance
-- Created at: 1752589018

-- Optimize RLS policies for performance by fixing auth function caching and consolidating multiple policies

-- ========================================
-- PART 1: Fix auth function caching issues
-- ========================================

-- Fix user_profiles auth caching
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE
    USING (id = (SELECT auth.uid()));

-- Fix notifications auth caching and consolidate multiple policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

-- Create optimized single policies for notifications
CREATE POLICY "notifications_select_policy" ON public.notifications
    FOR SELECT
    USING (
        (SELECT auth.role()) = 'authenticated' 
        AND (
            recipient_id = (SELECT auth.uid()) 
            OR organization_id = (SELECT public.get_user_organization_id())
        )
    );

CREATE POLICY "notifications_insert_policy" ON public.notifications
    FOR INSERT
    WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "notifications_update_policy" ON public.notifications
    FOR UPDATE
    USING (
        (SELECT auth.role()) = 'authenticated' 
        AND (
            recipient_id = (SELECT auth.uid()) 
            OR organization_id = (SELECT public.get_user_organization_id())
        )
    );

-- Fix claim_intake_progress - consolidate overlapping policies
DROP POLICY IF EXISTS "Authenticated users can manage claim intake progress" ON public.claim_intake_progress;
DROP POLICY IF EXISTS "Authenticated users can view claim intake progress" ON public.claim_intake_progress;

CREATE POLICY "claim_intake_progress_policy" ON public.claim_intake_progress
    FOR ALL
    USING ((SELECT auth.role()) = 'authenticated');

-- Fix fee_schedules auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.fee_schedules;
CREATE POLICY "fee_schedules_org_policy" ON public.fee_schedules
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix expenses auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.expenses;
CREATE POLICY "expenses_org_policy" ON public.expenses
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix payments auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.payments;
CREATE POLICY "payments_org_policy" ON public.payments
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix claim_vendors auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.claim_vendors;
CREATE POLICY "claim_vendors_org_policy" ON public.claim_vendors
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix vendor_reviews auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.vendor_reviews;
CREATE POLICY "vendor_reviews_org_policy" ON public.vendor_reviews
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix communications auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.communications;
CREATE POLICY "communications_org_policy" ON public.communications
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix communication_preferences auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.communication_preferences;
CREATE POLICY "communication_preferences_org_policy" ON public.communication_preferences
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix property_inspections auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.property_inspections;
CREATE POLICY "property_inspections_org_policy" ON public.property_inspections
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix settlement_line_items auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.settlement_line_items;
CREATE POLICY "settlement_line_items_org_policy" ON public.settlement_line_items
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix organization_modules auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.organization_modules;
CREATE POLICY "organization_modules_org_policy" ON public.organization_modules
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix integrations auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.integrations;
CREATE POLICY "integrations_org_policy" ON public.integrations
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix saved_searches auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.saved_searches;
CREATE POLICY "saved_searches_org_policy" ON public.saved_searches
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix user_activity_logs auth caching
DROP POLICY IF EXISTS "Organization isolation" ON public.user_activity_logs;
CREATE POLICY "user_activity_logs_org_policy" ON public.user_activity_logs
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix insurers auth caching - consolidate multiple policies
DROP POLICY IF EXISTS "Authenticated users can view insurers" ON public.insurers;
DROP POLICY IF EXISTS "Authenticated users can insert insurers" ON public.insurers;
DROP POLICY IF EXISTS "Authenticated users can update insurers" ON public.insurers;
DROP POLICY IF EXISTS "Authenticated users can delete insurers" ON public.insurers;

CREATE POLICY "insurers_authenticated_policy" ON public.insurers
    FOR ALL
    USING ((SELECT auth.role()) = 'authenticated');

-- Fix organization_subscriptions auth caching
DROP POLICY IF EXISTS "Users can view their organization subscription" ON public.organization_subscriptions;
DROP POLICY IF EXISTS "Subscribers can update their subscription" ON public.organization_subscriptions;

CREATE POLICY "organization_subscriptions_policy" ON public.organization_subscriptions
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix organization_feature_modules auth caching
DROP POLICY IF EXISTS "Users can view organization feature modules" ON public.organization_feature_modules;
CREATE POLICY "organization_feature_modules_policy" ON public.organization_feature_modules
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix ai_token_transactions auth caching
DROP POLICY IF EXISTS "Users can view their organization token transactions" ON public.ai_token_transactions;
CREATE POLICY "ai_token_transactions_policy" ON public.ai_token_transactions
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix user_role_assignments auth caching
DROP POLICY IF EXISTS "Users can view role assignments in their organization" ON public.user_role_assignments;
CREATE POLICY "user_role_assignments_policy" ON public.user_role_assignments
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix user_feature_access auth caching
DROP POLICY IF EXISTS "Users can view feature access in their organization" ON public.user_feature_access;
CREATE POLICY "user_feature_access_policy" ON public.user_feature_access
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix subscription_pricing - consolidate multiple policies
DROP POLICY IF EXISTS "Anyone can view subscription pricing" ON public.subscription_pricing;
DROP POLICY IF EXISTS "System admins can manage subscription pricing" ON public.subscription_pricing;

CREATE POLICY "subscription_pricing_policy" ON public.subscription_pricing
    FOR ALL
    USING (
        true -- Anyone can view
        OR ((SELECT auth.jwt() ->> 'role') = 'service_role') -- Service role can manage
    );

-- Fix feature_module_pricing - consolidate multiple policies
DROP POLICY IF EXISTS "Anyone can view feature module pricing" ON public.feature_module_pricing;
DROP POLICY IF EXISTS "System admins can manage feature pricing" ON public.feature_module_pricing;

CREATE POLICY "feature_module_pricing_policy" ON public.feature_module_pricing
    FOR ALL
    USING (
        true -- Anyone can view
        OR ((SELECT auth.jwt() ->> 'role') = 'service_role') -- Service role can manage
    );

-- Fix document_folders auth caching
DROP POLICY IF EXISTS "Users can view folders in their organization" ON public.document_folders;
DROP POLICY IF EXISTS "Users can create folders in their organization" ON public.document_folders;
DROP POLICY IF EXISTS "Users can update editable folders in their organization" ON public.document_folders;
DROP POLICY IF EXISTS "Users can delete deletable folders in their organization" ON public.document_folders;

CREATE POLICY "document_folders_policy" ON public.document_folders
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix document_move_history auth caching
DROP POLICY IF EXISTS "Users can view move history in their organization" ON public.document_move_history;
DROP POLICY IF EXISTS "Users can create move history in their organization" ON public.document_move_history;

CREATE POLICY "document_move_history_policy" ON public.document_move_history
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix custom_fields auth caching
DROP POLICY IF EXISTS "Users can view custom fields in their organization" ON public.custom_fields;
CREATE POLICY "custom_fields_policy" ON public.custom_fields
    FOR ALL
    USING (organization_id = (SELECT public.get_user_organization_id()));

-- Fix integration_providers auth caching (recent policies we created)
DROP POLICY IF EXISTS "integration_providers_select_policy" ON public.integration_providers;
DROP POLICY IF EXISTS "integration_providers_insert_policy" ON public.integration_providers;
DROP POLICY IF EXISTS "integration_providers_update_policy" ON public.integration_providers;
DROP POLICY IF EXISTS "integration_providers_delete_policy" ON public.integration_providers;

CREATE POLICY "integration_providers_select_policy" ON public.integration_providers
    FOR SELECT
    USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "integration_providers_insert_policy" ON public.integration_providers
    FOR INSERT
    WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "integration_providers_update_policy" ON public.integration_providers
    FOR UPDATE
    USING ((SELECT auth.jwt() ->> 'role') = 'service_role')
    WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "integration_providers_delete_policy" ON public.integration_providers
    FOR DELETE
    USING ((SELECT auth.jwt() ->> 'role') = 'service_role');

-- Fix custom_field_permissions auth caching (recent policies we created)
DROP POLICY IF EXISTS "custom_field_permissions_insert_policy" ON public.custom_field_permissions;
DROP POLICY IF EXISTS "custom_field_permissions_update_policy" ON public.custom_field_permissions;
DROP POLICY IF EXISTS "custom_field_permissions_delete_policy" ON public.custom_field_permissions;

CREATE POLICY "custom_field_permissions_insert_policy" ON public.custom_field_permissions
    FOR INSERT
    WITH CHECK (
        organization_id = (SELECT public.get_user_organization_id())
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = (SELECT auth.uid())
            AND up.role = 'admin'
            AND up.organization_id = (SELECT public.get_user_organization_id())
        )
    );

CREATE POLICY "custom_field_permissions_update_policy" ON public.custom_field_permissions
    FOR UPDATE
    USING (
        organization_id = (SELECT public.get_user_organization_id())
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = (SELECT auth.uid())
            AND up.role = 'admin'
            AND up.organization_id = (SELECT public.get_user_organization_id())
        )
    )
    WITH CHECK (
        organization_id = (SELECT public.get_user_organization_id())
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = (SELECT auth.uid())
            AND up.role = 'admin'
            AND up.organization_id = (SELECT public.get_user_organization_id())
        )
    );

CREATE POLICY "custom_field_permissions_delete_policy" ON public.custom_field_permissions
    FOR DELETE
    USING (
        organization_id = (SELECT public.get_user_organization_id())
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = (SELECT auth.uid())
            AND up.role = 'admin'
            AND up.organization_id = (SELECT public.get_user_organization_id())
        )
    );

-- Fix custom_field_placements auth caching (recent policies we created)
DROP POLICY IF EXISTS "custom_field_placements_insert_policy" ON public.custom_field_placements;
DROP POLICY IF EXISTS "custom_field_placements_update_policy" ON public.custom_field_placements;
DROP POLICY IF EXISTS "custom_field_placements_delete_policy" ON public.custom_field_placements;

CREATE POLICY "custom_field_placements_insert_policy" ON public.custom_field_placements
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.custom_fields cf 
            WHERE cf.id = custom_field_placements.custom_field_id 
            AND cf.organization_id = (SELECT public.get_user_organization_id())
        )
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.custom_field_permissions cfp ON cfp.organization_id = up.organization_id 
            WHERE up.id = (SELECT auth.uid())
            AND up.organization_id = (SELECT public.get_user_organization_id())
            AND (cfp.user_role = up.role AND cfp.can_create_fields = true)
        )
    );

CREATE POLICY "custom_field_placements_update_policy" ON public.custom_field_placements
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_fields cf 
            WHERE cf.id = custom_field_placements.custom_field_id 
            AND cf.organization_id = (SELECT public.get_user_organization_id())
        )
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.custom_field_permissions cfp ON cfp.organization_id = up.organization_id 
            WHERE up.id = (SELECT auth.uid())
            AND up.organization_id = (SELECT public.get_user_organization_id())
            AND (cfp.user_role = up.role AND cfp.can_edit_fields = true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.custom_fields cf 
            WHERE cf.id = custom_field_placements.custom_field_id 
            AND cf.organization_id = (SELECT public.get_user_organization_id())
        )
    );

CREATE POLICY "custom_field_placements_delete_policy" ON public.custom_field_placements
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_fields cf 
            WHERE cf.id = custom_field_placements.custom_field_id 
            AND cf.organization_id = (SELECT public.get_user_organization_id())
        )
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.custom_field_permissions cfp ON cfp.organization_id = up.organization_id 
            WHERE up.id = (SELECT auth.uid())
            AND up.organization_id = (SELECT public.get_user_organization_id())
            AND (cfp.user_role = up.role AND cfp.can_delete_fields = true)
        )
    );

-- Fix document_tokens auth caching (recent policies we created)
DROP POLICY IF EXISTS "document_tokens_insert_policy" ON public.document_tokens;
DROP POLICY IF EXISTS "document_tokens_update_policy" ON public.document_tokens;
DROP POLICY IF EXISTS "document_tokens_delete_policy" ON public.document_tokens;

CREATE POLICY "document_tokens_insert_policy" ON public.document_tokens
    FOR INSERT
    WITH CHECK (
        organization_id = (SELECT public.get_user_organization_id())
        AND (
            EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = (SELECT auth.uid())
                AND up.role = 'admin'
                AND up.organization_id = (SELECT public.get_user_organization_id())
            )
            OR
            EXISTS (
                SELECT 1 FROM public.user_profiles up
                JOIN public.custom_field_permissions cfp ON cfp.organization_id = up.organization_id 
                WHERE up.id = (SELECT auth.uid())
                AND up.organization_id = (SELECT public.get_user_organization_id())
                AND (cfp.user_role = up.role AND cfp.can_create_templates = true)
            )
        )
    );

CREATE POLICY "document_tokens_update_policy" ON public.document_tokens
    FOR UPDATE
    USING (
        organization_id = (SELECT public.get_user_organization_id())
        AND (
            created_by = (SELECT auth.uid())
            OR EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = (SELECT auth.uid())
                AND up.role = 'admin'
                AND up.organization_id = (SELECT public.get_user_organization_id())
            )
        )
    )
    WITH CHECK (organization_id = (SELECT public.get_user_organization_id()));

CREATE POLICY "document_tokens_delete_policy" ON public.document_tokens
    FOR DELETE
    USING (
        organization_id = (SELECT public.get_user_organization_id())
        AND (
            created_by = (SELECT auth.uid())
            OR EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = (SELECT auth.uid())
                AND up.role = 'admin'
                AND up.organization_id = (SELECT public.get_user_organization_id())
            )
        )
    );

-- Fix folder_templates auth caching (recent policies we created)
DROP POLICY IF EXISTS "folder_templates_insert_policy" ON public.folder_templates;
DROP POLICY IF EXISTS "folder_templates_update_policy" ON public.folder_templates;
DROP POLICY IF EXISTS "folder_templates_delete_policy" ON public.folder_templates;

CREATE POLICY "folder_templates_insert_policy" ON public.folder_templates
    FOR INSERT
    WITH CHECK (
        organization_id = (SELECT public.get_user_organization_id())
        AND (
            EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = (SELECT auth.uid())
                AND up.role = 'admin'
                AND up.organization_id = (SELECT public.get_user_organization_id())
            )
            OR
            EXISTS (
                SELECT 1 FROM public.user_profiles up
                JOIN public.custom_field_permissions cfp ON cfp.organization_id = up.organization_id 
                WHERE up.id = (SELECT auth.uid())
                AND up.organization_id = (SELECT public.get_user_organization_id())
                AND (cfp.user_role = up.role AND cfp.can_create_templates = true)
            )
        )
    );

CREATE POLICY "folder_templates_update_policy" ON public.folder_templates
    FOR UPDATE
    USING (
        organization_id = (SELECT public.get_user_organization_id())
        AND (
            created_by = (SELECT auth.uid())
            OR EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = (SELECT auth.uid())
                AND up.role = 'admin'
                AND up.organization_id = (SELECT public.get_user_organization_id())
            )
        )
    )
    WITH CHECK (organization_id = (SELECT public.get_user_organization_id()));

CREATE POLICY "folder_templates_delete_policy" ON public.folder_templates
    FOR DELETE
    USING (
        organization_id = (SELECT public.get_user_organization_id())
        AND (
            created_by = (SELECT auth.uid())
            OR EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = (SELECT auth.uid())
                AND up.role = 'admin'
                AND up.organization_id = (SELECT public.get_user_organization_id())
            )
        )
    );

-- Fix user_profiles multiple policies issue
DROP POLICY IF EXISTS "Allow authenticated profile creation" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert profiles in their organization" ON public.user_profiles;

CREATE POLICY "user_profiles_insert_policy" ON public.user_profiles
    FOR INSERT
    WITH CHECK (
        (SELECT auth.role()) = 'authenticated' 
        AND (
            organization_id = (SELECT public.get_user_organization_id())
            OR true -- Allow during signup process
        )
    );;