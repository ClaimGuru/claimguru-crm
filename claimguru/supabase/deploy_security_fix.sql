-- ClaimGuru Security Fix Deployment Script
-- Execute this script in Supabase SQL Editor to fix all RLS security issues

-- ============================================================================
-- STEP 1: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_funnel_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_template_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: CREATE ORGANIZATION-BASED POLICIES
-- ============================================================================

-- Lead Assignments
CREATE POLICY "org_isolation_lead_assignments_select" ON public.lead_assignments FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = lead_assignments.organization_id));
CREATE POLICY "org_isolation_lead_assignments_insert" ON public.lead_assignments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = lead_assignments.organization_id));
CREATE POLICY "org_isolation_lead_assignments_update" ON public.lead_assignments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = lead_assignments.organization_id));
CREATE POLICY "org_isolation_lead_assignments_delete" ON public.lead_assignments FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = lead_assignments.organization_id));

-- Lead Sources
CREATE POLICY "org_isolation_lead_sources_select" ON public.lead_sources FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = lead_sources.organization_id));
CREATE POLICY "org_isolation_lead_sources_insert" ON public.lead_sources FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = lead_sources.organization_id));
CREATE POLICY "org_isolation_lead_sources_update" ON public.lead_sources FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = lead_sources.organization_id));
CREATE POLICY "org_isolation_lead_sources_delete" ON public.lead_sources FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = lead_sources.organization_id));

-- Sales Funnel Stages
CREATE POLICY "org_isolation_sales_funnel_stages_select" ON public.sales_funnel_stages FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = sales_funnel_stages.organization_id));
CREATE POLICY "org_isolation_sales_funnel_stages_insert" ON public.sales_funnel_stages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = sales_funnel_stages.organization_id));
CREATE POLICY "org_isolation_sales_funnel_stages_update" ON public.sales_funnel_stages FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = sales_funnel_stages.organization_id));
CREATE POLICY "org_isolation_sales_funnel_stages_delete" ON public.sales_funnel_stages FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = sales_funnel_stages.organization_id));

-- Lead Appointments
CREATE POLICY "org_isolation_lead_appointments_select" ON public.lead_appointments FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = lead_appointments.organization_id));
CREATE POLICY "org_isolation_lead_appointments_insert" ON public.lead_appointments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = lead_appointments.organization_id));
CREATE POLICY "org_isolation_lead_appointments_update" ON public.lead_appointments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = lead_appointments.organization_id));
CREATE POLICY "org_isolation_lead_appointments_delete" ON public.lead_appointments FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = lead_appointments.organization_id));

-- Document Template Categories
CREATE POLICY "org_isolation_document_template_categories_select" ON public.document_template_categories FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = document_template_categories.organization_id));
CREATE POLICY "org_isolation_document_template_categories_insert" ON public.document_template_categories FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = document_template_categories.organization_id));
CREATE POLICY "org_isolation_document_template_categories_update" ON public.document_template_categories FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = document_template_categories.organization_id));
CREATE POLICY "org_isolation_document_template_categories_delete" ON public.document_template_categories FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = document_template_categories.organization_id));

-- Document Template Variables
CREATE POLICY "org_isolation_document_template_variables_select" ON public.document_template_variables FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = document_template_variables.organization_id));
CREATE POLICY "org_isolation_document_template_variables_insert" ON public.document_template_variables FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = document_template_variables.organization_id));
CREATE POLICY "org_isolation_document_template_variables_update" ON public.document_template_variables FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = document_template_variables.organization_id));
CREATE POLICY "org_isolation_document_template_variables_delete" ON public.document_template_variables FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = document_template_variables.organization_id));

-- Document Signatures
CREATE POLICY "org_isolation_document_signatures_select" ON public.document_signatures FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = document_signatures.organization_id));
CREATE POLICY "org_isolation_document_signatures_insert" ON public.document_signatures FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = document_signatures.organization_id));
CREATE POLICY "org_isolation_document_signatures_update" ON public.document_signatures FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = document_signatures.organization_id));
CREATE POLICY "org_isolation_document_signatures_delete" ON public.document_signatures FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.organization_id = document_signatures.organization_id));

-- ============================================================================
-- STEP 3: VERIFICATION
-- ============================================================================

SELECT 'Security Fix Applied Successfully - All 7 tables now have RLS enabled with 28 policies created' as status;
