import React, { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X, User, Building2, Mail, Phone, MapPin } from 'lucide-react'
import { Input } from './Input'
import { useClients, ClientSearchOption } from '../../hooks/useClients'
import type { Client } from '../../lib/supabase'

interface ClientSearchDropdownProps {
  onClientSelect: (client: Client) => void
  onClear: () => void
  placeholder?: string
  searchCriteria?: string[]
  className?: string
}

export function ClientSearchDropdown({ 
  onClientSelect, 
  onClear, 
  placeholder = "Search by name, email, phone, address...",
  searchCriteria = ['name', 'email', 'phone', 'address'],
  className = ""
}: ClientSearchDropdownProps) {
  const { debouncedSearchClients } = useClients()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<ClientSearchOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>(searchCriteria)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search criteria options
  const criteriaOptions = [
    { value: 'name', label: 'Name', icon: User },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Phone', icon: Phone },
    { value: 'address', label: 'Address', icon: MapPin }
  ]

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.length >= 2) {
        setIsLoading(true)
        try {
          const results = await debouncedSearchClients(searchTerm, selectedCriteria)
          setSearchResults(results)
          setIsOpen(true)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSearchResults([])
        setIsOpen(false)
      }
    }

    performSearch()
  }, [searchTerm, selectedCriteria, debouncedSearchClients])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClientSelect = (option: ClientSearchOption) => {
    setSelectedClient(option.client)
    setSearchTerm('')
    setIsOpen(false)
    onClientSelect(option.client)
  }

  const handleClear = () => {
    setSelectedClient(null)
    setSearchTerm('')
    setSearchResults([])
    setIsOpen(false)
    onClear()
    inputRef.current?.focus()
  }

  const toggleCriteria = (criteria: string) => {
    setSelectedCriteria(prev => {
      const newCriteria = prev.includes(criteria)
        ? prev.filter(c => c !== criteria)
        : [...prev, criteria]
      
      // Ensure at least one criteria is always selected
      return newCriteria.length > 0 ? newCriteria : [criteria]
    })
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Selected Client Display */}
      {selectedClient && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {selectedClient.client_type === 'commercial' ? (
                  <Building2 className="h-4 w-4 text-green-600" />
                ) : (
                  <User className="h-4 w-4 text-green-600" />
                )}
                <span className="font-medium text-green-800">
                  Selected Client
                </span>
              </div>
              <div className="space-y-1 text-sm text-green-700">
                <p className="font-medium">
                  {selectedClient.client_type === 'commercial' && selectedClient.business_name 
                    ? selectedClient.business_name
                    : `${selectedClient.first_name || ''} ${selectedClient.last_name || ''}`.trim()
                  }
                </p>
                {selectedClient.primary_email && (
                  <p className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedClient.primary_email}
                  </p>
                )}
                {selectedClient.primary_phone && (
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedClient.primary_phone}
                  </p>
                )}
                {selectedClient.address_line_1 && (
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {`${selectedClient.address_line_1} ${selectedClient.city || ''}, ${selectedClient.state || ''} ${selectedClient.zip_code || ''}`.trim()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
              title="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search Interface - Only show if no client is selected */}
      {!selectedClient && (
        <>
          {/* Search Criteria Selector */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search in:
            </label>
            <div className="flex flex-wrap gap-2">
              {criteriaOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleCriteria(value)}
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedCriteria.includes(value)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`h-4 w-4 ${isLoading ? 'animate-pulse text-blue-500' : 'text-gray-400'}`} />
            </div>
            <Input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-10"
              autoComplete="off"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
                  <p>Searching clients...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm.length < 2 ? (
                    <p>Type at least 2 characters to search</p>
                  ) : (
                    <div>
                      <p>No clients found matching "{searchTerm}"</p>
                      <p className="text-xs mt-1">Try adjusting your search criteria or search term</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((option) => {
                    const client = option.client
                    const displayName = client.client_type === 'commercial' && client.business_name 
                      ? client.business_name
                      : `${client.first_name || ''} ${client.last_name || ''}`.trim()
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleClientSelect(option)}
                        className="w-full p-4 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {client.client_type === 'commercial' ? (
                              <Building2 className="h-4 w-4 text-blue-600" />
                            ) : (
                              <User className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {displayName}
                            </p>
                            <div className="space-y-1 text-xs text-gray-500">
                              {client.primary_email && (
                                <p className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">{client.primary_email}</span>
                                </p>
                              )}
                              {client.primary_phone && (
                                <p className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{client.primary_phone}</span>
                                </p>
                              )}
                              {client.address_line_1 && (
                                <p className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">
                                    {`${client.address_line_1} ${client.city || ''}, ${client.state || ''} ${client.zip_code || ''}`.trim()}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ClientSearchDropdown