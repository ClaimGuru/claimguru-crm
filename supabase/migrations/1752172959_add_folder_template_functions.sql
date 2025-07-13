-- Migration: add_folder_template_functions
-- Created at: 1752172959

-- Add missing functions for folder template management

-- Function to create default folder template for new organizations
CREATE OR REPLACE FUNCTION create_default_folder_template(
    p_organization_id UUID,
    p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
    template_id UUID;
    default_structure JSONB;
BEGIN
    -- Default folder structure
    default_structure := '{
        "folders": [
            {
                "name": "{claim_number} - Insurer Docs",
                "category": "insurer",
                "is_system": true,
                "subfolders": []
            },
            {
                "name": "{claim_number} - Client Docs", 
                "category": "client",
                "is_system": true,
                "subfolders": []
            },
            {
                "name": "{claim_number} - Intake Docs",
                "category": "intake", 
                "is_system": true,
                "subfolders": []
            },
            {
                "name": "{claim_number} - Vendor Docs",
                "category": "vendor",
                "is_system": true,
                "subfolders": []
            },
            {
                "name": "{claim_number} - Company Docs",
                "category": "company",
                "is_system": true,
                "subfolders": []
            }
        ]
    }'::jsonb;

    INSERT INTO folder_templates (
        organization_id,
        template_name,
        template_description,
        folder_structure,
        is_default,
        created_by
    ) VALUES (
        p_organization_id,
        'Standard Claim Folders',
        'Default folder structure for all new claims',
        default_structure,
        true,
        p_created_by
    ) RETURNING id INTO template_id;

    RETURN template_id;
END;
$$ LANGUAGE plpgsql;

-- Function to apply folder template when creating a claim
CREATE OR REPLACE FUNCTION apply_folder_template_to_claim(
    p_claim_id UUID,
    p_claim_number VARCHAR(50),
    p_organization_id UUID,
    p_created_by UUID
)
RETURNS VOID AS $$
DECLARE
    template RECORD;
    folder_def JSONB;
    folder_name TEXT;
    new_folder_id UUID;
BEGIN
    -- Get the default template for the organization
    SELECT * INTO template 
    FROM folder_templates 
    WHERE organization_id = p_organization_id 
      AND is_default = true 
      AND is_active = true
    LIMIT 1;

    IF template.id IS NOT NULL THEN
        -- Create folders from template
        FOR folder_def IN SELECT * FROM jsonb_array_elements(template.folder_structure->'folders')
        LOOP
            -- Replace tokens in folder name
            folder_name := replace(folder_def->>'name', '{claim_number}', p_claim_number);
            
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
                folder_name,
                p_claim_id,
                'system',
                folder_def->>'category',
                (folder_def->>'is_system')::boolean = false,
                (folder_def->>'is_system')::boolean = false,
                (folder_def->>'sort_order')::integer,
                p_created_by,
                p_organization_id
            ) RETURNING id INTO new_folder_id;
        END LOOP;
    END IF;
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

-- Create trigger if not exists
DROP TRIGGER IF EXISTS trigger_update_folder_paths ON document_folders;
CREATE TRIGGER trigger_update_folder_paths
    AFTER UPDATE OF parent_folder_id ON document_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_document_folder_paths();;