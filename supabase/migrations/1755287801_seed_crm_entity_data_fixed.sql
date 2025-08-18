-- Migration: seed_crm_entity_data_fixed
-- Created at: 1755287801

-- Migration: Seed CRM Entity Management System Data (Fixed)
-- Created at: 2025-08-16
-- Initial data for vendor categories, legal specializations, and referral types

-- Create a function to get sample organization ID (this will need to be replaced with actual org data)
CREATE OR REPLACE FUNCTION get_sample_organization_id() RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations LIMIT 1;
    IF org_id IS NULL THEN
        -- If no organizations exist, create a sample one for demonstration
        INSERT INTO organizations (id, name, created_at) 
        VALUES (gen_random_uuid(), 'Sample Organization', NOW()) 
        RETURNING id INTO org_id;
    END IF;
    RETURN org_id;
END;
$$ LANGUAGE plpgsql;

-- Insert Vendor Categories
INSERT INTO vendor_categories (organization_id, name, code, description, required_licenses, required_insurance_types) VALUES
(get_sample_organization_id(), 'General Contractor', 'GENERAL_CONTRACTOR', 'General construction and repair services', ARRAY['Contractor License', 'Business License'], ARRAY['General Liability', 'Workers Compensation']),
(get_sample_organization_id(), 'Restoration Specialist', 'RESTORATION', 'Water, fire, and mold restoration services', ARRAY['IICRC Certification', 'Restoration License'], ARRAY['General Liability', 'Pollution Liability']),
(get_sample_organization_id(), 'Legal Professional', 'LEGAL', 'Attorneys and legal services', ARRAY['Bar Admission', 'Professional License'], ARRAY['Professional Liability', 'Errors & Omissions']),
(get_sample_organization_id(), 'Inspection Services', 'INSPECTION', 'Property and damage inspection services', ARRAY['Inspector License', 'Certification'], ARRAY['Professional Liability', 'General Liability']),
(get_sample_organization_id(), 'Engineering Consultant', 'ENGINEERING', 'Structural and engineering analysis', ARRAY['Professional Engineer License'], ARRAY['Professional Liability', 'General Liability']),
(get_sample_organization_id(), 'Medical Professional', 'MEDICAL', 'Medical evaluation and treatment services', ARRAY['Medical License', 'Board Certification'], ARRAY['Medical Malpractice', 'Professional Liability']),
(get_sample_organization_id(), 'Forensic Specialist', 'FORENSIC', 'Forensic investigation and analysis', ARRAY['Certification', 'Professional License'], ARRAY['Professional Liability', 'General Liability']),
(get_sample_organization_id(), 'Environmental Services', 'ENVIRONMENTAL', 'Environmental testing and remediation', ARRAY['Environmental License'], ARRAY['Pollution Liability', 'Professional Liability']);

-- Insert Vendor Specialties for each category
-- General Contractor Specialties
INSERT INTO vendor_specialties (organization_id, category_id, name, code, description, required_certifications) 
SELECT get_sample_organization_id(), vc.id, specialty_name, specialty_code, specialty_desc, specialty_certs
FROM vendor_categories vc,
(VALUES 
    ('Roofing', 'ROOFING', 'Residential and commercial roofing repairs and replacement', ARRAY['Roofing Certification']),
    ('Flooring', 'FLOORING', 'All types of flooring installation and repair', ARRAY['Flooring Certification']),
    ('Plumbing', 'PLUMBING', 'Plumbing repairs and installations', ARRAY['Plumbing License']),
    ('Electrical', 'ELECTRICAL', 'Electrical repairs and installations', ARRAY['Electrical License']),
    ('HVAC', 'HVAC', 'Heating, ventilation, and air conditioning services', ARRAY['HVAC License']),
    ('Drywall', 'DRYWALL', 'Drywall installation and repair', ARRAY[]::TEXT[]),
    ('Painting', 'PAINTING', 'Interior and exterior painting services', ARRAY[]::TEXT[]),
    ('Windows & Doors', 'WINDOWS_DOORS', 'Window and door installation and repair', ARRAY[]::TEXT[])
) AS specialties(specialty_name, specialty_code, specialty_desc, specialty_certs)
WHERE vc.code = 'GENERAL_CONTRACTOR';

-- Restoration Specialties
INSERT INTO vendor_specialties (organization_id, category_id, name, code, description, required_certifications) 
SELECT get_sample_organization_id(), vc.id, specialty_name, specialty_code, specialty_desc, specialty_certs
FROM vendor_categories vc,
(VALUES 
    ('Water Damage Restoration', 'WATER_RESTORATION', 'Water extraction, drying, and restoration services', ARRAY['IICRC WRT Certification']),
    ('Fire Damage Restoration', 'FIRE_RESTORATION', 'Fire and smoke damage restoration', ARRAY['IICRC FSRT Certification']),
    ('Mold Remediation', 'MOLD_REMEDIATION', 'Mold inspection, testing, and remediation', ARRAY['Mold Certification']),
    ('Biohazard Cleanup', 'BIOHAZARD', 'Biohazard and trauma scene cleanup', ARRAY['Biohazard Certification']),
    ('Contents Restoration', 'CONTENTS', 'Personal property cleaning and restoration', ARRAY['Contents Certification']),
    ('Structural Drying', 'STRUCTURAL_DRYING', 'Advanced structural drying techniques', ARRAY['IICRC ASD Certification'])
) AS specialties(specialty_name, specialty_code, specialty_desc, specialty_certs)
WHERE vc.code = 'RESTORATION';

-- Legal Specializations
INSERT INTO legal_specializations (organization_id, name, code, description, typical_case_types) VALUES
(get_sample_organization_id(), 'Insurance Law', 'INSURANCE_LAW', 'Specializes in insurance coverage disputes and bad faith claims', ARRAY['Coverage Disputes', 'Bad Faith Claims', 'Policy Interpretation']),
(get_sample_organization_id(), 'Property Law', 'PROPERTY_LAW', 'Real estate and property-related legal matters', ARRAY['Property Disputes', 'Real Estate Transactions', 'Easements']),
(get_sample_organization_id(), 'Personal Injury', 'PERSONAL_INJURY', 'Personal injury and tort law', ARRAY['Auto Accidents', 'Slip and Fall', 'Medical Malpractice']),
(get_sample_organization_id(), 'Construction Law', 'CONSTRUCTION_LAW', 'Construction contracts and disputes', ARRAY['Contract Disputes', 'Mechanic Liens', 'Construction Defects']),
(get_sample_organization_id(), 'Environmental Law', 'ENVIRONMENTAL_LAW', 'Environmental regulations and compliance', ARRAY['Environmental Compliance', 'Toxic Torts', 'Regulatory Issues']),
(get_sample_organization_id(), 'Business Litigation', 'BUSINESS_LITIGATION', 'Commercial and business litigation', ARRAY['Contract Disputes', 'Business Torts', 'Commercial Litigation']),
(get_sample_organization_id(), 'Products Liability', 'PRODUCTS_LIABILITY', 'Product defect and liability cases', ARRAY['Defective Products', 'Product Recalls', 'Manufacturing Defects']);

-- Referral Types
INSERT INTO referral_types (organization_id, name, code, description, commission_rate, tracking_requirements) VALUES
(get_sample_organization_id(), 'Social Media', 'SOCIAL_MEDIA', 'Referrals from social media platforms and online presence', 0.00, ARRAY['Platform', 'Post/Ad', 'Engagement Type']),
(get_sample_organization_id(), 'Vendor Referral', 'VENDOR_REFERRAL', 'Referrals from trusted vendor partners', 5.00, ARRAY['Vendor Name', 'Relationship Type', 'Service Category']),
(get_sample_organization_id(), 'Client Referral', 'CLIENT_REFERRAL', 'Referrals from existing or past clients', 2.50, ARRAY['Client Name', 'Relationship', 'Satisfaction Level']),
(get_sample_organization_id(), 'Individual Professional', 'INDIVIDUAL_PROFESSIONAL', 'Referrals from individual professionals', 7.50, ARRAY['Professional Name', 'Industry', 'Relationship Duration']),
(get_sample_organization_id(), 'Marketing Campaign', 'MARKETING_CAMPAIGN', 'Leads from specific marketing campaigns', 0.00, ARRAY['Campaign Name', 'Media Type', 'Budget Allocation']),
(get_sample_organization_id(), 'Website/SEO', 'WEBSITE_SEO', 'Organic website traffic and search engine results', 0.00, ARRAY['Search Terms', 'Landing Page', 'Traffic Source']),
(get_sample_organization_id(), 'Professional Organization', 'PROFESSIONAL_ORG', 'Referrals from professional associations', 3.00, ARRAY['Organization Name', 'Membership Type', 'Event/Meeting']),
(get_sample_organization_id(), 'Insurance Carrier', 'INSURANCE_CARRIER', 'Direct referrals from insurance companies', 0.00, ARRAY['Carrier Name', 'Adjuster Name', 'Preferred Vendor Status']);

-- Insert Service Areas (sample geographic areas)
INSERT INTO service_areas (organization_id, name, area_type, area_data) VALUES
(get_sample_organization_id(), 'Downtown Houston', 'city', '{"city": "Houston", "state": "TX", "neighborhoods": ["Downtown", "Midtown", "Museum District"]}'),
(get_sample_organization_id(), 'Harris County', 'county', '{"county": "Harris", "state": "TX", "major_cities": ["Houston", "Pasadena", "Baytown"]}'),
(get_sample_organization_id(), 'Greater Houston Metro', 'radius', '{"center": {"lat": 29.7604, "lng": -95.3698}, "radius_miles": 50}'),
(get_sample_organization_id(), 'Fort Bend County', 'county', '{"county": "Fort Bend", "state": "TX", "major_cities": ["Sugar Land", "Missouri City", "Stafford"]}'),
(get_sample_organization_id(), 'Montgomery County', 'county', '{"county": "Montgomery", "state": "TX", "major_cities": ["Conroe", "The Woodlands", "Spring"]}'),
(get_sample_organization_id(), 'Texas Statewide', 'state', '{"state": "TX", "coverage": "statewide", "notes": "Licensed for statewide operations"}');

-- Clean up the temporary function
DROP FUNCTION IF EXISTS get_sample_organization_id();;