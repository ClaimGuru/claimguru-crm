import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  Users, 
  Building, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Bell,
  MessageSquare,
  Upload,
  Brain,
  Calendar,
  DollarSign,
  UserCheck,
  Handshake,
  Shield,
  Zap,
  ShieldCheck,
  X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useIsMobile } from '../../hooks/use-mobile'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Claims', href: '/claims', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Properties', href: '/properties', icon: Building },
  { name: 'Tasks', href: '/tasks', icon: ClipboardList },
  { name: 'Documents', href: '/documents', icon: Upload },
  { name: 'Communications', href: '/communications', icon: MessageSquare },
  { name: 'Vendors', href: '/vendors', icon: UserCheck },
  { name: 'Insurers', href: '/insurers', icon: Shield },
  { name: 'Settlements', href: '/settlements', icon: Handshake },
  { name: 'Financial', href: '/financial', icon: DollarSign },
  { name: 'AI Insights', href: '/ai-insights', icon: Brain },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Integrations', href: '/integrations', icon: Zap },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const bottomNavigation = [
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Admin Panel', href: '/admin', icon: ShieldCheck },
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
]

interface SidebarProps {
  isCollapsed: boolean
  onClose?: () => void
}

export function Sidebar({ isCollapsed, onClose }: SidebarProps) {
  const { userProfile } = useAuth()
  const isMobile = useIsMobile()

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
          ${isMobile 
            ? `fixed top-0 left-0 z-50 ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} w-64`
            : `relative ${isCollapsed ? 'w-16' : 'w-64'}`
          }
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-gray-200 px-4 ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed || isMobile ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ClaimGuru</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
          )}
          
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-6 space-y-1 overflow-y-auto ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}`}>
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={isMobile ? onClose : undefined}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } ${isCollapsed && !isMobile ? 'justify-center' : ''}`
                }
                title={isCollapsed && !isMobile ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
                {(!isCollapsed || isMobile) && (
                  <span className="truncate">{item.name}</span>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && !isMobile && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className={`py-4 border-t border-gray-200 space-y-1 ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}`}>
          {bottomNavigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={isMobile ? onClose : undefined}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } ${isCollapsed && !isMobile ? 'justify-center' : ''}`
                }
                title={isCollapsed && !isMobile ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
                {(!isCollapsed || isMobile) && (
                  <span className="truncate">{item.name}</span>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && !isMobile && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* User Info */}
        {(!isCollapsed || isMobile) && (
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-white">
                  {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile?.first_name} {userProfile?.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userProfile?.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed User Avatar */}
        {isCollapsed && !isMobile && (
          <div className="px-2 py-4 border-t border-gray-200 flex justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group relative">
              <span className="text-sm font-medium text-white">
                {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
              </span>
              
              {/* User tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {userProfile?.first_name} {userProfile?.last_name}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}