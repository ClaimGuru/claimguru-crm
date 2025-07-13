-- Migration: create_document_folders_system_fixed
-- Created at: 1752171776

-- Create comprehensive document folder management system (FIXED)
-- This migration creates tables for organizing documents in claim-specific folders

-- Document folders table
CREATE TABLE IF NOT EXISTS document_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    parent_folder_id UUID REFERENCES document_folders(id) ON DELETE CASCADE,
    folder_type VARCHAR(50) DEFAULT 'custom', -- 'system' for auto-created, 'custom' for user-created
    folder_category VARCHAR(50), -- 'insurer', 'client', 'intake', 'vendor', 'company', 'custom'
    is_editable BOOLEAN DEFAULT true, -- false for system folders
    is_deletable BOOLEAN DEFAULT true, -- false for system folders
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update documents table to include folder assignment
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES document_folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS folder_path TEXT, -- For quick folder hierarchy lookup
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Document move history (audit trail)
CREATE TABLE IF NOT EXISTS document_move_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    from_folder_id UUID REFERENCES document_folders(id) ON DELETE SET NULL,
    to_folder_id UUID REFERENCES document_folders(id) ON DELETE SET NULL,
    moved_by UUID REFERENCES auth.users(id),
    move_reason TEXT,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_folders_claim_id ON document_folders(claim_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_parent_id ON document_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_organization ON document_folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_path ON documents(folder_path);
CREATE INDEX IF NOT EXISTS idx_document_move_history_document ON document_move_history(document_id);

-- Function to create standard claim folders
CREATE OR REPLACE FUNCTION create_standard_claim_folders(
    p_claim_id UUID,
    p_claim_number VARCHAR(50),
    p_organization_id UUID,
    p_created_by UUID
)
RETURNS VOID AS $$
DECLARE
    folder_names TEXT[] := ARRAY[
        'Insurer Docs',
        'Client Docs', 
        'Intake Docs',
        'Vendor Docs',
        'Company Docs'
    ];
    folder_categories TEXT[] := ARRAY[
        'insurer',
        'client',
        'intake', 
        'vendor',
        'company'
    ];
    i INTEGER;
BEGIN
    -- Create the standard folders
    FOR i IN 1..array_length(folder_names, 1) LOOP
        INSERT INTO document_folders (
            name,
            claim_id,
            folder_type,
            folder_category,
            is_editable,
            is_deletable,
            sort_order,
            created_by,
            organization_id
        ) VALUES (
            p_claim_number || ' - ' || folder_names[i],
            p_claim_id,
            'system',
            folder_categories[i],
            false, -- System folders are not editable
            false, -- System folders are not deletable
            i,
            p_created_by,
            p_organization_id
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_move_history ENABLE ROW LEVEL SECURITY;

-- Document folders policies (FIXED to use correct column)
CREATE POLICY "Users can view folders in their organization" ON document_folders
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM user_profiles WHERE organization_id = document_folders.organization_id
        )
    );

CREATE POLICY "Users can create folders in their organization" ON document_folders
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM user_profiles WHERE organization_id = document_folders.organization_id
        )
    );

CREATE POLICY "Users can update editable folders in their organization" ON document_folders
    FOR UPDATE USING (
        is_editable = true AND
        auth.uid() IN (
            SELECT id FROM user_profiles WHERE organization_id = document_folders.organization_id
        )
    );

CREATE POLICY "Users can delete deletable folders in their organization" ON document_folders
    FOR DELETE USING (
        is_deletable = true AND
        auth.uid() IN (
            SELECT id FROM user_profiles WHERE organization_id = document_folders.organization_id
        )
    );

-- Document move history policies
CREATE POLICY "Users can view move history in their organization" ON document_move_history
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM user_profiles WHERE organization_id = document_move_history.organization_id
        )
    );

CREATE POLICY "Users can create move history in their organization" ON document_move_history
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM user_profiles WHERE organization_id = document_move_history.organization_id
        )
    );;