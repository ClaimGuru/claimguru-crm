-- Create comprehensive document folder management system
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

-- Document folder permissions (for future use)
CREATE TABLE IF NOT EXISTS document_folder_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID REFERENCES document_folders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_type VARCHAR(20) CHECK (permission_type IN ('read', 'write', 'admin')),
    granted_by UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(folder_id, user_id, permission_type)
);

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

-- Function to get folder hierarchy path
CREATE OR REPLACE FUNCTION get_folder_path(p_folder_id UUID)
RETURNS TEXT AS $$
DECLARE
    folder_path TEXT := '';
    current_folder RECORD;
    path_parts TEXT[] := '{}';
BEGIN
    -- Build path from current folder up to root
    WITH RECURSIVE folder_tree AS (
        SELECT id, name, parent_folder_id, 0 as level
        FROM document_folders 
        WHERE id = p_folder_id
        
        UNION ALL
        
        SELECT df.id, df.name, df.parent_folder_id, ft.level + 1
        FROM document_folders df
        INNER JOIN folder_tree ft ON df.id = ft.parent_folder_id
    )
    SELECT array_agg(name ORDER BY level DESC) INTO path_parts
    FROM folder_tree;
    
    -- Join path parts with '/'
    IF array_length(path_parts, 1) > 0 THEN
        folder_path := array_to_string(path_parts, '/');
    END IF;
    
    RETURN folder_path;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update folder_path when folder is moved
CREATE OR REPLACE FUNCTION update_document_folder_paths()
RETURNS TRIGGER AS $$
BEGIN
    -- Update folder_path for all documents in this folder and subfolders
    UPDATE documents 
    SET folder_path = get_folder_path(folder_id)
    WHERE folder_id IN (
        WITH RECURSIVE subfolder_tree AS (
            SELECT id FROM document_folders WHERE id = NEW.id
            UNION ALL
            SELECT df.id 
            FROM document_folders df
            INNER JOIN subfolder_tree st ON df.parent_folder_id = st.id
        )
        SELECT id FROM subfolder_tree
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_folder_paths
    AFTER UPDATE OF parent_folder_id ON document_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_document_folder_paths();

-- RLS Policies
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_folder_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_move_history ENABLE ROW LEVEL SECURITY;

-- Document folders policies
CREATE POLICY "Users can view folders in their organization" ON document_folders
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_profiles WHERE organization_id = document_folders.organization_id
        )
    );

CREATE POLICY "Users can create folders in their organization" ON document_folders
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM user_profiles WHERE organization_id = document_folders.organization_id
        )
    );

CREATE POLICY "Users can update editable folders in their organization" ON document_folders
    FOR UPDATE USING (
        is_editable = true AND
        auth.uid() IN (
            SELECT user_id FROM user_profiles WHERE organization_id = document_folders.organization_id
        )
    );

CREATE POLICY "Users can delete deletable folders in their organization" ON document_folders
    FOR DELETE USING (
        is_deletable = true AND
        auth.uid() IN (
            SELECT user_id FROM user_profiles WHERE organization_id = document_folders.organization_id
        )
    );

-- Document move history policies
CREATE POLICY "Users can view move history in their organization" ON document_move_history
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_profiles WHERE organization_id = document_move_history.organization_id
        )
    );

CREATE POLICY "Users can create move history in their organization" ON document_move_history
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM user_profiles WHERE organization_id = document_move_history.organization_id
        )
    );

-- Update documents RLS to include folder access
DROP POLICY IF EXISTS "Users can view documents in their organization" ON documents;
CREATE POLICY "Users can view documents in their organization" ON documents
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_profiles WHERE organization_id = documents.organization_id
        )
    );

-- Add helpful comments
COMMENT ON TABLE document_folders IS 'Hierarchical folder structure for organizing claim documents';
COMMENT ON COLUMN document_folders.folder_type IS 'System folders are auto-created, custom folders are user-created';
COMMENT ON COLUMN document_folders.folder_category IS 'Standard categories: insurer, client, intake, vendor, company, custom';
COMMENT ON COLUMN document_folders.is_editable IS 'System folders cannot be renamed';
COMMENT ON COLUMN document_folders.is_deletable IS 'System folders cannot be deleted';
COMMENT ON FUNCTION create_standard_claim_folders IS 'Creates the 5 standard folders when a new claim is created';
