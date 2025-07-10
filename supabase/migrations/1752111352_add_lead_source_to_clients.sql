-- Migration: add_lead_source_to_clients
-- Created at: 1752111352

-- Add lead source tracking to clients table
ALTER TABLE clients 
ADD COLUMN lead_source TEXT,
ADD COLUMN lead_source_details JSONB;;