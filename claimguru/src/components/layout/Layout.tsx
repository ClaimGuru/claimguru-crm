import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import Breadcrumb from '../ui/Breadcrumb'
import QuickActions from '../ui/QuickActions'
import { useIsMobile } from '../../hooks/use-mobile'
import { FadeIn } from '../ui/Animations'

export function Layout() {
  const isMobile = useIsMobile()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarCollapsed(true)
    }
  }, [isMobile])

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev)
  }

  const closeSidebar = () => {
    setIsSidebarCollapsed(true)
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className={`
        flex-shrink-0 transition-all duration-300 ease-in-out
        ${isMobile 
          ? 'w-0' // Mobile sidebar takes no space when collapsed
          : isSidebarCollapsed 
            ? 'w-16' 
            : 'w-64'
        }
      `}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onClose={closeSidebar}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <FadeIn>
            <Breadcrumb />
          </FadeIn>
        </div>
        
        <main className="flex-1 overflow-auto bg-gray-50 relative">
          <FadeIn>
            <Outlet />
          </FadeIn>
        </main>
      </div>
      
      {/* Mobile Quick Actions FAB */}
      {isMobile && (
        <QuickActions />
      )}
    </div>
  )
}