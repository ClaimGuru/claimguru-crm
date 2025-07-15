-- Migration: fix_function_search_path_security
-- Created at: 1752585513

-- Migration: fix_function_search_path_security
-- Created at: 1752603832
-- Fixes security warnings for functions with mutable search_path

-- Fix: consume_ai_tokens function
CREATE OR REPLACE FUNCTION consume_ai_tokens(
  org_id UUID,
  user_id UUID,
  tokens_needed INTEGER,
  feature_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  current_tokens INTEGER;
  subscription_record RECORD;
BEGIN
  -- Get current subscription
  SELECT * INTO subscription_record
  FROM organization_subscriptions 
  WHERE organization_id = org_id AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active subscription found';
  END IF;
  
  -- Check if enough tokens
  IF subscription_record.ai_tokens_current < tokens_needed THEN
    RETURN FALSE;
  END IF;
  
  -- Consume tokens
  UPDATE organization_subscriptions 
  SET ai_tokens_current = ai_tokens_current - tokens_needed,
      updated_at = NOW()
  WHERE organization_id = org_id;
  
  -- Record transaction
  INSERT INTO ai_token_transactions (
    organization_id, user_id, transaction_type, tokens_amount, 
    tokens_remaining, feature_used, cost_per_token
  ) VALUES (
    org_id, user_id, 'usage', -tokens_needed,
    subscription_record.ai_tokens_current - tokens_needed, feature_name, 0.00
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- Fix: reset_monthly_ai_tokens function
CREATE OR REPLACE FUNCTION reset_monthly_ai_tokens() RETURNS void AS $$
DECLARE
  sub_record RECORD;
BEGIN
  FOR sub_record IN 
    SELECT * FROM organization_subscriptions 
    WHERE status = 'active' 
    AND ai_tokens_last_reset < date_trunc('month', NOW())
  LOOP
    -- Reset tokens to monthly allocation
    UPDATE organization_subscriptions 
    SET ai_tokens_current = ai_tokens_monthly,
        ai_tokens_last_reset = NOW()
    WHERE id = sub_record.id;
    
    -- Record monthly allocation transaction
    INSERT INTO ai_token_transactions (
      organization_id, transaction_type, tokens_amount, 
      tokens_remaining, feature_used
    ) VALUES (
      sub_record.organization_id, 'monthly_allocation', sub_record.ai_tokens_monthly,
      sub_record.ai_tokens_monthly, 'monthly_reset'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- Fix: purchase_ai_tokens function
CREATE OR REPLACE FUNCTION purchase_ai_tokens(
  org_id UUID,
  user_id UUID,
  tokens_to_add INTEGER,
  cost_per_token DECIMAL DEFAULT 0.01
) RETURNS BOOLEAN AS $$
DECLARE
  total_cost DECIMAL;
BEGIN
  total_cost := tokens_to_add * cost_per_token;
  
  -- Add tokens to current balance
  UPDATE organization_subscriptions 
  SET ai_tokens_current = ai_tokens_current + tokens_to_add,
      updated_at = NOW()
  WHERE organization_id = org_id AND status = 'active';
  
  -- Record purchase transaction
  INSERT INTO ai_token_transactions (
    organization_id, user_id, transaction_type, tokens_amount, 
    tokens_remaining, cost_per_token, total_cost
  ) VALUES (
    org_id, user_id, 'purchase', tokens_to_add,
    (SELECT ai_tokens_current FROM organization_subscriptions WHERE organization_id = org_id),
    cost_per_token, total_cost
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- Fix: create_standard_claim_folders function
CREATE OR REPLACE FUNCTION create_standard_claim_folders(
    p_claim_id UUID,
    p_claim_number VARCHAR(50),
    p_organization_id UUID,
    p_created_by UUID
)
RETURNS VOID AS $$
DECLARE
    folder_names TEXT[] := ARRAY[
        'Insurer Docs',
        'Client Docs', 
        'Intake Docs',
        'Vendor Docs',
        'Company Docs'
    ];
    folder_categories TEXT[] := ARRAY[
        'insurer',
        'client',
        'intake', 
        'vendor',
        'company'
    ];
    i INTEGER;
BEGIN
    -- Create the standard folders
    FOR i IN 1..array_length(folder_names, 1) LOOP
        INSERT INTO document_folders (
            name,
            claim_id,
            folder_type,
            folder_category,
            is_editable,
            is_deletable,
            sort_order,
            created_by,
            organization_id
        ) VALUES (
            p_claim_number || ' - ' || folder_names[i],
            p_claim_id,
            'system',
            folder_categories[i],
            false, -- System folders are not editable
            false, -- System folders are not deletable
            i,
            p_created_by,
            p_organization_id
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- Fix: get_user_organization_id function
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM user_profiles
  WHERE id = auth.uid();
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- Add comments to document the security fixes
COMMENT ON FUNCTION consume_ai_tokens IS 'Consumes AI tokens from organization subscription. Fixed: Added SET search_path for security.';
COMMENT ON FUNCTION reset_monthly_ai_tokens IS 'Resets monthly AI tokens for active subscriptions. Fixed: Added SET search_path for security.';
COMMENT ON FUNCTION purchase_ai_tokens IS 'Purchases additional AI tokens for organization. Fixed: Added SET search_path for security.';
COMMENT ON FUNCTION create_standard_claim_folders IS 'Creates standard folder structure for new claims. Fixed: Added SET search_path for security.';
COMMENT ON FUNCTION get_user_organization_id IS 'Returns organization ID for current user. Fixed: Added SET search_path for security.';

-- Grant proper permissions to authenticated users
GRANT EXECUTE ON FUNCTION consume_ai_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION reset_monthly_ai_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION purchase_ai_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION create_standard_claim_folders TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_organization_id TO authenticated;;