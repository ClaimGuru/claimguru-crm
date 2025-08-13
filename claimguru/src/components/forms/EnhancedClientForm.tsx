import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { X, Save, User, Building, Mail, Phone, MapPin, UserPlus, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Client } from '../../lib/supabase'
import { StandardizedAddressInput } from '../ui/StandardizedAddressInput'
import { StandardizedPhoneInput } from '../ui/StandardizedPhoneInput'
import { Switch } from '../ui/switch'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'

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

interface EnhancedClientFormProps {
  client?: Client | null
  isOpen: boolean
  onClose: () => void
  onSave: (clientData: any) => void
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

export function EnhancedClientForm({ client, isOpen, onClose, onSave }: EnhancedClientFormProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  // Basic Information
  const [clientType, setClientType] = useState<'individual' | 'business'>('individual')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [pointOfContactFirstName, setPointOfContactFirstName] = useState('')
  const [pointOfContactLastName, setPointOfContactLastName] = useState('')
  const [pointOfContactTitle, setPointOfContactTitle] = useState('')
  const [pointOfContactEmail, setPointOfContactEmail] = useState('')
  const [pointOfContactPhone, setPointOfContactPhone] = useState('')
  
  // Contact Information
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([
    { id: 'phone_1', type: 'mobile', number: '', extension: '', isPrimary: true }
  ])
  const [emails, setEmails] = useState<{primary: string, secondary: string}>({ primary: '', secondary: '' })
  const [preferredContactMethod, setPreferredContactMethod] = useState('email')
  
  // Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
  const [emergencyContactEmail, setEmergencyContactEmail] = useState('')
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('')
  
  // Addresses
  const [primaryAddress, setPrimaryAddress] = useState<AddressData>({
    streetAddress1: '', streetAddress2: '', city: '', state: '', zipCode: ''
  })
  const [mailingAddressSame, setMailingAddressSame] = useState(true)
  const [mailingAddress, setMailingAddress] = useState<AddressData>({
    streetAddress1: '', streetAddress2: '', city: '', state: '', zipCode: ''
  })
  const [lossLocationSame, setLossLocationSame] = useState(true)
  const [lossLocationAddress, setLossLocationAddress] = useState<AddressData>({
    streetAddress1: '', streetAddress2: '', city: '', state: '', zipCode: ''
  })
  
  // Co-insured
  const [hasCoInsured, setHasCoInsured] = useState(false)
  const [coInsuredFirstName, setCoInsuredFirstName] = useState('')
  const [coInsuredLastName, setCoInsuredLastName] = useState('')
  const [coInsuredEmail, setCoInsuredEmail] = useState('')
  const [coInsuredPhone, setCoInsuredPhone] = useState('')
  const [coInsuredRelationship, setCoInsuredRelationship] = useState('')
  const [coInsuredAddressSame, setCoInsuredAddressSame] = useState(true)
  const [coInsuredAddress, setCoInsuredAddress] = useState<AddressData>({
    streetAddress1: '', streetAddress2: '', city: '', state: '', zipCode: ''
  })
  
  // Additional Information
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (client) {
      // Load existing client data
      setClientType(client.client_type === 'commercial' ? 'business' : 'individual')
      setFirstName(client.first_name || '')
      setLastName(client.last_name || '')
      setBusinessName(client.business_name || '')
      setPointOfContactFirstName(client.point_of_contact_first_name || '')
      setPointOfContactLastName(client.point_of_contact_last_name || '')
      setPointOfContactTitle(client.point_of_contact_title || '')
      setPointOfContactEmail(client.point_of_contact_email || '')
      setPointOfContactPhone(client.point_of_contact_phone || '')
      
      // Load phone numbers
      const clientPhones: PhoneNumber[] = []
      if (client.primary_phone) {
        clientPhones.push({
          id: 'primary_phone',
          type: 'mobile',
          number: client.primary_phone,
          extension: '',
          isPrimary: true
        })
      }
      if (client.secondary_phone) {
        clientPhones.push({
          id: 'secondary_phone',
          type: 'home',
          number: client.secondary_phone,
          extension: '',
          isPrimary: false
        })
      }
      if (clientPhones.length > 0) {
        setPhoneNumbers(clientPhones)
      }
      
      setEmails({ primary: client.primary_email || '', secondary: client.secondary_email || '' })
      setPreferredContactMethod(client.preferred_contact_method || 'email')
      
      // Emergency contact
      setEmergencyContactName(client.emergency_contact_name || '')
      setEmergencyContactPhone(client.emergency_contact_phone || '')
      setEmergencyContactEmail(client.emergency_contact_email || '')
      setEmergencyContactRelationship(client.emergency_contact_relationship || '')
      
      // Primary address
      setPrimaryAddress({
        streetAddress1: client.address_line_1 || '',
        streetAddress2: client.address_line_2 || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zip_code || ''
      })
      
      // Mailing address
      setMailingAddressSame(client.mailing_same_as_address ?? true)
      setMailingAddress({
        streetAddress1: client.mailing_address_line_1 || '',
        streetAddress2: client.mailing_address_line_2 || '',
        city: client.mailing_city || '',
        state: client.mailing_state || '',
        zipCode: client.mailing_zip_code || ''
      })
      
      // Loss location
      setLossLocationSame(client.loss_location_same_as_primary ?? true)
      setLossLocationAddress({
        streetAddress1: client.loss_location_address_line_1 || '',
        streetAddress2: client.loss_location_address_line_2 || '',
        city: client.loss_location_city || '',
        state: client.loss_location_state || '',
        zipCode: client.loss_location_zip_code || ''
      })
      
      // Co-insured
      setHasCoInsured(client.has_co_insured || false)
      setCoInsuredFirstName(client.co_insured_first_name || '')
      setCoInsuredLastName(client.co_insured_last_name || '')
      setCoInsuredEmail(client.co_insured_email || '')
      setCoInsuredPhone(client.co_insured_phone || '')
      setCoInsuredRelationship(client.co_insured_relationship || '')
      setCoInsuredAddressSame(client.co_insured_address_same_as_primary ?? true)
      setCoInsuredAddress({
        streetAddress1: client.co_insured_address_line_1 || '',
        streetAddress2: client.co_insured_address_line_2 || '',
        city: client.co_insured_city || '',
        state: client.co_insured_state || '',
        zipCode: client.co_insured_zip_code || ''
      })
      
      setNotes(client.notes || '')
    } else {
      // Reset form for new client
      resetForm()
    }
  }, [client, isOpen])

  const resetForm = () => {
    setClientType('individual')
    setFirstName('')
    setLastName('')
    setBusinessName('')
    setPointOfContactFirstName('')
    setPointOfContactLastName('')
    setPointOfContactTitle('')
    setPointOfContactEmail('')
    setPointOfContactPhone('')
    setPhoneNumbers([{ id: 'phone_1', type: 'mobile', number: '', extension: '', isPrimary: true }])
    setEmails({ primary: '', secondary: '' })
    setPreferredContactMethod('email')
    setEmergencyContactName('')
    setEmergencyContactPhone('')
    setEmergencyContactEmail('')
    setEmergencyContactRelationship('')
    setPrimaryAddress({ streetAddress1: '', streetAddress2: '', city: '', state: '', zipCode: '' })
    setMailingAddressSame(true)
    setMailingAddress({ streetAddress1: '', streetAddress2: '', city: '', state: '', zipCode: '' })
    setLossLocationSame(true)
    setLossLocationAddress({ streetAddress1: '', streetAddress2: '', city: '', state: '', zipCode: '' })
    setHasCoInsured(false)
    setCoInsuredFirstName('')
    setCoInsuredLastName('')
    setCoInsuredEmail('')
    setCoInsuredPhone('')
    setCoInsuredRelationship('')
    setCoInsuredAddressSame(true)
    setCoInsuredAddress({ streetAddress1: '', streetAddress2: '', city: '', state: '', zipCode: '' })
    setNotes('')
    setActiveTab('basic')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 ENHANCED CLIENT FORM SUBMISSION STARTED')
    
    if (!userProfile?.organization_id) {
      console.error('❌ No organization ID found')
      alert('Authentication error: No organization ID found')
      return
    }

    setLoading(true)
    try {
      const primaryPhone = phoneNumbers.find(p => p.isPrimary)?.number || phoneNumbers[0]?.number || ''
      const secondaryPhone = phoneNumbers.find(p => !p.isPrimary)?.number || ''
      
      const clientData = {
        client_type: clientType === 'business' ? 'commercial' : 'residential',
        first_name: clientType === 'individual' ? firstName : null,
        last_name: clientType === 'individual' ? lastName : null,
        business_name: clientType === 'business' ? businessName : null,
        point_of_contact_first_name: clientType === 'business' ? pointOfContactFirstName : null,
        point_of_contact_last_name: clientType === 'business' ? pointOfContactLastName : null,
        point_of_contact_title: clientType === 'business' ? pointOfContactTitle : null,
        point_of_contact_email: clientType === 'business' ? pointOfContactEmail : null,
        point_of_contact_phone: clientType === 'business' ? pointOfContactPhone : null,
        
        // Contact information
        primary_email: emails.primary,
        secondary_email: emails.secondary,
        primary_phone: primaryPhone,
        secondary_phone: secondaryPhone,
        preferred_contact_method: preferredContactMethod,
        
        // Emergency contact
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        emergency_contact_email: emergencyContactEmail,
        emergency_contact_relationship: emergencyContactRelationship,
        
        // Primary address
        address_line_1: primaryAddress.streetAddress1,
        address_line_2: primaryAddress.streetAddress2,
        city: primaryAddress.city,
        state: primaryAddress.state,
        zip_code: primaryAddress.zipCode,
        country: 'United States',
        
        // Mailing address
        mailing_same_as_address: mailingAddressSame,
        mailing_address_line_1: mailingAddressSame ? null : mailingAddress.streetAddress1,
        mailing_address_line_2: mailingAddressSame ? null : mailingAddress.streetAddress2,
        mailing_city: mailingAddressSame ? null : mailingAddress.city,
        mailing_state: mailingAddressSame ? null : mailingAddress.state,
        mailing_zip_code: mailingAddressSame ? null : mailingAddress.zipCode,
        
        // Loss location
        loss_location_same_as_primary: lossLocationSame,
        loss_location_address_line_1: lossLocationSame ? null : lossLocationAddress.streetAddress1,
        loss_location_address_line_2: lossLocationSame ? null : lossLocationAddress.streetAddress2,
        loss_location_city: lossLocationSame ? null : lossLocationAddress.city,
        loss_location_state: lossLocationSame ? null : lossLocationAddress.state,
        loss_location_zip_code: lossLocationSame ? null : lossLocationAddress.zipCode,
        
        // Co-insured
        has_co_insured: hasCoInsured,
        co_insured_first_name: hasCoInsured ? coInsuredFirstName : null,
        co_insured_last_name: hasCoInsured ? coInsuredLastName : null,
        co_insured_email: hasCoInsured ? coInsuredEmail : null,
        co_insured_phone: hasCoInsured ? coInsuredPhone : null,
        co_insured_relationship: hasCoInsured ? coInsuredRelationship : null,
        co_insured_address_same_as_primary: hasCoInsured ? coInsuredAddressSame : null,
        co_insured_address_line_1: hasCoInsured && !coInsuredAddressSame ? coInsuredAddress.streetAddress1 : null,
        co_insured_address_line_2: hasCoInsured && !coInsuredAddressSame ? coInsuredAddress.streetAddress2 : null,
        co_insured_city: hasCoInsured && !coInsuredAddressSame ? coInsuredAddress.city : null,
        co_insured_state: hasCoInsured && !coInsuredAddressSame ? coInsuredAddress.state : null,
        co_insured_zip_code: hasCoInsured && !coInsuredAddressSame ? coInsuredAddress.zipCode : null,
        
        // Additional
        notes: notes,
        client_status: 'active',
        is_active: true
      }

      console.log('💾 Final enhanced client data to save:', clientData)
      await onSave(clientData)
      onClose()
    } catch (error) {
      console.error('❌ Error saving enhanced client:', error)
      alert(`Error saving client: ${error.message || 'Unknown error'}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'coinsured', label: 'Co-insured', icon: UserPlus }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {client ? 'Edit Client' : 'Add New Client'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1">
          <div className="p-6 space-y-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Client Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="clientType"
                          value="individual"
                          checked={clientType === 'individual'}
                          onChange={(e) => setClientType(e.target.value as 'individual' | 'business')}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Individual/Residential</div>
                          <div className="text-sm text-gray-500">Personal client with first/last name</div>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="clientType"
                          value="business"
                          checked={clientType === 'business'}
                          onChange={(e) => setClientType(e.target.value as 'individual' | 'business')}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Business/Commercial</div>
                          <div className="text-sm text-gray-500">Business client with company name</div>
                        </div>
                      </label>
                    </div>

                    {clientType === 'individual' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="businessName">Business Name *</Label>
                          <Input
                            id="businessName"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-4">Point of Contact</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="pocFirstName">First Name</Label>
                              <Input
                                id="pocFirstName"
                                value={pointOfContactFirstName}
                                onChange={(e) => setPointOfContactFirstName(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="pocLastName">Last Name</Label>
                              <Input
                                id="pocLastName"
                                value={pointOfContactLastName}
                                onChange={(e) => setPointOfContactLastName(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="pocTitle">Title</Label>
                              <Input
                                id="pocTitle"
                                value={pointOfContactTitle}
                                onChange={(e) => setPointOfContactTitle(e.target.value)}
                                placeholder="e.g., Manager, Owner"
                              />
                            </div>
                            <div>
                              <Label htmlFor="pocEmail">Email</Label>
                              <Input
                                id="pocEmail"
                                type="email"
                                value={pointOfContactEmail}
                                onChange={(e) => setPointOfContactEmail(e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor="pocPhone">Phone</Label>
                              <Input
                                id="pocPhone"
                                type="tel"
                                value={pointOfContactPhone}
                                onChange={(e) => setPointOfContactPhone(e.target.value)}
                                placeholder="(555) 123-4567"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Contact Information Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Phone Numbers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StandardizedPhoneInput
                      phoneNumbers={phoneNumbers}
                      onChange={setPhoneNumbers}
                      required
                      allowMultiple
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Addresses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryEmail">Primary Email *</Label>
                        <Input
                          id="primaryEmail"
                          type="email"
                          value={emails.primary}
                          onChange={(e) => setEmails(prev => ({ ...prev, primary: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="secondaryEmail">Secondary Email</Label>
                        <Input
                          id="secondaryEmail"
                          type="email"
                          value={emails.secondary}
                          onChange={(e) => setEmails(prev => ({ ...prev, secondary: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                      <select
                        id="preferredContact"
                        value={preferredContactMethod}
                        onChange={(e) => setPreferredContactMethod(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {contactMethods.map(method => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergencyName">Name</Label>
                        <Input
                          id="emergencyName"
                          value={emergencyContactName}
                          onChange={(e) => setEmergencyContactName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyPhone">Phone</Label>
                        <Input
                          id="emergencyPhone"
                          type="tel"
                          value={emergencyContactPhone}
                          onChange={(e) => setEmergencyContactPhone(e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyEmail">Email</Label>
                        <Input
                          id="emergencyEmail"
                          type="email"
                          value={emergencyContactEmail}
                          onChange={(e) => setEmergencyContactEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyRelationship">Relationship</Label>
                        <select
                          id="emergencyRelationship"
                          value={emergencyContactRelationship}
                          onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select relationship</option>
                          {relationshipTypes.map(rel => (
                            <option key={rel.value} value={rel.value}>
                              {rel.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Primary Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StandardizedAddressInput
                      address={primaryAddress}
                      onChange={setPrimaryAddress}
                      label="Primary Address"
                      required
                      allowAutocomplete
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mailing Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StandardizedAddressInput
                      address={mailingAddress}
                      onChange={setMailingAddress}
                      label="Mailing Address"
                      allowAutocomplete
                      showSameAsToggle
                      sameAsToggleLabel="Same as primary address"
                      isSameAs={mailingAddressSame}
                      onSameAsToggle={setMailingAddressSame}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Loss Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StandardizedAddressInput
                      address={lossLocationAddress}
                      onChange={setLossLocationAddress}
                      label="Loss Location Address"
                      allowAutocomplete
                      showSameAsToggle
                      sameAsToggleLabel="Same as primary address"
                      isSameAs={lossLocationSame}
                      onSameAsToggle={setLossLocationSame}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Co-insured Tab */}
            {activeTab === 'coinsured' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Co-insured Information
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={hasCoInsured}
                          onCheckedChange={setHasCoInsured}
                        />
                        <Label>Has Co-insured</Label>
                      </div>
                    </div>
                  </CardHeader>
                  {hasCoInsured && (
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="coInsuredFirstName">First Name *</Label>
                            <Input
                              id="coInsuredFirstName"
                              value={coInsuredFirstName}
                              onChange={(e) => setCoInsuredFirstName(e.target.value)}
                              required={hasCoInsured}
                            />
                          </div>
                          <div>
                            <Label htmlFor="coInsuredLastName">Last Name *</Label>
                            <Input
                              id="coInsuredLastName"
                              value={coInsuredLastName}
                              onChange={(e) => setCoInsuredLastName(e.target.value)}
                              required={hasCoInsured}
                            />
                          </div>
                          <div>
                            <Label htmlFor="coInsuredEmail">Email</Label>
                            <Input
                              id="coInsuredEmail"
                              type="email"
                              value={coInsuredEmail}
                              onChange={(e) => setCoInsuredEmail(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="coInsuredPhone">Phone</Label>
                            <Input
                              id="coInsuredPhone"
                              type="tel"
                              value={coInsuredPhone}
                              onChange={(e) => setCoInsuredPhone(e.target.value)}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="coInsuredRelationship">Relationship *</Label>
                            <select
                              id="coInsuredRelationship"
                              value={coInsuredRelationship}
                              onChange={(e) => setCoInsuredRelationship(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required={hasCoInsured}
                            >
                              <option value="">Select relationship</option>
                              {relationshipTypes.map(rel => (
                                <option key={rel.value} value={rel.value}>
                                  {rel.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <StandardizedAddressInput
                            address={coInsuredAddress}
                            onChange={setCoInsuredAddress}
                            label="Co-insured Address"
                            allowAutocomplete
                            showSameAsToggle
                            sameAsToggleLabel="Same as primary address"
                            isSameAs={coInsuredAddressSame}
                            onSameAsToggle={setCoInsuredAddressSame}
                          />
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Additional notes about this client..."
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {client ? 'Update Client' : 'Create Client'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}