# TASK: Complete Manual Claim Intake Wizard Implementation

## Objective: Implement the comprehensive manual claim intake wizard according to detailed specifications, fixing critical issues and building missing functionality.

## Current Status Analysis:
- **Existing Implementation:** ~30% complete (Pages 1-3 partially working)
- **Critical Blocking Issues:** 3 major problems preventing basic functionality
- **Missing Features:** 60+ implementation items identified
- **User Testing Results:** Cannot complete wizard due to broken dropdowns on Page 4

## STEPs:

### [ ] STEP 1: Critical Bug Fixes (URGENT) -> System STEP
**Fix blocking issues preventing basic wizard functionality:**
- Fix broken "Reason for Loss" field on Page 4 - **CHANGE TO MULTI-TEXT FIELD**
- Fix broken "Cause of Loss" field on Page 4 - **CHANGE TO COMPREHENSIVE SELECTOR** with all property and casualty loss causes for residential and business
- Fix broken "Severity of Loss" dropdown on Page 4
- Implement existing client selection workflow (currently only supports new clients)
- Add proper form validation error messages
- Replace all checkbox inputs with toggle switches system-wide

### [ ] STEP 2: Complete Database Infrastructure Audit & Enhancement -> Full-Stack Development STEP  
**Audit existing database and implement comprehensive relational "Rolodex" backend system:**

**Database Audit Requirements:**
- Audit existing tables: clients, claims, adjusters, policies, insurance_carriers, vendors, etc.
- Verify all required fields exist to support manual wizard workflow
- Check relational integrity and foreign key constraints
- Validate existing migration compatibility

**Core Entity Tables Required:**
- **Clients Table:** Enhanced to support both individual/residential and business/commercial clients
- **Claims Table:** Full claim lifecycle with all wizard-captured data
- **Insurance Carriers Table:** Complete insurer information with personnel management
- **Policies Table:** Policy details, coverages, deductibles, dispute resolution options
- **Adjusters/Personnel Table:** Insurance company personnel with roles, licenses, specialties
- **Vendors Table:** Enhanced vendor management with specialties and relationships
- **Mortgage Lenders Table:** Multiple lender support per claim
- **Referral Sources Table:** Comprehensive referral tracking system
- **Properties Table:** Building and construction details
- **Tasks Table:** Office tasks and follow-ups system

**Relational "Rolodex" System:**
- Design database tables that support multiple claim associations for all entities
- Implement proper foreign key relationships and data integrity constraints
- Create junction tables for many-to-many relationships
- Enable entity reuse across multiple claims (vendors, adjusters, insurers, etc.)

**Data Integrity & Functions:**
- Create database triggers for data validation
- Implement stored procedures for complex data operations
- Add database functions for claim workflow automation
- Create views for efficient data retrieval and reporting
- Ensure all database tables and functions are properly configured for complete claim intake workflow
- Verify that all entity relationships support the full manual intake wizard requirements
- Implement comprehensive database functions for carriers, adjusters, vendors, clients, and all related entities

**Migration Scripts:**
- Create migration scripts for all database enhancements
- Ensure backward compatibility with existing data
- Implement proper rollback mechanisms

### [ ] STEP 3: Core UI Components Standardization -> Full-Stack Development STEP
**Build standardized, reusable components:**
- Enhanced address input component with Google predictive text
- Standardized phone number component with type selector and extensions
- Multi-entity selector components for personnel, lenders, etc.
- Improved dropdown components (fixing current broken ones)

### [ ] STEP 4: Page 1-3 Enhancement -> Full-Stack Development STEP
**Complete implementation of first 3 pages to specification:**
- Page 1: Add client status selector (New vs Existing), enhanced client type logic
- Page 2: Multiple personnel management, vendor specialty logic, professional licenses
- Page 3: Alternative dispute resolution options, auto-calculated dates, enhanced coverage

### [ ] STEP 5: Page 4-6 Complete Implementation -> Full-Stack Development STEP  
**Build remaining middle pages with full functionality:**
- Page 4: Complete loss information with weather logic, property status toggles
  - **"Reason for Loss":** Implement as multi-text field for detailed loss explanation
  - **"Cause of Loss":** Implement comprehensive selector with all standard causes of loss for:
    - Property losses (residential): Fire, Water damage, Storm, Theft, Vandalism, etc.
    - Property losses (commercial): Equipment failure, Business interruption, etc.
    - Casualty losses: Liability claims, Personal injury, Professional liability, etc.
- Page 5: Multiple mortgage lender management system
- Page 6: Referral source information with conditional logic

### [ ] STEP 6: Page 7-9 Complete Implementation -> Full-Stack Development STEP
**Build final pages and completion workflow:**
- Page 7: Building information with comprehensive property details
- Page 8: Office tasks and follow-ups with automatic task generation
- Page 9: Review, completion, and contract generation

### [ ] STEP 7: Integration Testing & Quality Assurance -> System STEP
**Comprehensive testing and validation:**
- End-to-end wizard testing for both new and existing client workflows
- Database integration testing
- UI/UX testing and refinement
- Performance optimization

### [ ] STEP 8: Deployment & Documentation -> System STEP  
**Final deployment and user guidance:**
- Deploy completed wizard to production
- Create user documentation and guides
- Provide training materials for the comprehensive workflow

## Deliverable: Fully functional 9-page manual claim intake wizard meeting all specification requirements, with both new and existing client workflows, comprehensive database backend, and polished UI/UX.

## Estimated Timeline: This is a significant development project requiring multiple phases of implementation.