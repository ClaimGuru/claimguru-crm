# COMPREHENSIVE MANUAL CLAIM INTAKE WIZARD - COMPLETE IMPLEMENTATION TODO

## Objective: Implement the complete 9-page manual claim intake wizard exactly according to the detailed specification provided, ensuring every requirement is met.

## Current Status Analysis:
- **Existing Implementation:** ~30% complete (Pages 1-3 partially working)
- **Critical Blocking Issues:** Multiple broken components preventing basic functionality
- **Missing Features:** 80+ implementation items identified from detailed specification
- **User Testing Results:** Cannot complete wizard due to broken dropdowns and missing functionality

---

## STEPs:

### [ ] STEP 1: Critical Bug Fixes & UI/UX Foundation (URGENT) -> System STEP
**Fix all blocking issues and establish UI/UX foundation:**

**Critical Bug Fixes:**
- Fix broken "Reason for Loss" field on Page 4 - **CHANGE TO MULTI-TEXT FIELD**
- Fix broken "Cause of Loss" field on Page 4 - **CHANGE TO COMPREHENSIVE SELECTOR** with all property and casualty loss causes
- Fix broken "Severity of Loss" dropdown on Page 4
- Implement existing client selection workflow (currently only supports new clients)
- Add proper form validation error messages

**UI/UX Foundation Requirements:**
- **MANDATORY:** Replace ALL checkbox inputs with toggle switches system-wide
- Enhance UI aesthetics for smoother, more intuitive experience
- Remove ALL AI functionalities except where explicitly mentioned
- Remove all redundant fields and buttons throughout the application
- Establish consistent design patterns and spacing

---

### [ ] STEP 2: Standardized Component Library -> System STEP
**Build complete standardized component library:**

**Standard Address Component (Used Throughout):**
- Street Address #1 (Auto-populate with Google predictive address)
- Street Address #2 (Apartment, Suite, Unit, etc.)
- City
- State  
- Zip Code

**Standard Phone Number Component (Used Throughout):**
- Type Selector (Mobile, Home, Work, etc.)
- Phone Number Input Mask: (***) ***-****
- Extension Field
- Option to Add Additional Phone Numbers

**Additional Standardized Components:**
- Multi-entity selector components for personnel, lenders, vendors, etc.
- Enhanced dropdown components (fixing current broken ones)
- Toggle switch components replacing all checkboxes
- Date/time picker components
- Multi-select components
- Conditional field display logic components

---

### [ ] STEP 3: Database Infrastructure Audit & Enhancement -> Full-Stack Development STEP
**Complete database audit and implement comprehensive relational "Rolodex" backend:**

**Database Audit Requirements:**
- Audit existing tables: clients, claims, adjusters, policies, insurance_carriers, vendors, etc.
- Verify all required fields exist to support every wizard page requirement
- Check relational integrity and foreign key constraints
- Validate existing migration compatibility

**Enhanced Entity Tables Required:**

**Clients Table Enhancement:**
- Support both Individual/Residential and Business/Commercial clients
- Business name field for commercial clients
- Point of contact fields for commercial clients
- Coinsured support with relationship tracking

**Claims Table Enhancement:**
- Complete claim lifecycle with all wizard-captured data
- Loss location details including room information
- Weather-related loss tracking
- Property status flags (FEMA, Police, Uninhabitable, etc.)
- Estimated damage values

**Insurance Carriers Table Enhancement:**
- Complete insurer information with address, phone, email, website
- Personnel management system
- Department and job title tracking

**Personnel/Adjusters Table (New/Enhanced):**
- Personnel type classification
- Vendor specialty tracking
- Professional licenses (multiple per person)
- Historical notes and interaction tracking
- Contact information (multiple phone numbers, emails)

**Policies Table Enhancement:**
- Forced placed policy support
- Insurance agent & agency information
- Policy form types and coverage details
- Alternative dispute resolution options
- Deductibles tracking

**Mortgage Lenders Table (New):**
- Multiple lender support per claim
- Mortgage type classification
- Contact person information
- Loan details (number, payments, outstanding amounts)

**Referral Sources Table (New):**
- Referral type classification
- Referral source contact details
- Relationship tracking
- Referral date logging

**Properties/Building Table (New):**
- Building type, construction type, year built
- Square footage, number of stories
- Roof information (type, age)
- Foundation & exterior details
- Building systems (heating, plumbing, electrical)
- Additional features (basement, garage, spa, detached structures)

**Tasks Table Enhancement:**
- Automatic task generation system
- Standard task templates
- Follow-up scheduling

**Relational "Rolodex" System:**
- Design all tables to support multiple claim associations
- Implement proper foreign key relationships and data integrity constraints
- Create junction tables for many-to-many relationships
- Enable entity reuse across multiple claims

---

### [ ] STEP 4: Page 1 - Client Information Complete Implementation -> Full-Stack Development STEP
**Build Page 1 exactly to specification:**

**Client Status Selector:**
- New (Default selection)
- Existing (If selected, show existing client selector)

**Client Type Selector:**
- Individual/Residential
  - First Name field
  - Last Name field
- Business/Commercial
  - Business Name field
  - Point of Contact First Name field
  - Point of Contact Last Name field

**Contact Information:**
- Primary Email Address
- Primary Phone Number (using standard phone component)

**Address Information:**
- Street Address (using standard address component)
- Mailing Address (using standard address component)
- "Is Mailing Address Same as Loss Location?" selector
  - If False, show additional address fields on Loss Information page

**Coinsured Section:**
- Coinsured toggle switch
- If True, show:
  - Coinsured First Name
  - Coinsured Last Name
  - Email Address
  - Phone Number (using standard phone component)
  - Relationship to Primary Insured dropdown

---

### [ ] STEP 5: Page 2 - Insurer Information Complete Implementation -> Full-Stack Development STEP
**Build Page 2 exactly to specification:**

**Insurer Selection:**
- Selector to choose existing insurer from system OR add new insurer
- Display insurer details: Address, Phone, Email, Website
- Option to add new insurer with full contact details

**Insurer Personnel Information (Support Multiple):**
- Department field
- Job Title field
- Personnel Type selector (when Vendor is selected, trigger Vendor Specialty List)
- Vendor Specialty field (conditional on Personnel Type)
- First Name field
- Last Name field
- Email field
- Phone field (using standard phone component)
- Professional Licenses section (support multiple):
  - License Type
  - License Number
  - License State
- Notes field (with historical tracking and subscriber permissions for carrier habits/trends)

**Add/Remove Personnel Functionality:**
- Dynamic add/remove personnel entries
- Validation for required fields

---

### [ ] STEP 6: Page 3 - Policy Information Complete Implementation -> Full-Stack Development STEP
**Build Page 3 exactly to specification:**

**Policy Classification:**
- "Forced Placed Policy" toggle switch

**Insurance Agent & Agency Information:**
- Agency Name field
- License Number field
- Agent First Name field
- Agent Last Name field
- Agent Email field
- Agent Phone field (using standard phone component)

**Policy Details:**
- Policy Effective Date field
- Policy Expiration Date field (defaulted to 1 year from Effective Date, but editable)
- Policy Type dropdown
- Form Type dropdown (optional)

**Coverage Information:**
- Existing coverage fields with updated UI/UX
- Additional Coverages section
- Deductibles section with existing fields and updated UI/UX

**Alternative Dispute Resolution Options:**
- Mediation toggle switch
- Arbitration toggle switch
- Appraisal toggle switch
  - If Appraisal selected, show sub-options:
    - Agreed (Bilateral) radio button
    - Demanded (Unilateral) radio button
- Litigation toggle switch

---

### [ ] STEP 7: Page 4 - Loss Information Complete Implementation -> Full-Stack Development STEP
**Build Page 4 exactly to specification:**

**Loss Details:**
- Reason for Loss (multi-text field for detailed explanation)
- Cause of Loss (comprehensive selector with all standard causes):
  - Property losses (residential): Fire, Water damage, Storm, Theft, Vandalism, etc.
  - Property losses (commercial): Equipment failure, Business interruption, etc.
  - Casualty losses: Liability claims, Personal injury, Professional liability, etc.
- Date of Loss field
- Time of Loss field
- Severity of Loss dropdown

**Loss Location:**
- Loss Location Address field
- Room field
- If "Mailing Address Same as Loss Location" was False on Page 1, show additional address fields

**Additional Loss Information:**
- Cause Details field (optional)
- Loss Description field (optional)
- Estimated Damage Value field (optional)

**Weather Related Section:**
- "Is this Weather Related?" toggle switch
- If True, show:
  - Weather Type selector: Thunderstorm, Hurricane, Tornado, Derecho, Hail
  - If Hurricane/Tropical Storm selected:
    - Storm Name selector (with option to add new storm)

**Property Status Selectors (All Toggle Switches):**
- FEMA Declared Disaster
- Police Called (if True, show Police Report Number field)
- Property Uninhabitable
- Damage to Other Structures
- State of Emergency Declared
- Emergency Mitigation/Repairs Required
- Damaged Personal Property
- Additional Living Expenses
- Repairs Made?
- Vendors/Repairs Needed?

---

### [ ] STEP 8: Page 5 - Mortgage Lender Information Complete Implementation -> Full-Stack Development STEP
**Build Page 5 exactly to specification:**

**Multiple Mortgage Lenders Support:**
- Dynamic add/remove mortgage lender entries
- For each mortgage lender:
  - Mortgage Lender Name field
  - Mortgage Type dropdown
  - Lender Address (using standard address component)
  - Contact Person First Name field
  - Contact Person Last Name field
  - Phone field (using standard phone component)
  - Email Address field
  - Loan Number field
  - Monthly Payments field
  - Outstanding Payments field

**Validation:**
- Required field validation for each lender entry
- Proper form validation messages

---

### [ ] STEP 9: Page 6 - Referral Source Information Complete Implementation -> Full-Stack Development STEP
**Build Page 6 exactly to specification:**

**Referral Type Selection:**
- Referral Type dropdown: Social Media, Vendor, Client, Individual, etc.

**Conditional Fields Based on Referral Type:**
- If Vendor, Client, or Individual selected, show:
  - Referral Source Name field
  - Relationship field
  - Referral Date field
  - Website field
  - Phone field (using standard phone component)
  - Email Address field
  - Additional Notes field

**Validation:**
- Conditional validation based on referral type selection
- Required fields enforcement

---

### [ ] STEP 10: Page 7 - Building Information Complete Implementation -> Full-Stack Development STEP
**Build Page 7 exactly to specification:**

**Building Classification:**
- Building Type dropdown
- Construction Type dropdown
- Year Built field

**Building Details:**
- Square Footage field
- Number of Stories field

**Roof Information:**
- Roof Type dropdown
- Roof Age field

**Foundation & Exterior:**
- Foundation Type dropdown
- Exterior Walls dropdown

**Building Systems:**
- Heating Systems dropdown
- Plumbing Type dropdown
- Electrical Type dropdown

**Additional Features (All Toggle Switches):**
- Basement
- Garage
- Spa
- Detached Structures

**Validation:**
- Numeric validation for square footage, year built, roof age, stories
- Required field validation

---

### [ ] STEP 11: Page 8 - Office Tasks & Follow-ups Complete Implementation -> Full-Stack Development STEP
**Build Page 8 exactly to specification:**

**Automatic Tasks Display:**
- List all automatic tasks generated based on claim information
- Display task details: Description, Due Date, Priority, Status

**Add Task Functionality:**
- "Add Task" button
- When clicked, display standard task form:
  - Task Description field
  - Due Date field
  - Priority dropdown
  - Assigned To dropdown
  - Notes field

**Task Management:**
- Edit existing tasks
- Mark tasks as complete
- Delete tasks

---

### [ ] STEP 12: Page 9 - Intake Review & Completion Complete Implementation -> Full-Stack Development STEP
**Build Page 9 exactly to specification:**

**Comprehensive Overview:**
- Display summary of all information entered across all 8 pages
- Organized sections for easy review
- Edit links to go back to specific pages for corrections

**Completion Options:**
- "Do This Later" selector for Pages 7-11 (if user wants to complete remaining sections later)

**Contract & Document Generation:**
- "Generate Contracts & Intake Documents" button
- Generate all necessary intake documentation
- Contract creation functionality

**Final Submission:**
- Final validation of all required fields
- Save complete claim to database
- Generate claim number
- Confirmation screen

---

### [ ] STEP 13: Post-Creation Functionality Implementation -> Full-Stack Development STEP
**Build post-creation tabs for future editing:**

**Additional Tabs:**
- ALE (Additional Living Expenses) tab
- PPI (Personal Property Inventory) tab
- Other Structures tab
- Repairs tab
- Vendors tab

**Tab Functionality:**
- Each tab allows future editing and completion
- Maintains relationship to original claim
- Updates claim status as sections are completed

---

### [ ] STEP 14: Integration Testing & Quality Assurance -> System STEP
**Comprehensive testing and validation:**

**End-to-End Testing:**
- Test complete new client workflow (all 9 pages)
- Test existing client workflow
- Test all conditional logic and field dependencies
- Test toggle switches replacing all checkboxes

**Database Integration Testing:**
- Test all CRUD operations
- Test relational integrity
- Test Rolodex functionality (entity reuse across claims)

**UI/UX Testing:**
- Test responsive design
- Test all components and interactions
- Verify Google address predictive text
- Test phone number formatting and validation

**Performance Testing:**
- Page load times
- Database query optimization
- Component rendering performance

---

### [ ] STEP 15: Deployment & Documentation -> System STEP
**Final deployment and comprehensive documentation:**

**Production Deployment:**
- Deploy completed wizard to production environment
- Configure all necessary environment variables
- Test production deployment

**User Documentation:**
- Create comprehensive user guides for all 9 pages
- Document all business logic and workflows
- Create training materials
- Document post-creation functionality

**Technical Documentation:**
- Document all database changes
- Document API endpoints
- Document component library
- Create maintenance guides

---

## Deliverable: 
Fully functional 9-page manual claim intake wizard meeting 100% of specification requirements, including:
- Complete new and existing client workflows
- Comprehensive relational database backend ("Rolodex" system)
- All standardized components (address, phone, etc.)
- All conditional logic and field dependencies
- Post-creation editing functionality
- Polished UI/UX with toggle switches replacing all checkboxes
- Complete contract and document generation

## Estimated Timeline: 
This is a major development project requiring 15 detailed implementation steps with comprehensive testing and quality assurance.
