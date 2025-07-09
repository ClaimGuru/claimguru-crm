import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ttnjqxemkbugwsofacxs.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmpxeGVta2J1Z3dzb2ZhY3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODY1ODksImV4cCI6MjA2NzY2MjU4OX0.T4ZQBC1gF0rUtzrNqbf90k0dD8B1vD_JUBiEUbbAfuo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for database tables
export interface Organization {
  id: string
  name: string
  type: string
  email?: string
  phone?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  zip_code?: string
  country: string
  website?: string
  logo_url?: string
  ein_tax_id?: string
  subscription_tier: string
  subscription_status: string
  billing_email?: string
  company_code: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  organization_id: string
  email: string
  first_name?: string
  last_name?: string
  middle_initial?: string
  phone_1?: string
  phone_2?: string
  phone_3?: string
  phone_4?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  zip_code?: string
  country: string
  role: string
  permissions?: string[]
  license_number?: string
  is_active: boolean
  avatar_url?: string
  timezone: string
  date_format: string
  notification_email: boolean
  notification_sms: boolean
  two_factor_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  organization_id: string
  client_type: string
  is_policyholder: boolean
  first_name?: string
  last_name?: string
  middle_initial?: string
  business_name?: string
  title?: string
  nickname?: string
  primary_email?: string
  secondary_email?: string
  primary_phone?: string
  secondary_phone?: string
  work_phone?: string
  mobile_phone?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  zip_code?: string
  country: string
  mailing_same_as_address: boolean
  mailing_address_line_1?: string
  mailing_address_line_2?: string
  mailing_city?: string
  mailing_state?: string
  mailing_zip_code?: string
  mailing_country?: string
  lead_source_id?: string
  assigned_to?: string
  date_first_contact?: string
  notes?: string
  portal_pin?: string
  social_media?: any
  employer?: string
  occupation?: string
  birthdate?: string
  spouse_name?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Claim {
  id: string
  organization_id: string
  client_id: string
  property_id: string
  file_number: string
  claim_number?: string
  carrier_claim_number?: string
  carrier_id?: string
  desk_adjuster_id?: string
  field_adjuster_id?: string
  assigned_adjuster_id: string
  assigned_office_staff?: string[]
  assigned_sales_staff?: string[]
  claim_status: string
  claim_phase: string
  priority: string
  date_of_loss: string
  cause_of_loss: string
  loss_description?: string
  date_reported?: string
  date_first_contact?: string
  contract_date?: string
  contract_fee_type: string
  contract_fee_amount?: number
  is_claim_filed: boolean
  deadline_date?: string
  recoverable_depreciation_deadline?: string
  is_fema_claim: boolean
  is_state_emergency: boolean
  emergency_name?: string
  reason_for_claim?: string
  is_home_habitable?: boolean
  is_insured_living_in_home?: boolean
  dwelling_damage_description?: string
  other_structures_damage_description?: string
  personal_property_damage_description?: string
  has_ale_expenses: boolean
  has_repairs_been_done: boolean
  repair_description?: string
  repair_type?: string
  repair_date?: string
  repair_vendor?: string
  has_prior_claims: boolean
  prior_claims_info?: any
  estimated_loss_value?: number
  total_settlement_amount?: number
  is_final_settlement: boolean
  settlement_status: string
  watch_list: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  organization_id: string
  claim_id?: string
  client_id?: string
  document_type: string
  document_category?: string
  file_name: string
  file_path: string
  file_size?: number
  mime_type?: string
  file_url?: string
  thumbnail_url?: string
  document_title?: string
  description?: string
  is_public: boolean
  is_confidential: boolean
  folder_path?: string
  tags?: string[]
  ai_extracted_text?: string
  ai_entities?: any
  ai_summary?: string
  ai_compliance_status?: string
  version_number: number
  is_signed: boolean
  signed_by?: string
  signed_at?: string
  uploaded_by: string
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  organization_id: string
  claim_id?: string
  client_id?: string
  activity_type: string
  activity_category: string
  title: string
  description?: string
  activity_data?: any
  is_public: boolean
  is_system_generated: boolean
  communication_method?: string
  communication_direction?: string
  email_subject?: string
  email_from?: string
  email_to?: string[]
  phone_number?: string
  call_duration?: number
  sms_message?: string
  urgency: string
  follow_up_required: boolean
  follow_up_date?: string
  created_by: string
  participants?: string[]
  related_document_ids?: string[]
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  organization_id: string
  claim_id?: string
  client_id?: string
  task_type: string
  task_category: string
  title: string
  description?: string
  status: string
  priority: string
  assigned_to: string
  assigned_by: string
  due_date?: string
  completed_date?: string
  estimated_hours?: number
  actual_hours?: number
  progress_percentage: number
  is_mandatory: boolean
  is_automated: boolean
  automation_trigger?: string
  parent_task_id?: string
  dependencies?: string[]
  checklist_items?: any
  notes?: string
  completion_notes?: string
  created_at: string
  updated_at: string
}

export interface AIInsight {
  id: string
  organization_id: string
  claim_id?: string
  document_id?: string
  insight_type: string
  insight_category?: string
  confidence_score?: number
  title?: string
  summary?: string
  full_analysis?: string
  extracted_entities?: any
  risk_factors?: any
  recommendations?: any
  compliance_status?: string
  follow_up_actions?: string[]
  status: string
  reviewed_by?: string
  reviewed_at?: string
  ai_model_version?: string
  processing_time_ms?: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  organization_id: string
  recipient_id: string
  sender_id?: string
  notification_type: string
  priority: string
  title: string
  message: string
  action_url?: string
  is_read: boolean
  is_dismissed: boolean
  delivery_method: string
  email_sent: boolean
  sms_sent: boolean
  push_sent: boolean
  metadata?: any
  expires_at?: string
  read_at?: string
  created_at: string
}