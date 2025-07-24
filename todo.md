# Manual Claim Intake Wizard Comprehensive Revision - TODO

## TASK: Complete Revision of Manual Claim Intake Wizard
**USER NEED**: Modernize the claim intake process with enhanced UI/UX, streamlined workflow, and comprehensive backend integration
**CORE FUNCTIONALITY**: 9-page wizard for manual claim intake with standardized components and relational database architecture

## STEPs:

### [ ] STEP 1: UI/UX Component Standardization → System STEP
- Replace all checkbox inputs with toggle switches throughout the application
- Implement standardized address format component (Street Address #1 with Google autocomplete, Street Address #2, City, State, Zip)
- Implement standardized phone number format component (Type selector, masked input, extension, multiple phone option)
- Create reusable UI components for consistent experience
- Remove AI functionalities except where explicitly required

### [ ] STEP 2: Database Schema Enhancement → System STEP
- Design relational database structure for intelligent backend Rolodex
- Create/update tables for vendors, insurers, mortgage lenders, carrier personnel
- Implement proper foreign key relationships for multi-claim associations
- Ensure mailing_zip column exists in clients table
- Create indexes for performance optimization

### [ ] STEP 3: 9-Page Wizard Implementation → Web Development STEP (task_type="interactive")
**Page 1: Client Information**
- Client type selector (Individual/Residential vs Business/Commercial)
- Primary contact details with standardized formats
- Mailing address with "same as loss location" toggle
- Coinsured information conditional display

**Page 2: Insurer Information**
- Insurer selection/creation system
- Multiple insurer personnel management
- Personnel type with vendor specialty conditional logic
- Professional licenses tracking
- Historical notes system

**Page 3: Policy Information**
- Forced placed policy toggle
- Agent & agency information
- Policy details with auto-calculated expiration
- Coverage information with updated UI
- Alternative dispute resolution options

**Page 4: Loss Information**
- Loss details (cause, date, time, severity)
- Location and description fields
- Weather-related toggle with conditional storm selection
- Property status selectors (all converted to toggles)

**Page 5: Mortgage Lender Information**
- Multiple lender management
- Standardized contact and loan information
- Address and payment details

**Page 6: Referral Source Information**
- Referral type selection
- Conditional vendor/contact details
- Relationship and date tracking

**Page 7: Building Information**
- Property characteristics and systems
- Construction details and features
- Age and structural information

**Page 8: Office Tasks & Follow-ups**
- Automatic task generation
- Manual task addition capability
- Task management integration

**Page 9: Intake Review & Completion**
- Comprehensive data review
- "Do This Later" functionality
- Contract and document generation

### [ ] STEP 4: Backend Integration & API Development → Web Development STEP (task_type="interactive")
- Implement Supabase integration for data persistence
- Create API endpoints for all wizard steps
- Implement validation and error handling
- Set up proper authentication and authorization
- Create data export/import functionality

### [ ] STEP 5: Testing & Quality Assurance → System STEP
- Test each wizard page functionality
- Validate data persistence and retrieval
- Test toggle switches and conditional logic
- Verify Google Maps integration for addresses
- Test multi-entity relationship creation

### [ ] STEP 6: Deployment & Documentation → System STEP
- Deploy updated application
- Create user documentation
- Document API endpoints
- Provide migration guide for existing data

## Deliverable: Fully functional 9-page manual claim intake wizard with modern UI/UX and comprehensive backend integration

## Technical Requirements:
- React/TypeScript frontend
- Supabase backend with PostgreSQL
- Toggle switches instead of checkboxes
- Google Places API for address autocomplete
- Responsive design
- Form validation and error handling
- Multi-entity relational database structure

## Success Criteria:
- [ ] All 9 pages function correctly with proper navigation
- [ ] Data persists accurately across all entities
- [ ] UI components follow standardized formats
- [ ] Toggle switches replace all checkboxes
- [ ] Backend Rolodex supports multi-claim associations
- [ ] Google autocomplete works for addresses
- [ ] Phone number masking and validation works
- [ ] Conditional logic displays properly
- [ ] Application deploys successfully