# COMPLETE STRIPE SETUP GUIDE - Everything You Need
## (Final Version with Competitive Storage)

# 🎯 OVERVIEW: Create 5 Products in Stripe

You'll create exactly **5 products** in your Stripe dashboard. Here's everything to copy/paste:

---

# 📋 COPY-PASTE TEXT FOR EACH PRODUCT

## Product 1: Individual Plan

**✅ Steps:**
1. Stripe Dashboard → Products → "Add product"
2. Copy the exact text below:

**Name:**
```
Individual Plan
```

**Description:**
```
Professional plan for individual adjusters with 2 users included (1 Assigned Public Adjuster + 1 Admin Staff). Includes unlimited claims, basic client portal, email automations, and 1TB storage.
```

**Pricing:**
- Select: **Recurring**
- Amount: **99.00**
- Currency: **USD** 
- Billing period: **Monthly**

---

## Product 2: Individual Additional User

**✅ Steps:**
1. Click "Add product" again
2. Copy the exact text below:

**Name:**
```
Individual Additional User
```

**Description:**
```
Additional admin user for Individual plan. Maximum 1 additional user allowed. Admin role only - cannot have claims assigned. Billed monthly per additional user.
```

**Pricing:**
- Select: **Recurring**
- Amount: **59.00**
- Currency: **USD**
- Billing period: **Monthly**

---

## Product 3: Firm Plan

**✅ Steps:**
1. Click "Add product" again
2. Copy the exact text below:

**Name:**
```
Firm Plan
```

**Description:**
```
Business plan for firms with 7 users included (3 Assigned Public Adjusters + 3 Admin Staff + 1 Sales User). Includes advanced client portals, team collaboration, API access, priority support, and 5TB storage.
```

**Pricing:**
- Select: **Recurring**
- Amount: **249.00**
- Currency: **USD**
- Billing period: **Monthly**

---

## Product 4: Firm Additional User

**✅ Steps:**
1. Click "Add product" again
2. Copy the exact text below:

**Name:**
```
Firm Additional User
```

**Description:**
```
Additional user for Firm plan. Unlimited users allowed. Can be any role type: Assigned Public Adjuster, Admin Staff, or Sales User. Billed monthly per additional user.
```

**Pricing:**
- Select: **Recurring**
- Amount: **59.00**
- Currency: **USD**
- Billing period: **Monthly**

---

## Product 5: Enterprise Consultation

**✅ Steps:**
1. Click "Add product" one last time
2. Copy the exact text below:

**Name:**
```
Enterprise Consultation
```

**Description:**
```
Free consultation call to discuss custom Enterprise pricing and features. Includes custom integrations, dedicated account manager, white-label options, and SLA guarantees.
```

**Pricing:**
- Select: **One-off** (NOT Recurring!)
- Amount: **0.00**
- Currency: **USD**

---

# ⚙️ STRIPE SETTINGS FOR ALL PRODUCTS

## What to Leave Blank/Default:
- **Image**: Leave blank for now
- **More options**: Leave collapsed
- **Usage type**: Licensed (default)
- **Billing scheme**: Per unit (default)
- **Transform usage**: Leave blank

---

# ✅ VERIFICATION CHECKLIST

After creating all products, you should see:

- [x] **Individual Plan** - $99.00/month recurring
- [x] **Individual Additional User** - $59.00/month recurring  
- [x] **Firm Plan** - $249.00/month recurring
- [x] **Firm Additional User** - $59.00/month recurring
- [x] **Enterprise Consultation** - $0.00 one-time

---

# 🔑 NEXT STEPS AFTER PRODUCT CREATION

## 1. Copy Your Product IDs
After each product is created, Stripe will show you a Product ID (starts with `prod_`). **Save these!** You'll need them for integration:

```
Individual Plan: prod_xxxxxxxxxxxxx
Individual Additional User: prod_xxxxxxxxxxxxx  
Firm Plan: prod_xxxxxxxxxxxxx
Firm Additional User: prod_xxxxxxxxxxxxx
Enterprise Consultation: prod_xxxxxxxxxxxxx
```

## 2. Get Your API Keys
- Go to Developers → API Keys
- Copy your **Publishable Key** (starts with `pk_test_`)
- Copy your **Secret Key** (starts with `sk_test_`)

## 3. Test Mode Verification
- Make sure you're in **Test Mode** (toggle in top left)
- All your products should show "TEST DATA" banner

---

# 🚀 COMPETITIVE ADVANTAGE SUMMARY

**Our Storage vs ClaimTitan:**
- **Individual**: 1TB (matches ClaimTitan exactly)
- **Firm**: 5TB (5x more than ClaimTitan's 1TB)
- **Price**: $99 + $59/user (beats ClaimTitan's $99 + $99/user)

**Result**: Better value proposition! 💪

---

# 🆘 TROUBLESHOOTING

**"Name is required" error:**
- Make sure Name field has text
- Try refreshing page and starting over

**Amount won't save:**
- Use period (.) not comma (,) for decimals
- Make sure currency is set to USD

**Can't find billing period:**
- Make sure "Recurring" is selected first
- "Monthly" should appear as option

**Product not showing up:**
- Refresh the Products page
- Check you're in the right mode (Test vs Live)

---

# 📞 Ready for Integration

Once all 5 products are created, you're ready to integrate with your CRM application! The next step will be connecting these Stripe products to your Supabase backend and building the subscription management system.

**Total Setup Time**: ~10-15 minutes
**Products to Create**: 5
**Result**: Professional subscription system ready for development! 🎉