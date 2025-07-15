-- Migration: add_final_missing_index
-- Created at: 1752589880

-- Add the final missing foreign key index
CREATE INDEX IF NOT EXISTS idx_claim_vendors_claim_id 
    ON public.claim_vendors(claim_id);

COMMENT ON INDEX idx_claim_vendors_claim_id IS 'Performance: Foreign key index for JOIN optimization';;