import React, { useEffect, useRef, useState } from 'react'
import { Input } from './Input'
import { Switch } from './switch'
import { MapPin } from 'lucide-react'

// Google Maps API integration
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

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

  const autocompleteRef = useRef<HTMLInputElement>(null)
  const [autocompleteService, setAutocompleteService] = useState<any>(null)
  const [placesService, setPlacesService] = useState<any>(null)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        setIsGoogleMapsLoaded(true)
      }
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isGoogleMapsLoaded && autocompleteRef.current && allowAutocomplete) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address']
        }
      )

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place.address_components) {
          parseGooglePlace(place)
        }
      })
    }
  }, [isGoogleMapsLoaded, allowAutocomplete])

  const parseGooglePlace = (place: any) => {
    const components = place.address_components
    const parsed = {
      streetAddress1: '',
      city: '',
      state: '',
      zipCode: ''
    }

    components.forEach((component: any) => {
      const types = component.types
      if (types.includes('street_number') || types.includes('route')) {
        parsed.streetAddress1 += component.long_name + ' '
      } else if (types.includes('locality')) {
        parsed.city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        parsed.state = component.short_name
      } else if (types.includes('postal_code')) {
        parsed.zipCode = component.long_name
      }
    })

    onChange({
      streetAddress1: parsed.streetAddress1.trim(),
      streetAddress2: address.streetAddress2, // Preserve existing
      city: parsed.city,
      state: parsed.state,
      zipCode: parsed.zipCode
    })
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
              onCheckedChange={onSameAsToggle}
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
            <Input
              ref={allowAutocomplete ? autocompleteRef : undefined}
              type="text"
              value={address.streetAddress1}
              onChange={(e) => updateField('streetAddress1', e.target.value)}
              placeholder={allowAutocomplete ? "Start typing address..." : "Street address"}
              className="w-full"
              required={required}
            />
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