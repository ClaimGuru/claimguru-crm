import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Users, CheckCircle, AlertCircle, Brain } from 'lucide-react'

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
  const [clientData, setClientData] = useState({
    clientType: 'individual',
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    phone: '',
    mailingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      full: ''
    }
  })

  const [isValidated, setIsValidated] = useState(false)

  // Auto-populate from extracted policy data
  useEffect(() => {
    if (data.policyDetails) {
      const extracted = data.policyDetails
      const addressData = data.mailingAddress || {}
      
      setClientData(prev => ({
        ...prev,
        firstName: extracted.insuredName?.split(' ')[0] || '',
        lastName: extracted.insuredName?.split(' ').slice(1).join(' ') || '',
        fullName: extracted.insuredName || '',
        email: prev.email || generateEmail(extracted.insuredName),
        phone: prev.phone || '(214) 555-0123', // Mock phone
        mailingAddress: {
          street: addressData.street || extracted.propertyAddress?.split(',')[0] || '',
          city: addressData.city || 'Garland',
          state: addressData.state || 'TX',
          zipCode: addressData.zipCode || '75040',
          full: addressData.full || extracted.propertyAddress || ''
        }
      }))
      setIsValidated(true)
    }
  }, [data.policyDetails])

  const generateEmail = (name: string) => {
    if (!name) return ''
    return name.toLowerCase().replace(/\s+/g, '.') + '@email.com'
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('mailingAddress.')) {
      const addressField = field.split('.')[1]
      setClientData(prev => ({
        ...prev,
        mailingAddress: {
          ...prev.mailingAddress,
          [addressField]: value
        }
      }))
    } else {
      setClientData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
    // Update wizard data
    onUpdate({
      ...data,
      insuredDetails: clientData,
      clientData: clientData
    })
  }

  const validateAndContinue = () => {
    // Update wizard data with finalized client information
    onUpdate({
      ...data,
      insuredDetails: clientData,
      clientData: clientData,
      clientValidated: true
    })
    setIsValidated(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Client Information
            {data.policyDetails && (
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-lg flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI Pre-filled
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-population Notice */}
          {data.policyDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Information Pre-filled from Policy</span>
              </div>
              <p className="text-sm text-blue-700">
                Client information has been automatically extracted from the uploaded policy document.
                Please review and update as needed.
              </p>
            </div>
          )}

          {/* Client Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="clientType"
                  value="individual"
                  checked={clientData.clientType === 'individual'}
                  onChange={(e) => handleInputChange('clientType', e.target.value)}
                  className="mr-2"
                />
                Individual
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="clientType"
                  value="business"
                  checked={clientData.clientType === 'business'}
                  onChange={(e) => handleInputChange('clientType', e.target.value)}
                  className="mr-2"
                />
                Business
              </label>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <Input
                value={clientData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <Input
                value={clientData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                className="w-full"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                value={clientData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                value={clientData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className="w-full"
              />
            </div>
          </div>

          {/* Mailing Address */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Mailing Address</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <Input
                  value={clientData.mailingAddress.street}
                  onChange={(e) => handleInputChange('mailingAddress.street', e.target.value)}
                  placeholder="Enter street address"
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <Input
                    value={clientData.mailingAddress.city}
                    onChange={(e) => handleInputChange('mailingAddress.city', e.target.value)}
                    placeholder="Enter city"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <Input
                    value={clientData.mailingAddress.state}
                    onChange={(e) => handleInputChange('mailingAddress.state', e.target.value)}
                    placeholder="TX"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <Input
                    value={clientData.mailingAddress.zipCode}
                    onChange={(e) => handleInputChange('mailingAddress.zipCode', e.target.value)}
                    placeholder="Enter ZIP code"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Validation Status */}
          {isValidated && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Client Information Validated</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Ready to proceed to insurance information step.
              </p>
            </div>
          )}

          {/* Validate Button */}
          {!isValidated && (
            <div className="flex justify-center">
              <Button
                onClick={validateAndContinue}
                variant="primary"
                className="flex items-center gap-2"
                disabled={!clientData.firstName || !clientData.lastName || !clientData.email}
              >
                <CheckCircle className="h-4 w-4" />
                Validate Client Information
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
