-- Migration: disable_email_confirmations_final
-- Created at: 1752102882

-- Completely disable email confirmations and related bounce-causing features
UPDATE auth.config 
SET 
  enable_confirmations = false,
  enable_signup = true,
  email_confirm_url = null,
  enable_anonymous_sign_ins = true;

-- Update site settings to disable email confirmations
UPDATE auth.config SET
  site_url = 'https://tohj8ire05.space.minimax.io',
  jwt_exp = 3600,
  external_email_enabled = false,
  external_phone_enabled = false,
  enable_email_autoconfirm = true,
  email_double_confirm_url = null;

-- Clean up any pending email confirmations that might cause bounces
DELETE FROM auth.flow_state WHERE provider = 'email';

-- Auto-confirm all existing unconfirmed users to prevent future bounce attempts
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW()),
  email_change_confirm_status = 0
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;;