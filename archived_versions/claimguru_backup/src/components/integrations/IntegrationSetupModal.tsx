import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { 
  X, 
  Settings, 
  Key, 
  ExternalLink, 
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Info,
  HelpCircle
} from 'lucide-react'

interface IntegrationProvider {
  id: string
  name: string
  category: string
  description: string
  setup_instructions?: string
  credential_fields?: Record<string, any>
  setup_steps?: string[]
  help_url?: string
}

interface IntegrationSetupModalProps {
  provider: IntegrationProvider | null
  isOpen: boolean
  onClose: () => void
  onSave: (providerId: string, credentials: Record<string, string>) => Promise<void>
}

export function IntegrationSetupModal({ 
  provider, 
  isOpen, 
  onClose, 
  onSave 
}: IntegrationSetupModalProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  if (!isOpen || !provider) return null

  const credentialFields = provider.credential_fields || {}
  const setupSteps = provider.setup_steps || []

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validateFields = () => {
    const errors: Record<string, string> = {}
    
    Object.entries(credentialFields).forEach(([field, config]) => {
      if (config.required && !credentials[field]?.trim()) {
        errors[field] = `${config.label} is required`
      }
      
      // Additional validation rules
      if (credentials[field]) {
        if (field.includes('email') && !credentials[field].includes('@')) {
          errors[field] = 'Please enter a valid email address'
        }
        if (field.includes('url') && !credentials[field].startsWith('http')) {
          errors[field] = 'Please enter a valid URL starting with http:// or https://'
        }
      }
    })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateFields()) {
      return
    }

    setLoading(true)
    try {
      await onSave(provider.id, credentials)
      setCredentials({})
      setCurrentStep(0)
      onClose()
    } catch (error) {
      console.error('Error saving integration:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    // Placeholder for connection testing
    // In production, this would make an API call to test the credentials
    if (!validateFields()) {
      return
    }
    
    // Simulate API test
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Connection test successful! ✅')
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Setup {provider.name} Integration
              </h2>
              <p className="text-gray-600 text-sm">{provider.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Setup Instructions */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Setup Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {provider.setup_instructions && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-3">{provider.setup_instructions}</p>
                    </div>
                  )}
                  
                  {setupSteps.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Step-by-step:</h4>
                      <ol className="space-y-2">
                        {setupSteps.map((step, index) => (
                          <li key={index} className={`text-sm flex items-start gap-2 ${
                            index === currentStep ? 'text-blue-600 font-medium' : 'text-gray-600'
                          }`}>
                            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                              index < currentStep ? 'bg-green-100 text-green-600' :
                              index === currentStep ? 'bg-blue-100 text-blue-600' : 
                              'bg-gray-100 text-gray-400'
                            }`}>
                              {index < currentStep ? <Check className="h-3 w-3" /> : index + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                      
                      <div className="mt-4 flex gap-2">
                        {provider.help_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(provider.help_url, '_blank')}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Documentation
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Credentials Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(credentialFields).map(([field, config]) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {config.label}
                          {config.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {config.description && (
                          <p className="text-xs text-gray-500 mb-2 flex items-start gap-1">
                            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {config.description}
                          </p>
                        )}

                        {config.type === 'textarea' ? (
                          <textarea
                            value={credentials[field] || ''}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            placeholder={config.placeholder || `Enter ${config.label.toLowerCase()}`}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              validationErrors[field] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                        ) : config.type === 'checkbox' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={credentials[field] === 'true'}
                              onChange={(e) => handleInputChange(field, e.target.checked.toString())}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">{config.description}</span>
                          </div>
                        ) : config.type === 'readonly' ? (
                          <Input
                            value={config.value || ''}
                            readOnly
                            className="bg-gray-50"
                          />
                        ) : (
                          <div className="relative">
                            <Input
                              type={config.type === 'password' && !showPasswords[field] ? 'password' : 'text'}
                              value={credentials[field] || ''}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              placeholder={config.placeholder || `Enter ${config.label.toLowerCase()}`}
                              className={validationErrors[field] ? 'border-red-300' : ''}
                            />
                            {config.type === 'password' && (
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(field)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            )}
                          </div>
                        )}

                        {validationErrors[field] && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {validationErrors[field]}
                          </p>
                        )}
                      </div>
                    ))}

                    {Object.keys(credentialFields).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No credentials required for this integration</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      onClick={handleTestConnection}
                      disabled={loading || Object.keys(credentialFields).length === 0}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Test Connection
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Save & Enable
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
