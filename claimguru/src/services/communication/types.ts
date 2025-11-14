// Type definitions for the communication system

export type CommunicationType = 'call' | 'sms' | 'email' | 'voicemail';
export type CommunicationDirection = 'inbound' | 'outbound';
export type CommunicationStatus = 
  | 'pending' 
  | 'queued' 
  | 'sent' 
  | 'delivered' 
  | 'failed' 
  | 'received' 
  | 'in_progress' 
  | 'completed';

export type SentimentType = 'positive' | 'neutral' | 'negative' | 'urgent';
export type RecordingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PhoneNumberType = 'dedicated' | 'forwarded' | 'pool';
export type TemplateType = 'sms' | 'email' | 'voice';
export type QueueStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';

export interface Communication {
  id: string;
  organization_id: string;
  claim_id?: string;
  
  // Communication metadata
  type: CommunicationType;
  direction: CommunicationDirection;
  status: CommunicationStatus;
  
  // Contact information
  from_number?: string;
  to_number?: string;
  from_email?: string;
  to_email?: string;
  cc_emails?: string[];
  
  // Content
  subject?: string;
  body?: string;
  message_content?: string;
  
  // External IDs
  twilio_sid?: string;
  sendgrid_message_id?: string;
  
  // Threading
  thread_id?: string;
  parent_communication_id?: string;
  message_id?: string;
  in_reply_to?: string;
  
  // Call-specific
  call_duration_seconds?: number;
  call_recording_url?: string;
  call_recording_sid?: string;
  recording_consent_given?: boolean;
  
  // AI Analysis
  ai_matched?: boolean;
  ai_match_confidence?: number;
  ai_extracted_data?: Record<string, any>;
  ai_sentiment?: SentimentType;
  ai_summary?: string;
  requires_manual_review?: boolean;
  
  // Analytics
  opened_at?: string;
  clicked_at?: string;
  responded_at?: string;
  
  // Cost tracking
  cost_cents?: number;
  
  // Metadata
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface TwilioPhoneNumber {
  id: string;
  organization_id: string;
  phone_number: string;
  friendly_name?: string;
  phone_number_sid?: string;
  number_type: PhoneNumberType;
  forward_to_number?: string;
  voice_enabled?: boolean;
  sms_enabled?: boolean;
  mms_enabled?: boolean;
  assigned_to?: string;
  region?: string;
  status: 'active' | 'inactive' | 'suspended';
  total_calls?: number;
  total_sms?: number;
  monthly_cost_cents?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ClaimEmailAddress {
  id: string;
  organization_id: string;
  claim_id: string;
  email_address: string;
  email_prefix: string;
  default_cc_emails?: string[];
  status: 'active' | 'inactive' | 'bounced';
  created_at: string;
  updated_at: string;
}

export interface CommunicationTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: TemplateType;
  category?: string;
  subject?: string;
  body: string;
  available_variables?: string[];
  is_active?: boolean;
  usage_count?: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CallRecording {
  id: string;
  communication_id: string;
  organization_id: string;
  recording_sid: string;
  recording_url: string;
  recording_duration_seconds?: number;
  consent_obtained?: boolean;
  consent_timestamp?: string;
  consent_method?: string;
  transcription_text?: string;
  transcription_confidence?: number;
  transcription_status?: RecordingStatus;
  transcribed_at?: string;
  storage_provider?: string;
  storage_url?: string;
  file_size_bytes?: number;
  expires_at?: string;
  deleted_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CommunicationQueue {
  id: string;
  organization_id: string;
  claim_id?: string;
  type: 'call' | 'sms' | 'email';
  priority?: number;
  recipient_phone?: string;
  recipient_email?: string;
  subject?: string;
  body: string;
  template_id?: string;
  template_variables?: Record<string, any>;
  scheduled_for?: string;
  send_after?: string;
  send_before?: string;
  status: QueueStatus;
  attempts?: number;
  max_attempts?: number;
  last_attempt_at?: string;
  last_error?: string;
  communication_id?: string;
  completed_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CommunicationAnalytics {
  id: string;
  organization_id: string;
  date: string;
  total_communications?: number;
  total_calls?: number;
  total_sms?: number;
  total_emails?: number;
  inbound_count?: number;
  outbound_count?: number;
  delivered_count?: number;
  failed_count?: number;
  total_call_duration_seconds?: number;
  average_call_duration_seconds?: number;
  ai_matched_count?: number;
  ai_match_rate?: number;
  manual_review_count?: number;
  average_response_time_minutes?: number;
  total_cost_cents?: number;
  cost_per_communication_cents?: number;
  created_at: string;
  updated_at: string;
}

// Request/Response types
export interface SendSMSRequest {
  to: string;
  message: string;
  claimId?: string;
  organizationId: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  cc?: string[];
  claimId?: string;
  organizationId: string;
}

export interface InitiateCallRequest {
  to: string;
  from: string;
  claimId?: string;
  organizationId: string;
}

export interface AIMatchResult {
  matched: boolean;
  claimId?: string;
  confidence: number;
  extractedData: Record<string, any>;
  sentiment: SentimentType;
  summary: string;
  requiresManualReview: boolean;
}

export interface IncomingCallWebhook {
  CallSid: string;
  From: string;
  To: string;
  CallStatus: string;
  Direction: string;
}

export interface IncomingSMSWebhook {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia: string;
}

export interface IncomingEmailWebhook {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  headers: Record<string, string>;
  attachments?: any[];
}

export interface TwiMLResponse {
  toString(): string;
}
