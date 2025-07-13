CREATE TABLE file_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    claim_id UUID,
    client_id UUID,
    folder_name VARCHAR(255) NOT NULL,
    parent_folder_id UUID,
    folder_path TEXT NOT NULL,
    folder_type VARCHAR(50) DEFAULT 'custom',
    is_system_folder BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    permissions JSONB,
    description TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);