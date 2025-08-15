/**
 * CLIENT SELECTOR COMPONENT
 * 
 * A selector component for finding and selecting existing clients
 * or creating new ones.
 */

import React, { useState, useEffect } from 'react'
import { Search, UserPlus, User } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'

interface ClientData {
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
}

// Mock client data - in a real app this would come from an API
const mockClients: ClientData[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Smith',
    primary_email: 'john.smith@email.com',
    primary_phone: '(555) 123-4567',
    client_type: 'residential',
    organization_id: 'org-1',
    is_policyholder: true,
    country: 'US',
    mailing_same_as_address: true
  },
  {
    id: '2', 
    first_name: 'Jane',
    last_name: 'Johnson',
    primary_email: 'jane.johnson@email.com',
    primary_phone: '(555) 234-5678',
    client_type: 'residential',
    organization_id: 'org-1',
    is_policyholder: true,
    country: 'US',
    mailing_same_as_address: true
  },
  {
    id: '3',
    first_name: 'Acme',
    last_name: 'Corporation',
    business_name: 'Acme Corporation',
    primary_email: 'contact@acme.com',
    primary_phone: '(555) 345-6789',
    client_type: 'commercial',
    organization_id: 'org-1',
    is_policyholder: true,
    country: 'US',
    mailing_same_as_address: true
  }
]

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  value,
  onSelect,
  placeholder = "Search clients...",
  className = '',
  showCreateNew = false,
  onCreateNew
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredClients, setFilteredClients] = useState<ClientData[]>([])
  const selectedClient = mockClients.find(c => c.id === value)

  // Filter clients based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(mockClients.slice(0, 5)) // Show first 5 clients
      return
    }

    const filtered = mockClients.filter(client => 
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.primary_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.primary_phone.includes(searchTerm)
    )
    
    setFilteredClients(filtered)
  }, [searchTerm])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setIsOpen(true)
  }

  const handleSelect = (client: ClientData) => {
    onSelect(client)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleCreateNew = () => {
    setIsOpen(false)
    onCreateNew?.()
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
            {filteredClients.length > 0 ? (
              filteredClients.map(client => (
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