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
