import React, { useState } from 'react'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { Plus, X, Star } from 'lucide-react'
import { formatPhoneNumber, formatPhoneExtension, getPhoneInputProps, getPhoneExtensionInputProps } from '../../utils/phoneUtils'

interface PhoneNumber {
  id: string
  type: string
  number: string
  extension: string
  isPrimary: boolean
}

interface StandardizedPhoneInputProps {
  phoneNumbers: PhoneNumber[]
  onChange: (phoneNumbers: PhoneNumber[]) => void
  className?: string
  label?: string
  required?: boolean
  allowMultiple?: boolean
}

const phoneTypes = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'office', label: 'Office' },
  { value: 'fax', label: 'Fax' },
  { value: 'other', label: 'Other' }
]

export function StandardizedPhoneInput({
  phoneNumbers,
  onChange,
  className = '',
  label = 'Phone Numbers',
  required = false,
  allowMultiple = true
}: StandardizedPhoneInputProps) {
  const updatePhoneNumber = (id: string, field: keyof PhoneNumber, value: string | boolean) => {
    const updatedNumbers = phoneNumbers.map(phone => {
      if (phone.id === id) {
        let processedValue = value
        
        // Apply formatting for phone number
        if (field === 'number' && typeof value === 'string') {
          processedValue = formatPhoneNumber(value)
        }
        
        // Apply formatting for extension
        if (field === 'extension' && typeof value === 'string') {
          processedValue = formatPhoneExtension(value)
        }
        
        return { ...phone, [field]: processedValue }
      }
      return phone
    })
    
    onChange(updatedNumbers)
  }

  const addPhoneNumber = () => {
    const newPhone: PhoneNumber = {
      id: `phone_${Date.now()}`,
      type: 'mobile',
      number: '',
      extension: '',
      isPrimary: phoneNumbers.length === 0
    }
    onChange([...phoneNumbers, newPhone])
  }

  const removePhoneNumber = (id: string) => {
    if (phoneNumbers.length <= 1) return // Keep at least one
    
    const phoneToRemove = phoneNumbers.find(p => p.id === id)
    const updatedNumbers = phoneNumbers.filter(p => p.id !== id)
    
    // If removing primary, make first remaining primary
    if (phoneToRemove?.isPrimary && updatedNumbers.length > 0) {
      updatedNumbers[0].isPrimary = true
    }
    
    onChange(updatedNumbers)
  }

  const setPrimary = (id: string) => {
    const updatedNumbers = phoneNumbers.map(phone => ({
      ...phone,
      isPrimary: phone.id === id
    }))
    onChange(updatedNumbers)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {allowMultiple && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPhoneNumber}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Phone
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {phoneNumbers.map((phone, index) => (
          <div key={phone.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            {/* Primary indicator */}
            <button
              type="button"
              onClick={() => setPrimary(phone.id)}
              className={`p-1 rounded-full ${
                phone.isPrimary
                  ? 'text-yellow-500 bg-yellow-50'
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
              title={phone.isPrimary ? 'Primary phone' : 'Set as primary'}
            >
              <Star className={`h-4 w-4 ${phone.isPrimary ? 'fill-current' : ''}`} />
            </button>

            {/* Phone type */}
            <div className="w-32">
              <Select
                value={phone.type}
                onChange={(value) => updatePhoneNumber(phone.id, 'type', value)}
              >
                {phoneTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Phone number */}
            <div className="flex-1">
              <Input
                {...getPhoneInputProps()}
                value={phone.number}
                onChange={(e) => updatePhoneNumber(phone.id, 'number', e.target.value)}
                className="w-full"
                required={required}
              />
            </div>

            {/* Extension */}
            <div className="w-24">
              <Input
                {...getPhoneExtensionInputProps()}
                value={phone.extension}
                onChange={(e) => updatePhoneNumber(phone.id, 'extension', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Remove button */}
            {phoneNumbers.length > 1 && allowMultiple && (
              <button
                type="button"
                onClick={() => removePhoneNumber(phone.id)}
                className="p-1 text-red-500 hover:text-red-700"
                title="Remove phone number"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StandardizedPhoneInput