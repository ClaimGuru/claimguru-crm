# Claim Intake Wizard Enhancement Implementation Plan

## Issues Identified

### Phase 1: Layout & Auto-calculation Fixes ✅
- **Agent Contact Layout**: Phone field on separate line while email is in 3-column grid
- **Auto-expiration Date**: Already implemented correctly with `handleEffectiveDateChange` function

### Phase 2: Conditional Field Implementation ❌
- **Form Type "Other" Field**: Missing text input when "Other" is selected
- **Policy Type "Other" Field**: Missing text input when "Other" is selected

### Phase 3: Advanced Coverage Features ❌
- **Additional Coverage Limits**: Missing limit amount inputs and percentage/dollar toggles
- **Auto-calculation**: Missing calculation when percentage is selected

### Phase 4: Enhanced Deductibles System ❌
- **Deductible Type Switches**: Missing percentage/dollar toggles
- **Coverage Selection**: Missing coverage selection dropdown for percentages
- **Auto-calculation**: Missing percentage calculations based on coverage

### Phase 5: Alternative Dispute Resolution Enhancement ❌
- **Appraisal Fields**: Missing opposing appraiser, assigned appraiser, umpire fields
- **Arbitration/Mediation Fields**: Missing arbitrator and mediator fields
- **Litigation Field**: Missing assigned litigator/attorney field

### Phase 6: Critical Functionality Fixes ❌
- **Fix All Non-working Switches**: Using `onChange` instead of `onCheckedChange` for Radix UI Switch

## Implementation Order

1. **Phase 6 (Critical)**: Fix all switch functionality first
2. **Phase 1**: Fix agent contact layout
3. **Phase 2**: Implement conditional "Other" fields
4. **Phase 3**: Add coverage limits and calculations
5. **Phase 4**: Enhance deductibles system
6. **Phase 5**: Enhance dispute resolution fields

## Files to Modify

1. `PolicyInformationStep.tsx` - Main component with most fixes
2. Potential new utility functions for calculations

Let's begin implementation...
