import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<any>
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const location = useLocation()
  
  // Auto-generate breadcrumbs if none provided
  const autoBreadcrumbs = React.useMemo(() => {
    if (items) return items
    
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard', icon: Home }
    ]
    
    let currentPath = ''
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`
      if (segment !== 'dashboard') {
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
          href: currentPath
        })
      }
    })
    
    return breadcrumbs
  }, [items, location.pathname])
  
  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      {autoBreadcrumbs.map((item, index) => {
        const isLast = index === autoBreadcrumbs.length - 1
        const Icon = item.icon
        
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="flex items-center hover:text-gray-900 transition-colors"
              >
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {item.label}
              </Link>
            ) : (
              <span className={`flex items-center ${isLast ? 'text-gray-900 font-medium' : ''}`}>
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {item.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb