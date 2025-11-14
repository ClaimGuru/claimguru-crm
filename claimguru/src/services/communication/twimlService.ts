/**
 * TwiML Service
 * Generates TwiML responses for dynamic call flows
 */

import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export class TwiMLService {
  /**
   * Generate TwiML for incoming call with recording consent
   */
  generateIncomingCallResponse(options?: {
    message?: string;
    forwardTo?: string;
    enableRecording?: boolean;
  }): string {
    const twiml = new VoiceResponse();

    // Play consent message for recording
    if (options?.enableRecording !== false) {
      twiml.say({
        voice: 'alice',
        language: 'en-US',
      }, 'This call may be recorded for quality and training purposes. By staying on the line, you consent to recording.');

      // Add a brief pause
      twiml.pause({ length: 1 });
    }

    // Custom greeting message
    if (options?.message) {
      twiml.say({
        voice: 'alice',
        language: 'en-US',
      }, options.message);
    } else {
      twiml.say({
        voice: 'alice',
        language: 'en-US',
      }, 'Thank you for calling ClaimGuru. Please hold while we connect you to an available representative.');
    }

    // Forward call or play music
    if (options?.forwardTo) {
      const dial = twiml.dial({
        record: options.enableRecording !== false ? 'record-from-answer' : 'do-not-record',
        recordingStatusCallback: '/api/webhooks/twilio/voice/recording',
      });
      dial.number(options.forwardTo);
    } else {
      // Play hold music
      twiml.play('http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3');
    }

    return twiml.toString();
  }

  /**
   * Generate TwiML for voicemail
   */
  generateVoicemailResponse(options?: {
    greetingMessage?: string;
    maxLength?: number;
  }): string {
    const twiml = new VoiceResponse();

    // Greeting
    const message = options?.greetingMessage || 
      'You have reached ClaimGuru. We are unable to take your call at this time. Please leave a message after the tone, and we will return your call as soon as possible.';

    twiml.say({
      voice: 'alice',
      language: 'en-US',
    }, message);

    // Record voicemail
    twiml.record({
      maxLength: options?.maxLength || 120, // 2 minutes default
      recordingStatusCallback: '/api/webhooks/twilio/voice/voicemail',
      transcribe: true,
      transcribeCallback: '/api/webhooks/twilio/voice/transcription',
    });

    // Thank you message
    twiml.say({
      voice: 'alice',
      language: 'en-US',
    }, 'Thank you for your message. Goodbye.');

    twiml.hangup();

    return twiml.toString();
  }

  /**
   * Generate TwiML for IVR menu
   */
  generateIVRMenu(options: {
    message: string;
    options: Array<{ digit: string; action: string; forwardTo?: string }>;
  }): string {
    const twiml = new VoiceResponse();

    // Recording consent
    twiml.say({
      voice: 'alice',
      language: 'en-US',
    }, 'This call may be recorded for quality and training purposes.');

    twiml.pause({ length: 1 });

    // Gather input
    const gather = twiml.gather({
      numDigits: 1,
      action: '/api/webhooks/twilio/voice/ivr-response',
      method: 'POST',
    });

    gather.say({
      voice: 'alice',
      language: 'en-US',
    }, options.message);

    // If no input, repeat menu
    twiml.redirect('/api/webhooks/twilio/voice/ivr-menu');

    return twiml.toString();
  }

  /**
   * Generate TwiML for call forwarding
   */
  generateCallForward(phoneNumber: string, options?: {
    timeout?: number;
    enableRecording?: boolean;
  }): string {
    const twiml = new VoiceResponse();

    const dial = twiml.dial({
      timeout: options?.timeout || 30,
      record: options?.enableRecording !== false ? 'record-from-answer' : 'do-not-record',
      recordingStatusCallback: '/api/webhooks/twilio/voice/recording',
    });

    dial.number(phoneNumber);

    // If no answer, go to voicemail
    twiml.redirect('/api/webhooks/twilio/voice/voicemail');

    return twiml.toString();
  }

  /**
   * Generate TwiML for conference call
   */
  generateConferenceCall(conferenceName: string, options?: {
    startConferenceOnEnter?: boolean;
    endConferenceOnExit?: boolean;
    waitUrl?: string;
  }): string {
    const twiml = new VoiceResponse();

    twiml.say({
      voice: 'alice',
      language: 'en-US',
    }, 'You are being connected to a conference call.');

    const dial = twiml.dial({
      record: 'record-from-ringing' as any,
      recordingStatusCallback: '/api/webhooks/twilio/voice/recording',
    });

    dial.conference({
      startConferenceOnEnter: options?.startConferenceOnEnter ?? true,
      endConferenceOnExit: options?.endConferenceOnExit ?? false,
      waitUrl: options?.waitUrl || 'http://twimlets.com/holdmusic?Bucket=com.twilio.music.classical',
    }, conferenceName);

    return twiml.toString();
  }

  /**
   * Generate TwiML for call screening
   */
  generateCallScreening(options: {
    callerName: string;
    forwardTo: string;
  }): string {
    const twiml = new VoiceResponse();

    twiml.say({
      voice: 'alice',
      language: 'en-US',
    }, `You have a call from ${options.callerName}. Press 1 to accept, or 2 to send to voicemail.`);

    const gather = twiml.gather({
      numDigits: 1,
      action: '/api/webhooks/twilio/voice/screening-response',
      method: 'POST',
    });

    gather.say({
      voice: 'alice',
      language: 'en-US',
    }, 'Press 1 to accept, or 2 for voicemail.');

    // Default to voicemail if no input
    twiml.redirect('/api/webhooks/twilio/voice/voicemail');

    return twiml.toString();
  }

  /**
   * Generate TwiML for outbound call
   */
  generateOutboundCall(message: string, options?: {
    enableRecording?: boolean;
  }): string {
    const twiml = new VoiceResponse();

    // Recording consent for outbound
    if (options?.enableRecording !== false) {
      twiml.say({
        voice: 'alice',
        language: 'en-US',
      }, 'This call is being recorded.');

      twiml.pause({ length: 1 });
    }

    // Deliver message
    twiml.say({
      voice: 'alice',
      language: 'en-US',
    }, message);

    // Wait for response or hangup
    twiml.pause({ length: 2 });

    return twiml.toString();
  }

  /**
   * Generate TwiML for business hours routing
   */
  generateBusinessHoursRouting(options: {
    isBusinessHours: boolean;
    businessHoursMessage?: string;
    afterHoursMessage?: string;
    forwardTo?: string;
  }): string {
    const twiml = new VoiceResponse();

    // Recording consent
    twiml.say({
      voice: 'alice',
      language: 'en-US',
    }, 'This call may be recorded for quality and training purposes.');

    twiml.pause({ length: 1 });

    if (options.isBusinessHours) {
      // Business hours
      const message = options.businessHoursMessage || 
        'Thank you for calling ClaimGuru. Please hold while we connect you to an available representative.';

      twiml.say({
        voice: 'alice',
        language: 'en-US',
      }, message);

      if (options.forwardTo) {
        const dial = twiml.dial({
          timeout: 30,
          record: 'record-from-answer',
          recordingStatusCallback: '/api/webhooks/twilio/voice/recording',
        });
        dial.number(options.forwardTo);

        // If no answer, voicemail
        twiml.redirect('/api/webhooks/twilio/voice/voicemail');
      } else {
        twiml.redirect('/api/webhooks/twilio/voice/voicemail');
      }
    } else {
      // After hours
      const message = options.afterHoursMessage || 
        'Thank you for calling ClaimGuru. Our office is currently closed. Our business hours are Monday through Friday, 9 AM to 5 PM. Please leave a message, and we will return your call during business hours.';

      twiml.say({
        voice: 'alice',
        language: 'en-US',
      }, message);

      // Go directly to voicemail
      twiml.redirect('/api/webhooks/twilio/voice/voicemail');
    }

    return twiml.toString();
  }

  /**
   * Generate TwiML for emergency/urgent call routing
   */
  generateEmergencyRouting(options: {
    primaryNumber: string;
    backupNumber?: string;
    escalationNumber?: string;
  }): string {
    const twiml = new VoiceResponse();

    twiml.say({
      voice: 'alice',
      language: 'en-US',
    }, 'This is an urgent call. Connecting you to an available representative immediately. This call is being recorded.');

    // Try primary number
    let dial = twiml.dial({
      timeout: 20,
      record: 'record-from-answer',
      recordingStatusCallback: '/api/webhooks/twilio/voice/recording',
    });
    dial.number(options.primaryNumber);

    // If no answer and backup exists, try backup
    if (options.backupNumber) {
      twiml.say({
        voice: 'alice',
        language: 'en-US',
      }, 'Connecting to backup representative.');

      dial = twiml.dial({
        timeout: 20,
        record: 'record-from-answer',
        recordingStatusCallback: '/api/webhooks/twilio/voice/recording',
      });
      dial.number(options.backupNumber);
    }

    // Last resort: escalation or voicemail
    if (options.escalationNumber) {
      twiml.say({
        voice: 'alice',
        language: 'en-US',
      }, 'Escalating to supervisor.');

      dial = twiml.dial({
        timeout: 20,
        record: 'record-from-answer',
        recordingStatusCallback: '/api/webhooks/twilio/voice/recording',
      });
      dial.number(options.escalationNumber);
    }

    // Final fallback: voicemail with urgent flag
    twiml.redirect('/api/webhooks/twilio/voice/voicemail?urgent=true');

    return twiml.toString();
  }

  /**
   * Generate simple TwiML response
   */
  generateSimpleResponse(message: string): string {
    const twiml = new VoiceResponse();

    twiml.say({
      voice: 'alice',
      language: 'en-US',
    }, message);

    twiml.hangup();

    return twiml.toString();
  }

  /**
   * Generate TwiML for SMS auto-reply
   */
  generateSMSAutoReply(message: string): string {
    const twiml = new twilio.twiml.MessagingResponse();

    twiml.message(message);

    return twiml.toString();
  }
}

// Export singleton instance
export const twimlService = new TwiMLService();
