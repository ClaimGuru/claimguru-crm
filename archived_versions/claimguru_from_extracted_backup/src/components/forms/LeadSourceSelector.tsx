import React, { useState, useEffect } from 'react'
import { Input } from '../ui/Input'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ChevronDown, User, Building, Phone, Mail, Globe, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface LeadSource {
  id: string
  name: string
  type: 'vendor' | 'contact' | 'referral' | 'marketing' | 'other'
  email?: string
  phone?: string
  company?: string
  category?: string
}

interface LeadSourceSelectorProps {
  value: string
  onSourceSelect: (source: LeadSource | null) => void
  className?: string
}

const PREDEFINED_SOURCES: LeadSource[] = [
  { id: 'google', name: 'Google Search', type: 'marketing', category: 'Search Engine' },
  { id: 'facebook', name: 'Facebook Ads', type: 'marketing', category: 'Social Media' },
  { id: 'referral', name: 'Client Referral', type: 'referral', category: 'Word of Mouth' },
  { id: 'website', name: 'Website Contact Form', type: 'marketing', category: 'Direct' },
  { id: 'phone', name: 'Phone Call', type: 'other', category: 'Direct Contact' },
  { id: 'email', name: 'Email Inquiry', type: 'other', category: 'Direct Contact' },
  { id: 'trade_show', name: 'Trade Show', type: 'marketing', category: 'Events' },
  { id: 'yellow_pages', name: 'Yellow Pages', type: 'marketing', category: 'Directory' },
  { id: 'linkedin', name: 'LinkedIn', type: 'marketing', category: 'Social Media' },
  { id: 'yelp', name: 'Yelp', type: 'marketing', category: 'Review Sites' }
]

export function LeadSourceSelector({ value, onSourceSelect, className = '' }: LeadSourceSelectorProps) {
  const { userProfile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [vendors, setVendors] = useState<LeadSource[]>([])
  const [contacts, setContacts] = useState<LeadSource[]>([])
  const [selectedSource, setSelectedSource] = useState<LeadSource | null>(null)

  useEffect(() => {
    if (isOpen && userProfile?.organization_id) {
      loadSourceData()
    }
  }, [isOpen, userProfile?.organization_id])

  useEffect(() => {
    // Find selected source from predefined or loaded data
    if (value) {
      const allSources = [...PREDEFINED_SOURCES, ...vendors, ...contacts]
      const found = allSources.find(s => s.id === value || s.name === value)
      setSelectedSource(found || { id: value, name: value, type: 'other' })
    } else {
      setSelectedSource(null)
    }
  }, [value, vendors, contacts])

  async function loadSourceData() {
    if (!userProfile?.organization_id) return
    
    setLoading(true)
    try {
      // Load vendors
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id, name, email, phone, company, category')
        .eq('organization_id', userProfile.organization_id)
        .limit(20)

      if (!vendorError && vendorData) {
        const vendorSources: LeadSource[] = vendorData.map(v => ({
          id: v.id,
          name: v.name,
          type: 'vendor',
          email: v.email || undefined,
          phone: v.phone || undefined,
          company: v.company || undefined,
          category: v.category || undefined
        }))
        setVendors(vendorSources)
      }

      // Load contacts from clients (as potential referral sources)
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email, phone, company')
        .eq('organization_id', userProfile.organization_id)
        .limit(20)

      if (!clientError && clientData) {
        const contactSources: LeadSource[] = clientData.map(c => ({
          id: c.id,
          name: `${c.first_name} ${c.last_name}`.trim(),
          type: 'contact',
          email: c.email || undefined,
          phone: c.phone || undefined,
          company: c.company || undefined
        }))
        setContacts(contactSources)
      }
    } catch (error) {
      console.error('Error loading source data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSources = () => {
    const allSources = [
      ...PREDEFINED_SOURCES,
      ...vendors,
      ...contacts
    ]

    if (!searchTerm) return allSources

    return allSources.filter(source =>
      source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'vendor':
        return <Building className="h-4 w-4 text-blue-600" />
      case 'contact':
        return <User className="h-4 w-4 text-green-600" />
      case 'referral':
        return <Users className="h-4 w-4 text-purple-600" />
      case 'marketing':
        return <Globe className="h-4 w-4 text-orange-600" />
      default:
        return <Mail className="h-4 w-4 text-gray-600" />
    }
  }

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case 'vendor': return 'Vendor'
      case 'contact': return 'Contact'
      case 'referral': return 'Referral'
      case 'marketing': return 'Marketing'
      default: return 'Other'
    }
  }

  const handleSourceSelect = (source: LeadSource) => {
    setSelectedSource(source)
    onSourceSelect(source)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleCustomSource = () => {
    if (searchTerm.trim()) {
      const customSource = {
        id: `custom_${Date.now()}`,
        name: searchTerm.trim(),
        type: 'other' as const
      }
      handleSourceSelect(customSource)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Lead Source / Referral Source
      </label>
      
      {/* Selected Source Display */}
      <div 
        className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-gray-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedSource && getSourceIcon(selectedSource.type)}
            <span className="text-gray-900">
              {selectedSource ? selectedSource.name : 'Select lead source...'}
            </span>
            {selectedSource && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {getSourceTypeLabel(selectedSource.type)}
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <Input
              type="text"
              placeholder="Search or type new source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              autoFocus
            />
            {searchTerm && !filteredSources().some(s => s.name.toLowerCase() === searchTerm.toLowerCase()) && (
              <button
                onClick={handleCustomSource}
                className="w-full mt-2 px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                + Create "{searchTerm}" as new source
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center">
              <LoadingSpinner size="sm" />
            </div>
          )}

          {/* Source List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredSources().map((source, index) => (
              <button
                key={`${source.type}-${source.id}-${index}`}
                onClick={() => handleSourceSelect(source)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSourceIcon(source.type)}
                    <div>
                      <div className="font-medium text-gray-900">{source.name}</div>
                      {source.company && (
                        <div className="text-xs text-gray-500">{source.company}</div>
                      )}
                      {source.category && (
                        <div className="text-xs text-gray-500">{source.category}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {getSourceTypeLabel(source.type)}
                  </span>
                </div>
                {(source.email || source.phone) && (
                  <div className="text-xs text-gray-500 mt-1 flex gap-4">
                    {source.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {source.email}
                      </span>
                    )}
                    {source.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {source.phone}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
            
            {!loading && filteredSources().length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No sources found. Type to create a new one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
