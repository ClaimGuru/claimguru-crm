import React, { useState } from 'react'

interface PopoverProps {
  children: React.ReactNode
}

interface PopoverTriggerProps {
  children: React.ReactNode
  onClick?: () => void
}

interface PopoverContentProps {
  children: React.ReactNode
  className?: string
}

export const Popover: React.FC<PopoverProps> = ({ children }) => {
  return <div className="relative">{children}</div>
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children, onClick }) => {
  return <div onClick={onClick} className="cursor-pointer">{children}</div>
}

export const PopoverContent: React.FC<PopoverContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg p-4 ${className}`}>
      {children}
    </div>
  )
}
