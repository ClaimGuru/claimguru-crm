# ClaimGuru Pages & Routing Specification

## Table of Contents
1. [Application Architecture](#application-architecture)
2. [Routing Configuration](#routing-configuration)
3. [Route Protection Patterns](#route-protection-patterns)
4. [Page Categories](#page-categories)
5. [Detailed Page Analysis](#detailed-page-analysis)
6. [Data Flow & Dependencies](#data-flow--dependencies)
7. [Lazy Loading Strategy](#lazy-loading-strategy)

## Application Architecture

ClaimGuru is built as a React SPA (Single Page Application) with React Router for client-side routing. The application follows a multi-tenant architecture with organization-based data isolation.

### Key Architectural Patterns
- **Route-based Code Splitting**: Critical pages are lazy-loaded for optimal performance
- **Protected Routes**: Authentication and authorization middleware
- **Context-based State Management**: Auth, Toast, and Notification contexts
- **Nested Routing**: Dashboard layout wraps all main application pages
- **Progressive Enhancement**: Graceful loading states and error boundaries

## Routing Configuration

### Route Hierarchy (App.tsx)

```
/ (Root)
├── / (LandingPage - Public)
├── /auth (AuthPage - Public)
├── /auth/callback (AuthCallback - Public)
├── /onboarding (OnboardingPage - Protected)
└── /dashboard/* (Layout - Protected)
    ├── / (Dashboard - Lazy)
    ├── /claims (Claims - Lazy)
    ├── /claims/new (Claims with new flow)
    ├── /test-claims (TestClaims)
    ├── /direct-feature-test (DirectFeatureTest)
    ├── /clients (Clients - Lazy)
    ├── /client-management (ClientManagement)
    ├── /lead-management (LeadManagement)
    ├── /sales-pipeline (Placeholder)
    ├── /lead-sources (Placeholder)
    ├── /referrals (Placeholder)
    ├── /properties (Properties)
    ├── /tasks (Tasks)
    ├── /documents (Documents - Lazy)
    ├── /communications (Communications)
    ├── /vendors (Vendors)
    ├── /vendors/new (CreateVendor)
    ├── /vendors/:id/edit (EditVendor)
    ├── /attorneys/new (CreateAttorney)
    ├── /attorneys/:id/edit (EditAttorney)
    ├── /referral-sources/new (CreateReferralSource)
    ├── /referral-sources/:id/edit (EditReferralSource)
    ├── /crm (CRMEntityManagement)
    ├── /insurers (Insurers)
    ├── /settlements (Settlements)
    ├── /financial (Finance)
    ├── /finance (Finance - alias)
    ├── /calendar (Calendar)
    ├── /integrations (Integrations)
    ├── /analytics (Placeholder)
    ├── /settings (Settings)
    ├── /billing (Billing)
    ├── /notifications (Notifications)
    ├── /admin (AdminPanel)
    └── /help (Placeholder)
```

## Route Protection Patterns

### Route Types

1. **Public Routes**
   - LandingPage (`/`)
   - AuthPage (`/auth`)
   - AuthCallback (`/auth/callback`)

2. **Protected Routes** (require authentication)
   - All `/dashboard/*` routes
   - OnboardingPage (`/onboarding`)

3. **Conditional Routes** (based on user state)
   - Onboarding redirect if `needsOnboarding` is true
   - Auto-redirect to dashboard if already authenticated

### Protection Implementation

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth()
  
  // Show loading skeleton during auth check
  if (loading) return <SkeletonDashboard />
  
  // Redirect to auth if not logged in
  if (!user) return <Navigate to="/auth" replace />
  
  // Force onboarding if needed
  if (needsOnboarding && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <>
      <PageTransition>{children}</PageTransition>
      <ShortcutsHelp />
    </>
  )
}
```

## Page Categories

### 1. **Authentication & Access**
- **LandingPage** - Marketing/sales landing page
- **AuthPage** - Login/signup forms with feature showcase
- **AuthCallback** - OAuth callback handler
- **OnboardingPage** - Multi-step organization setup

### 2. **Core Business (Lazy-loaded)**
- **Dashboard** - Main overview with stats and quick actions
- **Claims** - Claims management with AI wizards
- **Clients** - Client relationship management
- **Documents** - Document storage and management

### 3. **CRM & Relationship Management**
- **ClientManagement** - Comprehensive client records
- **LeadManagement** - Sales pipeline and lead tracking
- **CRMEntityManagement** - Vendor/attorney management
- **CreateVendor/EditVendor** - Vendor CRUD operations
- **CreateAttorney/EditAttorney** - Attorney CRUD operations
- **CreateReferralSource/EditReferralSource** - Referral source management

### 4. **Financial Management**
- **Finance** - Financial dashboard and fee management
- **Billing** - Subscription and billing management

### 5. **Communication & Coordination**
- **Communications** - Email automation and AI processing
- **Calendar** - Event scheduling and management
- **Notifications** - System notifications and alerts

### 6. **Administrative & Configuration**
- **AdminPanel** - System administration with custom fields
- **Integrations** - Third-party service connections
- **Insurers** - Insurance carrier management

### 7. **AI & Analytics**
- **AIInsights** - AI-powered analytics and predictions

### 8. **Development & Testing**
- **DirectFeatureTest** - Development testing interface

## Detailed Page Analysis

### Core Business Pages

#### Dashboard (Lazy-loaded)
- **Purpose**: Central command center with overview metrics
- **Key Features**: 
  - Real-time statistics cards
  - Recent claims list
  - Activity feed
  - Quick action buttons
  - AI dashboard toggle
  - Analytics dashboard integration
- **Data Dependencies**: Claims, clients, tasks, activities, vendors
- **Context Usage**: Auth, Notifications
- **Hooks**: useClaims, useClients, useIsMobile

#### Claims (Lazy-loaded)
- **Purpose**: Complete claims lifecycle management
- **Key Features**:
  - Claims list with filtering/search
  - Manual intake wizard
  - AI-enhanced intake wizard
  - Claim details modal
  - Status tracking
  - Financial metrics
- **Data Dependencies**: Claims, clients via useClaims and useClients hooks
- **Navigation**: Supports `/claims/new` routing
- **Forms**: ClaimForm, ManualIntakeWizard, EnhancedAIIntakeWizard

#### Clients (Lazy-loaded)
- **Purpose**: Client relationship and contact management
- **Key Features**:
  - Client listing with search/filters
  - Enhanced client form with co-insured support
  - Client details modal
  - Create claim flow integration
  - Business/individual client types
- **Data Dependencies**: Clients, claims data
- **Forms**: EnhancedClientForm, ClientDetailsModal, CreateClaimModal

#### Documents (Lazy-loaded)
- **Purpose**: Document storage and organization
- **Implementation**: Wrapper for AdvancedDocumentManager component
- **Features**: Centralized document management system

### Authentication Flow

#### LandingPage
- **Purpose**: Public marketing page with pricing and features
- **Key Sections**:
  - Hero section with value proposition
  - Feature showcase grid
  - Pricing tiers (Individual $99, Firm $249, Additional User $59)
  - Customer testimonials
  - Call-to-action sections
- **Navigation**: Links to AuthPage for signup/signin

#### AuthPage
- **Purpose**: Authentication with feature marketing
- **Features**:
  - Login/signup form toggle
  - Feature showcase sidebar
  - Security and trial information
- **Forms**: LoginForm, SignupForm components

#### AuthCallback
- **Purpose**: OAuth callback processing
- **Features**:
  - Email verification handling
  - User profile creation
  - Automatic redirection
  - Error handling with retry options

#### OnboardingPage
- **Purpose**: Multi-step organization setup
- **Steps**:
  1. Personal Information (name, phone)
  2. Practice Details (license, firm info, specialties)
  3. Preferences (plan selection, notifications)
- **Features**:
  - Progress tracking
  - Form validation
  - Organization creation
  - Plan selection

### Administrative Pages

#### AdminPanel
- **Purpose**: System administration and configuration
- **Tabs**:
  - Custom Fields - Dynamic field management
  - Folder Templates - Automated document organization
  - Permissions - User role management
  - Communications - Integration settings
  - User Management - Organization users
  - System Settings - General configuration
- **Security**: Requires admin privileges

#### Integrations
- **Purpose**: Third-party service management
- **Features**:
  - Provider catalog
  - Connection status monitoring
  - Credential management (encrypted)
  - Setup wizards
  - Usage analytics
- **Security**: Encrypted credential storage

### Communication Suite

#### Communications
- **Purpose**: Email automation and AI processing
- **Tabs**:
  - Email System - AI processing dashboard
  - Phone System - Amazon Connect integration (placeholder)
  - SMS System - SMS automation (placeholder)
  - Settings - Configuration options
- **Features**:
  - Real-time email statistics
  - AI classification metrics
  - Integration status monitoring

#### Calendar
- **Purpose**: Event and appointment management
- **Features**:
  - Month/week/day views
  - Event creation and editing
  - Recurring events support
  - Integration with claims/clients
  - Event filtering and search
- **Components**: MonthView, EventModal

#### Notifications
- **Purpose**: System notification management
- **Features**:
  - Notification categorization
  - Bulk actions (mark read/unread/delete)
  - Priority filtering
  - Search functionality
  - Statistics dashboard

### Financial Management

#### Finance
- **Purpose**: Comprehensive financial tracking
- **Tabs**:
  - Overview - Financial metrics and charts
  - Fee Schedules - Fee management
  - Expenses - Expense tracking
  - Payments - Payment processing
  - Analytics - Financial analytics
- **Features**:
  - Real-time financial metrics
  - Monthly revenue tracking
  - Export functionality
  - Date range filtering

### CRM & Lead Management

#### LeadManagement
- **Purpose**: Sales pipeline and lead conversion
- **Views**:
  - List View - Lead listing with filters
  - Pipeline View - Visual funnel (placeholder)
  - Analytics View - Performance metrics (placeholder)
- **Features**:
  - Lead scoring
  - Source tracking
  - Stage management
  - Conversion to client
  - Communication tracking

#### ClientManagement
- **Purpose**: Advanced client record management
- **Features**:
  - Permission-based access control
  - Comprehensive client data
  - Advanced search and filtering
  - Bulk operations
- **Security**: Role-based permissions (subscriber vs. granted users)

### AI & Analytics

#### AIInsights
- **Purpose**: AI-powered analytics and predictions
- **Tabs**:
  - Overview - Insight summary
  - Settlement Predictor - AI prediction tool
  - Analytics Dashboard - Advanced AI dashboard
  - Document Analysis - AI document processing
- **Features**:
  - Confidence scoring
  - Risk assessment
  - Opportunity identification
  - Document upload and analysis

## Data Flow & Dependencies

### State Management Hierarchy

```
App
├── AuthProvider (User authentication state)
├── NotificationProvider (System notifications)
└── ToastProvider (User feedback messages)
    └── Router
        └── Routes (with protection logic)
```

### Data Hooks Usage

| Page | Primary Hooks | Secondary Hooks |
|------|---------------|-----------------|
| Dashboard | useClaims, useClients | useAuth, useNotifications, useIsMobile |
| Claims | useClaims, useClients | useAuth |
| Clients | useClients, useClaims | useAuth |
| Documents | - | useAuth |
| Finance | useAuth | useToast |
| Communications | - | useAuth |
| Calendar | useAuth | useToast |
| Notifications | - | useAuth |

### Database Dependencies

#### Supabase Tables Used
- `claims` - Claims data
- `clients` - Client information
- `user_profiles` - User account data
- `organizations` - Organization/tenant data
- `notifications` - System notifications
- `events` - Calendar events
- `fee_schedules` - Financial data
- `expenses` - Expense tracking
- `payments` - Payment records
- `insurers` - Insurance carrier data
- `integration_providers` - Available integrations
- `organization_integrations` - Configured integrations

## Lazy Loading Strategy

### Lazy-loaded Components
Only the most critical/large pages are lazy-loaded to optimize initial bundle size:

```typescript
const Dashboard = React.lazy(() => 
  import('./pages/Dashboard').then(module => ({ default: module.Dashboard }))
);
const Claims = React.lazy(() => 
  import('./pages/Claims').then(module => ({ default: module.Claims }))
);
const Clients = React.lazy(() => 
  import('./pages/Clients').then(module => ({ default: module.Clients }))
);
const Documents = React.lazy(() => 
  import('./pages/Documents').then(module => ({ default: module.Documents }))
);
```

### Loading States
- **SkeletonDashboard** - Used for route protection loading
- **LoadingSpinner** - Used for lazy component loading
- **Component-specific** - Individual pages implement their own loading states

### Error Boundaries
- Page-level error boundaries with fallback UI
- Graceful degradation for failed lazy loads
- Retry mechanisms in critical flows

## Key Patterns & Best Practices

### 1. **Consistent Navigation**
- All dashboard routes wrapped in Layout component
- Breadcrumb navigation maintained
- Active route highlighting

### 2. **Progressive Enhancement**
- Loading states for all async operations
- Skeleton loaders for better perceived performance
- Graceful error handling

### 3. **Security First**
- Route-level authentication checks
- Organization-based data isolation
- Permission-based UI rendering

### 4. **Performance Optimization**
- Strategic lazy loading
- Efficient re-rendering patterns
- Proper dependency arrays in hooks

### 5. **User Experience**
- Consistent form validation
- Keyboard shortcut support
- Mobile-responsive design
- Toast notifications for feedback

## Conclusion

The ClaimGuru application demonstrates a well-architected React application with:

- **Comprehensive routing** with proper protection and lazy loading
- **Modular page structure** organized by business function
- **Consistent patterns** across authentication, data management, and user interaction
- **Scalable architecture** supporting multi-tenant operations
- **Performance optimization** through strategic code splitting
- **Rich feature set** covering the complete claims management workflow

The routing and page structure supports both the current feature set and future expansion, with clear separation of concerns and maintainable code organization.
