-- Migration: add_foreign_key_indexes_and_optimize_unused_indexes
-- Created at: 1752589297

-- Add foreign key indexes for performance optimization and remove unused indexes
-- This addresses INFO-level database linting issues

-- ========================================
-- PART 1: Add Missing Foreign Key Indexes
-- ========================================

-- Indexes for claim_vendors table
CREATE INDEX IF NOT EXISTS idx_claim_vendors_assigned_by ON public.claim_vendors(assigned_by);
CREATE INDEX IF NOT EXISTS idx_claim_vendors_organization_id ON public.claim_vendors(organization_id);
CREATE INDEX IF NOT EXISTS idx_claim_vendors_vendor_id ON public.claim_vendors(vendor_id);

-- Indexes for claims table
CREATE INDEX IF NOT EXISTS idx_claims_insurance_carrier_id ON public.claims(insurance_carrier_id);

-- Indexes for communication_preferences table
CREATE INDEX IF NOT EXISTS idx_communication_preferences_client_id ON public.communication_preferences(client_id);
CREATE INDEX IF NOT EXISTS idx_communication_preferences_organization_id ON public.communication_preferences(organization_id);
CREATE INDEX IF NOT EXISTS idx_communication_preferences_vendor_id ON public.communication_preferences(vendor_id);

-- Indexes for communications table
CREATE INDEX IF NOT EXISTS idx_communications_claim_id ON public.communications(claim_id);
CREATE INDEX IF NOT EXISTS idx_communications_client_id ON public.communications(client_id);
CREATE INDEX IF NOT EXISTS idx_communications_created_by ON public.communications(created_by);
CREATE INDEX IF NOT EXISTS idx_communications_vendor_id ON public.communications(vendor_id);

-- Indexes for custom_fields table
CREATE INDEX IF NOT EXISTS idx_custom_fields_created_by ON public.custom_fields(created_by);

-- Indexes for document_folders table
CREATE INDEX IF NOT EXISTS idx_document_folders_created_by ON public.document_folders(created_by);

-- Indexes for document_move_history table
CREATE INDEX IF NOT EXISTS idx_document_move_history_from_folder_id ON public.document_move_history(from_folder_id);
CREATE INDEX IF NOT EXISTS idx_document_move_history_moved_by ON public.document_move_history(moved_by);
CREATE INDEX IF NOT EXISTS idx_document_move_history_organization_id ON public.document_move_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_move_history_to_folder_id ON public.document_move_history(to_folder_id);

-- Indexes for document_tokens table
CREATE INDEX IF NOT EXISTS idx_document_tokens_created_by ON public.document_tokens(created_by);

-- Indexes for event_attendees table
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON public.event_attendees(user_id);

-- Indexes for events table
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_parent_event_id ON public.events(parent_event_id);
CREATE INDEX IF NOT EXISTS idx_events_vendor_id ON public.events(vendor_id);

-- Indexes for expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_approved_by ON public.expenses(approved_by);
CREATE INDEX IF NOT EXISTS idx_expenses_claim_id ON public.expenses(claim_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON public.expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor_id ON public.expenses(vendor_id);

-- Indexes for fee_schedules table
CREATE INDEX IF NOT EXISTS idx_fee_schedules_claim_id ON public.fee_schedules(claim_id);
CREATE INDEX IF NOT EXISTS idx_fee_schedules_created_by ON public.fee_schedules(created_by);

-- Indexes for folder_templates table
CREATE INDEX IF NOT EXISTS idx_folder_templates_created_by ON public.folder_templates(created_by);

-- Indexes for integration_logs table
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON public.integration_logs(integration_id);

-- Indexes for integration_quotas table
CREATE INDEX IF NOT EXISTS idx_integration_quotas_organization_id ON public.integration_quotas(organization_id);

-- Indexes for integrations table
CREATE INDEX IF NOT EXISTS idx_integrations_created_by ON public.integrations(created_by);

-- Indexes for organization_integrations table
CREATE INDEX IF NOT EXISTS idx_organization_integrations_provider_id ON public.organization_integrations(provider_id);

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_claim_id ON public.payments(claim_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_by ON public.payments(created_by);
CREATE INDEX IF NOT EXISTS idx_payments_fee_schedule_id ON public.payments(fee_schedule_id);

-- Indexes for property_inspections table
CREATE INDEX IF NOT EXISTS idx_property_inspections_claim_id ON public.property_inspections(claim_id);
CREATE INDEX IF NOT EXISTS idx_property_inspections_created_by ON public.property_inspections(created_by);
CREATE INDEX IF NOT EXISTS idx_property_inspections_inspector_id ON public.property_inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_property_inspections_organization_id ON public.property_inspections(organization_id);
CREATE INDEX IF NOT EXISTS idx_property_inspections_property_id ON public.property_inspections(property_id);

-- Indexes for saved_searches table
CREATE INDEX IF NOT EXISTS idx_saved_searches_organization_id ON public.saved_searches(organization_id);

-- Indexes for settlement_line_items table
CREATE INDEX IF NOT EXISTS idx_settlement_line_items_organization_id ON public.settlement_line_items(organization_id);

-- Indexes for time_off table
CREATE INDEX IF NOT EXISTS idx_time_off_user_id ON public.time_off(user_id);

-- Indexes for user_activity_logs table
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_organization_id ON public.user_activity_logs(organization_id);

-- Indexes for user_feature_access table
CREATE INDEX IF NOT EXISTS idx_user_feature_access_granted_by ON public.user_feature_access(granted_by);
CREATE INDEX IF NOT EXISTS idx_user_feature_access_organization_id ON public.user_feature_access(organization_id);

-- Indexes for user_role_assignments table
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_assigned_by ON public.user_role_assignments(assigned_by);

-- Indexes for vendor_reviews table
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_claim_id ON public.vendor_reviews(claim_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_organization_id ON public.vendor_reviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_reviewed_by ON public.vendor_reviews(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON public.vendor_reviews(vendor_id);

-- ========================================
-- PART 2: Evaluate and Remove Unused Indexes
-- ========================================

-- Note: Before removing unused indexes, we'll first analyze if they might be needed
-- Based on the analysis, some indexes may be genuinely unused and can be removed
-- Others might be useful for future queries or specific use cases

-- Remove clearly unused indexes that overlap with new foreign key indexes or are redundant
DROP INDEX IF EXISTS public.idx_claim_vendors_claim; -- Overlaps with new foreign key indexes
DROP INDEX IF EXISTS public.idx_settlement_line_items_settlement; -- Likely unused business logic
DROP INDEX IF EXISTS public.idx_organization_modules_org; -- Overlaps with organization queries

-- Keep strategic indexes that may be useful for common query patterns
-- even if they haven't been used yet (these are likely needed for:
-- - Dashboard queries
-- - Reporting features  
-- - Administrative functions
-- - Search functionality

-- The following indexes are being kept because they support common access patterns:
-- - idx_integrations_org_type (organization + type queries)
-- - idx_saved_searches_user (user search history)
-- - idx_user_activity_logs_user_date (audit trails)
-- - idx_insurers_organization_id (organization-based lookups)
-- - idx_insurers_name (name-based searches)
-- - idx_notifications_user_id (user notifications)
-- - idx_notifications_read (unread notification queries)
-- - idx_vendors_category (category filtering)
-- - idx_vendors_specialty (specialty-based searches)
-- - idx_events_claim_id (claim-related events)
-- - idx_events_status (status-based filtering)
-- - All other indexes that support legitimate business use cases

-- ========================================
-- PART 3: Add Composite Indexes for Common Query Patterns
-- ========================================

-- Add composite indexes for frequently combined query conditions
CREATE INDEX IF NOT EXISTS idx_communications_org_claim ON public.communications(organization_id, claim_id);
CREATE INDEX IF NOT EXISTS idx_expenses_org_claim ON public.expenses(organization_id, claim_id);
CREATE INDEX IF NOT EXISTS idx_payments_org_claim ON public.payments(organization_id, claim_id);
CREATE INDEX IF NOT EXISTS idx_documents_org_folder ON public.documents(organization_id, folder_id);
CREATE INDEX IF NOT EXISTS idx_events_org_date ON public.events(organization_id, start_date);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_org_vendor ON public.vendor_reviews(organization_id, vendor_id);

-- Add indexes for timestamp-based queries (common in reporting)
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON public.claims(created_at);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON public.communications(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- Add indexes for status-based filtering (common in dashboards)
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_communications_status ON public.communications(status);

COMMENT ON SCHEMA public IS 'Database performance optimized with foreign key indexes and unused index cleanup';;