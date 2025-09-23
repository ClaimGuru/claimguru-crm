# Step-by-Step Guide: Creating Products in Stripe Dashboard

## Overview
You'll create 5 products total. Follow these instructions for each product in order.

---

## Product 1: Individual Plan

**Step 1:** Log into your Stripe Dashboard
**Step 2:** Navigate to Products → Click "Add product"
**Step 3:** Fill out the form:

### Basic Information
- **Name**: `Individual Plan`
- **Description**: `Professional plan for individual adjusters with 2 users included (1 Assigned Public Adjuster + 1 Admin Staff)`
- **Image**: Leave blank for now
- **More options**: Leave collapsed

### Pricing
- **Select**: `Recurring` (should be selected by default)
- **Amount**: `99.00`
- **Currency**: `USD`
- **Billing period**: `Monthly`

### More pricing options (click to expand)
- **Usage type**: `Licensed` (default)
- **Aggregate usage**: Leave as default
- **Billing scheme**: `Per unit` (default)
- **Transform usage**: Leave blank

**Step 4:** Click "Add product"

---

## Product 2: Individual Additional User

**Step 1:** Click "Add product" again
**Step 2:** Fill out the form:

### Basic Information
- **Name**: `Individual Additional User`
- **Description**: `Additional admin user for Individual plan (maximum 1 additional user, Admin role only)`
- **Image**: Leave blank
- **More options**: Leave collapsed

### Pricing
- **Select**: `Recurring`
- **Amount**: `59.00`
- **Currency**: `USD`
- **Billing period**: `Monthly`

**Step 3:** Click "Add product"

---

## Product 3: Firm Plan

**Step 1:** Click "Add product"
**Step 2:** Fill out the form:

### Basic Information
- **Name**: `Firm Plan`
- **Description**: `Business plan for firms with 7 users included (3 Assigned Public Adjusters + 3 Admin Staff + 1 Sales User)`
- **Image**: Leave blank
- **More options**: Leave collapsed

### Pricing
- **Select**: `Recurring`
- **Amount**: `249.00`
- **Currency**: `USD`
- **Billing period**: `Monthly`

**Step 3:** Click "Add product"

---

## Product 4: Firm Additional User

**Step 1:** Click "Add product"
**Step 2:** Fill out the form:

### Basic Information
- **Name**: `Firm Additional User`
- **Description**: `Additional user for Firm plan (unlimited users, any role type: Assigned Public Adjuster, Admin Staff, or Sales)`
- **Image**: Leave blank
- **More options**: Leave collapsed

### Pricing
- **Select**: `Recurring`
- **Amount**: `59.00`
- **Currency**: `USD`
- **Billing period**: `Monthly`

**Step 3:** Click "Add product"

---

## Product 5: Enterprise Consultation

**Step 1:** Click "Add product"
**Step 2:** Fill out the form:

### Basic Information
- **Name**: `Enterprise Consultation`
- **Description**: `Free consultation call to discuss custom Enterprise pricing and features`
- **Image**: Leave blank
- **More options**: Leave collapsed

### Pricing
- **Select**: `One-off`
- **Amount**: `0.00`
- **Currency**: `USD`

**Step 3:** Click "Add product"

---

## Verification Checklist

After creating all products, verify you have:

✅ **Individual Plan** - $99/month recurring  
✅ **Individual Additional User** - $59/month recurring  
✅ **Firm Plan** - $249/month recurring  
✅ **Firm Additional User** - $59/month recurring  
✅ **Enterprise Consultation** - $0 one-time  

## Next Steps After Product Creation

1. **Copy Product IDs**: You'll need these for your application integration
2. **Test Mode**: Make sure you're in test mode while setting up
3. **Webhooks**: Configure webhooks for subscription events
4. **API Keys**: Get your publishable and secret keys

## Important Notes

- **Free Tier**: We're not creating a Stripe product for the free tier since it has no billing
- **Enterprise Custom Pricing**: Handle Enterprise tier through consultation, then create custom invoices
- **Product Updates**: You can edit descriptions and add images later
- **Pricing Changes**: Create new prices rather than editing existing ones for existing customers

## Troubleshooting

**If you see "Name is required" error:**
- Make sure the Name field isn't empty
- Try refreshing the page and starting over

**If amounts don't save properly:**
- Make sure you're using period (.) not comma (,) for decimals
- Verify you selected the correct currency (USD)

**If billing period is missing:**
- Make sure "Recurring" is selected before setting the billing period
- Monthly should be the default option

Your products are now ready for integration into your CRM application!