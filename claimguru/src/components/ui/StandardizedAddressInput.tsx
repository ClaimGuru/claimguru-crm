import React, { useEffect, useRef, useState } from 'react'
import { Input } from './Input'
import { Switch } from './switch'
import { MapPin, Loader2 } from 'lucide-react'

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

// Google Maps API Key from environment variable
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

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
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
  const [isLoadingMaps, setIsLoadingMaps] = useState(false)
  const [autocompleteInstance, setAutocompleteInstance] = useState<any>(null)

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Check if already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true)
        return
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for it to load
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsGoogleMapsLoaded(true)
            clearInterval(checkLoaded)
          }
        }, 100)
        return
      }

      setIsLoadingMaps(true)
      try {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`
        script.async = true
        script.defer = true
        
        // Set up callback
        window.initGoogleMaps = () => {
          setIsGoogleMapsLoaded(true)
          setIsLoadingMaps(false)
        }
        
        script.onerror = () => {
          console.error('Failed to load Google Maps API')
          setIsLoadingMaps(false)
        }
        
        document.head.appendChild(script)
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        setIsLoadingMaps(false)
      }
    }

    if (allowAutocomplete) {
      loadGoogleMaps()
    }
  }, [allowAutocomplete])

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isGoogleMapsLoaded && autocompleteRef.current && allowAutocomplete && !autocompleteInstance) {
      try {
        const autocomplete = new window.google.maps.places.Autocomplete(
          autocompleteRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['address_components', 'formatted_address', 'geometry']
          }
        )

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (place.address_components) {
            parseGooglePlace(place)
          }
        })
        
        setAutocompleteInstance(autocomplete)
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error)
      }
    }
  }, [isGoogleMapsLoaded, allowAutocomplete, autocompleteInstance])

  const parseGooglePlace = (place: any) => {
    const components = place.address_components
    const parsed = {
      streetAddress1: '',
      streetAddress2: address.streetAddress2, // Preserve existing
      city: '',
      state: '',
      zipCode: ''
    }

    let streetNumber = ''
    let route = ''

    components.forEach((component: any) => {
      const types = component.types
      
      if (types.includes('street_number')) {
        streetNumber = component.long_name
      } else if (types.includes('route')) {
        route = component.long_name
      } else if (types.includes('locality')) {
        parsed.city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        parsed.state = component.short_name
      } else if (types.includes('postal_code')) {
        parsed.zipCode = component.long_name
      } else if (types.includes('sublocality_level_1') && !parsed.city) {
        // Fallback for city
        parsed.city = component.long_name
      }
    })

    // Combine street number and route
    if (streetNumber && route) {
      parsed.streetAddress1 = `${streetNumber} ${route}`
    } else if (route) {
      parsed.streetAddress1 = route
    } else if (place.formatted_address) {
      // Fallback to first part of formatted address
      const addressParts = place.formatted_address.split(',')
      parsed.streetAddress1 = addressParts[0] || ''
    }

    onChange(parsed)
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
            <div className="relative">
              <Input
                ref={allowAutocomplete ? autocompleteRef : undefined}
                type="text"
                value={address.streetAddress1}
                onChange={(e) => updateField('streetAddress1', e.target.value)}
                placeholder={allowAutocomplete ? "Start typing address for autocomplete..." : "Street address"}
                className="w-full"
                required={required}
              />
              {isLoadingMaps && allowAutocomplete && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {allowAutocomplete && !isGoogleMapsLoaded && !isLoadingMaps && (
              <p className="text-xs text-gray-500 mt-1">
                Google Places autocomplete is not available
              </p>
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

      {isSameAs && (
        <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
          Address will be copied from the primary address
        </div>
      )}
    </div>
  )
}

export default StandardizedAddressInput