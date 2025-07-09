-- Migration: enable_rls_policies
-- Created at: 1752087812

-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;

-- Create policy functions for organization-based access
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM user_profiles
  WHERE id = auth.uid();
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (id = get_user_organization_id());

CREATE POLICY "Users can update their own organization" ON organizations
  FOR UPDATE USING (id = get_user_organization_id());

-- User profiles policies
CREATE POLICY "Users can view profiles in their organization" ON user_profiles
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert profiles in their organization" ON user_profiles
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());

-- Lead sources policies
CREATE POLICY "Organization isolation for lead_sources" ON lead_sources
  FOR ALL USING (organization_id = get_user_organization_id());

-- Clients policies
CREATE POLICY "Organization isolation for clients" ON clients
  FOR ALL USING (organization_id = get_user_organization_id());

-- Properties policies
CREATE POLICY "Organization isolation for properties" ON properties
  FOR ALL USING (organization_id = get_user_organization_id());

-- Vendors policies
CREATE POLICY "Organization isolation for vendors" ON vendors
  FOR ALL USING (organization_id = get_user_organization_id());

-- Insurance carriers policies
CREATE POLICY "Organization isolation for insurance_carriers" ON insurance_carriers
  FOR ALL USING (organization_id = get_user_organization_id());

-- Adjusters policies
CREATE POLICY "Organization isolation for adjusters" ON adjusters
  FOR ALL USING (organization_id = get_user_organization_id());

-- Claims policies
CREATE POLICY "Organization isolation for claims" ON claims
  FOR ALL USING (organization_id = get_user_organization_id());

-- Policies policies
CREATE POLICY "Organization isolation for policies" ON policies
  FOR ALL USING (organization_id = get_user_organization_id());

-- Documents policies
CREATE POLICY "Organization isolation for documents" ON documents
  FOR ALL USING (organization_id = get_user_organization_id());

-- Activities policies
CREATE POLICY "Organization isolation for activities" ON activities
  FOR ALL USING (organization_id = get_user_organization_id());

-- Tasks policies
CREATE POLICY "Organization isolation for tasks" ON tasks
  FOR ALL USING (organization_id = get_user_organization_id());

-- Settlements policies
CREATE POLICY "Organization isolation for settlements" ON settlements
  FOR ALL USING (organization_id = get_user_organization_id());

-- Subscriptions policies
CREATE POLICY "Organization isolation for subscriptions" ON subscriptions
  FOR ALL USING (organization_id = get_user_organization_id());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (recipient_id = auth.uid() AND organization_id = get_user_organization_id());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (recipient_id = auth.uid() AND organization_id = get_user_organization_id());

-- File folders policies
CREATE POLICY "Organization isolation for file_folders" ON file_folders
  FOR ALL USING (organization_id = get_user_organization_id());

-- AI insights policies
CREATE POLICY "Organization isolation for ai_insights" ON ai_insights
  FOR ALL USING (organization_id = get_user_organization_id());

-- Claim assignments policies
CREATE POLICY "Organization isolation for claim_assignments" ON claim_assignments
  FOR ALL USING (organization_id = get_user_organization_id());

-- Communication templates policies
CREATE POLICY "Organization isolation for communication_templates" ON communication_templates
  FOR ALL USING (organization_id = get_user_organization_id());;