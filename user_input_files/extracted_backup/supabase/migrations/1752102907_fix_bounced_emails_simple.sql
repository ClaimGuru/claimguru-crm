-- Migration: fix_bounced_emails_simple
-- Created at: 1752102907

-- Auto-confirm all unconfirmed test accounts to stop bounce attempts
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL 
  AND (
    email LIKE '%test%' OR 
    email LIKE '%tester%' OR
    email LIKE '%crm%' OR
    email LIKE '%@minimax.com'
  );

-- Clean up any pending email flow states that might trigger more emails
DELETE FROM auth.flow_state 
WHERE auth_code_issued_at < NOW() - INTERVAL '1 hour';

-- Remove any pending one-time tokens for email verification to prevent more emails
DELETE FROM auth.one_time_tokens 
WHERE token_type IN ('confirmation_token', 'email_change_token_new', 'email_change_token_current')
  AND created_at < NOW() - INTERVAL '1 hour';;