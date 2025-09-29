# ClaimGuru Database Schema Specification

## Executive Summary

The ClaimGuru database is a sophisticated multi-tenant insurance claims management system built on PostgreSQL with Supabase. The schema supports a comprehensive rolodex system, PDF processing with AI integration, subscription management, and advanced security through Row Level Security (RLS). The system processes insurance documents using multiple AI services (Google Vision, AWS Textract, OpenAI) and integrates with Stripe for billing.

## Introduction

This document provides a complete specification of the ClaimGuru database schema, including table structures, relationships, security policies, functions, views, and edge function integrations. The database is designed to handle complex insurance claims workflows while maintaining strict data isolation between organizations.

## Key Findings

### Database Architecture Overview

The ClaimGuru database follows a multi-tenant architecture with organization-based data isolation. Key architectural features include:

- **Multi-tenant Organization Model**: All data is scoped to organizations with strict RLS policies
- **Comprehensive Rolodex System**: Unified contact management across clients, carriers, vendors, personnel, and lenders
- **AI-Powered PDF Processing**: Multiple AI service integrations for document analysis
- **Subscription Management**: Full Stripe integration for billing and subscription handling
- **Audit Trail**: Comprehensive tracking of communications, relationships, and performance metrics
- **Flexible Claims System**: Support for complex claim associations and workflows

## Database Schema Documentation

### Core Entity Tables

#### 1. Organizations Table
**Purpose**: Central tenant table for multi-tenant architecture
**Referenced by**: All major tables through `organization_id` foreign keys

**Key Columns**:
- `id` (UUID) - Primary key
- Organization details and configuration
- Subscription and billing information

#### 2. User Profiles Table
**Purpose**: User management and organization associations
**Security**: Links users to organizations for RLS enforcement

**Key Columns**:
- `user_id` (UUID) - References Supabase Auth users
- `organization_id` (UUID) - Organization association
- `role` (VARCHAR) - User role (admin, user, etc.)
- `email` (VARCHAR) - User email address

### Claims Management Tables

#### 3. Claims Table (Enhanced)
**Purpose**: Core claims management with relational enhancements

**Key Enhancements**:
```sql
-- Relational columns added in migration 1754000000
ADD COLUMN IF NOT EXISTS primary_client_id UUID REFERENCES clients(id),
ADD COLUMN IF NOT EXISTS primary_carrier_id UUID REFERENCES insurance_carriers(id),
ADD COLUMN IF NOT EXISTS assigned_adjuster_id UUID,
ADD COLUMN IF NOT EXISTS primary_vendor_id UUID REFERENCES vendors(id),
ADD COLUMN IF NOT EXISTS policy_effective_date DATE,
ADD COLUMN IF NOT EXISTS policy_expiration_date DATE
```

**Indexes**:
- `idx_claims_primary_client` - Client lookups
- `idx_claims_primary_carrier` - Carrier lookups
- `idx_claims_assigned_adjuster` - Adjuster assignments
- `idx_claims_referral_source` - Referral tracking

#### 4. Claim Associations Table
**Purpose**: Flexible many-to-many relationships between claims and all entity types

**Key Features**:
- Generic entity association (`entity_type`, `entity_id`)
- Role definitions (`association_type`, `role_in_claim`)
- Performance tracking per claim
- Communication scheduling

**Columns**:
```sql
- id (UUID, Primary Key)
- claim_id (UUID, NOT NULL)
- entity_type (VARCHAR(50)) -- client, carrier, vendor, etc.
- entity_id (UUID) -- Generic entity reference
- association_type (VARCHAR(100)) -- primary, secondary, emergency
- role_in_claim (VARCHAR(100)) -- adjuster, contractor, lender
- status (VARCHAR(50)) -- active, inactive, completed
- primary_contact (BOOLEAN)
- performance_rating (INTEGER 1-5)
- response_time_hours (INTEGER)
```

### Rolodex System Tables

#### 5. Clients Table (Enhanced)
**Purpose**: Client contact management with relationship tracking

**Enhanced Columns**:
```sql
ADD COLUMN IF NOT EXISTS client_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS communication_preferences JSONB,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE
```

#### 6. Insurance Carriers Table (Enhanced)
**Purpose**: Insurance carrier management with performance tracking

**Enhanced Columns**:
```sql
ADD COLUMN IF NOT EXISTS carrier_group VARCHAR(255),
ADD COLUMN IF NOT EXISTS financial_rating VARCHAR(10),
ADD COLUMN IF NOT EXISTS specializes_in TEXT[],
ADD COLUMN IF NOT EXISTS service_areas TEXT[],
ADD COLUMN IF NOT EXISTS average_response_time_hours INTEGER,
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE
```

#### 7. Vendors Table (Enhanced)
**Purpose**: Vendor management with comprehensive business tracking

**Enhanced Columns**:
```sql
ADD COLUMN IF NOT EXISTS vendor_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS certification_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS equipment_owned JSONB,
ADD COLUMN IF NOT EXISTS performance_metrics JSONB,
ADD COLUMN IF NOT EXISTS contract_terms JSONB,
ADD COLUMN IF NOT EXISTS backup_vendors TEXT[]
```

#### 8. Carrier Personnel Table (New)
**Purpose**: Individual contact management within insurance carriers

**Key Features**:
- Complete contact information
- Professional credentials and licensing
- Territory and capacity management
- Performance and relationship tracking

**Structure**:
```sql
CREATE TABLE carrier_personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    carrier_id UUID REFERENCES insurance_carriers(id),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    
    -- Professional Information
    department VARCHAR(100),
    personnel_type VARCHAR(50), -- adjuster, supervisor, manager
    specialties TEXT[],
    
    -- Contact Information
    primary_email VARCHAR(255),
    office_phone VARCHAR(50),
    mobile_phone VARCHAR(50),
    
    -- Professional Credentials
    license_number VARCHAR(100),
    license_state VARCHAR(10),
    license_expiration DATE,
    certifications JSONB,
    
    -- Performance & Relationship
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
    communication_style VARCHAR(100),
    response_time_hours INTEGER,
    
    -- Tracking
    last_contact_date TIMESTAMP WITH TIME ZONE,
    total_claims_handled INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 9. Mortgage Lenders Table (New)
**Purpose**: Mortgage lender contact and relationship management

**Key Features**:
- Complete lender information and licensing
- Service area and loan type tracking
- Performance metrics and relationship management

**Structure**:
```sql
CREATE TABLE mortgage_lenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    -- Lender Information
    lender_name VARCHAR(255) NOT NULL,
    lender_type VARCHAR(100), -- bank, credit_union, mortgage_company
    federal_id VARCHAR(50),
    nmls_id VARCHAR(50),
    
    -- Business Information
    years_in_business INTEGER,
    license_states TEXT[],
    loan_types_offered TEXT[],
    service_areas TEXT[],
    
    -- Performance Tracking
    response_time_hours INTEGER,
    processing_time_days INTEGER,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    
    -- Relationship Management
    relationship_manager VARCHAR(255),
    account_status VARCHAR(50) DEFAULT 'active',
    last_contact_date TIMESTAMP WITH TIME ZONE
);
```

### Relationship and Communication Tables

#### 10. Entity Relationships Table (New)
**Purpose**: Track business relationships between any entities

**Key Features**:
- Generic entity-to-entity relationships
- Business impact assessment
- Relationship strength and reciprocity tracking

**Structure**:
```sql
CREATE TABLE entity_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    -- Relationship Definition
    entity_1_type VARCHAR(50) NOT NULL,
    entity_1_id UUID NOT NULL,
    entity_2_type VARCHAR(50) NOT NULL,
    entity_2_id UUID NOT NULL,
    
    -- Relationship Details
    relationship_type VARCHAR(100), -- vendor_partnership, referral_source
    relationship_strength VARCHAR(50), -- weak, moderate, strong
    business_value VARCHAR(50), -- low, medium, high, critical
    
    -- Business Impact
    revenue_impact DECIMAL(12,2),
    volume_impact INTEGER,
    
    UNIQUE(entity_1_type, entity_1_id, entity_2_type, entity_2_id, relationship_type)
);
```

#### 11. Communication History Table (New)
**Purpose**: Comprehensive communication tracking across all entities

**Key Features**:
- Universal communication logging
- Follow-up tracking and automation
- Claim association for context
- Rich metadata and attachment support

**Structure**:
```sql
CREATE TABLE communication_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    -- Communication Participants
    claim_id UUID, -- Optional claim association
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Communication Details
    communication_type VARCHAR(50) NOT NULL, -- email, phone, meeting, text
    direction VARCHAR(20) NOT NULL, -- inbound, outbound
    subject VARCHAR(500),
    content TEXT,
    
    -- Metadata
    communication_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    duration_minutes INTEGER,
    outcome VARCHAR(100), -- successful, no_answer, follow_up_needed
    priority VARCHAR(20) DEFAULT 'normal',
    
    -- Follow-up Tracking
    requires_follow_up BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_completed BOOLEAN DEFAULT false,
    
    -- Attachments and References
    attachments JSONB,
    reference_numbers TEXT[],
    tags TEXT[]
);
```

### PDF Processing and AI Integration Tables

#### 12. Processing Usage Table
**Purpose**: Track API usage and costs for billing

**Key Features**:
- Service-specific tracking (Textract, Vision, OpenAI)
- Page count and cost calculation
- Document-level attribution

**Structure**:
```sql
CREATE TABLE processing_usage (
    id SERIAL PRIMARY KEY,
    organization_id TEXT NOT NULL,
    service TEXT NOT NULL,
    document_name TEXT,
    page_count INTEGER NOT NULL DEFAULT 1,
    cost DECIMAL(10, 4) NOT NULL DEFAULT 0,
    processing_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT organization_id_fk FOREIGN KEY (organization_id) 
        REFERENCES organizations (id) ON DELETE CASCADE
);
```

#### 13. Organization Processing Limits Table
**Purpose**: Control and limit API usage per organization

**Structure**:
```sql
CREATE TABLE organization_processing_limits (
    organization_id TEXT PRIMARY KEY,
    monthly_page_limit INTEGER NOT NULL DEFAULT 1000,
    maximum_cost_limit DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    default_processing_method TEXT NOT NULL DEFAULT 'auto',
    enable_textract BOOLEAN NOT NULL DEFAULT TRUE,
    enable_vision BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### 14. PDF Extraction Cache Table
**Purpose**: Cache processed PDF results to avoid reprocessing

**Key Features**:
- File hash-based deduplication
- Multi-format extracted data (text, form fields, policy data)
- Processing method and confidence tracking

**Structure**:
```sql
CREATE TABLE pdf_extraction_cache (
    file_hash TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    file_name TEXT,
    file_size INTEGER,
    extracted_text TEXT,
    page_count INTEGER,
    confidence DECIMAL(5, 4),
    processing_method TEXT,
    policy_data JSONB,
    form_fields JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (file_hash, organization_id)
);
```

#### 15. AI Token Usage Table
**Purpose**: Track OpenAI token usage and costs

**Structure**:
```sql
CREATE TABLE ai_token_usage (
    id SERIAL PRIMARY KEY,
    organization_id TEXT NOT NULL,
    feature TEXT NOT NULL,
    token_count INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 4) NOT NULL DEFAULT 0,
    usage_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Views and Functions

#### Views

##### 1. rolodex_unified_contacts
**Purpose**: Unified view of all contact types for search and display

**Features**:
- Standardized contact information across entity types
- Active status filtering
- Consistent naming and structure

##### 2. claim_entity_relationships
**Purpose**: Join claims with their associated entities

**Features**:
- Complete relationship context
- Performance metrics integration
- Contact scheduling information

##### 3. entity_performance_summary
**Purpose**: Aggregate performance metrics across all entity types

**Features**:
- Cross-entity performance comparison
- Communication statistics
- Claim participation metrics

##### 4. monthly_processing_summary
**Purpose**: Billing and usage reporting for PDF processing

##### 5. monthly_ai_token_summary
**Purpose**: AI token usage reporting for billing

#### Functions

##### 1. search_rolodex()
**Purpose**: Full-text search across all entity types
**Parameters**: 
- `search_term` (TEXT)
- `entity_types` (TEXT[]) 
- `limit_per_type` (INTEGER)

**Returns**: Unified search results with relevance scoring

##### 2. get_claim_contacts()
**Purpose**: Get all contacts associated with a specific claim
**Parameters**: `p_claim_id` (UUID)
**Returns**: Complete contact list with roles and priorities

##### 3. add_entity_to_claim()
**Purpose**: Associate an entity with a claim
**Parameters**: Entity details and relationship information
**Returns**: Association ID

##### 4. log_communication()
**Purpose**: Record communication events and update contact dates
**Parameters**: Communication details and metadata
**Returns**: Communication ID

**Features**:
- Automatic last contact date updates
- Multi-entity communication support
- Follow-up scheduling

##### 5. get_entity_performance_metrics()
**Purpose**: Calculate comprehensive performance metrics for entities
**Parameters**: Entity type and ID
**Returns**: Performance statistics and trends

##### 6. create_entity_relationship()
**Purpose**: Establish relationships between entities
**Parameters**: Entity details and relationship metadata
**Returns**: Relationship ID

**Features**:
- Duplicate prevention
- Business value assessment
- Reciprocal relationship handling

### Row Level Security (RLS) Policies

#### Security Architecture

All tables implement organization-based RLS policies using the following pattern:

```sql
-- Example RLS pattern used across all tables
CREATE POLICY "org_isolation_[table]_[operation]" ON public.[table]
FOR [SELECT|INSERT|UPDATE|DELETE] 
USING/WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.organization_id = [table].organization_id
    )
);
```

#### Protected Tables

The following tables have comprehensive RLS protection:

**Core Tables**:
- `claims`
- `clients` 
- `insurance_carriers`
- `vendors`
- `user_profiles`
- `organizations`

**Rolodex Tables**:
- `carrier_personnel`
- `mortgage_lenders`
- `claim_associations`
- `entity_relationships`
- `communication_history`

**Processing Tables**:
- `processing_usage`
- `organization_processing_limits`
- `pdf_extraction_cache`
- `ai_token_usage`

**Security-Fixed Tables** (Migration 1753314540):
- `lead_assignments`
- `lead_sources`
- `sales_funnel_stages`
- `lead_appointments`
- `document_template_categories`
- `document_template_variables`
- `document_signatures`

#### Policy Types

Each protected table implements four policy types:
1. **SELECT Policy**: Read access control
2. **INSERT Policy**: Creation permission control
3. **UPDATE Policy**: Modification permission control
4. **DELETE Policy**: Deletion permission control

Special considerations:
- Admin-only policies for sensitive operations (e.g., processing limits)
- Service role bypass for edge functions
- Audit trail preservation

## Edge Functions

### Function Categories

#### 1. Subscription Management Functions

##### create-subscription
**Purpose**: Create Stripe checkout sessions for subscription signup
**Key Features**:
- Customer creation/retrieval
- Plan configuration from database
- Checkout session generation
- Metadata tracking

**Database Interactions**:
- Reads from `stripe_plans` table
- Integration with Stripe API

##### manage-subscription
**Purpose**: Customer subscription self-service portal
**Key Features**:
- Customer portal session creation
- Subscription cancellation
- Plan upgrades/downgrades

**Actions Supported**:
- `create_portal_session`
- `cancel_subscription`
- `update_subscription`

#### 2. AI/ML Processing Functions

##### google-vision-extract
**Purpose**: Google Vision API text extraction
**Key Features**:
- OCR text extraction
- Confidence scoring
- Error handling and logging

**Processing Flow**:
1. Receive base64 image data
2. Call Google Vision API
3. Extract and process text
4. Return structured results

##### google-vision-processor
**Purpose**: Enhanced Google Vision processing with form field extraction
**Key Features**:
- Document text detection
- Form field identification
- Insurance-specific data extraction
- Cost calculation

**Data Extraction Patterns**:
- Policy numbers
- Insured names and addresses
- Coverage amounts and deductibles
- Effective and expiration dates

##### openai-extract-fields
**Purpose**: Basic OpenAI field extraction
**Key Features**:
- GPT-3.5 Turbo integration
- JSON response parsing
- Insurance document analysis

##### openai-extract-fields-enhanced
**Purpose**: Advanced OpenAI extraction with specialized insurance logic
**Key Features**:
- GPT-4 Mini integration
- Coinsured detection logic
- Hurricane deductible consolidation
- Comprehensive field mapping

**Advanced Features**:
- **Coinsured Detection**: Identifies secondary insured parties
- **Deductible Consolidation**: Unifies hurricane/windstorm/named storm deductibles
- **Property Address Recognition**: Multiple address field patterns

##### openai-service
**Purpose**: Unified OpenAI service with multiple processing modes
**Supported Modes**:
- `document_analysis`: Policy document field extraction
- `claim_analysis`: Claim assessment and recommendations
- `recommendations`: Context-specific advice generation

##### textract-pdf-processor
**Purpose**: AWS Textract PDF processing with advanced features
**Key Features**:
- AWS Signature v4 authentication
- Form and table extraction
- Query-based data extraction
- Comprehensive insurance field mapping

**Security**: Full AWS credential handling and signature generation

#### 3. Payment Integration Functions

##### stripe-webhook
**Purpose**: Handle Stripe webhook events for subscription lifecycle
**Supported Events**:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Database Operations**:
- Updates `stripe_subscriptions` table
- Customer and user profile management
- Payment status tracking

### Shared Utilities

#### cors.ts
**Purpose**: Standardized CORS headers for all edge functions
**Features**:
- Permissive CORS configuration
- Consistent security headers
- Options request handling

## Integration Points and API Interfaces

### External API Integrations

#### Stripe Integration
**Components**:
- Subscription creation and management
- Customer portal access
- Webhook event processing
- Payment status tracking

**Database Tables**:
- `stripe_plans`
- `stripe_subscriptions`
- `stripe_customers`

#### Google Cloud Integration
**Services**:
- Google Vision API for OCR
- Google Maps API (referenced in configurations)

**Authentication**: API key-based

#### AWS Integration
**Services**:
- AWS Textract for advanced document processing
- Full AWS Signature v4 implementation

**Authentication**: Access key and secret key with regional configuration

#### OpenAI Integration
**Services**:
- GPT-3.5 Turbo for basic extraction
- GPT-4 Mini for enhanced processing
- Multiple specialized prompts for different use cases

**Authentication**: API key-based

### Internal API Patterns

#### Database Access Patterns
- **Supabase PostgREST**: RESTful database access
- **Service Role**: Elevated permissions for edge functions
- **Row Level Security**: Automatic data isolation

#### Authentication Flow
1. **User Authentication**: Supabase Auth integration
2. **Organization Resolution**: User profile lookup
3. **RLS Enforcement**: Automatic policy application
4. **Function Authorization**: Service role for edge functions

## Conclusion

The ClaimGuru database represents a sophisticated, multi-tenant insurance claims management system with comprehensive features for contact management, AI-powered document processing, and subscription billing. The schema is designed for scalability, security, and extensibility while maintaining strict data isolation between organizations.

### Key Strengths

1. **Security-First Design**: Comprehensive RLS implementation ensures data isolation
2. **Flexible Rolodex System**: Unified contact management across all entity types  
3. **AI Integration**: Multiple AI services for document processing with cost tracking
4. **Relationship Tracking**: Detailed business relationship and communication history
5. **Scalable Architecture**: Multi-tenant design with performance optimization
6. **Billing Integration**: Complete Stripe integration for subscription management

### Architecture Benefits

- **Data Integrity**: Foreign key constraints and validation
- **Performance**: Strategic indexing and view optimization
- **Auditability**: Comprehensive tracking and logging
- **Maintainability**: Clear separation of concerns and modular design
- **Extensibility**: Generic entity system supports future growth

The system successfully balances complexity with usability, providing powerful features while maintaining clean, organized data structures and reliable security boundaries.

## Sources

[1] [Migration 1752257398: PDF Processing Tables](claimguru/supabase/migrations/1752257398_create_pdf_processing_tables.sql) - High Reliability - Direct database migration file
[2] [Migration 1753314540: RLS Security Vulnerabilities Fix](claimguru/supabase/migrations/1753314540_fix_rls_security_vulnerabilities.sql) - High Reliability - Direct database migration file  
[3] [Migration 1754000000: Relational Rolodex System](claimguru/supabase/migrations/1754000000_create_relational_rolodex_system.sql) - High Reliability - Direct database migration file
[4] [Migration 1754000001: Rolodex Views and Functions](claimguru/supabase/migrations/1754000001_add_rolodex_views_and_functions.sql) - High Reliability - Direct database migration file
[5] [Migration 1755707291: Policy Dates](claimguru/supabase/migrations/1755707291_add_policy_dates_to_claims.sql) - High Reliability - Direct database migration file
[6] [Security Deployment Fix](claimguru/supabase/deploy_security_fix.sql) - High Reliability - Direct security fix script
[7] [Edge Functions Directory](claimguru/supabase/functions/) - High Reliability - Complete edge function implementation files