import React, { useState, useEffect } from 'react'
import { Bell, Check, CheckCircle, Clock, AlertTriangle, Info, X, Eye, Trash2, Filter, Search, Mail, Phone, Calendar, FileText, DollarSign, Users } from 'lucide-react'
import { supabase, Notification } from '../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

interface NotificationsPageProps {}

const Notifications: React.FC<NotificationsPageProps> = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  const notificationTypes = [
    { value: 'all', label: 'All Types', icon: Bell },
    { value: 'claim_update', label: 'Claim Updates', icon: FileText },
    { value: 'document_upload', label: 'Document Uploads', icon: FileText },
    { value: 'payment_received', label: 'Payments', icon: DollarSign },
    { value: 'deadline_reminder', label: 'Deadlines', icon: Clock },
    { value: 'vendor_assignment', label: 'Vendor Assignments', icon: Users },
    { value: 'communication', label: 'Communications', icon: Mail },
    { value: 'system_alert', label: 'System Alerts', icon: AlertTriangle },
    { value: 'appointment', label: 'Appointments', icon: Calendar }
  ]

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', notificationIds)
      
      if (error) throw error
      
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id)
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      )
      setSelectedNotifications([])
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const markAsUnread = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: false, read_at: null })
        .in('id', notificationIds)
      
      if (error) throw error
      
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id)
            ? { ...notification, is_read: false, read_at: null }
            : notification
        )
      )
      setSelectedNotifications([])
    } catch (error) {
      console.error('Error marking notifications as unread:', error)
    }
  }

  const deleteNotifications = async (notificationIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${notificationIds.length} notification(s)?`)) return
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds)
      
      if (error) throw error
      
      setNotifications(prev => 
        prev.filter(notification => !notificationIds.includes(notification.id))
      )
      setSelectedNotifications([])
    } catch (error) {
      console.error('Error deleting notifications:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = filteredNotifications.filter(n => !n.is_read)
    if (unreadNotifications.length > 0) {
      await markAsRead(unreadNotifications.map(n => n.id))
    }
  }

  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const selectAllFiltered = () => {
    const allFilteredIds = filteredNotifications.map(n => n.id)
    setSelectedNotifications(allFilteredIds)
  }

  const clearSelection = () => {
    setSelectedNotifications([])
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = filter === 'all' || 
      (filter === 'read' && notification.is_read) ||
      (filter === 'unread' && !notification.is_read)
    
    const matchesTypeFilter = typeFilter === 'all' || notification.type === typeFilter
    
    const matchesSearch = searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesReadFilter && matchesTypeFilter && matchesSearch
  })

  const getNotificationIcon = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type)
    return typeConfig ? typeConfig.icon : Info
  }

  const getNotificationColor = (type: string, priority?: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-100'
    if (priority === 'medium') return 'text-orange-600 bg-orange-100'
    
    switch (type) {
      case 'claim_update': return 'text-blue-600 bg-blue-100'
      case 'document_upload': return 'text-green-600 bg-green-100'
      case 'payment_received': return 'text-purple-600 bg-purple-100'
      case 'deadline_reminder': return 'text-orange-600 bg-orange-100'
      case 'vendor_assignment': return 'text-indigo-600 bg-indigo-100'
      case 'communication': return 'text-teal-600 bg-teal-100'
      case 'system_alert': return 'text-red-600 bg-red-100'
      case 'appointment': return 'text-pink-600 bg-pink-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedNotifications.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAsRead(selectedNotifications)}
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Mark Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAsUnread(selectedNotifications)}
                className="flex items-center gap-1"
              >
                <Bell className="h-4 w-4" />
                Mark Unread
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteNotifications(selectedNotifications)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          )}
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-3xl font-bold text-gray-900">{unreadCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-3xl font-bold text-gray-900">
                  {notifications.filter(n => n.priority === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-3xl font-bold text-gray-900">
                  {notifications.filter(n => 
                    new Date(n.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {notificationTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <Button
            variant="outline"
            onClick={selectAllFiltered}
            disabled={filteredNotifications.length === 0}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Select All
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {notifications.length === 0 ? 'No notifications yet' : 'No matching notifications'}
            </h3>
            <p className="text-gray-600">
              {notifications.length === 0 
                ? 'New notifications will appear here'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            const colorClass = getNotificationColor(notification.type, notification.priority)
            const isSelected = selectedNotifications.includes(notification.id)
            
            return (
              <div
                key={notification.id} 
                className="cursor-pointer"
                onClick={() => toggleSelectNotification(notification.id)}
              >
                <Card 
                  className={`hover:shadow-md transition-shadow ${
                    !notification.is_read ? 'bg-blue-50 border-blue-200' : ''
                  } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectNotification(notification.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-medium ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {notification.priority === 'high' && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                High Priority
                              </span>
                            )}
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className={`text-sm mt-1 ${
                          !notification.is_read ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            {notification.action_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(notification.action_url, '_blank')
                                }}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                notification.is_read 
                                  ? markAsUnread([notification.id])
                                  : markAsRead([notification.id])
                              }}
                              className="flex items-center gap-1"
                            >
                              {notification.is_read ? (
                                <><Bell className="h-3 w-3" /> Unread</>
                              ) : (
                                <><Check className="h-3 w-3" /> Read</>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Notifications