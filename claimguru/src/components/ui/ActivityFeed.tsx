import React, { useState, useEffect } from 'react'
import { Activity, Clock, User, FileText, DollarSign, MessageCircle, Bell } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface ActivityItem {
  id: string
  type: 'claim_created' | 'claim_updated' | 'document_uploaded' | 'payment_received' | 'message_sent' | 'task_completed'
  title: string
  description: string
  user: {
    name: string
    avatar?: string
  }
  metadata?: {
    claimId?: string
    amount?: number
    status?: string
    priority?: string
  }
  createdAt: Date
  isUnread?: boolean
}

interface ActivityFeedProps {
  limit?: number
  showHeader?: boolean
  compact?: boolean
  realTime?: boolean
  className?: string
}

export function ActivityFeed({ 
  limit = 50, 
  showHeader = true, 
  compact = false,
  realTime = true,
  className = '' 
}: ActivityFeedProps) {
  const { userProfile } = useAuth()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  
  useEffect(() => {
    loadActivities()
    
    if (realTime) {
      // Set up real-time subscription
      const subscription = supabase
        .channel('activity_feed')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'activities',
            filter: `organization_id=eq.${userProfile?.organization_id}`
          }, 
          handleRealtimeUpdate
        )
        .subscribe()
      
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [userProfile?.organization_id, realTime])
  
  const loadActivities = async () => {
    if (!userProfile?.organization_id) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          user_profiles!activities_user_id_fkey(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      
      const formattedActivities: ActivityItem[] = (data || []).map(activity => ({
        id: activity.id,
        type: activity.activity_type,
        title: activity.title || getDefaultTitle(activity.activity_type),
        description: activity.description || '',
        user: {
          name: activity.user_profiles 
            ? `${activity.user_profiles.first_name} ${activity.user_profiles.last_name}`
            : 'Unknown User',
          avatar: activity.user_profiles?.avatar_url
        },
        metadata: activity.metadata || {},
        createdAt: new Date(activity.created_at),
        isUnread: !activity.is_read
      }))
      
      setActivities(formattedActivities)
    } catch (error: any) {
      console.error('Error loading activities:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleRealtimeUpdate = (payload: any) => {
    console.log('Real-time activity update:', payload)
    
    if (payload.eventType === 'INSERT') {
      // Add new activity to the top
      loadActivities() // Reload to get proper joins
    } else if (payload.eventType === 'UPDATE') {
      // Update existing activity
      setActivities(prev => 
        prev.map(activity => 
          activity.id === payload.new.id 
            ? { ...activity, isUnread: !payload.new.is_read }
            : activity
        )
      )
    }
  }
  
  const getDefaultTitle = (type: string) => {
    switch (type) {
      case 'claim_created': return 'New Claim Created'
      case 'claim_updated': return 'Claim Updated'
      case 'document_uploaded': return 'Document Uploaded'
      case 'payment_received': return 'Payment Received'
      case 'message_sent': return 'Message Sent'
      case 'task_completed': return 'Task Completed'
      default: return 'Activity'
    }
  }
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'claim_created':
      case 'claim_updated':
        return <FileText className="h-4 w-4" />
      case 'document_uploaded':
        return <FileText className="h-4 w-4" />
      case 'payment_received':
        return <DollarSign className="h-4 w-4" />
      case 'message_sent':
        return <MessageCircle className="h-4 w-4" />
      case 'task_completed':
        return <Clock className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }
  
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'claim_created': return 'text-green-600 bg-green-100'
      case 'claim_updated': return 'text-blue-600 bg-blue-100'
      case 'document_uploaded': return 'text-purple-600 bg-purple-100'
      case 'payment_received': return 'text-green-600 bg-green-100'
      case 'message_sent': return 'text-orange-600 bg-orange-100'
      case 'task_completed': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }
  
  const markAsRead = async (activityId: string) => {
    try {
      await supabase
        .from('activities')
        .update({ is_read: true })
        .eq('id', activityId)
      
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, isUnread: false }
            : activity
        )
      )
    } catch (error) {
      console.error('Error marking activity as read:', error)
    }
  }
  
  const markAllAsRead = async () => {
    try {
      await supabase
        .from('activities')
        .update({ is_read: true })
        .eq('organization_id', userProfile?.organization_id)
        .eq('is_read', false)
      
      setActivities(prev => 
        prev.map(activity => ({ ...activity, isUnread: false }))
      )
    } catch (error) {
      console.error('Error marking all activities as read:', error)
    }
  }
  
  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    if (filter === 'unread') return activity.isUnread
    return activity.type === filter
  })
  
  const unreadCount = activities.filter(activity => activity.isUnread).length
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading activities: {error}</p>
        <Button onClick={loadActivities} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }
  
  return (
    <div className={`bg-white ${!compact ? 'border border-gray-200 rounded-lg' : ''} ${className}`}>
      {showHeader && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="claim_created">Claims</option>
                <option value="document_uploaded">Documents</option>
                <option value="payment_received">Payments</option>
                <option value="message_sent">Messages</option>
              </select>
              
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className={`${compact ? 'space-y-2' : 'divide-y divide-gray-200'}`}>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No activities found</p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div
              key={activity.id}
              className={`${compact ? 'p-2' : 'p-4'} hover:bg-gray-50 transition-colors ${
                activity.isUnread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => activity.isUnread && markAsRead(activity.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${activity.isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {activity.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                      {activity.isUnread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-600" />
                      </div>
                      <span className="text-xs text-gray-500">
                        {activity.user.name}
                      </span>
                    </div>
                    
                    {activity.metadata?.amount && (
                      <span className="text-xs text-green-600 font-medium">
                        ${activity.metadata.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {filteredActivities.length === limit && (
        <div className="p-4 text-center border-t border-gray-200">
          <Button variant="outline" onClick={loadActivities}>
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed