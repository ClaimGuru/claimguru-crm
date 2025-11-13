/**
 * Sales Pipeline Service
 * Backend service for managing sales pipeline, stages, and lead progression
 */

import { supabase } from '../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface PipelineStage {
  id: string
  name: string
  order: number
  color: string
  organization_id: string
  created_at: string
  updated_at: string
}

export interface PipelineLead {
  id: string
  lead_id: string
  stage_id: string
  organization_id: string
  position: number
  probability: number
  estimated_value: number
  expected_close_date?: string
  notes?: string
  created_at: string
  updated_at: string
  // Joined data
  lead?: any
  stage?: PipelineStage
}

export interface PipelineStats {
  totalLeads: number
  totalValue: number
  avgDealSize: number
  conversionRate: number
  stageDistribution: Record<string, number>
  velocityByStage: Record<string, number>
}

class SalesPipelineService {
  private static instance: SalesPipelineService
  private channels: Map<string, RealtimeChannel> = new Map()

  private constructor() {}

  static getInstance(): SalesPipelineService {
    if (!SalesPipelineService.instance) {
      SalesPipelineService.instance = new SalesPipelineService()
    }
    return SalesPipelineService.instance
  }

  /**
   * Get all pipeline stages for an organization
   */
  async getStages(organizationId: string): Promise<PipelineStage[]> {
    try {
      const { data, error } = await supabase
        .from('sales_funnel_stages')
        .select('*')
        .eq('organization_id', organizationId)
        .order('order', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Error fetching pipeline stages:', error)
      throw error
    }
  }

  /**
   * Create a new pipeline stage
   */
  async createStage(organizationId: string, stage: Partial<PipelineStage>): Promise<PipelineStage> {
    try {
      // Get max order
      const { data: stages } = await supabase
        .from('sales_funnel_stages')
        .select('order')
        .eq('organization_id', organizationId)
        .order('order', { ascending: false })
        .limit(1)

      const maxOrder = stages?.[0]?.order || 0

      const { data, error } = await supabase
        .from('sales_funnel_stages')
        .insert({
          ...stage,
          organization_id: organizationId,
          order: maxOrder + 1
        })
        .select()
        .single()

      if (error) throw error

      console.log('✅ Pipeline stage created:', data.name)
      return data
    } catch (error) {
      console.error('❌ Error creating pipeline stage:', error)
      throw error
    }
  }

  /**
   * Update pipeline stage
   */
  async updateStage(stageId: string, updates: Partial<PipelineStage>): Promise<PipelineStage> {
    try {
      const { data, error } = await supabase
        .from('sales_funnel_stages')
        .update(updates)
        .eq('id', stageId)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Pipeline stage updated')
      return data
    } catch (error) {
      console.error('❌ Error updating pipeline stage:', error)
      throw error
    }
  }

  /**
   * Delete pipeline stage
   */
  async deleteStage(stageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sales_funnel_stages')
        .delete()
        .eq('id', stageId)

      if (error) throw error

      console.log('✅ Pipeline stage deleted')
    } catch (error) {
      console.error('❌ Error deleting pipeline stage:', error)
      throw error
    }
  }

  /**
   * Reorder pipeline stages
   */
  async reorderStages(organizationId: string, stageIds: string[]): Promise<void> {
    try {
      // Update order for each stage
      const updates = stageIds.map((stageId, index) => 
        supabase
          .from('sales_funnel_stages')
          .update({ order: index })
          .eq('id', stageId)
          .eq('organization_id', organizationId)
      )

      await Promise.all(updates)

      console.log('✅ Pipeline stages reordered')
    } catch (error) {
      console.error('❌ Error reordering stages:', error)
      throw error
    }
  }

  /**
   * Get all leads in pipeline
   */
  async getLeadsInPipeline(organizationId: string): Promise<PipelineLead[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          stage:sales_funnel_stages(*)
        `)
        .eq('organization_id', organizationId)
        .not('stage_id', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(lead => ({
        id: lead.id,
        lead_id: lead.id,
        stage_id: lead.stage_id,
        organization_id: lead.organization_id,
        position: 0,
        probability: lead.probability || 0,
        estimated_value: parseFloat(lead.estimated_value) || 0,
        expected_close_date: lead.expected_close_date,
        notes: lead.notes,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        lead,
        stage: lead.stage
      }))
    } catch (error) {
      console.error('❌ Error fetching pipeline leads:', error)
      throw error
    }
  }

  /**
   * Get leads by stage
   */
  async getLeadsByStage(organizationId: string, stageId: string): Promise<PipelineLead[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          stage:sales_funnel_stages(*)
        `)
        .eq('organization_id', organizationId)
        .eq('stage_id', stageId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(lead => ({
        id: lead.id,
        lead_id: lead.id,
        stage_id: lead.stage_id,
        organization_id: lead.organization_id,
        position: 0,
        probability: lead.probability || 0,
        estimated_value: parseFloat(lead.estimated_value) || 0,
        expected_close_date: lead.expected_close_date,
        notes: lead.notes,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        lead,
        stage: lead.stage
      }))
    } catch (error) {
      console.error('❌ Error fetching leads by stage:', error)
      throw error
    }
  }

  /**
   * Move lead to different stage
   */
  async moveLead(leadId: string, toStageId: string, position?: number): Promise<void> {
    try {
      const updates: any = {
        stage_id: toStageId,
        updated_at: new Date().toISOString()
      }

      if (position !== undefined) {
        updates.position = position
      }

      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)

      if (error) throw error

      // Log activity
      await this.logPipelineActivity(leadId, 'stage_change', `Moved to new stage`)

      console.log('✅ Lead moved to stage:', toStageId)
    } catch (error) {
      console.error('❌ Error moving lead:', error)
      throw error
    }
  }

  /**
   * Update lead probability and value
   */
  async updateLeadProbability(leadId: string, probability: number, estimatedValue?: number): Promise<void> {
    try {
      const updates: any = {
        probability,
        updated_at: new Date().toISOString()
      }

      if (estimatedValue !== undefined) {
        updates.estimated_value = estimatedValue
      }

      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)

      if (error) throw error

      console.log('✅ Lead probability updated')
    } catch (error) {
      console.error('❌ Error updating lead probability:', error)
      throw error
    }
  }

  /**
   * Convert lead to claim
   */
  async convertLeadToClaim(leadId: string, organizationId: string): Promise<string> {
    try {
      // Get lead details
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (leadError) throw leadError

      // Create claim from lead
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .insert({
          organization_id: organizationId,
          client_id: lead.client_id,
          claim_number: `CLM-${Date.now()}`,
          status: 'open',
          claim_type: lead.claim_type || 'General',
          claim_amount: lead.estimated_value,
          description: lead.notes,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (claimError) throw claimError

      // Update lead status
      await supabase
        .from('leads')
        .update({
          status: 'converted',
          converted_to_claim_id: claim.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

      // Log activity
      await this.logPipelineActivity(leadId, 'converted', `Converted to claim ${claim.claim_number}`)

      console.log('✅ Lead converted to claim:', claim.id)
      return claim.id
    } catch (error) {
      console.error('❌ Error converting lead to claim:', error)
      throw error
    }
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats(organizationId: string): Promise<PipelineStats> {
    try {
      const { data: leads } = await supabase
        .from('leads')
        .select('*, stage:sales_funnel_stages(*)')
        .eq('organization_id', organizationId)
        .not('stage_id', 'is', null)

      const totalLeads = leads?.length || 0
      const totalValue = leads?.reduce((sum, lead) => sum + (parseFloat(lead.estimated_value) || 0), 0) || 0
      const avgDealSize = totalLeads > 0 ? totalValue / totalLeads : 0

      // Calculate conversion rate (converted leads / total leads)
      const convertedLeads = leads?.filter(l => l.status === 'converted').length || 0
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

      // Stage distribution
      const stageDistribution: Record<string, number> = {}
      leads?.forEach(lead => {
        const stageName = lead.stage?.name || 'Unknown'
        stageDistribution[stageName] = (stageDistribution[stageName] || 0) + 1
      })

      // Calculate velocity by stage (average days in stage)
      const velocityByStage: Record<string, number> = {}
      const stageGroups = leads?.reduce((acc: any, lead) => {
        const stageName = lead.stage?.name || 'Unknown'
        if (!acc[stageName]) acc[stageName] = []
        acc[stageName].push(lead)
        return acc
      }, {})

      Object.entries(stageGroups || {}).forEach(([stage, stageLeads]: [string, any]) => {
        const avgDays = stageLeads.reduce((sum: number, lead: any) => {
          const created = new Date(lead.created_at)
          const updated = new Date(lead.updated_at)
          const days = Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0) / stageLeads.length
        velocityByStage[stage] = Math.round(avgDays)
      })

      return {
        totalLeads,
        totalValue,
        avgDealSize,
        conversionRate,
        stageDistribution,
        velocityByStage
      }
    } catch (error) {
      console.error('❌ Error fetching pipeline stats:', error)
      throw error
    }
  }

  /**
   * Subscribe to pipeline changes
   */
  subscribeToPipeline(organizationId: string, callback: (event: any) => void): () => void {
    const channelName = `pipeline:${organizationId}`

    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'leads', filter: `organization_id=eq.${organizationId}` },
          (payload) => {
            console.log('📊 Pipeline change detected:', payload)
            callback(payload)
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'sales_funnel_stages', filter: `organization_id=eq.${organizationId}` },
          (payload) => {
            console.log('📊 Stage change detected:', payload)
            callback(payload)
          }
        )
        .subscribe()

      this.channels.set(channelName, channel)
    }

    return () => {
      const channel = this.channels.get(channelName)
      if (channel) {
        supabase.removeChannel(channel)
        this.channels.delete(channelName)
      }
    }
  }

  /**
   * Log pipeline activity
   */
  private async logPipelineActivity(leadId: string, activityType: string, description: string): Promise<void> {
    try {
      // Get lead to get organization_id
      const { data: lead } = await supabase
        .from('leads')
        .select('organization_id')
        .eq('id', leadId)
        .single()

      if (!lead) return

      await supabase
        .from('activities')
        .insert({
          organization_id: lead.organization_id,
          entity_type: 'lead',
          entity_id: leadId,
          activity_type: activityType,
          description,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('❌ Error logging pipeline activity:', error)
    }
  }

  /**
   * Initialize default pipeline stages
   */
  async initializeDefaultStages(organizationId: string): Promise<void> {
    try {
      const defaultStages = [
        { name: 'New Lead', color: '#3B82F6', order: 0 },
        { name: 'Contacted', color: '#8B5CF6', order: 1 },
        { name: 'Qualified', color: '#06B6D4', order: 2 },
        { name: 'Proposal', color: '#F59E0B', order: 3 },
        { name: 'Negotiation', color: '#EF4444', order: 4 },
        { name: 'Closed Won', color: '#10B981', order: 5 }
      ]

      const { error } = await supabase
        .from('sales_funnel_stages')
        .insert(
          defaultStages.map(stage => ({
            ...stage,
            organization_id: organizationId
          }))
        )

      if (error) throw error

      console.log('✅ Default pipeline stages initialized')
    } catch (error) {
      console.error('❌ Error initializing default stages:', error)
      throw error
    }
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
  }
}

export const salesPipelineService = SalesPipelineService.getInstance()
export default salesPipelineService
