import React from 'react'
import { AddressAutocomplete } from './AddressAutocomplete'
import { Input } from './Input'
import { Switch } from './Switch'
import { MapPin } from 'lucide-react'

interface AddressData {
  streetAddress1: string
  streetAddress2: string
  city: string
  state: string
  zipCode: string
}

interface StandardizedAddressInputProps {
  address: AddressData
  onChange: (address: AddressData) => void
  label?: string
  required?: boolean
  className?: string
  allowAutocomplete?: boolean
  showSameAsToggle?: boolean
  sameAsToggleLabel?: string
  isSameAs?: boolean
  onSameAsToggle?: (isSame: boolean) => void
}

export function StandardizedAddressInput({
  address,
  onChange,
  label = 'Address',
  required = false,
  className = '',
  allowAutocomplete = true,
  showSameAsToggle = false,
  sameAsToggleLabel = 'Same as above address',
  isSameAs = false,
  onSameAsToggle
}: StandardizedAddressInputProps) {
  const updateField = (field: keyof AddressData, value: string) => {
    onChange({
      ...address,
      [field]: value
    })
  }

  const handleAddressAutocomplete = (
    fullAddress: string,
    details?: google.maps.places.PlaceResult,
    parsedAddress?: any
  ) => {
    if (parsedAddress) {
      onChange({
        streetAddress1: parsedAddress.addressLine1 || fullAddress,
        streetAddress2: address.streetAddress2, // Preserve existing
        city: parsedAddress.city || '',
        state: parsedAddress.state || '',
        zipCode: parsedAddress.zipCode || ''
      })
    } else {
      // Manual input - only update street address 1
      updateField('streetAddress1', fullAddress)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <MapPin className="h-4 w-4 inline mr-1" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {showSameAsToggle && onSameAsToggle && (
          <div className="flex items-center gap-2">
            <Switch
              checked={isSameAs}
              onChange={onSameAsToggle}
            />
            <span className="text-sm text-gray-600">{sameAsToggleLabel}</span>
          </div>
        )}
      </div>

      {!isSameAs && (
        <div className="grid gap-4">
          {/* Street Address #1 with Autocomplete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address #1
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {allowAutocomplete ? (
              <AddressAutocomplete
                value={address.streetAddress1}
                onChange={handleAddressAutocomplete}
                placeholder="Start typing address..."
                className="w-full"
                required={required}
              />
            ) : (
              <Input
                type="text"
                value={address.streetAddress1}
                onChange={(e) => updateField('streetAddress1', e.target.value)}
                placeholder="Street address"
                className="w-full"
                required={required}
              />
            )}
          </div>

          {/* Street Address #2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address #2
            </label>
            <Input
              type="text"
              value={address.streetAddress2}
              onChange={(e) => updateField('streetAddress2', e.target.value)}
              placeholder="Apartment, Suite, Unit, etc."
              className="w-full"
            />
          </div>

          {/* City, State, Zip Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Input
                type="text"
                value={address.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="City"
                className="w-full"
                required={required}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Input
                type="text"
                value={address.state}
                onChange={(e) => updateField('state', e.target.value)}
                placeholder="State"
                className="w-full"
                maxLength={2}
                required={required}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Input
                type="text"
                value={address.zipCode}
                onChange={(e) => updateField('zipCode', e.target.value)}
                placeholder="Zip Code"
                className="w-full"
                maxLength={10}
                required={required}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StandardizedAddressInput