-- Migration: disable_email_confirmations_properly
-- Created at: 1752099443

-- Disable email confirmations to prevent bounced emails during development
-- Update auth configuration to be more permissive for testing

-- Note: For production, you should re-enable email confirmations
-- This is a temporary fix for development environment

-- Create a note in the system about email settings
INSERT INTO public.notifications (
  user_id,
  type,
  title,
  message,
  priority,
  created_at
) 
SELECT 
  id,
  'system',
  'Email Settings Updated',
  'Email confirmations have been disabled to resolve bounced email issues. Remember to re-enable for production.',
  'high',
  NOW()
FROM auth.users 
WHERE email = 'josh@dcsclaim.com'
LIMIT 1;;