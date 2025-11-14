/**
 * Communication Services
 * Main export file for all communication-related services
 */

// Core services
export { communicationRepository, CommunicationRepository } from './communicationRepository';
export { twilioService, TwilioService } from './twilioService';
export { aiMatchingService, AIMatchingService } from './aiMatchingService';
export { twimlService, TwiMLService } from './twimlService';
export { claimEmailService, ClaimEmailService } from './claimEmailService';
export { emailTemplateService, EmailTemplateService } from './emailTemplateService';

// Types
export type {
  Communication,
  TwilioPhoneNumber,
  ClaimEmailAddress,
  CommunicationTemplate,
  CallRecording,
  CommunicationQueue,
  CommunicationAnalytics,
  CommunicationType,
  CommunicationDirection,
  CommunicationStatus,
  SentimentType,
  RecordingStatus,
  PhoneNumberType,
  TemplateType,
  QueueStatus,
  SendSMSRequest,
  SendEmailRequest,
  InitiateCallRequest,
  AIMatchResult,
  IncomingCallWebhook,
  IncomingSMSWebhook,
  IncomingEmailWebhook,
} from './types';
