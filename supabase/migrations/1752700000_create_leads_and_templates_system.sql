-- Lead Management & Document Template System
-- Migration: 1752700000_create_leads_and_templates_system.sql

-- =====================================================
-- LEADS MANAGEMENT SYSTEM
-- =====================================================

-- Lead Sources (extensible for non-walk-in sources)
CREATE TABLE lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Referral", "Online Form", "Phone Call", "Social Media", "Advertising Campaign"
    code VARCHAR(50) NOT NULL, -- e.g., "REFERRAL", "ONLINE_FORM", "PHONE", "SOCIAL", "AD_CAMPAIGN"
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    tracking_fields JSONB DEFAULT '{}', -- Custom tracking fields per source type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Funnel Stages (configurable per organization)
CREATE TABLE sales_funnel_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL, -- LEAD, QUALIFIED, CONTACTED, APPOINTMENT_NEEDED, APPOINTMENT_SET, APPOINTMENT_COMPLETED, CREATE_SEND_CONTRACT, CONTRACT_SENT, CONTRACT_RECEIVED, CLOSED_CONVERTED, CLOSED_LOST
    display_order INTEGER NOT NULL,
    stage_type VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'closed_won', 'closed_lost'
    description TEXT,
    required_fields JSONB DEFAULT '[]', -- Fields required to advance to this stage
    automation_triggers JSONB DEFAULT '{}', -- Automation rules for this stage
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Assignments & Fee Splitting
CREATE TABLE lead_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL, -- Will reference leads.id
    assigned_to UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    assignment_type VARCHAR(50) NOT NULL DEFAULT 'primary', -- 'primary', 'secondary', 'referral'
    fee_split_percentage DECIMAL(5,2), -- For fee splitting scenarios
    fee_split_type VARCHAR(50), -- 'percentage', 'flat_fee', 'tiered'
    fee_split_amount DECIMAL(12,2), -- Flat fee amount if applicable
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_number VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated lead number
    
    -- Lead Source & Origin
    source_id UUID NOT NULL REFERENCES lead_sources(id),
    source_details JSONB DEFAULT '{}', -- Additional source-specific data
    referral_source VARCHAR(255), -- If referral, who referred
    campaign_id VARCHAR(100), -- Marketing campaign identifier
    
    -- Contact Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    secondary_phone VARCHAR(50),
    mailing_address JSONB, -- Full address object
    
    -- Lead Details
    current_stage_id UUID NOT NULL REFERENCES sales_funnel_stages(id),
    lead_value DECIMAL(12,2), -- Estimated value/property damage amount
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    
    -- Qualification Criteria
    property_damage_amount DECIMAL(12,2),
    insurance_coverage_available BOOLEAN,
    insurance_carrier VARCHAR(100),
    policy_number VARCHAR(100),
    location_address JSONB,
    claim_type VARCHAR(100), -- 'property', 'auto', 'workers_comp', etc.
    claim_validity VARCHAR(50) DEFAULT 'pending', -- 'valid', 'invalid', 'pending', 'needs_review'
    manual_acceptance_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    manual_acceptance_by UUID REFERENCES user_profiles(id),
    manual_acceptance_at TIMESTAMP WITH TIME ZONE,
    manual_acceptance_notes TEXT,
    
    -- Assignment & Ownership
    primary_assignee UUID REFERENCES user_profiles(id),
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    
    -- Lead Tracking
    stage_history JSONB DEFAULT '[]', -- Track stage progression
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    estimated_close_date DATE,
    
    -- Conversion Tracking
    converted_to_client_id UUID REFERENCES clients(id),
    converted_to_claim_id UUID REFERENCES claims(id),
    conversion_date TIMESTAMP WITH TIME ZONE,
    lost_reason VARCHAR(255),
    lost_notes TEXT,
    
    -- Additional Data
    tags VARCHAR(255)[], -- Searchable tags
    custom_fields JSONB DEFAULT '{}', -- Custom field values
    notes TEXT,
    
    -- System Fields
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Communications Log
CREATE TABLE lead_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'phone_call', 'meeting', 'note'
    direction VARCHAR(20) NOT NULL DEFAULT 'outbound', -- 'inbound', 'outbound'
    subject VARCHAR(255),
    content TEXT,
    
    -- Contact Details
    from_email VARCHAR(255),
    to_email VARCHAR(255),
    from_phone VARCHAR(50),
    to_phone VARCHAR(50),
    
    -- Communication Metadata
    status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed', 'scheduled'
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- User & System
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    template_id UUID, -- Reference to communication template used
    automation_trigger VARCHAR(100), -- If sent via automation
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Appointments
CREATE TABLE lead_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Appointment Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    appointment_type VARCHAR(50) DEFAULT 'meeting', -- 'meeting', 'site_visit', 'phone_call', 'video_call'
    
    -- Scheduling
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Location
    location_type VARCHAR(50) DEFAULT 'in_person', -- 'in_person', 'virtual', 'phone'
    location_address JSONB,
    virtual_meeting_url VARCHAR(500),
    virtual_meeting_details JSONB,
    
    -- Participants
    scheduled_by UUID NOT NULL REFERENCES user_profiles(id),
    assigned_to UUID NOT NULL REFERENCES user_profiles(id),
    attendees JSONB DEFAULT '[]', -- Array of participant details
    
    -- Status & Results
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
    completion_status VARCHAR(50), -- 'successful', 'unsuccessful', 'rescheduled'
    completion_notes TEXT,
    outcome VARCHAR(100), -- 'advance_to_contract', 'needs_follow_up', 'not_qualified', etc.
    
    -- Reminders
    reminder_settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DOCUMENT TEMPLATE SYSTEM
-- =====================================================

-- Document Template Categories
CREATE TABLE document_template_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Templates
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES document_template_categories(id),
    
    -- Template Identity
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_code VARCHAR(100) UNIQUE, -- Unique identifier for API access
    version VARCHAR(20) DEFAULT '1.0',
    
    -- Template Content
    content_html TEXT, -- HTML content with token placeholders
    content_json JSONB, -- Structured content for advanced editor
    template_variables JSONB DEFAULT '{}', -- Available variables/tokens definition
    
    -- Conditional Logic
    conditional_rules JSONB DEFAULT '{}', -- IF/THEN/ELSE logic rules
    calculation_formulas JSONB DEFAULT '{}', -- Mathematical calculations
    validation_rules JSONB DEFAULT '{}', -- Field validation rules
    
    -- Output Configuration
    output_format VARCHAR(50) DEFAULT 'pdf', -- 'pdf', 'docx', 'html'
    page_settings JSONB DEFAULT '{}', -- Page size, margins, orientation
    styling_settings JSONB DEFAULT '{}', -- Fonts, colors, spacing
    
    -- Workflow Integration
    workflow_stage VARCHAR(100), -- When this template should be used
    auto_generation_triggers JSONB DEFAULT '{}', -- Automatic generation rules
    approval_required BOOLEAN DEFAULT false,
    approval_workflow JSONB DEFAULT '{}',
    
    -- Permissions & Access Control
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    is_public BOOLEAN DEFAULT false, -- Organization-wide visibility
    allowed_users UUID[] DEFAULT '{}', -- Specific user permissions
    allowed_roles VARCHAR(50)[] DEFAULT '{}', -- Role-based permissions
    can_edit_users UUID[] DEFAULT '{}', -- Users who can edit
    can_delete_users UUID[] DEFAULT '{}', -- Users who can delete (subscriber only by default)
    
    -- Status & Metadata
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Version Control
    parent_template_id UUID REFERENCES document_templates(id), -- For versioning
    change_log JSONB DEFAULT '[]', -- Track changes
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Template Variables/Tokens Registry
CREATE TABLE document_template_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Variable Identity
    variable_name VARCHAR(100) NOT NULL, -- e.g., "client_name", "policy_number"
    display_name VARCHAR(255) NOT NULL, -- Human-readable name
    category VARCHAR(100), -- Group related variables
    
    -- Variable Configuration
    data_type VARCHAR(50) NOT NULL DEFAULT 'text', -- 'text', 'number', 'date', 'boolean', 'currency', 'address'
    data_source VARCHAR(100), -- 'client', 'claim', 'lead', 'policy', 'custom'
    data_path VARCHAR(255), -- JSON path to data (e.g., 'client.contact_info.email')
    
    -- Formatting Options
    format_settings JSONB DEFAULT '{}', -- Date formats, number formats, etc.
    default_value TEXT,
    validation_pattern VARCHAR(255), -- Regex pattern for validation
    is_required BOOLEAN DEFAULT false,
    
    -- Usage & Metadata
    description TEXT,
    example_value TEXT,
    is_system_variable BOOLEAN DEFAULT false, -- System vs. custom variables
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(organization_id, variable_name)
);

-- Generated Documents Log
CREATE TABLE generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES document_templates(id),
    
    -- Source Record
    source_type VARCHAR(50) NOT NULL, -- 'lead', 'client', 'claim'
    source_id UUID NOT NULL, -- ID of the source record
    
    -- Document Details
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500), -- Storage path
    file_size BIGINT,
    output_format VARCHAR(50),
    
    -- Generation Context
    generated_by UUID NOT NULL REFERENCES user_profiles(id),
    generation_trigger VARCHAR(100), -- 'manual', 'workflow', 'automation'
    variable_values JSONB DEFAULT '{}', -- Values used for generation
    
    -- Status & Workflow
    status VARCHAR(50) DEFAULT 'generated', -- 'generated', 'sent', 'signed', 'archived'
    sent_to VARCHAR(255)[], -- Email addresses sent to
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Version & Audit
    version_number INTEGER DEFAULT 1,
    is_final BOOLEAN DEFAULT false,
    revision_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Signatures & Approvals
CREATE TABLE document_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    generated_document_id UUID NOT NULL REFERENCES generated_documents(id) ON DELETE CASCADE,
    
    -- Signer Information
    signer_name VARCHAR(255) NOT NULL,
    signer_email VARCHAR(255) NOT NULL,
    signer_role VARCHAR(100), -- 'client', 'adjuster', 'vendor', 'internal'
    
    -- Signature Details
    signature_type VARCHAR(50) DEFAULT 'electronic', -- 'electronic', 'digital', 'wet'
    signature_data TEXT, -- Base64 signature image or digital signature
    signature_method VARCHAR(100), -- 'typed', 'drawn', 'uploaded', 'docusign', etc.
    
    -- Status & Timing
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'signed', 'declined', 'expired'
    sent_at TIMESTAMP WITH TIME ZONE,
    signed_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    
    -- Verification
    verification_code VARCHAR(100),
    verification_method VARCHAR(50), -- 'email', 'sms', 'none'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Lead Management Indexes
CREATE INDEX idx_leads_organization_id ON leads(organization_id);
CREATE INDEX idx_leads_current_stage_id ON leads(current_stage_id);
CREATE INDEX idx_leads_primary_assignee ON leads(primary_assignee);
CREATE INDEX idx_leads_source_id ON leads(source_id);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_manual_acceptance_status ON leads(manual_acceptance_status);
CREATE INDEX idx_leads_claim_validity ON leads(claim_validity);

-- Lead Communications Indexes
CREATE INDEX idx_lead_communications_lead_id ON lead_communications(lead_id);
CREATE INDEX idx_lead_communications_type ON lead_communications(communication_type);
CREATE INDEX idx_lead_communications_created_at ON lead_communications(created_at);

-- Lead Appointments Indexes
CREATE INDEX idx_lead_appointments_lead_id ON lead_appointments(lead_id);
CREATE INDEX idx_lead_appointments_assigned_to ON lead_appointments(assigned_to);
CREATE INDEX idx_lead_appointments_start_time ON lead_appointments(start_time);
CREATE INDEX idx_lead_appointments_status ON lead_appointments(status);

-- Document Template Indexes
CREATE INDEX idx_document_templates_organization_id ON document_templates(organization_id);
CREATE INDEX idx_document_templates_category_id ON document_templates(category_id);
CREATE INDEX idx_document_templates_is_active ON document_templates(is_active);
CREATE INDEX idx_document_templates_created_by ON document_templates(created_by);

-- Generated Documents Indexes
CREATE INDEX idx_generated_documents_template_id ON generated_documents(template_id);
CREATE INDEX idx_generated_documents_source_type_id ON generated_documents(source_type, source_id);
CREATE INDEX idx_generated_documents_generated_by ON generated_documents(generated_by);
CREATE INDEX idx_generated_documents_created_at ON generated_documents(created_at);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_funnel_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_template_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;

-- Lead Sources RLS
CREATE POLICY "Users can access lead sources from their organization" ON lead_sources
    FOR ALL USING (organization_id = auth_organization_id());

-- Sales Funnel Stages RLS
CREATE POLICY "Users can access funnel stages from their organization" ON sales_funnel_stages
    FOR ALL USING (organization_id = auth_organization_id());

-- Lead Assignments RLS
CREATE POLICY "Users can access lead assignments from their organization" ON lead_assignments
    FOR ALL USING (organization_id = auth_organization_id());

-- Leads RLS
CREATE POLICY "Users can access leads from their organization" ON leads
    FOR ALL USING (organization_id = auth_organization_id());

-- Lead Communications RLS
CREATE POLICY "Users can access lead communications from their organization" ON lead_communications
    FOR ALL USING (organization_id = auth_organization_id());

-- Lead Appointments RLS
CREATE POLICY "Users can access lead appointments from their organization" ON lead_appointments
    FOR ALL USING (organization_id = auth_organization_id());

-- Document Template Categories RLS
CREATE POLICY "Users can access template categories from their organization" ON document_template_categories
    FOR ALL USING (organization_id = auth_organization_id());

-- Document Templates RLS (with permission-based access)
CREATE POLICY "Users can access document templates based on permissions" ON document_templates
    FOR SELECT USING (
        organization_id = auth_organization_id() AND (
            is_public = true OR
            created_by = auth.uid() OR
            auth.uid() = ANY(allowed_users) OR
            auth.uid() = ANY(can_edit_users) OR
            auth.uid() = ANY(can_delete_users) OR
            user_role() = ANY(allowed_roles)
        )
    );

CREATE POLICY "Users can insert document templates in their organization" ON document_templates
    FOR INSERT WITH CHECK (organization_id = auth_organization_id());

CREATE POLICY "Users can update document templates they have permission for" ON document_templates
    FOR UPDATE USING (
        organization_id = auth_organization_id() AND (
            created_by = auth.uid() OR
            auth.uid() = ANY(can_edit_users) OR
            is_subscriber()
        )
    );

CREATE POLICY "Only subscribers can delete document templates" ON document_templates
    FOR DELETE USING (
        organization_id = auth_organization_id() AND (
            is_subscriber() OR
            auth.uid() = ANY(can_delete_users)
        )
    );

-- Document Template Variables RLS
CREATE POLICY "Users can access template variables from their organization" ON document_template_variables
    FOR ALL USING (organization_id = auth_organization_id());

-- Generated Documents RLS
CREATE POLICY "Users can access generated documents from their organization" ON generated_documents
    FOR ALL USING (organization_id = auth_organization_id());

-- Document Signatures RLS
CREATE POLICY "Users can access document signatures from their organization" ON document_signatures
    FOR ALL USING (organization_id = auth_organization_id());

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to generate lead number
CREATE OR REPLACE FUNCTION generate_lead_number(org_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    lead_number VARCHAR(50);
    next_number INTEGER;
BEGIN
    -- Get next number for the organization
    SELECT COALESCE(MAX(CAST(SUBSTRING(lead_number FROM '^LEAD-(\d+)$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM leads
    WHERE organization_id = org_id
    AND lead_number ~ '^LEAD-\d+$';
    
    -- Format as LEAD-000001
    lead_number := 'LEAD-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN lead_number;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign lead numbers
CREATE OR REPLACE FUNCTION auto_assign_lead_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lead_number IS NULL OR NEW.lead_number = '' THEN
        NEW.lead_number := generate_lead_number(NEW.organization_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-assigning lead numbers
CREATE TRIGGER trigger_auto_assign_lead_number
    BEFORE INSERT ON leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_lead_number();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER trigger_update_lead_sources_updated_at
    BEFORE UPDATE ON lead_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_sales_funnel_stages_updated_at
    BEFORE UPDATE ON sales_funnel_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Note: Seed data will be inserted via a separate script or application logic
-- to ensure proper organization_id values are used based on the actual deployment.