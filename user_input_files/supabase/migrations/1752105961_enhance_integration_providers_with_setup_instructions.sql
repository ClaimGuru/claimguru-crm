-- Migration: enhance_integration_providers_with_setup_instructions
-- Created at: 1752105961

-- Add detailed setup instructions and field configurations for integrations
ALTER TABLE integration_providers 
ADD COLUMN setup_instructions TEXT,
ADD COLUMN credential_fields JSONB DEFAULT '{}',
ADD COLUMN setup_steps JSONB DEFAULT '[]',
ADD COLUMN help_url TEXT;

-- Update integration providers with detailed setup information
UPDATE integration_providers 
SET 
  setup_instructions = 'Google Calendar integration allows you to sync events between ClaimGuru and your Google Calendar account.',
  credential_fields = '{
    "client_id": {"type": "text", "label": "Client ID", "required": true, "description": "OAuth 2.0 client ID from Google Cloud Console"},
    "client_secret": {"type": "password", "label": "Client Secret", "required": true, "description": "OAuth 2.0 client secret from Google Cloud Console"},
    "scope": {"type": "readonly", "label": "Required Scopes", "value": "https://www.googleapis.com/auth/calendar", "required": false}
  }',
  setup_steps = '[
    "Go to Google Cloud Console (console.cloud.google.com)",
    "Create a new project or select existing one",
    "Enable the Google Calendar API",
    "Create OAuth 2.0 credentials",
    "Add your domain to authorized redirect URIs",
    "Copy the Client ID and Client Secret to ClaimGuru"
  ]',
  help_url = 'https://developers.google.com/calendar/api/quickstart'
WHERE name = 'Google Calendar';

UPDATE integration_providers 
SET 
  setup_instructions = 'Microsoft Outlook integration syncs your calendar events with ClaimGuru scheduling system.',
  credential_fields = '{
    "tenant_id": {"type": "text", "label": "Tenant ID", "required": true, "description": "Azure AD tenant identifier"},
    "client_id": {"type": "text", "label": "Application ID", "required": true, "description": "Application (client) ID from Azure portal"},
    "client_secret": {"type": "password", "label": "Client Secret", "required": true, "description": "Client secret from Azure portal"}
  }',
  setup_steps = '[
    "Go to Azure Portal (portal.azure.com)",
    "Navigate to Azure Active Directory",
    "Go to App registrations and create new app",
    "Configure API permissions for Calendar.ReadWrite",
    "Create a client secret",
    "Copy the Application ID, Directory ID, and Client Secret"
  ]',
  help_url = 'https://docs.microsoft.com/en-us/graph/auth/'
WHERE name = 'Microsoft Outlook';

UPDATE integration_providers 
SET 
  setup_instructions = 'Stripe integration enables secure payment processing for client settlements and fee collections.',
  credential_fields = '{
    "publishable_key": {"type": "text", "label": "Publishable Key", "required": true, "description": "Stripe publishable key (starts with pk_)"},
    "secret_key": {"type": "password", "label": "Secret Key", "required": true, "description": "Stripe secret key (starts with sk_)"},
    "webhook_secret": {"type": "password", "label": "Webhook Secret", "required": false, "description": "Webhook endpoint secret for secure event handling"}
  }',
  setup_steps = '[
    "Log in to your Stripe Dashboard",
    "Go to Developers > API keys",
    "Copy your Publishable key and Secret key",
    "Configure webhook endpoints if needed",
    "Test the connection with a small transaction"
  ]',
  help_url = 'https://stripe.com/docs/keys'
WHERE name = 'Stripe';

UPDATE integration_providers 
SET 
  setup_instructions = 'Zoom integration allows you to create and manage video meetings directly from ClaimGuru.',
  credential_fields = '{
    "api_key": {"type": "text", "label": "API Key", "required": true, "description": "Zoom API key from your app"},
    "api_secret": {"type": "password", "label": "API Secret", "required": true, "description": "Zoom API secret from your app"},
    "webhook_secret": {"type": "password", "label": "Webhook Secret", "required": false, "description": "Secret token for webhook verification"}
  }',
  setup_steps = '[
    "Go to Zoom Marketplace (marketplace.zoom.us)",
    "Create a new Server-to-Server OAuth app",
    "Configure app scopes: meeting:write, meeting:read",
    "Get your API Key and Secret",
    "Configure webhook URL if needed"
  ]',
  help_url = 'https://developers.zoom.us/docs/api/'
WHERE name = 'Zoom';

UPDATE integration_providers 
SET 
  setup_instructions = 'DocuSign integration enables electronic signature workflows for claim documents and agreements.',
  credential_fields = '{
    "integration_key": {"type": "text", "label": "Integration Key", "required": true, "description": "DocuSign integration key from your app"},
    "user_id": {"type": "text", "label": "User ID", "required": true, "description": "DocuSign user GUID"},
    "account_id": {"type": "text", "label": "Account ID", "required": true, "description": "DocuSign account ID"},
    "private_key": {"type": "textarea", "label": "Private Key", "required": true, "description": "RSA private key for JWT authentication"}
  }',
  setup_steps = '[
    "Log in to DocuSign Developer Center",
    "Create a new integration application",
    "Generate RSA keypair for JWT authentication",
    "Configure redirect URIs and permissions",
    "Get Integration Key and Account ID",
    "Grant consent for the integration"
  ]',
  help_url = 'https://developers.docusign.com/platform/auth/jwt/'
WHERE name = 'DocuSign';

UPDATE integration_providers 
SET 
  setup_instructions = 'Dropbox integration provides secure cloud storage for claim documents and files.',
  credential_fields = '{
    "app_key": {"type": "text", "label": "App Key", "required": true, "description": "Dropbox app key from your app console"},
    "app_secret": {"type": "password", "label": "App Secret", "required": true, "description": "Dropbox app secret from your app console"},
    "access_token": {"type": "password", "label": "Access Token", "required": false, "description": "OAuth 2.0 access token (generated during setup)"}
  }',
  setup_steps = '[
    "Go to Dropbox App Console (dropbox.com/developers/apps)",
    "Create a new scoped app",
    "Configure permissions: files.content.write, files.content.read",
    "Get your App key and App secret",
    "Complete OAuth flow to get access token"
  ]',
  help_url = 'https://developers.dropbox.com/oauth-guide'
WHERE name = 'Dropbox';

UPDATE integration_providers 
SET 
  setup_instructions = 'QuickBooks integration synchronizes financial data and automates accounting workflows.',
  credential_fields = '{
    "client_id": {"type": "text", "label": "Client ID", "required": true, "description": "QuickBooks app Client ID"},
    "client_secret": {"type": "password", "label": "Client Secret", "required": true, "description": "QuickBooks app Client Secret"},
    "sandbox": {"type": "checkbox", "label": "Sandbox Mode", "required": false, "description": "Enable for testing with sandbox data"}
  }',
  setup_steps = '[
    "Go to Intuit Developer Console",
    "Create a new QuickBooks Online app",
    "Configure OAuth 2.0 redirect URIs",
    "Get Client ID and Client Secret",
    "Test connection in sandbox mode",
    "Request production access when ready"
  ]',
  help_url = 'https://developer.intuit.com/app/developer/qbo/docs/get-started'
WHERE name = 'QuickBooks';;