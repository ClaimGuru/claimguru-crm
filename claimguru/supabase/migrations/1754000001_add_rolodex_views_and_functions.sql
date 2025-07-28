-- Migration: Add Rolodex Views and Helper Functions
-- Created at: 1754000001
-- Description: Create convenient views and functions for the Rolodex system

-- ====================
-- ROLODEX UNIFIED VIEWS
-- ====================

-- Unified contact view that combines all entity types
CREATE OR REPLACE VIEW rolodex_unified_contacts AS
SELECT 
    'client' as entity_type,
    c.id as entity_id,
    c.organization_id,
    COALESCE(c.business_name, c.first_name || ' ' || c.last_name) as display_name,
    c.first_name,
    c.last_name,
    c.business_name,
    c.primary_email as email,
    c.primary_phone as phone,
    CONCAT(c.address_line_1, CASE WHEN c.address_line_2 IS NOT NULL THEN ', ' || c.address_line_2 ELSE '' END) as address,
    c.city,
    c.state,
    c.zip_code,
    c.client_type as entity_subtype,
    c.is_active,
    c.last_contact_date,
    c.created_at,
    c.updated_at,
    NULL::INTEGER as rating,
    c.notes
FROM clients c
WHERE c.is_active = true

UNION ALL

SELECT 
    'carrier' as entity_type,
    ic.id as entity_id,
    ic.organization_id,
    ic.carrier_name as display_name,
    NULL as first_name,
    NULL as last_name,
    ic.carrier_name as business_name,
    ic.email,
    ic.phone_1 as phone,
    CONCAT(ic.address_line_1, CASE WHEN ic.address_line_2 IS NOT NULL THEN ', ' || ic.address_line_2 ELSE '' END) as address,
    ic.city,
    ic.state,
    ic.zip_code,
    ic.carrier_group as entity_subtype,
    ic.is_active,
    ic.last_contact_date,
    ic.created_at,
    ic.updated_at,
    ic.rating,
    ic.notes
FROM insurance_carriers ic
WHERE ic.is_active = true

UNION ALL

SELECT 
    'vendor' as entity_type,
    v.id as entity_id,
    v.organization_id,
    v.company_name as display_name,
    v.contact_first_name as first_name,
    v.contact_last_name as last_name,
    v.company_name as business_name,
    v.email,
    v.phone_1 as phone,
    CONCAT(v.address_line_1, CASE WHEN v.address_line_2 IS NOT NULL THEN ', ' || v.address_line_2 ELSE '' END) as address,
    v.city,
    v.state,
    v.zip_code,
    v.company_type as entity_subtype,
    v.is_active,
    NULL as last_contact_date,
    v.created_at,
    v.updated_at,
    v.rating,
    v.notes
FROM vendors v
WHERE v.is_active = true

UNION ALL

SELECT 
    'carrier_personnel' as entity_type,
    cp.id as entity_id,
    cp.organization_id,
    cp.first_name || ' ' || cp.last_name as display_name,
    cp.first_name,
    cp.last_name,
    NULL as business_name,
    cp.primary_email as email,
    cp.office_phone as phone,
    NULL as address,
    NULL as city,
    NULL as state,
    NULL as zip_code,
    cp.personnel_type as entity_subtype,
    cp.is_active,
    cp.last_contact_date,
    cp.created_at,
    cp.updated_at,
    cp.performance_rating as rating,
    cp.notes
FROM carrier_personnel cp
WHERE cp.is_active = true

UNION ALL

SELECT 
    'mortgage_lender' as entity_type,
    ml.id as entity_id,
    ml.organization_id,
    ml.lender_name as display_name,
    NULL as first_name,
    NULL as last_name,
    ml.lender_name as business_name,
    ml.primary_email as email,
    ml.phone_1 as phone,
    CONCAT(ml.address_line_1, CASE WHEN ml.address_line_2 IS NOT NULL THEN ', ' || ml.address_line_2 ELSE '' END) as address,
    ml.city,
    ml.state,
    ml.zip_code,
    ml.lender_type as entity_subtype,
    ml.is_active,
    ml.last_contact_date,
    ml.created_at,
    ml.updated_at,
    ml.satisfaction_rating as rating,
    ml.notes
FROM mortgage_lenders ml
WHERE ml.is_active = true;

-- Claim relationships view
CREATE OR REPLACE VIEW claim_entity_relationships AS
SELECT 
    ca.claim_id,
    ca.entity_type,
    ca.entity_id,
    ca.association_type,
    ca.role_in_claim,
    ca.status,
    ca.primary_contact,
    ruc.display_name,
    ruc.email,
    ruc.phone,
    ruc.rating,
    ca.performance_rating as claim_performance_rating,
    ca.last_interaction_date,
    ca.next_scheduled_contact,
    ca.notes as association_notes
FROM claim_associations ca
JOIN rolodex_unified_contacts ruc ON ca.entity_type = ruc.entity_type AND ca.entity_id = ruc.entity_id
WHERE ca.status = 'active';

-- ====================
-- HELPER FUNCTIONS
-- ====================

-- Function to get all contacts for a claim
CREATE OR REPLACE FUNCTION get_claim_contacts(p_claim_id UUID)
RETURNS TABLE (
    entity_type TEXT,
    entity_id UUID,
    display_name TEXT,
    role_in_claim VARCHAR(100),
    is_primary_contact BOOLEAN,
    email VARCHAR(255),
    phone VARCHAR(50),
    last_contact TIMESTAMP WITH TIME ZONE,
    next_contact DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cer.entity_type::TEXT,
        cer.entity_id,
        cer.display_name,
        cer.role_in_claim,
        cer.primary_contact,
        cer.email,
        cer.phone,
        cer.last_interaction_date,
        cer.next_scheduled_contact
    FROM claim_entity_relationships cer
    WHERE cer.claim_id = p_claim_id
    ORDER BY cer.primary_contact DESC, cer.display_name ASC;
END;
$$;

-- Function to add entity to claim
CREATE OR REPLACE FUNCTION add_entity_to_claim(
    p_claim_id UUID,
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_role_in_claim VARCHAR(100),
    p_association_type VARCHAR(100) DEFAULT 'primary',
    p_is_primary_contact BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    new_association_id UUID;
BEGIN
    INSERT INTO claim_associations (
        claim_id,
        entity_type,
        entity_id,
        association_type,
        role_in_claim,
        primary_contact,
        assignment_date,
        status
    ) VALUES (
        p_claim_id,
        p_entity_type,
        p_entity_id,
        p_association_type,
        p_role_in_claim,
        p_is_primary_contact,
        CURRENT_DATE,
        'active'
    )
    RETURNING id INTO new_association_id;
    
    RETURN new_association_id;
END;
$$;

-- Function to get entity communication history
CREATE OR REPLACE FUNCTION get_entity_communication_history(
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    communication_id UUID,
    communication_type VARCHAR(50),
    direction VARCHAR(20),
    subject VARCHAR(500),
    communication_date TIMESTAMP WITH TIME ZONE,
    outcome VARCHAR(100),
    requires_follow_up BOOLEAN,
    follow_up_date DATE,
    claim_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ch.id,
        ch.communication_type,
        ch.direction,
        ch.subject,
        ch.communication_date,
        ch.outcome,
        ch.requires_follow_up,
        ch.follow_up_date,
        ch.claim_id
    FROM communication_history ch
    WHERE ch.entity_type = p_entity_type 
    AND ch.entity_id = p_entity_id
    ORDER BY ch.communication_date DESC
    LIMIT p_limit;
END;
$$;

-- Function to log communication
CREATE OR REPLACE FUNCTION log_communication(
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_communication_type VARCHAR(50),
    p_direction VARCHAR(20),
    p_subject VARCHAR(500),
    p_content TEXT DEFAULT NULL,
    p_outcome VARCHAR(100) DEFAULT 'successful',
    p_requires_follow_up BOOLEAN DEFAULT false,
    p_follow_up_date DATE DEFAULT NULL,
    p_claim_id UUID DEFAULT NULL,
    p_organization_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    new_communication_id UUID;
    org_id UUID;
BEGIN
    -- Get organization_id if not provided
    IF p_organization_id IS NULL THEN
        SELECT organization_id INTO org_id 
        FROM user_profiles 
        WHERE user_id = auth.uid();
    ELSE
        org_id := p_organization_id;
    END IF;
    
    INSERT INTO communication_history (
        organization_id,
        entity_type,
        entity_id,
        communication_type,
        direction,
        subject,
        content,
        outcome,
        requires_follow_up,
        follow_up_date,
        claim_id,
        created_by
    ) VALUES (
        org_id,
        p_entity_type,
        p_entity_id,
        p_communication_type,
        p_direction,
        p_subject,
        p_content,
        p_outcome,
        p_requires_follow_up,
        p_follow_up_date,
        p_claim_id,
        auth.uid()
    )
    RETURNING id INTO new_communication_id;
    
    -- Update last contact date on the entity
    CASE p_entity_type
        WHEN 'client' THEN
            UPDATE clients SET last_contact_date = now() WHERE id = p_entity_id;
        WHEN 'carrier' THEN
            UPDATE insurance_carriers SET last_contact_date = now() WHERE id = p_entity_id;
        WHEN 'carrier_personnel' THEN
            UPDATE carrier_personnel SET last_contact_date = now() WHERE id = p_entity_id;
        WHEN 'mortgage_lender' THEN
            UPDATE mortgage_lenders SET last_contact_date = now() WHERE id = p_entity_id;
        ELSE
            -- Handle other entity types as needed
            NULL;
    END CASE;
    
    RETURN new_communication_id;
END;
$$;

-- Function to get entity performance metrics
CREATE OR REPLACE FUNCTION get_entity_performance_metrics(
    p_entity_type VARCHAR(50),
    p_entity_id UUID
)
RETURNS TABLE (
    total_claims INTEGER,
    active_claims INTEGER,
    average_response_time_hours NUMERIC,
    average_performance_rating NUMERIC,
    last_interaction_date TIMESTAMP WITH TIME ZONE,
    total_communications INTEGER,
    pending_follow_ups INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ca.claim_id)::INTEGER as total_claims,
        COUNT(DISTINCT CASE WHEN ca.status = 'active' THEN ca.claim_id END)::INTEGER as active_claims,
        AVG(ca.response_time_hours) as average_response_time_hours,
        AVG(ca.performance_rating) as average_performance_rating,
        MAX(ch.communication_date) as last_interaction_date,
        COUNT(ch.id)::INTEGER as total_communications,
        COUNT(CASE WHEN ch.requires_follow_up = true AND ch.follow_up_completed = false THEN 1 END)::INTEGER as pending_follow_ups
    FROM claim_associations ca
    LEFT JOIN communication_history ch ON ch.entity_type = ca.entity_type AND ch.entity_id = ca.entity_id
    WHERE ca.entity_type = p_entity_type AND ca.entity_id = p_entity_id;
END;
$$;

-- Function to create entity relationship
CREATE OR REPLACE FUNCTION create_entity_relationship(
    p_entity_1_type VARCHAR(50),
    p_entity_1_id UUID,
    p_entity_2_type VARCHAR(50),
    p_entity_2_id UUID,
    p_relationship_type VARCHAR(100),
    p_business_value VARCHAR(50) DEFAULT 'medium',
    p_is_reciprocal BOOLEAN DEFAULT true,
    p_organization_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    new_relationship_id UUID;
    org_id UUID;
BEGIN
    -- Get organization_id if not provided
    IF p_organization_id IS NULL THEN
        SELECT organization_id INTO org_id 
        FROM user_profiles 
        WHERE user_id = auth.uid();
    ELSE
        org_id := p_organization_id;
    END IF;
    
    INSERT INTO entity_relationships (
        organization_id,
        entity_1_type,
        entity_1_id,
        entity_2_type,
        entity_2_id,
        relationship_type,
        business_value,
        is_reciprocal,
        established_date,
        created_by
    ) VALUES (
        org_id,
        p_entity_1_type,
        p_entity_1_id,
        p_entity_2_type,
        p_entity_2_id,
        p_relationship_type,
        p_business_value,
        p_is_reciprocal,
        CURRENT_DATE,
        auth.uid()
    )
    ON CONFLICT (entity_1_type, entity_1_id, entity_2_type, entity_2_id, relationship_type) 
    DO UPDATE SET 
        business_value = EXCLUDED.business_value,
        is_reciprocal = EXCLUDED.is_reciprocal,
        updated_at = now()
    RETURNING id INTO new_relationship_id;
    
    RETURN new_relationship_id;
END;
$$;

-- ====================
-- PERFORMANCE VIEWS
-- ====================

-- Entity performance summary view
CREATE OR REPLACE VIEW entity_performance_summary AS
SELECT 
    ruc.entity_type,
    ruc.entity_id,
    ruc.display_name,
    ruc.entity_subtype,
    ruc.rating,
    COUNT(DISTINCT ca.claim_id) as total_claims,
    COUNT(DISTINCT CASE WHEN ca.status = 'active' THEN ca.claim_id END) as active_claims,
    AVG(ca.performance_rating) as avg_claim_performance,
    AVG(ca.response_time_hours) as avg_response_time_hours,
    COUNT(ch.id) as total_communications,
    MAX(ch.communication_date) as last_communication_date,
    COUNT(CASE WHEN ch.requires_follow_up = true AND ch.follow_up_completed = false THEN 1 END) as pending_follow_ups
FROM rolodex_unified_contacts ruc
LEFT JOIN claim_associations ca ON ruc.entity_type = ca.entity_type AND ruc.entity_id = ca.entity_id
LEFT JOIN communication_history ch ON ruc.entity_type = ch.entity_type AND ruc.entity_id = ch.entity_id
GROUP BY 
    ruc.entity_type, ruc.entity_id, ruc.display_name, ruc.entity_subtype, ruc.rating;

-- Grant permissions on new views and functions
GRANT SELECT ON rolodex_unified_contacts TO authenticated;
GRANT SELECT ON claim_entity_relationships TO authenticated;
GRANT SELECT ON entity_performance_summary TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Insert migration record
INSERT INTO public.migrations (version, name, executed_at) 
VALUES (1754000001, 'add_rolodex_views_and_functions', now())
ON CONFLICT (version) DO NOTHING;

COMMIT;