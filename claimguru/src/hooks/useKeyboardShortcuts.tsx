import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  action: () => void
  global?: boolean // Can be triggered anywhere
  context?: string // Only active in specific contexts
}

const shortcuts: KeyboardShortcut[] = [
  {
    key: 'k',
    ctrlKey: true,
    description: 'Open search',
    action: () => {
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
      searchInput?.focus()
    },
    global: true
  },
  {
    key: 'n',
    ctrlKey: true,
    description: 'New claim',
    action: () => {
      window.location.href = '/claims/new'
    },
    global: true
  },
  {
    key: '/',
    description: 'Focus search',
    action: () => {
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
      searchInput?.focus()
    },
    global: true
  },
  {
    key: 'Escape',
    description: 'Close modal/dropdown',
    action: () => {
      // Close any open modals or dropdowns
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escapeEvent)
    },
    global: true
  }
]

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      // Allow escape key in inputs
      if (event.key !== 'Escape') {
        return
      }
    }
    
    const shortcut = shortcuts.find(s => {
      return (
        s.key.toLowerCase() === event.key.toLowerCase() &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.shiftKey === event.shiftKey &&
        !!s.altKey === event.altKey &&
        !!s.metaKey === event.metaKey
      )
    })
    
    if (shortcut) {
      event.preventDefault()
      event.stopPropagation()
      shortcut.action()
    }
  }, [navigate, addNotification])
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
  
  return {
    shortcuts: shortcuts.map(s => ({
      key: s.key,
      modifiers: [
        s.ctrlKey && 'Ctrl',
        s.shiftKey && 'Shift',
        s.altKey && 'Alt',
        s.metaKey && 'Cmd'
      ].filter(Boolean).join(' + '),
      description: s.description
    }))
  }
}

// Keyboard shortcuts help modal component
import React, { useState } from 'react'
import { Keyboard, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/Dialog'

interface ShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  const { shortcuts: shortcutList } = useKeyboardShortcuts()
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {shortcutList.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.modifiers && (
                  <>
                    <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">
                      {shortcut.modifiers}
                    </kbd>
                    <span className="text-gray-400">+</span>
                  </>
                )}
                <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">
                  {shortcut.key === ' ' ? 'Space' : shortcut.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook to show shortcuts help
export function useShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show shortcuts help with Ctrl+?
      if (event.ctrlKey && event.key === '?') {
        event.preventDefault()
        setIsOpen(true)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return {
    isShortcutsHelpOpen: isOpen,
    openShortcutsHelp: () => setIsOpen(true),
    closeShortcutsHelp: () => setIsOpen(false)
  }
}

export default useKeyboardShortcuts