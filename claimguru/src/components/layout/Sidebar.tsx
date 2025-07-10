import React, { useState } from 'react'
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
  X,
  ChevronDown,
  ChevronRight,
  FileSearch,
  CreditCard,
  Receipt,
  Banknote,
  User,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useIsMobile } from '../../hooks/use-mobile'

// Main navigation items
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Claims', href: '/claims', icon: FileText },
  { name: 'Tasks', href: '/tasks', icon: ClipboardList },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
]

// Contacts submenu
const contactsSubmenu = [
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Insurers', href: '/insurers', icon: Shield },
  { name: 'Vendors', href: '/vendors', icon: UserCheck },
  { name: 'Properties', href: '/properties', icon: Building },
]

// Financials submenu  
const financialsSubmenu = [
  { name: 'Settlements', href: '/settlements', icon: Handshake },
  { name: 'Invoicing', href: '/invoicing', icon: Receipt },
  { name: 'Payables', href: '/payables', icon: CreditCard },
  { name: 'Receivables', href: '/receivables', icon: Banknote },
]

// Remaining main navigation
const mainNavigation = [
  { name: 'Communications', href: '/communications', icon: MessageSquare },
  { name: 'Documents', href: '/documents', icon: Upload },
  { name: 'AI Insights', href: '/ai-insights', icon: Brain },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

// Profile menu items (moved from main nav)
const profileMenuItems = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
  { name: 'Integrations', href: '/integrations', icon: Zap },
]

interface SidebarProps {
  isCollapsed: boolean
  onClose?: () => void
}

export function Sidebar({ isCollapsed, onClose }: SidebarProps) {
  const { userProfile, signOut } = useAuth()
  const isMobile = useIsMobile()
  
  // State for expandable submenus
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    contacts: false,
    financials: false,
    profile: false
  })
  
  // Check if user is subscriber (for admin panel visibility)
  const isSubscriber = userProfile?.role === 'subscriber' || userProfile?.role === 'system_admin'
  
  const toggleSubmenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }))
  }
  
  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

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
          {/* Main Navigation Items */}
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

          {/* Contacts Section with Submenu */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSubmenu('contacts')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 group relative ${
                isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
              }`}
              title={isCollapsed && !isMobile ? 'Contacts' : undefined}
            >
              <div className="flex items-center">
                <Users className={`h-5 w-5 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
                {(!isCollapsed || isMobile) && (
                  <span className="truncate">Contacts</span>
                )}
              </div>
              {(!isCollapsed || isMobile) && (
                expandedMenus.contacts ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Contacts
                </div>
              )}
            </button>
            
            {/* Contacts Submenu */}
            {(expandedMenus.contacts && (!isCollapsed || isMobile)) && (
              <div className="ml-6 space-y-1">
                {contactsSubmenu.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={isMobile ? onClose : undefined}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  )
                })}
              </div>
            )}
          </div>

          {/* Communications */}
          <NavLink
            to="/communications"
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${isCollapsed && !isMobile ? 'justify-center' : ''}`
            }
            title={isCollapsed && !isMobile ? 'Communications' : undefined}
          >
            <MessageSquare className={`h-5 w-5 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
            {(!isCollapsed || isMobile) && (
              <span className="truncate">Communications</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && !isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Communications
              </div>
            )}
          </NavLink>

          {/* Documents */}
          <NavLink
            to="/documents"
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${isCollapsed && !isMobile ? 'justify-center' : ''}`
            }
            title={isCollapsed && !isMobile ? 'Documents' : undefined}
          >
            <Upload className={`h-5 w-5 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
            {(!isCollapsed || isMobile) && (
              <span className="truncate">Documents</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && !isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Documents
              </div>
            )}
          </NavLink>

          {/* Financials Section with Submenu */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSubmenu('financials')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 group relative ${
                isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
              }`}
              title={isCollapsed && !isMobile ? 'Financials' : undefined}
            >
              <div className="flex items-center">
                <DollarSign className={`h-5 w-5 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
                {(!isCollapsed || isMobile) && (
                  <span className="truncate">Financials</span>
                )}
              </div>
              {(!isCollapsed || isMobile) && (
                expandedMenus.financials ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Financials
                </div>
              )}
            </button>
            
            {/* Financials Submenu */}
            {(expandedMenus.financials && (!isCollapsed || isMobile)) && (
              <div className="ml-6 space-y-1">
                {financialsSubmenu.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={isMobile ? onClose : undefined}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  )
                })}
              </div>
            )}
          </div>

          {/* AI Insights */}
          <NavLink
            to="/ai-insights"
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${isCollapsed && !isMobile ? 'justify-center' : ''}`
            }
            title={isCollapsed && !isMobile ? 'AI Insights' : undefined}
          >
            <Brain className={`h-5 w-5 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
            {(!isCollapsed || isMobile) && (
              <span className="truncate">AI Insights</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && !isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                AI Insights
              </div>
            )}
          </NavLink>

          {/* Analytics */}
          <NavLink
            to="/analytics"
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${isCollapsed && !isMobile ? 'justify-center' : ''}`
            }
            title={isCollapsed && !isMobile ? 'Analytics' : undefined}
          >
            <BarChart3 className={`h-5 w-5 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
            {(!isCollapsed || isMobile) && (
              <span className="truncate">Analytics</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && !isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Analytics
              </div>
            )}
          </NavLink>

          {/* Admin Panel (subscriber only) */}
          {isSubscriber && (
            <NavLink
              to="/admin"
              onClick={isMobile ? onClose : undefined}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${isCollapsed && !isMobile ? 'justify-center' : ''}`
              }
              title={isCollapsed && !isMobile ? 'Admin Panel' : undefined}
            >
              <ShieldCheck className={`h-5 w-5 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
              {(!isCollapsed || isMobile) && (
                <span className="truncate">Admin Panel</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Admin Panel
                </div>
              )}
            </NavLink>
          )}
        </nav>

        {/* Notifications */}
        <div className={`border-t border-gray-200 py-4 ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}`}>
          <NavLink
            to="/notifications"
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${isCollapsed && !isMobile ? 'justify-center' : ''}`
            }
            title={isCollapsed && !isMobile ? 'Notifications' : undefined}
          >
            <div className="relative">
              <Bell className={`h-5 w-5 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </div>
            {(!isCollapsed || isMobile) && (
              <span className="truncate">Notifications</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && !isMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Notifications
              </div>
            )}
          </NavLink>
        </div>

        {/* Profile Menu */}
        <div className={`border-t border-gray-200 ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}`}>
          {/* Profile Menu Toggle */}
          {(!isCollapsed || isMobile) && (
            <div className="py-3">
              <button
                onClick={() => toggleSubmenu('profile')}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">
                      {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userProfile?.role}
                    </p>
                  </div>
                </div>
                {expandedMenus.profile ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {/* Profile Submenu */}
              {expandedMenus.profile && (
                <div className="ml-6 mt-2 space-y-1">
                  {profileMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={isMobile ? onClose : undefined}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                          }`
                        }
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    )
                  })}
                  
                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    <span className="truncate">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Collapsed User Avatar */}
          {isCollapsed && !isMobile && (
            <div className="py-4 flex justify-center">
              <button
                onClick={() => toggleSubmenu('profile')}
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group relative hover:bg-blue-700 transition-colors"
              >
                <span className="text-sm font-medium text-white">
                  {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
                </span>
                
                {/* User tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {userProfile?.first_name} {userProfile?.last_name}
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}