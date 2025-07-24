# Manual Claim Intake Wizard - Testing Plan & Code Analysis

## Overview
Since direct browser testing is blocked by technical issues, I've conducted a comprehensive code review of the manual claim intake system to provide you with a detailed testing strategy and analysis.

## System Architecture Analysis

### Access Points
The manual claim intake wizard can be accessed via:
1. **Claims Page Button**: "New Claim Intake" button (Zap icon)
2. **URL Routing**: Direct navigation to `/claims/new`
3. **State Management**: `showManualWizard` state controls visibility

### Key Components
- **ManualIntakeWizard.tsx**: Main wizard coordinator (13 steps)
- **StreamlinedManualWizard.tsx**: Simplified version for testing (2 steps)
- **Individual Step Components**: 13 specialized form steps

## Manual Intake Wizard Steps (13 Total)

### Required Steps
1. **Client Information** (`ManualClientDetailsStep`)
   - Individual vs Organization selection
   - Name, phone, email fields
   - Mailing address with Google Places autocomplete
   - Co-insured person support
   - Multiple phone numbers with primary designation

2. **Insurance Details** (`ManualInsuranceInfoStep`)
   - Policy information entry
   - Insurance carrier details
   - Agent information
   - Coverage amounts

3. **Claim Information** (`ManualClaimInformationStep`)
   - Reason for loss (dropdown)
   - Date and time of loss
   - Cause of loss selection
   - Damage description
   - Property status checkboxes

4. **Referral Information** (`ReferralInformationStep`)
   - Lead source tracking
   - Referral details

5. **Contract Information** (`ContractInformationStep`)
   - Fee structure
   - Contract terms

6. **Coverage Review** (`CoverageIssueReviewStep`)
   - Policy concerns review
   - Coverage analysis

7. **Review & Submit** (`CompletionStep`)
   - Final data review
   - Claim submission

### Optional Steps
8. **Property Details** (`PersonalPropertyStep`)
9. **Building Construction** (`BuildingConstructionStep`)
10. **Vendors & Experts** (`ExpertsProvidersStep`)
11. **Mortgage Information** (`MortgageInformationStep`)
12. **Personnel Assignment** (`PersonnelAssignmentStep`)
13. **Office Tasks** (`OfficeTasksStep`)

## Critical Testing Scenarios

### Scenario 1: New Client Claim Creation
**Test Flow:**
1. Click "New Claim Intake" button
2. Fill Client Information (new individual)
3. Complete Insurance Details
4. Enter Claim Information
5. Complete required steps
6. Submit and verify claim creation

**Key Validation Points:**
- Client data persistence
- Address autocomplete functionality
- Phone number formatting
- Email validation
- Required field enforcement

### Scenario 2: Existing Client Claim Creation
**Test Flow:**
1. Access manual intake wizard
2. Select existing client (if supported)
3. Pre-populate client data
4. Complete insurance and claim info
5. Submit claim

**Key Validation Points:**
- Client selection mechanism
- Data pre-population
- Relationship to existing client records

### Scenario 3: Organization/Business Claim
**Test Flow:**
1. Select "Organization" client type
2. Fill business name and details
3. Complete all required steps
4. Submit business claim

**Key Validation Points:**
- Organization vs Individual field differences
- Business-specific data collection
- Contact person information

### Scenario 4: Complex Claim with All Optional Steps
**Test Flow:**
1. Complete all 13 steps including optional ones
2. Test personnel assignment
3. Add property details
4. Include mortgage information
5. Submit comprehensive claim

**Key Validation Points:**
- Step navigation
- Data persistence across steps
- Optional step handling
- Complete data integration

## Data Flow Analysis

### Input Processing
```javascript
// Manual entry flag
manualEntry: true
dataSource: 'manual_input'
aiEnhanced: false
```

### Data Structure
The wizard uses a comprehensive data structure with nested objects:
- `clientDetails`: Personal/business information
- `mailingAddress`: Address components
- `policyDetails`: Insurance policy data
- `lossDetails`: Claim information
- `phoneNumbers`: Array of phone contacts

### Progress Management
- Local storage backup
- Step-by-step validation
- Auto-save functionality (simplified to prevent loops)
- Progress restoration

## Known Features & Enhancements

### Phone Number Management
- Multiple phone numbers per client
- Primary phone designation
- Extension support
- Automatic formatting (e.g., (555) 123-4567)

### Address Handling
- Google Places autocomplete integration
- Address component parsing
- Manual override capability

### Validation System
- Required field enforcement
- Step-by-step validation
- Progress tracking
- Error state management

## Potential Issues to Test

### Data Persistence
- **Issue**: Auto-save conflicts causing infinite loops
- **Test**: Verify data saves properly between steps
- **Solution**: Simplified save mechanism implemented

### Navigation Flow
- **Issue**: Step validation blocking progression
- **Test**: Try to proceed with incomplete required fields
- **Expected**: Validation errors should prevent advancement

### Client Management
- **Issue**: Integration with existing client system
- **Test**: Verify new vs existing client handling
- **Check**: Client creation in database

### Form Validation
- **Issue**: Field validation and error display
- **Test**: Submit forms with invalid data
- **Expected**: Clear error messages and field highlighting

## Browser Testing Alternative

Since browser testing is blocked, here's what you can manually test:

### Quick Access Test
1. Navigate to `https://4rc2ch8lgyrt.space.minimax.io`
2. Login to the system
3. Go to Claims page
4. Click "New Claim Intake" button

### Step-by-Step Manual Testing
1. **Client Information Step**:
   - Test individual vs organization toggle
   - Verify phone formatting
   - Check address autocomplete
   - Test co-insured functionality

2. **Insurance Step**:
   - Fill policy information
   - Test date pickers
   - Verify dropdown selections

3. **Claim Information**:
   - Test cause of loss dropdown
   - Verify date/time inputs
   - Check description text area

4. **Navigation**:
   - Test Next/Previous buttons
   - Verify progress bar updates
   - Check step completion status

5. **Final Submission**:
   - Complete all required steps
   - Submit claim
   - Verify database record creation

## Success Criteria

### Functional Requirements ✅
- All 13 steps render correctly
- Required field validation works
- Data persists between steps
- Claims are successfully created
- Client information is properly stored

### User Experience ✅
- Intuitive step navigation
- Clear progress indication
- Responsive form layouts
- Helpful error messages
- Smooth workflow progression

### Data Integrity ✅
- Consistent data structure
- Proper field validation
- Database record creation
- Audit trail maintenance

## Recommendations

1. **Priority Testing**: Focus on the 7 required steps first
2. **Data Validation**: Verify all form inputs properly validate
3. **Client Integration**: Test both new and existing client scenarios
4. **Error Handling**: Test edge cases and error conditions
5. **Mobile Responsiveness**: Test on different screen sizes

## Technical Notes

- The wizard uses React state management with local storage backup
- Form validation is implemented at both field and step levels  
- The system supports both individual and organization clients
- Data structure is shared between manual and AI wizards
- Progressive enhancement with optional step functionality

This comprehensive analysis provides the testing framework needed even without direct browser access. The manual intake system appears well-structured with proper validation and data flow mechanisms.
