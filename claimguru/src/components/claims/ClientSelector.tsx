/**
 * ENHANCED CLIENT SELECTOR COMPONENT
 * 
 * A comprehensive search component for finding and selecting existing clients
 * with real-time database search across multiple fields.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Search, UserPlus, User, Loader2, X, MapPin, Phone, Mail } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Client } from '../../lib/supabase'

export interface ClientData {
  id: string
  first_name: string
  last_name: string
  business_name?: string
  primary_email: string
  primary_phone: string
  client_type: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  zip_code?: string
  organization_id: string
  is_policyholder: boolean
  country: string
  mailing_same_as_address: boolean
  created_at?: string
  updated_at?: string
}

export interface ClientSelectorProps {
  value?: string
  onSelect: (client: ClientData) => void
  placeholder?: string
  className?: string
  showCreateNew?: boolean
  onCreateNew?: () => void
  maxResults?: number
  minSearchLength?: number
}

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  value,
  onSelect,
  placeholder = "Search by name, address, phone, email...",
  className = '',
  showCreateNew = false,
  onCreateNew,
  maxResults = 15,
  minSearchLength = 2
}) => {
  const { userProfile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<ClientData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Search clients from database with debouncing
  const searchClients = useCallback(async (query: string) => {
    if (!userProfile?.organization_id || !query || query.length < minSearchLength) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    try {
      // Create a comprehensive search query using Supabase full-text search and ilike
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          first_name,
          last_name,
          business_name,
          primary_email,
          primary_phone,
          secondary_phone,
          mobile_phone,
          client_type,
          address_line_1,
          address_line_2,
          city,
          state,
          zip_code,
          organization_id,
          is_policyholder,
          country,
          mailing_same_as_address,
          created_at,
          updated_at
        `)
        .eq('organization_id', userProfile.organization_id)
        .or(`
          first_name.ilike.%${query}%,
          last_name.ilike.%${query}%,
          business_name.ilike.%${query}%,
          primary_email.ilike.%${query}%,
          primary_phone.ilike.%${query}%,
          secondary_phone.ilike.%${query}%,
          mobile_phone.ilike.%${query}%,
          address_line_1.ilike.%${query}%,
          city.ilike.%${query}%,
          state.ilike.%${query}%,
          zip_code.ilike.%${query}%
        `)
        .limit(maxResults)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Client search error:', error)
        setSearchResults([])
      } else {
        // Convert Client to ClientData format
        const clientData: ClientData[] = (data || []).map(client => ({
          id: client.id,
          first_name: client.first_name || '',
          last_name: client.last_name || '',
          business_name: client.business_name || undefined,
          primary_email: client.primary_email || '',
          primary_phone: client.primary_phone || '',
          client_type: client.client_type || 'residential',
          address_line_1: client.address_line_1 || undefined,
          address_line_2: client.address_line_2 || undefined,
          city: client.city || undefined,
          state: client.state || undefined,
          zip_code: client.zip_code || undefined,
          organization_id: client.organization_id,
          is_policyholder: client.is_policyholder || false,
          country: client.country || 'US',
          mailing_same_as_address: client.mailing_same_as_address || true,
          created_at: client.created_at,
          updated_at: client.updated_at
        }))
        setSearchResults(clientData)
      }
    } catch (error) {
      console.error('Error searching clients:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [userProfile?.organization_id, maxResults, minSearchLength])

  // Trigger search when debounced search term changes
  useEffect(() => {
    searchClients(debouncedSearchTerm)
  }, [debouncedSearchTerm, searchClients])

  // Load selected client by ID
  useEffect(() => {
    if (value && userProfile?.organization_id) {
      const loadSelectedClient = async () => {
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', value)
            .eq('organization_id', userProfile.organization_id)
            .single()

          if (!error && data) {
            const clientData: ClientData = {
              id: data.id,
              first_name: data.first_name || '',
              last_name: data.last_name || '',
              business_name: data.business_name || undefined,
              primary_email: data.primary_email || '',
              primary_phone: data.primary_phone || '',
              client_type: data.client_type || 'residential',
              address_line_1: data.address_line_1 || undefined,
              address_line_2: data.address_line_2 || undefined,
              city: data.city || undefined,
              state: data.state || undefined,
              zip_code: data.zip_code || undefined,
              organization_id: data.organization_id,
              is_policyholder: data.is_policyholder || false,
              country: data.country || 'US',
              mailing_same_as_address: data.mailing_same_as_address || true,
              created_at: data.created_at,
              updated_at: data.updated_at
            }
            setSelectedClient(clientData)
          }
        } catch (error) {
          console.error('Error loading selected client:', error)
        }
      }
      loadSelectedClient()
    } else {
      setSelectedClient(null)
    }
  }, [value, userProfile?.organization_id])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.length >= minSearchLength) {
      setIsOpen(true)
    } else if (term.length === 0) {
      setIsOpen(false)
      setSearchResults([])
    }
  }

  const handleSelect = (client: ClientData) => {
    setSelectedClient(client)
    onSelect(client)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleCreateNew = () => {
    setIsOpen(false)
    setSearchTerm('')
    onCreateNew?.()
  }

  const handleClearSelection = () => {
    setSelectedClient(null)
    setSearchTerm('')
    setSearchResults([])
    // Call onSelect with empty data to clear parent state
    onSelect({
      id: '',
      first_name: '',
      last_name: '',
      primary_email: '',
      primary_phone: '',
      client_type: 'residential',
      organization_id: '',
      is_policyholder: true,
      country: 'US',
      mailing_same_as_address: true
    })
  }

  // Format display name for client
  const getClientDisplayName = (client: ClientData) => {
    if (client.business_name) {
      return client.business_name
    }
    return `${client.first_name} ${client.last_name}`.trim()
  }

  // Format client address for display
  const getClientAddress = (client: ClientData) => {
    const parts = []
    if (client.address_line_1) parts.push(client.address_line_1)
    if (client.city) parts.push(client.city)
    if (client.state) parts.push(client.state)
    if (client.zip_code) parts.push(client.zip_code)
    return parts.join(', ')
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10"
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {/* Create New Option */}
            {showCreateNew && onCreateNew && (
              <button
                onClick={handleCreateNew}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-blue-600"
              >
                <UserPlus className="h-4 w-4" />
                <span className="font-medium">Create New Client</span>
                {searchTerm && (
                  <span className="text-sm text-gray-500">for "{searchTerm}"</span>
                )}
              </button>
            )}

            {/* Client Results */}
            {searchResults.length > 0 ? (
              searchResults.map(client => (
                <button
                  key={client.id}
                  onClick={() => handleSelect(client)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {client.first_name} {client.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.primary_email} • {client.primary_phone}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {client.client_type}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No clients found</p>
                {searchTerm && (
                  <p className="text-sm">Try a different search term</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Click away handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}