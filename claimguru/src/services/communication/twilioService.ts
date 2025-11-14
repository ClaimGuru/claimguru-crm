/**
 * Twilio Service
 * Handles all Twilio API interactions for voice calls, SMS, and SendGrid email
 */

import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import * as Sentry from '@sentry/react';
import { communicationRepository } from './communicationRepository';
import type {
  SendSMSRequest,
  SendEmailRequest,
  InitiateCallRequest,
  Communication,
} from './types';

// Initialize Twilio client
const twilioAccountSid = import.meta.env.VITE_TWILIO_ACCT_SID;
const twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_KEY;
const sendGridApiKey = import.meta.env.SENDGRID_API_KEY;

// Validate Twilio credentials
if (!twilioAccountSid || !twilioAuthToken) {
  console.warn('Twilio credentials not configured. Communication features will be limited.');
}

const twilioClient = twilioAccountSid && twilioAuthToken 
  ? twilio(twilioAccountSid, twilioAuthToken)
  : null;

// Initialize SendGrid
if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
} else {
  console.warn('SendGrid API key not configured. Email features will be limited.');
}

export class TwilioService {
  /**
   * ==========================================
   * SMS OPERATIONS
   * ==========================================
   */

  async sendSMS(request: SendSMSRequest): Promise<Communication | null> {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      // Get organization's Twilio phone number
      const phoneNumbers = await communicationRepository.getActivePhoneNumbers(
        request.organizationId
      );

      if (phoneNumbers.length === 0) {
        throw new Error('No active phone numbers found for organization');
      }

      const fromNumber = phoneNumbers[0].phone_number;

      // Send SMS via Twilio
      const message = await twilioClient.messages.create({
        body: request.message,
        from: fromNumber,
        to: request.to,
      });

      // Calculate cost (Twilio SMS is ~$0.0079 per message)
      const costCents = 1; // 1 cent per SMS

      // Log to database
      const communication = await communicationRepository.createCommunication({
        organization_id: request.organizationId,
        claim_id: request.claimId,
        type: 'sms',
        direction: 'outbound',
        status: message.status as any,
        from_number: fromNumber,
        to_number: request.to,
        message_content: request.message,
        twilio_sid: message.sid,
        cost_cents: costCents,
        metadata: {
          twilioStatus: message.status,
          errorCode: message.errorCode,
          errorMessage: message.errorMessage,
        },
      });

      return communication;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'twilio', operation: 'send-sms' },
        extra: { request: request as any },
      });
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  /**
   * ==========================================
   * VOICE CALL OPERATIONS
   * ==========================================
   */

  async initiateCall(request: InitiateCallRequest): Promise<Communication | null> {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      // Build TwiML URL for call handling (webhook endpoint)
      const twimlUrl = `${import.meta.env.VITE_APP_URL}/api/webhooks/twilio/voice/handle`;

      // Initiate call via Twilio
      const call = await twilioClient.calls.create({
        url: twimlUrl,
        to: request.to,
        from: request.from,
        record: true, // Enable recording
        recordingStatusCallback: `${import.meta.env.VITE_APP_URL}/api/webhooks/twilio/voice/recording`,
        statusCallback: `${import.meta.env.VITE_APP_URL}/api/webhooks/twilio/voice/status`,
      });

      // Calculate initial cost (calls are billed by duration later)
      const costCents = 2; // Base cost estimate

      // Log to database
      const communication = await communicationRepository.createCommunication({
        organization_id: request.organizationId,
        claim_id: request.claimId,
        type: 'call',
        direction: 'outbound',
        status: 'in_progress',
        from_number: request.from,
        to_number: request.to,
        twilio_sid: call.sid,
        cost_cents: costCents,
        recording_consent_given: true, // Consent given for outbound calls
        metadata: {
          callStatus: call.status,
        },
      });

      return communication;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'twilio', operation: 'initiate-call' },
        extra: { request: request as any },
      });
      console.error('Error initiating call:', error);
      throw error;
    }
  }

  /**
   * Handle incoming call webhook
   */
  async handleIncomingCall(
    callSid: string,
    from: string,
    to: string,
    organizationId: string
  ): Promise<Communication | null> {
    try {
      // Check if communication already exists
      const existing = await communicationRepository.getCommunicationByTwilioSid(callSid);
      if (existing) {
        return existing;
      }

      // Create communication record
      const communication = await communicationRepository.createCommunication({
        organization_id: organizationId,
        type: 'call',
        direction: 'inbound',
        status: 'received',
        from_number: from,
        to_number: to,
        twilio_sid: callSid,
        cost_cents: 1, // Base incoming cost
        recording_consent_given: false, // Will be set after consent prompt
      });

      return communication;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'twilio', operation: 'handle-incoming-call' },
        extra: { callSid, from, to },
      });
      console.error('Error handling incoming call:', error);
      return null;
    }
  }

  /**
   * Update call status and duration
   */
  async updateCallStatus(
    callSid: string,
    status: string,
    duration?: number
  ): Promise<void> {
    try {
      const communication = await communicationRepository.getCommunicationByTwilioSid(callSid);
      if (!communication) {
        console.warn(`Communication not found for call SID: ${callSid}`);
        return;
      }

      // Calculate cost based on duration (Twilio voice is ~$0.013/min)
      let costCents = communication.cost_cents || 0;
      if (duration) {
        const minutes = Math.ceil(duration / 60);
        costCents = minutes * 1; // ~1 cent per minute
      }

      await communicationRepository.updateCommunication(communication.id, {
        status: status as any,
        call_duration_seconds: duration,
        cost_cents: costCents,
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'twilio', operation: 'update-call-status' },
        extra: { callSid, status, duration },
      });
      console.error('Error updating call status:', error);
    }
  }

  /**
   * Handle call recording webhook
   */
  async handleCallRecording(
    callSid: string,
    recordingSid: string,
    recordingUrl: string,
    duration?: number
  ): Promise<void> {
    try {
      const communication = await communicationRepository.getCommunicationByTwilioSid(callSid);
      if (!communication) {
        console.warn(`Communication not found for call SID: ${callSid}`);
        return;
      }

      // Update communication with recording info
      await communicationRepository.updateCommunication(communication.id, {
        call_recording_url: recordingUrl,
        call_recording_sid: recordingSid,
      });

      // Create call recording entry
      await communicationRepository.createCallRecording({
        communication_id: communication.id,
        organization_id: communication.organization_id,
        recording_sid: recordingSid,
        recording_url: recordingUrl,
        recording_duration_seconds: duration,
        consent_obtained: communication.recording_consent_given || false,
        consent_method: communication.direction === 'outbound' ? 'implicit_outbound' : 'ivr_prompt',
        transcription_status: 'pending',
        storage_provider: 'twilio',
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'twilio', operation: 'handle-recording' },
        extra: { callSid, recordingSid },
      });
      console.error('Error handling call recording:', error);
    }
  }

  /**
   * ==========================================
   * SMS WEBHOOK OPERATIONS
   * ==========================================
   */

  async handleIncomingSMS(
    messageSid: string,
    from: string,
    to: string,
    body: string,
    organizationId: string
  ): Promise<Communication | null> {
    try {
      // Check if message already exists
      const existing = await communicationRepository.getCommunicationByTwilioSid(messageSid);
      if (existing) {
        return existing;
      }

      // Create communication record
      const communication = await communicationRepository.createCommunication({
        organization_id: organizationId,
        type: 'sms',
        direction: 'inbound',
        status: 'received',
        from_number: from,
        to_number: to,
        message_content: body,
        twilio_sid: messageSid,
        cost_cents: 1, // Base incoming SMS cost
      });

      return communication;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'twilio', operation: 'handle-incoming-sms' },
        extra: { messageSid, from, to },
      });
      console.error('Error handling incoming SMS:', error);
      return null;
    }
  }

  /**
   * Update SMS delivery status
   */
  async updateSMSStatus(messageSid: string, status: string): Promise<void> {
    try {
      const communication = await communicationRepository.getCommunicationByTwilioSid(messageSid);
      if (!communication) {
        console.warn(`Communication not found for message SID: ${messageSid}`);
        return;
      }

      await communicationRepository.updateCommunication(communication.id, {
        status: status as any,
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'twilio', operation: 'update-sms-status' },
        extra: { messageSid, status },
      });
      console.error('Error updating SMS status:', error);
    }
  }

  /**
   * ==========================================
   * EMAIL OPERATIONS (SendGrid)
   * ==========================================
   */

  async sendEmail(request: SendEmailRequest): Promise<Communication | null> {
    if (!sendGridApiKey) {
      throw new Error('SendGrid not configured');
    }

    try {
      // Get organization's email domain (or use default)
      const fromEmail = import.meta.env.SENDGRID_FROM_EMAIL || 'noreply@claimguru.app';

      // Send email via SendGrid
      const msg = {
        to: request.to,
        from: fromEmail,
        subject: request.subject,
        text: request.body,
        html: request.body.replace(/\n/g, '<br>'),
        cc: request.cc,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers['x-message-id'];

      // Calculate cost (SendGrid pricing varies, estimate $0.001 per email)
      const costCents = 0; // Included in SendGrid plan

      // Log to database
      const communication = await communicationRepository.createCommunication({
        organization_id: request.organizationId,
        claim_id: request.claimId,
        type: 'email',
        direction: 'outbound',
        status: 'sent',
        from_email: fromEmail,
        to_email: request.to,
        cc_emails: request.cc,
        subject: request.subject,
        body: request.body,
        sendgrid_message_id: messageId,
        cost_cents: costCents,
      });

      return communication;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'twilio', operation: 'send-email' },
        extra: { request },
      });
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Handle incoming email webhook (SendGrid Inbound Parse)
   */
  async handleIncomingEmail(
    from: string,
    to: string,
    subject: string,
    text: string,
    html: string | undefined,
    headers: Record<string, string>,
    organizationId: string
  ): Promise<Communication | null> {
    try {
      const messageId = headers['message-id'];
      const inReplyTo = headers['in-reply-to'];

      // Check if email already exists
      if (messageId) {
        const existing = await communicationRepository.getCommunicationsByOrganization(
          organizationId,
          { limit: 1 }
        );
        const found = existing.find((c) => c.message_id === messageId);
        if (found) return found;
      }

      // Determine thread ID
      let threadId = messageId;
      let parentId: string | undefined;

      if (inReplyTo) {
        // Find parent communication
        const allComms = await communicationRepository.getCommunicationsByOrganization(
          organizationId
        );
        const parent = allComms.find((c) => c.message_id === inReplyTo);
        if (parent) {
          threadId = parent.thread_id || parent.message_id || messageId;
          parentId = parent.id;
        }
      }

      // Create communication record
      const communication = await communicationRepository.createCommunication({
        organization_id: organizationId,
        type: 'email',
        direction: 'inbound',
        status: 'received',
        from_email: from,
        to_email: to,
        subject,
        body: html || text,
        message_id: messageId,
        in_reply_to: inReplyTo,
        thread_id: threadId,
        parent_communication_id: parentId,
        cost_cents: 0,
      });

      return communication;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'twilio', operation: 'handle-incoming-email' },
        extra: { from, to, subject },
      });
      console.error('Error handling incoming email:', error);
      return null;
    }
  }

  /**
   * ==========================================
   * WEBHOOK SIGNATURE VALIDATION
   * ==========================================
   */

  validateTwilioSignature(
    url: string,
    params: Record<string, any>,
    signature: string
  ): boolean {
    if (!twilioClient || !twilioAuthToken) {
      console.warn('Cannot validate Twilio signature: client not initialized');
      return false;
    }

    return twilio.validateRequest(twilioAuthToken, signature, url, params);
  }

  /**
   * ==========================================
   * UTILITY OPERATIONS
   * ==========================================
   */

  async getCallDetails(callSid: string): Promise<any> {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const call = await twilioClient.calls(callSid).fetch();
      return call;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'twilio', operation: 'get-call-details' },
      });
      console.error('Error fetching call details:', error);
      return null;
    }
  }

  async getRecordingUrl(recordingSid: string): Promise<string | null> {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const recording = await twilioClient.recordings(recordingSid).fetch();
      return `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'twilio', operation: 'get-recording-url' },
      });
      console.error('Error fetching recording URL:', error);
      return null;
    }
  }
}

// Export singleton instance
// Export singleton instance
export const twilioService = new TwilioService();
