import React from 'react'

interface MultiTextAreaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
  rows?: number
  maxLength?: number
  label?: string
}

export function MultiTextArea({
  value,
  onChange,
  placeholder = '',
  required = false,
  className = '',
  rows = 4,
  maxLength,
  label
}: MultiTextAreaProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
      />
      {maxLength && (
        <div className="text-right text-xs text-gray-500 mt-1">
          {value.length}/{maxLength} characters
        </div>
      )}
    </div>
  )
}

export default MultiTextArea
