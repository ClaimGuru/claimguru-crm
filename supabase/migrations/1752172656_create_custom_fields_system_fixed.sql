-- Migration: create_custom_fields_system_fixed
-- Created at: 1752172656

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

-- Insert default permissions for admin role (FIXED)
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
    o.id as organization_id,
    'admin',
    true,
    true,
    true,
    true,
    true
FROM organizations o
ON CONFLICT (organization_id, user_role) DO NOTHING;;