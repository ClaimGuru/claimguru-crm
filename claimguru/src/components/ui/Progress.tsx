/**
 * PROGRESS COMPONENT
 * 
 * A simple progress bar component for showing completion status.
 */

import React from 'react'

export interface ProgressProps {
  value: number // 0-100
  className?: string
  showLabel?: boolean
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  className = '', 
  showLabel = false 
}) => {
  const clampedValue = Math.max(0, Math.min(100, value))
  
  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div 
        className="bg-blue-600 h-full transition-all duration-300 ease-out"
        style={{ width: `${clampedValue}%` }}
      >
        {showLabel && (
          <div className="flex items-center justify-center h-full text-xs text-white font-medium">
            {Math.round(clampedValue)}%
          </div>
        )}
      </div>
    </div>
  )
}