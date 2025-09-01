import React, { useState } from 'react'
import { Plus, Zap, FileText, Users, Search, Calendar, Bell, Settings, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useIsMobile } from '../../hooks/use-mobile'

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  action: () => void
  description?: string
  shortcut?: string
  category: 'primary' | 'secondary'
}

interface QuickActionsProps {
  onClose?: () => void
  className?: string
}

export function QuickActions({ onClose, className = '' }: QuickActionsProps) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  
  const quickActions: QuickAction[] = [
    {
      id: 'new-claim-manual',
      label: 'New Claim (Manual)',
      icon: FileText,
      action: () => {
        navigate('/claims/new')
        handleClose()
      },
      description: 'Create a new claim with manual entry',
      shortcut: 'Ctrl+N',
      category: 'primary'
    },
    {
      id: 'new-claim-ai',
      label: 'AI-Enhanced Claim',
      icon: Zap,
      action: () => {
        navigate('/claims')
        // Trigger AI wizard - would need to be handled by parent component
        setTimeout(() => {
          const aiButton = document.querySelector('[data-testid="ai-wizard-button"]') as HTMLButtonElement
          aiButton?.click()
        }, 100)
        handleClose()
      },
      description: 'Use AI to extract claim information from documents',
      category: 'primary'
    },
    {
      id: 'new-client',
      label: 'Add Client',
      icon: Users,
      action: () => {
        navigate('/clients')
        handleClose()
      },
      description: 'Add a new client to your database',
      category: 'primary'
    },
    {
      id: 'search',
      label: 'Global Search',
      icon: Search,
      action: () => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
        searchInput?.focus()
        handleClose()
      },
      description: 'Search claims, clients, and documents',
      shortcut: 'Ctrl+K',
      category: 'secondary'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      action: () => {
        navigate('/calendar')
        handleClose()
      },
      description: 'View your calendar and appointments',
      category: 'secondary'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      action: () => {
        navigate('/notifications')
        handleClose()
      },
      description: 'Check your latest notifications',
      category: 'secondary'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => {
        navigate('/settings')
        handleClose()
      },
      description: 'Manage your account and preferences',
      category: 'secondary'
    }
  ]
  
  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }
  
  const primaryActions = quickActions.filter(action => action.category === 'primary')
  const secondaryActions = quickActions.filter(action => action.category === 'secondary')
  
  if (isMobile) {
    return (
      <>
        {/* Mobile floating action button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </button>
        
        {/* Mobile quick actions overlay */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={handleClose}
            />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Primary actions */}
              <div className="space-y-3 mb-6">
                {primaryActions.map(action => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full flex items-center space-x-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{action.label}</div>
                        {action.description && (
                          <div className="text-sm text-gray-600">{action.description}</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {/* Secondary actions */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">More Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  {secondaryActions.map(action => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.id}
                        onClick={action.action}
                        className="flex flex-col items-center space-y-2 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{action.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </>
    )
  }
  
  // Desktop quick actions dropdown
  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Quick Actions
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30"
            onClick={handleClose}
          />
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-40 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Quick Actions</h3>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Primary actions */}
            <div className="space-y-2 mb-4">
              {primaryActions.map(action => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                  >
                    <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{action.label}</div>
                      {action.description && (
                        <div className="text-xs text-gray-600">{action.description}</div>
                      )}
                    </div>
                    {action.shortcut && (
                      <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">
                        {action.shortcut}
                      </kbd>
                    )}
                  </button>
                )
              })}
            </div>
            
            {/* Secondary actions */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-2">
                {secondaryActions.map(action => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="flex flex-col items-center space-y-1 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-900">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default QuickActions