import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { Switch } from '../../ui/switch'
import { StandardizedAddressInput } from '../../ui/StandardizedAddressInput'
import { StandardizedPhoneInput } from '../../ui/StandardizedPhoneInput'
import { ClientSearchDropdown } from '../../ui/ClientSearchDropdown'
import { useClients } from '../../../hooks/useClients'
import { User, Users, Building2, Mail, Search, Plus } from 'lucide-react'
import type { Client } from '../../../lib/supabase'

interface ClientInformationStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function ClientInformationStep({ data, onUpdate }: ClientInformationStepProps) {
  const [stepData, setStepData] = useState({
    // Client Status Selection
    clientStatus: data.clientStatus || 'new', // 'new' or 'existing'
    selectedExistingClientId: data.selectedExistingClientId || '',
    
    // Client Type Selection
    clientType: data.clientType || 'individual',
    
    // Individual Fields
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    
    // Business Fields
    businessName: data.businessName || '',
    pointOfContactFirstName: data.pointOfContactFirstName || '',
    pointOfContactLastName: data.pointOfContactLastName || '',
    
    // Contact Information
    primaryEmail: data.primaryEmail || '',
    phoneNumbers: data.phoneNumbers || [{
      id: 'primary',
      type: 'mobile',
      number: '',
      extension: '',
      isPrimary: true
    }],
    
    // Addresses
    streetAddress: {
      streetAddress1: data.streetAddress?.streetAddress1 || '',
      streetAddress2: data.streetAddress?.streetAddress2 || '',
      city: data.streetAddress?.city || '',
      state: data.streetAddress?.state || '',
      zipCode: data.streetAddress?.zipCode || ''
    },
    
    mailingAddress: {
      streetAddress1: data.mailingAddress?.streetAddress1 || '',
      streetAddress2: data.mailingAddress?.streetAddress2 || '',
      city: data.mailingAddress?.city || '',
      state: data.mailingAddress?.state || '',
      zipCode: data.mailingAddress?.zipCode || ''
    },
    
    isMailingSameAsLoss: data.isMailingSameAsLoss || false,
    
    // Coinsured Information
    hasCoinsured: data.hasCoinsured || false,
    coinsuredFirstName: data.coinsuredFirstName || '',
    coinsuredLastName: data.coinsuredLastName || '',
    coinsuredEmail: data.coinsuredEmail || '',
    coinsuredPhoneNumbers: data.coinsuredPhoneNumbers || [{
      id: 'coinsured_primary',
      type: 'mobile',
      number: '',
      extension: '',
      isPrimary: true
    }],
    relationshipToPrimary: data.relationshipToPrimary || ''
  })



  const updateField = (field: string, value: any) => {
    const updatedData = { ...stepData, [field]: value }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const selectExistingClient = (client: Client) => {
    const updatedData = {
      ...stepData,
      selectedExistingClientId: client.id,
      clientType: client.client_type === 'commercial' ? 'business' : 'individual',
      firstName: client.first_name || '',
      lastName: client.last_name || '',
      businessName: client.business_name || '',
      pointOfContactFirstName: client.first_name || '',
      pointOfContactLastName: client.last_name || '',
      primaryEmail: client.primary_email || '',
      phoneNumbers: [{
        id: 'primary',
        type: 'mobile',
        number: client.primary_phone || '',
        extension: '',
        isPrimary: true
      }],
      streetAddress: {
        streetAddress1: client.address_line_1 || '',
        streetAddress2: '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zip_code || ''
      },
      mailingAddress: {
        streetAddress1: client.address_line_1 || '',
        streetAddress2: '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zip_code || ''
      }
    }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const clearExistingClient = () => {
    const updatedData = {
      ...stepData,
      selectedExistingClientId: '',
      clientType: 'individual',
      firstName: '',
      lastName: '',
      businessName: '',
      pointOfContactFirstName: '',
      pointOfContactLastName: '',
      primaryEmail: '',
      phoneNumbers: [{
        id: 'primary',
        type: 'mobile',
        number: '',
        extension: '',
        isPrimary: true
      }],
      streetAddress: {
        streetAddress1: '',
        streetAddress2: '',
        city: '',
        state: '',
        zipCode: ''
      },
      mailingAddress: {
        streetAddress1: '',
        streetAddress2: '',
        city: '',
        state: '',
        zipCode: ''
      }
    }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const handleMailingSameAsToggle = (isSame: boolean) => {
    let updatedData = { ...stepData, isMailingSameAsLoss: isSame }
    
    if (isSame) {
      updatedData.mailingAddress = { ...stepData.streetAddress }
    }
    
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const relationshipOptions = [
    'Spouse',
    'Domestic Partner',
    'Parent',
    'Child',
    'Sibling',
    'Business Partner',
    'Co-owner',
    'Other'
  ]

  return (
    <div className="space-y-6">
      {/* Client Status Selection - New/Existing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Client Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 mb-4">
            <Button
              type="button"
              variant={stepData.clientStatus === 'new' ? 'primary' : 'outline'}
              onClick={() => updateField('clientStatus', 'new')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Client
            </Button>
            <Button
              type="button"
              variant={stepData.clientStatus === 'existing' ? 'primary' : 'outline'}
              onClick={() => updateField('clientStatus', 'existing')}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Existing Client
            </Button>
          </div>

          {stepData.clientStatus === 'existing' && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Search for Existing Client
                </h4>
                <ClientSearchDropdown
                  onClientSelect={selectExistingClient}
                  onClear={clearExistingClient}
                  placeholder="Search by name, email, phone, address..."
                  className="w-full"
                />
              </div>
              
              {!stepData.selectedExistingClientId && (
                <div className="text-center py-6 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">
                    Start typing to search for existing clients
                  </p>
                  <p className="text-xs mt-1">
                    You can search by name, email, phone number, or address
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Type Selection - Only show for new clients */}
      {stepData.clientStatus === 'new' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="clientType"
                  value="individual"
                  checked={stepData.clientType === 'individual'}
                  onChange={(e) => updateField('clientType', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">Individual/Residential</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="clientType"
                  value="business"
                  checked={stepData.clientType === 'business'}
                  onChange={(e) => updateField('clientType', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">Business/Commercial</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Details - Show for new clients and existing clients with selected client */}
      {(stepData.clientStatus === 'new' || (stepData.clientStatus === 'existing' && stepData.selectedExistingClientId)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stepData.clientType === 'business' ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
              {stepData.clientType === 'business' ? 'Business Information' : 'Individual Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stepData.clientType === 'individual' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={stepData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={stepData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={stepData.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    placeholder="Business name"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Point of Contact First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={stepData.pointOfContactFirstName}
                      onChange={(e) => updateField("pointOfContactFirstName", e.target.value)}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Point of Contact Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={stepData.pointOfContactLastName}
                      onChange={(e) => updateField("pointOfContactLastName", e.target.value)}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Primary Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={stepData.primaryEmail}
                onChange={(e) => updateField("primaryEmail", e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phone Numbers - Show for new clients and existing clients with selected client */}
      {(stepData.clientStatus === "new" || (stepData.clientStatus === 'existing' && stepData.selectedExistingClientId)) && (
        <Card>
          <CardContent className="pt-6">
            <StandardizedPhoneInput
              phoneNumbers={stepData.phoneNumbers}
              onChange={(phoneNumbers) => updateField("phoneNumbers", phoneNumbers)}
              label="Primary Phone Number"
              required
              allowMultiple
            />
          </CardContent>
        </Card>
      )}

      {/* Street Address - Show for new clients and existing clients with selected client */}
      {(stepData.clientStatus === "new" || (stepData.clientStatus === 'existing' && stepData.selectedExistingClientId)) && (
        <Card>
          <CardContent className="pt-6">
            <StandardizedAddressInput
              address={stepData.streetAddress}
              onChange={(address) => updateField("streetAddress", address)}
              label="Street Address"
              required
              allowAutocomplete
            />
          </CardContent>
        </Card>
      )}

      {/* Mailing Address - Show for new clients and existing clients with selected client */}
      {(stepData.clientStatus === "new" || (stepData.clientStatus === 'existing' && stepData.selectedExistingClientId)) && (
        <Card>
          <CardContent className="pt-6">
            <StandardizedAddressInput
              address={stepData.mailingAddress}
              onChange={(address) => updateField("mailingAddress", address)}
              label="Mailing Address"
              required
              allowAutocomplete
              showSameAsToggle
              sameAsToggleLabel="Is Mailing Address Same as Loss Location?"
              isSameAs={stepData.isMailingSameAsLoss}
              onSameAsToggle={handleMailingSameAsToggle}
            />
          </CardContent>
        </Card>
      )}

      {/* Coinsured Section - Show for new clients and existing clients with selected client */}
      {(stepData.clientStatus === "new" || (stepData.clientStatus === 'existing' && stepData.selectedExistingClientId)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Coinsured Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.hasCoinsured}
                onChange={(checked) => updateField("hasCoinsured", checked)}
              />
              <span className="text-sm font-medium text-gray-700">Add Coinsured</span>
            </div>

            {stepData.hasCoinsured && (
              <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coinsured First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={stepData.coinsuredFirstName}
                      onChange={(e) => updateField("coinsuredFirstName", e.target.value)}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coinsured Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={stepData.coinsuredLastName}
                      onChange={(e) => updateField("coinsuredLastName", e.target.value)}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coinsured Email
                  </label>
                  <Input
                    type="email"
                    value={stepData.coinsuredEmail}
                    onChange={(e) => updateField("coinsuredEmail", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <StandardizedPhoneInput
                  phoneNumbers={stepData.coinsuredPhoneNumbers}
                  onChange={(phoneNumbers) => updateField("coinsuredPhoneNumbers", phoneNumbers)}
                  label="Coinsured Phone Number"
                  allowMultiple={false}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship to Primary Insured <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={stepData.relationshipToPrimary}
                    onChange={(e) => updateField("relationshipToPrimary", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select relationship</option>
                    {relationshipOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ClientInformationStep
