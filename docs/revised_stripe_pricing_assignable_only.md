# REVISED Stripe Pricing Strategy - Assignable Users Only Model

## 🎯 NEW BILLING LOGIC: Pay for Value-Generating Users Only

**KEY PRINCIPLE**: You only pay for **Assignable Users** (Public Adjusters who can have claims assigned). Support staff is included free with limits.

---

## 🔄 REVISED PRICING STRUCTURE

### **Individual Plan** - $99/month
**What's Included:**
- **1 Assignable User** (Public Adjuster) - can have claims assigned
- **1 Admin User** (free) - administrative support, cannot have claims assigned  
- **1TB storage**
- **Unlimited claims**
- **Basic client portal**
- **Email automations**

**Additional Assignable Users:** +$59/month
- Each additional Assignable User includes 1 free Admin User
- **Ratio Rule**: 1 Admin per 1 Assignable User (maximum)

---

### **Firm Plan** - $249/month  
**What's Included:**
- **3 Assignable Users** (Public Adjusters) - can have claims assigned
- **3 Admin Users** (free) - 1:1 ratio with Assignable Users
- **2 Office Staff** (free) - additional administrative roles
- **1 Sales User** (free) - lead management only
- **5TB storage** 
- **Advanced client portals**
- **Team collaboration tools**
- **API access**
- **Priority support**

**Additional Assignable Users:** +$59/month
- Each additional Assignable User includes 1 free Admin User
- **Ratio Rule**: 1 Admin per 1 Assignable User (maximum)
- Office Staff and Sales users remain at base levels

---

### **Enterprise Plan** - Custom Pricing
**What's Included:**
- **Custom number of Assignable Users**
- **Unlimited Admin, Office Staff, Sales users**
- **Unlimited storage**
- **Custom integrations**
- **Dedicated account manager**

---

## 👥 USER ROLE DEFINITIONS

### **Assignable User (Public Adjuster)** 💰 BILLABLE
- **Can have claims assigned** (revenue-generating capability)
- Full claim management, client communication, settlements
- **This is what customers pay for**

### **Admin User** 🆓 FREE (with limits)
- **Cannot have claims assigned** 
- Administrative support, document management, basic reporting
- **Included free**: 1 per Assignable User (1:1 ratio maximum)

### **Office Staff** 🆓 FREE (Firm+ only)
- Administrative tasks, scheduling, basic contact management
- **Included free**: 2 users in Firm plan

### **Sales User** 🆓 FREE (Firm+ only)  
- Lead management, pipeline tracking, sales reporting
- **Included free**: 1 user in Firm plan

---

## 📊 BILLING EXAMPLES

### Individual Plan Examples:
- **Baseline**: 1 Assignable + 1 Admin = $99/month
- **Expanded**: 2 Assignable + 2 Admin = $99 + $59 = $158/month
- **Maximum**: 3 Assignable + 3 Admin = $99 + $118 = $217/month

### Firm Plan Examples:
- **Baseline**: 3 Assignable + 3 Admin + 2 Office + 1 Sales = $249/month
- **Expanded**: 5 Assignable + 5 Admin + 2 Office + 1 Sales = $249 + $118 = $367/month

---

## 🎯 BUSINESS LOGIC ADVANTAGES

1. **Value-Based Pricing**: Customers pay for revenue-generating capacity
2. **Support Staff Included**: Admin help comes free (encourages proper delegation)
3. **Clear Scaling**: Easy to understand - more adjusters = more revenue = higher cost
4. **Competitive Edge**: Support staff is a value-add, not a cost center

---

## 🔧 REVISED STRIPE PRODUCTS NEEDED

### **Product 1: Individual Plan** - $99/month
```
Professional plan for individual adjusters. Includes 1 Assignable User (Public Adjuster) + 1 Admin User + 1TB storage. Only Assignable Users can have claims assigned.
```

### **Product 2: Additional Assignable User** - $59/month  
```
Additional Assignable User (Public Adjuster) who can have claims assigned. Includes 1 free Admin User. Available for Individual and Firm plans.
```

### **Product 3: Firm Plan** - $249/month
```
Business plan for firms. Includes 3 Assignable Users (Public Adjusters) + 3 Admin Users + 2 Office Staff + 1 Sales User + 5TB storage. Advanced features included.
```

### **Product 4: Enterprise Consultation** - $0 one-time
```
Free consultation for custom Enterprise pricing with unlimited users and advanced features.
```

---

## ⚠️ IMPORTANT CHANGES FROM PREVIOUS VERSION

1. **Removed**: "Individual Additional User" and "Firm Additional User" products
2. **Added**: Single "Additional Assignable User" product (works for both tiers)
3. **Simplified**: Only charge for Assignable Users, support staff is free
4. **Clarified**: Ratio limits are enforced in app logic, not billing

This model is much more customer-friendly and aligns billing with value delivery!