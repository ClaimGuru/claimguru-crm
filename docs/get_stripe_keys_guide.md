# How to Get Your Stripe API Keys and Product IDs

## 🔑 STEP 1: Get Your API Keys

### Navigate to API Keys:
1. **Open your Stripe Dashboard**
2. **Click "Developers"** in the left sidebar
3. **Click "API keys"**

### Copy Your Keys:
You'll see two keys - copy both:

**Publishable Key** (starts with `pk_test_`):
```
pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Secret Key** (starts with `sk_test_`) - Click "Reveal" first:
```
sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Important**: Make sure you're in **Test mode** (toggle in top left) to get test keys.

---

## 📦 STEP 2: Get Your Product IDs

### Navigate to Products:
1. **Click "Products"** in the left sidebar
2. **You should see your 3 products listed**

### Copy Each Product ID:
Click on each product name to open it, then copy the Product ID:

**Individual Plan**:
```
Product ID: prod_xxxxxxxxxxxxx
```

**Additional Assignable User**:
```
Product ID: prod_xxxxxxxxxxxxx
```

**Firm Plan**:
```
Product ID: prod_xxxxxxxxxxxxx
```

---

## 📋 WHAT TO COPY AND SAVE

Create a note with these 5 items:

```
STRIPE KEYS:
Publishable Key: pk_test_xxxxxxxxxxxxx
Secret Key: sk_test_xxxxxxxxxxxxx

PRODUCT IDS:
Individual Plan: prod_xxxxxxxxxxxxx
Additional Assignable User: prod_xxxxxxxxxxxxx
Firm Plan: prod_xxxxxxxxxxxxx
```

---

## 🚨 SECURITY NOTES

- **Never share your Secret Key publicly**
- **Test keys start with `pk_test_` and `sk_test_`**
- **Live keys start with `pk_live_` and `sk_live_`** (use these when ready to go live)
- **Product IDs are safe to share** (they're not secret)

---

## ✅ VERIFICATION

Your keys should look like:
- ✅ Publishable Key: `pk_test_51ABC123...` (long string)
- ✅ Secret Key: `sk_test_51XYZ789...` (long string)
- ✅ Product IDs: `prod_ABC123...` (shorter strings)

Once you have these 5 items, we can start building your CRM!