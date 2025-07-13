# Advanced Claim Intake Wizard - Complete Specification

## Overview
A sophisticated multi-step wizard with AI-powered policy reading, dynamic form sections, and comprehensive data collection for insurance claims processing.

## Core Innovation: AI Policy Document Reading
**Step 1: Policy Upload & AI Processing**
- Upload policy document or declaration page
- AI reads and auto-populates applicable fields throughout entire wizard
- Distinguish between declaration page vs full policy
- Extract coverage details, deductibles, policy periods, proof of loss requirements

## Multi-Step Wizard Flow

### Step 1: Insured Details
**Client Type Selection:**
- Residential or Commercial dropdown
- Organization checkbox with dynamic fields:
  - Organization name
  - Point of contact details (name, address, phone, email, extension)

**Insured Information:**
- Title (Mr/Mrs/etc), First Name, Last Name
- Multiple phone numbers with types (main, cell, etc)
- Multiple email addresses
- Co-insured toggle with duplicate form structure

**Address Collection:**
- Google Places API integration for predictive text
- Property type selection (mobile home, single family dwelling, condominium, etc)
- Mailing address with individual field population
- Loss address (same as mailing checkbox, or separate form)
- Gate/dropbox code (conditional field)
- Tenant information (conditional)
- Uninsured party/property manager (conditional)

### Step 2: Insurance Information
**Insurance Carrier Management:**
- Select from existing carriers or add new
- Carriers saved in dedicated table with full contact details
- Policy details: number, forced placed, effective/expiration dates
- Policy category and type

**Intelligent Coverage System:**
- Dynamic coverage types (dwelling, other structures, personal property, loss of use)
- Sub-limits with aggregation options
- Add/remove coverage functionality
- Coverage limit amounts

**Advanced Deductible System:**
- Multiple deductible types (wind, storm, hail, all other perils)
- Percentage-based deductibles with automatic calculations
- Flat dollar amounts
- Coverage-specific percentage calculations
- Manual override capabilities
- Deductible applicability for specific loss

**Prior Payments:**
- Optional prior payments for each coverage
- Not required for intake completion

### Step 3: Claim Information
**Loss Details:**
- Reason for loss (supplement, new, denial, appraisal, loss consulting, expert witness)
- Date of loss with policy period validation
- Cause of loss and severity
- AI-assisted loss description writing
- FEMA claim selector
- Home habitability assessment
- Alternative living arrangements (hotel, cost tracking)
- State of emergency declaration
- Year built field
- Personal property damage assessment

**AI Features:**
- Loss description generation based on policy language
- Date validation with visual indicators
- Smart field population

### Step 4: Personal Property (Conditional)
**Dynamic Visibility:**
- Only shown if personal property damage selected
- Optional completion with later date option
- Portal link generation for insured

**Item Management:**
- Add items functionality
- Item details: name, quantity, serial number, damage description, item description
- Purchase information: date, amount
- Repair vs replace determination
- Photo upload per item
- Running total for Coverage C
- PDF generation in PPIF format

### Step 5: Other Structures (Conditional)
**Structure Assessment:**
- Damage assessment question
- Predefined item list (lawn furniture, fencing, garage, etc)
- Custom item option
- Description, quantity, photos
- Purchase date for non-building items
- Notes section

### Step 6: Mortgage Information
**Mortgage Company Management:**
- Select existing or add new mortgage companies
- Company details: name, phone, email, address
- Loan-specific: loan number, account number, notes
- Multiple mortgage support

### Step 7: Expert/Vendor Information
**Vendor Management:**
- Existing vendor hiring assessment
- Contractor type categorization (plumber, roofer, engineer, etc)
- Vendor assignment by ClaimGuru
- Automated notifications (email/SMS)
- Vendor portal access

**Repair Tracking:**
- Repair completion assessment
- Repair type categorization (tarping, remediation, mitigation, etc)
- Cost tracking and invoice upload
- Detailed repair descriptions

### Step 8: Estimating Information
**Estimator Assignment:**
- Estimator selection from system
- New estimator addition
- Complete contact details including EIN/Tax ID
- Automated notification system
- Portal access provision

### Step 9: Referral Information
**Referral Source Tracking:**
- How they found ClaimGuru
- Vendor/contact selection from system
- Future claim notifications
- Referring source acknowledgment system

### Step 10: Contract Information
**Contract Management:**
- Contract timeline tracking (sent date, signed date)
- First contact timestamp
- Fee structure selection (flat fee, percentage, time & expense)
- Combined with referral information

### Step 11: Company Personnel
**User Assignment:**
- Multiple role assignments (admin, adjusters, desk adjusters)
- Individual user selection
- Internal notes per assigned person
- Role-based access control

### Step 12: Office Tasks
**Task Management:**
- Task creation and assignment
- Due date and priority setting
- Task categorization
- Calendar integration

## Advanced System Features

### AI Integration Points
1. **Policy Document Reading:** Auto-population throughout wizard
2. **Loss Description Generation:** Policy language-based descriptions
3. **Requirement Detection:** Proof of loss, appraisal availability
4. **Date Validation:** Policy period compliance
5. **Field Population:** Smart form completion

### Dynamic Form Logic
- Conditional section visibility
- Auto-save on navigation
- Progress tracking with visual indicators
- Back/next navigation with form state preservation
- Real-time calculations (deductibles, coverage amounts)

### Integration Requirements
- Google Places API for address validation
- Email/SMS notification system
- PDF generation for PPIF
- Document upload and management
- Calendar integration for deadlines
- Portal access for external stakeholders

### Security & Access Control
- System administrator level
- Subscriber administrator level
- User role management (admin, staff, office managers, adjusters, apprentices)
- Claim-specific access control
- Portal access management for external parties

### Portal System
- Client portal for personal property input
- Vendor/contractor portal for document upload
- Estimator portal access
- Role-based document visibility
- Secure folder structure per stakeholder

### Business Rules
1. **Date Validation:** Loss date must fall within policy effective/expiration dates
2. **Proof of Loss:** Automatic calendar integration for due dates
3. **Appraisal Tracking:** Unilateral vs bilateral appraisal availability
4. **Notification System:** Automated stakeholder notifications on assignments
5. **Referral Tracking:** Cross-claim referral source acknowledgment

### Save & Continue Logic
- Auto-save on each step completion
- Return to incomplete wizards
- Multi-claim creation for same client
- Policy/location reuse options

This specification represents a comprehensive, AI-powered claim intake system that exceeds current market standards and provides significant competitive advantages through automation, intelligence, and user experience optimization.
