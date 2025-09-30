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
