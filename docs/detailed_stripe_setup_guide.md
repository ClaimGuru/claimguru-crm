# Complete Stripe Setup Guide for Beginners
*Detailed Step-by-Step Instructions for Legal Case Management Invoice System*

## 🎯 What You'll Accomplish
By the end of this guide, you'll have:
- A fully configured Stripe account for your legal practice
- API keys ready for the invoice system
- Payment processing capability for client invoices
- Professional business profile setup

---

## 📋 What You'll Need Before Starting

**Required Information:**
- Business email address (professional recommended)
- Legal business name (as registered)
- Business address
- Tax ID number (EIN for businesses, SSN for sole practitioners)
- Business bank account information
- Business phone number
- Website URL (if you have one)

**Documents You May Need:**
- Business license or registration
- Banking information (routing/account numbers)
- Articles of incorporation (for corporations)
- Operating agreement (for LLCs)

---

## 🔥 PHASE 1: Creating Your Stripe Account

### Step 1: Navigate to Stripe Website
1. **Open your web browser**
2. **Type**: `https://stripe.com` in the address bar
3. **Press Enter**
4. **Look for**: A blue "Start now" button (usually top-right corner)
5. **Click**: "Start now" button

### Step 2: Create Your Account
1. **You'll see a signup form with these fields:**
   - Email address
   - Full name
   - Password
   - Country

2. **Fill out each field:**
   - **Email**: Use your professional business email
   - **Full name**: Your full legal name
   - **Password**: Create a strong password (8+ characters, mix of letters/numbers/symbols)
   - **Country**: Select your country from dropdown

3. **Click**: The blue "Create account" button

4. **Check your email:**
   - Go to your email inbox
   - Look for email from "Stripe" with subject like "Verify your email"
   - Open the email
   - Click the "Verify email address" button/link

### Step 3: Initial Account Setup
After email verification, you'll be redirected to Stripe:

1. **Business Information Page:**
   - **Business name**: Enter your law firm's legal name
   - **Industry**: Select "Professional Services" or "Legal Services"
   - **Business type**: Choose:
     - "Individual/Sole proprietorship" (if solo practice)
     - "Company" (if LLC, Corp, etc.)

2. **Click**: "Continue" button

---

## 💼 PHASE 2: Business Profile Setup

### Step 4: Complete Business Details

**You'll see several sections to complete:**

#### A. Business Information
1. **Legal business name**: Your official registered business name
2. **Doing business as (DBA)**: If different from legal name
3. **Business website**: Your law firm website (optional)
4. **Business description**: Write: "Legal services and consultation"

#### B. Business Address
1. **Street address**: Your business address
2. **City**: Your city
3. **State/Province**: Select from dropdown
4. **ZIP/Postal code**: Your ZIP code
5. **Phone number**: Business phone number

#### C. Tax Information
1. **Tax ID type**: Choose:
   - "EIN" (Employer Identification Number) for businesses
   - "SSN" (Social Security Number) for sole proprietors
2. **Tax ID number**: Enter your EIN or SSN
3. **Tax ID name**: Should match your business registration

### Step 5: Personal Information (Required by Law)
Stripe needs this for verification and compliance:

1. **Personal details of business owner:**
   - Full legal name
   - Date of birth
   - Home address
   - SSN (last 4 digits initially)
   - Phone number

2. **Click**: "Continue" or "Save and continue"

---

## 🏦 PHASE 3: Banking Setup

### Step 6: Add Bank Account for Payouts

1. **You'll see "Bank account" or "Payouts" section**

2. **Enter banking information:**
   - **Account holder name**: Should match your business name
   - **Routing number**: Your bank's 9-digit routing number
   - **Account number**: Your business checking account number
   - **Account type**: Select "Checking" (recommended for businesses)

3. **Where to find banking info:**
   - Check your business checkbook (numbers at bottom)
   - Log into online banking
   - Call your bank
   - Look at bank statements

4. **Click**: "Add bank account" or "Continue"

### Step 7: Verify Bank Account
1. **Stripe will send micro-deposits** (small amounts like $0.32 and $0.45)
2. **Wait 1-2 business days** for deposits to appear
3. **Check your bank statement** for these small deposits
4. **Return to Stripe** and enter the exact amounts to verify

---

## 🔑 PHASE 4: Getting Your API Keys (Most Important!)

### Step 8: Navigate to Developer Section
1. **In your Stripe Dashboard**, look for left sidebar
2. **Click**: "Developers" (should see a code icon)
3. **Click**: "API keys" (under Developers section)

### Step 9: Understand Your Keys
You'll see a page with keys sections:

#### Test Keys (Start Here!)
- **Publishable key**: Starts with `pk_test_`
- **Secret key**: Starts with `sk_test_` (initially hidden)

#### Live Keys (Use Later!)
- **Publishable key**: Starts with `pk_live_`
- **Secret key**: Starts with `sk_live_` (initially hidden)

### Step 10: Copy Your Test Keys
**🚨 IMPORTANT: Start with TEST keys for development!**

1. **Copy Publishable Test Key:**
   - Find the key starting with `pk_test_`
   - Click the "Reveal" button if needed
   - Click the "Copy" button (or select all and copy)
   - Paste into a secure notepad/document

2. **Copy Secret Test Key:**
   - Find the key starting with `sk_test_`
   - Click "Reveal live key" button
   - **You'll see a warning popup** - click "Reveal key"
   - Copy the entire key (starts with `sk_test_`)
   - Paste into your secure document

**🔒 Security Note**: Never share your secret key publicly or put it in websites!

---

## ⚙️ PHASE 5: Configure Business Settings

### Step 11: Business Settings
1. **Go to**: Settings (gear icon in sidebar)
2. **Click**: "Business settings"

#### Complete These Sections:
1. **Public business information:**
   - Business name (for receipts/invoices)
   - Support email
   - Support phone number

2. **Customer-facing business name:**
   - How clients will see your business on statements
   - Usually your law firm name

3. **Business logo** (optional but recommended):
   - Click "Upload logo"
   - Choose a professional logo file
   - Recommended size: 512x512 pixels

### Step 12: Payment Settings
1. **Go to**: Settings → Payment methods
2. **Enable these payment types:**
   - ✅ Credit cards (enabled by default)
   - ✅ Debit cards (enabled by default)
   - ✅ ACH Direct Debit (good for large invoices - lower fees)
   - ✅ Apple Pay (convenient for clients)
   - ✅ Google Pay (convenient for clients)

### Step 13: Invoice Settings
1. **Go to**: Settings → Invoicing
2. **Configure:**
   - **Default payment terms**: "Net 30" (or your preference)
   - **Late fees**: Set if you charge late fees
   - **Invoice footer**: Add your business info/terms

---

## 🔗 PHASE 6: Webhook Setup (Important for System Integration)

### Step 14: Create Webhook Endpoint
1. **Go to**: Developers → Webhooks
2. **Click**: "Add endpoint" button
3. **For now, use a placeholder URL**: `https://placeholder.com/webhook`
   - (We'll update this later when your system is built)

4. **Select these events** (click each one):
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. **Click**: "Add endpoint"

6. **Copy the webhook signing secret:**
   - Click on your newly created webhook
   - Find "Signing secret"
   - Click "Reveal"
   - Copy the secret (starts with `whsec_`)
   - Save it with your other keys

---

## 💳 PHASE 7: Test Your Setup

### Step 15: Test Mode Verification
1. **Verify you're in test mode:**
   - Look for "Test mode" toggle in top-right
   - Should show "Test mode" with an orange indicator

2. **Test with Stripe's test cards:**
   - **Successful payment**: 4242 4242 4242 4242
   - **Declined payment**: 4000 0000 0000 0002
   - **Requires authentication**: 4000 0025 0000 3155
   - **Any future expiry date** (like 12/25)
   - **Any 3-digit CVC** (like 123)

### Step 16: Create a Test Payment
1. **Go to**: Payments in your dashboard
2. **Look for**: Option to create test payment
3. **Try a small test** ($1.00) using test card: 4242 4242 4242 4242

---

## 📊 PHASE 8: Understanding Your Dashboard

### Key Sections to Know:
1. **Dashboard**: Overview of payments and activity
2. **Payments**: All payment transactions
3. **Customers**: Client information and payment methods
4. **Invoices**: Invoice management
5. **Settings**: All configuration options
6. **Developers**: API keys, webhooks, logs

---

## 💰 PHASE 9: Understanding Stripe Fees

### Current Stripe Fees (2025):
- **Online payments**: 2.9% + $0.30 per transaction
- **ACH payments**: 0.8% (max $5.00) per transaction
- **International cards**: Additional 1% fee

### Fee Examples:
- **$100 invoice**: $3.20 fee (you receive $96.80)
- **$1,000 invoice**: $29.30 fee (you receive $970.70)
- **$1,000 ACH payment**: $8.00 fee (you receive $992.00)

---

## 🚀 PHASE 10: Going Live (When Ready)

### Step 17: Account Verification Process
**Before going live, Stripe will verify your business:**

1. **Documents you may need:**
   - Government-issued ID
   - Business license
   - Bank account verification
   - Articles of incorporation
   - Tax documents

2. **Verification timeline**: Usually 1-2 business days
3. **You'll receive email updates** about verification status

### Step 18: Switching to Live Mode
**Only after verification is complete:**

1. **Toggle "Test mode" OFF** (top-right corner)
2. **Copy your LIVE API keys** (same process as test keys)
3. **Update webhook endpoint** to your actual system URL
4. **Start with small test transactions**

---

## 📋 WHAT TO GIVE ME NEXT

### After completing this setup, provide me with:

```
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

**🔒 Security Reminders:**
- Only share these through the secure credential system I'll provide
- NEVER post these keys publicly
- Start with TEST keys first
- Switch to LIVE keys only after testing

---

## 🆘 Common Issues & Solutions

### Problem: Can't find API keys
**Solution**: Go to Developers → API keys in left sidebar

### Problem: Keys are hidden/redacted
**Solution**: Click "Reveal" button next to each key

### Problem: Bank verification taking too long
**Solution**: 
- Check business vs personal account
- Verify exact business name matches
- Contact your bank to confirm account details

### Problem: Account verification needed
**Solution**: 
- Check email for Stripe verification requests
- Provide requested documents promptly
- Contact Stripe support if stuck

### Problem: Webhook setup confusion
**Solution**: 
- Use placeholder URL for now
- We'll update it when building the system
- Just save the webhook secret

---

## 📞 Getting Help

### Stripe Support:
- **Chat**: Available 24/7 in dashboard
- **Email**: Available through dashboard
- **Phone**: Premium support available
- **Documentation**: https://stripe.com/docs

### Legal Industry Resources:
- Check with your state bar for payment processing guidelines
- Consider trust account regulations
- Review client communication requirements for fees

---

## ✅ Checklist: Confirm You Have These

Before proceeding with development:

- [ ] Stripe account created and verified
- [ ] Business information completed
- [ ] Bank account added (verification in progress)
- [ ] Test API keys copied and saved securely
- [ ] Webhook endpoint created (placeholder URL is fine)
- [ ] Webhook secret copied and saved
- [ ] Test payment processed successfully
- [ ] Understanding of Stripe fees and how they work

**Once you have all items checked, you're ready to provide the API keys and continue building the invoice system!**