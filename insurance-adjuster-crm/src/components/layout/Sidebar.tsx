import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Users, 
  FileText, 
  Upload, 
  BarChart3, 
  Settings, 
  CreditCard,
  UserCheck,
  Phone,
  Calendar,
  Shield
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  className?: string
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Claims', href: '/claims', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Documents', href: '/documents', icon: Upload },
  { name: 'Team', href: '/team', icon: UserCheck },
  { name: 'Communications', href: '/communications', icon: Phone },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Client Portal', href: '/portal', icon: Shield },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation()

  return (
    <div className={cn('flex flex-col w-64 bg-gray-900', className)}>
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <div className="text-white text-lg font-bold">
          Insurance CRM
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}