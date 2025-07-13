import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Edit, 
  Eye, 
  AlertTriangle, 
  Brain,
  Shuffle,
  Trash2,
  FileText,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Shield,
  Settings,
  Info
} from 'lucide-react'
import { PolicyExtractionResult } from '../../../services/enhancedClaimWizardAI'

interface ExtractedField {
  id: string
  label: string
  value: any
  confidence: number
  source: string // Where it was found in the document
  targetField: string // Which CRM field it maps to
  status: 'pending' | 'accepted' | 'rejected' | 'ignored' | 'remapped'
  category: 'policy_info' | 'insured_details' | 'coverage' | 'dates' | 'financial' | 'other'
  isRequired: boolean
  suggestions?: string[] // Alternative field mappings
}

interface PolicyExtractionValidationStepProps {
  data: any
  onUpdate: (data: any) => void
  extractionResult: PolicyExtractionResult
  onValidationComplete: (validatedData: any) => void
  onBack: () => void
}

export const PolicyExtractionValidationStep: React.FC<PolicyExtractionValidationStepProps> = ({
  data,
  onUpdate,
  extractionResult,
  onValidationComplete,
  onBack
}) => {
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([])
  const [selectedField, setSelectedField] = useState<ExtractedField | null>(null)
  const [showMappingModal, setShowMappingModal] = useState(false)
  const [validationSummary, setValidationSummary] = useState({
    total: 0,
    accepted: 0,
    rejected: 0,
    remapped: 0,
    ignored: 0,
    pending: 0
  })

  // Available CRM field mappings
  const availableFields = {
    policy_info: [
      { value: 'policyNumber', label: 'Policy Number' },
      { value: 'policyType', label: 'Policy Type' },
      { value: 'coverageDetails', label: 'Coverage Details' },
      { value: 'territoryCode', label: 'Territory Code' }
    ],
    insured_details: [
      { value: 'insuredName', label: 'Insured Name' },
      { value: 'coInsuredName', label: 'Co-Insured Name' },
      { value: 'insuredAddress', label: 'Insured Address' },
      { value: 'organizationName', label: 'Organization Name' }
    ],
    coverage: [
      { value: 'coverageTypes', label: 'Coverage Types' },
      { value: 'deductibles', label: 'Deductibles' },
      { value: 'limits', label: 'Coverage Limits' },
      { value: 'exclusions', label: 'Exclusions' }
    ],
    dates: [
      { value: 'effectiveDate', label: 'Effective Date' },
      { value: 'expirationDate', label: 'Expiration Date' },
      { value: 'renewalDate', label: 'Renewal Date' }
    ],
    financial: [
      { value: 'premium', label: 'Premium Amount' },
      { value: 'deductibleAmount', label: 'Deductible Amount' },
      { value: 'coverageLimit', label: 'Coverage Limit' }
    ],
    other: [
      { value: 'agentInfo', label: 'Agent Information' },
      { value: 'carrierInfo', label: 'Carrier Information' },
      { value: 'notes', label: 'Additional Notes' },
      { value: 'ignore', label: 'Ignore This Field' }
    ]
  }

  // Convert extraction result to field objects
  useEffect(() => {
    if (extractionResult?.policyData) {
      const fields: ExtractedField[] = []
      let fieldCounter = 0

      // Process each extracted data field
      Object.entries(extractionResult.policyData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          fieldCounter++
          
          const field: ExtractedField = {
            id: `field_${fieldCounter}`,
            label: formatFieldLabel(key),
            value: value,
            confidence: calculateConfidence(key, value),
            source: `Extracted from ${getSourceDescription(key)}`,
            targetField: key,
            status: 'pending',
            category: categorizeField(key),
            isRequired: isRequiredField(key),
            suggestions: getSuggestedMappings(key)
          }
          
          fields.push(field)
        }
      })

      setExtractedFields(fields)
      updateValidationSummary(fields)
    }
  }, [extractionResult])

  const formatFieldLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  const calculateConfidence = (key: string, value: any): number => {
    // Simulate confidence based on field type and value characteristics
    if (key.includes('Date') && new Date(value).toString() !== 'Invalid Date') return 0.95
    if (key.includes('Number') && /^[A-Z0-9-]+$/.test(value)) return 0.90
    if (key.includes('Name') && typeof value === 'string' && value.length > 2) return 0.85
    if (key.includes('Address') && typeof value === 'string' && value.includes(',')) return 0.88
    return 0.75 + Math.random() * 0.2 // Base confidence with some variation
  }

  const getSourceDescription = (key: string): string => {
    const sourceMap: Record<string, string> = {
      policyNumber: 'header section',
      insuredName: 'policyholder information block',
      effectiveDate: 'policy period section',
      expirationDate: 'policy period section',
      coverageTypes: 'coverage summary table',
      deductibles: 'deductible schedule',
      insuredAddress: 'mailing address section'
    }
    return sourceMap[key] || 'document content'
  }

  const categorizeField = (key: string): ExtractedField['category'] => {
    if (['policyNumber', 'policyType', 'territoryCode'].includes(key)) return 'policy_info'
    if (['insuredName', 'coInsuredName', 'insuredAddress', 'organizationName'].includes(key)) return 'insured_details'
    if (['coverageTypes', 'deductibles', 'limits'].includes(key)) return 'coverage'
    if (['effectiveDate', 'expirationDate', 'renewalDate'].includes(key)) return 'dates'
    if (['premium', 'deductibleAmount', 'coverageLimit'].includes(key)) return 'financial'
    return 'other'
  }

  const isRequiredField = (key: string): boolean => {
    return ['policyNumber', 'insuredName', 'effectiveDate', 'expirationDate'].includes(key)
  }

  const getSuggestedMappings = (key: string): string[] => {
    const suggestions: Record<string, string[]> = {
      insuredName: ['organizationName', 'coInsuredName'],
      organizationName: ['insuredName'],
      effectiveDate: ['renewalDate'],
      coverageTypes: ['coverageDetails']
    }
    return suggestions[key] || []
  }

  const updateValidationSummary = (fields: ExtractedField[]) => {
    const summary = {
      total: fields.length,
      accepted: fields.filter(f => f.status === 'accepted').length,
      rejected: fields.filter(f => f.status === 'rejected').length,
      remapped: fields.filter(f => f.status === 'remapped').length,
      ignored: fields.filter(f => f.status === 'ignored').length,
      pending: fields.filter(f => f.status === 'pending').length
    }
    setValidationSummary(summary)
  }

  const handleFieldAction = (fieldId: string, action: ExtractedField['status'], newTargetField?: string) => {
    setExtractedFields(prev => {
      const updated = prev.map(field => {
        if (field.id === fieldId) {
          return {
            ...field,
            status: action,
            targetField: newTargetField || field.targetField
          }
        }
        return field
      })
      updateValidationSummary(updated)
      return updated
    })
  }

  const getFieldIcon = (category: ExtractedField['category']) => {
    const iconMap = {
      policy_info: Shield,
      insured_details: User,
      coverage: FileText,
      dates: Calendar,
      financial: DollarSign,
      other: Settings
    }
    return iconMap[category] || Info
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100'
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getStatusColor = (status: ExtractedField['status']) => {
    const colorMap = {
      pending: 'text-blue-600 bg-blue-100',
      accepted: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      remapped: 'text-purple-600 bg-purple-100',
      ignored: 'text-gray-600 bg-gray-100'
    }
    return colorMap[status]
  }

  const canProceed = validationSummary.pending === 0 && validationSummary.total > 0

  const handleProceed = () => {
    const validatedData = {
      ...data,
      extractedPolicyData: extractionResult.policyData,
      validatedFields: extractedFields,
      fieldMappings: extractedFields.reduce((acc, field) => {
        if (field.status === 'accepted' || field.status === 'remapped') {
          acc[field.targetField] = field.value
        }
        return acc
      }, {} as Record<string, any>)
    }
    
    onValidationComplete(validatedData)
  }

  const CategoryIcon = getFieldIcon('policy_info')

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>AI Extraction Validation</span>
          </CardTitle>
          <p className="text-gray-600">
            Review and validate all extracted policy data. You must approve, reject, or remap each field before proceeding.
          </p>
        </CardHeader>
      </Card>

      {/* Validation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Validation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{validationSummary.total}</div>
              <div className="text-sm text-gray-600">Total Fields</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{validationSummary.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{validationSummary.accepted}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{validationSummary.remapped}</div>
              <div className="text-sm text-gray-600">Remapped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{validationSummary.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{validationSummary.ignored}</div>
              <div className="text-sm text-gray-600">Ignored</div>
            </div>
          </div>
          
          {validationSummary.pending > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-orange-800 font-medium">
                  {validationSummary.pending} field(s) still require validation
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Extracted Fields</CardTitle>
          <p className="text-sm text-gray-600">
            Review each field and choose the appropriate action. Required fields are marked with a red asterisk.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {extractedFields.map((field) => {
              const FieldIcon = getFieldIcon(field.category)
              
              return (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
                  {/* Field Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FieldIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {field.label}
                            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(field.confidence)}`}>
                            {Math.round(field.confidence * 100)}% confidence
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(field.status)}`}>
                            {field.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{field.source}</p>
                      </div>
                    </div>
                  </div>

                  {/* Field Value */}
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">Extracted Value:</span>
                    </div>
                    <div className="font-mono text-sm bg-white p-2 rounded border">
                      {typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : String(field.value)}
                    </div>
                  </div>

                  {/* Field Mapping */}
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Maps to:</span>
                    <span className="font-medium text-blue-600">{field.targetField}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={field.status === 'accepted' ? 'primary' : 'outline'}
                      onClick={() => handleFieldAction(field.id, 'accepted')}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Accept
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={field.status === 'rejected' ? 'danger' : 'outline'}
                      onClick={() => handleFieldAction(field.id, 'rejected')}
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedField(field)
                        setShowMappingModal(true)
                      }}
                      className="flex items-center gap-1"
                    >
                      <Shuffle className="h-3 w-3" />
                      Remap
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={field.status === 'ignored' ? 'secondary' : 'outline'}
                      onClick={() => handleFieldAction(field.id, 'ignored')}
                      className="flex items-center gap-1 text-gray-600 hover:text-gray-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Ignore
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Field Remapping Modal */}
      {showMappingModal && selectedField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Remap Field: {selectedField.label}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Target Field:
                </label>
                
                {Object.entries(availableFields).map(([category, fields]) => (
                  <div key={category} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-800 mb-2 capitalize">
                      {category.replace('_', ' ')}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {fields.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleFieldAction(selectedField.id, 'remapped', option.value)
                            setShowMappingModal(false)
                            setSelectedField(null)
                          }}
                          className="text-left p-3 border rounded hover:bg-blue-50 hover:border-blue-200"
                        >
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.value}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMappingModal(false)
                  setSelectedField(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Upload
        </Button>
        
        <Button 
          onClick={handleProceed}
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          Continue to Next Step
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
