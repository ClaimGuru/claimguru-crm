import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Bell } from 'lucide-react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number // in milliseconds, 0 for persistent
  action?: {
    label: string
    onClick: () => void
  }
  isRead?: boolean
  createdAt: Date
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
  maxNotifications?: number
}

export function NotificationProvider({ children, maxNotifications = 100 }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('claimguru-notifications')
    if (stored) {
      try {
        const parsed = JSON.parse(stored).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }))
        setNotifications(parsed)
      } catch (error) {
        console.error('Failed to load notifications from storage:', error)
      }
    }
  }, [])
  
  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('claimguru-notifications', JSON.stringify(notifications))
  }, [notifications])
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      isRead: false
    }
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      // Keep only the most recent notifications
      return updated.slice(0, maxNotifications)
    })
    
    // Auto-remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration)
    }
    
    return id
  }, [maxNotifications])
  
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])
  
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }, [])
  
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [])
  
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])
  
  const unreadCount = notifications.filter(n => !n.isRead).length
  
  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

// Notification Toast Component
interface NotificationToastProps {
  notification: Notification
  onClose: (id: string) => void
}

function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info': return <Info className="h-5 w-5 text-blue-500" />
    }
  }
  
  const getBorderColor = () => {
    switch (notification.type) {
      case 'success': return 'border-l-green-500'
      case 'error': return 'border-l-red-500'
      case 'warning': return 'border-l-yellow-500'
      case 'info': return 'border-l-blue-500'
    }
  }
  
  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${getBorderColor()} rounded-lg shadow-lg p-4 max-w-sm w-full pointer-events-auto`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {notification.title}
          </p>
          {notification.message && (
            <p className="mt-1 text-sm text-gray-500">
              {notification.message}
            </p>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => onClose(notification.id)}
            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Notification Toast Container
export function NotificationToastContainer() {
  const { notifications, removeNotification } = useNotifications()
  
  // Only show recent notifications as toasts (last 5 minutes)
  const recentNotifications = notifications.filter(n => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return n.createdAt > fiveMinutesAgo && (n.duration === undefined || n.duration === 0)
  }).slice(0, 5) // Show max 5 toasts
  
  return (
    <div className="fixed bottom-0 right-0 z-50 p-6 space-y-4 pointer-events-none">
      {recentNotifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  )
}

// Notification Bell Component for Header
interface NotificationBellProps {
  onClick?: () => void
  className?: string
}

export function NotificationBell({ onClick, className = '' }: NotificationBellProps) {
  const { unreadCount } = useNotifications()
  
  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors ${className}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

export default NotificationProvider