# ClaimGuru Stripe Integration Plan

## Current Status
- ✅ **ClaimGuru CRM is fully functional** at: https://nbqjn595pj3r.space.minimax.io
- ✅ **Stripe backend system is deployed** (tables, edge functions, webhook)
- ✅ **Stripe products created** in dashboard with our pricing model

## What We Already Have

### 1. Stripe Products in Dashboard (COMPLETED)
- Individual Plan: $99/month (1 assignable user + 1 admin)
- Firm Plan: $249/month (3 assignable users + 3 admins + 1 sales + 2 office staff)
- Additional User: $59/month (1 assignable user + 1 admin + 1TB storage)

### 2. Stripe Backend (COMPLETED)
- ✅ `stripe_plans` table created with our pricing data
- ✅ `stripe_subscriptions` table for tracking user subscriptions
- ✅ `create-subscription` edge function deployed
- ✅ `stripe-webhook` edge function deployed and configured
- ✅ Webhook endpoints configured in Stripe dashboard

### 3. Stripe API Keys (SECURED)
- ✅ STRIPE_PUBLISHABLE_KEY: pk_test_51QQS2yHDdygDf1Z4...
- ✅ STRIPE_SECRET_KEY: sk_test_51QQS2yHDdygDf1Z4...
- ✅ Product IDs for all three tiers

## What We Need to Add (WITHOUT touching existing code)

### Phase 1: Add Stripe Dependencies
- Add `@stripe/stripe-js` and `@stripe/react-stripe-js` to package.json
- Create separate Stripe configuration constants file

### Phase 2: Create Subscription Management Components
- **NEW**: `SubscriptionManager` component for billing page
- **NEW**: `PricingCards` component to display plans
- **NEW**: `BillingHistory` component for payment history
- **NEW**: `SubscriptionStatus` component for current plan display

### Phase 3: Add Billing Section to Existing Navigation
- Add "Billing" menu item to existing sidebar navigation
- Create new `/billing` route in existing router
- Add billing page to existing routing system

### Phase 4: User Role & Subscription Integration
- Create subscription context to check user's plan limits
- Add subscription status checks to existing user creation/assignment flows
- Display current plan limits in existing user management pages

### Phase 5: Enhanced User Experience
- Add subscription status to existing dashboard
- Show upgrade prompts when approaching limits
- Add billing notifications to existing notification system

## Implementation Strategy
1. **MINIMAL CHANGES** to existing codebase
2. **ADDITIVE APPROACH** - only add new files/components
3. **PRESERVE ALL EXISTING FUNCTIONALITY**
4. **USE EXISTING PATTERNS** from current codebase
5. **INTEGRATE WITH EXISTING NAVIGATION** and theming

## Files to Create (New Files Only)
- `src/lib/stripe.ts` - Stripe configuration
- `src/contexts/SubscriptionContext.tsx` - Subscription state management
- `src/components/billing/PricingCards.tsx` - Plan selection
- `src/components/billing/SubscriptionManager.tsx` - Main billing component
- `src/components/billing/BillingHistory.tsx` - Payment history
- `src/pages/Billing.tsx` - Billing page container

## Files to Modify (Minimal Changes)
- `src/App.tsx` - Add billing route
- `src/components/layout/Layout.tsx` - Add billing menu item
- `package.json` - Add Stripe dependencies

## Success Criteria
- ✅ All existing ClaimGuru functionality remains unchanged
- ✅ Users can view and manage their subscription
- ✅ Users can upgrade/downgrade plans
- ✅ Billing history is accessible
- ✅ User role limits are enforced based on subscription
- ✅ Seamless integration with existing UI/UX
