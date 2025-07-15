import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  FileText, 
  Users, 
  Shield, 
  Home, 
  Package, 
  Wrench, 
  Calculator, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Brain,
  Sparkles,
  AlertCircle,
  Building2,
  UserCheck,
  CheckSquare,
  X
} from 'lucide-react'

// Import enhanced AI wizard step components - REAL PDF DATA EXTRACTION
import { FixedRealPDFExtractionStep } from './wizard-steps/FixedRealPDFExtractionStep'
import { MultiDocumentPDFExtractionStep } from './wizard-steps/MultiDocumentPDFExtractionStep'
import { EnhancedClientDetailsStep } from './wizard-steps/EnhancedClientDetailsStep'
import { EnhancedInsuranceInfoStep } from './wizard-steps/EnhancedInsuranceInfoStep'
import { ClaimInformationStep } from './wizard-steps/ClaimInformationStep'
import { PersonalPropertyStep } from './wizard-steps/PersonalPropertyStep'
import { ExpertsProvidersStep } from './wizard-steps/ExpertsProvidersStep'
import { MortgageInformationStep } from './wizard-steps/MortgageInformationStep'
import { ReferralInformationStep } from './wizard-steps/ReferralInformationStep'
import { ContractInformationStep } from './wizard-steps/ContractInformationStep'
import { PersonnelAssignmentStep } from './wizard-steps/PersonnelAssignmentStep'
import { OfficeTasksStep } from './wizard-steps/OfficeTasksStep'
import { CoverageIssueReviewStep } from './wizard-steps/CoverageIssueReviewStep'
import { CompletionStep } from './wizard-steps/CompletionStep'
// import CustomFieldsStep from './wizard-steps/CustomFieldsStep' // Temporarily disabled

interface EnhancedAIIntakeWizardProps {
  clientId?: string
  onComplete?: (claimData: any) => void
  onCancel?: () => void
}

interface WizardData {
  clientType: string
  isOrganization: boolean
  insuredDetails: {
    firstName?: string
    lastName?: string
    organizationName?: string
    phone?: string
    email?: string
  }
  mailingAddress: {
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }
  policyDetails: {
    policyNumber?: string
    effectiveDate?: string
    expirationDate?: string
  }
  insuranceCarrier: {
    name?: string
  }
  coverages: any[]
  deductibles: any[]
  priorPayments: any[]
  lossDetails: {
    lossReason?: string
    lossDate?: string
    causeOfLoss?: string
    estimatedAmount?: number
    propertyAddress?: string
  }
  personalPropertyDamage: boolean
  otherStructuresDamage: boolean
  mortgageInformation: any[]
  expertVendorInfo: any
  estimatingInfo: any
  referralInformation: {
    source?: any
    analytics?: any
  }
  contractInformation: any
  personnelAssignments: any[]
  officeTasks: any[]
  organizationId?: string
  organizationPolicies?: any
  customFields?: Record<string, any>
}

export function EnhancedAIIntakeWizard({ clientId, onComplete, onCancel }: EnhancedAIIntakeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<WizardData>({
    clientType: 'residential',
    isOrganization: false,
    insuredDetails: {},
    mailingAddress: {},
    policyDetails: {},
    insuranceCarrier: {},
    coverages: [],
    deductibles: [],
    priorPayments: [],
    lossDetails: {},
    personalPropertyDamage: false,
    otherStructuresDamage: false,
    mortgageInformation: [],
    expertVendorInfo: {},
    estimatingInfo: {},
    referralInformation: {},
    contractInformation: {},
    personnelAssignments: [],
    officeTasks: [],
    organizationId: 'demo-org-123',
    organizationPolicies: {},
    customFields: {}
  })
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [stepValidation, setStepValidation] = useState({})

  const steps = [
    {
      id: 'policy-upload',
      title: 'Multi-Document AI Processing',
      description: 'Upload multiple documents (policies, letters, settlements) for intelligent processing',
      icon: Brain,
      component: MultiDocumentPDFExtractionStep,
      required: false
    },
    {
      id: 'client-details',
      title: 'Client Information',
      description: 'Enter client details with AI cross-verification',
      icon: Users,
      component: EnhancedClientDetailsStep,
      required: true
    },
    {
      id: 'insurance-info',
      title: 'Insurance Details',
      description: 'Insurance information with AI validation and suggestions',
      icon: Shield,
      component: EnhancedInsuranceInfoStep,
      required: true
    },
    {
      id: 'claim-info',
      title: 'Claim Information',
      description: 'Loss details with AI insights and analysis',
      icon: Home,
      component: ClaimInformationStep,
      required: true
    },
    {
      id: 'property',
      title: 'Property Analysis',
      description: 'AI-powered property damage assessment',
      icon: Package,
      component: PersonalPropertyStep,
      required: false
    },
    {
      id: 'experts',
      title: 'Vendors & Experts',
      description: 'AI vendor recommendations and assignments',
      icon: Wrench,
      component: ExpertsProvidersStep,
      required: false
    },
    {
      id: 'mortgage',
      title: 'Mortgage Information',
      description: 'Mortgage companies and lender details with AI verification',
      icon: Building2,
      component: MortgageInformationStep,
      required: false
    },
    {
      id: 'referral',
      title: 'Referral Information', 
      description: 'Track referral source with AI analytics and insights',
      icon: Users,
      component: ReferralInformationStep,
      required: true
    },
    {
      id: 'contract',
      title: 'Contract Information',
      description: 'Fee structure and contract terms with AI validation',
      icon: FileText,
      component: ContractInformationStep,
      required: true
    },
    {
      id: 'personnel',
      title: 'Personnel Assignment',
      description: 'Assign team members with AI-powered recommendations',
      icon: UserCheck,
      component: PersonnelAssignmentStep,
      required: false
    },
    {
      id: 'tasks',
      title: 'Office Tasks',
      description: 'AI-generated tasks and follow-ups with prioritization',
      icon: CheckSquare,
      component: OfficeTasksStep,
      required: false
    },
    {
      id: 'coverage-review',
      title: 'Coverage Issue Review',
      description: 'AI analysis of potential coverage issues and policy concerns',
      icon: AlertCircle,
      component: CoverageIssueReviewStep,
      required: true
    },

    {
      id: 'completion',
      title: 'AI Summary & Submit',
      description: 'Comprehensive AI analysis and claim submission',
      icon: CheckCircle,
      component: CompletionStep,
      required: true
    }
  ]

  const updateWizardData = (newData: any) => {
    setWizardData(prev => ({ ...prev, ...newData }))
  }

  const handleAIProcessing = (processing: boolean) => {
    setIsAIProcessing(processing)
  }

  // Validation for required steps
  useEffect(() => {
    const currentStepData = steps[currentStep]
    if (!currentStepData.required) return

    let isValid = true
    let errors: string[] = []

    switch (currentStepData.id) {
      case 'client-details':
        if (!wizardData.insuredDetails?.firstName && !wizardData.insuredDetails?.organizationName) {
          isValid = false
          errors.push('Client name is required')
        }
        if (!wizardData.mailingAddress?.address) {
          isValid = false
          errors.push('Address is required')
        }
        break
      
      case 'insurance-info':
        if (!wizardData.insuranceCarrier?.name || !wizardData.policyDetails?.policyNumber) {
          isValid = false
          errors.push('Insurance carrier and policy number are required')
        }
        break
        
      case 'claim-info':
        if (!wizardData.lossDetails?.lossReason || !wizardData.lossDetails?.lossDate) {
          isValid = false
          errors.push('Loss reason and date are required')
        }
        break
    }

    setStepValidation(prev => ({
      ...prev,
      [currentStepData.id]: { isValid, errors }
    }))
  }, [wizardData, currentStep])

  const nextStep = () => {
    const currentStepData = steps[currentStep]
    const validation = stepValidation[currentStepData.id]
    
    if (currentStepData.required && validation && !validation.isValid) {
      alert('Please complete all required fields before proceeding')
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const handleComplete = async (finalData?: any) => {
    const completedData = { ...wizardData, ...finalData }
    onComplete?.(completedData)
  }

  const renderStepComponent = () => {
    const currentStepData = steps[currentStep]
    const StepComponent = currentStepData.component
    const commonProps = {
      data: wizardData,
      onUpdate: updateWizardData,
      onAIProcessing: handleAIProcessing,
      clientId: clientId
    }
    
    const stepProps = currentStepData.id === 'completion' 
      ? { ...commonProps, onSubmit: handleComplete }
      : commonProps
    
    return <StepComponent {...stepProps} />
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">AI-Enhanced Claim Wizard</h2>
                <p className="text-purple-100">Intelligent claim processing with advanced AI assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isAIProcessing && (
                <div className="flex items-center gap-2 text-purple-100">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                  <span className="text-sm">AI Processing...</span>
                </div>
              )}
              <Button
                onClick={onCancel}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-purple-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {steps.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                const Icon = step.icon
                const validation = stepValidation[step.id]
                const hasError = step.required && validation && !validation.isValid

                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => goToStep(index)}
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                        ${isActive 
                          ? 'border-purple-600 bg-purple-600 text-white' 
                          : isCompleted 
                            ? 'border-green-600 bg-green-600 text-white'
                            : hasError
                              ? 'border-red-500 bg-red-50 text-red-500'
                              : 'border-gray-300 bg-gray-50 text-gray-400'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : hasError ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </button>
                    {index < steps.length - 1 && (
                      <div className={`
                        w-12 h-0.5 mx-2 transition-colors
                        ${index < currentStep ? 'bg-green-600' : 'bg-gray-300'}
                      `} />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </div>
              <div className="text-xs text-gray-500">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </div>
            </div>
          </div>

          {/* Current Step Info */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              {React.createElement(steps[currentStep].icon, { className: "h-5 w-5 text-purple-600" })}
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600 mt-1">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
          {renderStepComponent()}
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {stepValidation[steps[currentStep].id]?.errors && (
                <div className="text-sm text-red-600 mr-4">
                  {stepValidation[steps[currentStep].id].errors.join(', ')}
                </div>
              )}
              
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={() => handleComplete()}
                  disabled={isAIProcessing}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete Claim
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={isAIProcessing}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
