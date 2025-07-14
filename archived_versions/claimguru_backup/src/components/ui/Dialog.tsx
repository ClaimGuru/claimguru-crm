import React from 'react'

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
}

interface DialogTitleProps {
  children: React.ReactNode
}

interface DialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export const Dialog: React.FC<DialogProps> = ({ open = false, onOpenChange, children }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {children}
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="mb-4">{children}</div>
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return <h2 className="text-lg font-semibold">{children}</h2>
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children }) => {
  return <div>{children}</div>
}
