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
- Fix broken "Reason for Loss" and "Severity of Loss" dropdowns on Page 4
- Implement existing client selection workflow (currently only supports new clients)
- Add proper form validation error messages
- Replace all checkbox inputs with toggle switches system-wide

### [ ] STEP 2: Database Schema Enhancement -> Full-Stack Development STEP  
**Implement relational "Rolodex" backend system:**
- Create comprehensive relational database structure for vendors, insurers, clients, etc.
- Design database tables that support multiple claim associations
- Implement proper foreign key relationships and data integrity
- Create database migration scripts

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