import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { StandardizedPhoneInput } from '../../ui/StandardizedPhoneInput'
import { Users, Search, Plus, Globe, Calendar } from 'lucide-react'

interface ReferralSourceInformationStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function ReferralSourceInformationStep({ data, onUpdate }: ReferralSourceInformationStepProps) {
  const [stepData, setStepData] = useState({
    referralType: data.referralType || '',
    selectedReferralId: data.selectedReferralId || '',
    
    // New Referral Source Details
    referralSourceName: data.referralSourceName || '',
    relationship: data.relationship || '',
    referralDate: data.referralDate || '',
    website: data.website || '',
    phoneNumbers: data.phoneNumbers || [{
      id: 'referral_primary',
      type: 'office',
      number: '',
      extension: '',
      isPrimary: true
    }],
    emailAddress: data.emailAddress || '',
    additionalNotes: data.additionalNotes || ''
  })

  const [showNewReferralForm, setShowNewReferralForm] = useState(false)
  const [availableReferrals] = useState({
    vendors: [
      { id: 'v1', name: 'ABC Restoration', type: 'Vendor', relationship: 'Preferred Partner' },
      { id: 'v2', name: 'Quick Fix Contractors', type: 'Vendor', relationship: 'Business Partner' },
      { id: 'v3', name: 'Elite Roofing Services', type: 'Vendor', relationship: 'Referral Partner' }
    ],
    clients: [
      { id: 'c1', name: 'John Smith', type: 'Client', relationship: 'Previous Client' },
      { id: 'c2', name: 'ABC Manufacturing Inc.', type: 'Client', relationship: 'Corporate Client' },
      { id: 'c3', name: 'Mary Johnson', type: 'Client', relationship: 'Previous Client' }
    ],
    individuals: [
      { id: 'i1', name: 'Robert Davis', type: 'Individual', relationship: 'Attorney' },
      { id: 'i2', name: 'Susan Williams', type: 'Individual', relationship: 'Insurance Agent' },
      { id: 'i3', name: 'Michael Brown', type: 'Individual', relationship: 'Friend/Family' }
    ]
  })

  const updateField = (field: string, value: any) => {
    const updatedData = { ...stepData, [field]: value }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const handleReferralTypeChange = (type: string) => {
    const updatedData = {
      ...stepData,
      referralType: type,
      selectedReferralId: '',
      referralSourceName: '',
      relationship: '',
      website: '',
      emailAddress: '',
      additionalNotes: ''
    }
    setStepData(updatedData)
    onUpdate(updatedData)
    setShowNewReferralForm(false)
  }

  const selectExistingReferral = (referral: any) => {
    const updatedData = {
      ...stepData,
      selectedReferralId: referral.id,
      referralSourceName: referral.name,
      relationship: referral.relationship
    }
    setStepData(updatedData)
    onUpdate(updatedData)
    setShowNewReferralForm(false)
  }

  const addNewReferral = () => {
    setShowNewReferralForm(true)
    updateField('selectedReferralId', 'new')
  }

  const referralTypes = [
    'Social Media',
    'Vendor',
    'Client',
    'Individual',
    'Advertisement',
    'Website',
    'Google Search',
    'Yellow Pages',
    'Word of Mouth',
    'Professional Network',
    'Trade Association',
    'Other'
  ]

  const relationshipTypes = [
    'Preferred Partner',
    'Business Partner',
    'Referral Partner',
    'Previous Client',
    'Corporate Client',
    'Attorney',
    'Insurance Agent',
    'Real Estate Agent',
    'Contractor',
    'Public Adjuster',
    'Friend/Family',
    'Professional Contact',
    'Other'
  ]

  const getCurrentReferralList = () => {
    switch (stepData.referralType) {
      case 'Vendor':
        return availableReferrals.vendors
      case 'Client':
        return availableReferrals.clients
      case 'Individual':
        return availableReferrals.individuals
      default:
        return []
    }
  }

  const shouldShowReferralSelection = ['Vendor', 'Client', 'Individual'].includes(stepData.referralType)

  return (
    <div className="space-y-6">
      {/* Referral Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Referral Source Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Type <span className="text-red-500">*</span>
            </label>
            <select
              value={stepData.referralType}
              onChange={(e) => handleReferralTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select referral type</option>
              {referralTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Referral Selection or Form */}
      {stepData.referralType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Referral Details</span>
              {shouldShowReferralSelection && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewReferralForm(false)}
                    className={!showNewReferralForm ? 'bg-blue-50 border-blue-300' : ''}
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Select Existing
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewReferral}
                    className={showNewReferralForm ? 'bg-blue-50 border-blue-300' : ''}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add New
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shouldShowReferralSelection && !showNewReferralForm ? (
              /* Existing Referral Selection */
              <div className="space-y-3">
                {getCurrentReferralList().map(referral => (
                  <div
                    key={referral.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      stepData.selectedReferralId === referral.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectExistingReferral(referral)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{referral.name}</h4>
                        <p className="text-sm text-gray-600">{referral.type} • {referral.relationship}</p>
                      </div>
                      {stepData.selectedReferralId === referral.id && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* New Referral Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referral Source Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={stepData.referralSourceName}
                    onChange={(e) => updateField('referralSourceName', e.target.value)}
                    placeholder="Enter referral source name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <select
                    value={stepData.relationship}
                    onChange={(e) => updateField('relationship', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select relationship</option>
                    {relationshipTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referral Date
                  </label>
                  <Input
                    type="date"
                    value={stepData.referralDate}
                    onChange={(e) => updateField('referralDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <Input
                    type="url"
                    value={stepData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://www.example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <StandardizedPhoneInput
                      phoneNumbers={stepData.phoneNumbers}
                      onChange={(phoneNumbers) => updateField('phoneNumbers', phoneNumbers)}
                      label="Phone Number"
                      allowMultiple={false}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={stepData.emailAddress}
                      onChange={(e) => updateField('emailAddress', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={stepData.additionalNotes}
                    onChange={(e) => updateField('additionalNotes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional information about this referral source..."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ReferralSourceInformationStep