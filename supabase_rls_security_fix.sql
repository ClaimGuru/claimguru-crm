-- ClaimGuru Database Security Fix: Enable RLS on Public Tables
-- Critical security update to fix RLS disabled issues
-- Date: 2025-07-23

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL AFFECTED TABLES
-- ============================================================================

-- Enable RLS on lead_assignments table
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on lead_sources table  
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;

-- Enable RLS on sales_funnel_stages table
ALTER TABLE public.sales_funnel_stages ENABLE ROW LEVEL SECURITY;

-- Enable RLS on lead_appointments table
ALTER TABLE public.lead_appointments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on document_template_categories table
ALTER TABLE public.document_template_categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on document_template_variables table
ALTER TABLE public.document_template_variables ENABLE ROW LEVEL SECURITY;

-- Enable RLS on document_signatures table
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES FOR ORGANIZATIONAL DATA ISOLATION
-- ============================================================================

-- Lead Assignments Policies
CREATE POLICY "Users can view lead assignments in their organization" ON public.lead_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = lead_assignments.organization_id
        )
    );

CREATE POLICY "Users can insert lead assignments in their organization" ON public.lead_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = lead_assignments.organization_id
        )
    );

CREATE POLICY "Users can update lead assignments in their organization" ON public.lead_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = lead_assignments.organization_id
        )
    );

CREATE POLICY "Users can delete lead assignments in their organization" ON public.lead_assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = lead_assignments.organization_id
        )
    );

-- Lead Sources Policies
CREATE POLICY "Users can view lead sources in their organization" ON public.lead_sources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = lead_sources.organization_id
        )
    );

CREATE POLICY "Users can insert lead sources in their organization" ON public.lead_sources
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = lead_sources.organization_id
        )
    );

CREATE POLICY "Users can update lead sources in their organization" ON public.lead_sources
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = lead_sources.organization_id
        )
    );

CREATE POLICY "Users can delete lead sources in their organization" ON public.lead_sources
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = lead_sources.organization_id
        )
    );

-- Sales Funnel Stages Policies
CREATE POLICY "Users can view sales funnel stages in their organization" ON public.sales_funnel_stages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = sales_funnel_stages.organization_id
        )
    );

CREATE POLICY "Users can insert sales funnel stages in their organization" ON public.sales_funnel_stages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = sales_funnel_stages.organization_id
        )
    );

CREATE POLICY "Users can update sales funnel stages in their organization" ON public.sales_funnel_stages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = sales_funnel_stages.organization_id
        )
    );

CREATE POLICY "Users can delete sales funnel stages in their organization" ON public.sales_funnel_stages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = sales_funnel_stages.organization_id
        )
    );

-- Lead Appointments Policies
CREATE POLICY "Users can view lead appointments in their organization" ON public.lead_appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = lead_appointments.organization_id
        )
    );

CREATE POLICY "Users can insert lead appointments in their organization" ON public.lead_appointments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = lead_appointments.organization_id
        )
    );

CREATE POLICY "Users can update lead appointments in their organization" ON public.lead_appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = lead_appointments.organization_id
        )
    );

CREATE POLICY "Users can delete lead appointments in their organization" ON public.lead_appointments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = lead_appointments.organization_id
        )
    );

-- Document Template Categories Policies
CREATE POLICY "Users can view document template categories in their organization" ON public.document_template_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = document_template_categories.organization_id
        )
    );

CREATE POLICY "Users can insert document template categories in their organization" ON public.document_template_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = document_template_categories.organization_id
        )
    );

CREATE POLICY "Users can update document template categories in their organization" ON public.document_template_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = document_template_categories.organization_id
        )
    );

CREATE POLICY "Users can delete document template categories in their organization" ON public.document_template_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = document_template_categories.organization_id
        )
    );

-- Document Template Variables Policies
CREATE POLICY "Users can view document template variables in their organization" ON public.document_template_variables
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = document_template_variables.organization_id
        )
    );

CREATE POLICY "Users can insert document template variables in their organization" ON public.document_template_variables
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = document_template_variables.organization_id
        )
    );

CREATE POLICY "Users can update document template variables in their organization" ON public.document_template_variables
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = document_template_variables.organization_id
        )
    );

CREATE POLICY "Users can delete document template variables in their organization" ON public.document_template_variables
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = document_template_variables.organization_id
        )
    );

-- Document Signatures Policies
CREATE POLICY "Users can view document signatures in their organization" ON public.document_signatures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = document_signatures.organization_id
        )
    );

CREATE POLICY "Users can insert document signatures in their organization" ON public.document_signatures
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = document_signatures.organization_id
        )
    );

CREATE POLICY "Users can update document signatures in their organization" ON public.document_signatures
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = document_signatures.organization_id
        )
    );

CREATE POLICY "Users can delete document signatures in their organization" ON public.document_signatures
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.organization_id = document_signatures.organization_id
        )
    );

-- ============================================================================
-- VERIFY RLS IS ENABLED
-- ============================================================================

-- Query to verify RLS is now enabled on all tables
DO $$
BEGIN
    -- Check if RLS is enabled on all target tables
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname IN (
            'lead_assignments', 'lead_sources', 'sales_funnel_stages', 
            'lead_appointments', 'document_template_categories', 
            'document_template_variables', 'document_signatures'
        ) 
        AND relrowsecurity = false
    ) THEN
        RAISE NOTICE 'SUCCESS: RLS is now enabled on all target tables';
    ELSE
        RAISE EXCEPTION 'ERROR: Some tables still have RLS disabled';
    END IF;
END $$;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Users can view lead assignments in their organization" ON public.lead_assignments 
IS 'Allows users to view lead assignments only within their organization';

COMMENT ON POLICY "Users can view lead sources in their organization" ON public.lead_sources 
IS 'Allows users to view lead sources only within their organization';

COMMENT ON POLICY "Users can view sales funnel stages in their organization" ON public.sales_funnel_stages 
IS 'Allows users to view sales funnel stages only within their organization';

COMMENT ON POLICY "Users can view lead appointments in their organization" ON public.lead_appointments 
IS 'Allows users to view lead appointments only within their organization';

COMMENT ON POLICY "Users can view document template categories in their organization" ON public.document_template_categories 
IS 'Allows users to view document template categories only within their organization';

COMMENT ON POLICY "Users can view document template variables in their organization" ON public.document_template_variables 
IS 'Allows users to view document template variables only within their organization';

COMMENT ON POLICY "Users can view document signatures in their organization" ON public.document_signatures 
IS 'Allows users to view document signatures only within their organization';

-- ============================================================================
-- SECURITY AUDIT LOG
-- ============================================================================

-- Log this security fix
INSERT INTO public.system_audit_log (
    event_type,
    description,
    details,
    severity,
    created_at
) VALUES (
    'SECURITY_FIX',
    'Enabled RLS on public tables to fix security vulnerabilities',
    jsonb_build_object(
        'tables_affected', ARRAY[
            'lead_assignments', 'lead_sources', 'sales_funnel_stages',
            'lead_appointments', 'document_template_categories', 
            'document_template_variables', 'document_signatures'
        ],
        'policies_created', 28,
        'security_level', 'CRITICAL',
        'fix_date', NOW()
    ),
    'HIGH',
    NOW()
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- FINAL STATUS
-- ============================================================================

SELECT 
    'RLS Security Fix Completed Successfully' as status,
    NOW() as completed_at,
    '7 tables secured, 28 policies created' as summary;
