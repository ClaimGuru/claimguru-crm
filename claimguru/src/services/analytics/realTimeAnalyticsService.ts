/**
 * Real-Time Analytics Service
 * Provides live analytics data with Supabase real-time subscriptions
 */

import { supabase } from '../../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface AnalyticsMetrics {
  totalClaims: number
  openClaims: number
  closedClaims: number
  pendingClaims: number
  totalValue: number
  avgProcessingTime: number
  claimsByStatus: Record<string, number>
  claimsByType: Record<string, number>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
  monthlyTrends: Array<{
    month: string
    claims: number
    value: number
  }>
}

export interface DashboardStats {
  totalClients: number
  totalClaims: number
  activeTasks: number
  pendingDocuments: number
  revenue: number
  conversionRate: number
  avgClaimValue: number
  timeToClose: number
}

class RealTimeAnalyticsService {
  private static instance: RealTimeAnalyticsService
  private channels: Map<string, RealtimeChannel> = new Map()
  private listeners: Map<string, Set<Function>> = new Map()

  private constructor() {}

  static getInstance(): RealTimeAnalyticsService {
    if (!RealTimeAnalyticsService.instance) {
      RealTimeAnalyticsService.instance = new RealTimeAnalyticsService()
    }
    return RealTimeAnalyticsService.instance
  }

  /**
   * Get real-time dashboard statistics
   */
  async getDashboardStats(organizationId: string): Promise<DashboardStats> {
    try {
      console.log('📊 Fetching dashboard stats...')

      // Get total clients
      const { count: clientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      // Get claims data
      const { data: claims } = await supabase
        .from('claims')
        .select('status, claim_amount, created_at, updated_at')
        .eq('organization_id', organizationId)

      // Get active tasks
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .neq('status', 'completed')

      // Get pending documents
      const { count: docCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('status', 'pending')

      // Calculate metrics
      const totalClaims = claims?.length || 0
      const totalRevenue = claims?.reduce((sum, claim) => sum + (parseFloat(claim.claim_amount) || 0), 0) || 0
      const avgClaimValue = totalClaims > 0 ? totalRevenue / totalClaims : 0

      // Calculate average time to close
      const closedClaims = claims?.filter(c => c.status === 'closed') || []
      const avgTimeToClose = this.calculateAvgTimeToClose(closedClaims)

      // Calculate conversion rate (closed claims / total claims)
      const conversionRate = totalClaims > 0 ? (closedClaims.length / totalClaims) * 100 : 0

      return {
        totalClients: clientCount || 0,
        totalClaims,
        activeTasks: taskCount || 0,
        pendingDocuments: docCount || 0,
        revenue: totalRevenue,
        conversionRate,
        avgClaimValue,
        timeToClose: avgTimeToClose
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error)
      throw error
    }
  }

  /**
   * Get comprehensive analytics metrics
   */
  async getAnalyticsMetrics(organizationId: string): Promise<AnalyticsMetrics> {
    try {
      console.log('📈 Fetching analytics metrics...')

      // Get all claims with details
      const { data: claims } = await supabase
        .from('claims')
        .select('*, client:clients(first_name, last_name)')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      const totalClaims = claims?.length || 0
      const openClaims = claims?.filter(c => c.status === 'open' || c.status === 'in_progress').length || 0
      const closedClaims = claims?.filter(c => c.status === 'closed').length || 0
      const pendingClaims = claims?.filter(c => c.status === 'pending').length || 0

      // Calculate total value
      const totalValue = claims?.reduce((sum, claim) => sum + (parseFloat(claim.claim_amount) || 0), 0) || 0

      // Group by status
      const claimsByStatus: Record<string, number> = {}
      claims?.forEach(claim => {
        claimsByStatus[claim.status] = (claimsByStatus[claim.status] || 0) + 1
      })

      // Group by type
      const claimsByType: Record<string, number> = {}
      claims?.forEach(claim => {
        const type = claim.claim_type || 'Unknown'
        claimsByType[type] = (claimsByType[type] || 0) + 1
      })

      // Get recent activity
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(10)

      const recentActivity = activities?.map(activity => ({
        id: activity.id,
        type: activity.activity_type,
        description: activity.description,
        timestamp: activity.created_at
      })) || []

      // Calculate monthly trends
      const monthlyTrends = this.calculateMonthlyTrends(claims || [])

      // Calculate average processing time
      const avgProcessingTime = this.calculateAvgProcessingTime(claims || [])

      return {
        totalClaims,
        openClaims,
        closedClaims,
        pendingClaims,
        totalValue,
        avgProcessingTime,
        claimsByStatus,
        claimsByType,
        recentActivity,
        monthlyTrends
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error)
      throw error
    }
  }

  /**
   * Subscribe to real-time analytics updates
   */
  subscribeToAnalytics(organizationId: string, callback: (metrics: Partial<AnalyticsMetrics>) => void): () => void {
    const channelName = `analytics:${organizationId}`

    // Check if channel already exists
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'claims', filter: `organization_id=eq.${organizationId}` },
          async () => {
            console.log('📊 Claims changed, refreshing analytics...')
            const metrics = await this.getAnalyticsMetrics(organizationId)
            this.notifyListeners(channelName, metrics)
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'activities', filter: `organization_id=eq.${organizationId}` },
          async () => {
            console.log('📊 Activity changed, refreshing analytics...')
            const metrics = await this.getAnalyticsMetrics(organizationId)
            this.notifyListeners(channelName, metrics)
          }
        )
        .subscribe()

      this.channels.set(channelName, channel)
      this.listeners.set(channelName, new Set())
    }

    // Add listener
    const listeners = this.listeners.get(channelName)!
    listeners.add(callback)

    // Return unsubscribe function
    return () => {
      listeners.delete(callback)
      if (listeners.size === 0) {
        const channel = this.channels.get(channelName)
        if (channel) {
          supabase.removeChannel(channel)
          this.channels.delete(channelName)
          this.listeners.delete(channelName)
        }
      }
    }
  }

  /**
   * Subscribe to real-time dashboard updates
   */
  subscribeToDashboard(organizationId: string, callback: (stats: DashboardStats) => void): () => void {
    const channelName = `dashboard:${organizationId}`

    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'claims', filter: `organization_id=eq.${organizationId}` },
          async () => {
            const stats = await this.getDashboardStats(organizationId)
            this.notifyListeners(channelName, stats)
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'tasks', filter: `organization_id=eq.${organizationId}` },
          async () => {
            const stats = await this.getDashboardStats(organizationId)
            this.notifyListeners(channelName, stats)
          }
        )
        .subscribe()

      this.channels.set(channelName, channel)
      this.listeners.set(channelName, new Set())
    }

    const listeners = this.listeners.get(channelName)!
    listeners.add(callback)

    return () => {
      listeners.delete(callback)
      if (listeners.size === 0) {
        const channel = this.channels.get(channelName)
        if (channel) {
          supabase.removeChannel(channel)
          this.channels.delete(channelName)
          this.listeners.delete(channelName)
        }
      }
    }
  }

  /**
   * Notify all listeners for a channel
   */
  private notifyListeners(channelName: string, data: any) {
    const listeners = this.listeners.get(channelName)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  /**
   * Calculate average processing time in days
   */
  private calculateAvgProcessingTime(claims: any[]): number {
    const closedClaims = claims.filter(c => c.status === 'closed' && c.created_at && c.updated_at)
    
    if (closedClaims.length === 0) return 0

    const totalDays = closedClaims.reduce((sum, claim) => {
      const created = new Date(claim.created_at)
      const updated = new Date(claim.updated_at)
      const days = Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0)

    return Math.round(totalDays / closedClaims.length)
  }

  /**
   * Calculate average time to close in days
   */
  private calculateAvgTimeToClose(closedClaims: any[]): number {
    if (closedClaims.length === 0) return 0

    const totalDays = closedClaims.reduce((sum, claim) => {
      const created = new Date(claim.created_at)
      const updated = new Date(claim.updated_at)
      const days = Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0)

    return Math.round(totalDays / closedClaims.length)
  }

  /**
   * Calculate monthly trends for the last 12 months
   */
  private calculateMonthlyTrends(claims: any[]): Array<{ month: string; claims: number; value: number }> {
    const trends: Record<string, { claims: number; value: number }> = {}
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Initialize last 12 months
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      trends[key] = { claims: 0, value: 0 }
    }

    // Aggregate claims by month
    claims.forEach(claim => {
      const date = new Date(claim.created_at)
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      
      if (trends[key]) {
        trends[key].claims++
        trends[key].value += parseFloat(claim.claim_amount) || 0
      }
    })

    return Object.entries(trends).map(([month, data]) => ({
      month,
      claims: data.claims,
      value: Math.round(data.value)
    }))
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll() {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
    this.listeners.clear()
  }
}

export const realTimeAnalyticsService = RealTimeAnalyticsService.getInstance()
export default realTimeAnalyticsService
