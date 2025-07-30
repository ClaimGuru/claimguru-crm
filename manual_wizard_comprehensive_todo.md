# MANUAL CLAIM INTAKE WIZARD - COMPREHENSIVE IMPLEMENTATION TODO

## Current Status Analysis:
After reviewing the comprehensive revision requirements against the current implementation, here's what needs to be completed:

## ✅ COMPLETED ITEMS:
- Switch component created (switch.tsx)
- Some checkboxes replaced with switches in ManualClaimInformationStep.tsx and InsuredDetailsStep.tsx
- AI functionality removed from some components
- "Reason for Loss" field implemented as MultiTextArea
- Comprehensive "Cause of Loss" selector implemented
- AI Insights removed from sidebar and routes

## 🚧 INCOMPLETE/MISSING ITEMS:

### 1. GLOBAL UI/UX REQUIREMENTS
- [ ] **Replace ALL remaining checkboxes with toggle switches system-wide**
  - [ ] EnhancedClientDetailsStep.tsx (multiple checkboxes found)
  - [ ] ClientCreateEditModal.tsx
  - [ ] ClientPermissionModal.tsx
  - [ ] All other components with type="checkbox"
- [ ] **Remove ALL remaining AI functionalities**
  - [ ] Remove entire /components/ai/ folder
  - [ ] Remove AI-related services
  - [ ] Clean up AI imports and references
- [ ] **Implement standardized address format with Google predictive text**
  - [ ] Create/enhance StandardizedAddressInput component
  - [ ] Apply to all address fields across all wizard pages
- [ ] **Implement standardized phone number format**
  - [ ] Create/enhance StandardizedPhoneInput component
  - [ ] Apply phone mask: (***) ***-****
  - [ ] Add extension field and "Add Additional Phone Numbers" option

### 2. PAGE-SPECIFIC IMPLEMENTATIONS (9 PAGES)

#### Page 1: Client Information ⚠️ PARTIALLY IMPLEMENTED
**Current Status**: ClientInformationStep.tsx exists but needs verification against requirements
- [ ] **Client Status Selector**: New (Default) / Existing (with existing client selector)
- [ ] **Client Type Selector**: Individual/Residential vs Business/Commercial
  - [ ] Individual: First Name, Last Name
  - [ ] Business: Business Name, Point of Contact First/Last Name
- [ ] **Primary Email and Phone** (with standardized phone format)
- [ ] **Street Address and Mailing Address** (with standardized address format)
- [ ] **"Is Mailing Address Same as Loss Location?" selector**
- [ ] **Coinsured Section** with toggle switch
  - [ ] Coinsured details if True
  - [ ] Relationship to Primary Insured dropdown

#### Page 2: Insurer Information ⚠️ NEEDS REVIEW
**Current Status**: InsurerInformationStep.tsx needs verification
- [ ] **Insurer selector** from system OR add new insurer
- [ ] **Insurer Personnel Information** (multiple entries)
  - [ ] Department, Job Title, Personnel Type
  - [ ] Vendor Specialty (if Vendor selected)
  - [ ] Professional Licenses (multiple)
  - [ ] Notes with historical tracking

#### Page 3: Policy Information ⚠️ NEEDS REVIEW
**Current Status**: PolicyInformationStep.tsx needs verification
- [ ] **"Forced Placed Policy" toggle switch**
- [ ] **Insurance Agent & Agency Information**
- [ ] **Policy Details** with coverage information
- [ ] **Alternative Dispute Resolution Options**
  - [ ] Mediation, Arbitration, Appraisal, Litigation toggles
  - [ ] Appraisal sub-options: Agreed (Bilateral) / Demanded (Unilateral)

#### Page 4: Loss Information ⚠️ PARTIALLY IMPLEMENTED
**Current Status**: ClaimInformationStep.tsx has some implementation
- [ ] **Verify all required fields are present**
- [ ] **Loss Location Address and Room field**
- [ ] **Weather Related section** with proper conditional logic
- [ ] **All Property Status Selectors** as toggle switches (verify complete list)

#### Page 5: Mortgage Lender Information ❌ MISSING
**Current Status**: MortgageInformationStep.tsx may not exist or be incomplete
- [ ] **Create/implement comprehensive mortgage lender section**
- [ ] **Support for multiple mortgage lenders**
- [ ] **All required fields per specification**

#### Page 6: Referral Source Information ❌ NEEDS REVIEW
**Current Status**: ReferralInformationStep.tsx needs verification
- [ ] **Referral Type dropdown**
- [ ] **Conditional fields** based on referral type selection
- [ ] **All specified fields** for Vendor/Client/Individual selections

#### Page 7: Building Information ❌ NEEDS REVIEW
**Current Status**: BuildingConstructionStep.tsx needs verification
- [ ] **Building classification and details**
- [ ] **Roof information, foundation, building systems**
- [ ] **Additional Features** as toggle switches

#### Page 8: Office Tasks & Follow-ups ❌ NEEDS REVIEW
**Current Status**: OfficeTasksStep.tsx needs verification
- [ ] **List automatic tasks**
- [ ] **"Add Task" functionality** with standard task form

#### Page 9: Intake Review & Completion ❌ NEEDS REVIEW
**Current Status**: CompletionStep.tsx needs verification
- [ ] **Comprehensive overview** of all 8 pages
- [ ] **"Do This Later" selector** for Pages 7-11
- [ ] **Generate Contracts & Intake Documents** functionality

### 3. DATABASE & BACKEND REQUIREMENTS
- [ ] **Relational "Rolodex" system** - verify database supports multi-claim associations
- [ ] **Proper foreign key relationships** for all entities
- [ ] **Data persistence** and progress saving functionality

### 4. POST-CREATION FUNCTIONALITIES
- [ ] **Additional tabs** for future editing:
  - [ ] ALE (Additional Living Expenses) tab
  - [ ] PPI (Personal Property Inventory) tab
  - [ ] Other Structures tab
  - [ ] Repairs tab
  - [ ] Vendors tab

### 5. CODE CLEANUP & OPTIMIZATION
- [ ] **Remove redundant wizard implementations**
  - [ ] Keep only ComprehensiveManualIntakeWizard.tsx
  - [ ] Remove EnhancedAIClaimWizard.tsx, ManualIntakeWizard.tsx, etc.
- [ ] **Clean up duplicate UI components**
  - [ ] Consolidate Switch/switch implementations
  - [ ] Remove unused checkbox components
- [ ] **Remove archived versions** (40% file space savings)
- [ ] **Clean up AI-related imports and dead code**

## PRIORITY EXECUTION ORDER:
1. **Critical UI/UX fixes** (checkboxes to switches, remove AI)
2. **Standardized components** (address, phone)
3. **Page-by-page implementation** (1-9 in order)
4. **Database integration verification**
5. **Code cleanup and optimization**
6. **Testing and validation**

## ESTIMATED COMPLETION:
This represents a major development effort requiring systematic implementation of all 9 wizard pages plus infrastructure components.