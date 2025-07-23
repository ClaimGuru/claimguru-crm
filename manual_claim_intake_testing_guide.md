# ClaimGuru Manual Claim Intake - Complete Testing Guide

## Deployment Information
**Live Application URL**: https://4rc2ch8lgyrt.space.minimax.io

## Manual Testing Approach
Since browser automation is experiencing technical difficulties, this guide provides comprehensive manual testing instructions for the claim intake system.

## System Overview

### Two Intake Methods Available
1. **Manual Claim Intake** (Target for Testing)
   - Traditional form-based approach
   - Step-by-step wizard with 13 total steps (7 required, 6 optional)
   - No AI or PDF processing
   - Direct data entry by user

2. **AI-Enhanced Intake** (Not the focus)
   - PDF processing and AI extraction
   - Enhanced with document analysis
   - Automatic field population

## Access Instructions

### Getting to Manual Intake Wizard
1. **Navigate to**: https://4rc2ch8lgyrt.space.minimax.io
2. **Login** to the ClaimGuru system
3. **Go to Claims Page**: Click "Claims" in the main navigation
4. **Start Manual Intake**: Click the "New Claim Intake" button (⚡ Zap icon)
   - **Note**: There are TWO buttons - choose the regular "New Claim Intake", NOT the "AI-Enhanced Intake Wizard"

## Testing Scenarios

### 🎯 Priority Test 1: New Individual Client Claim

#### Step 1: Client Information
**What to Test:**
- [ ] Individual/Organization toggle (select "Individual")
- [ ] First Name field (required)
- [ ] Last Name field (required)  
- [ ] Phone number formatting (should auto-format as you type)
- [ ] Email validation
- [ ] Address autocomplete (should suggest addresses as you type)
- [ ] Co-insured person section (optional)

**Test Data:**
```
Client Type: Individual
First Name: John
Last Name: Doe
Phone: 5551234567 (should format to (555) 123-4567)
Email: john.doe@test.com
Address: 123 Main Street, Anytown, CA 90210
```

**Expected Results:**
- Phone number formats automatically
- Address autocomplete suggests real addresses
- Required field validation prevents proceeding without completion
- Data persists when navigating to next step

#### Step 2: Insurance Details
**What to Test:**
- [ ] Policy number entry
- [ ] Insurance company name
- [ ] Policy dates (effective/expiration)
- [ ] Agent information
- [ ] Coverage amounts

**Test Data:**
```
Policy Number: POL-123456789
Insurance Company: State Farm
Effective Date: 01/01/2024
Expiration Date: 01/01/2025
Agent Name: Jane Smith
Agent Phone: (555) 987-6543
Coverage A: $500,000
Deductible: $2,500
```

#### Step 3: Claim Information
**What to Test:**
- [ ] Reason for Loss dropdown
- [ ] Date of Loss (date picker)
- [ ] Time of Loss (time picker)
- [ ] Cause of Loss dropdown
- [ ] Claim severity selection
- [ ] Loss description (required text area)
- [ ] Estimated damages (number field)
- [ ] Property status checkboxes

**Test Data:**
```
Reason for Loss: New Claim
Date of Loss: 12/15/2024
Time of Loss: 14:30
Cause of Loss: Wind
Severity: Moderate
Description: "Storm damage to roof and siding during December windstorm. Multiple shingles missing, gutters damaged."
Estimated Damages: $25,000
```

#### Steps 4-7: Required Steps
Continue through:
- [ ] **Referral Information**: Enter how client found your services
- [ ] **Contract Information**: Fee structure and terms
- [ ] **Coverage Review**: Policy concerns and issues
- [ ] **Review & Submit**: Final review and submission

**Expected Result**: Claim successfully created and visible in Claims list

### 🎯 Priority Test 2: Organization/Business Client Claim

**Key Differences to Test:**
- [ ] Toggle to "Organization" mode
- [ ] Business Name field (instead of First/Last Name)
- [ ] Organization-specific contact fields
- [ ] Multiple contact persons

**Test Data:**
```
Client Type: Organization
Business Name: ABC Construction LLC
Primary Contact: Mike Johnson
Phone: (555) 123-9876
Email: mike@abcconstruction.com
```

### 🎯 Priority Test 3: Navigation and Data Persistence

**Navigation Tests:**
- [ ] **Next/Previous Buttons**: Verify they work properly
- [ ] **Progress Bar**: Updates correctly as you advance
- [ ] **Step Completion**: Green checkmarks appear for completed steps
- [ ] **Data Persistence**: Information saves when navigating between steps
- [ ] **Required Field Validation**: Cannot proceed without completing required fields

**Error Testing:**
- [ ] Try to advance without filling required fields
- [ ] Enter invalid email format
- [ ] Enter invalid phone number
- [ ] Submit with missing required information

### 🎯 Priority Test 4: Complete Workflow Testing

**Full 13-Step Test (Optional Steps):**
After completing the 7 required steps, test optional steps:
- [ ] **Property Details**: Add damaged items
- [ ] **Building Construction**: Building specifications
- [ ] **Vendors & Experts**: Assign contractors/experts
- [ ] **Mortgage Information**: Lender details
- [ ] **Personnel Assignment**: Team member assignments
- [ ] **Office Tasks**: Create follow-up tasks

## Validation Checkpoints

### Data Entry Validation
- [ ] **Phone Formatting**: (555) 123-4567 format applied automatically
- [ ] **Email Validation**: Invalid emails rejected
- [ ] **Date Validation**: Proper date format and reasonable dates
- [ ] **Number Validation**: Monetary fields accept proper formatting
- [ ] **Required Fields**: Red indicators or blocking navigation

### User Experience Validation
- [ ] **Loading States**: Appropriate loading indicators
- [ ] **Error Messages**: Clear, helpful error descriptions
- [ ] **Progress Indication**: Clear progress bar and step completion
- [ ] **Responsive Design**: Works on different screen sizes
- [ ] **Auto-Save**: Data persists if browser is refreshed

### Database Integration
- [ ] **Claim Creation**: New claim appears in Claims list
- [ ] **Client Creation**: New client appears in Clients section
- [ ] **Data Accuracy**: All entered information stored correctly
- [ ] **Unique Identifiers**: Proper claim numbers generated

## Expected Issues to Watch For

### Known Potential Problems
1. **Auto-Save Conflicts**: The system uses simplified saving to prevent infinite loops
2. **Address Autocomplete**: May require Google Maps API key for full functionality
3. **Step Validation**: Some validation might be overly strict or permissive
4. **Browser Compatibility**: Test in different browsers (Chrome, Firefox, Safari)

### Red Flags to Report
- [ ] **Data Loss**: Information disappears when navigating steps
- [ ] **Validation Errors**: Cannot proceed despite completing required fields
- [ ] **Submission Failures**: Wizard completes but claim isn't created
- [ ] **UI Breaks**: Layout problems or missing components
- [ ] **Performance Issues**: Slow loading or unresponsive interface

## Success Criteria

### Must-Have Functionality ✅
- [ ] Can create claims for new individual clients
- [ ] Can create claims for new organization clients  
- [ ] All required steps function properly
- [ ] Data validates appropriately
- [ ] Claims are successfully saved to database
- [ ] Navigation between steps works smoothly

### Nice-to-Have Functionality 🎯
- [ ] Optional steps function correctly
- [ ] Advanced features (multiple phone numbers, co-insured, etc.)
- [ ] Integration with existing client management
- [ ] Comprehensive error handling
- [ ] Mobile responsiveness

## Reporting Results

### For Each Test Scenario, Document:
1. **Steps Taken**: Exact sequence of actions
2. **Data Entered**: What information was input
3. **Expected vs Actual**: What should happen vs what actually happened
4. **Screenshots**: Capture key moments (successful completion, errors, etc.)
5. **Issues Found**: Any bugs, usability problems, or confusion points

### Key Metrics to Track:
- **Completion Time**: How long does the full process take?
- **Error Rate**: How often do validation errors occur?
- **Data Accuracy**: Is entered information properly stored?
- **User Experience**: Is the process intuitive and clear?

## Quick Smoke Test (5 Minutes)

If time is limited, perform this minimal test:
1. Open https://4rc2ch8lgyrt.space.minimax.io
2. Navigate to Claims → "New Claim Intake"
3. Fill out first 3 required steps with basic information
4. Verify data persists between steps
5. Submit claim and verify it appears in Claims list

This testing approach provides comprehensive coverage of the manual claim intake system without requiring browser automation tools.
