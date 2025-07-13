import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { 
  FileText, 
  DollarSign, 
  Calculator,
  AlertTriangle,
  CheckCircle,
  Brain,
  Percent,
  Calendar,
  Info
} from 'lucide-react'
import { enhancedClaimWizardAI } from '../../../services/enhancedClaimWizardAI'

interface ContractDetails {
  feeStructure: 'percentage' | 'flat' | 'hourly' | 'contingency'
  feePercentage?: number
  flatFee?: number
  hourlyRate?: number
  minimumFee?: number
  maximumFee?: number
  expenseHandling: 'included' | 'additional' | 'capped'
  expenseCap?: number
  advanceFee?: number
  retainerAmount?: number
  paymentTerms: string
  cancellationTerms: string
  specialConditions?: string
  contractDate?: string
  effectiveDate?: string
  estimatedDuration?: string
}

interface ContractValidation {
  isCompliant: boolean
  warnings: string[]
  recommendations: string[]
  marketComparison: {
    isCompetitive: boolean
    marketRange: string
    position: 'below' | 'within' | 'above'
  }
  riskAssessment: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
  }
}

interface ContractInformationStepProps {
  data: any
  onUpdate: (data: any) => void
  onComplete?: () => void
}

export const ContractInformationStep: React.FC<ContractInformationStepProps> = ({
  data,
  onUpdate,
  onComplete
}) => {
  const [contractDetails, setContractDetails] = useState<ContractDetails>(
    data.contractInformation || {
      feeStructure: 'percentage',
      feePercentage: 10,
      expenseHandling: 'included',
      paymentTerms: 'Upon settlement',
      cancellationTerms: '30 days written notice',
      contractDate: new Date().toISOString().split('T')[0]
    }
  )
  const [validation, setValidation] = useState<ContractValidation | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // AI contract validation
  const validateContract = async () => {
    setIsValidating(true)
    try {
      const validationResult = await enhancedClaimWizardAI.validateContractTerms({
        contractDetails,
        claimData: data,
        organizationPolicies: data.organizationPolicies
      })
      
      setValidation(validationResult)
    } catch (error) {
      console.error('Contract validation failed:', error)
    } finally {
      setIsValidating(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (contractDetails.feeStructure && contractDetails.feePercentage) {
        validateContract()
      }
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [contractDetails])

  const updateContractDetails = (updates: Partial<ContractDetails>) => {
    const updated = { ...contractDetails, ...updates }
    setContractDetails(updated)
    onUpdate({
      ...data,
      contractInformation: updated
    })
  }

  const calculateEstimatedFee = () => {
    const estimatedClaimValue = data.lossDetails?.estimatedAmount || 100000
    
    switch (contractDetails.feeStructure) {
      case 'percentage':
        return (estimatedClaimValue * (contractDetails.feePercentage || 0)) / 100
      case 'flat':
        return contractDetails.flatFee || 0
      case 'hourly':
        const estimatedHours = 40 // Default estimate
        return (contractDetails.hourlyRate || 0) * estimatedHours
      default:
        return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span>Contract Information</span>
          </CardTitle>
          <p className="text-gray-600">
            Define fee structure and contract terms. AI validates compliance with company policies and market standards.
          </p>
        </CardHeader>
      </Card>

      {/* Fee Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { value: 'percentage', label: 'Percentage', icon: <Percent className="h-4 w-4" /> },
                  { value: 'flat', label: 'Flat Fee', icon: <DollarSign className="h-4 w-4" /> },
                  { value: 'hourly', label: 'Hourly', icon: <Calendar className="h-4 w-4" /> },
                  { value: 'contingency', label: 'Contingency', icon: <Calculator className="h-4 w-4" /> }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateContractDetails({ feeStructure: option.value as any })}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-1 transition-all ${
                      contractDetails.feeStructure === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.icon}
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Percentage Fee */}
            {contractDetails.feeStructure === 'percentage' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Fee Percentage *"
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={contractDetails.feePercentage || ''}
                  onChange={(e) => updateContractDetails({ feePercentage: parseFloat(e.target.value) })}
                  placeholder="10.0"

                />
                <Input
                  label="Minimum Fee"
                  type="number"
                  min="0"
                  value={contractDetails.minimumFee || ''}
                  onChange={(e) => updateContractDetails({ minimumFee: parseFloat(e.target.value) })}
                  placeholder="2500"
                  prefix="$"
                />
                <Input
                  label="Maximum Fee"
                  type="number"
                  min="0"
                  value={contractDetails.maximumFee || ''}
                  onChange={(e) => updateContractDetails({ maximumFee: parseFloat(e.target.value) })}
                  placeholder="50000"
                  prefix="$"
                />
              </div>
            )}

            {/* Estimated Fee Display */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Estimated Fee</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ${calculateEstimatedFee().toLocaleString()}
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Based on estimated claim value of ${(data.lossDetails?.estimatedAmount || 100000).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div></div>
        <Button
          onClick={onComplete}
          disabled={!contractDetails.feeStructure || !contractDetails.paymentTerms}
        >
          Continue to Next Step
        </Button>
      </div>
    </div>
  )
}
