# ClaimGuru Database Schema Analysis Report

## Executive Summary

This report provides a comprehensive analysis of the ClaimGuru database schema as implemented in Supabase. The database supports a full-featured insurance claim management system designed for public adjusters, with advanced CRM capabilities, AI-powered insights, financial management, vendor coordination, and comprehensive workflow automation.

## Schema Overview

The database consists of **30+ core tables** organized into logical modules:

### Core Business Entities
- Organizations (Multi-tenant architecture)
- User Profiles (Role-based access)
- Clients (Policyholders and contacts)
- Claims (Primary business objects)
- Properties (Physical assets)
- Insurance Carriers (External companies)
- Policies (Insurance contracts)

### Advanced Features
- AI-powered document analysis and insights
- Comprehensive settlement management
- Vendor/contractor coordination
- Task and project management
- Communication tracking
- Financial management and billing
- Calendar and scheduling system
- Third-party integrations

## Database Architecture

### Multi-Tenant Design
The database implements **organization-level isolation** with:
- All business tables reference `organization_id`
- Row Level Security (RLS) policies enforcing data isolation
- User profiles linked to specific organizations
- Shared resources (integration providers) available to all organizations

### Security Implementation
- **Row Level Security (RLS)** enabled on all sensitive tables
- Organization-based data isolation policies
- User authentication integration with Supabase Auth
- Encrypted storage for sensitive credentials
- Role-based permission system

## Detailed Table Analysis

### 1. Core Business Tables

#### Organizations Table
**Purpose**: Multi-tenant organization management
**Key Features**:
- Unique company codes for identification
- Subscription tier management
- Billing and contact information
- Company branding (logo_url)

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'public_adjuster',
    subscription_tier VARCHAR(50) DEFAULT 'starter',
    company_code VARCHAR(20) UNIQUE NOT NULL,
    ...
);
```

#### Claims Table
**Purpose**: Central claim management
**Key Features**:
- Comprehensive claim lifecycle tracking
- Multiple adjuster assignments (desk, field, assigned)
- Priority and phase management
- Settlement amount tracking
- FEMA and emergency claim handling
- Damage categorization (dwelling, structures, personal property)
- Contract fee management

**Supported Workflow States**:
- Claim Status: new, active, pending, closed
- Claim Phase: initial_contact, investigation, negotiation, settlement
- Priority Levels: low, medium, high, urgent

#### Clients Table
**Purpose**: Customer and contact management
**Key Features**:
- Individual and business client support
- Multiple contact methods (primary/secondary email, various phone types)
- Separate mailing addresses
- Lead source tracking
- Portal access with PIN system
- Social media integration
- Employer and occupation tracking

#### Properties Table  
**Purpose**: Physical asset management
**Key Features**:
- Detailed property specifications
- Construction details (type, roof, foundation, utilities)
- Valuation tracking (estimated value, replacement cost)
- Photo and document storage (JSONB)
- Inspection history
- Property type categorization (residential, commercial, industrial)

### 2. Financial Management System

#### Fee Schedules Table
**Purpose**: Fee and billing management
**Key Features**:
- Multiple fee types: percentage, flat_fee, hourly, contingency
- Invoice number tracking
- Approval workflow
- Due date management

#### Expenses Table
**Purpose**: Expense tracking and reimbursement
**Key Features**:
- Expense categorization (travel, equipment, expert, legal)
- Receipt storage
- Billable/non-billable tracking
- Approval workflow
- Vendor association

#### Payments Table
**Purpose**: Payment processing and tracking
**Key Features**:
- Multiple payment types and methods
- Reference number tracking
- Status monitoring (pending, processing, completed, failed)

#### Settlements Table
**Purpose**: Detailed settlement management
**Key Features**:
- Multiple settlement types
- RCV (Replacement Cash Value) calculations
- Recoverable/non-recoverable depreciation
- Deductible applications
- Payment scheduling
- Prior payment tracking

#### Settlement Line Items Table
**Purpose**: Granular settlement breakdowns
**Key Features**:
- Category-based line items
- Quantity and cost tracking
- Carrier approval status
- Dispute management

### 3. Vendor Management System

#### Vendors Table
**Purpose**: Contractor and service provider management
**Key Features**:
- Multiple vendor types (contractor, expert, attorney, engineer, adjuster)
- Contact and licensing information
- Insurance information storage
- Rating and review system
- Specialty tracking
- Hourly rate management

#### Claim Vendors Table
**Purpose**: Vendor-claim assignments
**Key Features**:
- Assignment type tracking (estimate, repair, inspection, expert)
- Status monitoring
- Due date management
- Quote and final amount tracking

#### Vendor Reviews Table
**Purpose**: Performance tracking
**Key Features**:
- 1-5 star rating system
- Detailed review categories
- Review text and feedback

### 4. Document Management System

#### Documents Table
**Purpose**: Comprehensive document handling
**Key Features**:
- File metadata and storage
- AI-powered text extraction
- Entity recognition and summary generation
- Compliance status tracking
- Version control
- Digital signature support
- Confidentiality levels
- Tag-based organization

#### File Folders Table
**Purpose**: Document organization
**Key Features**:
- Hierarchical folder structure
- Permission-based access control
- Template folders

### 5. AI and Analytics System

#### AI Insights Table
**Purpose**: AI-powered document analysis
**Key Features**:
- Multiple insight types and categories
- Confidence scoring
- Risk factor identification
- Compliance status assessment
- Follow-up action recommendations
- Review workflow
- Model version tracking
- Performance metrics

### 6. Communication Management

#### Communications Table
**Purpose**: Communication history tracking
**Key Features**:
- Multi-channel support (email, SMS, phone, letter, meeting)
- Delivery status tracking
- Attachment management
- Scheduling capabilities
- Direction tracking (inbound/outbound)

#### Communication Templates Table
**Purpose**: Template management
**Key Features**:
- Multiple template types
- Variable substitution support
- Category organization
- Active/inactive status

#### Communication Preferences Table
**Purpose**: Client communication preferences
**Key Features**:
- Method preferences
- Notification settings
- Time zone and scheduling preferences
- Do-not-contact periods
- Marketing preferences

### 7. Task and Activity Management

#### Tasks Table
**Purpose**: Task and project management
**Key Features**:
- Assignment and due date tracking
- Progress percentage monitoring
- Priority levels
- Dependency management
- Checklist functionality
- Automation triggers
- Hour tracking (estimated vs. actual)

#### Activities Table
**Purpose**: Activity logging and tracking
**Key Features**:
- Comprehensive activity categorization
- Communication method tracking
- Participant management
- Document relationships
- Follow-up scheduling
- System vs. manual activity distinction

### 8. Scheduling and Calendar System

#### Events Table
**Purpose**: Comprehensive scheduling
**Key Features**:
- Multiple event types (appointment, deadline, inspection, meeting, court_date)
- Recurring event support
- Multi-entity associations (claim, client, vendor)
- Virtual meeting integration
- Status and priority management
- Reminder systems
- Third-party calendar integration (Google, Outlook)

#### Event Attendees Table
**Purpose**: Event participation tracking
**Key Features**:
- Response status tracking
- Organizer identification
- External participant support

#### User Availability Table
**Purpose**: Availability management
**Key Features**:
- Day-of-week scheduling
- Time zone support
- Flexible availability rules

#### Time Off Table
**Purpose**: Schedule management
**Key Features**:
- Time off request tracking
- Approval workflow
- Multiple time off types

### 9. Integration Management System

#### Integration Providers Table
**Purpose**: Third-party service catalog
**Key Features**:
- Pre-configured popular services (SendGrid, Twilio, Google Calendar, Stripe, etc.)
- Feature capability mapping
- Required credentials specification
- Pricing information storage

#### Organization Integrations Table
**Purpose**: Organization-specific integration configurations
**Key Features**:
- Encrypted credential storage
- Sync status monitoring
- Usage statistics tracking
- Error handling and logging

#### Integration Logs Table
**Purpose**: Integration activity auditing
**Key Features**:
- Action tracking
- Request/response data storage
- Performance monitoring
- Error analysis

#### Integration Quotas Table
**Purpose**: API rate limiting
**Key Features**:
- Multiple quota types (daily, monthly, per-minute)
- Usage tracking
- Automatic reset scheduling

### 10. Property Management

#### Property Inspections Table
**Purpose**: Inspection management
**Key Features**:
- Multiple inspection types
- Damage assessment storage
- Photo and document attachments
- Repair cost estimates
- Inspector assignment

### 11. System Management

#### Organization Modules Table
**Purpose**: Feature activation and billing
**Key Features**:
- Module-based feature control
- Usage tracking
- Billing tier management
- Activation/deactivation dates

#### User Activity Logs Table
**Purpose**: Audit trail and analytics
**Key Features**:
- Comprehensive activity tracking
- IP address and user agent logging
- Session management
- Entity change tracking

#### Saved Searches Table
**Purpose**: Search optimization
**Key Features**:
- Complex search criteria storage
- Search sharing capabilities
- Usage analytics

#### Lead Sources Table
**Purpose**: Marketing analytics
**Key Features**:
- Lead source tracking
- Client acquisition analysis

#### Notifications Table
**Purpose**: In-app notification system
**Key Features**:
- Entity-based notifications
- Read status tracking
- Notification categorization

### 12. Insurance-Specific Tables

#### Insurance Carriers Table
**Purpose**: Insurance company management
**Key Features**:
- Contact information management
- Claims filing preferences
- Electronic filing capabilities
- Rating system
- Preferred communication methods

#### Policies Table
**Purpose**: Insurance policy management
**Key Features**:
- Comprehensive coverage limit tracking
- Deductible management (including hurricane deductibles)
- Additional coverage storage (JSONB)
- Appraisal clause tracking
- Document attachments

## Key Relationships and Data Flow

### Primary Entity Relationships
1. **Organization** → **Users** → **Claims** → **Settlements**
2. **Claims** → **Clients** → **Properties** → **Policies**
3. **Claims** → **Documents** → **AI Insights**
4. **Claims** → **Vendors** → **Tasks** → **Activities**

### Multi-Directional Relationships
- Claims can have multiple settlements, documents, tasks, and vendor assignments
- Clients can have multiple properties and claims
- Vendors can work on multiple claims across different categories
- Documents can generate multiple AI insights
- Events can be associated with claims, clients, and vendors simultaneously

## Core Features Supported

### 1. Claim Management
- **Complete claim lifecycle management** from initial contact to final settlement
- **Multi-adjuster assignment** system for complex claims
- **Phase-based workflow** tracking
- **Priority management** and watch lists
- **Emergency claim handling** (FEMA, state emergencies)
- **Damage categorization** and assessment
- **Settlement negotiation** and tracking

### 2. Client Relationship Management
- **Comprehensive client profiles** with multiple contact methods
- **Lead source tracking** and marketing analytics
- **Client portal access** with PIN authentication
- **Communication preference management**
- **Activity and interaction history**

### 3. Financial Management
- **Fee calculation** and billing (percentage, flat fee, hourly, contingency)
- **Expense tracking** and reimbursement
- **Payment processing** and status monitoring
- **Detailed settlement breakdowns** with line-item tracking
- **Deductible and depreciation calculations**
- **Prior payment tracking**

### 4. Vendor Coordination
- **Vendor database** with ratings and reviews
- **Assignment management** across multiple claim types
- **Performance tracking** and evaluation
- **Quote and cost management**
- **Specialty-based vendor matching**

### 5. Document Management
- **AI-powered document analysis** and text extraction
- **Entity recognition** and data extraction
- **Compliance monitoring** and status tracking
- **Version control** and digital signatures
- **Organized folder structure** with permissions
- **Tag-based organization** and search

### 6. AI-Powered Insights
- **Document analysis** and summarization
- **Risk factor identification**
- **Compliance assessment**
- **Automated recommendations**
- **Confidence scoring** for AI predictions
- **Review workflow** for AI-generated insights

### 7. Communication Management
- **Multi-channel communication** tracking (email, SMS, phone, meetings)
- **Template-based messaging** with variable substitution
- **Delivery status monitoring**
- **Communication preferences** and do-not-contact periods
- **Scheduled communications**

### 8. Task and Project Management
- **Assignment-based task management**
- **Progress tracking** with percentage completion
- **Dependency management**
- **Checklist functionality**
- **Automation triggers**
- **Time tracking** (estimated vs. actual)

### 9. Scheduling and Calendar
- **Multi-type event management** (appointments, deadlines, inspections)
- **Recurring event support**
- **Availability management**
- **Third-party calendar integration**
- **Reminder systems**
- **Time-off management**

### 10. Integration Management
- **Pre-configured popular services** (email, SMS, payments, storage)
- **Encrypted credential storage**
- **API rate limiting** and quota management
- **Usage tracking** and analytics
- **Error handling** and logging

### 11. Property and Inspection Management
- **Detailed property specifications**
- **Construction detail tracking**
- **Inspection scheduling** and management
- **Damage assessment** storage
- **Photo and document attachments**
- **Repair cost estimation**

### 12. Analytics and Reporting
- **User activity tracking** and audit trails
- **Saved search functionality**
- **Usage analytics** across all modules
- **Performance monitoring**
- **Integration usage statistics**

## Advanced Features

### Multi-Tenant Architecture
- **Organization-level isolation** with RLS policies
- **Shared resource management** (integration providers)
- **Subscription tier management**
- **Module-based feature activation**

### Security and Compliance
- **Row Level Security** on all sensitive tables
- **Encrypted credential storage**
- **Audit trail maintenance**
- **Role-based permission system**
- **Data isolation** between organizations

### Scalability Features
- **JSONB storage** for flexible schema evolution
- **Array support** for multi-value fields
- **UUID primary keys** for distributed systems
- **Optimized indexing** for performance
- **Time zone aware timestamps**

### Extensibility
- **JSONB fields** for custom data storage
- **Tag-based organization** systems
- **Template-based communication**
- **Configurable workflows**
- **Plugin-ready integration system**

## Database Performance Optimizations

### Indexing Strategy
- **Composite indexes** on frequently queried combinations
- **Organization-scoped indexes** for multi-tenant queries
- **Date-based indexes** for time-series queries
- **Text search indexes** for document content

### Query Optimization
- **RLS policy optimization** for organization filtering
- **JSONB indexing** for flexible schema queries
- **Array indexing** for multi-value field searches
- **Foreign key constraints** for referential integrity

## Conclusion

The ClaimGuru database schema represents a **comprehensive insurance claim management system** with advanced CRM capabilities. Key strengths include:

### Technical Excellence
- **Multi-tenant architecture** with proper data isolation
- **Comprehensive security** implementation
- **Scalable design** with performance optimizations
- **Flexible schema** using JSONB for extensibility

### Business Value
- **Complete claim lifecycle** support
- **Advanced workflow management**
- **AI-powered insights** and automation
- **Comprehensive financial tracking**
- **Vendor and client relationship management**
- **Integration-ready architecture**

### Competitive Advantages
- **AI-powered document analysis** for faster processing
- **Comprehensive settlement management** with detailed tracking
- **Advanced vendor coordination** system
- **Multi-channel communication** management
- **Flexible integration framework**
- **Enterprise-grade security** and compliance features

The schema successfully supports a modern, feature-rich insurance claim management platform capable of competing with established industry solutions while providing unique AI-powered advantages and comprehensive workflow automation.

---

*Analysis completed on 2025-09-24. This report is based on the current database migration files and table definitions found in the Supabase schema.*