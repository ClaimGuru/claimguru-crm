# FINAL STRIPE SETUP - Assignable Users Only Model
## (Updated: Only Pay for Revenue-Generating Users)

# 🎯 OVERVIEW: Create 4 Products in Stripe

**NEW BILLING MODEL**: You only charge for **Assignable Users** (Public Adjusters). Support staff is included free!

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
Professional plan for individual adjusters. Includes 1 Assignable User (Public Adjuster) + 1 Admin User + 1TB storage. Only Assignable Users can have claims assigned and generate revenue.
```

**Pricing:**
- Select: **Recurring**
- Amount: **99.00**
- Currency: **USD** 
- Billing period: **Monthly**

---

## Product 2: Additional Assignable User

**✅ Steps:**
1. Click "Add product" again
2. Copy the exact text below:

**Name:**
```
Additional Assignable User
```

**Description:**
```
Additional Assignable User (Public Adjuster) who can have claims assigned. Includes 1 free Admin User. Available for Individual and Firm plans. Billed monthly per assignable user.
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
Business plan for firms. Includes 3 Assignable Users (Public Adjusters) + 3 Admin Users + 2 Office Staff + 1 Sales User + 5TB storage. Advanced client portals, team collaboration, API access, and priority support.
```

**Pricing:**
- Select: **Recurring**
- Amount: **249.00**
- Currency: **USD**
- Billing period: **Monthly**

---

## Product 4: Enterprise Consultation

**✅ Steps:**
1. Click "Add product" one last time
2. Copy the exact text below:

**Name:**
```
Enterprise Consultation
```

**Description:**
```
Free consultation call to discuss custom Enterprise pricing and features. Includes unlimited users, custom integrations, dedicated account manager, and white-label options.
```

**Pricing:**
- Select: **One-off** (NOT Recurring!)
- Amount: **0.00**
- Currency: **USD**

---

# 💡 KEY BUSINESS MODEL ADVANTAGES

## What Customers Pay For:
- ✅ **Assignable Users** (Public Adjusters) - $99 base + $59 each additional
- ✅ **Revenue-generating capacity**

## What's Included FREE:
- 🆓 **Admin Users** (1 per Assignable User)
- 🆓 **Office Staff** (2 users in Firm plan)  
- 🆓 **Sales User** (1 user in Firm plan)
- 🆓 **Support and administrative roles**

## Billing Examples:
- **Individual with 2 Adjusters**: $99 + $59 = $158/month (includes 2 Admin free)
- **Firm with 5 Adjusters**: $249 + $118 = $367/month (includes 5 Admin + 2 Office + 1 Sales free)

---

# ✅ VERIFICATION CHECKLIST

After creating all products, you should see:

- [x] **Individual Plan** - $99.00/month recurring
- [x] **Additional Assignable User** - $59.00/month recurring  
- [x] **Firm Plan** - $249.00/month recurring
- [x] **Enterprise Consultation** - $0.00 one-time

**Total Products**: 4 (simplified from previous 5-product model)

---

# 🔑 NEXT STEPS AFTER PRODUCT CREATION

## 1. Copy Your Product IDs
```
Individual Plan: prod_xxxxxxxxxxxxx
Additional Assignable User: prod_xxxxxxxxxxxxx  
Firm Plan: prod_xxxxxxxxxxxxx
Enterprise Consultation: prod_xxxxxxxxxxxxx
```

## 2. Get Your API Keys
- **Publishable Key**: `pk_test_xxxxxxxxxxxxx`
- **Secret Key**: `sk_test_xxxxxxxxxxxxx`

## 3. App Logic Requirements
Your CRM needs to enforce these rules:
- **Ratio Limit**: Max 1 Admin per 1 Assignable User
- **Claim Assignment**: Only Assignable Users can have claims assigned
- **Free Users**: Admin, Office Staff, Sales don't count toward billing

---

# 🎯 COMPETITIVE POSITIONING

**Your Model vs ClaimTitan:**
- **ClaimTitan**: $99 + $99 per ANY additional user
- **Your Model**: $99 + $59 per ASSIGNABLE user (support staff free)
- **Advantage**: Much better value - customers get support team included!

**Customer Perspective:**
- "I pay for my revenue-generating adjusters"  
- "My admin team is included for free"
- "Clear, predictable scaling costs"

---

# 🚀 Ready to Create!

This simplified 4-product model is:
- ✅ **Customer-friendly** (support staff included)
- ✅ **Value-aligned** (pay for revenue capacity)  
- ✅ **Competitive** (better than $99/any user)
- ✅ **Scalable** (clear growth path)

**Time to create**: ~10 minutes
**Result**: Premium positioning with better value than competitors! 🎉