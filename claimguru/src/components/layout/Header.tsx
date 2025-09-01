import React, { useState } from 'react'
import { Search, Bell, Settings, LogOut, User, Menu, Keyboard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications, NotificationBell } from '../../contexts/NotificationContext'
import { Button } from '../ui/Button'
import { useNavigate } from 'react-router-dom'
import AdvancedSearch from '../ui/AdvancedSearch'
import QuickActions from '../ui/QuickActions'
import Tooltip from '../ui/Tooltip'
import { TouchableScale } from '../ui/Animations'
import { useShortcutsHelp } from '../../hooks/useKeyboardShortcuts'
import { globalSearchService, type SearchFilters } from '../../services/globalSearchService'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { userProfile, signOut } = useAuth()
  const { addNotification } = useNotifications()
  const { openShortcutsHelp } = useShortcutsHelp()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleGlobalSearch = async (query: string, filters: any[]) => {
    if (!query.trim()) {
      return
    }

    try {
      // Convert filters array to SearchFilters object
      const searchFilters: SearchFilters = {}
      filters.forEach(filter => {
        if (filter.value) {
          searchFilters[filter.key] = filter.value
        }
      })

      addNotification({
        type: 'info',
        title: 'Search initiated',
        message: `Searching for "${query}"...`,
        duration: 3000
      })

      // Perform the actual search
      const results = await globalSearchService.search(query, searchFilters, { limit: 20 })
      
      if (results.length === 0) {
        addNotification({
          type: 'warning',
          title: 'No results found',
          message: `No results found for "${query}". Try different search terms.`,
          duration: 5000
        })
        return
      }

      // Navigate to search results or handle results display
      // For now, we'll show a success notification with result count
      addNotification({
        type: 'success',
        title: 'Search completed',
        message: `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`,
        duration: 4000
      })

      // You could implement a search results page or modal here
      console.log('Search results:', results)
      
      // TODO: Navigate to search results page or show results in a modal
      // navigate(`/search?q=${encodeURIComponent(query)}`)
      
    } catch (error) {
      console.error('Search error:', error)
      addNotification({
        type: 'error',
        title: 'Search failed',
        message: 'An error occurred while searching. Please try again.',
        duration: 5000
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 relative z-30">
      {/* Left side with menu toggle */}
      <div className="flex items-center space-x-4">
        {/* Menu Toggle Button */}
        <Tooltip content="Toggle sidebar (Ctrl+B)">
          <TouchableScale>
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          </TouchableScale>
        </Tooltip>

        {/* Advanced Search */}
        <div className="flex-1 max-w-2xl">
          <AdvancedSearch
            placeholder="Search claims, clients, documents... (Ctrl+K)"
            onSearch={handleGlobalSearch}
            filters={[
              {
                key: 'type',
                label: 'Type',
                type: 'select',
                options: [
                  { label: 'Claims', value: 'claims' },
                  { label: 'Clients', value: 'clients' },
                  { label: 'Documents', value: 'documents' },
                  { label: 'Vendors', value: 'vendors' }
                ]
              },
              {
                key: 'status',
                label: 'Status',
                type: 'select',
                options: [
                  { label: 'Active', value: 'active' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'Archived', value: 'archived' }
                ]
              },
              {
                key: 'date_from',
                label: 'From Date',
                type: 'date'
              },
              {
                key: 'date_to',
                label: 'To Date',
                type: 'date'
              }
            ]}
            sortOptions={[
              { label: 'Date Created', value: 'created_at' },
              { label: 'Last Modified', value: 'updated_at' },
              { label: 'Name', value: 'name' },
              { label: 'Status', value: 'status' }
            ]}
            enableSavedSearches={true}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        {/* Quick Actions */}
        <QuickActions />

        {/* Notifications */}
        <Tooltip content="Notifications">
          <NotificationBell 
            onClick={() => navigate('/notifications')}
            className="hover:scale-105 transition-transform"
          />
        </Tooltip>

        {/* Keyboard shortcuts help */}
        <Tooltip content="Keyboard shortcuts (Ctrl+?)">
          <TouchableScale>
            <button 
              onClick={openShortcutsHelp}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Keyboard className="h-4 w-4" />
            </button>
          </TouchableScale>
        </Tooltip>

        {/* User Menu */}
        <div className="relative flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <span className="text-sm font-medium text-white">
                {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
              </span>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {userProfile?.first_name} {userProfile?.last_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userProfile?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center space-x-1">
            <Tooltip content="Settings">
              <TouchableScale>
                <button 
                  onClick={() => navigate('/settings')}
                  className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </TouchableScale>
            </Tooltip>
            
            <Tooltip content="Sign out">
              <TouchableScale>
                <button 
                  onClick={handleSignOut}
                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TouchableScale>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  )
}