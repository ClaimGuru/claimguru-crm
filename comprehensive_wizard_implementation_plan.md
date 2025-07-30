# COMPREHENSIVE MANUAL CLAIM INTAKE WIZARD IMPLEMENTATION PLAN

## Objective: Complete implementation of 9-page Manual Claim Intake Wizard according to detailed user specifications with comprehensive database backend and standardized UI components.

---

## ✅ COMPLETED FOUNDATION WORK:
- **Critical Bug Fixes:** All blocking issues resolved ✅
- **Switch Components:** All checkboxes replaced with toggle switches ✅  
- **Basic Functionality:** Wizard builds and runs successfully ✅
- **Core Page 4 Fields:** Reason for Loss, Cause of Loss, Severity working ✅
- **Client Selection:** New/Existing client workflow operational ✅

---

## 📋 REMAINING IMPLEMENTATION PHASES:

### PHASE 1: STANDARDIZED UI COMPONENTS (2-3 hours)
**Build reusable, standardized components per specifications:**

#### Address Component Enhancement:
- ✅ **Current:** Basic `StandardizedAddressInput.tsx` exists
- 🔄 **Required:** Enhance with Google predictive text integration
- **Fields:** Street Address #1 (auto-populate), Street Address #2, City, State, Zip Code

#### Phone Number Component Enhancement:
- ✅ **Current:** Basic `StandardizedPhoneInput.tsx` exists  
- 🔄 **Required:** Full specification implementation
- **Features:** Type Selector (Mobile/Home/Work), Input Mask (***) ***-****, Extension Field, Add Multiple Numbers

#### Validation System Integration:
- ✅ **Current:** Advanced validation infrastructure exists (`WizardValidationService`, `ValidationSummary`)
- 🔄 **Required:** Integrate into main wizard with form error messages

#### Dropdown Components Fix:
- 🔄 **Required:** Fix remaining dropdown issues on Page 3 (Policy Information)

### PHASE 2: DATABASE INFRASTRUCTURE OVERHAUL (4-6 hours)
**Implement comprehensive "Rolodex" relational system:**

#### Database Audit & Enhancement:
- **Audit existing tables:** clients, claims, adjusters, policies, insurance_carriers, vendors
- **Verify field coverage** for all 9-page wizard requirements
- **Check relational integrity** and foreign key constraints

#### Relational "Rolodex" System Implementation:
- **Multi-claim associations:** Vendors, insurers, adjusters, lenders can link to multiple claims
- **Junction tables:** For many-to-many relationships  
- **Entity reuse logic:** Eliminate redundant data entry
- **Historical tracking:** Personnel interaction notes and profiles

#### Enhanced Entity Tables:
- **Clients:** Individual/Residential vs Business/Commercial support
- **Insurance Carriers:** Personnel management with roles, licenses, specialties
- **Policies:** Coverage, deductibles, alternative dispute resolution options
- **Mortgage Lenders:** Multiple lender support per claim
- **Referral Sources:** Comprehensive referral tracking
- **Properties:** Building and construction details
- **Tasks:** Office tasks and follow-ups system

### PHASE 3: PAGE-BY-PAGE DETAILED IMPLEMENTATION (8-12 hours)

#### Page 1: Client Information Enhancement
- ✅ **Current:** Basic structure exists with New/Existing selector
- 🔄 **Required Additions:**
  - Client Type logic: Individual/Residential vs Business/Commercial
  - Business fields: Business Name, Point of Contact
  - Standardized phone/address components integration
  - "Is Mailing Address Same as Loss Location?" selector
  - Coinsured information section with relationship dropdown

#### Page 2: Insurer Information Complete Rebuild  
- 🔄 **Required:** Complete implementation
  - Insurer selector from system database + "Add New" option
  - Multiple personnel management interface
  - Department, Job Title, Personnel Type fields
  - Vendor specialty conditional logic
  - Professional licenses (multiple entries)
  - Historical notes system

#### Page 3: Policy Information Enhancement
- ✅ **Current:** Basic policy fields exist
- 🔄 **Required Additions:**
  - "Forced Placed Policy" selector
  - Agent & Agency information section
  - Policy Type, Form Type (optional) dropdowns
  - Alternative Dispute Resolution options:
    - Mediation, Arbitration, Appraisal, Litigation checkboxes  
    - Appraisal type: Agreed (Bilateral) vs Demanded (Unilateral)
  - Auto-calculated expiration date (1 year from effective, editable)

#### Page 4: Loss Information Final Polish
- ✅ **Current:** Core fields working (Reason, Cause, Severity)
- 🔄 **Required Additions:**
  - Weather-related logic enhancement
  - Storm name selector with "Add New" option
  - Property Status toggle switches (FEMA, Police, etc.)
  - Police Report Number conditional field

#### Page 5: Mortgage Lender Information Implementation
- 🔄 **Required:** Complete new implementation
  - Multiple mortgage lenders interface
  - Standardized address/phone components
  - Loan details: Number, Monthly Payments, Outstanding Payments

#### Page 6: Referral Source Information Implementation  
- 🔄 **Required:** Complete new implementation
  - Referral Type selector with conditional logic
  - Vendor/Client/Individual selection triggers
  - Contact details with standardized components
  - Remove commission rate field

#### Page 7: Building Information Implementation
- ✅ **Current:** Basic structure exists (`BuildingConstructionStep.tsx`)
- 🔄 **Required:** Specification alignment
  - Building Type, Construction Type, Year Built
  - Roof Information (Type, Age)  
  - Foundation & Exterior details
  - Building Systems (Heating, Plumbing, Electrical)
  - Additional Features toggles

#### Page 8: Office Tasks & Follow-ups Enhancement
- ✅ **Current:** Basic task management exists  
- 🔄 **Required:** 
  - Automatic tasks generation
  - "Add Task" interface with standard task form
  - Task assignment and tracking

#### Page 9: Review & Completion Implementation
- ✅ **Current:** Basic completion step exists
- 🔄 **Required Additions:**
  - Comprehensive data overview
  - "Do This Later" selector for Pages 7-11
  - Contract generation integration
  - Final validation and submission

### PHASE 4: AI FUNCTIONALITY REMOVAL (1-2 hours)
**Complete removal of all AI features:**
- ✅ **Completed:** AI routes and navigation removed
- 🔄 **Verify:** Complete removal from all components and services
- **Exceptions:** Maintain where explicitly mentioned in specifications

### PHASE 5: TESTING & VALIDATION (2-3 hours)
**Comprehensive quality assurance:**
- End-to-end wizard testing (New + Existing client workflows)
- Database integration testing
- UI/UX refinement and responsiveness
- Form validation testing
- Performance optimization

### PHASE 6: POST-CREATION FUNCTIONALITY (2-3 hours)
**Implement future editing capabilities:**
- ALE (Additional Living Expenses) management
- PPI (Personal Property Inventory) management  
- Other Structures editing
- Repairs management
- Vendors assignment tabs

---

## 📊 IMPLEMENTATION TIMELINE:
- **Total Estimated Time:** 20-30 hours of development
- **Complexity Level:** High - Full-stack development with database design
- **Dependencies:** Google Maps API for address autocomplete
- **Testing Requirements:** Comprehensive validation across all workflows

---

## 🎯 SUCCESS CRITERIA:
1. **Functional 9-page wizard** matching all specifications
2. **Comprehensive database backend** supporting relational "Rolodex" system
3. **Standardized UI components** for addresses and phone numbers
4. **Complete data validation** with user-friendly error messages
5. **New & Existing client workflows** fully operational
6. **Zero AI functionality** (except where explicitly mentioned)
7. **Professional UI/UX** with smooth, intuitive experience

---

## 📋 DELIVERABLES:
1. **Fully functional 9-page Manual Claim Intake Wizard**
2. **Enhanced database schema** with migration scripts
3. **Standardized reusable UI components**
4. **Comprehensive validation system**
5. **Testing documentation** and user guides
6. **Deployment-ready application**

---

## ⚠️ CRITICAL DEPENDENCIES:
- **Google Maps API** integration for address autocomplete
- **Database migration** compatibility with existing data
- **Supabase backend** for all data operations and relationships

