# Stripe Setup Guide for Invoice Generation System

## Step-by-Step Instructions for Setting up Stripe

### Phase 1: Create Your Stripe Account

1. **Go to Stripe Website**
   - Visit [https://stripe.com](https://stripe.com)
   - Click "Start now" or "Sign up"

2. **Create Account**
   - Enter your email address
   - Create a strong password
   - Verify your email address

3. **Business Information**
   - Enter your legal business name
   - Select your business type (likely "Law Firm" or "Professional Services")
   - Enter your business address
   - Provide your tax ID (EIN for businesses, SSN for sole proprietors)

4. **Banking Information**
   - Add your business bank account for payouts
   - Verify bank account ownership (micro-deposits method)

### Phase 2: Get Your API Keys

1. **Access Dashboard**
   - Log into your Stripe Dashboard
   - Navigate to "Developers" in the left sidebar

2. **API Keys Section**
   - Click on "API keys"
   - You'll see two sets of keys:

3. **Test Keys (For Development)**
   - **Publishable key**: `pk_test_...` (safe to use in frontend)
   - **Secret key**: `sk_test_...` (keep secure, backend only)

4. **Live Keys (For Production)**
   - **Publishable key**: `pk_live_...` (safe to use in frontend)
   - **Secret key**: `sk_live_...` (keep secure, backend only)

5. **Copy Your Keys**
   - Start with TEST keys for development
   - Copy both the publishable and secret test keys
   - Store them securely (you'll need them for the system)

### Phase 3: Configure Stripe Settings

1. **Business Settings**
   - Go to "Settings" → "Business settings"
   - Complete your business profile
   - Add your business logo
   - Set your support contact information

2. **Payment Methods**
   - Go to "Settings" → "Payment methods"
   - Enable credit/debit cards (enabled by default)
   - Consider enabling ACH payments for larger invoices
   - Set up Apple Pay and Google Pay if desired

3. **Invoicing Settings**
   - Go to "Settings" → "Invoicing"
   - Set your default invoice footer
   - Configure payment terms (Net 30, Net 15, etc.)
   - Set up late fees if applicable

### Phase 4: Set Up Webhooks (Important for Payment Confirmations)

1. **Navigate to Webhooks**
   - Go to "Developers" → "Webhooks"
   - Click "Add endpoint"

2. **Configure Endpoint**
   - Endpoint URL: `https://your-supabase-project.supabase.co/functions/v1/stripe-webhook`
   - Select events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Get Webhook Secret**
   - After creating the webhook, copy the webhook signing secret
   - You'll need this to verify webhook authenticity

### Phase 5: Tax Configuration (Important for Legal Firms)

1. **Tax Settings**
   - Go to "Settings" → "Tax"
   - Enable automatic tax calculation if operating in multiple jurisdictions
   - Configure tax rates for your location

2. **Legal Compliance**
   - Ensure compliance with local tax laws
   - Consider consulting with your accountant about tax handling

### Phase 6: Security & Compliance

1. **Enable Two-Factor Authentication**
   - Go to "Settings" → "Team"
   - Enable 2FA for your account

2. **PCI Compliance**
   - Stripe handles PCI compliance automatically
   - No additional setup needed for basic card processing

3. **Data Protection**
   - Review Stripe's data handling policies
   - Ensure compliance with client confidentiality requirements

### What You'll Need for the Invoice System

**API Keys to Provide:**
```
STRIPE_PUBLISHABLE_KEY=pk_test_... (for frontend)
STRIPE_SECRET_KEY=sk_test_... (for backend)
STRIPE_WEBHOOK_SECRET=whsec_... (for webhook verification)
```

**Stripe Features We'll Use:**
- **Payment Intents**: For secure payment processing
- **Invoices**: For professional invoice generation
- **Webhooks**: For real-time payment confirmations
- **Customers**: For client management
- **Payment Methods**: For saved payment options

### Testing Your Setup

1. **Test Mode**
   - Always start in test mode
   - Use test credit card numbers provided by Stripe
   - Test card: `4242 4242 4242 4242` (Visa)

2. **Test Scenarios**
   - Successful payment
   - Declined payment
   - Payment with authentication required

### Going Live

1. **Account Verification**
   - Complete business verification process
   - Provide required documentation
   - Wait for approval (usually 1-2 business days)

2. **Switch to Live Keys**
   - Replace test keys with live keys
   - Update webhook endpoints to live mode
   - Test with small amounts first

### Legal Industry Specific Considerations

1. **Client Trust Accounts**
   - Stripe can handle IOLTA/trust account requirements
   - Consider separate accounts for different fund types

2. **Professional Compliance**
   - Ensure compliance with state bar requirements
   - Maintain proper records for ethical obligations

3. **Fee Transparency**
   - Clearly communicate processing fees to clients
   - Consider who absorbs the Stripe fees (firm vs. client)

### Stripe Fees (Current as of 2025)

- **Online payments**: 2.9% + 30¢ per transaction
- **ACH payments**: 0.8% (max $5) per transaction
- **Invoicing**: Same as online payments
- **International cards**: Additional 1% fee

### Support & Resources

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Support**: Available 24/7 via chat/email
- **Integration Testing**: Use Stripe CLI for advanced testing

---

## Next Steps

Once you have your Stripe account set up and API keys ready:

1. Provide the API keys when prompted during system setup
2. The system will automatically configure payment processing
3. Test the invoice generation and payment flow
4. Go live when ready to accept real payments

**Security Note**: Never share your secret keys publicly or commit them to version control. The system will securely store them as environment variables.