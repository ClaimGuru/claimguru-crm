import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  disabled?: boolean
  className?: string
  maxWidth?: string
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 500,
  disabled = false,
  className = '',
  maxWidth = '200px'
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return
    
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const scrollX = window.pageXOffset
    const scrollY = window.pageYOffset
    
    let x = 0
    let y = 0
    
    switch (position) {
      case 'top':
        x = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2)
        y = triggerRect.top + scrollY - tooltipRect.height - 8
        break
      case 'bottom':
        x = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2)
        y = triggerRect.bottom + scrollY + 8
        break
      case 'left':
        x = triggerRect.left + scrollX - tooltipRect.width - 8
        y = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2)
        break
      case 'right':
        x = triggerRect.right + scrollX + 8
        y = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2)
        break
    }
    
    // Keep tooltip within viewport
    const margin = 8
    if (x < margin) x = margin
    if (x + tooltipRect.width > window.innerWidth - margin) {
      x = window.innerWidth - tooltipRect.width - margin
    }
    if (y < margin) y = margin
    if (y + tooltipRect.height > window.innerHeight - margin) {
      y = window.innerHeight - tooltipRect.height - margin
    }
    
    setTooltipPosition({ x, y })
  }
  
  const handleMouseEnter = () => {
    if (disabled) return
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      // Calculate position on next frame to ensure tooltip is rendered
      requestAnimationFrame(calculatePosition)
    }, delay)
  }
  
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }
  
  const getArrowClasses = () => {
    const base = 'absolute w-2 h-2 bg-gray-900 transform rotate-45'
    switch (position) {
      case 'top':
        return `${base} -bottom-1 left-1/2 -translate-x-1/2`
      case 'bottom':
        return `${base} -top-1 left-1/2 -translate-x-1/2`
      case 'left':
        return `${base} -right-1 top-1/2 -translate-y-1/2`
      case 'right':
        return `${base} -left-1 top-1/2 -translate-y-1/2`
      default:
        return base
    }
  }
  
  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className={`fixed z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg transition-opacity duration-200 pointer-events-none ${className}`}
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            maxWidth
          }}
        >
          {content}
          <div className={getArrowClasses()} />
        </div>,
        document.body
      )}
    </>
  )
}

export default Tooltip