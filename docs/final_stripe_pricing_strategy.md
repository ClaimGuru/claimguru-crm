# Final Stripe Pricing Strategy for Public Insurance Adjuster CRM

## Competitive Analysis Summary

Based on research of ClaimTitan and ClaimWizard:
- **ClaimTitan**: $99/month + $99 per additional user, includes all features, granular permissions system
- **ClaimWizard**: Focus on workflow automation, scalability, custom roles and permissions
- **Industry Standard**: Role-based access with Public Adjusters, Staff/Admin, and Client portals

## Pricing Tiers Structure

### 1. **Free Tier** - "Starter"
- **Price**: $0/month
- **Users**: 1 user only
- **User Role**: Basic Admin (no claim assignment capability)
- **Key Limitations**:
  - 5 active claims maximum
  - Basic contact management (50 contacts)
  - Limited document storage (100MB)
  - Basic templates (3 templates)
  - No client portals
  - No automations
  - Community support only
- **Purpose**: Trial and very small operations

### 2. **Individual Tier** - "Professional"
- **Price**: $99/month
- **Users**: 2 users included
  - 1 Assigned User (Public Adjuster) - can have claims assigned
  - 1 Admin User (Staff) - cannot have claims assigned, handles administration
- **Additional Users**: +$59/month (max 1 additional user, must be Admin role)
- **Features**:
  - Unlimited active claims
  - Full contact management (unlimited)
  - Document storage (5GB)
  - Custom templates (unlimited)
  - Basic client portal
  - Email automations
  - Basic reporting
  - Email support
- **Claim Assignment**: Only the Assigned User can have claims assigned

### 3. **Firm Tier** - "Business"
- **Price**: $249/month
- **Users**: 7 users included by default
  - 3 Assigned Users (Public Adjusters) - can have claims assigned
  - 3 Admin Users (Staff) - cannot have claims assigned
  - 1 Sales User - lead management and conversion tracking
- **Additional Users**: +$59/month per user (unlimited)
  - Can be any role type (Assigned, Admin, or Sales)
- **Features**:
  - Everything in Individual, plus:
  - Advanced client portals with branding
  - Team collaboration tools
  - Advanced reporting and analytics
  - Workflow automations
  - API access
  - Priority support
  - Multi-location support
- **Claim Assignment**: All Assigned Users can have claims assigned

### 4. **Enterprise Tier** - "Custom Solutions"
- **Price**: Custom pricing (Schedule consultation)
- **Users**: Custom user count and roles
- **Features**:
  - Everything in Firm tier, plus:
  - Custom integrations
  - Advanced security features
  - Dedicated account manager
  - Custom training and onboarding
  - White-label options
  - Advanced API access
  - SLA guarantees
- **Sales Process**: Schedule consultation → Custom quote → Contract negotiation

## User Role Definitions

### **Assigned User (Public Adjuster)**
- **Primary Function**: Handle and manage insurance claims
- **Permissions**:
  - Can have claims assigned to them
  - Full claim management capabilities
  - Client communication
  - Document management
  - Settlement tracking
  - Report generation
- **Billing**: Counts toward paid user limits

### **Admin User (Staff)**
- **Primary Function**: Administrative support and system management
- **Permissions**:
  - Cannot have claims assigned
  - Contact management
  - Document organization
  - Template management
  - Basic reporting
  - User management (Firm+ tiers)
- **Billing**: Counts toward user limits but lower capability

### **Sales User**
- **Primary Function**: Lead management and business development
- **Permissions**:
  - Lead tracking and conversion
  - Pipeline management
  - Basic contact management
  - Sales reporting
  - Cannot access claim details
- **Billing**: Counts toward user limits
- **Availability**: Firm tier and above only

## Stripe Product Setup Structure

### Products to Create in Stripe:

1. **Individual Plan**
   - Recurring: $99/month
   - Description: "Professional plan for individual adjusters with 2 users included"

2. **Individual Additional User**
   - Recurring: $59/month
   - Description: "Additional admin user for Individual plan (max 1)"

3. **Firm Plan**
   - Recurring: $249/month
   - Description: "Business plan for firms with 7 users included (3 Assigned, 3 Admin, 1 Sales)"

4. **Firm Additional User**
   - Recurring: $59/month
   - Description: "Additional user for Firm plan (any role type)"

5. **Enterprise Consultation**
   - One-time: $0 (Free consultation)
   - Description: "Schedule consultation for custom Enterprise pricing"

## Feature Restrictions by Tier

| Feature | Free | Individual | Firm | Enterprise |
|---------|------|------------|------|------------|
| Active Claims | 5 | Unlimited | Unlimited | Unlimited |
| Users Included | 1 | 2 | 7 | Custom |
| Assigned Users | 0 | 1 | 3 | Custom |
| Admin Users | 1 | 1 | 3 | Custom |
| Sales Users | 0 | 0 | 1 | Custom |
| Additional Users | No | +$59 (max 1) | +$59 (unlimited) | Custom |
| Storage | 100MB | 5GB | 50GB | Unlimited |
| Client Portals | No | Basic | Advanced | Custom |
| Automations | No | Basic | Advanced | Custom |
| API Access | No | No | Yes | Advanced |
| Support | Community | Email | Priority | Dedicated |

## Implementation Notes

- **Claim Assignment Rule**: Only users with "Assigned" role can have claims assigned to them
- **User Role Hierarchy**: Assigned > Admin > Sales (in terms of system access)
- **Billing Logic**: Each additional user counts as a separate line item in Stripe
- **Upgrade Path**: Users can upgrade tiers and add users anytime
- **Downgrade Handling**: Requires manual review if exceeding new tier limits

This structure positions us competitively against ClaimTitan ($99 + $99/user) while offering better value with our $99 + $59/additional user model.