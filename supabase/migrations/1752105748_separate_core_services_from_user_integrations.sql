-- Migration: separate_core_services_from_user_integrations
-- Created at: 1752105748

-- Add column to distinguish core platform services from user integrations
ALTER TABLE integration_providers ADD COLUMN is_core_service BOOLEAN DEFAULT FALSE;

-- Mark core platform services that should be backend-only
UPDATE integration_providers 
SET is_core_service = TRUE 
WHERE name IN ('SendGrid', 'Twilio', 'Anthropic Claude');

-- Keep Stripe for now as requested, but mark it for future consideration
UPDATE integration_providers 
SET is_core_service = FALSE 
WHERE name = 'Stripe';

-- Add comment to explain core services
COMMENT ON COLUMN integration_providers.is_core_service IS 'True for services that are platform infrastructure (SendGrid, Twilio, Claude), false for user-configurable integrations';;