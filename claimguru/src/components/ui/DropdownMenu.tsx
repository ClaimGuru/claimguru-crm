import React, { useState } from 'react'

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: string
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            setIsOpen
          })
        }
        return child
      })}
    </div>
  )
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps & { isOpen?: boolean; setIsOpen?: (open: boolean) => void }> = ({ 
  children, 
  isOpen, 
  setIsOpen 
}) => {
  return (
    <div onClick={() => setIsOpen?.(!isOpen)}>
      {children}
    </div>
  )
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps & { isOpen?: boolean }> = ({ 
  children, 
  className = '', 
  align = 'right',
  isOpen 
}) => {
  if (!isOpen) return null

  const alignClass = align === 'left' ? 'left-0' : 'right-0'

  return (
    <div className={`absolute ${alignClass} mt-2 w-48 bg-white rounded-md shadow-lg z-50 border ${className}`}>
      <div className="py-1">
        {children}
      </div>
    </div>
  )
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  onClick, 
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${className}`}
    >
      {children}
    </button>
  )
}
