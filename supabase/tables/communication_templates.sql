CREATE TABLE communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    template_type VARCHAR(100) NOT NULL,
    template_category VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    subject_line VARCHAR(255),
    body_template TEXT NOT NULL,
    placeholders TEXT[],
    is_system_template BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);