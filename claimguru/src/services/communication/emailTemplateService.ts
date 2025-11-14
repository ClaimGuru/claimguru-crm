/**
 * Email Template Service
 * Manages communication templates with variable substitution
 */

import { communicationRepository } from './communicationRepository';
import type { CommunicationTemplate } from './types';
import * as Sentry from '@sentry/react';

export class EmailTemplateService {
  /**
   * Get templates for organization
   */
  async getTemplates(
    organizationId: string,
    type?: 'sms' | 'email' | 'voice',
    category?: string
  ): Promise<CommunicationTemplate[]> {
    return communicationRepository.getTemplates(organizationId, {
      type,
      category,
      isActive: true,
    });
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<CommunicationTemplate | null> {
    return communicationRepository.getTemplateById(templateId);
  }

  /**
   * Render template with variables
   */
  renderTemplate(
    template: CommunicationTemplate,
    variables: Record<string, any>
  ): { subject?: string; body: string } {
    try {
      let subject = template.subject || '';
      let body = template.body;

      // Replace variables in subject and body
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        const stringValue = String(value || '');

        subject = subject.replace(new RegExp(placeholder, 'g'), stringValue);
        body = body.replace(new RegExp(placeholder, 'g'), stringValue);
      }

      // Track usage
      this.incrementUsage(template.id);

      return { subject, body };
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'email-template', operation: 'render' },
        extra: { templateId: template.id, variables },
      });
      console.error('Error rendering template:', error);
      return { subject: template.subject, body: template.body };
    }
  }

  /**
   * Extract required variables from template
   */
  extractVariables(templateBody: string): string[] {
    const matches = templateBody.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
    return matches.map((match) => match.replace(/\{\{|\}\}/g, ''));
  }

  /**
   * Validate template variables
   */
  validateVariables(
    template: CommunicationTemplate,
    variables: Record<string, any>
  ): { valid: boolean; missing: string[] } {
    const availableVars = template.available_variables || [];
    const providedVars = Object.keys(variables);
    const missing = availableVars.filter((v) => !providedVars.includes(v));

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Create common variable set for claim communications
   */
  buildClaimVariables(claimData: any, additionalVars?: Record<string, any>): Record<string, any> {
    return {
      claim_number: claimData.file_number || claimData.claim_number || 'N/A',
      claimant_name: claimData.client_name || 'Valued Customer',
      adjuster_name: claimData.adjuster_name || 'Your Adjuster',
      adjuster_email: claimData.adjuster_email || 'support@claimguru.app',
      adjuster_phone: claimData.adjuster_phone || '(555) 000-0000',
      company_name: claimData.company_name || 'ClaimGuru',
      office_phone: claimData.office_phone || '(555) 000-0000',
      ...additionalVars,
    };
  }

  /**
   * Increment template usage counter
   */
  private async incrementUsage(templateId: string): Promise<void> {
    try {
      await communicationRepository.incrementTemplateUsage(templateId);
    } catch (error) {
      // Non-critical, log but don't throw
      console.warn('Failed to increment template usage:', error);
    }
  }

  /**
   * Preview template with sample data
   */
  previewTemplate(
    template: CommunicationTemplate,
    sampleVariables?: Record<string, any>
  ): { subject?: string; body: string } {
    const defaultSamples: Record<string, any> = {
      claim_number: 'CLM-2025-001',
      claimant_name: 'John Doe',
      adjuster_name: 'Jane Smith',
      adjuster_email: 'jane.smith@claimguru.app',
      adjuster_phone: '(555) 123-4567',
      company_name: 'ClaimGuru',
      office_phone: '(555) 000-0000',
      new_status: 'In Review',
      document_list: 'Policy Documents, Damage Photos',
      appointment_date: 'January 15, 2025',
      appointment_time: '10:00 AM',
      location: '123 Main St, Anytown, USA',
      payment_amount: '5,000.00',
      payment_method: 'Direct Deposit',
      expected_delivery_date: 'January 20, 2025',
    };

    const variables = { ...defaultSamples, ...sampleVariables };
    return this.renderTemplate(template, variables);
  }
}

// Export singleton instance
export const emailTemplateService = new EmailTemplateService();
