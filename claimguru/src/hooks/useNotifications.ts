import { useState, useEffect } from 'react'
import { supabase, Notification } from '../lib/supabase'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      
      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read_at).length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
      
      if (error) throw error
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read_at)
      
      if (unreadNotifications.length === 0) return
      
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadNotifications.map(n => n.id))
      
      if (error) throw error
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
      
      if (error) throw error
      
      const notification = notifications.find(n => n.id === notificationId)
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      if (notification && !notification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          organization_id: '00000000-0000-0000-0000-000000000000' // Default org
        })
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        setNotifications(prev => [data, ...prev])
        if (!notification.read_at) {
          setUnreadCount(prev => prev + 1)
        }
      }
      
      return data
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new as Notification, ...prev])
          if (!(payload.new as Notification).read_at) {
            setUnreadCount(prev => prev + 1)
          }
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => 
            prev.map(n => 
              n.id === payload.new.id ? payload.new as Notification : n
            )
          )
        } else if (payload.eventType === 'DELETE') {
          const notification = notifications.find(n => n.id === payload.old.id)
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
          if (notification && !notification.read_at) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      })
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refreshNotifications: fetchNotifications
  }
}

export default useNotifications