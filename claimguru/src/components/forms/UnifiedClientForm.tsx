/**
 * UNIFIED CLIENT FORM COMPONENT
 * 
 * Consolidates 3 duplicate client form components into a single, configurable component:
 * - ClientForm.tsx (simple form)
 * - EnhancedClientForm.tsx (enhanced features)
 * - ClientCreateEditModal.tsx (modal with all fields)
 * 
 * Features:
 * - Configurable complexity levels (basic, enhanced, comprehensive)
 * - Modal or inline display modes
 * - Tabbed interface for complex forms
 * - Standardized field validation
 * - Flexible data structure support
 */

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { X, Save, User, Building, Mail, Phone, MapPin, UserPlus, AlertCircle, Shield, DollarSign, Users, FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { StandardizedAddressInput } from '../ui/StandardizedAddressInput'
import { StandardizedPhoneInput } from '../ui/StandardizedPhoneInput'
import { Switch } from '../ui/switch'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import type { Client } from '../../lib/supabase'

interface PhoneNumber {
  id: string
  type: string
  number: string
  extension: string
  isPrimary: boolean
}

interface AddressData {
  streetAddress1: string
  streetAddress2: string
  city: string
  state: string
  zipCode: string
}

interface UnifiedClientFormProps {
  client?: Client | null
  isOpen: boolean
  onClose: () => void
  onSave: (clientData: any) => void
  
  // Configuration props
  mode?: 'modal' | 'inline'  // Display as modal or inline form
  complexity?: 'basic' | 'enhanced' | 'comprehensive'  // Feature level
  title?: string  // Custom title
  showTabs?: boolean  // Whether to show tabs for complex forms
}

const relationshipTypes = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'domestic_partner', label: 'Domestic Partner' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'business_partner', label: 'Business Partner' },
  { value: 'other', label: 'Other' }
]

const contactMethods = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'text', label: 'Text Message' },
  { value: 'mail', label: 'Mail' }
]

export function UnifiedClientForm({ 
  client, 
  isOpen, 
  onClose, 
  onSave,
  mode = 'modal',
  complexity = 'basic',
  title,
  showTabs = true
}: UnifiedClientFormProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  // Basic fields (always present)
  const [clientType, setClientType] = useState<'individual' | 'business'>('individual')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [primaryEmail, setPrimaryEmail] = useState('')
  const [primaryPhone, setPrimaryPhone] = useState('')
  const [notes, setNotes] = useState('')
  
  // Enhanced fields (for enhanced and comprehensive modes)
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([
    { id: 'phone_1', type: 'mobile', number: '', extension: '', isPrimary: true }
  ])
  const [primaryAddress, setPrimaryAddress] = useState<AddressData>({
    streetAddress1: '', streetAddress2: '', city: '', state: '', zipCode: ''
  })
  const [mailingAddressSame, setMailingAddressSame] = useState(true)
  const [mailingAddress, setMailingAddress] = useState<AddressData>({
    streetAddress1: '', streetAddress2: '', city: '', state: '', zipCode: ''
  })
  
  // Comprehensive fields (only for comprehensive mode)
  const [secondaryEmail, setSecondaryEmail] = useState('')
  const [preferredContactMethod, setPreferredContactMethod] = useState('email')
  const [hasCoInsured, setHasCoInsured] = useState(false)
  const [coInsuredFirstName, setCoInsuredFirstName] = useState('')
  const [coInsuredLastName, setCoInsuredLastName] = useState('')
  const [coInsuredEmail, setCoInsuredEmail] = useState('')
  const [coInsuredPhone, setCoInsuredPhone] = useState('')
  const [coInsuredRelationship, setCoInsuredRelationship] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
  const [emergencyContactEmail, setEmergencyContactEmail] = useState('')
  
  // Business-specific fields
  const [pointOfContactFirstName, setPointOfContactFirstName] = useState('')
  const [pointOfContactLastName, setPointOfContactLastName] = useState('')
  const [pointOfContactTitle, setPointOfContactTitle] = useState('')
  
  useEffect(() => {
    if (client) {
      // Load existing client data
      setClientType(client.client_type === 'commercial' ? 'business' : 'individual')
      setFirstName(client.first_name || '')
      setLastName(client.last_name || '')
      setBusinessName(client.business_name || '')
      setPrimaryEmail(client.primary_email || '')
      setPrimaryPhone(client.primary_phone || '')
      setNotes(client.notes || '')
      
      if (complexity === 'enhanced' || complexity === 'comprehensive') {
        setPrimaryAddress({
          streetAddress1: client.address_line_1 || '',
          streetAddress2: '',
          city: client.city || '',
          state: client.state || '',
          zipCode: client.zip_code || ''
        })
      }
      
      if (complexity === 'comprehensive') {
        setSecondaryEmail(client.secondary_email || '')
        setPointOfContactFirstName(client.point_of_contact_first_name || '')
        setPointOfContactLastName(client.point_of_contact_last_name || '')
        setPointOfContactTitle(client.point_of_contact_title || '')
      }
    } else {
      // Reset form for new client
      resetForm()
    }
  }, [client, isOpen, complexity])
  
  const resetForm = () => {
    setClientType('individual')
    setFirstName('')
    setLastName('')
    setBusinessName('')
    setPrimaryEmail('')
    setPrimaryPhone('')
    setNotes('')
    setSecondaryEmail('')
    setPreferredContactMethod('email')
    setHasCoInsured(false)
    setCoInsuredFirstName('')
    setCoInsuredLastName('')
    setCoInsuredEmail('')
    setCoInsuredPhone('')
    setCoInsuredRelationship('')
    setEmergencyContactName('')
    setEmergencyContactPhone('')
    setEmergencyContactEmail('')
    setPointOfContactFirstName('')
    setPointOfContactLastName('')
    setPointOfContactTitle('')
    setPrimaryAddress({ streetAddress1: '', streetAddress2: '', city: '', state: '', zipCode: '' })
    setMailingAddress({ streetAddress1: '', streetAddress2: '', city: '', state: '', zipCode: '' })
    setMailingAddressSame(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userProfile?.organization_id) {
      alert('Authentication error: No organization ID found')
      return
    }

    setLoading(true)
    try {
      const clientData = {
        client_type: clientType === 'business' ? 'commercial' : 'residential',
        first_name: firstName,
        last_name: lastName,
        business_name: businessName,
        primary_email: primaryEmail,
        primary_phone: primaryPhone,
        notes: notes,
        
        // Enhanced fields
        ...(complexity === 'enhanced' || complexity === 'comprehensive' ? {
          address_line_1: primaryAddress.streetAddress1,
          city: primaryAddress.city,
          state: primaryAddress.state,
          zip_code: primaryAddress.zipCode,
          mailing_same_as_address: mailingAddressSame
        } : {}),
        
        // Comprehensive fields
        ...(complexity === 'comprehensive' ? {
          secondary_email: secondaryEmail,
          preferred_contact_method: preferredContactMethod,
          point_of_contact_first_name: pointOfContactFirstName,
          point_of_contact_last_name: pointOfContactLastName,
          point_of_contact_title: pointOfContactTitle,
          has_co_insured: hasCoInsured,
          co_insured_first_name: coInsuredFirstName,
          co_insured_last_name: coInsuredLastName,
          co_insured_email: coInsuredEmail,
          co_insured_phone: coInsuredPhone,
          co_insured_relationship: coInsuredRelationship,
          emergency_contact_name: emergencyContactName,
          emergency_contact_phone: emergencyContactPhone,
          emergency_contact_email: emergencyContactEmail
        } : {})
      }

      await onSave(clientData)
      onClose()
    } catch (error) {
      // console.error('Error saving client:', error)
      alert(`Error saving client: ${error.message || 'Unknown error'}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const renderBasicInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {clientType === 'business' ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
          {clientType === 'business' ? 'Business Information' : 'Individual Information'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Client Type Selection */}
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="clientType"
              value="individual"
              checked={clientType === 'individual'}
              onChange={(e) => setClientType(e.target.value as 'individual' | 'business')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">Individual</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="clientType"
              value="business"
              checked={clientType === 'business'}
              onChange={(e) => setClientType(e.target.value as 'individual' | 'business')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">Business</span>
          </label>
        </div>
        
        {clientType === 'individual' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Name <span className="text-red-500">*</span></Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                required
              />
            </div>
            <div>
              <Label>Last Name <span className="text-red-500">*</span></Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                required
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Business Name <span className="text-red-500">*</span></Label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business name"
                required
              />
            </div>
            
            {complexity === 'comprehensive' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Point of Contact First Name</Label>
                  <Input
                    value={pointOfContactFirstName}
                    onChange={(e) => setPointOfContactFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <Label>Point of Contact Last Name</Label>
                  <Input
                    value={pointOfContactLastName}
                    onChange={(e) => setPointOfContactLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={pointOfContactTitle}
                    onChange={(e) => setPointOfContactTitle(e.target.value)}
                    placeholder="Job title"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Primary Email <span className="text-red-500">*</span></Label>
            <Input
              type="email"
              value={primaryEmail}
              onChange={(e) => setPrimaryEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <Label>Primary Phone <span className="text-red-500">*</span></Label>
            <Input
              type="tel"
              value={primaryPhone}
              onChange={(e) => setPrimaryPhone(e.target.value)}
              placeholder="(555) 123-4567"
              required
            />
          </div>
        </div>
        
        {complexity === 'comprehensive' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Secondary Email</Label>
              <Input
                type="email"
                value={secondaryEmail}
                onChange={(e) => setSecondaryEmail(e.target.value)}
                placeholder="secondary@example.com"
              />
            </div>
            <div>
              <Label>Preferred Contact Method</Label>
              <Select value={preferredContactMethod} onValueChange={setPreferredContactMethod}>
                {contactMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
  
  const renderAddressInfo = () => {
    if (complexity === 'basic') return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StandardizedAddressInput
            address={primaryAddress}
            onChange={setPrimaryAddress}
            label="Primary Address"
            allowAutocomplete
          />
          
          {complexity === 'comprehensive' && (
            <>
              <div className="flex items-center gap-2">
                <Switch
                  checked={mailingAddressSame}
                  onCheckedChange={setMailingAddressSame}
                />
                <Label>Mailing address same as primary</Label>
              </div>
              
              {!mailingAddressSame && (
                <StandardizedAddressInput
                  address={mailingAddress}
                  onChange={setMailingAddress}
                  label="Mailing Address"
                  allowAutocomplete
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    )
  }
  
  const renderCoInsuredInfo = () => {
    if (complexity !== 'comprehensive') return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Co-insured Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={hasCoInsured}
              onCheckedChange={setHasCoInsured}
            />
            <Label>Has Co-insured</Label>
          </div>
          
          {hasCoInsured && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Co-insured First Name</Label>
                  <Input
                    value={coInsuredFirstName}
                    onChange={(e) => setCoInsuredFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <Label>Co-insured Last Name</Label>
                  <Input
                    value={coInsuredLastName}
                    onChange={(e) => setCoInsuredLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Co-insured Email</Label>
                  <Input
                    type="email"
                    value={coInsuredEmail}
                    onChange={(e) => setCoInsuredEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label>Co-insured Phone</Label>
                  <Input
                    type="tel"
                    value={coInsuredPhone}
                    onChange={(e) => setCoInsuredPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              
              <div>
                <Label>Relationship</Label>
                <Select value={coInsuredRelationship} onValueChange={setCoInsuredRelationship}>
                  {relationshipTypes.map(rel => (
                    <option key={rel.value} value={rel.value}>{rel.label}</option>
                  ))}
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
  
  const renderEmergencyContact = () => {
    if (complexity !== 'comprehensive') return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Emergency Contact Name</Label>
              <Input
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label>Emergency Contact Phone</Label>
              <Input
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          
          <div>
            <Label>Emergency Contact Email</Label>
            <Input
              type="email"
              value={emergencyContactEmail}
              onChange={(e) => setEmergencyContactEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const renderNotesSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes about the client..."
          rows={4}
        />
      </CardContent>
    </Card>
  )
  
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    ...(complexity === 'enhanced' || complexity === 'comprehensive' ? [{ id: 'address', label: 'Address', icon: MapPin }] : []),
    ...(complexity === 'comprehensive' ? [
      { id: 'coinsured', label: 'Co-insured', icon: Users },
      { id: 'emergency', label: 'Emergency', icon: AlertCircle }
    ] : []),
    { id: 'notes', label: 'Notes', icon: FileText }
  ]
  
  const renderContent = () => {
    const shouldShowTabs = showTabs && (complexity === 'enhanced' || complexity === 'comprehensive')
    
    if (shouldShowTabs) {
      return (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map(tab => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'basic' && renderBasicInfo()}
            {activeTab === 'address' && renderAddressInfo()}
            {activeTab === 'coinsured' && renderCoInsuredInfo()}
            {activeTab === 'emergency' && renderEmergencyContact()}
            {activeTab === 'notes' && renderNotesSection()}
          </div>
        </div>
      )
    }
    
    // Single page layout for basic complexity or when tabs are disabled
    return (
      <div className="space-y-6">
        {renderBasicInfo()}
        {renderAddressInfo()}
        {renderCoInsuredInfo()}
        {renderEmergencyContact()}
        {renderNotesSection()}
      </div>
    )
  }
  
  const formTitle = title || (client ? 'Edit Client' : 'Add New Client')
  
  if (mode === 'inline') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{formTitle}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderContent()}
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Client'}
            </Button>
          </div>
        </form>
      </div>
    )
  }
  
  // Modal mode
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{formTitle}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {renderContent()}
          </form>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Client'}
          </Button>
        </div>
      </div>
    </div>
  )
}