-- Migration: add_critical_foreign_key_indexes
-- Created at: 1752589803

-- ========================================
-- CRITICAL FOREIGN KEY INDEXES
-- Adding missing indexes for foreign keys to improve JOIN performance
-- ========================================

-- CLAIM_VENDORS table indexes (high priority - frequently joined)
CREATE INDEX IF NOT EXISTS idx_claim_vendors_assigned_by 
    ON public.claim_vendors(assigned_by);
CREATE INDEX IF NOT EXISTS idx_claim_vendors_organization_id 
    ON public.claim_vendors(organization_id);
CREATE INDEX IF NOT EXISTS idx_claim_vendors_vendor_id 
    ON public.claim_vendors(vendor_id);

-- CLAIMS table indexes (critical for insurance queries)
CREATE INDEX IF NOT EXISTS idx_claims_insurance_carrier_id 
    ON public.claims(insurance_carrier_id);

-- COMMUNICATIONS table indexes (frequently queried)
CREATE INDEX IF NOT EXISTS idx_communications_client_id 
    ON public.communications(client_id);
CREATE INDEX IF NOT EXISTS idx_communications_created_by 
    ON public.communications(created_by);
CREATE INDEX IF NOT EXISTS idx_communications_vendor_id 
    ON public.communications(vendor_id);

-- EVENTS table indexes (calendar functionality)
CREATE INDEX IF NOT EXISTS idx_events_created_by 
    ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_vendor_id 
    ON public.events(vendor_id);

-- PROPERTY_INSPECTIONS table indexes (critical for claims)
CREATE INDEX IF NOT EXISTS idx_property_inspections_claim_id 
    ON public.property_inspections(claim_id);
CREATE INDEX IF NOT EXISTS idx_property_inspections_created_by 
    ON public.property_inspections(created_by);
CREATE INDEX IF NOT EXISTS idx_property_inspections_inspector_id 
    ON public.property_inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_property_inspections_organization_id 
    ON public.property_inspections(organization_id);

-- VENDOR_REVIEWS table indexes (vendor management)
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_claim_id 
    ON public.vendor_reviews(claim_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_organization_id 
    ON public.vendor_reviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_reviewed_by 
    ON public.vendor_reviews(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id 
    ON public.vendor_reviews(vendor_id);

-- USER_ACTIVITY_LOGS table indexes (audit trail)
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_organization_id 
    ON public.user_activity_logs(organization_id);

-- EXPENSES table indexes (financial tracking)
CREATE INDEX IF NOT EXISTS idx_expenses_created_by 
    ON public.expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor_id 
    ON public.expenses(vendor_id);

-- PAYMENTS table indexes (financial operations)
CREATE INDEX IF NOT EXISTS idx_payments_created_by 
    ON public.payments(created_by);
CREATE INDEX IF NOT EXISTS idx_payments_fee_schedule_id 
    ON public.payments(fee_schedule_id);

-- Comment explaining the optimization
COMMENT ON INDEX idx_claim_vendors_assigned_by IS 'Performance: Foreign key index for JOIN optimization';
COMMENT ON INDEX idx_claims_insurance_carrier_id IS 'Performance: Foreign key index for JOIN optimization';
COMMENT ON INDEX idx_communications_client_id IS 'Performance: Foreign key index for JOIN optimization';
COMMENT ON INDEX idx_property_inspections_claim_id IS 'Performance: Foreign key index for JOIN optimization';

-- ========================================
-- CRITICAL FOREIGN KEY INDEXES COMPLETE
-- 
-- Summary: Added 20 most critical missing foreign key indexes
-- These will provide immediate performance improvements for JOINs
-- ========================================;