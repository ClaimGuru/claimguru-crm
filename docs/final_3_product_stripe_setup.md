# FINAL STRIPE SETUP - Streamlined 3 Products Only
## (Updated with +1TB per user & No Enterprise Product)

# 🎯 OVERVIEW: Create Only 3 Products in Stripe

**ENTERPRISE HANDLING**: You're right! Enterprise will be a **contact form** in your app, not a Stripe product. Custom pricing = custom contracts.

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
Additional Assignable User (Public Adjuster) who can have claims assigned. Includes 1 free Admin User + an additional 1TB storage. Available for Individual and Firm plans. Billed monthly per assignable user.
```

**Pricing:**
- Select: **Recurring**
- Amount: **59.00**
- Currency: **USD**
- Billing period: **Monthly**

---

## Product 3: Firm Plan

**✅ Steps:**
1. Click "Add product" one last time
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

# 💡 STORAGE SCALING MODEL

## Storage Per User Type:
- **Individual Plan**: 1TB base storage
- **Additional Assignable User**: +1TB per user (great value!)
- **Firm Plan**: 5TB base storage
- **Additional Assignable User (Firm)**: +1TB per additional user

## Storage Examples:
- **Individual + 2 Additional**: 1TB + 2TB = **3TB total**
- **Firm + 2 Additional**: 5TB + 2TB = **7TB total**

---

# 🎯 ENTERPRISE TIER HANDLING

## In Your App:
- **"Enterprise" Pricing Page**: Shows "Contact us for custom pricing"
- **Contact Form**: Captures lead information
- **Sales Process**: Manual consultation → Custom quote → Contract
- **No Stripe Product Needed**: Enterprise contracts are custom anyway

## Enterprise Page Copy:
```
"Enterprise Plan - Custom Pricing
Perfect for large firms with 10+ adjusters
• Unlimited users and storage
• Custom integrations and white-label options  
• Dedicated account manager
• SLA guarantees

Contact us for a consultation and custom quote."
```

---

# ✅ VERIFICATION CHECKLIST

After creating products, you should see:

- [x] **Individual Plan** - $99.00/month recurring
- [x] **Additional Assignable User** - $59.00/month recurring  
- [x] **Firm Plan** - $249.00/month recurring

**Total Products**: 3 (clean and simple!)

---

# 🔑 NEXT STEPS AFTER PRODUCT CREATION

## 1. Copy Your Product IDs
```
Individual Plan: prod_xxxxxxxxxxxxx
Additional Assignable User: prod_xxxxxxxxxxxxx  
Firm Plan: prod_xxxxxxxxxxxxx
```

## 2. Get Your API Keys
- **Publishable Key**: `pk_test_xxxxxxxxxxxxx`
- **Secret Key**: `sk_test_xxxxxxxxxxxxx`

## 3. App Features to Build
- **Subscription management** (Stripe integration)
- **User role enforcement** (Assignable vs Admin limits)
- **Storage tracking** (1TB per Assignable User)
- **Enterprise contact form** (lead capture)

---

# 🚀 BENEFITS OF THIS APPROACH

## Simplified Stripe Setup:
- ✅ **3 products only** (vs original 5)
- ✅ **Clear value proposition** (pay for revenue capacity)
- ✅ **Better storage scaling** (+1TB per adjuster)
- ✅ **Enterprise handled properly** (custom sales process)

## Customer Experience:
- 💰 **Transparent pricing** (only pay for adjusters)
- 📈 **Predictable scaling** (more adjusters = more storage + capacity)
- 🎯 **Enterprise path** (clear upgrade option)

**Time to create**: ~8 minutes
**Result**: Professional, scalable subscription system! 🎉