-- Migration: add_mailing_zip_column
-- Created at: 1753281585

ALTER TABLE clients ADD COLUMN IF NOT EXISTS mailing_zip VARCHAR(20);;