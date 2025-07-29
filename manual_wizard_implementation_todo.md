# Manual Claim Intake Wizard - Complete Implementation Todo

**Based on:** Comprehensive revision specification + Testing findings  
**Date:** 2025-07-29  
**Current Status:** Partially implemented with critical blocking issues

## 🚨 CRITICAL FIXES REQUIRED (Blocking Current Functionality)

### ❌ **ISSUE #1: Broken Dropdown Menus**
- **Problem:** "Reason for Loss" and "Severity of Loss" dropdowns non-functional on Page 4
- **Impact:** Blocks completion of wizard
- **Fix Required:** Debug and repair dropdown component functionality

### ❌ **ISSUE #2: Missing Existing Client Workflow** 
- **Problem:** No option to select existing client, only creates new clients
- **Impact:** Cannot create claims for existing clients (major business requirement)
- **Fix Required:** Implement client selector as specified

### ❌ **ISSUE #3: Missing Form Validation**
- **Problem:** Required field validation messages don't display
- **Impact:** Poor user experience, no guidance on errors
- **Fix Required:** Implement proper validation feedback system

---

## 📋 COMPREHENSIVE IMPLEMENTATION CHECKLIST

### **UI/UX Standards Implementation**
- [ ] **Replace ALL checkbox inputs with toggle switches system-wide**
- [ ] **Remove all AI functionalities** (except explicitly mentioned)
- [ ] **Implement standardized address format** with Google predictive text
- [ ] **Implement standardized phone number format** with type selector and extensions
- [ ] **Enhanced UI aesthetics** for smoother, more intuitive experience
- [ ] **Remove redundant fields and buttons**

### **Backend Database Enhancement (Relational Rolodex)**
- [ ] **Create comprehensive relational database structure**
- [ ] **Individual tables for:** Vendors, Insurers, Insureds, Mortgage Lenders, Carrier Personnel
- [ ] **Relational links** to claims, carriers, companies
- [ ] **Multiple claim associations** support
- [ ] **Database flexibility** for record reuse across claims

---

## 📄 PAGE-BY-PAGE IMPLEMENTATION

### **PAGE 1: Client Information** ✅ Partially Implemented
**Current Status:** Basic implementation exists but missing key features

#### ❌ **Missing/Broken Features:**
- [ ] **Client Status Selector:** New (Default) vs Existing
- [ ] **Existing Client Selection:** Integration with client database
- [ ] **Enhanced Client Type Selector:** Individual/Residential vs Business/Commercial
- [ ] **Coinsured Relationship Field:** Missing relationship to primary insured
- [ ] **Standardized Phone Format:** Type selector, extensions, multiple numbers
- [ ] **Standardized Address Format:** Google predictive, proper field structure
- [ ] **Mailing Address Logic:** "Same as Loss Location" selector with conditional fields

#### ✅ **Working Features:**
- Basic client type selection
- Contact details entry
- Address fields (basic)
- Co-insured section

---

### **PAGE 2: Insurer Information** ✅ Partially Implemented  
**Current Status:** Basic implementation exists

#### ❌ **Missing/Broken Features:**
- [ ] **Enhanced Insurer Selection:** Integration with insurer database/rolodex
- [ ] **Multiple Personnel Management:** Add multiple insurer personnel
- [ ] **Vendor Specialty Logic:** If Personnel Type = Vendor, show specialty list
- [ ] **Professional Licenses:** Multiple licenses with type, number, state
- [ ] **Historical Notes System:** Track interactions and habits
- [ ] **Standardized Contact Format:** Phone number improvements

#### ✅ **Working Features:**
- Basic insurer selection
- Personnel information entry
- Form validation

---

### **PAGE 3: Policy Information** ✅ Partially Implemented
**Current Status:** Basic implementation exists

#### ❌ **Missing/Broken Features:**
- [ ] **Replace Forced Placed Policy checkbox with toggle switch**
- [ ] **Enhanced Agent & Agency Information:** License numbers
- [ ] **Auto-calculated Expiration Date:** Default to 1 year from effective, editable
- [ ] **Additional Coverages Section:** Detailed coverage options
- [ ] **Alternative Dispute Resolution Options:** Mediation, Arbitration, Appraisal, Litigation
- [ ] **Appraisal Type Selection:** Agreed (Bilateral) vs Demanded (Unilateral)

#### ✅ **Working Features:**
- Policy details entry
- Coverage information
- Date pickers

---

### **PAGE 4: Loss Information** ❌ CRITICAL ISSUES
**Current Status:** BROKEN - Blocking wizard completion

#### 🚨 **Critical Fixes Required:**
- [ ] **FIX BROKEN DROPDOWNS:** Reason for Loss, Severity of Loss
- [ ] **Implement proper dropdown functionality**
- [ ] **Add validation error messages**

#### ❌ **Missing Features:**
- [ ] **Enhanced Loss Details:** Reason, Cause, Date, Time, Severity
- [ ] **Loss Location Address:** Separate from client address if different
- [ ] **Room/Location Specification**
- [ ] **Weather-Related Logic:** Storm type selector, Hurricane/Tropical Storm names
- [ ] **Property Status Selectors:** ALL as toggle switches:
  - FEMA Declared Disaster
  - Police Called (with report number field)
  - Property Uninhabitable  
  - Damage to Other Structures
  - State of Emergency Declared
  - Emergency Mitigation/Repairs Required
  - Damaged Personal Property
  - Additional Living Expenses
  - Repairs Made
  - Vendors/Repairs Needed

---

### **PAGE 5: Mortgage Lender Information** ❌ NOT ACCESSIBLE
**Current Status:** Cannot test due to Page 4 blocking

#### ❌ **Required Implementation:**
- [ ] **Multiple Mortgage Lenders Support**
- [ ] **Lender Database Integration** 
- [ ] **Comprehensive Lender Information:**
  - Mortgage Lender Name, Type
  - Standardized Address Format
  - Contact Person Details
  - Standardized Phone Format
  - Loan Number, Monthly Payments, Outstanding Payments

---

### **PAGE 6: Referral Source Information** ❌ NOT ACCESSIBLE  
**Current Status:** Cannot test due to Page 4 blocking

#### ❌ **Required Implementation:**
- [ ] **Referral Type Selection:** Social Media, Vendor, Client, Individual, etc.
- [ ] **Conditional Logic:** If Vendor/Client/Individual selected, show contact details
- [ ] **Referral Source Details:**
  - Name, Relationship, Referral Date
  - Website, Phone, Email
  - Additional Notes
- [ ] **Remove commission rate field** (as specified)

---

### **PAGE 7: Building Information** ❌ NOT ACCESSIBLE
**Current Status:** Cannot test due to Page 4 blocking

#### ❌ **Required Implementation:**
- [ ] **Building Characteristics:** Type, Construction Type, Year Built
- [ ] **Physical Details:** Square Footage, Number of Stories  
- [ ] **Roof Information:** Type, Age
- [ ] **Foundation & Exterior:** Foundation Type, Exterior Walls
- [ ] **Building Systems:** Heating, Plumbing, Electrical Types
- [ ] **Additional Features (Toggle Switches):**
  - Basement
  - Garage  
  - Spa
  - Detached Structures

---

### **PAGE 8: Office Tasks & Follow-ups** ❌ NOT ACCESSIBLE
**Current Status:** Cannot test due to Page 4 blocking

#### ❌ **Required Implementation:**
- [ ] **Automatic Task Generation:** Based on claim type and data
- [ ] **Manual Task Addition:** Integration with standard task form
- [ ] **Task Management System:** Assignment, priorities, deadlines

---

### **PAGE 9: Intake Review & Completion** ❌ NOT ACCESSIBLE  
**Current Status:** Cannot test due to Page 4 blocking

#### ❌ **Required Implementation:**
- [ ] **Comprehensive Data Overview:** All entered information
- [ ] **"Do This Later" Option:** For Pages 7-11 completion
- [ ] **Contract Generation:** Generate intake documents and contracts
- [ ] **Data Validation:** Final validation before submission
- [ ] **Submission to Database:** Complete claim creation

---

## 🔧 TECHNICAL INFRASTRUCTURE NEEDED

### **Database Schema Enhancements**
- [ ] **Client Status Management:** New vs Existing client workflows
- [ ] **Relational Rolodex Tables:** Properly linked entity management
- [ ] **Data Persistence:** Improved wizard progress saving
- [ ] **Validation System:** Backend validation rules

### **Component Library Updates**  
- [ ] **Enhanced Dropdown Components:** Fix current broken dropdowns
- [ ] **Toggle Switch Replacement:** Replace all checkboxes
- [ ] **Standardized Address Component:** Google integration
- [ ] **Standardized Phone Component:** Type selector, extensions
- [ ] **Multi-entity Selectors:** For personnel, lenders, etc.

### **Workflow Management**
- [ ] **Client Selection Logic:** New vs existing client routing
- [ ] **Conditional Field Display:** Based on selections
- [ ] **Progress Tracking:** Enhanced save/restore functionality
- [ ] **Validation Framework:** Real-time validation with proper error messages

---

## 🎯 IMPLEMENTATION PRIORITY

### **PHASE 1: Critical Fixes (Immediate)**
1. Fix broken dropdown functionality on Page 4
2. Implement existing client selection workflow  
3. Add proper form validation messages
4. Replace all checkboxes with toggle switches

### **PHASE 2: Core Features (High Priority)**
1. Implement standardized address and phone components
2. Complete Page 4 loss information enhancements
3. Build relational database backend (Rolodex)
4. Implement Pages 5-9 functionality

### **PHASE 3: Advanced Features (Medium Priority)**  
1. Enhanced UI/UX improvements
2. Advanced validation and error handling
3. Contract generation system
4. Task management integration

### **PHASE 4: Polish & Testing (Final)**
1. Comprehensive end-to-end testing
2. Performance optimization
3. UI polish and accessibility
4. Documentation and user guides

---

## 📊 COMPLETION STATUS

- **Current Implementation:** ~30% complete
- **Critical Blocking Issues:** 3 major
- **Total Tasks Identified:** 60+ implementation items
- **Estimated Effort:** Significant development required

**RECOMMENDATION:** Focus on Phase 1 critical fixes first to unblock basic functionality, then proceed with comprehensive implementation.