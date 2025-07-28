-- Migration: Create Relational Rolodex System
-- Created at: 1754000000
-- Description: Enhance database schema for comprehensive relational Rolodex system

-- ====================
-- ENHANCED CLIENTS TABLE
-- ====================

-- Add missing columns to existing clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS client_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS communication_preferences JSONB,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS client_status VARCHAR(50) DEFAULT 'active';

-- Create index for client searches
CREATE INDEX IF NOT EXISTS idx_clients_search ON clients USING gin (
    to_tsvector('english', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(business_name, ''))
);

-- ====================
-- ENHANCED INSURANCE CARRIERS TABLE
-- ====================

-- Add relational and tracking columns to insurance_carriers
ALTER TABLE insurance_carriers 
ADD COLUMN IF NOT EXISTS carrier_group VARCHAR(255),
ADD COLUMN IF NOT EXISTS financial_rating VARCHAR(10),
ADD COLUMN IF NOT EXISTS specializes_in TEXT[],
ADD COLUMN IF NOT EXISTS service_areas TEXT[],
ADD COLUMN IF NOT EXISTS contact_history JSONB,
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100),
ADD COLUMN IF NOT EXISTS average_response_time_hours INTEGER,
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS carrier_status VARCHAR(50) DEFAULT 'active';

-- ====================
-- ENHANCED VENDORS TABLE
-- ====================

-- Add comprehensive vendor management columns
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS vendor_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS certification_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS years_in_business INTEGER,
ADD COLUMN IF NOT EXISTS employee_count_range VARCHAR(50),
ADD COLUMN IF NOT EXISTS equipment_owned JSONB,
ADD COLUMN IF NOT EXISTS service_availability JSONB,
ADD COLUMN IF NOT EXISTS pricing_model VARCHAR(100),
ADD COLUMN IF NOT EXISTS performance_metrics JSONB,
ADD COLUMN IF NOT EXISTS last_performance_review DATE,
ADD COLUMN IF NOT EXISTS contract_terms JSONB,
ADD COLUMN IF NOT EXISTS emergency_contact JSONB,
ADD COLUMN IF NOT EXISTS backup_vendors TEXT[],
ADD COLUMN IF NOT EXISTS vendor_status VARCHAR(50) DEFAULT 'active';

-- ====================
-- NEW CARRIER PERSONNEL TABLE
-- ====================

CREATE TABLE IF NOT EXISTS carrier_personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    carrier_id UUID REFERENCES insurance_carriers(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_initial VARCHAR(5),
    title VARCHAR(100),
    
    -- Professional Information
    department VARCHAR(100),
    job_title VARCHAR(100),
    personnel_type VARCHAR(50) NOT NULL, -- adjuster, supervisor, manager, etc.
    seniority_level VARCHAR(50), -- junior, senior, lead, etc.
    specialties TEXT[],
    
    -- Contact Information
    primary_email VARCHAR(255),
    secondary_email VARCHAR(255),
    office_phone VARCHAR(50),
    mobile_phone VARCHAR(50),
    direct_line VARCHAR(50),
    phone_extension VARCHAR(10),
    
    -- Professional Credentials
    license_number VARCHAR(100),
    license_state VARCHAR(10),
    license_type VARCHAR(100),
    license_expiration DATE,
    certifications JSONB,
    
    -- Work Information
    office_address JSONB,
    territory_coverage TEXT[],
    caseload_capacity INTEGER,
    current_caseload INTEGER,
    availability_status VARCHAR(50) DEFAULT 'available',
    
    -- Performance & Relationship
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
    communication_style VARCHAR(100),
    preferred_contact_method VARCHAR(50) DEFAULT 'email',
    response_time_hours INTEGER,
    working_relationship_notes TEXT,
    
    -- Tracking
    last_contact_date TIMESTAMP WITH TIME ZONE,
    total_claims_handled INTEGER DEFAULT 0,
    active_claims_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    notes TEXT
);

-- Create indexes for carrier personnel
CREATE INDEX IF NOT EXISTS idx_carrier_personnel_carrier ON carrier_personnel(carrier_id);
CREATE INDEX IF NOT EXISTS idx_carrier_personnel_type ON carrier_personnel(personnel_type);
CREATE INDEX IF NOT EXISTS idx_carrier_personnel_active ON carrier_personnel(is_active);
CREATE INDEX IF NOT EXISTS idx_carrier_personnel_search ON carrier_personnel USING gin (
    to_tsvector('english', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(department, '') || ' ' || COALESCE(job_title, ''))
);

-- ====================
-- NEW MORTGAGE LENDERS TABLE
-- ====================

CREATE TABLE IF NOT EXISTS mortgage_lenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    -- Lender Information
    lender_name VARCHAR(255) NOT NULL,
    lender_type VARCHAR(100), -- bank, credit_union, mortgage_company, etc.
    federal_id VARCHAR(50),
    nmls_id VARCHAR(50),
    
    -- Contact Information
    primary_email VARCHAR(255),
    secondary_email VARCHAR(255),
    phone_1 VARCHAR(50),
    phone_2 VARCHAR(50),
    fax VARCHAR(50),
    website VARCHAR(255),
    
    -- Address Information
    address_line_1 TEXT,
    address_line_2 TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    
    -- Business Information
    years_in_business INTEGER,
    license_states TEXT[],
    loan_types_offered TEXT[],
    service_areas TEXT[],
    
    -- Contact Preferences
    preferred_contact_method VARCHAR(50) DEFAULT 'email',
    business_hours JSONB,
    emergency_contact JSONB,
    
    -- Performance Tracking
    response_time_hours INTEGER,
    processing_time_days INTEGER,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    
    -- Relationship Management
    relationship_manager VARCHAR(255),
    account_status VARCHAR(50) DEFAULT 'active',
    last_contact_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    -- Tracking
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID
);

-- Create indexes for mortgage lenders
CREATE INDEX IF NOT EXISTS idx_mortgage_lenders_active ON mortgage_lenders(is_active);
CREATE INDEX IF NOT EXISTS idx_mortgage_lenders_type ON mortgage_lenders(lender_type);
CREATE INDEX IF NOT EXISTS idx_mortgage_lenders_search ON mortgage_lenders USING gin (
    to_tsvector('english', COALESCE(lender_name, '') || ' ' || COALESCE(relationship_manager, ''))
);

-- ====================
-- NEW CLAIM ASSOCIATIONS TABLE
-- ====================

CREATE TABLE IF NOT EXISTS claim_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL, -- References claims(id)
    
    -- Associated Entity Information
    entity_type VARCHAR(50) NOT NULL, -- client, carrier, vendor, carrier_personnel, mortgage_lender
    entity_id UUID NOT NULL, -- Generic reference to any entity
    
    -- Association Details
    association_type VARCHAR(100), -- primary, secondary, emergency, backup, etc.
    role_in_claim VARCHAR(100), -- adjuster, contractor, lender, etc.
    assignment_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, completed
    
    -- Relationship Tracking
    primary_contact BOOLEAN DEFAULT false,
    communication_frequency VARCHAR(50), -- daily, weekly, as_needed
    last_interaction_date TIMESTAMP WITH TIME ZONE,
    next_scheduled_contact DATE,
    
    -- Performance on this claim
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
    response_time_hours INTEGER,
    notes TEXT,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID
);

-- Create indexes for claim associations
CREATE INDEX IF NOT EXISTS idx_claim_associations_claim ON claim_associations(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_associations_entity ON claim_associations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_claim_associations_status ON claim_associations(status);
CREATE INDEX IF NOT EXISTS idx_claim_associations_primary ON claim_associations(primary_contact);

-- ====================
-- NEW ENTITY RELATIONSHIPS TABLE
-- ====================

CREATE TABLE IF NOT EXISTS entity_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    -- Relationship Definition
    entity_1_type VARCHAR(50) NOT NULL,
    entity_1_id UUID NOT NULL,
    entity_2_type VARCHAR(50) NOT NULL,
    entity_2_id UUID NOT NULL,
    
    -- Relationship Details
    relationship_type VARCHAR(100) NOT NULL, -- vendor_partnership, referral_source, parent_company, etc.
    relationship_strength VARCHAR(50), -- weak, moderate, strong
    is_reciprocal BOOLEAN DEFAULT true,
    
    -- Business Impact
    business_value VARCHAR(50), -- low, medium, high, critical
    revenue_impact DECIMAL(12,2),
    volume_impact INTEGER,
    
    -- Tracking
    established_date DATE,
    last_interaction_date TIMESTAMP WITH TIME ZONE,
    relationship_status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    
    -- Ensure no duplicate relationships
    UNIQUE(entity_1_type, entity_1_id, entity_2_type, entity_2_id, relationship_type)
);

-- Create indexes for entity relationships
CREATE INDEX IF NOT EXISTS idx_entity_relationships_entity1 ON entity_relationships(entity_1_type, entity_1_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_entity2 ON entity_relationships(entity_2_type, entity_2_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_type ON entity_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_status ON entity_relationships(relationship_status);

-- ====================
-- NEW COMMUNICATION HISTORY TABLE
-- ====================

CREATE TABLE IF NOT EXISTS communication_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    -- Communication Participants
    claim_id UUID, -- Optional claim association
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Communication Details
    communication_type VARCHAR(50) NOT NULL, -- email, phone, meeting, text, etc.
    direction VARCHAR(20) NOT NULL, -- inbound, outbound
    subject VARCHAR(500),
    content TEXT,
    
    -- Metadata
    communication_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    duration_minutes INTEGER,
    outcome VARCHAR(100), -- successful, no_answer, follow_up_needed, etc.
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    
    -- Follow-up Tracking
    requires_follow_up BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_completed BOOLEAN DEFAULT false,
    
    -- Attachments and References
    attachments JSONB,
    reference_numbers TEXT[],
    tags TEXT[],
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    notes TEXT
);

-- Create indexes for communication history
CREATE INDEX IF NOT EXISTS idx_communication_history_entity ON communication_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_communication_history_claim ON communication_history(claim_id);
CREATE INDEX IF NOT EXISTS idx_communication_history_date ON communication_history(communication_date);
CREATE INDEX IF NOT EXISTS idx_communication_history_follow_up ON communication_history(requires_follow_up, follow_up_date);

-- ====================
-- ENHANCED CLAIMS TABLE
-- ====================

-- Add relational columns to existing claims table
ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS primary_client_id UUID REFERENCES clients(id),
ADD COLUMN IF NOT EXISTS primary_carrier_id UUID REFERENCES insurance_carriers(id),
ADD COLUMN IF NOT EXISTS assigned_adjuster_id UUID,
ADD COLUMN IF NOT EXISTS primary_vendor_id UUID REFERENCES vendors(id),
ADD COLUMN IF NOT EXISTS referral_source_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS referral_source_id UUID,
ADD COLUMN IF NOT EXISTS claim_complexity VARCHAR(50) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS estimated_duration_days INTEGER,
ADD COLUMN IF NOT EXISTS business_priority VARCHAR(50) DEFAULT 'normal';

-- Create indexes for enhanced claims
CREATE INDEX IF NOT EXISTS idx_claims_primary_client ON claims(primary_client_id);
CREATE INDEX IF NOT EXISTS idx_claims_primary_carrier ON claims(primary_carrier_id);
CREATE INDEX IF NOT EXISTS idx_claims_assigned_adjuster ON claims(assigned_adjuster_id);
CREATE INDEX IF NOT EXISTS idx_claims_primary_vendor ON claims(primary_vendor_id);
CREATE INDEX IF NOT EXISTS idx_claims_referral_source ON claims(referral_source_type, referral_source_id);

-- ====================
-- ROLODEX SEARCH FUNCTIONS
-- ====================

-- Function to search across all entities in the Rolodex
CREATE OR REPLACE FUNCTION search_rolodex(
    search_term TEXT,
    entity_types TEXT[] DEFAULT ARRAY['client', 'carrier', 'vendor', 'carrier_personnel', 'mortgage_lender'],
    limit_per_type INTEGER DEFAULT 10
)
RETURNS TABLE (
    entity_type TEXT,
    entity_id UUID,
    entity_name TEXT,
    entity_details JSONB,
    relevance_score REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    
    -- Search Clients
    SELECT 
        'client'::TEXT as entity_type,
        c.id as entity_id,
        COALESCE(c.business_name, c.first_name || ' ' || c.last_name) as entity_name,
        jsonb_build_object(
            'email', c.primary_email,
            'phone', c.primary_phone,
            'type', c.client_type,
            'active', c.is_active
        ) as entity_details,
        ts_rank(to_tsvector('english', COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '') || ' ' || COALESCE(c.business_name, '')), plainto_tsquery('english', search_term)) as relevance_score
    FROM clients c
    WHERE 'client' = ANY(entity_types)
    AND to_tsvector('english', COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '') || ' ' || COALESCE(c.business_name, '')) @@ plainto_tsquery('english', search_term)
    ORDER BY relevance_score DESC
    LIMIT limit_per_type
    
    UNION ALL
    
    -- Search Insurance Carriers
    SELECT 
        'carrier'::TEXT as entity_type,
        ic.id as entity_id,
        ic.carrier_name as entity_name,
        jsonb_build_object(
            'email', ic.email,
            'phone', ic.phone_1,
            'rating', ic.rating,
            'active', ic.is_active
        ) as entity_details,
        ts_rank(to_tsvector('english', ic.carrier_name), plainto_tsquery('english', search_term)) as relevance_score
    FROM insurance_carriers ic
    WHERE 'carrier' = ANY(entity_types)
    AND to_tsvector('english', ic.carrier_name) @@ plainto_tsquery('english', search_term)
    ORDER BY relevance_score DESC
    LIMIT limit_per_type
    
    UNION ALL
    
    -- Search Vendors
    SELECT 
        'vendor'::TEXT as entity_type,
        v.id as entity_id,
        v.company_name as entity_name,
        jsonb_build_object(
            'email', v.email,
            'phone', v.phone_1,
            'type', v.company_type,
            'rating', v.rating,
            'active', v.is_active
        ) as entity_details,
        ts_rank(to_tsvector('english', v.company_name || ' ' || COALESCE(v.contact_first_name, '') || ' ' || COALESCE(v.contact_last_name, '')), plainto_tsquery('english', search_term)) as relevance_score
    FROM vendors v
    WHERE 'vendor' = ANY(entity_types)
    AND to_tsvector('english', v.company_name || ' ' || COALESCE(v.contact_first_name, '') || ' ' || COALESCE(v.contact_last_name, '')) @@ plainto_tsquery('english', search_term)
    ORDER BY relevance_score DESC
    LIMIT limit_per_type
    
    UNION ALL
    
    -- Search Carrier Personnel
    SELECT 
        'carrier_personnel'::TEXT as entity_type,
        cp.id as entity_id,
        cp.first_name || ' ' || cp.last_name as entity_name,
        jsonb_build_object(
            'email', cp.primary_email,
            'phone', cp.office_phone,
            'title', cp.job_title,
            'department', cp.department,
            'active', cp.is_active
        ) as entity_details,
        ts_rank(to_tsvector('english', cp.first_name || ' ' || cp.last_name || ' ' || COALESCE(cp.department, '') || ' ' || COALESCE(cp.job_title, '')), plainto_tsquery('english', search_term)) as relevance_score
    FROM carrier_personnel cp
    WHERE 'carrier_personnel' = ANY(entity_types)
    AND to_tsvector('english', cp.first_name || ' ' || cp.last_name || ' ' || COALESCE(cp.department, '') || ' ' || COALESCE(cp.job_title, '')) @@ plainto_tsquery('english', search_term)
    ORDER BY relevance_score DESC
    LIMIT limit_per_type
    
    UNION ALL
    
    -- Search Mortgage Lenders
    SELECT 
        'mortgage_lender'::TEXT as entity_type,
        ml.id as entity_id,
        ml.lender_name as entity_name,
        jsonb_build_object(
            'email', ml.primary_email,
            'phone', ml.phone_1,
            'type', ml.lender_type,
            'manager', ml.relationship_manager,
            'active', ml.is_active
        ) as entity_details,
        ts_rank(to_tsvector('english', ml.lender_name || ' ' || COALESCE(ml.relationship_manager, '')), plainto_tsquery('english', search_term)) as relevance_score
    FROM mortgage_lenders ml
    WHERE 'mortgage_lender' = ANY(entity_types)
    AND to_tsvector('english', ml.lender_name || ' ' || COALESCE(ml.relationship_manager, '')) @@ plainto_tsquery('english', search_term)
    ORDER BY relevance_score DESC
    LIMIT limit_per_type;
    
END;
$$;

-- ====================
-- TRIGGER FUNCTIONS FOR UPDATED_AT
-- ====================

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_carrier_personnel_updated_at BEFORE UPDATE ON carrier_personnel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mortgage_lenders_updated_at BEFORE UPDATE ON mortgage_lenders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_associations_updated_at BEFORE UPDATE ON claim_associations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entity_relationships_updated_at BEFORE UPDATE ON entity_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================
-- SAMPLE DATA FUNCTIONS
-- ====================

-- Function to get entity relationship network
CREATE OR REPLACE FUNCTION get_entity_network(
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    max_depth INTEGER DEFAULT 2
)
RETURNS TABLE (
    depth INTEGER,
    relationship_type VARCHAR(100),
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    related_entity_name TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- This is a simplified version - in practice, you'd implement recursive relationship traversal
    RETURN QUERY
    SELECT 
        1 as depth,
        er.relationship_type,
        er.entity_2_type as related_entity_type,
        er.entity_2_id as related_entity_id,
        CASE 
            WHEN er.entity_2_type = 'client' THEN 
                (SELECT COALESCE(business_name, first_name || ' ' || last_name) FROM clients WHERE id = er.entity_2_id)
            WHEN er.entity_2_type = 'carrier' THEN 
                (SELECT carrier_name FROM insurance_carriers WHERE id = er.entity_2_id)
            WHEN er.entity_2_type = 'vendor' THEN 
                (SELECT company_name FROM vendors WHERE id = er.entity_2_id)
            ELSE 'Unknown'
        END as related_entity_name
    FROM entity_relationships er
    WHERE er.entity_1_type = p_entity_type 
    AND er.entity_1_id = p_entity_id
    AND er.relationship_status = 'active'
    
    UNION ALL
    
    SELECT 
        1 as depth,
        er.relationship_type,
        er.entity_1_type as related_entity_type,
        er.entity_1_id as related_entity_id,
        CASE 
            WHEN er.entity_1_type = 'client' THEN 
                (SELECT COALESCE(business_name, first_name || ' ' || last_name) FROM clients WHERE id = er.entity_1_id)
            WHEN er.entity_1_type = 'carrier' THEN 
                (SELECT carrier_name FROM insurance_carriers WHERE id = er.entity_1_id)
            WHEN er.entity_1_type = 'vendor' THEN 
                (SELECT company_name FROM vendors WHERE id = er.entity_1_id)
            ELSE 'Unknown'
        END as related_entity_name
    FROM entity_relationships er
    WHERE er.entity_2_type = p_entity_type 
    AND er.entity_2_id = p_entity_id
    AND er.relationship_status = 'active'
    AND er.is_reciprocal = true;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create RLS policies for new tables (basic organization-based security)
ALTER TABLE carrier_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgage_lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_history ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (should be customized based on specific security requirements)
CREATE POLICY "Users can access their organization's carrier personnel" ON carrier_personnel
    FOR ALL USING (organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's mortgage lenders" ON mortgage_lenders
    FOR ALL USING (organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's claim associations" ON claim_associations
    FOR ALL USING (EXISTS (SELECT 1 FROM claims WHERE id = claim_id AND organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can access their organization's entity relationships" ON entity_relationships
    FOR ALL USING (organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's communication history" ON communication_history
    FOR ALL USING (organization_id = (SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()));

-- ====================
-- MIGRATION COMPLETE
-- ====================

-- Insert migration record
INSERT INTO public.migrations (version, name, executed_at) 
VALUES (1754000000, 'create_relational_rolodex_system', now())
ON CONFLICT (version) DO NOTHING;

COMMIT;