import React from 'react'

interface SelectProps {
  value?: string
  onChange?: (value: string) => void
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

export const Select: React.FC<SelectProps> = ({ value, onChange, onValueChange, children, className = '' }) => {
  const handleChange = (newValue: string) => {
    onChange?.(newValue)
    onValueChange?.(newValue)
  }
  
  return (
    <select 
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {children}
    </select>
  )
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return <option value={value}>{children}</option>
}

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  return <>{children}</>
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>
}
