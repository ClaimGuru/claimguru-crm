-- Migration: create_rls_policies_for_custom_field_tables
-- Created at: 1752588871

-- Create RLS policies for tables that have RLS enabled but no policies

-- 1. CLAIM_CUSTOM_FIELD_VALUES - Organization-scoped with claim access control
-- Users can only access custom field values for claims in their organization

-- SELECT: Users can read custom field values for claims in their organization
CREATE POLICY "claim_custom_field_values_select_policy" ON public.claim_custom_field_values
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.claims c 
            WHERE c.id = claim_custom_field_values.claim_id 
            AND c.organization_id = public.get_user_organization_id()
        )
    );

-- INSERT: Users can create custom field values for claims in their organization  
CREATE POLICY "claim_custom_field_values_insert_policy" ON public.claim_custom_field_values
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.claims c 
            WHERE c.id = claim_custom_field_values.claim_id 
            AND c.organization_id = public.get_user_organization_id()
        )
    );

-- UPDATE: Users can update custom field values for claims in their organization
CREATE POLICY "claim_custom_field_values_update_policy" ON public.claim_custom_field_values
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.claims c 
            WHERE c.id = claim_custom_field_values.claim_id 
            AND c.organization_id = public.get_user_organization_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.claims c 
            WHERE c.id = claim_custom_field_values.claim_id 
            AND c.organization_id = public.get_user_organization_id()
        )
    );

-- DELETE: Users can delete custom field values for claims in their organization
CREATE POLICY "claim_custom_field_values_delete_policy" ON public.claim_custom_field_values
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.claims c 
            WHERE c.id = claim_custom_field_values.claim_id 
            AND c.organization_id = public.get_user_organization_id()
        )
    );

-- 2. CUSTOM_FIELD_PERMISSIONS - Organization-scoped, admin-writable
-- This table controls who can manage custom fields within each organization

-- SELECT: Users can read permissions for their organization
CREATE POLICY "custom_field_permissions_select_policy" ON public.custom_field_permissions
    FOR SELECT
    USING (organization_id = public.get_user_organization_id());

-- INSERT: Only admins can create new permission records
CREATE POLICY "custom_field_permissions_insert_policy" ON public.custom_field_permissions
    FOR INSERT
    WITH CHECK (
        organization_id = public.get_user_organization_id()
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role = 'admin'
            AND up.organization_id = public.get_user_organization_id()
        )
    );

-- UPDATE: Only admins can modify permission records
CREATE POLICY "custom_field_permissions_update_policy" ON public.custom_field_permissions
    FOR UPDATE
    USING (
        organization_id = public.get_user_organization_id()
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role = 'admin'
            AND up.organization_id = public.get_user_organization_id()
        )
    )
    WITH CHECK (
        organization_id = public.get_user_organization_id()
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role = 'admin'
            AND up.organization_id = public.get_user_organization_id()
        )
    );

-- DELETE: Only admins can delete permission records
CREATE POLICY "custom_field_permissions_delete_policy" ON public.custom_field_permissions
    FOR DELETE
    USING (
        organization_id = public.get_user_organization_id()
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role = 'admin'
            AND up.organization_id = public.get_user_organization_id()
        )
    );

-- 3. CUSTOM_FIELD_PLACEMENTS - Organization-scoped, field-permission based
-- Controls where custom fields appear in the UI

-- SELECT: Users can read placements for custom fields in their organization
CREATE POLICY "custom_field_placements_select_policy" ON public.custom_field_placements
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_fields cf 
            WHERE cf.id = custom_field_placements.custom_field_id 
            AND cf.organization_id = public.get_user_organization_id()
        )
    );

-- INSERT: Users with field creation permissions can create placements
CREATE POLICY "custom_field_placements_insert_policy" ON public.custom_field_placements
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.custom_fields cf 
            WHERE cf.id = custom_field_placements.custom_field_id 
            AND cf.organization_id = public.get_user_organization_id()
        )
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.custom_field_permissions cfp ON cfp.organization_id = up.organization_id 
            WHERE up.id = auth.uid() 
            AND up.organization_id = public.get_user_organization_id()
            AND (cfp.user_role = up.role AND cfp.can_create_fields = true)
        )
    );

-- UPDATE: Users with field editing permissions can update placements
CREATE POLICY "custom_field_placements_update_policy" ON public.custom_field_placements
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_fields cf 
            WHERE cf.id = custom_field_placements.custom_field_id 
            AND cf.organization_id = public.get_user_organization_id()
        )
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.custom_field_permissions cfp ON cfp.organization_id = up.organization_id 
            WHERE up.id = auth.uid() 
            AND up.organization_id = public.get_user_organization_id()
            AND (cfp.user_role = up.role AND cfp.can_edit_fields = true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.custom_fields cf 
            WHERE cf.id = custom_field_placements.custom_field_id 
            AND cf.organization_id = public.get_user_organization_id()
        )
    );

-- DELETE: Users with field deletion permissions can delete placements
CREATE POLICY "custom_field_placements_delete_policy" ON public.custom_field_placements
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.custom_fields cf 
            WHERE cf.id = custom_field_placements.custom_field_id 
            AND cf.organization_id = public.get_user_organization_id()
        )
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.custom_field_permissions cfp ON cfp.organization_id = up.organization_id 
            WHERE up.id = auth.uid() 
            AND up.organization_id = public.get_user_organization_id()
            AND (cfp.user_role = up.role AND cfp.can_delete_fields = true)
        )
    );

-- 4. DOCUMENT_TOKENS - Organization-scoped
-- Controls document template tokens for automated document generation

-- SELECT: Users can read document tokens for their organization
CREATE POLICY "document_tokens_select_policy" ON public.document_tokens
    FOR SELECT
    USING (organization_id = public.get_user_organization_id());

-- INSERT: Users with appropriate permissions can create document tokens
CREATE POLICY "document_tokens_insert_policy" ON public.document_tokens
    FOR INSERT
    WITH CHECK (
        organization_id = public.get_user_organization_id()
        AND (
            -- Allow admins to create any tokens
            EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = auth.uid() 
                AND up.role = 'admin'
                AND up.organization_id = public.get_user_organization_id()
            )
            OR
            -- Allow users with template creation permissions
            EXISTS (
                SELECT 1 FROM public.user_profiles up
                JOIN public.custom_field_permissions cfp ON cfp.organization_id = up.organization_id 
                WHERE up.id = auth.uid() 
                AND up.organization_id = public.get_user_organization_id()
                AND (cfp.user_role = up.role AND cfp.can_create_templates = true)
            )
        )
    );

-- UPDATE: Users with appropriate permissions can update document tokens they created or admins can update any
CREATE POLICY "document_tokens_update_policy" ON public.document_tokens
    FOR UPDATE
    USING (
        organization_id = public.get_user_organization_id()
        AND (
            created_by = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = auth.uid() 
                AND up.role = 'admin'
                AND up.organization_id = public.get_user_organization_id()
            )
        )
    )
    WITH CHECK (organization_id = public.get_user_organization_id());

-- DELETE: Users can delete tokens they created or admins can delete any
CREATE POLICY "document_tokens_delete_policy" ON public.document_tokens
    FOR DELETE
    USING (
        organization_id = public.get_user_organization_id()
        AND (
            created_by = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = auth.uid() 
                AND up.role = 'admin'
                AND up.organization_id = public.get_user_organization_id()
            )
        )
    );

-- 5. FOLDER_TEMPLATES - Organization-scoped
-- Controls folder structure templates for organizing documents

-- SELECT: Users can read folder templates for their organization
CREATE POLICY "folder_templates_select_policy" ON public.folder_templates
    FOR SELECT
    USING (organization_id = public.get_user_organization_id());

-- INSERT: Users with template creation permissions can create folder templates
CREATE POLICY "folder_templates_insert_policy" ON public.folder_templates
    FOR INSERT
    WITH CHECK (
        organization_id = public.get_user_organization_id()
        AND (
            -- Allow admins to create any templates
            EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = auth.uid() 
                AND up.role = 'admin'
                AND up.organization_id = public.get_user_organization_id()
            )
            OR
            -- Allow users with template creation permissions
            EXISTS (
                SELECT 1 FROM public.user_profiles up
                JOIN public.custom_field_permissions cfp ON cfp.organization_id = up.organization_id 
                WHERE up.id = auth.uid() 
                AND up.organization_id = public.get_user_organization_id()
                AND (cfp.user_role = up.role AND cfp.can_create_templates = true)
            )
        )
    );

-- UPDATE: Users can update templates they created or admins can update any
CREATE POLICY "folder_templates_update_policy" ON public.folder_templates
    FOR UPDATE
    USING (
        organization_id = public.get_user_organization_id()
        AND (
            created_by = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = auth.uid() 
                AND up.role = 'admin'
                AND up.organization_id = public.get_user_organization_id()
            )
        )
    )
    WITH CHECK (organization_id = public.get_user_organization_id());

-- DELETE: Users can delete templates they created or admins can delete any
CREATE POLICY "folder_templates_delete_policy" ON public.folder_templates
    FOR DELETE
    USING (
        organization_id = public.get_user_organization_id()
        AND (
            created_by = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = auth.uid() 
                AND up.role = 'admin'
                AND up.organization_id = public.get_user_organization_id()
            )
        )
    );

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.claim_custom_field_values TO authenticated;
GRANT SELECT ON public.custom_field_permissions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.custom_field_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_field_placements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.folder_templates TO authenticated;;