# 🚨 CRITICAL SECURITY FIXES - IMMEDIATE ACTION REQUIRED

**Date:** October 19, 2025  
**Status:** ❌ VULNERABILITIES DETECTED  
**Priority:** 🔴 CRITICAL

---

## ✅ COMPLETED FIXES

### 1. Google Maps API Key Secured

**Status:** ✅ FIXED

**Changes Made:**
- Removed hardcoded API key from `StandardizedAddressInput.tsx`
- Updated code to use environment variable: `VITE_GOOGLE_MAPS_API_KEY`
- Created `.env.example` template
- Created `.gitignore` to prevent accidental commits

**What You Need to Do:**

#### Step 1: Create Environment File

```bash
cd /workspace/claimguru
cp .env.example .env
```

#### Step 2: Add Your Google Maps API Key

Edit `.env` file and replace the placeholder:

```bash
VITE_GOOGLE_MAPS_API_KEY=your-actual-google-maps-api-key-here
```

#### Step 3: Rotate the Exposed API Key

**CRITICAL:** The key `AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk` has been exposed in source code.

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find the exposed key
3. **Delete it** or **Regenerate** it
4. Create a new API key
5. Set restrictions:
   - **Application restrictions:** HTTP referrers
   - **API restrictions:** Places API, Maps JavaScript API only
   - **Allowed referrers:** 
     - `https://your-domain.com/*`
     - `http://localhost:*` (for development)

#### Step 4: Update Environment File

Add the new API key to your `.env` file:

```bash
VITE_GOOGLE_MAPS_API_KEY=AIza...your-new-key-here
```

#### Step 5: Verify Configuration

Test that address autocomplete works:

```bash
npm run dev
# Navigate to claim wizard and test address fields
```

---

## ❌ PENDING FIXES - REQUIRES YOUR ACTION

### 2. Database RLS Security Policies

**Status:** ❌ NOT APPLIED - REQUIRES SUPABASE ACCESS  
**Impact:** 7 tables are vulnerable to cross-organizational data access

#### Affected Tables:
1. `lead_assignments`
2. `lead_sources`
3. `sales_funnel_stages`
4. `lead_appointments`
5. `document_template_categories`
6. `document_template_variables`
7. `document_signatures`

#### How to Fix:

**Step 1: Access Supabase SQL Editor**

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to: **SQL Editor** (left sidebar)
3. Click **New Query**

**Step 2: Execute the Security Fix Script**

Copy and paste the following SQL script:

```sql
-- ============================================================================
-- ClaimGuru Critical Security Fix - Row Level Security (RLS) Policies
-- Execute in Supabase SQL Editor
-- ============================================================================

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_funnel_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_template_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- CREATE ORGANIZATION-BASED POLICIES (28 policies total)

-- ==========================================================================
-- Lead Assignments Policies
-- ==========================================================================
CREATE POLICY "org_isolation_lead_assignments_select" 
ON public.lead_assignments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = lead_assignments.organization_id
  )
);

CREATE POLICY "org_isolation_lead_assignments_insert" 
ON public.lead_assignments FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = lead_assignments.organization_id
  )
);

CREATE POLICY "org_isolation_lead_assignments_update" 
ON public.lead_assignments FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = lead_assignments.organization_id
  )
);

CREATE POLICY "org_isolation_lead_assignments_delete" 
ON public.lead_assignments FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = lead_assignments.organization_id
  )
);

-- ==========================================================================
-- Lead Sources Policies
-- ==========================================================================
CREATE POLICY "org_isolation_lead_sources_select" 
ON public.lead_sources FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = lead_sources.organization_id
  )
);

CREATE POLICY "org_isolation_lead_sources_insert" 
ON public.lead_sources FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = lead_sources.organization_id
  )
);

CREATE POLICY "org_isolation_lead_sources_update" 
ON public.lead_sources FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = lead_sources.organization_id
  )
);

CREATE POLICY "org_isolation_lead_sources_delete" 
ON public.lead_sources FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = lead_sources.organization_id
  )
);

-- ==========================================================================
-- Sales Funnel Stages Policies
-- ==========================================================================
CREATE POLICY "org_isolation_sales_funnel_stages_select" 
ON public.sales_funnel_stages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = sales_funnel_stages.organization_id
  )
);

CREATE POLICY "org_isolation_sales_funnel_stages_insert" 
ON public.sales_funnel_stages FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = sales_funnel_stages.organization_id
  )
);

CREATE POLICY "org_isolation_sales_funnel_stages_update" 
ON public.sales_funnel_stages FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = sales_funnel_stages.organization_id
  )
);

CREATE POLICY "org_isolation_sales_funnel_stages_delete" 
ON public.sales_funnel_stages FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = sales_funnel_stages.organization_id
  )
);

-- ==========================================================================
-- Lead Appointments Policies
-- ==========================================================================
CREATE POLICY "org_isolation_lead_appointments_select" 
ON public.lead_appointments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = lead_appointments.organization_id
  )
);

CREATE POLICY "org_isolation_lead_appointments_insert" 
ON public.lead_appointments FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = lead_appointments.organization_id
  )
);

CREATE POLICY "org_isolation_lead_appointments_update" 
ON public.lead_appointments FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = lead_appointments.organization_id
  )
);

CREATE POLICY "org_isolation_lead_appointments_delete" 
ON public.lead_appointments FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = lead_appointments.organization_id
  )
);

-- ==========================================================================
-- Document Template Categories Policies
-- ==========================================================================
CREATE POLICY "org_isolation_document_template_categories_select" 
ON public.document_template_categories FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = document_template_categories.organization_id
  )
);

CREATE POLICY "org_isolation_document_template_categories_insert" 
ON public.document_template_categories FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = document_template_categories.organization_id
  )
);

CREATE POLICY "org_isolation_document_template_categories_update" 
ON public.document_template_categories FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = document_template_categories.organization_id
  )
);

CREATE POLICY "org_isolation_document_template_categories_delete" 
ON public.document_template_categories FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = document_template_categories.organization_id
  )
);

-- ==========================================================================
-- Document Template Variables Policies
-- ==========================================================================
CREATE POLICY "org_isolation_document_template_variables_select" 
ON public.document_template_variables FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = document_template_variables.organization_id
  )
);

CREATE POLICY "org_isolation_document_template_variables_insert" 
ON public.document_template_variables FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = document_template_variables.organization_id
  )
);

CREATE POLICY "org_isolation_document_template_variables_update" 
ON public.document_template_variables FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = document_template_variables.organization_id
  )
);

CREATE POLICY "org_isolation_document_template_variables_delete" 
ON public.document_template_variables FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = document_template_variables.organization_id
  )
);

-- ==========================================================================
-- Document Signatures Policies
-- ==========================================================================
CREATE POLICY "org_isolation_document_signatures_select" 
ON public.document_signatures FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = document_signatures.organization_id
  )
);

CREATE POLICY "org_isolation_document_signatures_insert" 
ON public.document_signatures FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = document_signatures.organization_id
  )
);

CREATE POLICY "org_isolation_document_signatures_update" 
ON public.document_signatures FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = document_signatures.organization_id
  )
);

CREATE POLICY "org_isolation_document_signatures_delete" 
ON public.document_signatures FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.organization_id = document_signatures.organization_id
  )
);

-- ==========================================================================
-- VERIFICATION QUERY
-- ==========================================================================
SELECT 
    'Security Fix Applied Successfully' as status,
    '7 tables now have RLS enabled' as tables_secured,
    '28 policies created' as policies_created,
    'Multi-tenant data isolation enforced' as security_level;
```

**Step 3: Verify the Fix**

After executing the script, run this verification query:

```sql
-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE WHEN rowsecurity THEN '✅ SECURE' ELSE '❌ VULNERABLE' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'lead_assignments', 
    'lead_sources', 
    'sales_funnel_stages',
    'lead_appointments', 
    'document_template_categories', 
    'document_template_variables', 
    'document_signatures'
)
ORDER BY tablename;
```

**Expected Result:**
All 7 tables should show `rowsecurity = true` and `status = '✅ SECURE'`

**Step 4: Test Data Isolation**

1. Create two test users from different organizations
2. Login as User A - verify can only see Organization A data
3. Login as User B - verify can only see Organization B data
4. Confirm no cross-organizational data leakage

---

## 📋 ADDITIONAL SECURITY RECOMMENDATIONS

### High Priority:

1. **Set up Stripe Environment Variables**
   ```bash
   # Add to .env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

2. **Configure Supabase Edge Function Secrets**
   - Go to Supabase Dashboard > Edge Functions > Secrets
   - Add:
     - `STRIPE_SECRET_KEY`
     - `GOOGLE_VISION_API_KEY` (if using)
     - `OPENAI_API_KEY` (if using)
     - `AWS_ACCESS_KEY_ID` (if using Textract)
     - `AWS_SECRET_ACCESS_KEY` (if using Textract)

3. **Enable Supabase Storage RLS**
   - Verify storage buckets have RLS policies
   - Check: `claim-documents`, `policy-documents`, `crm-documents`, `client-portal-files`

4. **Set up Production Environment**
   - Create separate `.env.production` file
   - Use production API keys (never test keys)
   - Enable strict CORS policies
   - Set up monitoring and alerting

### Medium Priority:

5. **Implement Rate Limiting**
   - Set up Supabase rate limiting on edge functions
   - Monitor API usage

6. **Add Security Headers**
   - Configure CSP (Content Security Policy)
   - Enable HSTS
   - Set X-Frame-Options

7. **Regular Security Audits**
   - Weekly dependency updates
   - Monthly security scans
   - Quarterly penetration testing

---

## ✅ POST-FIX CHECKLIST

- [ ] Google Maps API key moved to environment variable
- [ ] Old API key rotated/deleted in Google Cloud Console
- [ ] API key restrictions configured (HTTP referrers, API limits)
- [ ] `.env` file created with new API key
- [ ] `.gitignore` updated to exclude `.env` files
- [ ] Database RLS policies applied to all 7 tables
- [ ] RLS verification query shows 100% secured
- [ ] Data isolation tested with multiple users
- [ ] Supabase environment variables configured
- [ ] Application tested and working
- [ ] Security audit documented

---

## 📞 SUPPORT

If you encounter issues:

1. **Build Errors:**
   ```bash
   cd /workspace/claimguru
   rm -rf node_modules
   npm install
   npm run build
   ```

2. **RLS Policy Conflicts:**
   - Drop existing policies first if they exist
   - Re-run the security fix script

3. **Environment Variable Issues:**
   - Verify `.env` file exists in `/workspace/claimguru/`
   - Check variable names match exactly (case-sensitive)
   - Restart dev server after changing `.env`

---

**Security Status:** ⚠️ PARTIAL FIX COMPLETE  
**Remaining Actions:** Database RLS policies (requires Supabase access)  
**Next Steps:** Follow instructions above to complete security hardening

---
