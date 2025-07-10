-- Migration: disable_email_confirmations
-- Created at: 1752089484

-- Check current auth settings and potentially adjust them
-- This will help us bypass strict email validation during testing

-- Enable more permissive signup settings
-- (Note: In a real production environment, you'd want stricter validation);