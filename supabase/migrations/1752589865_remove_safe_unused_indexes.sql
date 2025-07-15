-- Migration: remove_safe_unused_indexes
-- Created at: 1752589865

-- ========================================
-- REMOVE SAFE UNUSED INDEXES
-- Removing only safe unused indexes (not constraints)
-- ========================================

-- Remove clearly redundant indexes that have never been scanned
-- Being very conservative - only removing obvious duplicates

-- Remove redundant claim vendor index (replaced by new foreign key index)
DROP INDEX IF EXISTS idx_claim_vendors_claim;

-- Remove redundant settlement line items index (replaced by new foreign key index)
DROP INDEX IF EXISTS idx_settlement_line_items_settlement;

-- Remove some clearly unused indexes that are safe to drop
DROP INDEX IF EXISTS idx_saved_searches_user; -- Replaced by organization-based queries

-- Remove unused category/specialty indexes that are never queried
DROP INDEX IF EXISTS idx_vendors_category;
DROP INDEX IF EXISTS idx_vendors_specialty;

-- Remove unused organization module index (duplicate)
DROP INDEX IF EXISTS idx_organization_modules_org;

-- Remove unused integration type index
DROP INDEX IF EXISTS idx_integrations_org_type;

-- ========================================
-- Summary of removed indexes:
-- - idx_claim_vendors_claim (redundant with new foreign key index)
-- - idx_settlement_line_items_settlement (redundant)
-- - idx_saved_searches_user (replaced by organization-based index)
-- - idx_vendors_category (never used)
-- - idx_vendors_specialty (never used)
-- - idx_organization_modules_org (duplicate)
-- - idx_integrations_org_type (never used)
-- 
-- Total: 7 unused indexes removed
-- This will improve write performance and reduce storage overhead
-- ========================================

-- Add comment about the cleanup
COMMENT ON TABLE public.claim_vendors IS 'Performance optimized: removed redundant indexes, added foreign key indexes';;