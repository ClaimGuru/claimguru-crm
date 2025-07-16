import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { Shield, DollarSign, AlertTriangle, CheckCircle, Brain, Plus, X, Calendar } from 'lucide-react'
import { enhancedClaimWizardAI, AIValidation } from '../../../services/enhancedClaimWizardAI'

interface Coverage {
  id: string
  type: string
  limit: number
}

interface Deductible {
  id: string
  type: string
  amount: number
  isPercentage: boolean
  percentageOf?: string
}

interface PriorPayment {
  id: string
  amount: number
  date: string
  description: string
}

interface EnhancedInsuranceInfoStepProps {
  data: any
  onUpdate: (data: any) => void
  onAIProcessing?: (isProcessing: boolean) => void
}

// Helper function to convert date from MM/DD/YYYY to YYYY-MM-DD format
const convertDateFormat = (dateStr: string): string => {
  if (!dateStr) return ''
  
  // Handle MM/DD/YYYY format
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [month, day, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  // If already in YYYY-MM-DD format, return as is
  if (dateStr.match(/\d{4}-\d{2}-\d{2}/)) {
    return dateStr
  }
  
  return dateStr
}

export const EnhancedInsuranceInfoStep: React.FC<EnhancedInsuranceInfoStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [insuranceCarrier, setInsuranceCarrier] = useState(data.insuranceCarrier || {})
  const [policyDetails, setPolicyDetails] = useState(data.policyDetails || {})
  const [coverages, setCoverages] = useState<Coverage[]>(data.coverages || [])
  const [deductibles, setDeductibles] = useState<Deductible[]>(data.deductibles || [])
  const [priorPayments, setPriorPayments] = useState<PriorPayment[]>(data.priorPayments || [])
  const [isForcedPlaced, setIsForcedPlaced] = useState(false)

  // AI Validation States
  const [validationResults, setValidationResults] = useState<{
    policyNumber: AIValidation | null
    lossDate: AIValidation | null
    coverages: string[]
    deductibles: Array<{type: string, amount: number}>
    carrier: AIValidation | null
    priorPayments: AIValidation | null
  }>({
    policyNumber: null,
    lossDate: null,
    coverages: [],
    deductibles: [],
    carrier: null,
    priorPayments: null
  })
  const [isValidating, setIsValidating] = useState(false)
  const [autoPopulated, setAutoPopulated] = useState(false)

  // Debug: Log available data on component load
  useEffect(() => {
    console.log('📊 Insurance Step Data Debug:', {
      hasExtractedPolicyData: !!data.extractedPolicyData,
      hasPolicyDetails: !!data.policyDetails,
      validationComplete: data.validationComplete,
      dataConfirmed: data.dataConfirmed,
      processingComplete: data.processingComplete,
      extractedPolicyDataKeys: data.extractedPolicyData ? Object.keys(data.extractedPolicyData) : 'none',
      policyDetailsKeys: data.policyDetails ? Object.keys(data.policyDetails) : 'none',
      autoPopulated: autoPopulated
    })
    
    if (data.policyDetails?.deductibles) {
      console.log('📄 Available deductibles in policyDetails:', data.policyDetails.deductibles)
    }
    
    if (data.extractedPolicyData?.deductibles) {
      console.log('📄 Available deductibles in extractedPolicyData:', data.extractedPolicyData.deductibles)
    }
  }, [data])

  // Auto-populate data from PDF extraction
  useEffect(() => {
    // Check if PDF data was validated and confirmed
    if (data.validationComplete && data.policyDetails && !autoPopulated) {
      console.log('🚀 Auto-populating insurance details from validated PDF data:', data.policyDetails)
      
      // Auto-populate insurance carrier
      if (data.policyDetails.insurerName) {
        // Map full insurance company names to dropdown options
        let carrierName = data.policyDetails.insurerName
        if (carrierName.toLowerCase().includes('allstate')) {
          carrierName = 'Allstate'
        } else if (carrierName.toLowerCase().includes('state farm')) {
          carrierName = 'State Farm'
        } else if (carrierName.toLowerCase().includes('geico')) {
          carrierName = 'GEICO'
        } else if (carrierName.toLowerCase().includes('progressive')) {
          carrierName = 'Progressive'
        } else if (carrierName.toLowerCase().includes('usaa')) {
          carrierName = 'USAA'
        } else {
          carrierName = 'Other'
        }
        
        setInsuranceCarrier(prev => ({
          ...prev,
          name: carrierName
        }))
        console.log('✅ Auto-populated carrier:', carrierName, 'from:', data.policyDetails.insurerName)
      }
      
      // Auto-populate policy details
      const newPolicyDetails = { ...policyDetails }
      if (data.policyDetails.policyNumber) {
        newPolicyDetails.policyNumber = data.policyDetails.policyNumber
        console.log('✅ Auto-populated policy number:', data.policyDetails.policyNumber)
      }
      
      // Convert date formats from MM/DD/YYYY to YYYY-MM-DD for HTML date inputs
      if (data.policyDetails.effectiveDate) {
        const convertedEffectiveDate = convertDateFormat(data.policyDetails.effectiveDate)
        newPolicyDetails.effectiveDate = convertedEffectiveDate
        console.log('✅ Auto-populated effective date:', convertedEffectiveDate, 'from:', data.policyDetails.effectiveDate)
      }
      if (data.policyDetails.expirationDate) {
        const convertedExpirationDate = convertDateFormat(data.policyDetails.expirationDate)
        newPolicyDetails.expirationDate = convertedExpirationDate
        console.log('✅ Auto-populated expiration date:', convertedExpirationDate, 'from:', data.policyDetails.expirationDate)
      }
      setPolicyDetails(newPolicyDetails)
      
      // Auto-populate deductibles from validated data
      if (data.policyDetails.deductibles && data.policyDetails.deductibles.length > 0) {
        console.log('📋 Auto-populating deductibles from validated data:', data.policyDetails.deductibles)
        
        const autoDeductibles: Deductible[] = data.policyDetails.deductibles.map((ded: any, index: number) => ({
          id: `auto-${Date.now()}-${index}`,
          type: ded.type || 'All Other Perils',
          amount: ded.amount || 0,
          isPercentage: ded.isPercentage || false,
          percentageOf: ded.percentageOf
        }))
        
        setDeductibles(autoDeductibles)
        console.log('✅ Deductibles auto-populated:', autoDeductibles)
      }
      
      // Auto-populate coverages if available  
      if (data.policyDetails.coverageAmount) {
        const coverageAmountStr = String(data.policyDetails.coverageAmount)
        const coverageAmountNum = parseInt(coverageAmountStr.replace(/[^0-9]/g, '')) || 0
        if (coverageAmountNum > 0) {
          const autoCoverages: Coverage[] = [{
            id: `auto-dwelling-${Date.now()}`,
            type: 'Dwelling',
            limit: coverageAmountNum
          }]
          setCoverages(prev => [...prev, ...autoCoverages])
          console.log('✅ Auto-populated coverage:', autoCoverages)
        }
      }
      
      setAutoPopulated(true)
      console.log('✅ Insurance details auto-population completed')
    }
  }, [data.validationComplete, data.policyDetails, autoPopulated])

  // Update parent data whenever local state changes
  useEffect(() => {
    onUpdate({
      ...data,
      insuranceCarrier,
      policyDetails,
      coverages,
      deductibles,
      priorPayments
    })
  }, [insuranceCarrier, policyDetails, coverages, deductibles, priorPayments])

  // AI Validation Functions
  const validateInsuranceInfo = async () => {
    if (!data.extractedPolicyData && !data.policyDetails) return

    setIsValidating(true)
    onAIProcessing?.(true)

    try {
      const extractedData = data.policyDetails || data.extractedPolicyData
      
      // Validate policy number
      const policyValidation = await enhancedClaimWizardAI.validatePolicyNumber(
        policyDetails.policyNumber,
        extractedData.policyNumber
      )

      // Validate loss date against policy period
      const lossDateValidation = await enhancedClaimWizardAI.validateLossDate(
        data.lossDetails?.lossDate || '',
        extractedData.effectiveDate || '',
        extractedData.expirationDate || ''
      )

      // Get coverage suggestions
      const suggestedCoverages = await enhancedClaimWizardAI.suggestCoverages(
        extractedData
      )

      // Get deductible suggestions
      const suggestedDeductibles = await enhancedClaimWizardAI.suggestDeductibles(
        extractedData
      )

      // Check for duplicate payments
      let priorPaymentValidation = null
      if (priorPayments.length > 0) {
        priorPaymentValidation = await enhancedClaimWizardAI.checkDuplicatePayments(
          priorPayments[priorPayments.length - 1],
          priorPayments.slice(0, -1)
        )
      }

      const newValidationResults = {
        policyNumber: policyValidation,
        lossDate: lossDateValidation,
        coverages: suggestedCoverages,
        deductibles: suggestedDeductibles,
        carrier: {
          isValid: true,
          message: 'Carrier information verified',
          severity: 'info' as 'info'
        },
        priorPayments: priorPaymentValidation
      }
      
      setValidationResults(newValidationResults)
      
      // Auto-populate deductibles from AI suggestions if not already populated
      if (suggestedDeductibles.length > 0 && deductibles.length === 0) {
        console.log('🤖 Auto-populating deductibles from AI validation results:', suggestedDeductibles)
        
        const autoDeductibles: Deductible[] = suggestedDeductibles.map((ded: any, index: number) => ({
          id: `ai-auto-${Date.now()}-${index}`,
          type: ded.type,
          amount: ded.amount,
          isPercentage: false
        }))
        
        setDeductibles(autoDeductibles)
        console.log('✅ AI-suggested deductibles auto-populated:', autoDeductibles)
      }
      
    } catch (error) {
      console.error('Insurance validation failed:', error)
    } finally {
      setIsValidating(false)
      onAIProcessing?.(false)
    }
  }

  // Auto-validate when key data changes or component loads with validated data
  useEffect(() => {
    if ((data.extractedPolicyData || data.policyDetails) && (policyDetails.policyNumber || data.policyDetails?.policyNumber)) {
      console.log('🔍 Triggering AI validation with available data')
      validateInsuranceInfo()
    }
  }, [policyDetails.policyNumber, data.lossDetails?.lossDate, data.extractedPolicyData, data.policyDetails, data.validationComplete])

  // Coverage Management
  const addCoverage = () => {
    const newCoverage: Coverage = {
      id: Date.now().toString(),
      type: '',
      limit: 0
    }
    setCoverages([...coverages, newCoverage])
  }

  const updateCoverage = (id: string, field: keyof Coverage, value: any) => {
    setCoverages(coverages.map(coverage => 
      coverage.id === id ? { ...coverage, [field]: value } : coverage
    ))
  }

  const removeCoverage = (id: string) => {
    setCoverages(coverages.filter(coverage => coverage.id !== id))
  }

  // Deductible Management
  const addDeductible = () => {
    const newDeductible: Deductible = {
      id: Date.now().toString(),
      type: '',
      amount: 0,
      isPercentage: false
    }
    setDeductibles([...deductibles, newDeductible])
  }

  const updateDeductible = (id: string, field: keyof Deductible, value: any) => {
    setDeductibles(deductibles.map(deductible => 
      deductible.id === id ? { ...deductible, [field]: value } : deductible
    ))
  }

  const removeDeductible = (id: string) => {
    setDeductibles(deductibles.filter(deductible => deductible.id !== id))
  }

  // Prior Payment Management
  const addPriorPayment = () => {
    const newPayment: PriorPayment = {
      id: Date.now().toString(),
      amount: 0,
      date: '',
      description: ''
    }
    setPriorPayments([...priorPayments, newPayment])
  }

  const updatePriorPayment = (id: string, field: keyof PriorPayment, value: any) => {
    setPriorPayments(priorPayments.map(payment => 
      payment.id === id ? { ...payment, [field]: value } : payment
    ))
  }

  const removePriorPayment = (id: string) => {
    setPriorPayments(priorPayments.filter(payment => payment.id !== id))
  }

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
      {/* Auto-Population Notice */}
      {autoPopulated && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Auto-Populated from Policy Document</span>
            </div>
            <p className="text-sm text-green-700 mb-3">
              The following information has been automatically extracted and populated from your policy document:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {policyDetails.policyNumber && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Policy Number</span>
                </div>
              )}
              {insuranceCarrier.name && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Insurance Carrier</span>
                </div>
              )}
              {policyDetails.effectiveDate && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Policy Dates</span>
                </div>
              )}
              {deductibles.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>{deductibles.length} Deductible(s)</span>
                </div>
              )}
              {coverages.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>{coverages.length} Coverage(s)</span>
                </div>
              )}
            </div>
            <p className="text-sm text-green-600 mt-3">
              Please review and update any information as needed.
            </p>
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
                <span className="font-semibold text-blue-800">AI Cross-Reference Active</span>
              </div>
              {isValidating && <LoadingSpinner size="sm" />}
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Validating insurance information against uploaded policy document
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insurance Carrier Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Insurance Carrier Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Insurance Carrier</label>
              <select
                value={insuranceCarrier.name || ''}
                onChange={(e) => setInsuranceCarrier({
                  ...insuranceCarrier,
                  name: e.target.value
                })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select carrier</option>
                <option value="State Farm">State Farm</option>
                <option value="Allstate">Allstate</option>
                <option value="GEICO">GEICO</option>
                <option value="Progressive">Progressive</option>
                <option value="USAA">USAA</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Policy Number</label>
              <input
                type="text"
                value={policyDetails.policyNumber || ''}
                onChange={(e) => setPolicyDetails({
                  ...policyDetails,
                  policyNumber: e.target.value
                })}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter policy number"
              />
              {/* AI Policy Number Validation */}
              {validationResults.policyNumber && (
                <div className="mt-2">
                  <ValidationAlert validation={validationResults.policyNumber} />
                </div>
              )}
            </div>
          </div>

          {/* Forced Placed Policy */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isForcedPlaced}
                onChange={(e) => setIsForcedPlaced(e.target.checked)}
                className="form-checkbox"
              />
              <span className="text-sm font-medium">Forced Placed Policy</span>
            </label>
            {isForcedPlaced && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    AI Note: Forced placed policies may have limited coverage
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Policy Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Effective Date</label>
              <input
                type="date"
                value={policyDetails.effectiveDate || ''}
                onChange={(e) => setPolicyDetails({
                  ...policyDetails,
                  effectiveDate: e.target.value
                })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiration Date</label>
              <input
                type="date"
                value={policyDetails.expirationDate || ''}
                onChange={(e) => setPolicyDetails({
                  ...policyDetails,
                  expirationDate: e.target.value
                })}
                className="w-full p-2 border rounded-lg"
              />
              {/* AI Loss Date Validation */}
              {validationResults.lossDate && (
                <div className="mt-2">
                  <ValidationAlert validation={validationResults.lossDate} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Coverage & Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Coverage Suggestions */}
          {validationResults.coverages.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <strong className="text-blue-800">AI Coverage Suggestions</strong>
              </div>
              <p className="text-sm text-blue-700 mb-2">
                Policy includes these coverage types:
              </p>
              <div className="flex flex-wrap gap-2">
                {validationResults.coverages.map((coverage, idx) => (
                  <Button
                    key={idx}
                    onClick={() => {
                      const newCoverage: Coverage = {
                        id: Date.now().toString() + idx,
                        type: coverage,
                        limit: 0
                      }
                      setCoverages([...coverages, newCoverage])
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Add {coverage}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Coverage List */}
          {coverages.map((coverage) => (
            <div key={coverage.id} className="flex items-center gap-4 p-3 border rounded-lg">
              <select
                value={coverage.type}
                onChange={(e) => updateCoverage(coverage.id, 'type', e.target.value)}
                className="flex-1 p-2 border rounded"
              >
                <option value="">Select coverage type</option>
                <option value="Dwelling">Dwelling</option>
                <option value="Personal Property">Personal Property</option>
                <option value="Liability">Liability</option>
                <option value="Medical Payments">Medical Payments</option>
                <option value="Loss of Use">Loss of Use</option>
                <option value="Other Structures">Other Structures</option>
              </select>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <input
                  type="number"
                  value={coverage.limit}
                  onChange={(e) => updateCoverage(coverage.id, 'limit', parseInt(e.target.value) || 0)}
                  className="w-32 p-2 border rounded"
                  placeholder="Limit"
                />
              </div>
              <Button
                onClick={() => removeCoverage(coverage.id)}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button onClick={addCoverage} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Coverage
          </Button>
        </CardContent>
      </Card>

      {/* Deductibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Deductibles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-populated Deductibles Notice */}
          {autoPopulated && deductibles.length > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <strong className="text-green-800">Deductibles Auto-Populated from Policy</strong>
              </div>
              <p className="text-sm text-green-700 mb-2">
                {deductibles.length} deductible(s) were automatically detected and populated from your policy document.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {deductibles.map((ded) => (
                  <div key={ded.id} className="text-sm bg-white border border-green-200 rounded p-2">
                    <span className="font-medium">{ded.type}:</span>
                    <span className="ml-2">
                      {ded.isPercentage ? `${ded.amount}%` : `$${ded.amount.toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Deductible Suggestions (only show if no auto-population) */}
          {!autoPopulated && validationResults.deductibles.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <strong className="text-blue-800">AI Deductible Recommendations</strong>
              </div>
              <p className="text-sm text-blue-700 mb-2">
                Policy specifies these deductibles:
              </p>
              <div className="space-y-2">
                {validationResults.deductibles.map((deductible, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{deductible.type}</span>
                    <span className="font-semibold">${deductible.amount.toLocaleString()}</span>
                    <Button
                      onClick={() => {
                        const newDeductible: Deductible = {
                          id: Date.now().toString() + idx,
                          type: deductible.type,
                          amount: deductible.amount,
                          isPercentage: false
                        }
                        setDeductibles([...deductibles, newDeductible])
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deductible List */}
          {deductibles.map((deductible) => (
            <div key={deductible.id} className="flex items-center gap-4 p-3 border rounded-lg">
              <select
                value={deductible.type}
                onChange={(e) => updateDeductible(deductible.id, 'type', e.target.value)}
                className="flex-1 p-2 border rounded"
              >
                <option value="">Select deductible type</option>
                <option value="Hurricane">Hurricane</option>
                <option value="Wind/Hail">Wind/Hail</option>
                <option value="All Other Perils">All Other Perils</option>
                <option value="Water Damage">Water Damage</option>
              </select>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={deductible.isPercentage}
                  onChange={(e) => updateDeductible(deductible.id, 'isPercentage', e.target.checked)}
                  className="form-checkbox"
                />
                <span className="text-sm">Percentage</span>
              </label>

              <div className="flex items-center gap-2">
                {deductible.isPercentage ? (
                  <>
                    <input
                      type="number"
                      value={deductible.amount}
                      onChange={(e) => updateDeductible(deductible.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-20 p-2 border rounded"
                      placeholder="0.0"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-sm">%</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">$</span>
                    <input
                      type="number"
                      value={deductible.amount}
                      onChange={(e) => updateDeductible(deductible.id, 'amount', parseInt(e.target.value) || 0)}
                      className="w-32 p-2 border rounded"
                      placeholder="Amount"
                    />
                  </>
                )}
              </div>

              <Button
                onClick={() => removeDeductible(deductible.id)}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button onClick={addDeductible} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Deductible
          </Button>
        </CardContent>
      </Card>

      {/* Prior Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prior Payments (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prior Payment List */}
          {priorPayments.map((payment) => (
            <div key={payment.id} className="grid grid-cols-4 gap-4 items-center p-3 border rounded-lg">
              <div>
                <input
                  type="number"
                  value={payment.amount}
                  onChange={(e) => updatePriorPayment(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded"
                  placeholder="Amount"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={payment.date}
                  onChange={(e) => updatePriorPayment(payment.id, 'date', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={payment.description}
                  onChange={(e) => updatePriorPayment(payment.id, 'description', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Description"
                />
              </div>
              <div>
                <Button
                  onClick={() => removePriorPayment(payment.id)}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* AI Prior Payment Validation */}
          {validationResults.priorPayments && (
            <div className="mt-2">
              <ValidationAlert validation={validationResults.priorPayments} />
            </div>
          )}

          <Button onClick={addPriorPayment} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Prior Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
