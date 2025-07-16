-- Migration: create_client_management_system
-- Created at: 1752678902

-- CLIENT MANAGEMENT AND ENHANCED LEAD SYSTEM
-- This migration creates comprehensive client management with subscriber permissions
-- and an enhanced lead management system with document templates

-- First, check if we need to drop existing conflicting tables
-- We'll rename existing simple tables to preserve any data
DO $$
BEGIN
    -- Rename existing lead_sources if it exists and is different from our schema
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lead_sources' AND table_schema = 'public') THEN
        ALTER TABLE lead_sources RENAME TO lead_sources_old_backup;
    END IF;
END $$;

-- 1. USER PERMISSIONS AND ORGANIZATION MANAGEMENT
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    is_subscriber BOOLEAN DEFAULT FALSE,
    can_create_clients BOOLEAN DEFAULT FALSE,
    can_edit_clients BOOLEAN DEFAULT FALSE,
    can_delete_clients BOOLEAN DEFAULT FALSE,
    can_manage_permissions BOOLEAN DEFAULT FALSE,
    granted_by UUID, -- User who granted these permissions
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CLIENT RECORDS TABLE
CREATE TABLE IF NOT EXISTS client_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_number VARCHAR(50) UNIQUE NOT NULL,
    organization_id UUID NOT NULL,
    
    -- Basic Information
    client_type VARCHAR(20) NOT NULL CHECK (client_type IN ('individual', 'business', 'organization')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    business_name VARCHAR(200),
    organization_name VARCHAR(200),
    preferred_name VARCHAR(100),
    title VARCHAR(50),
    suffix VARCHAR(20),
    
    -- Contact Information
    primary_phone VARCHAR(20) NOT NULL,
    secondary_phone VARCHAR(20),
    mobile_phone VARCHAR(20),
    work_phone VARCHAR(20),
    fax_number VARCHAR(20),
    primary_email VARCHAR(255) NOT NULL,
    secondary_email VARCHAR(255),
    work_email VARCHAR(255),
    preferred_contact_method VARCHAR(10) CHECK (preferred_contact_method IN ('phone', 'email', 'text', 'mail')),
    best_time_to_contact TEXT,
    
    -- Address Information (JSONB for flexibility)
    mailing_address JSONB NOT NULL,
    physical_address JSONB,
    
    -- Personal Information
    date_of_birth DATE,
    social_security_number TEXT, -- Encrypted
    drivers_license_number VARCHAR(50),
    drivers_license_state VARCHAR(2),
    marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'separated')),
    occupation VARCHAR(100),
    employer VARCHAR(200),
    
    -- Business Information
    business_type VARCHAR(100),
    tax_id VARCHAR(50), -- EIN for businesses
    business_license VARCHAR(100),
    business_license_state VARCHAR(2),
    dba_name VARCHAR(200),
    business_website VARCHAR(255),
    number_of_employees INTEGER,
    annual_revenue DECIMAL(15,2),
    
    -- Emergency and Legal Contacts (JSONB)
    emergency_contact JSONB,
    power_of_attorney JSONB,
    guardian JSONB,
    
    -- Communication Preferences
    language_preference VARCHAR(50) DEFAULT 'English',
    communication_restrictions TEXT,
    special_instructions TEXT,
    accessibility_needs TEXT,
    
    -- Insurance Information (JSONB array)
    insurance_carriers JSONB DEFAULT '[]'::jsonb,
    
    -- Financial Information (JSONB, encrypted)
    banking_information JSONB,
    
    -- Referral Information (JSONB)
    referral_source JSONB,
    
    -- Legal History (JSONB arrays)
    prior_claims JSONB DEFAULT '[]'::jsonb,
    litigation JSONB DEFAULT '[]'::jsonb,
    
    -- Internal Information
    client_status VARCHAR(20) DEFAULT 'active' CHECK (client_status IN ('active', 'inactive', 'suspended', 'closed')),
    risk_level VARCHAR(10) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    internal_notes TEXT,
    conflict_check BOOLEAN DEFAULT FALSE,
    conflict_check_date DATE,
    conflict_check_by UUID,
    
    -- System Information
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID NOT NULL
);

-- 3. CLIENT PERMISSIONS (who can access which clients)
CREATE TABLE IF NOT EXISTS client_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES client_records(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    can_view BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT FALSE,
    granted_by UUID NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ENHANCED LEAD SOURCES
CREATE TABLE IF NOT EXISTS lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('website', 'referral', 'advertisement', 'social_media', 'email', 'phone', 'walk_in', 'professional', 'other')),
    description TEXT,
    cost_per_lead DECIMAL(10,2),
    conversion_rate DECIMAL(5,4), -- As percentage (0.0000 to 1.0000)
    tracking_code VARCHAR(100),
    external_id VARCHAR(100), -- For integration with external systems
    is_active BOOLEAN DEFAULT TRUE,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SALES FUNNEL STAGES
CREATE TABLE IF NOT EXISTS sales_funnel_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL,
    description TEXT,
    expected_duration_days INTEGER,
    conversion_probability DECIMAL(5,4), -- Probability of moving to next stage
    required_actions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. LEAD ASSIGNMENTS
CREATE TABLE IF NOT EXISTS lead_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    assignment_name VARCHAR(200) NOT NULL,
    assignment_type VARCHAR(50) CHECK (assignment_type IN ('round_robin', 'geography', 'expertise', 'availability', 'manual')),
    assignment_rules JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_number VARCHAR(50) UNIQUE NOT NULL,
    organization_id UUID NOT NULL,
    
    -- Lead Information
    lead_source_id UUID REFERENCES lead_sources(id),
    current_stage_id UUID REFERENCES sales_funnel_stages(id),
    assigned_to UUID,
    lead_quality VARCHAR(20) CHECK (lead_quality IN ('hot', 'warm', 'cold', 'unqualified')),
    lead_score INTEGER DEFAULT 0,
    
    -- Contact Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    business_name VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB,
    
    -- Lead Details
    inquiry_type VARCHAR(100),
    inquiry_description TEXT,
    estimated_value DECIMAL(15,2),
    urgency VARCHAR(20) CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
    follow_up_date DATE,
    
    -- Tracking
    initial_contact_date TIMESTAMP WITH TIME ZONE,
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_action_date TIMESTAMP WITH TIME ZONE,
    conversion_date TIMESTAMP WITH TIME ZONE,
    converted_to_client_id UUID REFERENCES client_records(id),
    
    -- Status
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost', 'nurturing')),
    lost_reason VARCHAR(200),
    notes TEXT,
    
    -- System
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID
);

-- 8. LEAD COMMUNICATIONS
CREATE TABLE IF NOT EXISTS lead_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) CHECK (communication_type IN ('call', 'email', 'meeting', 'text', 'letter', 'other')),
    subject VARCHAR(500),
    content TEXT,
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
    contact_person VARCHAR(200),
    outcome VARCHAR(500),
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. LEAD APPOINTMENTS
CREATE TABLE IF NOT EXISTS lead_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    appointment_type VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(500),
    attendees JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    reminder_sent BOOLEAN DEFAULT FALSE,
    outcome_notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. DOCUMENT TEMPLATE CATEGORIES
CREATE TABLE IF NOT EXISTS document_template_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES document_template_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. DOCUMENT TEMPLATES
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    category_id UUID REFERENCES document_template_categories(id),
    template_name VARCHAR(500) NOT NULL,
    template_description TEXT,
    template_type VARCHAR(100) CHECK (template_type IN ('contract', 'letter', 'form', 'report', 'invoice', 'proposal', 'agreement', 'other')),
    template_content TEXT NOT NULL,
    template_format VARCHAR(50) DEFAULT 'html' CHECK (template_format IN ('html', 'markdown', 'docx', 'pdf')),
    is_system_template BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    version VARCHAR(20) DEFAULT '1.0',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. DOCUMENT TEMPLATE VARIABLES
CREATE TABLE IF NOT EXISTS document_template_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
    variable_name VARCHAR(200) NOT NULL,
    variable_type VARCHAR(50) CHECK (variable_type IN ('text', 'number', 'date', 'boolean', 'client_data', 'claim_data', 'calculated')),
    description TEXT,
    default_value TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    validation_rules JSONB,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. GENERATED DOCUMENTS
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    template_id UUID REFERENCES document_templates(id),
    client_id UUID REFERENCES client_records(id),
    lead_id UUID REFERENCES leads(id),
    document_name VARCHAR(500) NOT NULL,
    generated_content TEXT NOT NULL,
    generated_format VARCHAR(50) DEFAULT 'html',
    variable_values JSONB,
    file_path VARCHAR(1000), -- If saved as file
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'sent', 'signed', 'archived')),
    generated_by UUID,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. DOCUMENT SIGNATURES
CREATE TABLE IF NOT EXISTS document_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES generated_documents(id) ON DELETE CASCADE,
    signer_name VARCHAR(200) NOT NULL,
    signer_email VARCHAR(255),
    signer_role VARCHAR(100),
    signature_type VARCHAR(50) CHECK (signature_type IN ('electronic', 'digital', 'wet_signature')),
    signature_data TEXT, -- Base64 encoded signature or certificate info
    signed_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'declined', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_client_records_organization_id ON client_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_records_client_number ON client_records(client_number);
CREATE INDEX IF NOT EXISTS idx_client_records_primary_email ON client_records(primary_email);
CREATE INDEX IF NOT EXISTS idx_client_records_status ON client_records(client_status);
CREATE INDEX IF NOT EXISTS idx_client_records_created_at ON client_records(created_at);

CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_lead_number ON leads(lead_number);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_source_id ON leads(lead_source_id);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_organization_id ON user_permissions(organization_id);

CREATE INDEX IF NOT EXISTS idx_client_permissions_client_id ON client_permissions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_permissions_user_id ON client_permissions(user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE client_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- CLIENT RECORDS RLS
CREATE POLICY "Users can view clients they have permission for" ON client_records
    FOR SELECT USING (
        -- Subscribers can see all clients in their organization
        EXISTS (
            SELECT 1 FROM user_permissions 
            WHERE user_id = auth.uid() 
            AND organization_id = client_records.organization_id 
            AND is_subscriber = true 
            AND is_active = true
        )
        OR
        -- Users can see clients they have specific permission for
        EXISTS (
            SELECT 1 FROM client_permissions 
            WHERE client_id = client_records.id 
            AND user_id = auth.uid() 
            AND can_view = true
        )
        OR
        -- Users can see clients they created
        created_by = auth.uid()
    );

CREATE POLICY "Users can insert clients if they have permission" ON client_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_permissions 
            WHERE user_id = auth.uid() 
            AND organization_id = client_records.organization_id 
            AND (is_subscriber = true OR can_create_clients = true)
            AND is_active = true
        )
    );

CREATE POLICY "Users can update clients they have permission for" ON client_records
    FOR UPDATE USING (
        -- Subscribers can edit all clients in their organization
        EXISTS (
            SELECT 1 FROM user_permissions 
            WHERE user_id = auth.uid() 
            AND organization_id = client_records.organization_id 
            AND is_subscriber = true 
            AND is_active = true
        )
        OR
        -- Users can edit clients they have specific permission for
        EXISTS (
            SELECT 1 FROM client_permissions 
            WHERE client_id = client_records.id 
            AND user_id = auth.uid() 
            AND can_edit = true
        )
        OR
        -- Users with general edit permission can edit
        EXISTS (
            SELECT 1 FROM user_permissions 
            WHERE user_id = auth.uid() 
            AND organization_id = client_records.organization_id 
            AND can_edit_clients = true 
            AND is_active = true
        )
    );

CREATE POLICY "Only subscribers can delete clients" ON client_records
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_permissions 
            WHERE user_id = auth.uid() 
            AND organization_id = client_records.organization_id 
            AND is_subscriber = true 
            AND is_active = true
        )
    );

-- FUNCTIONS FOR AUTO-GENERATION
CREATE OR REPLACE FUNCTION generate_client_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.client_number IS NULL THEN
        NEW.client_number := 'CL-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('client_number_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS client_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_lead_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lead_number IS NULL THEN
        NEW.lead_number := 'LD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('lead_number_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS lead_number_seq START 1;

-- UPDATE TIMESTAMP FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
DROP TRIGGER IF EXISTS trigger_generate_client_number ON client_records;
CREATE TRIGGER trigger_generate_client_number
    BEFORE INSERT ON client_records
    FOR EACH ROW EXECUTE FUNCTION generate_client_number();

DROP TRIGGER IF EXISTS trigger_generate_lead_number ON leads;
CREATE TRIGGER trigger_generate_lead_number
    BEFORE INSERT ON leads
    FOR EACH ROW EXECUTE FUNCTION generate_lead_number();

-- Update timestamp triggers
DROP TRIGGER IF EXISTS trigger_client_records_updated_at ON client_records;
CREATE TRIGGER trigger_client_records_updated_at
    BEFORE UPDATE ON client_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_user_permissions_updated_at ON user_permissions;
CREATE TRIGGER trigger_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_leads_updated_at ON leads;
CREATE TRIGGER trigger_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INSERT DEFAULT DATA
INSERT INTO sales_funnel_stages (organization_id, stage_name, stage_order, description, expected_duration_days, conversion_probability) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Initial Contact', 1, 'First contact with potential client', 1, 0.8),
    ('00000000-0000-0000-0000-000000000000', 'Qualification', 2, 'Determine if lead meets criteria', 3, 0.6),
    ('00000000-0000-0000-0000-000000000000', 'Consultation', 3, 'Initial consultation meeting', 7, 0.7),
    ('00000000-0000-0000-0000-000000000000', 'Proposal', 4, 'Proposal preparation and presentation', 5, 0.5),
    ('00000000-0000-0000-0000-000000000000', 'Negotiation', 5, 'Contract negotiation', 10, 0.6),
    ('00000000-0000-0000-0000-000000000000', 'Closing', 6, 'Final agreement and client onboarding', 3, 0.9)
ON CONFLICT DO NOTHING;

INSERT INTO lead_sources (organization_id, name, type, description) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Website Contact Form', 'website', 'Leads from main website contact form'),
    ('00000000-0000-0000-0000-000000000000', 'Client Referral', 'referral', 'Referrals from existing clients'),
    ('00000000-0000-0000-0000-000000000000', 'Professional Referral', 'professional', 'Referrals from other professionals'),
    ('00000000-0000-0000-0000-000000000000', 'Google Ads', 'advertisement', 'Google advertising campaigns'),
    ('00000000-0000-0000-0000-000000000000', 'Social Media', 'social_media', 'Facebook, LinkedIn, etc.'),
    ('00000000-0000-0000-0000-000000000000', 'Walk-in', 'walk_in', 'Direct office visits')
ON CONFLICT DO NOTHING;

INSERT INTO document_template_categories (organization_id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Client Onboarding', 'Templates for new client setup'),
    ('00000000-0000-0000-0000-000000000000', 'Contracts & Agreements', 'Legal contracts and service agreements'),
    ('00000000-0000-0000-0000-000000000000', 'Communication', 'Letters and email templates'),
    ('00000000-0000-0000-0000-000000000000', 'Reports', 'Various report templates'),
    ('00000000-0000-0000-0000-000000000000', 'Forms', 'Standard forms and questionnaires')
ON CONFLICT DO NOTHING;;