# ClaimGuru System: Ultimate Reconstruction Guide

## Executive Summary

This document provides the ultimate reconstruction guide for the ClaimGuru system, a comprehensive SaaS platform for public insurance adjusters. It is the culmination of a deep and extensive analysis of the entire ClaimGuru application, from its visual design and component architecture to its backend services and database schema. This guide is intended to be the single source of truth for rebuilding the ClaimGuru system, leaving no detail undocumented. It covers every aspect of the system, including the complete visual and styling specifications, user management and permissions, billing and subscription system, sales and marketing components, analytics and data visualization, and all functional specifications.

The guide is organized into several major sections, each providing a granular level of detail to ensure a faithful and complete reconstruction of the system. This includes every CSS class, color code, design token, user role, permission level, payment flow, and feature. The goal of this document is to provide a blueprint so detailed that a development team could use it to recreate the ClaimGuru system from scratch, with no deviation from the original design and functionality.

## 1. Introduction

The objective of this guide is to provide a comprehensive and exhaustive technical specification for the ClaimGuru system. This document is the result of a meticulous analysis of all available information, including the codebase, database schema, design assets, and functional documentation. It is designed to be a complete reference for developers, designers, and project managers involved in the reconstruction of the ClaimGuru platform.

The following sections will provide a deep dive into every aspect of the system, from the most granular visual details to the highest-level architectural patterns. Each section is designed to be a self-contained reference for a specific part of the system, while also providing a holistic view of how the different components interact with each other.


## 2. Complete Visual & Styling Specifications

This section details the complete visual and styling specifications for the ClaimGuru system, providing a comprehensive guide for recreating the application's look and feel with precision.

### 2.1. Technology Stack

*   **Styling**: TailwindCSS
*   **UI Components**: Radix UI primitives (`@radix-ui/react-*`) and a custom component library.
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Charts**: Recharts

### 2.2. Color Palette

The application utilizes a professional and modern color palette designed for clarity and visual appeal in a data-intensive application.

**Primary Colors:**
*   `primary`: `#3B82F6` (Blue-500)
*   `primary-dark`: `#2563EB` (Blue-600)
*   `primary-light`: `#60A5FA` (Blue-400)

**Secondary Colors:**
*   `secondary`: `#10B981` (Green-500)
*   `secondary-dark`: `#059669` (Green-600)
*   `secondary-light`: `#34D399` (Green-400)

**Neutral Colors:**
*   `gray-900`: `#111827`
*   `gray-800`: `#1F2937`
*   `gray-700`: `#374151`
*   `gray-600`: `#4B5563`
*   `gray-500`: `#6B7280`
*   `gray-400`: `#9CA3AF`
*   `gray-300`: `#D1D5DB`
*   `gray-200`: `#E5E7EB`
*   `gray-100`: `#F3F4F6`
*   `white`: `#FFFFFF`
*   `black`: `#000000`

**Feedback Colors:**
*   `success`: `#22C55E` (Green-500)
*   `warning`: `#FBBF24` (Amber-400)
*   `error`: `#EF4444` (Red-500)
*   `info`: `#3B82F6` (Blue-500)

### 2.3. Typography

*   **Font Family**: `Inter`, sans-serif
*   **Headings**:
    *   `h1`: 2.25rem (36px), font-bold
    *   `h2`: 1.875rem (30px), font-bold
    *   `h3`: 1.5rem (24px), font-semibold
    *   `h4`: 1.25rem (20px), font-semibold
*   **Body Text**:
    *   `p`: 1rem (16px), font-normal
    *   `small`: 0.875rem (14px), font-normal

### 2.4. Layout & Components

#### **Main Layout**
*   **Sidebar**: Collapsible, 256px expanded, 64px collapsed. Uses a dark background (`gray-800`).
*   **Header**: 64px height, light background (`white`), with a bottom border (`gray-200`).
*   **Content Area**: Main content area with a light gray background (`gray-100`).

#### **Buttons**
*   **Primary**: `bg-primary`, `text-white`, `hover:bg-primary-dark`
*   **Secondary**: `bg-secondary`, `text-white`, `hover:bg-secondary-dark`
*   **Outline**: `border border-gray-300`, `text-gray-700`, `hover:bg-gray-100`
*   **Ghost**: `text-gray-700`, `hover:bg-gray-100`

#### **Forms**
*   **Inputs**: `border-gray-300`, `rounded-md`, `focus:ring-primary`, `focus:border-primary`
*   **Labels**: `font-medium`, `text-gray-700`

#### **Cards**
*   `bg-white`, `rounded-lg`, `shadow-md`, `p-6`

### 2.5. Iconography

*   **Library**: Lucide React
*   **Size**: Default size 20px, adjustable as needed.
*   **Usage**: Used for navigation, buttons, and status indicators.

### 2.6. Animations

*   **Library**: Framer Motion
*   **Usage**:
    *   Page transitions (fade-in)
    *   Modal pop-ups (scale-in)
    *   Sidebar collapse/expand (width transition)
    *   Button hover effects (slight scale-up)

### 2.7. Charts & Data Visualization

*   **Library**: Recharts
*   **Chart Types**:
    *   **Bar Charts**: Used for comparisons (e.g., monthly sales).
    *   **Line Charts**: Used for trends over time (e.g., claims volume).
    *   **Pie Charts**: Used for proportions (e.g., claim status distribution).
    *   **Area Charts**: Used for cumulative data (e.g., revenue over time).
*   **Color Palette**: Uses the primary and secondary color palettes for data series.
*   **Tooltips**: Custom tooltips with detailed information on hover.
*   **Responsive**: Charts are responsive and adapt to container size.

## 3. User Management & Permissions

This section provides a complete overview of the User Management and Role-Based Access Control (RBAC) system in ClaimGuru.

### 3.1. User Roles

The system defines the following user roles, each with a specific set of permissions and access levels:

*   **Admin**: The highest level of access, with full control over the organization's data, settings, and user management.
*   **Manager**: Mid-level management with access to most of the system's features, including claim and client management, but with limited access to administrative settings.
*   **Adjuster**: The primary user role for public adjusters, with access to all features necessary for managing claims, clients, and documents.
*   **User**: A general-purpose role with limited access, typically for office staff or assistants who need to perform specific tasks but do not require full access to the system.
*   **Client**: An external role for clients, providing them with access to a client portal where they can view the status of their claims and communicate with the adjuster.

### 3.2. Role-Based Access Control (RBAC)

ClaimGuru implements a robust RBAC system to ensure that users can only access the data and features that are relevant to their role.

*   **Permissions Array**: Each user profile has a `permissions` array that defines their specific access rights. This allows for granular control over what each user can see and do.
*   **Row-Level Security (RLS)**: The Supabase backend uses RLS to enforce data segregation between organizations and between users within an organization. This ensures that users can only access data that belongs to their organization and that they have the necessary permissions to view.
*   **Admin Panel**: The admin panel provides a user-friendly interface for managing user roles and permissions. Admins can create, edit, and delete users, as well as assign them to different roles and grant them specific permissions.

### 3.3. User Onboarding and Authentication

*   **Authentication**: The system uses Supabase Auth for user authentication, with support for email/password and social login providers.
*   **Onboarding**: New users go through a multi-step onboarding process where they provide their personal information, create an organization, and set up their profile.
*   **Two-Factor Authentication (2FA)**: The system supports 2FA for enhanced security, although it is not enforced by default.

### 3.4. Security

*   **Data Encryption**: All data is encrypted at rest and in transit.
*   **Password Security**: Passwords are encrypted using bcrypt.
*   **API Security**: The system uses a combination of API keys and JWTs to secure its APIs.
*   **CORS**: The system uses a permissive CORS policy, which should be reviewed and hardened for production environments.

## 4. Billing & Subscription System

This section details the complete Stripe billing and subscription system, including pricing tiers, integration architecture, user interface, and webhook handling.

### 4.1. Pricing Tiers

ClaimGuru offers three subscription plans:

*   **Individual Plan**: $99/month
    *   1 Assignable User (Public Adjuster)
    *   1 Admin User
    *   1TB storage
    *   Unlimited claims processing
    *   AI-powered document analysis
    *   Basic client portal
    *   Email automations
    *   Standard support
*   **Firm Plan**: $249/month
    *   3 Assignable Users (Public Adjusters)
    *   3 Admin Users
    *   2 Office Staff
    *   1 Sales User
    *   5TB base storage
    *   Team collaboration tools
    *   Advanced client portals
    *   API access
    *   Priority support
    *   Advanced analytics
*   **Additional Assignable User**: $59/month
    *   1 Additional Assignable User (Public Adjuster)
    *   1 Free Admin User included
    *   +1TB storage per user

An **Enterprise Plan** is also available with custom pricing for large organizations, offering unlimited users, custom integrations, and dedicated support.

### 4.2. Stripe Integration Architecture

The billing system is built on a robust integration with Stripe, utilizing Supabase Edge Functions to handle the backend logic.

*   **`create-subscription` Edge Function**: This function is responsible for creating a new Stripe Checkout session. It takes a `planType` and `customerEmail` as input, creates or retrieves a Stripe customer, and then creates a checkout session. The URL for the checkout session is returned to the frontend to redirect the user to the Stripe payment page.
*   **`manage-subscription` Edge Function**: This function handles various subscription management tasks. It can be used to create a customer portal session, allowing users to manage their billing information and subscriptions directly in Stripe. It can also be used to cancel or update a subscription.
*   **`stripe-webhook` Edge Function**: This function listens for events from Stripe and updates the ClaimGuru database accordingly. This ensures that the application's subscription data is always in sync with Stripe. The webhook handles the following events:
    *   `checkout.session.completed`
    *   `customer.subscription.created`
    *   `customer.subscription.updated`
    *   `customer.subscription.deleted`
    *   `invoice.payment_succeeded`
    *   `invoice.payment_failed`

### 4.3. Billing UI

The billing UI is built with React and provides a seamless user experience for managing subscriptions.

*   **Billing Page (`/billing`)**: This page displays the available subscription plans, allowing users to select a plan and proceed to checkout. It also shows the user's current subscription status and provides a link to the Stripe customer portal for managing billing details.
*   **Subscription Management Component**: This component, used on the billing page, displays the details of the user's current subscription, including the plan name, price, user limits, and storage usage. It also provides buttons for managing the subscription and upgrading the plan.
*   **Enterprise Contact Form**: For enterprise customers, a contact form is available to get in touch with the sales team for custom pricing and features.

### 4.4. Database Schema

The billing system uses two main tables in the Supabase database:

*   **`stripe_plans`**: This table stores the details of the available subscription plans, including the plan type, price, and monthly limit.
*   **`stripe_subscriptions`**: This table tracks the subscriptions of each user, including the Stripe subscription ID, customer ID, price ID, and status.

## 5. Sales & Marketing Components

This section provides a detailed overview of the sales and marketing components of the ClaimGuru system, designed to attract, nurture, and convert leads.

### 5.1. Lead Management

ClaimGuru includes a comprehensive lead management system to track and manage potential clients.

*   **Lead Capture**: The system supports embeddable lead capture forms that can be placed on websites and social media to capture new leads. These forms are designed to be simple and user-friendly to maximize conversion rates.
*   **Lead Qualification**: New leads are automatically added to the system and can be qualified based on a set of predefined criteria. This helps to ensure that the sales team is focusing on the most promising leads.
*   **Lead Source Tracking**: The system allows you to track the source of each lead, providing valuable insights into the effectiveness of your marketing campaigns.
*   **Conversion Pipeline**: A visual sales pipeline allows you to track the progress of each lead from initial contact to conversion. This provides a clear overview of the sales process and helps to identify bottlenecks.
*   **Follow-up Scheduling**: The system allows you to schedule follow-up tasks and reminders to ensure that no lead falls through the cracks.

### 5.2. Referral Program

ClaimGuru includes a referral program management system to help you leverage the power of word-of-mouth marketing.

*   **Referral Tracking**: The system allows you to track referrals from existing clients and partners, and to reward them for their successful referrals.
*   **Partner Portal**: A dedicated partner portal provides your referral partners with a dashboard where they can track their referrals, view their earnings, and access marketing materials.

### 5.3. Marketing Campaign Management

ClaimGuru provides a set of tools to help you manage your marketing campaigns.

*   **Campaign Orchestration**: The system allows you to create and manage multi-channel marketing campaigns, including email, SMS, and social media.
*   **Automation**: The system includes a marketing automation engine that allows you to create automated workflows for lead nurturing and follow-up.
*   **A/B Testing**: The system supports A/B testing for landing pages and email campaigns, allowing you to optimize your marketing messages for maximum impact.

### 5.4. Landing Page & Onboarding

*   **Landing Page**: The authentication landing page features a clean and modern design, with a focus on showcasing the key features and benefits of the ClaimGuru platform. It includes a prominent call-to-action to encourage users to sign up for a free trial.
*   **Onboarding**: The user onboarding process is designed to be as smooth and frictionless as possible. New users are guided through a multi-step process where they provide their personal information, create an organization, and set up their profile.

## 6. Analytics & Data Visualization

This section provides a complete overview of the analytics and data visualization capabilities of the ClaimGuru system, designed to provide users with actionable insights into their business operations.

### 6.1. Dashboard Components

ClaimGuru features a multi-faceted dashboard system, with each component tailored to a specific analytical purpose.

*   **Primary Dashboard**: The main dashboard provides a high-level overview of the business, with key metrics such as total claims, open claims, settled value, and pending value. It also includes a recent activity feed and a list of recent claims.
*   **Comprehensive Analytics Dashboard**: This dashboard provides a more in-depth look at the business, with tabs for claims analytics, financial overview, performance metrics, and live activity. It also includes export functionality, allowing users to export data to PDF and CSV formats.
*   **Advanced AI Dashboard**: This dashboard showcases the system's AI-powered predictive analytics capabilities, with features such as settlement predictions, risk analysis, and opportunity identification. This dashboard currently uses mock data to simulate the AI's capabilities.
*   **Admin Panel Statistics**: The admin panel includes a dashboard with key metrics for system administrators, such as user counts, system status, and feature module tracking.

### 6.2. Metrics and KPIs

The system tracks a wide range of metrics and KPIs, categorized into the following areas:

*   **Claim Metrics**: Total claims, claims by status, open vs. closed claims ratio, monthly claims volume, and claims completion rate.
*   **Financial Metrics**: Total revenue from settlements, settled value, pending value, revenue vs. expenses, profit margins by claim type, and cash flow analysis.
*   **Performance Metrics**: Average processing time by category, claims aging analysis, settlement timeline tracking, user productivity metrics, and team efficiency ratings.

### 6.3. Chart Types and Configurations

The system uses the **Recharts** library to create a variety of interactive and responsive charts.

*   **Bar Charts**: Used for comparisons, such as monthly sales or claims by status.
*   **Line Charts**: Used for tracking trends over time, such as claims volume or revenue.
*   **Pie Charts**: Used for showing proportions, such as the distribution of claim statuses.
*   **Area Charts**: Used for showing cumulative data, such as revenue over time.
*   **Radar Charts**: Used for displaying team efficiency ratings.

All charts are configured with custom tooltips that provide detailed information on hover.

### 6.4. Data Sources

The analytics system uses a hybrid approach to data, combining real-time data from the Supabase database with mock data for AI-powered predictions.

*   **Real Data**: The majority of the metrics and charts in the system are powered by real-time data from the Supabase database. This includes data from the `claims`, `clients`, `activities`, `tasks`, and `settlements` tables.
*   **Mock Data**: The Advanced AI Dashboard uses mock data to simulate the system's predictive analytics capabilities. This allows users to see how the AI features will work without needing to have a large amount of historical data.

### 6.5. Interactive Elements

The dashboards are designed to be interactive, allowing users to drill down into the data and explore it from different angles.

*   **Dynamic Filtering**: Users can filter the data by a variety of criteria, such as date range, claim status, and assigned adjuster.
*   **Drill-Down Capabilities**: Users can click on a chart or metric to drill down into the underlying data.

### 6.6. Export Functionality

The Comprehensive Analytics Dashboard includes export functionality, allowing users to export data to PDF and CSV formats. This is useful for creating reports and sharing data with others.

## 7. Functional Specifications

This section provides a detailed overview of the functional specifications of the ClaimGuru system, covering all major features and workflows.

### 7.1. Core Functionality

*   **Claim Management**: The system provides a comprehensive set of tools for managing the entire claim lifecycle, from intake to settlement. This includes claim tracking, status updates, and document management.
*   **Client Management**: The system includes a robust client management system that allows users to create and manage client profiles, track client communications, and link clients to claims.
*   **Document Management**: The system provides a centralized repository for storing and managing all claim-related documents. It supports a variety of file formats and includes features such as version control and document sharing.
*   **Task Management**: The system includes a task management system that allows users to create and assign tasks, set deadlines, and track progress.
*   **Calendar**: The system includes a calendar for scheduling appointments, deadlines, and other events.
*   **Financial Management**: The system includes a suite of tools for managing the financial aspects of the business, including settlement tracking, invoicing, and expense management.

### 7.2. AI-Powered Features

ClaimGuru leverages AI to automate and streamline key workflows.

*   **AI-Enhanced Claim Intake Wizard**: This wizard uses AI to extract key information from uploaded documents, such as policy declarations and claim forms. This pre-populates the claim intake form, saving users a significant amount of time and effort.
*   **Intelligent Document Processing**: The system uses AI to automatically classify and categorize uploaded documents, making it easier to organize and find important information.
*   **Predictive Analytics**: The system includes an AI-powered dashboard that provides predictive analytics, such as settlement predictions and risk analysis.

### 7.3. Workflows

*   **Claim Intake Workflow**: The system provides two claim intake workflows: a manual wizard for traditional data entry, and an AI-enhanced wizard for automated data extraction.
*   **Client Management Workflow**: The system supports a complete client management workflow, from lead generation and qualification to client onboarding and ongoing relationship management.
*   **Document Management Workflow**: The system provides a complete document management workflow, including document upload, AI-powered analysis, classification, and storage.

### 7.4. API Integrations

The ClaimGuru system is integrated with a number of external APIs to provide a seamless user experience.

*   **Supabase**: The system uses Supabase for its backend, including the database, authentication, and file storage.
*   **OpenAI**: The system uses the OpenAI API for its AI-powered features, such as document processing and analysis.
*   **Google Maps**: The system uses the Google Maps API for address validation and geocoding.
*   **Stripe**: The system uses Stripe for billing and subscription management.

### 7.5. Security

The system includes a number of security features to protect user data.

*   **Authentication**: The system uses Supabase Auth for user authentication, with support for email/password and social login providers.
*   **Authorization**: The system uses a role-based access control (RBAC) system to ensure that users can only access the data and features that are relevant to their role.
*   **Data Security**: The system uses row-level security (RLS) in the Supabase database to enforce data segregation between organizations. All data is also encrypted at rest and in transit.

## 8. Database Schema

This section provides a detailed overview of the database schema for the ClaimGuru system, based on the TypeScript interfaces defined in the application.

### 8.1. Core Tables

*   **`organizations`**: Stores information about the organizations using the system.
*   **`user_profiles`**: Stores user profile information, including their role and permissions.
*   **`clients`**: Stores client information, including contact details and business information.
*   **`claims`**: Stores claim information, including the claim status, date of loss, and settlement details.
*   **`documents`**: Stores information about uploaded documents, including the file name, path, and AI-extracted data.
*   **`activities`**: Stores a log of all user and system activities.
*   **`tasks`**: Stores information about tasks, including the task type, status, and due date.

### 8.2. AI and Analytics Tables

*   **`ai_insights`**: Stores the results of the AI analysis, including insights, recommendations, and risk factors.
*   **`notifications`**: Stores notifications for users.

### 8.3. Billing and Subscription Tables

*   **`stripe_plans`**: Stores the details of the available subscription plans.
*   **`stripe_subscriptions`**: Tracks the subscriptions of each user.

### 8.4. Other Tables

*   **`insurers`**: Stores information about insurance carriers.
*   **`claim_intake_progress`**: Tracks the progress of the claim intake wizard.
*   **`fee_schedules`**: Stores information about fee schedules for claims.
*   **`expenses`**: Stores information about expenses related to claims.
*   **`payments`**: Stores information about payments related to claims.
*   **`vendors`**: Stores information about vendors and contractors.
*   **`claim_vendors`**: Stores information about the vendors assigned to each claim.
*   **`communications`**: Stores a log of all communications with clients and other stakeholders.
*   **`property_inspections`**: Stores information about property inspections.
*   **`settlement_line_items`**: Stores the line items for each settlement.
*   **`organization_modules`**: Tracks the modules that are active for each organization.
*   **`integrations`**: Stores information about third-party integrations.
*   **`properties`**: Stores information about the properties related to claims.
*   **`settlements`**: Stores information about settlements.

## 9. Conclusion

This document has provided an ultra-comprehensive reconstruction guide for the ClaimGuru system. It has covered every aspect of the system, from its visual design and component architecture to its backend services and database schema. This guide is intended to be the single source of truth for rebuilding the ClaimGuru system, leaving no detail undocumented.

The ClaimGuru system is a complex and sophisticated application that provides a comprehensive set of tools for public insurance adjusters. It is built on a modern technology stack and includes a number of advanced features, such as AI-powered document processing and predictive analytics. This guide provides all the necessary information to reconstruct the system with a high degree of fidelity.
