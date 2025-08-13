-- Migration: add_enhanced_client_management_fields
-- Created at: 1755042615

-- Add columns for enhanced client management

-- Co-insured support
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS has_co_insured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS co_insured_first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS co_insured_last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS co_insured_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS co_insured_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS co_insured_relationship VARCHAR(100),
ADD COLUMN IF NOT EXISTS co_insured_address_same_as_primary BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS co_insured_address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS co_insured_address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS co_insured_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS co_insured_state VARCHAR(50),
ADD COLUMN IF NOT EXISTS co_insured_zip_code VARCHAR(20);

-- Emergency contact information
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS emergency_contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);

-- Enhanced contact preferences
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS communication_preferences JSONB;

-- Point of contact for business clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS point_of_contact_first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS point_of_contact_last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS point_of_contact_title VARCHAR(100),
ADD COLUMN IF NOT EXISTS point_of_contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS point_of_contact_phone VARCHAR(50);

-- Loss location address
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS loss_location_same_as_primary BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS loss_location_address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS loss_location_address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS loss_location_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS loss_location_state VARCHAR(50),
ADD COLUMN IF NOT EXISTS loss_location_zip_code VARCHAR(20);

-- Enhanced status tracking
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS client_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE;;