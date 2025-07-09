import React, { createContext, useContext, ReactNode } from 'react'
import { useToast } from '../hooks/useToast'

interface ToastContextType {
  success: (title: string, message?: string, duration?: number) => string
  error: (title: string, message?: string, duration?: number) => string
  warning: (title: string, message?: string, duration?: number) => string
  info: (title: string, message?: string, duration?: number) => string
}

const ToastContext = createContext<ToastContextType | null>(null)

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { success, error, warning, info } = useToast()

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
    </ToastContext.Provider>
  )
}