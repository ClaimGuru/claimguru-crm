import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Switch } from '../../ui/switch'
import { AddressAutocomplete } from '../../ui/AddressAutocomplete'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { ConfirmedFieldWrapper } from '../../ui/ConfirmedFieldWrapper'
import { ConfirmedFieldsSummary } from '../../ui/ConfirmedFieldsSummary'
import { formatPhoneNumber, formatPhoneExtension } from '../../../utils/phoneUtils'
import { enhancedClaimWizardAI, AIValidation } from '../../../services/enhancedClaimWizardAI'
import { ConfirmedFieldsService } from '../../../services/confirmedFieldsService'
import { WizardValidationService } from '../../../services/wizardValidationService'
import { FieldValidationIndicator } from '../../ui/ValidationSummary'
import { InsurerPersonnelInformation } from './InsurerPersonnelInformation'
import { 
  Shield, 
  Brain, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  Sparkles,
  Building,
  Phone,
  MapPin,
  User,
  Zap,
  Plus,
  X,
  AlertCircle,
  Star
} from 'lucide-react'

// Currency formatting utilities
const formatCurrency = (value: string | number): string => {
  if (!value && value !== 0) return ''
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value
  if (isNaN(numValue)) return ''
  return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const parseCurrencyInput = (value: string): number => {
  const cleanValue = value.replace(/[^0-9.-]/g, '')
  const numValue = parseFloat(cleanValue)
  return isNaN(numValue) ? 0 : numValue
}

const getCurrencyInputProps = () => ({
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
        (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
        (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true)) ||
        (e.keyCode === 86 && (e.ctrlKey === true || e.metaKey === true)) ||
        (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true)) ||
        (e.keyCode >= 35 && e.keyCode <= 40)) {
      return
    }
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault()
    }
  },
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text')
    if (!/^[0-9]*\.?[0-9]*$/.test(paste)) {
      e.preventDefault()
    }
  }
})
// Helper function to convert date from MM/DD/YYYY to YYYY-MM-DD format
const convertDateFormat = (dateStr: string): string => {
  if (!dateStr) return ''
  
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [month, day, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  if (dateStr.match(/\d{4}-\d{2}-\d{2}/)) {
    return dateStr
  }
  
  return dateStr
}

interface Coverage {
  id: string
  type: string
  limit: number
  otherDescription?: string
}

interface AdditionalCoverage {
  id: string
  type: string
  limit: number
  isPercentage: boolean
  percentageOf?: string
  percentageValue?: number
  calculatedAmount?: number
  isAmountOverridden?: boolean
  otherDescription?: string
  isIncluded: boolean
}

interface Deductible {
  id: string
  type: string
  amount: number
  isPercentage: boolean
  percentageOf?: string
  percentageValue?: number
  calculatedAmount?: number
  isAmountOverridden?: boolean
  otherDescription?: string
  appliesTo?: string
}

interface PriorPayment {
  id: string
  amount: number
  date: string
  description: string
  coverageId?: string
  recoverableDepreciation?: number
  nonRecoverableDepreciation?: number
  deductibleApplied?: number
  isRecovered?: boolean
}

interface ALEEntry {
  id: string
  currentLivingSituation: string
  monthlyLivingCost: number
  startDate: string
  endDate?: string
  description: string
  isActive: boolean
}

interface ALEInformation {
  hasLossOfRent: boolean
  hasLossOfUse: boolean
  monthsToDate: number
  totalClaimedAmount: number
  aleEntries: ALEEntry[]
}

interface UnifiedInsuranceInfoStepProps {
  data: any
  onUpdate: (data: any) => void
  onAIProcessing?: (isProcessing: boolean) => void
  mode?: 'basic' | 'manual' | 'ai-enhanced'
  enableAIFeatures?: boolean
  enableValidation?: boolean
  enableConfirmedFields?: boolean
  showComprehensiveFields?: boolean
}

interface ValidationResults {
  policyNumber: AIValidation | null
  lossDate: AIValidation | null
  coverages: string[]
  deductibles: Array<{type: string, amount: number}>
  carrier: AIValidation | null
  priorPayments: AIValidation | null
}

// Enhanced input component with validation
const ValidatedField: React.FC<{
  children: React.ReactNode
  fieldPath: string
  data: any
  label: string
  required?: boolean
}> = ({ children, fieldPath, data, label, required = false }) => {
  const validation = WizardValidationService.getFieldValidationStatus('insurance-info', fieldPath, data)
  
  return (
    <div className={`relative ${!validation.isValid ? 'validation-error' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <FieldValidationIndicator 
          isValid={validation.isValid}
          isRequired={validation.isRequired}
          error={validation.error}
          className="flex-shrink-0"
        />
      </div>
      <div className={`${!validation.isValid ? 'border-red-300 ring-red-300' : ''}`}>
        {children}
      </div>
      {!validation.isValid && validation.error && (
        <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {validation.error}
        </div>
      )}
    </div>
  )
}

export function UnifiedInsuranceInfoStep({ 
  data, 
  onUpdate, 
  onAIProcessing,
  mode = 'basic',
  enableAIFeatures = false,
  enableValidation = false,
  enableConfirmedFields = false,
  showComprehensiveFields = false
}: UnifiedInsuranceInfoStepProps) {
  // Unified state combining all variations
  const [insuranceCarrier, setInsuranceCarrier] = useState(data.insuranceCarrier || data.insuranceInfo?.carrier ? {
    name: data.insuranceInfo?.carrier || data.insuranceCarrier?.name || '',
    agentInfo: data.insuranceInfo?.agentInfo || data.insuranceCarrier?.agentInfo || {
      agencyName: '',
      agentFirstName: '',
      agentLastName: '',
      agentEmail: '',
      agentPhone: '',
      agentPhoneExtension: '',
      agencyLicenseNumber: '',
      agentAddress: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: ''
      }
    }
  } : {})
  
  const [policyDetails, setPolicyDetails] = useState(data.policyDetails || data.insuranceInfo || {})
  
  const [coverages, setCoverages] = useState<Coverage[]>(data.coverages || [
    {
      id: 'default-dwelling',
      type: 'Dwelling',
      limit: 0
    }
  ])
  
  const [additionalCoverages, setAdditionalCoverages] = useState<AdditionalCoverage[]>(data.additionalCoverages || [])
  const [deductibles, setDeductibles] = useState<Deductible[]>(data.deductibles || [])
  const [priorPayments, setPriorPayments] = useState<PriorPayment[]>(data.priorPayments || [])
  const [isForcedPlaced, setIsForcedPlaced] = useState(data.isForcedPlaced || false)
  const [applicableDeductible, setApplicableDeductible] = useState<string>(data.applicableDeductible || '')
  const [insurerPersonnel, setInsurerPersonnel] = useState(data.insurerPersonnel || [])
  const [deductRecoverableDepreciation, setDeductRecoverableDepreciation] = useState(data.deductRecoverableDepreciation || false)
  
  // Comprehensive fields (manual mode)
  const [aleInformation, setAleInformation] = useState<ALEInformation>(data.aleInformation || {
    hasLossOfRent: false,
    hasLossOfUse: false,
    monthsToDate: 0,
    totalClaimedAmount: 0,
    aleEntries: []
  })
  
  const [mortgageInfo, setMortgageInfo] = useState(data.mortgageInfo || {
    hasMortgage: false,
    mortgageCompany: '',
    loanNumber: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    address: {
      addressLine1: '',
      city: '',
      state: '',
      zipCode: ''
    }
  })
  const [validationResults, setValidationResults] = useState<ValidationResults>({
    policyNumber: null,
    lossDate: null,
    coverages: [],
    deductibles: [],
    carrier: null,
    priorPayments: null
  })
  const [isValidating, setIsValidating] = useState(false)
  const [autoPopulated, setAutoPopulated] = useState(false)
  const [aiValidating, setAiValidating] = useState(false)
  const [coverageAnalysis, setCoverageAnalysis] = useState(null)

  // Restore confirmed fields state if available
  useEffect(() => {
    if (enableConfirmedFields && data.confirmedFieldsState) {
      ConfirmedFieldsService.importState(data.confirmedFieldsState)
    }
  }, [data.confirmedFieldsState, enableConfirmedFields])

  // Auto-populate from AI extracted data (basic mode)
  useEffect(() => {
    if (enableAIFeatures && data.aiExtractedData?.extractedData && !autoPopulated) {
      const extractedData = data.aiExtractedData.extractedData
      
      setInsuranceCarrier(prev => ({
        ...prev,
        name: extractedData.insuranceCarrier || prev.name,
        agentInfo: {
          ...prev.agentInfo,
          agentFirstName: extractedData.agentFirstName || prev.agentInfo?.agentFirstName || '',
          agentLastName: extractedData.agentLastName || prev.agentInfo?.agentLastName || '',
          agentEmail: extractedData.agentEmail || prev.agentInfo?.agentEmail || '',
          agentPhone: extractedData.agentPhone || prev.agentInfo?.agentPhone || '',
          agencyName: extractedData.agencyName || prev.agentInfo?.agencyName || ''
        }
      }))

      setPolicyDetails(prev => ({
        ...prev,
        carrier: extractedData.insuranceCarrier || prev.carrier,
        policyNumber: extractedData.policyNumber || prev.policyNumber,
        effectiveDate: extractedData.effectiveDate || prev.effectiveDate,
        expirationDate: extractedData.expirationDate || prev.expirationDate
      }))

      if (extractedData.coverages && !coverageAnalysis) {
        performCoverageAnalysis(extractedData)
      }
      
      setAutoPopulated(true)
    }
  }, [data.aiExtractedData, enableAIFeatures, autoPopulated])

  // Auto-populate data from PDF extraction (AI-enhanced mode)
  useEffect(() => {
    if (enableAIFeatures && data.validationComplete && data.policyDetails && !autoPopulated) {
      
      // Auto-populate insurance carrier
      if (data.policyDetails.insurerName) {
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
      }
      
      // Auto-populate policy details
      const newPolicyDetails = { ...policyDetails }
      if (data.policyDetails.policyNumber) {
        newPolicyDetails.policyNumber = data.policyDetails.policyNumber
      }
      
      if (data.policyDetails.effectiveDate) {
        const convertedEffectiveDate = convertDateFormat(data.policyDetails.effectiveDate)
        newPolicyDetails.effectiveDate = convertedEffectiveDate
      }
      if (data.policyDetails.expirationDate) {
        const convertedExpirationDate = convertDateFormat(data.policyDetails.expirationDate)
        newPolicyDetails.expirationDate = convertedExpirationDate
      }
      setPolicyDetails(newPolicyDetails)
      
      // Auto-populate deductibles from validated data
      if (data.policyDetails.deductibles && data.policyDetails.deductibles.length > 0) {
        const autoDeductibles: Deductible[] = data.policyDetails.deductibles.map((ded: any, index: number) => ({
          id: `auto-${Date.now()}-${index}`,
          type: ded.type || 'All Other Perils',
          amount: ded.amount || 0,
          isPercentage: ded.isPercentage || false,
          percentageOf: ded.percentageOf || '',
          percentageValue: ded.percentageValue,
          calculatedAmount: ded.calculatedAmount,
          isAmountOverridden: ded.isAmountOverridden,
          otherDescription: ded.otherDescription,
          appliesTo: ded.appliesTo
        }))
        
        setDeductibles(autoDeductibles)
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
        }
      }
      
      setAutoPopulated(true)
    }
  }, [data.validationComplete, data.policyDetails, enableAIFeatures, autoPopulated])

  // Update parent data whenever local state changes
  useEffect(() => {
    const updatedData = {
      ...data,
      insuranceCarrier,
      insuranceInfo: {
        ...policyDetails,
        carrier: insuranceCarrier.name,
        agentInfo: insuranceCarrier.agentInfo
      },
      policyDetails,
      coverages,
      deductibles,
      priorPayments,
      isForcedPlaced,
      deductRecoverableDepreciation,
      coverageAnalysis,
      insurerPersonnel,
      mortgageInfo
    }
    
    // Add comprehensive fields if enabled
    if (showComprehensiveFields) {
      updatedData.additionalCoverages = additionalCoverages
      updatedData.applicableDeductible = applicableDeductible
      updatedData.aleInformation = aleInformation
    }
    
    // Add confirmed fields state if enabled
    if (enableConfirmedFields) {
      updatedData.confirmedFieldsState = ConfirmedFieldsService.exportState()
    }
    
    onUpdate(updatedData)
  }, [
    insuranceCarrier, policyDetails, coverages, additionalCoverages, deductibles, 
    priorPayments, isForcedPlaced, deductRecoverableDepreciation, coverageAnalysis,
    insurerPersonnel, applicableDeductible, aleInformation, mortgageInfo,
    showComprehensiveFields, enableConfirmedFields
  ])

  // Recalculate additional coverage amounts when base coverages change
  useEffect(() => {
    if (showComprehensiveFields) {
      setAdditionalCoverages(additionalCoverages.map(coverage => {
        if (coverage.isPercentage && coverage.percentageOf && coverage.percentageValue) {
          const selectedCoverage = coverages.find(c => c.id === coverage.percentageOf)
          if (selectedCoverage && selectedCoverage.limit) {
            const calculatedAmount = (selectedCoverage.limit * coverage.percentageValue) / 100
            return {
              ...coverage,
              calculatedAmount,
              limit: coverage.isAmountOverridden ? coverage.limit : calculatedAmount
            }
          }
        }
        return coverage
      }))
    }
  }, [coverages, showComprehensiveFields])

  // AI Coverage Analysis
  const performCoverageAnalysis = async (extractedData: any) => {
    setAiValidating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const analysis = {
        adequateCoverage: true,
        riskFactors: [
          "High deductible amount may impact claim value",
          "Personal property coverage limit is relatively low"
        ],
        recommendations: [
          "Consider additional living expenses coverage enhancement",
          "Review replacement cost vs actual cash value provisions"
        ],
        estimatedClaim: {
          min: 15000,
          max: 45000,
          mostLikely: 28000
        }
      }
      
      setCoverageAnalysis(analysis)
    } catch (error) {
      // console.error('Error performing coverage analysis:', error)
    } finally {
      setAiValidating(false)
    }
  }

  // AI Validation Functions
  const validateInsuranceInfo = async () => {
    if (!enableValidation || (!data.extractedPolicyData && !data.policyDetails)) return

    setIsValidating(true)
    onAIProcessing?.(true)

    try {
      const extractedData = data.policyDetails || data.extractedPolicyData
      
      const policyValidation = await enhancedClaimWizardAI.validatePolicyNumber(
        policyDetails.policyNumber,
        extractedData.policyNumber
      )

      const lossDateValidation = await enhancedClaimWizardAI.validateLossDate(
        data.lossDetails?.lossDate || '',
        extractedData.effectiveDate || '',
        extractedData.expirationDate || ''
      )

      const suggestedCoverages = await enhancedClaimWizardAI.suggestCoverages(
        extractedData
      )

      const suggestedDeductibles = await enhancedClaimWizardAI.suggestDeductibles(
        extractedData
      )

      let priorPaymentValidation = null
      if (priorPayments.length > 0) {
        priorPaymentValidation = await enhancedClaimWizardAI.checkDuplicatePayments(
          priorPayments
        )
      }

      setValidationResults({
        policyNumber: policyValidation,
        lossDate: lossDateValidation,
        coverages: suggestedCoverages,
        deductibles: suggestedDeductibles,
        carrier: null,
        priorPayments: priorPaymentValidation
      })
    } catch (error) {
      // console.error('Insurance validation failed:', error)
    } finally {
      setIsValidating(false)
      onAIProcessing?.(false)
    }
  }

  // Auto-validate when key data changes (AI modes only)
  useEffect(() => {
    if (enableValidation && data.extractedPolicyData && policyDetails.policyNumber) {
      validateInsuranceInfo()
    }
  }, [policyDetails.policyNumber, enableValidation, data.extractedPolicyData])

  // Utility function to add one year to a date
  const addOneYear = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    date.setFullYear(date.getFullYear() + 1)
    return date.toISOString().split('T')[0]
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    if (section === 'insurance') {
      if (field === 'effectiveDate') {
        const expirationDate = addOneYear(value)
        setPolicyDetails(prev => ({ 
          ...prev, 
          [field]: value,
          expirationDate: expirationDate
        }))
      } else if (field === 'carrier') {
        setInsuranceCarrier(prev => ({ ...prev, name: value }))
        setPolicyDetails(prev => ({ ...prev, carrier: value }))
      } else {
        setPolicyDetails(prev => ({ ...prev, [field]: value }))
      }
    } else if (section === 'agent') {
      setInsuranceCarrier(prev => ({
        ...prev,
        agentInfo: { ...prev.agentInfo, [field]: value }
      }))
    } else if (section === 'mortgage') {
      setMortgageInfo(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleAddressChange = (section: string, field: string, value: string) => {
    if (section === 'agent') {
      setInsuranceCarrier(prev => ({
        ...prev,
        agentInfo: {
          ...prev.agentInfo,
          agentAddress: { 
            ...((prev.agentInfo && prev.agentInfo.agentAddress) || {}), 
            [field]: value 
          }
        }
      }))
    } else if (section === 'mortgage') {
      setMortgageInfo(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }))
    }
  }

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

  const formatCurrencyDisplay = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const insuranceCarriers = [
    'State Farm', 'Allstate', 'GEICO', 'Progressive', 'USAA', 'Liberty Mutual',
    'Farmers', 'Nationwide', 'American Family', 'Travelers', 'The Hartford',
    'Auto-Owners', 'Erie Insurance', 'Country Financial', 'Amica', 'Other'
  ]

  const coverageTypes = [
    'Dwelling', 'Other Structures', 'Personal Property', 'Loss of Use',
    'Personal Liability', 'Medical Payments', 'Additional Living Expenses'
  ]

  const deductibleTypes = [
    'All Other Perils', 'Wind/Hail', 'Hurricane', 'Named Storm', 'Earthquake',
    'Flood', 'Sinkhole', 'Vandalism', 'Theft', 'Fire', 'Other'
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
      {enableAIFeatures && (data.aiExtractedData || autoPopulated) && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-medium text-purple-900">AI Auto-Population Complete</div>
                <div className="text-sm text-purple-700">
                  Insurance information has been automatically extracted from your policy document
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmed Fields Summary */}
      {enableConfirmedFields && (
        <ConfirmedFieldsSummary />
      )}

      {/* Insurance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            Insurance Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedField 
              fieldPath="insuranceCarrier.name" 
              data={data} 
              label="Insurance Carrier" 
              required
            >
              {enableConfirmedFields ? (
                <ConfirmedFieldWrapper 
                  fieldPath="insuranceCarrier.name"
                  value={insuranceCarrier.name}
                  onConfirm={(value) => handleInputChange('insurance', 'carrier', value)}
                >
                  <select
                    value={insuranceCarrier.name}
                    onChange={(e) => handleInputChange('insurance', 'carrier', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="">Select carrier</option>
                    {insuranceCarriers.map(carrier => (
                      <option key={carrier} value={carrier}>{carrier}</option>
                    ))}
                  </select>
                </ConfirmedFieldWrapper>
              ) : (
                <select
                  value={insuranceCarrier.name}
                  onChange={(e) => handleInputChange('insurance', 'carrier', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select carrier</option>
                  {insuranceCarriers.map(carrier => (
                    <option key={carrier} value={carrier}>{carrier}</option>
                  ))}
                </select>
              )}
            </ValidatedField>

            <ValidatedField 
              fieldPath="policyDetails.policyNumber" 
              data={data} 
              label="Policy Number" 
              required
            >
              {enableConfirmedFields ? (
                <ConfirmedFieldWrapper 
                  fieldPath="policyDetails.policyNumber"
                  value={policyDetails.policyNumber || ''}
                  onConfirm={(value) => handleInputChange('insurance', 'policyNumber', value)}
                >
                  <Input
                    type="text"
                    value={policyDetails.policyNumber || ''}
                    onChange={(e) => handleInputChange('insurance', 'policyNumber', e.target.value)}
                    placeholder="Policy number"
                    required
                  />
                </ConfirmedFieldWrapper>
              ) : (
                <Input
                  type="text"
                  value={policyDetails.policyNumber || ''}
                  onChange={(e) => handleInputChange('insurance', 'policyNumber', e.target.value)}
                  placeholder="Policy number"
                  required
                />
              )}
            </ValidatedField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedField 
              fieldPath="policyDetails.effectiveDate" 
              data={data} 
              label="Policy Effective Date" 
              required
            >
              <Input
                type="date"
                value={policyDetails.effectiveDate || ''}
                onChange={(e) => handleInputChange('insurance', 'effectiveDate', e.target.value)}
                required
              />
            </ValidatedField>

            <ValidatedField 
              fieldPath="policyDetails.expirationDate" 
              data={data} 
              label="Policy Expiration Date" 
              required
            >
              <Input
                type="date"
                value={policyDetails.expirationDate || ''}
                onChange={(e) => handleInputChange('insurance', 'expirationDate', e.target.value)}
                required
              />
            </ValidatedField>
          </div>

          {/* Claim Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Number
              </label>
              <Input
                type="text"
                value={policyDetails.claimNumber || ''}
                onChange={(e) => handleInputChange('insurance', 'claimNumber', e.target.value)}
                placeholder="Claim number (if available)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Reported to Carrier
              </label>
              <Input
                type="date"
                value={policyDetails.reportedDate || ''}
                onChange={(e) => handleInputChange('insurance', 'reportedDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User className="h-6 w-6 text-green-600" />
            Agent Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agency Name
              </label>
              <Input
                type="text"
                value={insuranceCarrier.agentInfo?.agencyName || ''}
                onChange={(e) => handleInputChange('agent', 'agencyName', e.target.value)}
                placeholder="Agency name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent License Number
              </label>
              <Input
                type="text"
                value={insuranceCarrier.agentInfo?.agencyLicenseNumber || ''}
                onChange={(e) => handleInputChange('agent', 'agencyLicenseNumber', e.target.value)}
                placeholder="License number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent First Name
              </label>
              <Input
                type="text"
                value={insuranceCarrier.agentInfo?.agentFirstName || ''}
                onChange={(e) => handleInputChange('agent', 'agentFirstName', e.target.value)}
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Last Name
              </label>
              <Input
                type="text"
                value={insuranceCarrier.agentInfo?.agentLastName || ''}
                onChange={(e) => handleInputChange('agent', 'agentLastName', e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Email
              </label>
              <Input
                type="email"
                value={insuranceCarrier.agentInfo?.agentEmail || ''}
                onChange={(e) => handleInputChange('agent', 'agentEmail', e.target.value)}
                placeholder="agent@agency.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Phone
              </label>
              <Input
                type="tel"
                value={insuranceCarrier.agentInfo?.agentPhone || ''}
                onChange={(e) => handleInputChange('agent', 'agentPhone', formatPhoneNumber(e.target.value))}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            Policy Coverages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {coverages.map((coverage, index) => (
            <div key={coverage.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coverage Type
                  </label>
                  <select
                    value={coverage.type}
                    onChange={(e) => updateCoverage(coverage.id, 'type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select coverage type</option>
                    {coverageTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coverage Limit
                  </label>
                  <Input
                    type="text"
                    value={coverage.limit ? formatCurrency(coverage.limit) : ''}
                    onChange={(e) => updateCoverage(coverage.id, 'limit', parseCurrencyInput(e.target.value))}
                    placeholder="$0.00"
                    {...getCurrencyInputProps()}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeCoverage(coverage.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addCoverage}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Coverage
          </Button>
        </CardContent>
      </Card>

      {/* Deductibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-orange-600" />
            Deductibles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deductibles.map((deductible, index) => (
            <div key={deductible.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deductible Type
                  </label>
                  <select
                    value={deductible.type}
                    onChange={(e) => updateDeductible(deductible.id, 'type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select deductible type</option>
                    {deductibleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount/Percentage
                  </label>
                  <Input
                    type="text"
                    value={deductible.isPercentage ? 
                      `${deductible.amount}%` : 
                      (deductible.amount ? formatCurrency(deductible.amount) : '')
                    }
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.includes('%')) {
                        updateDeductible(deductible.id, 'isPercentage', true)
                        updateDeductible(deductible.id, 'amount', parseFloat(value.replace('%', '')) || 0)
                      } else {
                        updateDeductible(deductible.id, 'isPercentage', false)
                        updateDeductible(deductible.id, 'amount', parseCurrencyInput(value))
                      }
                    }}
                    placeholder="$500 or 2%"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deductible.isPercentage}
                      onChange={(e) => updateDeductible(deductible.id, 'isPercentage', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Percentage</span>
                  </label>
                </div>
              </div>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeDeductible(deductible.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addDeductible}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Deductible
          </Button>
        </CardContent>
      </Card>

      {/* Prior Payments */}
      {showComprehensiveFields && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-purple-600" />
              Prior Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {priorPayments.map((payment, index) => (
              <div key={payment.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Amount
                    </label>
                    <Input
                      type="text"
                      value={payment.amount ? formatCurrency(payment.amount) : ''}
                      onChange={(e) => updatePriorPayment(payment.id, 'amount', parseCurrencyInput(e.target.value))}
                      placeholder="$0.00"
                      {...getCurrencyInputProps()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Date
                    </label>
                    <Input
                      type="date"
                      value={payment.date}
                      onChange={(e) => updatePriorPayment(payment.id, 'date', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Input
                      type="text"
                      value={payment.description}
                      onChange={(e) => updatePriorPayment(payment.id, 'description', e.target.value)}
                      placeholder="Payment description"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removePriorPayment(payment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addPriorPayment}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Prior Payment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mortgage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Building className="h-6 w-6 text-indigo-600" />
            Mortgage Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={mortgageInfo.hasMortgage}
              onCheckedChange={(checked) => handleInputChange('mortgage', 'hasMortgage', checked)}
            />
            <label className="text-sm font-medium text-gray-700">
              Property has an active mortgage
            </label>
          </div>
          
          {mortgageInfo.hasMortgage && (
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mortgage Company
                  </label>
                  <Input
                    type="text"
                    value={mortgageInfo.mortgageCompany}
                    onChange={(e) => handleInputChange('mortgage', 'mortgageCompany', e.target.value)}
                    placeholder="Mortgage company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Number
                  </label>
                  <Input
                    type="text"
                    value={mortgageInfo.loanNumber}
                    onChange={(e) => handleInputChange('mortgage', 'loanNumber', e.target.value)}
                    placeholder="Loan number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <Input
                    type="text"
                    value={mortgageInfo.contactName}
                    onChange={(e) => handleInputChange('mortgage', 'contactName', e.target.value)}
                    placeholder="Contact person"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <Input
                    type="tel"
                    value={mortgageInfo.contactPhone}
                    onChange={(e) => handleInputChange('mortgage', 'contactPhone', formatPhoneNumber(e.target.value))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={mortgageInfo.contactEmail}
                    onChange={(e) => handleInputChange('mortgage', 'contactEmail', e.target.value)}
                    placeholder="contact@mortgage.com"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insurer Personnel */}
      {mode !== 'basic' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-6 w-6 text-teal-600" />
              Insurer Personnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InsurerPersonnelInformation
              data={insurerPersonnel}
              onUpdate={setInsurerPersonnel}
            />
          </CardContent>
        </Card>
      )}

      {/* AI Coverage Analysis */}
      {enableAIFeatures && coverageAnalysis && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Brain className="h-5 w-5" />
              AI Coverage Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrencyDisplay(coverageAnalysis.estimatedClaim.min)}
                </div>
                <div className="text-sm text-gray-600">Minimum Estimate</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrencyDisplay(coverageAnalysis.estimatedClaim.mostLikely)}
                </div>
                <div className="text-sm text-gray-600">Most Likely</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrencyDisplay(coverageAnalysis.estimatedClaim.max)}
                </div>
                <div className="text-sm text-gray-600">Maximum Estimate</div>
              </div>
            </div>
            
            {coverageAnalysis.riskFactors.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Risk Factors</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {coverageAnalysis.riskFactors.map((factor: string, idx: number) => (
                    <li key={idx}>• {factor}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {coverageAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Recommendations</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {coverageAnalysis.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Validation Results */}
      {enableValidation && isValidating && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600">AI is validating insurance information...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {enableValidation && validationResults.policyNumber && (
        <ValidationAlert validation={validationResults.policyNumber} />
      )}

      {enableValidation && validationResults.lossDate && (
        <ValidationAlert validation={validationResults.lossDate} />
      )}

      {enableValidation && validationResults.priorPayments && (
        <ValidationAlert validation={validationResults.priorPayments} />
      )}

      {enableValidation && validationResults.coverages.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">AI Coverage Suggestions</span>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              {validationResults.coverages.map((suggestion, idx) => (
                <li key={idx}>• {suggestion}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {enableValidation && validationResults.deductibles.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-orange-800">AI Deductible Analysis</span>
            </div>
            <div className="text-sm text-orange-700 space-y-1">
              {validationResults.deductibles.map((ded, idx) => (
                <div key={idx}>• {ded.type}: {formatCurrencyDisplay(ded.amount)}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}