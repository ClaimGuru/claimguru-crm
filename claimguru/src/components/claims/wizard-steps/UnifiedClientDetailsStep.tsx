import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { Switch } from '../../ui/switch'
import { StandardizedAddressInput } from '../../ui/StandardizedAddressInput'
import { StandardizedPhoneInput } from '../../ui/StandardizedPhoneInput'
import { ClientSelector } from '../ClientSelector'
import { AddressAutocomplete } from '../../ui/AddressAutocomplete'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { useClients } from '../../../hooks/useClients'
import { formatPhoneNumber, formatPhoneExtension } from '../../../utils/phoneUtils'
import { enhancedClaimWizardAI, AIValidation } from '../../../services/enhancedClaimWizardAI'
import { User, Users, Building2, Mail, Search, Plus, UserPlus, Brain, CheckCircle, AlertTriangle, X } from 'lucide-react'
import type { Client } from '../../../lib/supabase'

interface PhoneNumber {
  id: string
  type: string
  number: string
  extension: string
  isPrimary?: boolean
}

interface UnifiedClientDetailsStepProps {
  data: any
  onUpdate: (data: any) => void
  onAIProcessing?: (isProcessing: boolean) => void
  mode?: 'selector' | 'manual' | 'ai-enhanced' | 'intelligent'
  showClientSelector?: boolean
  enableAIFeatures?: boolean
  enableValidation?: boolean
}

interface ValidationResults {
  client: AIValidation | null
  address: AIValidation | null
  coInsured: string[]
}

export function UnifiedClientDetailsStep({ 
  data, 
  onUpdate, 
  onAIProcessing,
  mode = 'manual',
  showClientSelector = true,
  enableAIFeatures = false,
  enableValidation = false
}: UnifiedClientDetailsStepProps) {
  const { createClient } = useClients()
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  
  // Unified state structure combining all component variations
  const [stepData, setStepData] = useState({
    // Client Status Selection
    clientStatus: data.clientStatus || 'existing',
    selectedExistingClient: data.selectedExistingClient || null,
    selectedExistingClientId: data.selectedExistingClientId || '',
    
    // Client Type Selection
    clientType: data.clientType || 'individual',
    isOrganization: data.isOrganization || false,
    
    // Individual Fields
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    
    // Business Fields
    businessName: data.businessName || '',
    organizationName: data.organizationName || '',
    pointOfContactFirstName: data.pointOfContactFirstName || '',
    pointOfContactLastName: data.pointOfContactLastName || '',
    
    // Contact Information
    primaryEmail: data.primaryEmail || '',
    primaryPhone: data.primaryPhone || '',
    phoneType: data.phoneType || 'cell',
    phoneNumbers: data.phoneNumbers || [{
      id: 'primary',
      type: 'Primary',
      number: data.primaryPhone || '',
      extension: data.phoneExtension || '',
      isPrimary: true
    }],
    
    // Addresses - Support both formats
    streetAddress: data.streetAddress || {
      streetAddress1: data.mailingAddress?.addressLine1 || '',
      streetAddress2: data.mailingAddress?.addressLine2 || '',
      city: data.mailingAddress?.city || '',
      state: data.mailingAddress?.state || '',
      zipCode: data.mailingAddress?.zipCode || ''
    },
    
    mailingAddress: data.mailingAddress || {
      addressLine1: data.streetAddress?.streetAddress1 || '',
      addressLine2: data.streetAddress?.streetAddress2 || '',
      city: data.streetAddress?.city || '',
      state: data.streetAddress?.state || '',
      zipCode: data.streetAddress?.zipCode || '',
      address: ''
    },
    
    lossAddress: data.lossAddress || {},
    isMailingSameAsLoss: data.isMailingSameAsLoss || false,
    addressSameAsMailing: data.addressSameAsMailing !== undefined ? data.addressSameAsMailing : true,
    
    // Coinsured Information
    hasCoinsured: data.hasCoinsured || data.hasCoInsured || false,
    coinsuredFirstName: data.coinsuredFirstName || data.coInsuredFirstName || '',
    coinsuredLastName: data.coinsuredLastName || data.coInsuredLastName || '',
    coinsuredEmail: data.coinsuredEmail || data.coInsuredEmail || '',
    coinsuredPhone: data.coinsuredPhone || data.coInsuredPhone || '',
    coinsuredPhoneExtension: data.coinsuredPhoneExtension || data.coInsuredPhoneExtension || '',
    coinsuredPhoneNumbers: data.coinsuredPhoneNumbers || [{
      id: 'coinsured_primary',
      type: 'mobile',
      number: '',
      extension: '',
      isPrimary: true
    }],
    relationshipToPrimary: data.relationshipToPrimary || data.coInsuredRelationship || '',
    coInsuredName: data.coInsuredName || '',
    coInsuredRelationship: data.coInsuredRelationship || '',
    
    // AI Enhancement Fields
    aiSuggested: data.aiSuggested || false,
    confidenceScore: data.confidenceScore || 0,
    autoPopulated: data.autoPopulated || false
  })
  
  // AI Validation States (only active in AI modes)
  const [validationResults, setValidationResults] = useState<any>({
    client: null
  })
  const [isValidating, setIsValidating] = useState(false)
  const [autoPopulated, setAutoPopulated] = useState(false)

  // Handle client selection from ClientSelector
  const handleClientSelect = (client: Client | null) => {
    if (client) {
      const updatedData = {
        ...stepData,
        clientStatus: 'existing',
        selectedExistingClient: client,
        selectedExistingClientId: client.id,
        clientType: client.client_type === 'residential' ? 'individual' : 'business',
        firstName: client.first_name || '',
        lastName: client.last_name || '',
        businessName: client.business_name || '',
        organizationName: client.business_name || '',
        primaryEmail: client.primary_email || '',
        primaryPhone: client.primary_phone || '',
        phoneNumbers: [{
          id: 'primary',
          type: 'Primary',
          number: client.primary_phone || '',
          extension: '',
          isPrimary: true
        }],
        streetAddress: {
          streetAddress1: client.address_line_1 || '',
          streetAddress2: client.address_line_2 || '',
          city: client.city || '',
          state: client.state || '',
          zipCode: client.zip_code || ''
        },
        mailingAddress: {
          addressLine1: client.address_line_1 || '',
          addressLine2: client.address_line_2 || '',
          city: client.city || '',
          state: client.state || '',
          zipCode: client.zip_code || ''
        }
      }
      setStepData(updatedData)
      onUpdate(updatedData)
    } else {
      const updatedData = {
        ...stepData,
        selectedExistingClient: null,
        selectedExistingClientId: ''
      }
      setStepData(updatedData)
      onUpdate(updatedData)
    }
  }

  // Handle new client creation
  const handleNewClientCreated = async (clientData: any) => {
    try {
      const newClient = await createClient(clientData)
      setShowNewClientForm(false)
      handleClientSelect(newClient)
    } catch (error) {
      // console.error('Error creating client:', error)
    }
  }

  // Universal field update function
  const updateField = (field: string, value: any) => {
    let updatedData = { ...stepData }
    
    // Handle nested field updates
    if (field.includes('.')) {
      const keys = field.split('.')
      let current = updatedData
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
    } else {
      updatedData[field] = value
    }
    
    // Apply phone number formatting
    if (field === 'primaryPhone' || field.includes('Phone')) {
      updatedData[field] = formatPhoneNumber(value)
    }
    if (field.includes('Extension')) {
      updatedData[field] = formatPhoneExtension(value)
    }
    
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  // Address handling - unified for both formats
  const handleAddressChange = (addressType: 'mailing' | 'loss', field: string, value: string) => {
    const addressKey = addressType === 'mailing' ? 'mailingAddress' : 'lossAddress'
    const streetAddressKey = addressType === 'mailing' ? 'streetAddress' : 'lossAddress'
    
    const updatedData = {
      ...stepData,
      [addressKey]: {
        ...stepData[addressKey],
        [field]: value
      },
      [streetAddressKey]: {
        ...stepData[streetAddressKey],
        [field === 'addressLine1' ? 'streetAddress1' : field === 'addressLine2' ? 'streetAddress2' : field]: value
      }
    }
    
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  // Address autocomplete handler
  const handleAddressAutocomplete = (address: string, details?: google.maps.places.PlaceResult, parsedAddress?: any) => {
    let addressData = {
      addressLine1: address,
      addressLine2: stepData.mailingAddress.addressLine2 || '',
      city: stepData.mailingAddress.city || '',
      state: stepData.mailingAddress.state || '',
      zipCode: stepData.mailingAddress.zipCode || '',
      address: address
    }

    if (parsedAddress) {
      addressData = {
        addressLine1: parsedAddress.addressLine1 || address,
        addressLine2: stepData.mailingAddress.addressLine2 || '',
        city: parsedAddress.city || stepData.mailingAddress.city || '',
        state: parsedAddress.state || stepData.mailingAddress.state || '',
        zipCode: parsedAddress.zipCode || stepData.mailingAddress.zipCode || '',
        address: address
      }
    }

    const updatedData = {
      ...stepData,
      mailingAddress: addressData,
      streetAddress: {
        streetAddress1: addressData.addressLine1,
        streetAddress2: addressData.addressLine2,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode
      }
    }
    
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  // Phone number management
  const handlePhoneNumberChange = (index: number, field: 'number' | 'type' | 'extension', value: string) => {
    const updatedPhoneNumbers = [...stepData.phoneNumbers]
    
    if (field === 'number') {
      updatedPhoneNumbers[index] = {
        ...updatedPhoneNumbers[index],
        [field]: formatPhoneNumber(value)
      }
    } else if (field === 'extension') {
      updatedPhoneNumbers[index] = {
        ...updatedPhoneNumbers[index],
        [field]: formatPhoneExtension(value)
      }
    } else {
      updatedPhoneNumbers[index] = {
        ...updatedPhoneNumbers[index],
        [field]: value
      }
    }
    
    const updatedData = {
      ...stepData,
      phoneNumbers: updatedPhoneNumbers,
      primaryPhone: updatedPhoneNumbers.find(p => p.isPrimary)?.number || '',
      phoneType: updatedPhoneNumbers.find(p => p.isPrimary)?.type || 'cell'
    }
    
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const addPhoneNumber = () => {
    const newPhone = {
      id: `phone_${Date.now()}`,
      type: 'Secondary',
      number: '',
      extension: '',
      isPrimary: false
    }
    
    const updatedData = {
      ...stepData,
      phoneNumbers: [...stepData.phoneNumbers, newPhone]
    }
    
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const removePhoneNumber = (index: number) => {
    if (stepData.phoneNumbers.length <= 1) return
    
    const phoneToRemove = stepData.phoneNumbers[index]
    const updatedPhoneNumbers = stepData.phoneNumbers.filter((_, i) => i !== index)
    
    if (phoneToRemove.isPrimary && updatedPhoneNumbers.length > 0) {
      updatedPhoneNumbers[0].isPrimary = true
    }
    
    const updatedData = {
      ...stepData,
      phoneNumbers: updatedPhoneNumbers,
      primaryPhone: updatedPhoneNumbers.find(p => p.isPrimary)?.number || '',
      phoneType: updatedPhoneNumbers.find(p => p.isPrimary)?.type || 'cell'
    }
    
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const setPrimaryPhone = (index: number) => {
    const updatedPhoneNumbers = stepData.phoneNumbers.map((phone, i) => ({
      ...phone,
      isPrimary: i === index
    }))
    
    const updatedData = {
      ...stepData,
      phoneNumbers: updatedPhoneNumbers,
      primaryPhone: updatedPhoneNumbers[index].number,
      phoneType: updatedPhoneNumbers[index].type
    }
    
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  // AI Validation Functions (only active in AI modes)
  const validateClientInfo = async () => {
    if (!enableAIFeatures || !data.extractedPolicyData) return

    setIsValidating(true)
    onAIProcessing?.(true)

    try {
      const clientValidation = await enhancedClaimWizardAI.validateClientInfo(
        stepData,
        data.extractedPolicyData
      )

      const addressValidation = await enhancedClaimWizardAI.validateLossAddress(
        stepData.mailingAddress.address || stepData.streetAddress.streetAddress1,
        data.extractedPolicyData
      )

      const suggestedCoInsured = await enhancedClaimWizardAI.suggestCoInsured(
        data.extractedPolicyData
      )

      setValidationResults({
        client: clientValidation,
        // address: addressValidation,
        // coInsured: suggestedCoInsured
      })
    } catch (error) {
      // console.error('Client validation failed:', error)
    } finally {
      setIsValidating(false)
      onAIProcessing?.(false)
    }
  }

  // Auto-populate from AI extracted data
  useEffect(() => {
    if (enableAIFeatures && data.extractedPolicyData?.validated && !autoPopulated) {
      setAutoPopulated(true)
      
      if (data.policyDetails?.insuredName && !stepData.firstName && !stepData.organizationName) {
        const name = data.policyDetails.insuredName
        if (name.includes('LLC') || name.includes('Inc') || name.includes('Corp')) {
          updateField('isOrganization', true)
          updateField('organizationName', name)
          updateField('aiSuggested', true)
          updateField('confidenceScore', data.extractedPolicyData?.confidence || 0)
        } else {
          const nameParts = name.split(' ')
          updateField('firstName', nameParts[0] || '')
          updateField('lastName', nameParts.slice(1).join(' ') || '')
          updateField('aiSuggested', true)
          updateField('confidenceScore', data.extractedPolicyData?.confidence || 0)
        }
      }
      
      if (data.policyDetails?.propertyAddress && !stepData.mailingAddress.address) {
        handleAddressAutocomplete(data.policyDetails.propertyAddress)
        updateField('aiSuggested', true)
      }
    }
  }, [data.extractedPolicyData, data.policyDetails, enableAIFeatures, autoPopulated])

  // Auto-validate when key data changes (AI modes only)
  useEffect(() => {
    if (enableValidation && data.extractedPolicyData && (stepData.organizationName || stepData.mailingAddress.address)) {
      validateClientInfo()
    }
  }, [stepData.organizationName, stepData.mailingAddress.address, data.extractedPolicyData, enableValidation])

  // Sync with parent data changes
  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(stepData)) {
      setStepData(prev => ({ ...prev, ...data }))
    }
  }, [data])

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

  const ValidationAlert: React.FC<{ validation: AIValidation }> = ({ validation }) => (
    <div className={`p-3 rounded-lg border ${
      validation.severity === 'error' ? 'bg-red-50 border-red-200' :
      validation.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
      'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        {validation.severity === 'error' ? (
          <AlertTriangle className="h-4 w-4 text-red-600" />
        ) : validation.severity === 'warning' ? (
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-600" />
        )}
        <span className={`text-sm font-medium ${
          validation.severity === 'error' ? 'text-red-800' :
          validation.severity === 'warning' ? 'text-yellow-800' :
          'text-green-800'
        }`}>
          AI Validation
        </span>
      </div>
      <p className={`text-sm ${
        validation.severity === 'error' ? 'text-red-700' :
        validation.severity === 'warning' ? 'text-yellow-700' :
        'text-green-700'
      }`}>
        {validation.message}
      </p>
      {validation.suggestions && validation.suggestions.length > 0 && (
        <ul className={`mt-2 text-sm ${
          validation.severity === 'error' ? 'text-red-600' :
          validation.severity === 'warning' ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {validation.suggestions.map((suggestion, idx) => (
            <li key={idx}>• {suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* AI Auto-Population Notice */}
      {enableAIFeatures && autoPopulated && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">AI-Extracted from Policy Document</span>
              {data.extractedPolicyData?.confidence && (
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                  {Math.round(data.extractedPolicyData.confidence * 100)}% confidence
                </span>
              )}
            </div>
            <p className="text-sm text-green-700">
              Client information has been intelligently extracted from your policy document. 
              Fields marked with <Brain className="h-3 w-3 inline text-green-600" /> are AI-suggested. Please review and confirm.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Client Selection - Show only if enabled */}
      {showClientSelector && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Search for an existing client or create a new one for this claim.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewClientForm(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Create New Client
                </Button>
              </div>
              
              <ClientSelector
                value={stepData.selectedExistingClientId}
                onSelect={handleClientSelect}
                placeholder="Search existing clients by name, email, or phone..."
                className="w-full"
                showCreateNew={true}
                onCreateNew={() => setShowNewClientForm(true)}
              />
              
              {stepData.selectedExistingClient && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Client Selected</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    This claim will be associated with the selected client. All existing client information will be used.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Type Selection - Only show when creating new clients */}
      {(!showClientSelector || !stepData.selectedExistingClient) && (
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
                  checked={stepData.clientType === 'individual' && !stepData.isOrganization}
                  onChange={(e) => {
                    updateField('clientType', e.target.value)
                    updateField('isOrganization', false)
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">Individual/Residential</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="clientType"
                  value="business"
                  checked={stepData.clientType === 'business' || stepData.isOrganization}
                  onChange={(e) => {
                    updateField('clientType', e.target.value)
                    updateField('isOrganization', true)
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">Business/Commercial</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Details - Only show when creating new clients or in manual mode */}
      {(!showClientSelector || !stepData.selectedExistingClient) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stepData.clientType === 'business' || stepData.isOrganization ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
              {stepData.clientType === 'business' || stepData.isOrganization ? 'Business Information' : 'Individual Information'}
              {enableAIFeatures && stepData.aiSuggested && (
                <Brain className="h-4 w-4 text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stepData.clientType === 'individual' && !stepData.isOrganization ? (
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
                    Business/Organization Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={stepData.businessName || stepData.organizationName}
                    onChange={(e) => {
                      updateField('businessName', e.target.value)
                      updateField('organizationName', e.target.value)
                    }}
                    placeholder="Business or organization name"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Point of Contact - First Name
                    </label>
                    <Input
                      type="text"
                      value={stepData.pointOfContactFirstName}
                      onChange={(e) => updateField('pointOfContactFirstName', e.target.value)}
                      placeholder="Contact first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Point of Contact - Last Name
                    </label>
                    <Input
                      type="text"
                      value={stepData.pointOfContactLastName}
                      onChange={(e) => updateField('pointOfContactLastName', e.target.value)}
                      placeholder="Contact last name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  value={stepData.primaryEmail}
                  onChange={(e) => updateField('primaryEmail', e.target.value)}
                  placeholder="primary@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phone Numbers */}
      {(!showClientSelector || !stepData.selectedExistingClient) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Phone Numbers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stepData.phoneNumbers.map((phone, index) => (
              <div key={phone.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Type
                    </label>
                    <select
                      value={phone.type}
                      onChange={(e) => handlePhoneNumberChange(index, 'type', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Fax">Fax</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={phone.number}
                      onChange={(e) => handlePhoneNumberChange(index, 'number', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Extension
                    </label>
                    <Input
                      type="text"
                      value={phone.extension}
                      onChange={(e) => handlePhoneNumberChange(index, 'extension', e.target.value)}
                      placeholder="ext. 123"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {phone.isPrimary && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                  {!phone.isPrimary && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPrimaryPhone(index)}
                    >
                      Set Primary
                    </Button>
                  )}
                  {stepData.phoneNumbers.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removePhoneNumber(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addPhoneNumber}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Phone Number
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mailing Address */}
      {(!showClientSelector || !stepData.selectedExistingClient) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Mailing Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <AddressAutocomplete
                value={stepData.mailingAddress.addressLine1 || stepData.mailingAddress.address || ''}
                onChange={handleAddressAutocomplete}
                placeholder="Enter address"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <Input
                type="text"
                value={stepData.mailingAddress.addressLine2}
                onChange={(e) => handleAddressChange('mailing', 'addressLine2', e.target.value)}
                placeholder="Apartment, suite, etc."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={stepData.mailingAddress.city}
                  onChange={(e) => handleAddressChange('mailing', 'city', e.target.value)}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={stepData.mailingAddress.state}
                  onChange={(e) => handleAddressChange('mailing', 'state', e.target.value)}
                  placeholder="State"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={stepData.mailingAddress.zipCode}
                  onChange={(e) => handleAddressChange('mailing', 'zipCode', e.target.value)}
                  placeholder="ZIP Code"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coinsured Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Coinsured Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={stepData.hasCoinsured}
              onCheckedChange={(checked) => updateField('hasCoinsured', checked)}
            />
            <label className="text-sm font-medium text-gray-700">
              This claim has a coinsured party
            </label>
          </div>
          
          {stepData.hasCoinsured && (
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coinsured First Name
                  </label>
                  <Input
                    type="text"
                    value={stepData.coinsuredFirstName}
                    onChange={(e) => updateField('coinsuredFirstName', e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coinsured Last Name
                  </label>
                  <Input
                    type="text"
                    value={stepData.coinsuredLastName}
                    onChange={(e) => updateField('coinsuredLastName', e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship to Primary Insured
                </label>
                <select
                  value={stepData.relationshipToPrimary}
                  onChange={(e) => updateField('relationshipToPrimary', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select relationship</option>
                  {relationshipOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coinsured Email
                  </label>
                  <Input
                    type="email"
                    value={stepData.coinsuredEmail}
                    onChange={(e) => updateField('coinsuredEmail', e.target.value)}
                    placeholder="coinsured@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coinsured Phone
                  </label>
                  <Input
                    type="tel"
                    value={stepData.coinsuredPhone}
                    onChange={(e) => updateField('coinsuredPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Validation Results */}
      {enableValidation && isValidating && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600">AI is validating client information...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {enableValidation && validationResults.client && (
        <ValidationAlert validation={validationResults.client} />
      )}

      {enableValidation && validationResults.address && (
        <ValidationAlert validation={validationResults.address} />
      )}

      {enableValidation && validationResults.coInsured.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">AI Coinsured Suggestions</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              {validationResults.coInsured.map((suggestion, idx) => (
                <li key={idx}>• {suggestion}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}