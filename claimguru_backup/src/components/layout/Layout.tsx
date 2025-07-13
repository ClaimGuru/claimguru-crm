import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useIsMobile } from '../../hooks/use-mobile'

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
    <div className="h-screen flex overflow-hidden">
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
        
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}