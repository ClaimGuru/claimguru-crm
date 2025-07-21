# ClaimGuru Manual Intake Wizard Fixes - To-Do List

## Priority Issues to Fix

### 1. Personnel Type Selection Issues ⚠️ HIGH PRIORITY
- [ ] Fix Personnel Type dropdown - not allowing selection of anything but vendor
- [ ] Implement Vendor Specialty conditional visibility logic:
  - [ ] Show "Vendor Specialty (if applicable)" only when vendor is selected
  - [ ] Hide when vendor is unselected
  - [ ] Proper show/hide toggling

### 2. Alternative Living Arrangements (ALE) ⚠️ HIGH PRIORITY
- [ ] Add ability to add multiple ALE entries
- [ ] Add Loss of Rent question for rental properties
- [ ] Add Loss of Use question
- [ ] Add "How many months for rent to date" field
- [ ] Current Living Situation options:
  - [ ] Hotel
  - [ ] Monthly Living Cost ($) - dollar input

### 3. Input Field Validation ⚠️ HIGH PRIORITY
- [ ] Fix Original Value to accept dollar values only
- [ ] Ensure proper currency formatting

### 4. Personal Property Section Enhancement 🔄 MEDIUM PRIORITY
- [ ] Implement AI research capabilities for items
- [ ] Add photo search functionality for items
- [ ] Create running tally system
- [ ] Develop personal property inventory form generator
- [ ] Note: This should be available AFTER claim creation

### 5. Form Cleanup ⚠️ HIGH PRIORITY
- [ ] Remove duplicate "Year Built" field
- [ ] Keep only the one in construction type section
- [ ] Clean up redundant fields

### 6. AI Provider Recommendations 🔄 MEDIUM PRIORITY
- [ ] Pull vendors from system hierarchy:
  - [ ] User's vendors (highest priority)
  - [ ] Subscriber vendors
  - [ ] Local search results (lowest priority)
- [ ] Label vendor sources appropriately

### 7. Address Auto-population ⚠️ HIGH PRIORITY
- [ ] Fix Mortgage Lender address auto-population
- [ ] Ensure Google Places integration works properly

### 8. Referral Information System ⚠️ HIGH PRIORITY
- [ ] Fix Referral Information form functionality
- [ ] Ensure all referral fields work correctly:
  - [ ] Referral Type
  - [ ] Business/Company fields
  - [ ] Referral Source Name
  - [ ] Relationship/Channel
  - [ ] Contact Information
  - [ ] Commission Rate (%)
  - [ ] Additional Notes

### 9. Task Management Integration ⚠️ HIGH PRIORITY
- [ ] Fix Tasks functionality on the form
- [ ] Ensure task creation and management works

### 10. Claim Creation Process ⚠️ CRITICAL
- [ ] Fix "Create Claim" functionality - currently not working
- [ ] Ensure proper claim saving to database
- [ ] Verify all form data is captured correctly

### 11. Manual Intake Simplification ⚠️ HIGH PRIORITY
- [ ] Remove excessive AI features from Manual Intake
- [ ] Streamline the form for basic manual entry
- [ ] Keep only essential AI features that add value

## Technical Investigation Required

### Components to Review:
- [ ] `/src/components/claims/wizard-steps/InsurerPersonnelInformation.tsx`
- [ ] `/src/components/claims/wizard-steps/ManualInsuranceInfoStep.tsx`
- [ ] `/src/components/claims/ManualIntakeWizard.tsx`
- [ ] `/src/services/claimService.ts`
- [ ] `/src/hooks/useClaims.ts`

### Testing Priority:
1. Claim creation functionality (CRITICAL)
2. Form field validation and selection
3. Address auto-population
4. Referral information capture
5. Task management integration

## Implementation Plan

### Phase 1: Critical Fixes (Day 1)
- Fix claim creation process
- Fix personnel type selection
- Fix referral information form

### Phase 2: Form Functionality (Day 1-2)
- Fix address auto-population
- Fix task management
- Remove duplicate fields
- Fix input validation

### Phase 3: Enhanced Features (Day 2-3)
- Implement ALE enhancements
- Fix AI provider recommendations
- Streamline AI features

### Phase 4: Future Enhancements (Post-launch)
- Personal property AI research system
- Photo search functionality
- Advanced inventory management

## Status Tracking
- 🔴 Not Started
- 🟡 In Progress  
- 🟢 Completed
- ⚠️ Blocked/Issues Found
