# Prioritized To-Do List: ClaimGuru CRM 

This document outlines a prioritized list of action items based on a comprehensive audit of the ClaimGuru CRM system. Items are ranked from highest to lowest priority to provide a clear roadmap for development, focusing on stabilizing core functionality before enhancing advanced features.

## 1. CRITICAL PRIORITY (Immediate Action Required)

These items represent fundamental issues that severely compromise the application's stability, security, and core purpose. They must be addressed immediately.

### 1.1. Remove Hardcoded Database Credentials
- **Description of the Issue**: The Supabase URL and anon key are hardcoded directly into the frontend application code. This is a critical security vulnerability.
- **Business Impact**: Exposes the entire database to potential compromise, leading to massive data breaches, loss of customer trust, and severe legal and financial repercussions. The application cannot be deployed to production in this state.
- **Estimated Effort/Timeline**: 1-2 hours
- **Technical Complexity**: Low
- **Specific Files/Components Affected**:
  - `src/lib/supabase.ts`
  - `public/secure-config.html`

### 1.2. Fix Mock Data in Core Client Management
- **Description of the Issue**: The primary client management interface (`ClientManagement.tsx`) uses hardcoded mock data. Any new clients created or updated through this interface are not saved to the database, leading to data loss.
- **Business Impact**: Prevents Public Adjusters from performing their most fundamental task: managing clients. This makes the CRM non-functional for its primary purpose. All client data entered is lost upon session end.
- **Estimated Effort/Timeline**: 2-4 hours
- **Technical Complexity**: Low
- **Specific Files/Components Affected**:
  - `src/pages/ClientManagement.tsx` (lines 243-299)

### 1.3. Repair Broken Tasks Page
- **Description of the Issue**: The Tasks page (`/tasks`) renders a blank white screen and is completely non-functional. This appears to be caused by a database schema mismatch or a critical component error.
- **Business Impact**: A core feature of any CRM—task management—is entirely inaccessible. Users cannot track, view, or manage their work, crippling daily operations and workflow management.
- **Estimated Effort/Timeline**: 2-4 hours (investigation) + 4-8 hours (fix)
- **Technical Complexity**: Medium
- **Specific Files/Components Affected**:
  - `src/pages/Tasks.tsx`

### 1.4. Implement Real Document Upload Service
- **Description of the Issue**: The document upload component is a simulation. It shows a progress bar but does not actually upload any files to the backend storage.
- **Business Impact**: Users believe they are uploading critical documents (policies, photos, etc.), but the files are never saved. This leads to catastrophic data loss and breaks the entire claim documentation workflow.
- **Estimated Effort/Timeline**: 4-6 hours
- **Technical Complexity**: Medium
- **Specific Files/Components Affected**:
  - `src/components/ui/DocumentUpload.tsx`

### 1.5. Fix Broken Address Autocomplete Component
- **Description of the Issue**: The `AddressAutocomplete` component is failing due to issues with the Google Maps API key integration, breaking address entry in multiple forms.
- **Business Impact**: Users cannot reliably enter or validate addresses for clients or properties, a fundamental requirement for a Public Adjuster CRM. This impacts data accuracy and the ability to manage property-based claims.
- **Estimated Effort/Timeline**: 2-4 hours
- **Technical Complexity**: Low
- **Specific Files/Components Affected**:
  - `src/components/ui/AddressAutocomplete.tsx`
  - All forms utilizing this component (e.g., `ClientForm.tsx`, `EnhancedClientForm.tsx`)

---

## 2. HIGH PRIORITY (Core CRM Functions)

These items address major gaps in the essential, day-to-day functionality of the Public Adjuster CRM. They are required to make the product viable for users.

### 2.1. Replace Mock Data in Claim Creation Wizard
- **Description of the Issue**: The `ClientInformationStep.tsx` in the claim wizard uses a hardcoded list of clients, preventing users from selecting their actual clients when creating a new claim.
- **Business Impact**: It is impossible to associate a new claim with an existing client from the database, breaking a primary workflow and forcing redundant data entry.
- **Estimated Effort/Timeline**: 3-5 hours
- **Technical Complexity**: Low
- **Specific Files/Components Affected**:
  - `src/components/claims/wizard-steps/ClientInformationStep.tsx`

### 2.2. Consolidate Duplicate Client Management Pages
- **Description of the Issue**: There are two separate client management pages (`Clients.tsx` and `ClientManagement.tsx`). The former works but is basic, while the latter has more features (like permissions) but is broken (uses mock data). This creates user confusion and technical debt.
- **Business Impact**: Users have a confusing and inconsistent experience. Consolidating the pages will streamline the application, reduce maintenance overhead, and ensure features like permissions are applied to the functional component.
- **Estimated Effort/Timeline**: 8-12 hours
- **Technical Complexity**: Medium
- **Specific Files/Components Affected**:
  - `src/pages/Clients.tsx`
  - `src/pages/ClientManagement.tsx`

### 2.3. Fix Backend Database Relationship Errors
- **Description of the Issue**: API calls for displaying user activities and vendor assignments are failing due to database relationship constraints (foreign key issues).
- **Business Impact**: Important contextual information is missing from the UI, such as who performed what action and which vendors are assigned to a claim. This limits the 360-degree view of a claim.
- **Estimated Effort/Timeline**: 4-8 hours
- **Technical Complexity**: Medium
- **Specific Files/Components Affected**:
  - Backend Supabase schema (foreign key constraints between `activities`, `user_profiles`, `vendors`, `vendor_assignments`)

### 2.4. Complete and Repair Truncated/Incomplete Components
- **Description of the Issue**: Several components, most notably `ClientCreateEditModal.tsx`, are truncated or incomplete, which can cause application crashes or unexpected behavior.
- **Business Impact**: Application instability and potential for data loss when users interact with these broken components. It presents a highly unprofessional and unreliable user experience.
- **Estimated Effort/Timeline**: 3-5 hours
- **Technical Complexity**: Medium
- **Specific Files/Components Affected**:
  - `src/components/modals/ClientCreateEditModal.tsx`

---

## 3. MEDIUM PRIORITY (Enhanced CRM Features)

These items focus on improving existing CRM features, enhancing the user experience, and fixing non-critical integrations.

### 3.1. Implement Real AI and PDF Extraction Services
- **Description of the Issue**: The AI-powered services for document analysis and PDF content extraction are currently mock implementations that use `setTimeout` and return fake data.
- **Business Impact**: The key marketing feature of "AI-enhanced" claim intake is non-functional. Implementing this is crucial for delivering on the application's primary value proposition, but core CRM functions must work first.
- **Estimated Effort/Timeline**: 12-16 hours
- **Technical Complexity**: High
- **Specific Files/Components Affected**:
  - `src/services/pdfExtractionService.ts`
  - `src/services/ai/documentAnalysisService.ts`
  - Supabase Edge Functions (`openai-extract-fields-enhanced`, etc.)

### 3.2. Complete In-Progress Integrations
- **Description of the Issue**: Core authentication integration is incomplete in some modals, with `TODO` comments and hardcoded user IDs present.
- **Business Impact**: Potential for incorrect data attribution and security gaps where actions are not correctly logged to the authenticated user.
- **Estimated Effort/Timeline**: 4-6 hours
- **Technical Complexity**: Low
- **Specific Files/Components Affected**:
  - `src/components/modals/ClientCreateEditModal.tsx`

### 3.3. Enhance Basic UI Components
- **Description of the Issue**: Core UI elements like `DropdownMenu` and `Dialog` are overly simplistic and lack expected features like keyboard navigation and full accessibility.
- **Business Impact**: A more polished and professional user experience. Improves usability for power users and those with accessibility needs.
- **Estimated Effort/Timeline**: 6-8 hours
- **Technical Complexity**: Medium
- **Specific Files/Components Affected**:
  - `src/components/ui/DropdownMenu.tsx`
  - `src/components/ui/Dialog.tsx`

### 3.4. Remove Development Artifacts from Code
- **Description of the Issue**: Numerous `console.log` statements and `TODO` comments are scattered throughout the codebase, particularly in wizard components.
- **Business Impact**: Improves code quality, maintainability, and removes potential noise from browser consoles in a production environment.
- **Estimated Effort/Timeline**: 2-4 hours
- **Technical Complexity**: Low
- **Specific Files/Components Affected**:
  - Various files in `src/components/claims/wizard-steps/`
  - Various files in `src/components/crm/`

---

## 4. LOW PRIORITY (Advanced/Secondary Features)

These items relate to features that are either "nice-to-have" or are planned but not essential for the core CRM to function. They should be addressed after the product is stable and all core features are fully operational.

### 4.1. Implement Placeholder Pages
- **Description of the Issue**: Multiple pages in the navigation are placeholders with "Coming soon" messages (e.g., Analytics, Sales Pipeline, Help & Support).
- **Business Impact**: Low. The core application is functional without them. Implementing these will round out the feature set and meet user expectations for a mature product.
- **Estimated Effort/Timeline**: 20-40+ hours (per feature)
- **Technical Complexity**: Medium to High
- **Specific Files/Components Affected**:
  - `src/pages/Analytics.tsx`
  - `src/pages/SalesPipeline.tsx` (and other sales/marketing pages)
  - `src/pages/Help.tsx`

### 4.2. Develop Advanced/Secondary Features
- **Description of the Issue**: Numerous advanced features outlined in the audit are either planned or only partially implemented (e.g., native mobile app, advanced workflow automation, full calendar sync).
- **Business Impact**: These features provide significant competitive advantages but are secondary to a stable, functional core CRM. They should be part of a long-term product roadmap.
- **Estimated Effort/Timeline**: Varies (multiple weeks/months per feature)
- **Technical Complexity**: High
- **Specific Files/Components Affected**:
  - `docs/advanced_features_audit.md` provides a full list.

### 4.3. Code Performance and Accessibility Optimizations
- **Description of the Issue**: The application could benefit from performance tuning (e.g., using `React.memo`, virtual scrolling for large lists) and accessibility enhancements (e.g., ARIA labels, focus management).
- **Business Impact**: Improves the user experience, especially for users with large datasets or accessibility needs. This is important for a polished, professional product but does not prevent its core use.
- **Estimated Effort/Timeline**: 8-12 hours
- **Technical Complexity**: Medium
- **Specific Files/Components Affected**:
  - Large list components, complex forms, modal dialogs.
