import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { AddressAutocomplete } from '../../ui/AddressAutocomplete'
import { formatPhoneNumber, getPhoneInputProps, formatPhoneExtension, getPhoneExtensionInputProps, combinePhoneWithExtension } from '../../../utils/phoneUtils'
import { User, Building, MapPin, AlertTriangle, CheckCircle, Brain, Users } from 'lucide-react'
import { enhancedClaimWizardAI, AIValidation } from '../../../services/enhancedClaimWizardAI'

interface EnhancedClientDetailsStepProps {
  data: any
  onUpdate: (data: any) => void
  onAIProcessing?: (isProcessing: boolean) => void
}

export const EnhancedClientDetailsStep: React.FC<EnhancedClientDetailsStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [clientType, setClientType] = useState(data.clientType || 'residential')
  const [isOrganization, setIsOrganization] = useState(data.isOrganization || false)
  const [insuredDetails, setInsuredDetails] = useState(data.insuredDetails || {})
  const [mailingAddress, setMailingAddress] = useState(data.mailingAddress || {})
  const [lossAddress, setLossAddress] = useState(data.lossAddress || {})
  const [addressSameAsMailing, setAddressSameAsMailing] = useState(true)
  const [hasCoInsured, setHasCoInsured] = useState(false)
  const [coInsuredDetails, setCoInsuredDetails] = useState<{name?: string, relationship?: string}>({})
  const [hasGateCode, setHasGateCode] = useState(false)
  const [isTenantOccupied, setIsTenantOccupied] = useState(false)
  const [hasUninsuredParty, setHasUninsuredParty] = useState(false)

  // AI Validation States
  const [validationResults, setValidationResults] = useState<{
    client: AIValidation | null
    address: AIValidation | null
    coInsured: string[]
  }>({
    client: null,
    address: null,
    coInsured: []
  })
  const [isValidating, setIsValidating] = useState(false)
  const [autoPopulated, setAutoPopulated] = useState(false)

  // Check if data was auto-populated from policy extraction
  useEffect(() => {
    if (data.extractedPolicyData?.validated) {
      setAutoPopulated(true)
      
      // Auto-populate fields from extracted policy data
      if (data.policyDetails?.insuredName && !insuredDetails.firstName && !insuredDetails.organizationName) {
        const name = data.policyDetails.insuredName
        if (name.includes('LLC') || name.includes('Inc') || name.includes('Corp')) {
          setIsOrganization(true)
          setInsuredDetails(prev => ({
            ...prev,
            organizationName: name,
            aiSuggested: true,
            confidenceScore: data.extractedPolicyData?.confidence || 0
          }))
        } else {
          const nameParts = name.split(' ')
          setInsuredDetails(prev => ({
            ...prev,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            aiSuggested: true,
            confidenceScore: data.extractedPolicyData?.confidence || 0
          }))
        }
      }
      
      // Auto-populate address from policy
      if (data.policyDetails?.propertyAddress && !mailingAddress.address) {
        setMailingAddress(prev => ({
          ...prev,
          address: data.policyDetails.propertyAddress,
          aiSuggested: true
        }))
      }
    }
  }, [data.extractedPolicyData, data.policyDetails])

  // Update parent data whenever local state changes
  useEffect(() => {
    onUpdate({
      ...data,
      clientType,
      isOrganization,
      insuredDetails,
      mailingAddress,
      lossAddress: addressSameAsMailing ? mailingAddress : lossAddress,
      coInsuredDetails: hasCoInsured ? coInsuredDetails : {},
      tenantDetails: isTenantOccupied ? data.tenantDetails : {},
      uninsuredPartyDetails: hasUninsuredParty ? data.uninsuredPartyDetails : {}
    })
  }, [
    clientType, isOrganization, insuredDetails, mailingAddress, lossAddress,
    addressSameAsMailing, coInsuredDetails, hasCoInsured, isTenantOccupied, hasUninsuredParty
  ])

  // AI Validation Functions
  const validateClientInfo = async () => {
    if (!data.extractedPolicyData) return

    setIsValidating(true)
    onAIProcessing?.(true)

    try {
      const clientValidation = await enhancedClaimWizardAI.validateClientInfo(
        insuredDetails,
        data.extractedPolicyData
      )

      const addressValidation = await enhancedClaimWizardAI.validateLossAddress(
        addressSameAsMailing ? mailingAddress.address : lossAddress.address,
        data.extractedPolicyData
      )

      const suggestedCoInsured = await enhancedClaimWizardAI.suggestCoInsured(
        data.extractedPolicyData
      )

      setValidationResults({
        client: clientValidation,
        address: addressValidation,
        coInsured: suggestedCoInsured
      })
    } catch (error) {
      console.error('Client validation failed:', error)
    } finally {
      setIsValidating(false)
      onAIProcessing?.(false)
    }
  }

  // Auto-validate when key data changes
  useEffect(() => {
    if (data.extractedPolicyData && (insuredDetails.organizationName || mailingAddress.address)) {
      validateClientInfo()
    }
  }, [insuredDetails.organizationName, mailingAddress.address, data.extractedPolicyData])

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
      {autoPopulated && (
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

      {/* Additional Documents Insights */}
      {data.aiSuggestions?.insights && data.aiSuggestions.insights.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">AI Document Insights</span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              {data.aiSuggestions.insights.slice(0, 3).map((insight, index) => (
                <p key={index}>• {insight}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Validation Header */}
      {data.extractedPolicyData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">AI-Powered Validation Active</span>
              </div>
              {isValidating && <LoadingSpinner size="sm" />}
            </div>
            <p className="text-sm text-blue-600 mt-1">
              AI cross-referencing inputs with uploaded policy document
            </p>
          </CardContent>
        </Card>
      )}

      {/* Client Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Client Type & Policyholder Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Client Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="residential"
                  checked={clientType === 'residential'}
                  onChange={(e) => setClientType(e.target.value)}
                  className="form-radio"
                />
                <span>Residential</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="commercial"
                  checked={clientType === 'commercial'}
                  onChange={(e) => setClientType(e.target.value)}
                  className="form-radio"
                />
                <span>Commercial</span>
              </label>
            </div>
          </div>

          {/* Policyholder Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Policyholder Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="individual"
                  checked={!isOrganization}
                  onChange={() => setIsOrganization(false)}
                  className="form-radio"
                />
                <span>Individual</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="organization"
                  checked={isOrganization}
                  onChange={() => setIsOrganization(true)}
                  className="form-radio"
                />
                <span>Organization</span>
              </label>
            </div>
          </div>

          {/* Organization Details */}
          {isOrganization ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  Organization Name
                  {insuredDetails.aiSuggested && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Brain className="h-3 w-3" />
                      AI-suggested
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={insuredDetails.organizationName || ''}
                    onChange={(e) => setInsuredDetails({
                      ...insuredDetails,
                      organizationName: e.target.value,
                      aiSuggested: false // Clear AI flag when manually edited
                    })}
                    className={`w-full p-2 border rounded-lg ${
                      insuredDetails.aiSuggested ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter organization name"
                  />
                  {insuredDetails.confidenceScore && (
                    <div className="absolute right-2 top-2 text-xs text-gray-500">
                      {Math.round(insuredDetails.confidenceScore * 100)}%
                    </div>
                  )}
                </div>
                {/* AI Validation for Organization Name */}
                {validationResults.client && (
                  <div className="mt-2">
                    <ValidationAlert validation={validationResults.client} />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Point of Contact Name</label>
                  <input
                    type="text"
                    value={insuredDetails.contactName || ''}
                    onChange={(e) => setInsuredDetails({
                      ...insuredDetails,
                      contactName: e.target.value
                    })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Contact person name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={insuredDetails.contactTitle || ''}
                    onChange={(e) => setInsuredDetails({
                      ...insuredDetails,
                      contactTitle: e.target.value
                    })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Job title"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Individual Details */
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  First Name
                  {insuredDetails.aiSuggested && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Brain className="h-3 w-3" />
                      AI-suggested
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={insuredDetails.firstName || ''}
                  onChange={(e) => setInsuredDetails({
                    ...insuredDetails,
                    firstName: e.target.value,
                    aiSuggested: false
                  })}
                  className={`w-full p-2 border rounded-lg ${
                    insuredDetails.aiSuggested ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  Last Name
                  {insuredDetails.aiSuggested && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Brain className="h-3 w-3" />
                      AI-suggested
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={insuredDetails.lastName || ''}
                  onChange={(e) => setInsuredDetails({
                    ...insuredDetails,
                    lastName: e.target.value,
                    aiSuggested: false
                  })}
                  className={`w-full p-2 border rounded-lg ${
                    insuredDetails.aiSuggested ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="Last name"
                />
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <div className="flex gap-2">
                  <Input
                    {...getPhoneInputProps()}
                    value={insuredDetails.phone || ''}
                    onChange={(e) => setInsuredDetails({
                      ...insuredDetails,
                      phone: formatPhoneNumber(e.target.value)
                    })}
                    className="flex-1"
                  />
                  <Input
                    {...getPhoneExtensionInputProps()}
                    value={insuredDetails.phoneExtension || ''}
                    onChange={(e) => setInsuredDetails({
                      ...insuredDetails,
                      phoneExtension: formatPhoneExtension(e.target.value)
                    })}
                    className="w-20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={insuredDetails.email || ''}
                  onChange={(e) => setInsuredDetails({
                    ...insuredDetails,
                    email: e.target.value
                  })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Co-Insured Toggle */}
          {!isOrganization && (
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasCoInsured}
                  onChange={(e) => setHasCoInsured(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="text-sm font-medium">Co-Insured</span>
              </label>

              {/* AI Co-Insured Suggestions */}
              {validationResults.coInsured.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <strong className="text-blue-800">AI Suggestion</strong>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">
                    Policy references co-insured: {validationResults.coInsured.join(', ')}
                  </p>
                  <Button
                    onClick={() => {
                      setHasCoInsured(true)
                      setCoInsuredDetails({
                        name: validationResults.coInsured[0]
                      })
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Add Co-Insured
                  </Button>
                </div>
              )}

              {hasCoInsured && (
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                  <div>
                    <label className="block text-sm font-medium mb-1">Co-Insured Name</label>
                    <input
                      type="text"
                      value={coInsuredDetails.name || ''}
                      onChange={(e) => setCoInsuredDetails({
                        ...coInsuredDetails,
                        name: e.target.value
                      })}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Co-insured name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Relationship</label>
                    <select
                      value={coInsuredDetails.relationship || ''}
                      onChange={(e) => setCoInsuredDetails({
                        ...coInsuredDetails,
                        relationship: e.target.value
                      })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Select relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="partner">Partner</option>
                      <option value="business_partner">Business Partner</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
            {mailingAddress.aiSuggested && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Brain className="h-4 w-4" />
                AI-extracted from policy
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mailing Address */}
          <div>
            <AddressAutocomplete
              value={mailingAddress.address || ''}
              onChange={(address, details) => {
                setMailingAddress({
                  ...mailingAddress,
                  address,
                  placeDetails: details
                })
              }}
              label="Mailing Address"
              placeholder="Start typing address for autocomplete..."
              required
            />
          </div>

          {/* Loss Address Same as Mailing */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={addressSameAsMailing}
                onChange={(e) => setAddressSameAsMailing(e.target.checked)}
                className="form-checkbox"
              />
              <span className="text-sm font-medium">Loss address same as mailing address</span>
            </label>

            {!addressSameAsMailing && (
              <div>
                <AddressAutocomplete
                  value={lossAddress.address || ''}
                  onChange={(address, details) => {
                    setLossAddress({
                      ...lossAddress,
                      address,
                      placeDetails: details
                    })
                  }}
                  label="Loss Address"
                  placeholder="Enter loss address for property damage"
                  required
                />
                {/* AI Address Validation */}
                {validationResults.address && (
                  <div className="mt-2">
                    <ValidationAlert validation={validationResults.address} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Additional Address Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={hasGateCode}
                  onChange={(e) => setHasGateCode(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="text-sm font-medium">Gate/Dropbox Code Required</span>
              </label>
              {hasGateCode && (
                <input
                  type="text"
                  value={mailingAddress.gateCode || ''}
                  onChange={(e) => setMailingAddress({
                    ...mailingAddress,
                    gateCode: e.target.value
                  })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter gate/dropbox code"
                />
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={isTenantOccupied}
                  onChange={(e) => setIsTenantOccupied(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="text-sm font-medium">Tenant Occupied</span>
              </label>
              {isTenantOccupied && (
                <input
                  type="text"
                  value={data.tenantDetails?.name || ''}
                  onChange={(e) => onUpdate({
                    ...data,
                    tenantDetails: {
                      ...data.tenantDetails,
                      name: e.target.value
                    }
                  })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Tenant contact information"
                />
              )}
            </div>
          </div>

          {/* Uninsured Party */}
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={hasUninsuredParty}
                onChange={(e) => setHasUninsuredParty(e.target.checked)}
                className="form-checkbox"
              />
              <span className="text-sm font-medium">Uninsured Party Involved</span>
            </label>
            {hasUninsuredParty && (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <input
                  type="text"
                  value={data.uninsuredPartyDetails?.name || ''}
                  onChange={(e) => onUpdate({
                    ...data,
                    uninsuredPartyDetails: {
                      ...data.uninsuredPartyDetails,
                      name: e.target.value
                    }
                  })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Uninsured party name"
                />
                <input
                  type="tel"
                  value={data.uninsuredPartyDetails?.phone || ''}
                  onChange={(e) => onUpdate({
                    ...data,
                    uninsuredPartyDetails: {
                      ...data.uninsuredPartyDetails,
                      phone: e.target.value
                    }
                  })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Contact phone"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
