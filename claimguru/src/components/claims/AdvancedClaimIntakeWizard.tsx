import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { 
  Upload, 
  FileText, 
  Users, 
  Building, 
  Shield, 
  DollarSign,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Brain,
  AlertCircle,
  Camera,
  Calculator
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

// Step 1: Policy Upload & AI Reading
import { PolicyUploadStep } from './wizard-steps/PolicyUploadStep'
// Step 2: Insured Details
import { InsuredDetailsStep } from './wizard-steps/InsuredDetailsStep'
// Step 3: Insurance Information
import { InsuranceInfoStep } from './wizard-steps/InsuranceInfoStep'
// Step 4: Claim Information
import { ClaimInformationStep } from './wizard-steps/ClaimInformationStep'
// Step 5: Personal Property (Conditional)
import { PersonalPropertyStep } from './wizard-steps/PersonalPropertyStep'
// Step 6: Other Structures (Conditional)
// import { OtherStructuresStep } from './wizard-steps/OtherStructuresStep' // Not implemented yet
// Step 7: Mortgage Information
// import { MortgageInformationStep } from './wizard-steps/MortgageInformationStep' // Not implemented yet
// Step 8: Expert/Vendor Information
// import { ExpertVendorStep } from './wizard-steps/ExpertVendorStep' // Not implemented yet
// Step 9: Estimating Information
// import { EstimatingInformationStep } from './wizard-steps/EstimatingInformationStep' // Not implemented yet
// Step 10: Referral & Contract Information
// import { ReferralContractStep } from './wizard-steps/ReferralContractStep' // Not implemented yet
// Step 11: Company Personnel
// import { CompanyPersonnelStep } from './wizard-steps/CompanyPersonnelStep' // Not implemented yet
// Step 12: Office Tasks
// import { OfficeTasksStep } from './wizard-steps/OfficeTasksStep' // Not implemented yet

interface WizardStep {
  id: number
  title: string
  description: string
  icon: React.ComponentType<any>
  completed: boolean
  required: boolean
  conditional?: boolean
}

interface ClaimWizardData {
  // Policy Information
  policyDocument?: File
  policyType?: 'dec_page' | 'full_policy'
  aiExtractedData?: any
  
  // Insured Details
  clientType: 'residential' | 'commercial'
  isOrganization: boolean
  organizationName?: string
  pointOfContact?: any
  insuredDetails: any
  coInsured?: any
  mailingAddress: any
  lossAddress?: any
  gateCode?: string
  tenantInfo?: any
  uninsuredParty?: any
  
  // Insurance Information
  insuranceCarrier: any
  policyDetails: any
  coverages: any[]
  deductibles: any[]
  priorPayments: any[]
  
  // Claim Information
  lossDetails: any
  personalPropertyDamage: boolean
  otherStructuresDamage: boolean
  
  // Conditional Steps
  personalPropertyItems?: any[]
  otherStructuresItems?: any[]
  
  // Additional Information
  mortgageInformation: any[]
  expertVendorInfo: any
  estimatingInfo: any
  referralContractInfo: any
  companyPersonnel: any[]
  officeTasks: any[]
}

const initialWizardData: ClaimWizardData = {
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
  referralContractInfo: {},
  companyPersonnel: [],
  officeTasks: []
}

interface AdvancedClaimIntakeWizardProps {
  clientId?: string
  onComplete: (claimData: ClaimWizardData) => void
  onCancel: () => void
}

export function AdvancedClaimIntakeWizard({ 
  clientId, 
  onComplete, 
  onCancel 
}: AdvancedClaimIntakeWizardProps) {
  const { userProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<ClaimWizardData>(initialWizardData)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'Policy Upload',
      description: 'Upload policy document for AI analysis',
      icon: Upload,
      completed: false,
      required: true
    },
    {
      id: 2,
      title: 'Insured Details',
      description: 'Client information and addresses',
      icon: Users,
      completed: false,
      required: true
    },
    {
      id: 3,
      title: 'Insurance Information',
      description: 'Policy details and coverage',
      icon: Shield,
      completed: false,
      required: true
    },
    {
      id: 4,
      title: 'Claim Information',
      description: 'Loss details and assessment',
      icon: FileText,
      completed: false,
      required: true
    },
    {
      id: 5,
      title: 'Personal Property',
      description: 'Item inventory and PPIF generation',
      icon: Building,
      completed: false,
      required: false,
      conditional: true
    },
    {
      id: 6,
      title: 'Other Structures',
      description: 'Additional structure damage',
      icon: Building,
      completed: false,
      required: false,
      conditional: true
    },
    {
      id: 7,
      title: 'Mortgage Information',
      description: 'Lender and loan details',
      icon: DollarSign,
      completed: false,
      required: false
    },
    {
      id: 8,
      title: 'Expert/Vendor Info',
      description: 'Contractors and service providers',
      icon: User,
      completed: false,
      required: false
    },
    {
      id: 9,
      title: 'Estimating Information',
      description: 'Estimator assignment',
      icon: Calculator,
      completed: false,
      required: false
    },
    {
      id: 10,
      title: 'Referral & Contract',
      description: 'Referral source and contract details',
      icon: FileText,
      completed: false,
      required: true
    },
    {
      id: 11,
      title: 'Company Personnel',
      description: 'Team member assignments',
      icon: Users,
      completed: false,
      required: true
    },
    {
      id: 12,
      title: 'Office Tasks',
      description: 'Task creation and assignment',
      icon: CheckCircle,
      completed: false,
      required: false
    }
  ]

  // Auto-save functionality
  const autoSave = async () => {
    if (!userProfile?.organization_id) return
    
    try {
      // Save wizard state to localStorage or database
      localStorage.setItem(`claim_wizard_${clientId || 'new'}`, JSON.stringify(wizardData))
    } catch (error) {
      console.error('Error auto-saving wizard data:', error)
    }
  }

  // Load saved wizard data
  useEffect(() => {
    const savedData = localStorage.getItem(`claim_wizard_${clientId || 'new'}`)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setWizardData(parsed)
      } catch (error) {
        console.error('Error loading saved wizard data:', error)
      }
    }
  }, [clientId])

  // Auto-save when data changes
  useEffect(() => {
    autoSave()
  }, [wizardData])

  const updateWizardData = (stepData: Partial<ClaimWizardData>) => {
    setWizardData(prev => ({ ...prev, ...stepData }))
  }

  const handleNext = async () => {
    if (currentStep < steps.length) {
      // Mark current step as completed
      const newSteps = [...steps]
      newSteps[currentStep - 1].completed = true
      
      // Save current step data
      setSaving(true)
      await autoSave()
      setSaving(false)
      
      // Move to next step (skip conditional steps if not applicable)
      let nextStep = currentStep + 1
      
      // Skip personal property step if no personal property damage
      if (nextStep === 5 && !wizardData.personalPropertyDamage) {
        nextStep = 6
      }
      
      // Skip other structures step if no other structures damage
      if (nextStep === 6 && !wizardData.otherStructuresDamage) {
        nextStep = 7
      }
      
      setCurrentStep(nextStep)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      let prevStep = currentStep - 1
      
      // Skip conditional steps when going back
      if (prevStep === 6 && !wizardData.otherStructuresDamage) {
        prevStep = 5
      }
      if (prevStep === 5 && !wizardData.personalPropertyDamage) {
        prevStep = 4
      }
      
      setCurrentStep(prevStep)
    }
  }

  const handleSaveAndExit = async () => {
    setSaving(true)
    await autoSave()
    setSaving(false)
    onCancel()
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Final validation and save
      await autoSave()
      onComplete(wizardData)
      
      // Clear saved data
      localStorage.removeItem(`claim_wizard_${clientId || 'new'}`)
    } catch (error) {
      console.error('Error completing wizard:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PolicyUploadStep
            data={wizardData}
            onUpdate={updateWizardData}
            onAIProcessing={setAiProcessing}
          />
        )
      case 2:
        return (
          <InsuredDetailsStep
            data={wizardData}
            onUpdate={updateWizardData}
            clientId={clientId}
          />
        )
      case 3:
        return (
          <InsuranceInfoStep
            data={wizardData}
            onUpdate={updateWizardData}
          />
        )
      case 4:
        return (
          <ClaimInformationStep
            data={wizardData}
            onUpdate={updateWizardData}
          />
        )
      case 5:
        return wizardData.personalPropertyDamage ? (
          <PersonalPropertyStep
            data={wizardData}
            onUpdate={updateWizardData}
          />
        ) : null
      case 6:
        return wizardData.otherStructuresDamage ? (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Other Structures Step</h3>
            <p className="text-gray-600">This step is under development</p>
          </div>
        ) : null
      case 7:
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Mortgage Information Step</h3>
            <p className="text-gray-600">This step is under development</p>
          </div>
        )
      case 8:
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Expert/Vendor Step</h3>
            <p className="text-gray-600">This step is under development</p>
          </div>
        )
      case 9:
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Estimating Information Step</h3>
            <p className="text-gray-600">This step is under development</p>
          </div>
        )
      case 10:
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Referral & Contract Step</h3>
            <p className="text-gray-600">This step is under development</p>
          </div>
        )
      case 11:
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Company Personnel Step</h3>
            <p className="text-gray-600">This step is under development</p>
          </div>
        )
      case 12:
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Office Tasks Step</h3>
            <p className="text-gray-600">This step is under development</p>
          </div>
        )
      default:
        return null
    }
  }

  const currentStepData = steps[currentStep - 1]
  const isLastStep = currentStep === steps.length
  const canProceed = currentStepData?.required ? currentStepData.completed : true

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Claim Intake</h1>
          <p className="text-gray-600 mt-2">
            AI-powered comprehensive claim intake wizard
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {aiProcessing && (
            <div className="flex items-center gap-2 text-purple-600">
              <Brain className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">AI Processing...</span>
            </div>
          )}
          
          {saving && (
            <div className="flex items-center gap-2 text-blue-600">
              <Save className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Auto-saving...</span>
            </div>
          )}
          
          <Button variant="outline" onClick={handleSaveAndExit}>
            Save & Exit
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Progress</h3>
            <span className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          
          <div className="grid grid-cols-12 gap-2 mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = step.completed
              const isAccessible = index < currentStep || isCompleted
              
              return (
                <div
                  key={step.id}
                  className={`relative flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-purple-100 border-2 border-purple-500' 
                      : isCompleted 
                      ? 'bg-green-100 border border-green-500' 
                      : isAccessible
                      ? 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                      : 'bg-gray-50 border border-gray-200 opacity-50'
                  }`}
                  onClick={() => isAccessible && setCurrentStep(step.id)}
                >
                  <Icon className={`h-5 w-5 mb-1 ${
                    isActive 
                      ? 'text-purple-600' 
                      : isCompleted 
                      ? 'text-green-600' 
                      : 'text-gray-500'
                  }`} />
                  
                  <span className={`text-xs text-center font-medium ${
                    isActive 
                      ? 'text-purple-900' 
                      : isCompleted 
                      ? 'text-green-900' 
                      : 'text-gray-700'
                  }`}>
                    {step.title}
                  </span>
                  
                  {step.required && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                  
                  {isCompleted && (
                    <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-600 bg-white rounded-full" />
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <currentStepData.icon className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
              <p className="text-gray-600 text-sm mt-1">{currentStepData.description}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-3">
          {!isLastStep ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed || aiProcessing}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading || aiProcessing}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete Claim
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
