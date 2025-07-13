/**
 * Enhanced Claim Service
 * Handles claim operations including auto-folder creation
 */

import { supabase } from '../lib/supabase';
import customFieldService from './customFieldService';

export interface Claim {
  id: string;
  claim_number: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  // ... other claim fields
}

class ClaimService {
  /**
   * Create a new claim with automatic folder structure
   */
  async createClaim(claimData: Partial<Claim>): Promise<Claim> {
    try {
      // First create the claim
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .insert([claimData])
        .select()
        .single();

      if (claimError) {
        console.error('Error creating claim:', claimError);
        throw claimError;
      }

      // Then create the folder structure
      if (claim.organization_id && claim.claim_number) {
        try {
          await customFieldService.applyFolderTemplateToClaimFunction(
            claim.id,
            claim.claim_number,
            claim.organization_id,
            claim.created_by
          );
        } catch (folderError) {
          console.warn('Failed to create claim folders, but claim was created:', folderError);
          // Don't fail the entire operation if folder creation fails
        }
      }

      return claim;
    } catch (error) {
      console.error('Error in createClaim:', error);
      throw error;
    }
  }

  /**
   * Get claim by ID
   */
  async getClaim(claimId: string): Promise<Claim | null> {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single();

    if (error) {
      console.error('Error fetching claim:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update claim
   */
  async updateClaim(claimId: string, updates: Partial<Claim>): Promise<Claim> {
    const { data, error } = await supabase
      .from('claims')
      .update(updates)
      .eq('id', claimId)
      .select()
      .single();

    if (error) {
      console.error('Error updating claim:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get claims for an organization
   */
  async getClaimsForOrganization(organizationId: string): Promise<Claim[]> {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching claims:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create default folder structure for existing claim (manual trigger)
   */
  async createDefaultFoldersForClaim(
    claimId: string, 
    claimNumber: string, 
    organizationId: string, 
    createdBy: string
  ): Promise<void> {
    try {
      await customFieldService.applyFolderTemplateToClaimFunction(
        claimId,
        claimNumber,
        organizationId,
        createdBy
      );
    } catch (error) {
      console.error('Error creating default folders for claim:', error);
      throw error;
    }
  }
}

export const claimService = new ClaimService();
export default claimService;
