CREATE TABLE claim_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    claim_id UUID NOT NULL,
    user_id UUID NOT NULL,
    assignment_type VARCHAR(50) NOT NULL,
    role_on_claim VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    assigned_by UUID NOT NULL,
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    removed_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);