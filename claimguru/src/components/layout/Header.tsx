import React from 'react'
import { Search, Bell, Settings, LogOut, User, Menu } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { userProfile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side with menu toggle */}
      <div className="flex items-center space-x-4">
        {/* Menu Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search claims, clients, documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Quick Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/direct-feature-test')}
        >
          ⚙️ Test Features
        </Button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
              </span>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {userProfile?.first_name} {userProfile?.last_name}
              </p>
              <p className="text-xs text-gray-500">
                {userProfile?.role}
              </p>
            </div>
          </div>

          {/* Dropdown menu (simplified for now) */}
          <div className="flex items-center space-x-1">
            <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              <Settings className="h-4 w-4" />
            </button>
            <button 
              onClick={handleSignOut}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}