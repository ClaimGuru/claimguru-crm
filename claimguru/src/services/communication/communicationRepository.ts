/**
 * Communication Repository Service
 * Handles all database operations for the communication system
 */

import { supabase } from '../../lib/supabase';
import * as Sentry from '@sentry/react';
import type {
  Communication,
  TwilioPhoneNumber,
  ClaimEmailAddress,
  CommunicationTemplate,
  CallRecording,
  CommunicationQueue,
  CommunicationAnalytics,
} from './types';

export class CommunicationRepository {
  /**
   * ==========================================
   * COMMUNICATIONS TABLE OPERATIONS
   * ==========================================
   */

  async createCommunication(data: Partial<Communication>): Promise<Communication | null> {
    try {
      const { data: communication, error } = await supabase
        .from('communications')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return communication;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'create' },
        extra: { data },
      });
      console.error('Error creating communication:', error);
      return null;
    }
  }

  async getCommunicationById(id: string): Promise<Communication | null> {
    try {
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'get-by-id' },
        extra: { id },
      });
      console.error('Error fetching communication:', error);
      return null;
    }
  }

  async getCommunicationByTwilioSid(twilioSid: string): Promise<Communication | null> {
    try {
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .eq('twilio_sid', twilioSid)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      // Don't log to Sentry for not found cases
      if (error.code !== 'PGRST116') {
        Sentry.captureException(error, {
          tags: { service: 'communication-repository', operation: 'get-by-twilio-sid' },
        });
      }
      return null;
    }
  }

  async getCommunicationsByClaimId(
    claimId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Communication[]> {
    try {
      let query = supabase
        .from('communications')
        .select('*')
        .eq('claim_id', claimId)
        .order('created_at', { ascending: false });

      if (options?.limit) query = query.limit(options.limit);
      if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1);

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'get-by-claim' },
        extra: { claimId, options },
      });
      console.error('Error fetching communications by claim:', error);
      return [];
    }
  }

  async getCommunicationsByOrganization(
    organizationId: string,
    filters?: {
      type?: string;
      status?: string;
      requiresReview?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<Communication[]> {
    try {
      let query = supabase
        .from('communications')
        .select('*')
        .eq('organization_id', organizationId);

      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.requiresReview !== undefined) {
        query = query.eq('requires_manual_review', filters.requiresReview);
      }

      query = query.order('created_at', { ascending: false });

      if (filters?.limit) query = query.limit(filters.limit);
      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'get-by-org' },
        extra: { organizationId, filters },
      });
      console.error('Error fetching communications by organization:', error);
      return [];
    }
  }

  async updateCommunication(
    id: string,
    updates: Partial<Communication>
  ): Promise<Communication | null> {
    try {
      const { data, error } = await supabase
        .from('communications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'update' },
        extra: { id, updates },
      });
      console.error('Error updating communication:', error);
      return null;
    }
  }

  async searchCommunications(
    organizationId: string,
    searchTerm: string,
    options?: { limit?: number }
  ): Promise<Communication[]> {
    try {
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .eq('organization_id', organizationId)
        .or(`subject.ilike.%${searchTerm}%,body.ilike.%${searchTerm}%,message_content.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(options?.limit || 50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'search' },
        extra: { organizationId, searchTerm },
      });
      console.error('Error searching communications:', error);
      return [];
    }
  }

  /**
   * ==========================================
   * PHONE NUMBERS TABLE OPERATIONS
   * ==========================================
   */

  async getActivePhoneNumbers(organizationId: string): Promise<TwilioPhoneNumber[]> {
    try {
      const { data, error } = await supabase
        .from('twilio_phone_numbers')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'get-phone-numbers' },
      });
      console.error('Error fetching phone numbers:', error);
      return [];
    }
  }

  async getPhoneNumberByNumber(phoneNumber: string): Promise<TwilioPhoneNumber | null> {
    try {
      const { data, error } = await supabase
        .from('twilio_phone_numbers')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (error.code !== 'PGRST116') {
        Sentry.captureException(error, {
          tags: { service: 'communication-repository', operation: 'get-phone-by-number' },
        });
      }
      return null;
    }
  }

  /**
   * ==========================================
   * CLAIM EMAIL ADDRESSES TABLE OPERATIONS
   * ==========================================
   */

  async getClaimEmailAddress(claimId: string): Promise<ClaimEmailAddress | null> {
    try {
      const { data, error } = await supabase
        .from('claim_email_addresses')
        .select('*')
        .eq('claim_id', claimId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (error.code !== 'PGRST116') {
        Sentry.captureException(error, {
          tags: { service: 'communication-repository', operation: 'get-claim-email' },
        });
      }
      return null;
    }
  }

  async createClaimEmailAddress(
    data: Partial<ClaimEmailAddress>
  ): Promise<ClaimEmailAddress | null> {
    try {
      const { data: emailAddress, error } = await supabase
        .from('claim_email_addresses')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return emailAddress;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'create-claim-email' },
        extra: { data },
      });
      console.error('Error creating claim email address:', error);
      return null;
    }
  }

  /**
   * ==========================================
   * TEMPLATES TABLE OPERATIONS
   * ==========================================
   */

  async getTemplates(
    organizationId: string,
    filters?: { type?: string; category?: string; isActive?: boolean }
  ): Promise<CommunicationTemplate[]> {
    try {
      let query = supabase
        .from('communication_templates')
        .select('*')
        .eq('organization_id', organizationId);

      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.isActive !== undefined) query = query.eq('is_active', filters.isActive);

      query = query.order('name', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'get-templates' },
        extra: { organizationId, filters },
      });
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  async getTemplateById(id: string): Promise<CommunicationTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('communication_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'get-template-by-id' },
      });
      return null;
    }
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    try {
      await supabase.rpc('increment_template_usage', { template_id: id });
    } catch (error) {
      // Non-critical operation, log but don't throw
      console.warn('Error incrementing template usage:', error);
    }
  }

  /**
   * ==========================================
   * CALL RECORDINGS TABLE OPERATIONS
   * ==========================================
   */

  async createCallRecording(data: Partial<CallRecording>): Promise<CallRecording | null> {
    try {
      const { data: recording, error } = await supabase
        .from('call_recordings')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return recording;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'create-recording' },
        extra: { data },
      });
      console.error('Error creating call recording:', error);
      return null;
    }
  }

  async getRecordingByCommunicationId(
    communicationId: string
  ): Promise<CallRecording | null> {
    try {
      const { data, error } = await supabase
        .from('call_recordings')
        .select('*')
        .eq('communication_id', communicationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (error.code !== 'PGRST116') {
        Sentry.captureException(error, {
          tags: { service: 'communication-repository', operation: 'get-recording' },
        });
      }
      return null;
    }
  }

  async updateRecordingTranscription(
    id: string,
    transcriptionText: string,
    confidence: number
  ): Promise<void> {
    try {
      await supabase
        .from('call_recordings')
        .update({
          transcription_text: transcriptionText,
          transcription_confidence: confidence,
          transcription_status: 'completed',
          transcribed_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'update-transcription' },
      });
      console.error('Error updating transcription:', error);
    }
  }

  /**
   * ==========================================
   * QUEUE TABLE OPERATIONS
   * ==========================================
   */

  async queueCommunication(data: Partial<CommunicationQueue>): Promise<CommunicationQueue | null> {
    try {
      const { data: queueItem, error } = await supabase
        .from('communication_queue')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return queueItem;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'queue' },
        extra: { data },
      });
      console.error('Error queueing communication:', error);
      return null;
    }
  }

  async getPendingQueueItems(limit = 100): Promise<CommunicationQueue[]> {
    try {
      const { data, error } = await supabase
        .from('communication_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: true })
        .order('scheduled_for', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'get-pending-queue' },
      });
      console.error('Error fetching pending queue items:', error);
      return [];
    }
  }

  async updateQueueItem(
    id: string,
    updates: Partial<CommunicationQueue>
  ): Promise<CommunicationQueue | null> {
    try {
      const { data, error } = await supabase
        .from('communication_queue')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'update-queue' },
        extra: { id, updates },
      });
      console.error('Error updating queue item:', error);
      return null;
    }
  }

  /**
   * ==========================================
   * ANALYTICS TABLE OPERATIONS
   * ==========================================
   */

  async getAnalytics(
    organizationId: string,
    startDate: string,
    endDate: string
  ): Promise<CommunicationAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('communication_analytics')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'get-analytics' },
        extra: { organizationId, startDate, endDate },
      });
      console.error('Error fetching analytics:', error);
      return [];
    }
  }

  async aggregateAnalytics(date: string, organizationId: string): Promise<void> {
    try {
      await supabase.rpc('aggregate_communication_analytics', {
        target_date: date,
        target_org_id: organizationId,
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'communication-repository', operation: 'aggregate-analytics' },
        extra: { date, organizationId },
      });
      console.error('Error aggregating analytics:', error);
    }
  }
}

// Export singleton instance
export const communicationRepository = new CommunicationRepository();
