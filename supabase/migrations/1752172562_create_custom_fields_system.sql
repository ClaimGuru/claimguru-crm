-- Migration: create_custom_fields_system
-- Created at: 1752172562

-- Create comprehensive custom fields and organization templates system
-- This enables enterprise-level customization for claims and intake wizard

-- Custom field definitions table
CREATE TABLE IF NOT EXISTS custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN (
        'text_short', 'text_long', 'number', 'decimal', 'date', 'datetime', 'time',
        'email', 'phone', 'url', 'address', 'checkbox', 'radio', 'dropdown', 
        'multi_select', 'slider', 'file_upload', 'signature', 'rating', 'color'
    )),
    field_options JSONB, -- For dropdown, radio, multi_select options
    validation_rules JSONB, -- min/max length, patterns, required, etc.
    conditional_logic JSONB, -- show/hide based on other field values
    default_value TEXT,
    help_text TEXT,
    placeholder_text TEXT,
    is_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, field_name)
);

-- Custom field placements (where fields appear in UI)
CREATE TABLE IF NOT EXISTS custom_field_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_field_id UUID REFERENCES custom_fields(id) ON DELETE CASCADE,
    placement_type VARCHAR(50) NOT NULL CHECK (placement_type IN (
        'claim_view', 'intake_wizard', 'client_profile', 'vendor_profile'
    )),
    section_name VARCHAR(100) NOT NULL, -- e.g., 'basic_info', 'policy_details', 'loss_details'
    position_x INTEGER DEFAULT 0, -- For drag-drop positioning
    position_y INTEGER DEFAULT 0,
    width_span INTEGER DEFAULT 1, -- How many columns field spans
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Store custom field values for claims
CREATE TABLE IF NOT EXISTS claim_custom_field_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    custom_field_id UUID REFERENCES custom_fields(id) ON DELETE CASCADE,
    field_value JSONB, -- Stores any type of value
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(claim_id, custom_field_id)
);

-- Organization-wide folder templates
CREATE TABLE IF NOT EXISTS folder_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    template_description TEXT,
    folder_structure JSONB NOT NULL, -- JSON structure of folders to create
    is_default BOOLEAN DEFAULT false, -- One default template per org
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Document generation tokens for templates
CREATE TABLE IF NOT EXISTS document_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    token_name VARCHAR(100) NOT NULL,
    token_description TEXT,
    token_source VARCHAR(50) NOT NULL CHECK (token_source IN (
        'claim_data', 'client_data', 'policy_data', 'custom_field', 'system_data'
    )),
    source_field VARCHAR(100), -- Which field/table this token maps to
    token_format VARCHAR(50), -- 'text', 'currency', 'date', 'number'
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, token_name)
);

-- Permissions for custom field management
CREATE TABLE IF NOT EXISTS custom_field_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_role VARCHAR(50) NOT NULL, -- From user_profiles.role
    can_create_fields BOOLEAN DEFAULT false,
    can_edit_fields BOOLEAN DEFAULT false,
    can_delete_fields BOOLEAN DEFAULT false,
    can_manage_folders BOOLEAN DEFAULT false,
    can_create_templates BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_role)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_fields_organization ON custom_fields(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_placements_field ON custom_field_placements(custom_field_id);
CREATE INDEX IF NOT EXISTS idx_claim_custom_values_claim ON claim_custom_field_values(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_custom_values_field ON claim_custom_field_values(custom_field_id);
CREATE INDEX IF NOT EXISTS idx_folder_templates_organization ON folder_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_tokens_organization ON document_tokens(organization_id);

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

-- RLS Policies
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_placements ENABLE ROW LEVEL SECURITY;  
ALTER TABLE claim_custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_permissions ENABLE ROW LEVEL SECURITY;

-- Custom fields policies
CREATE POLICY "Users can view custom fields in their organization" ON custom_fields
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM user_profiles WHERE organization_id = custom_fields.organization_id
        )
    );

CREATE POLICY "Authorized users can manage custom fields" ON custom_fields
    FOR ALL USING (
        auth.uid() IN (
            SELECT up.id FROM user_profiles up
            JOIN custom_field_permissions cfp ON cfp.organization_id = up.organization_id
            WHERE up.organization_id = custom_fields.organization_id
              AND (cfp.user_role = up.role OR up.role = 'admin')
              AND cfp.can_create_fields = true
        )
    );

-- Custom field values policies  
CREATE POLICY "Users can view custom field values in their organization" ON claim_custom_field_values
    FOR SELECT USING (
        auth.uid() IN (
            SELECT up.id FROM user_profiles up
            JOIN claims c ON c.organization_id = up.organization_id
            WHERE c.id = claim_custom_field_values.claim_id
        )
    );

CREATE POLICY "Users can manage custom field values in their organization" ON claim_custom_field_values
    FOR ALL USING (
        auth.uid() IN (
            SELECT up.id FROM user_profiles up
            JOIN claims c ON c.organization_id = up.organization_id
            WHERE c.id = claim_custom_field_values.claim_id
        )
    );

-- Folder templates policies
CREATE POLICY "Users can view folder templates in their organization" ON folder_templates
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM user_profiles WHERE organization_id = folder_templates.organization_id
        )
    );

CREATE POLICY "Authorized users can manage folder templates" ON folder_templates
    FOR ALL USING (
        auth.uid() IN (
            SELECT up.id FROM user_profiles up
            JOIN custom_field_permissions cfp ON cfp.organization_id = up.organization_id
            WHERE up.organization_id = folder_templates.organization_id
              AND (cfp.user_role = up.role OR up.role = 'admin')
              AND cfp.can_manage_folders = true
        )
    );

-- Insert default permissions for admin role
INSERT INTO custom_field_permissions (
    organization_id,
    user_role,
    can_create_fields,
    can_edit_fields,
    can_delete_fields,
    can_manage_folders,
    can_create_templates
)
SELECT DISTINCT 
    organization_id,
    'admin',
    true,
    true,
    true,
    true,
    true
FROM organizations
ON CONFLICT (organization_id, user_role) DO NOTHING;;