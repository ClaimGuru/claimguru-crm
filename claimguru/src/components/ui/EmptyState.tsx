import React from 'react'
import { FileX, Users, Search, Inbox, AlertCircle, Plus, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ComponentType<any>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  illustration?: 'search' | 'inbox' | 'users' | 'files' | 'error' | 'custom'
  className?: string
}

export function EmptyState({
  icon: CustomIcon,
  title,
  description,
  action,
  secondaryAction,
  illustration = 'search',
  className = ''
}: EmptyStateProps) {
  const getIcon = () => {
    if (CustomIcon) return CustomIcon
    
    switch (illustration) {
      case 'search': return Search
      case 'inbox': return Inbox
      case 'users': return Users
      case 'files': return FileX
      case 'error': return AlertCircle
      default: return Search
    }
  }
  
  const Icon = getIcon()
  
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
        <Icon className="w-full h-full" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'primary'}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {action.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// Pre-built empty states for common scenarios
export function EmptyClaimsState({ onCreateClaim }: { onCreateClaim: () => void }) {
  return (
    <EmptyState
      illustration="files"
      title="No claims found"
      description="Get started by creating your first claim or adjusting your search filters."
      action={{
        label: "Create New Claim",
        onClick: onCreateClaim
      }}
    />
  )
}

export function EmptyClientsState({ onCreateClient }: { onCreateClient: () => void }) {
  return (
    <EmptyState
      illustration="users"
      title="No clients found"
      description="Start building your client base by adding your first client."
      action={{
        label: "Add New Client",
        onClick: onCreateClient
      }}
    />
  )
}

export function EmptySearchState({ onClearSearch }: { onClearSearch: () => void }) {
  return (
    <EmptyState
      illustration="search"
      title="No results found"
      description="Try adjusting your search terms or filters to find what you're looking for."
      action={{
        label: "Clear Search",
        onClick: onClearSearch,
        variant: "outline"
      }}
    />
  )
}

export function EmptyNotificationsState() {
  return (
    <EmptyState
      illustration="inbox"
      title="All caught up!"
      description="You don't have any new notifications at the moment."
      className="py-8"
    />
  )
}

export function ErrorState({ 
  onRetry, 
  error = "Something went wrong" 
}: { 
  onRetry?: () => void
  error?: string 
}) {
  return (
    <EmptyState
      illustration="error"
      title="Oops! Something went wrong"
      description={error}
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
        variant: "outline"
      } : undefined}
    />
  )
}

export default EmptyState