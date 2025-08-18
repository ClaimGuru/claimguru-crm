-- Migration: enhance_crm_entity_management_system_fixed
-- Created at: 1755287711

-- Migration: Enhance CRM Entity Management System for Function 2.3 (Fixed)
-- Created at: 2025-08-16
-- Comprehensive vendor, attorney, and referral source management

-- =====================================================
-- ENHANCED VENDOR MANAGEMENT SYSTEM
-- =====================================================

-- Vendor Categories Table
CREATE TABLE IF NOT EXISTS vendor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    required_licenses TEXT[],
    required_insurance_types TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Vendor Specialties Table
CREATE TABLE IF NOT EXISTS vendor_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    category_id UUID NOT NULL REFERENCES vendor_categories(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    required_certifications TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Service Areas Table
CREATE TABLE IF NOT EXISTS service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    area_type VARCHAR(50) NOT NULL, -- 'city', 'county', 'state', 'zip_code', 'radius'
    area_data JSONB NOT NULL, -- Store specific area information
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor Service Area Assignments
CREATE TABLE IF NOT EXISTS vendor_service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    service_area_id UUID NOT NULL REFERENCES service_areas(id) ON DELETE CASCADE,
    travel_charge DECIMAL(10,2),
    response_time_hours INTEGER,
    is_primary_area BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, service_area_id)
);

-- Equipment and Capabilities
CREATE TABLE IF NOT EXISTS vendor_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    equipment_type VARCHAR(100) NOT NULL,
    equipment_name VARCHAR(200) NOT NULL,
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    capacity VARCHAR(100),
    certification_required BOOLEAN DEFAULT false,
    certification_details TEXT,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    is_operational BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor Performance Metrics
CREATE TABLE IF NOT EXISTS vendor_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    metric_period VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Performance Metrics
    total_jobs INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    on_time_completions INTEGER DEFAULT 0,
    quality_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 5.00
    customer_satisfaction DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 5.00
    average_response_time_hours DECIMAL(5,2) DEFAULT 0.00,
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    
    -- Reliability Metrics
    no_shows INTEGER DEFAULT 0,
    cancellations INTEGER DEFAULT 0,
    quality_issues INTEGER DEFAULT 0,
    complaints INTEGER DEFAULT 0,
    compliments INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, metric_period, period_start)
);

-- =====================================================
-- ATTORNEY MANAGEMENT SYSTEM
-- =====================================================

-- Legal Specializations
CREATE TABLE IF NOT EXISTS legal_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    typical_case_types TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Attorney Profiles (extends adjusters table for legal professionals)
CREATE TABLE IF NOT EXISTS attorney_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    adjuster_id UUID NOT NULL REFERENCES adjusters(id) ON DELETE CASCADE,
    law_firm_name VARCHAR(255),
    bar_number VARCHAR(100),
    bar_admission_date DATE,
    states_admitted TEXT[],
    law_school VARCHAR(255),
    graduation_year INTEGER,
    years_of_experience INTEGER,
    
    -- Specializations
    primary_specialization_id UUID REFERENCES legal_specializations(id),
    secondary_specializations UUID[],
    
    -- Professional Details
    billing_rate_hourly DECIMAL(8,2),
    retainer_amount DECIMAL(10,2),
    payment_terms_days INTEGER DEFAULT 30,
    accepts_contingency BOOLEAN DEFAULT false,
    contingency_rate DECIMAL(5,2),
    
    -- Case History Summary
    total_cases_handled INTEGER DEFAULT 0,
    cases_won INTEGER DEFAULT 0,
    cases_settled INTEGER DEFAULT 0,
    cases_lost INTEGER DEFAULT 0,
    average_settlement_amount DECIMAL(15,2),
    
    -- Professional Standing
    malpractice_insurance_amount DECIMAL(15,2),
    disciplinary_actions INTEGER DEFAULT 0,
    professional_awards TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(adjuster_id)
);

-- Attorney Case Assignments
CREATE TABLE IF NOT EXISTS attorney_case_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    attorney_id UUID NOT NULL REFERENCES attorney_profiles(id) ON DELETE CASCADE,
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    assignment_type VARCHAR(50) NOT NULL, -- 'primary', 'co_counsel', 'consultant'
    assignment_date DATE NOT NULL,
    case_status VARCHAR(50) DEFAULT 'active', -- 'active', 'settled', 'won', 'lost', 'dismissed'
    settlement_amount DECIMAL(15,2),
    attorney_fees DECIMAL(10,2),
    completion_date DATE,
    case_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENHANCED REFERRAL SOURCE SYSTEM
-- =====================================================

-- Referral Types
CREATE TABLE IF NOT EXISTS referral_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    commission_rate DECIMAL(5,2),
    tracking_requirements TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Enhanced Referral Sources (extends lead_sources)
CREATE TABLE IF NOT EXISTS referral_source_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    lead_source_id UUID NOT NULL REFERENCES lead_sources(id) ON DELETE CASCADE,
    referral_type_id UUID NOT NULL REFERENCES referral_types(id),
    
    -- Contact Information
    contact_person VARCHAR(255),
    contact_title VARCHAR(100),
    primary_phone VARCHAR(50),
    secondary_phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Address
    address_line_1 TEXT,
    address_line_2 TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    
    -- Relationship Details
    relationship_type VARCHAR(50), -- 'professional', 'personal', 'business'
    relationship_start_date DATE,
    relationship_strength VARCHAR(20) DEFAULT 'medium', -- 'weak', 'medium', 'strong'
    last_contact_date DATE,
    next_follow_up_date DATE,
    
    -- Commission and Financial
    commission_structure VARCHAR(50) DEFAULT 'percentage', -- 'percentage', 'flat_fee', 'tiered'
    commission_rate DECIMAL(5,2),
    flat_fee_amount DECIMAL(10,2),
    payment_terms_days INTEGER DEFAULT 30,
    
    -- Performance Summary
    total_referrals INTEGER DEFAULT 0,
    successful_conversions INTEGER DEFAULT 0,
    total_value_generated DECIMAL(15,2) DEFAULT 0.00,
    last_referral_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lead_source_id)
);

-- Referral Tracking and Conversion Metrics
CREATE TABLE IF NOT EXISTS referral_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    referral_source_id UUID NOT NULL REFERENCES referral_source_profiles(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id),
    client_id UUID REFERENCES clients(id),
    claim_id UUID REFERENCES claims(id),
    
    -- Referral Details
    referral_date DATE NOT NULL,
    conversion_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'converted', 'lost', 'disqualified'
    conversion_date DATE,
    referral_value DECIMAL(15,2),
    commission_due DECIMAL(10,2),
    commission_paid DECIMAL(10,2),
    commission_paid_date DATE,
    
    -- Tracking
    referral_method VARCHAR(50), -- 'phone', 'email', 'in_person', 'online'
    follow_up_required BOOLEAN DEFAULT false,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENTITY RELATIONSHIPS AND ASSIGNMENTS
-- =====================================================

-- Multi-Claim Entity Associations
CREATE TABLE IF NOT EXISTS claim_entity_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'vendor', 'attorney', 'adjuster'
    entity_id UUID NOT NULL,
    association_type VARCHAR(50) NOT NULL, -- 'primary', 'secondary', 'consultant'
    assignment_date DATE NOT NULL,
    completion_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication History (extends existing communication system)
CREATE TABLE IF NOT EXISTS entity_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'vendor', 'attorney', 'referral_source'
    entity_id UUID NOT NULL,
    claim_id UUID REFERENCES claims(id),
    
    -- Communication Details
    communication_type VARCHAR(50) NOT NULL, -- 'email', 'phone', 'meeting', 'sms'
    direction VARCHAR(20) NOT NULL, -- 'inbound', 'outbound'
    subject VARCHAR(255),
    content TEXT,
    outcome VARCHAR(100),
    
    -- User and Timing
    initiated_by UUID REFERENCES user_profiles(id),
    communication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PERFORMANCE ANALYTICS AND REPORTING
-- =====================================================

-- Entity Performance Summary (for dashboard metrics)
CREATE TABLE IF NOT EXISTS entity_performance_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    summary_period VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'yearly', 'all_time'
    period_start DATE,
    period_end DATE,
    
    -- Universal Metrics
    total_assignments INTEGER DEFAULT 0,
    completed_assignments INTEGER DEFAULT 0,
    active_assignments INTEGER DEFAULT 0,
    average_completion_days DECIMAL(5,2) DEFAULT 0.00,
    customer_satisfaction_score DECIMAL(3,2) DEFAULT 0.00,
    
    -- Financial Metrics  
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    total_costs DECIMAL(15,2) DEFAULT 0.00,
    profit_margin DECIMAL(5,2) DEFAULT 0.00,
    
    -- Quality Metrics
    quality_issues INTEGER DEFAULT 0,
    positive_feedback INTEGER DEFAULT 0,
    negative_feedback INTEGER DEFAULT 0,
    
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, entity_type, entity_id, summary_period, period_start)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Vendor Management Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_categories_organization ON vendor_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_specialties_category ON vendor_specialties(category_id);
CREATE INDEX IF NOT EXISTS idx_vendor_service_areas_vendor ON vendor_service_areas(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_equipment_vendor ON vendor_equipment(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_performance_vendor ON vendor_performance_metrics(vendor_id);

-- Attorney Management Indexes
CREATE INDEX IF NOT EXISTS idx_attorney_profiles_adjuster ON attorney_profiles(adjuster_id);
CREATE INDEX IF NOT EXISTS idx_attorney_profiles_specialization ON attorney_profiles(primary_specialization_id);
CREATE INDEX IF NOT EXISTS idx_attorney_cases_attorney ON attorney_case_assignments(attorney_id);
CREATE INDEX IF NOT EXISTS idx_attorney_cases_claim ON attorney_case_assignments(claim_id);

-- Referral Source Indexes
CREATE INDEX IF NOT EXISTS idx_referral_profiles_lead_source ON referral_source_profiles(lead_source_id);
CREATE INDEX IF NOT EXISTS idx_referral_profiles_type ON referral_source_profiles(referral_type_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_source ON referral_conversions(referral_source_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_claim ON referral_conversions(claim_id);

-- Entity Association Indexes
CREATE INDEX IF NOT EXISTS idx_claim_entities_claim ON claim_entity_associations(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_entities_type_id ON claim_entity_associations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_communications_entity ON entity_communications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_communications_claim ON entity_communications(claim_id);

-- Performance Summary Indexes
CREATE INDEX IF NOT EXISTS idx_performance_summary_entity ON entity_performance_summary(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_performance_summary_period ON entity_performance_summary(summary_period, period_start);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attorney_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attorney_case_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_source_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_entity_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_performance_summary ENABLE ROW LEVEL SECURITY;

-- Create organization-based RLS policies
CREATE POLICY "Users can access vendor categories from their organization" ON vendor_categories
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access vendor specialties from their organization" ON vendor_specialties
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access service areas from their organization" ON service_areas
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access vendor service areas from their organization" ON vendor_service_areas
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access vendor equipment from their organization" ON vendor_equipment
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access vendor performance metrics from their organization" ON vendor_performance_metrics
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access legal specializations from their organization" ON legal_specializations
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access attorney profiles from their organization" ON attorney_profiles
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access attorney case assignments from their organization" ON attorney_case_assignments
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access referral types from their organization" ON referral_types
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access referral source profiles from their organization" ON referral_source_profiles
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access referral conversions from their organization" ON referral_conversions
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access claim entity associations from their organization" ON claim_entity_associations
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access entity communications from their organization" ON entity_communications
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can access entity performance summary from their organization" ON entity_performance_summary
FOR ALL USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));;