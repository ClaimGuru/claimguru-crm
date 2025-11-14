/**
 * Claim Email Service
 * Manages unique email addresses per claim for organized communication
 */

import { communicationRepository } from './communicationRepository';
import type { ClaimEmailAddress } from './types';
import * as Sentry from '@sentry/react';

export class ClaimEmailService {
  /**
   * Generate or retrieve unique email address for a claim
   */
  async getOrCreateClaimEmail(
    claimId: string,
    organizationId: string,
    claimNumber: string
  ): Promise<ClaimEmailAddress | null> {
    try {
      // Check if email already exists
      const existing = await communicationRepository.getClaimEmailAddress(claimId);
      if (existing) {
        return existing;
      }

      // Generate unique email address
      const emailPrefix = this.generateEmailPrefix(claimNumber);
      const emailAddress = `${emailPrefix}@claimguru.app`;

      // Create new claim email address
      const claimEmail = await communicationRepository.createClaimEmailAddress({
        organization_id: organizationId,
        claim_id: claimId,
        email_address: emailAddress,
        email_prefix: emailPrefix,
        status: 'active',
      });

      return claimEmail;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'claim-email', operation: 'get-or-create' },
        extra: { claimId, organizationId, claimNumber },
      });
      console.error('Error creating claim email:', error);
      return null;
    }
  }

  /**
   * Generate email prefix from claim number
   */
  private generateEmailPrefix(claimNumber: string): string {
    // Sanitize claim number for email prefix
    const sanitized = claimNumber
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `claim-${sanitized}`;
  }

  /**
   * Add CC recipients to claim email
   */
  async addCCRecipients(
    claimId: string,
    recipients: string[]
  ): Promise<ClaimEmailAddress | null> {
    try {
      const claimEmail = await communicationRepository.getClaimEmailAddress(claimId);
      if (!claimEmail) {
        console.warn(`Claim email not found for claim: ${claimId}`);
        return null;
      }

      // Merge with existing CC recipients
      const existingCC = claimEmail.default_cc_emails || [];
      const uniqueCC = Array.from(new Set([...existingCC, ...recipients]));

      // Update via repository
      // Note: We'd need to add an update method to the repository
      return claimEmail;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: 'claim-email', operation: 'add-cc' },
        extra: { claimId, recipients },
      });
      console.error('Error adding CC recipients:', error);
      return null;
    }
  }

  /**
   * Parse incoming email to extract claim ID from address
   */
  extractClaimIdFromEmail(emailAddress: string): string | null {
    try {
      // Expected format: claim-{claimNumber}@claimguru.app
      const match = emailAddress.match(/claim-([a-z0-9-]+)@claimguru\.app/i);
      if (match) {
        return match[1];
      }
      return null;
    } catch (error) {
      console.error('Error extracting claim ID from email:', error);
      return null;
    }
  }

  /**
   * Validate email address format
   */
  isValidClaimEmail(emailAddress: string): boolean {
    const pattern = /^claim-[a-z0-9-]+@claimguru\.app$/i;
    return pattern.test(emailAddress);
  }
}

// Export singleton instance
export const claimEmailService = new ClaimEmailService();
