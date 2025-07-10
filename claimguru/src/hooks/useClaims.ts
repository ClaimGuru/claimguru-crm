import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Claim } from '../lib/supabase'

export function useClaims() {
  const { userProfile } = useAuth()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadClaims()
    }
  }, [userProfile?.organization_id])

  async function loadClaims() {
    if (!userProfile?.organization_id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setClaims(data || [])
    } catch (error: any) {
      console.error('Error loading claims:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function createClaim(claimData: Partial<Claim>) {
    if (!userProfile?.organization_id || !userProfile?.id) {
      throw new Error('User not properly authenticated')
    }

    try {
      // Generate file number if not provided
      const fileNumber = claimData.file_number || `CG-${new Date().getFullYear()}-${String(claims.length + 1).padStart(3, '0')}`

      const newClaim = {
        ...claimData,
        organization_id: userProfile.organization_id,
        assigned_adjuster_id: userProfile.id,
        created_by: userProfile.id,
        file_number: fileNumber,
        claim_status: claimData.claim_status || 'new',
        claim_phase: claimData.claim_phase || 'intake',
        priority: claimData.priority || 'medium',
        date_of_loss: claimData.date_of_loss || new Date().toISOString(),
        cause_of_loss: claimData.cause_of_loss || 'Unknown',
        contract_fee_type: claimData.contract_fee_type || 'percentage',
        is_claim_filed: claimData.is_claim_filed || false,
        is_fema_claim: claimData.is_fema_claim || false,
        is_state_emergency: claimData.is_state_emergency || false,
        has_ale_expenses: claimData.has_ale_expenses || false,
        has_repairs_been_done: claimData.has_repairs_been_done || false,
        has_prior_claims: claimData.has_prior_claims || false,
        is_final_settlement: claimData.is_final_settlement || false,
        settlement_status: claimData.settlement_status || 'pending',
        watch_list: claimData.watch_list || false
      }

      const { data, error } = await supabase
        .from('claims')
        .insert([newClaim])
        .select()
        .single()

      if (error) {
        throw error
      }

      setClaims(prev => [data, ...prev])
      return data
    } catch (error: any) {
      console.error('Error creating claim:', error)
      throw error
    }
  }

  async function updateClaim(id: string, updates: Partial<Claim>) {
    if (!userProfile?.organization_id) {
      throw new Error('User not properly authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('claims')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', userProfile.organization_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setClaims(prev => prev.map(claim => 
        claim.id === id ? data : claim
      ))
      return data
    } catch (error: any) {
      console.error('Error updating claim:', error)
      throw error
    }
  }

  async function deleteClaim(id: string) {
    if (!userProfile?.organization_id) {
      throw new Error('User not properly authenticated')
    }

    try {
      const { error } = await supabase
        .from('claims')
        .delete()
        .eq('id', id)
        .eq('organization_id', userProfile.organization_id)

      if (error) {
        throw error
      }

      setClaims(prev => prev.filter(claim => claim.id !== id))
    } catch (error: any) {
      console.error('Error deleting claim:', error)
      throw error
    }
  }

  return {
    claims,
    loading,
    error,
    createClaim,
    updateClaim,
    deleteClaim,
    refetch: loadClaims
  }
}