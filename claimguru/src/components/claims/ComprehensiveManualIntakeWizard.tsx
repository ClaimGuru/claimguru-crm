/**
 * COMPREHENSIVE MANUAL INTAKE WIZARD - 9-PAGE STRUCTURE
 * 
 * This is the new unified manual claim intake wizard following the 9-page structure
 * as specified in the comprehensive revision requirements.
 * 
 * Features:
 * - 9-page wizard structure with standardized UI components
 * - Toggle switches instead of checkboxes throughout
 * - Standardized phone number and address inputs with Google autocomplete
 * - Proper form validation and error handling
 * - Progress saving and restoration
 * - Responsive design
 * - Multi-entity relational database support
 * 
 * Page Structure:
 * 1. Client Information (Individual/Business with contact details)
 * 2. Insurer Information (Company details and personnel)
 * 3. Policy Information (Policy details and coverage)
 * 4. Loss Information (Loss details, date, cause, severity)
 * 5. Mortgage Lender Information (Multiple lenders management)
 * 6. Referral Source Information (Referral type and details)
 * 7. Building Information (Construction details and features)
 * 8. Office Tasks & Follow-ups (Task management)
 * 9. Review & Completion (Final review and submission)
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { 
  FileText, 
  Users, 
  Shield, 
  Home, 
  Building2, 
  DollarSign, 
  UserCheck, 
  CheckSquare, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Save,
  Clock,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  Wrench,
  Calculator,
  Package
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { WizardProgressService } from '../../services/wizardProgressService'

// Import the updated 9-page wizard step components
import ClientInformationStep from './wizard-steps/ClientInformationStep'
import { InsurerInformationStep } from './wizard-steps/InsurerInformationStep'
import { PolicyInformationStep } from './wizard-steps/PolicyInformationStep'
import { ClaimInformationStep } from './wizard-steps/ClaimInformationStep'
import { MortgageInformationStep } from './wizard-steps/MortgageInformationStep'
import { ReferralInformationStep } from './wizard-steps/ReferralInformationStep'
import { BuildingConstructionStep } from './wizard-steps/BuildingConstructionStep'
import { OfficeTasksStep } from './wizard-steps/OfficeTasksStep'
import { CompletionStep } from './wizard-steps/CompletionStep'

interface ComprehensiveManualIntakeWizardProps {
  clientId?: string
  onComplete?: (claimData: any) => void
  onCancel?: () => void
}

interface WizardData {
  // Page 1: Client Information
  clientType: string
  firstName: string
  lastName: string
  businessName: string
  pointOfContactFirstName: string
  pointOfContactLastName: string
  primaryEmail: string
  phoneNumbers: any[]
  streetAddress: any
  mailingAddress: any
  isMailingSameAsLoss: boolean
  hasCoinsured: boolean
  coinsuredFirstName: string
  coinsuredLastName: string
  coinsuredEmail: string
  coinsuredPhoneNumbers: any[]
  relationshipToPrimary: string
  
  // Page 2: Insurer Information
  insurerInformation: any
  
  // Page 3: Policy Information
  policyInformation: any
  
  // Page 4: Loss Information
  lossDetails: any
  
  // Page 5: Mortgage Lender Information
  mortgageInformation: any
  
  // Page 6: Referral Source Information
  referralInformation: any
  
  // Page 7: Building Information
  buildingConstruction: any
  
  // Page 8: Office Tasks & Follow-ups
  officeTasks: any
  
  // Page 9: Review & Completion
  reviewComplete: boolean
  
  // Metadata
  wizardId: string
  createdAt: string
  lastModified: string
  currentStep: number
  completedSteps: number[]
}

const WIZARD_STEPS = [
  {
    id: 'client-information',
    title: 'Client Information',
    description: 'Client type, contact details, and addresses',
    icon: Users,
    component: ClientInformationStep
  },
  {
    id: 'insurer-information',
    title: 'Insurer Information',
    description: 'Insurance company and personnel details',
    icon: Shield,
    component: InsurerInformationStep
  },
  {
    id: 'policy-information',
    title: 'Policy Information',
    description: 'Policy details, coverage, and terms',
    icon: FileText,
    component: PolicyInformationStep
  },
  {
    id: 'loss-information',
    title: 'Loss Information',
    description: 'Loss details, cause, date, and severity',
    icon: AlertCircle,
    component: ClaimInformationStep
  },
  {
    id: 'mortgage-information',
    title: 'Mortgage Lender Information',
    description: 'Lender details and loan information',
    icon: DollarSign,
    component: MortgageInformationStep
  },
  {
    id: 'referral-information',
    title: 'Referral Source Information',
    description: 'Referral type and contact details',
    icon: UserCheck,
    component: ReferralInformationStep
  },
  {
    id: 'building-information',
    title: 'Building Information',
    description: 'Construction details and features',
    icon: Building2,
    component: BuildingConstructionStep
  },
  {
    id: 'office-tasks',
    title: 'Office Tasks & Follow-ups',
    description: 'Task management and assignments',
    icon: CheckSquare,
    component: OfficeTasksStep
  },
  {
    id: 'review-completion',
    title: 'Review & Completion',
    description: 'Final review and submission',
    icon: CheckCircle,
    component: CompletionStep
  }
]

export function ComprehensiveManualIntakeWizard({ 
  clientId, 
  onComplete, 
  onCancel 
}: ComprehensiveManualIntakeWizardProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<WizardData>({
    // Initialize with default values
    clientType: 'individual',
    firstName: '',
    lastName: '',
    businessName: '',
    pointOfContactFirstName: '',
    pointOfContactLastName: '',
    primaryEmail: '',
    phoneNumbers: [{
      id: 'primary',
      type: 'mobile',
      number: '',
      extension: '',
      isPrimary: true
    }],
    streetAddress: {
      streetAddress1: '',
      streetAddress2: '',
      city: '',
      state: '',
      zipCode: ''
    },
    mailingAddress: {
      streetAddress1: '',
      streetAddress2: '',
      city: '',
      state: '',
      zipCode: ''
    },
    isMailingSameAsLoss: false,
    hasCoinsured: false,
    coinsuredFirstName: '',
    coinsuredLastName: '',
    coinsuredEmail: '',
    coinsuredPhoneNumbers: [{
      id: 'coinsured_primary',
      type: 'mobile',
      number: '',
      extension: '',
      isPrimary: true
    }],
    relationshipToPrimary: '',
    insurerInformation: {},
    policyInformation: {},
    lossDetails: {},
    mortgageInformation: {},
    referralInformation: {},
    buildingConstruction: {},
    officeTasks: {},
    reviewComplete: false,
    wizardId: `manual_wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    currentStep: 0,
    completedSteps: []
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Load saved progress on component mount
  useEffect(() => {
    loadSavedProgress()
  }, [])

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (wizardData.wizardId && user) {
        saveProgress()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [wizardData, user])

  const loadSavedProgress = async () => {
    if (!user?.id) return

    try {
      // Use user's ID as organization ID (single tenant)
      const organizationId = user.id
      const savedData = await WizardProgressService.loadProgress(user.id, organizationId, 'claim_manual')
      if (savedData && savedData.wizard_data) {
        setWizardData(savedData.wizard_data)
        setCurrentStep(savedData.current_step || 0)
      }
    } catch (error) {
      console.error('Error loading saved progress:', error)
    }
  }

  const saveProgress = async () => {
    if (!user?.id || isSaving) return

    setIsSaving(true)
    setSaveStatus('saving')
    
    try {
      // Use user's ID as organization ID (single tenant)
      const organizationId = user.id
      
      const progressData = {
        user_id: user.id,
        organization_id: organizationId,
        wizard_type: 'claim_manual' as const,
        current_step: currentStep,
        total_steps: WIZARD_STEPS.length,
        progress_percentage: ((currentStep + 1) / WIZARD_STEPS.length) * 100,
        wizard_data: {
          ...wizardData,
          currentStep,
          lastModified: new Date().toISOString()
        },
        step_statuses: WIZARD_STEPS.reduce((acc, step, index) => {
          acc[step.id] = {
            completed: wizardData.completedSteps.includes(index),
            required: index < 4, // First 4 steps are required
            completed_at: wizardData.completedSteps.includes(index) ? new Date().toISOString() : undefined
          }
          return acc
        }, {} as any),
        last_saved_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      }
      
      await WizardProgressService.saveProgress(progressData)
      setSaveStatus('saved')
      
      // Clear save status after 2 seconds
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (error) {
      console.error('Error saving progress:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStepUpdate = (stepData: any) => {
    const updatedData = {
      ...wizardData,
      ...stepData,
      lastModified: new Date().toISOString()
    }
    setWizardData(updatedData)
    
    // Auto-save after data update
    setTimeout(() => saveProgress(), 1000)
  }

  const validateCurrentStep = (): boolean => {
    const currentStepId = WIZARD_STEPS[currentStep].id
    const errors: Record<string, string> = {}

    // Validation logic for each step
    switch (currentStepId) {
      case 'client-information':
        if (wizardData.clientType === 'individual') {
          if (!wizardData.firstName?.trim()) errors.firstName = 'First name is required'
          if (!wizardData.lastName?.trim()) errors.lastName = 'Last name is required'
        } else {
          if (!wizardData.businessName?.trim()) errors.businessName = 'Business name is required'
          if (!wizardData.pointOfContactFirstName?.trim()) errors.pointOfContactFirstName = 'Point of contact first name is required'
          if (!wizardData.pointOfContactLastName?.trim()) errors.pointOfContactLastName = 'Point of contact last name is required'
        }
        if (!wizardData.primaryEmail?.trim()) errors.primaryEmail = 'Primary email is required'
        if (!wizardData.phoneNumbers?.[0]?.number?.trim()) errors.primaryPhone = 'Primary phone number is required'
        break
        
      case 'loss-information':
        if (!wizardData.lossDetails?.reasonForLoss) errors.reasonForLoss = 'Reason for loss is required'
        if (!wizardData.lossDetails?.dateOfLoss) errors.dateOfLoss = 'Date of loss is required'
        if (!wizardData.lossDetails?.causeOfLoss) errors.causeOfLoss = 'Cause of loss is required'
        break
        
      // Add more validation rules as needed
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return
    }

    if (currentStep < WIZARD_STEPS.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      
      // Mark current step as completed
      const updatedData = {
        ...wizardData,
        currentStep: nextStep,
        completedSteps: [...new Set([...wizardData.completedSteps, currentStep])]
      }
      setWizardData(updatedData)
      
      // Save progress
      saveProgress()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      
      const updatedData = {
        ...wizardData,
        currentStep: prevStep
      }
      setWizardData(updatedData)
    }
  }

  const handleComplete = async () => {
    if (!validateCurrentStep()) {
      return
    }

    try {
      // Final data processing and validation
      const finalData = {
        ...wizardData,
        reviewComplete: true,
        completedAt: new Date().toISOString(),
        completedSteps: [...new Set([...wizardData.completedSteps, currentStep])]
      }

      // Save final data
      const organizationId = user?.id || ''
      const progressData = {
        user_id: user?.id || '',
        organization_id: organizationId,
        wizard_type: 'claim_manual' as const,
        current_step: currentStep,
        total_steps: WIZARD_STEPS.length,
        progress_percentage: 100,
        wizard_data: finalData,
        step_statuses: WIZARD_STEPS.reduce((acc, step, index) => {
          acc[step.id] = {
            completed: true,
            required: true,
            completed_at: new Date().toISOString()
          }
          return acc
        }, {} as any),
        last_saved_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      await WizardProgressService.saveProgress(progressData)
      
      // Call completion callback
      if (onComplete) {
        onComplete(finalData)
      }
    } catch (error) {
      console.error('Error completing wizard:', error)
      setSaveStatus('error')
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  const currentStepConfig = WIZARD_STEPS[currentStep]
  const CurrentStepComponent = currentStepConfig.component
  const progressPercentage = ((currentStep + 1) / WIZARD_STEPS.length) * 100

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                Manual Claim Intake Wizard
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Complete 9-page claim intake process
              </p>
            </div>
            
            {/* Save Status */}
            <div className="flex items-center gap-3">
              {saveStatus && (
                <div className="flex items-center gap-2 text-sm">
                  {saveStatus === 'saving' && <LoadingSpinner size="sm" />}
                  {saveStatus === 'saved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {saveStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                  <span className={
                    saveStatus === 'saved' ? 'text-green-600' :
                    saveStatus === 'error' ? 'text-red-600' :
                    'text-gray-600'
                  }>
                    {saveStatus === 'saving' ? 'Saving...' :
                     saveStatus === 'saved' ? 'Saved' :
                     saveStatus === 'error' ? 'Save failed' : ''}
                  </span>
                </div>
              )}
              
              <Button onClick={saveProgress} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep + 1} of {WIZARD_STEPS.length}: {currentStepConfig.title}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Step Navigation */}
          <div className="grid grid-cols-3 lg:grid-cols-9 gap-2 mb-6">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = wizardData.completedSteps.includes(index)
              const isCurrent = index === currentStep
              const isAccessible = index <= currentStep || isCompleted

              return (
                <button
                  key={step.id}
                  onClick={() => isAccessible && setCurrentStep(index)}
                  disabled={!isAccessible}
                  className={`
                    flex flex-col items-center p-2 rounded-lg text-xs transition-colors
                    ${isCurrent ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' :
                      isCompleted ? 'bg-green-100 text-green-700 border border-green-300' :
                      isAccessible ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200' :
                      'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'}
                  `}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="text-center leading-tight">{step.title}</span>
                  {isCompleted && <CheckCircle className="h-3 w-3 mt-1 text-green-600" />}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <currentStepConfig.icon className="h-5 w-5" />
            {currentStepConfig.title}
          </CardTitle>
          <p className="text-gray-600">{currentStepConfig.description}</p>
        </CardHeader>
        
        <CardContent>
          {/* Validation Errors */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                <AlertCircle className="h-4 w-4" />
                Please fix the following errors:
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step Component */}
          <CurrentStepComponent
            data={wizardData}
            onUpdate={handleStepUpdate}
          />
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button onClick={handleCancel} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>

            <div className="flex gap-3">
              <Button onClick={saveProgress} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save & Continue Later
              </Button>
              
              {currentStep < WIZARD_STEPS.length - 1 ? (
                <Button onClick={handleNext} variant="primary">
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} variant="primary">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Intake
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ComprehensiveManualIntakeWizard
