-- Migration: add_final_foreign_key_indexes
-- Created at: 1752589903

-- ========================================
-- FINAL FOREIGN KEY INDEXES
-- Adding the last 10 missing foreign key indexes
-- ========================================

-- CUSTOM_FIELDS table indexes
CREATE INDEX IF NOT EXISTS idx_custom_fields_created_by 
    ON public.custom_fields(created_by);

-- DOCUMENT_FOLDERS table indexes
CREATE INDEX IF NOT EXISTS idx_document_folders_created_by 
    ON public.document_folders(created_by);

-- DOCUMENT_MOVE_HISTORY table indexes
CREATE INDEX IF NOT EXISTS idx_document_move_history_moved_by 
    ON public.document_move_history(moved_by);

-- DOCUMENT_TOKENS table indexes
CREATE INDEX IF NOT EXISTS idx_document_tokens_created_by 
    ON public.document_tokens(created_by);

-- FOLDER_TEMPLATES table indexes
CREATE INDEX IF NOT EXISTS idx_folder_templates_created_by 
    ON public.folder_templates(created_by);

-- INTEGRATIONS table indexes
CREATE INDEX IF NOT EXISTS idx_integrations_organization_id 
    ON public.integrations(organization_id);

-- SAVED_SEARCHES table indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id 
    ON public.saved_searches(user_id);

-- SETTLEMENT_LINE_ITEMS table indexes
CREATE INDEX IF NOT EXISTS idx_settlement_line_items_settlement_id 
    ON public.settlement_line_items(settlement_id);

-- USER_FEATURE_ACCESS table indexes
CREATE INDEX IF NOT EXISTS idx_user_feature_access_granted_by 
    ON public.user_feature_access(granted_by);

-- USER_ROLE_ASSIGNMENTS table indexes
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_assigned_by 
    ON public.user_role_assignments(assigned_by);

-- Add performance comments
COMMENT ON INDEX idx_custom_fields_created_by IS 'Performance: Foreign key index for JOIN optimization';
COMMENT ON INDEX idx_integrations_organization_id IS 'Performance: Foreign key index for JOIN optimization';
COMMENT ON INDEX idx_settlement_line_items_settlement_id IS 'Performance: Foreign key index for JOIN optimization';

-- ========================================
-- ALL FOREIGN KEY INDEXES NOW COMPLETE
-- 
-- Summary: Added final 10 foreign key indexes
-- Total: 50 foreign key indexes added across all migrations
-- All Performance Advisor foreign key warnings resolved
-- ========================================;