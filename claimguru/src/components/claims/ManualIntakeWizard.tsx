/**
 * MANUAL INTAKE WIZARD
 * 
 * This wizard provides a traditional form-based approach for claim intake.
 * Users manually enter all information without AI assistance or PDF processing.
 * 
 * Key Features:
 * - Traditional step-by-step form interface
 * - Manual data entry for all fields
 * - Same field schemas as AI wizard (shared via useSharedFieldSchemas)
 * - Progress saving and restoration
 * - Client-friendly interface for direct data entry
 * 
 * Use Cases:
 * - Clients who prefer manual data entry
 * - Cases where AI/PDF processing is not needed
 * - Quick claim entry without document processing
 * - Training and onboarding scenarios
 * 
 * Field Schema Sharing:
 * Both Manual and AI wizards use identical field definitions from sharedFieldSchemas.ts
 * Any changes to field structures automatically apply to both wizards.
 */

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
  AlertCircle,
  Building2,
  UserCheck,
  CheckSquare,
  X,
  Save,
  Clock,
  RotateCcw
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { WizardProgressService } from '../../services/wizardProgressService'
import { useWizardStepValidation } from '../../hooks/useSharedFieldSchemas'

// Import manual wizard step components (traditional forms without AI features)
import { ManualClientDetailsStep } from './wizard-steps/ManualClientDetailsStep'
import { ManualInsuranceInfoStep } from './wizard-steps/ManualInsuranceInfoStep'
import { ManualClaimInformationStep } from './wizard-steps/ManualClaimInformationStep'
import { PersonalPropertyStep } from './wizard-steps/PersonalPropertyStep'
import { ExpertsProvidersStep } from './wizard-steps/ExpertsProvidersStep'
import { MortgageInformationStep } from './wizard-steps/MortgageInformationStep'
import { ReferralInformationStep } from './wizard-steps/ReferralInformationStep'
import { ContractInformationStep } from './wizard-steps/ContractInformationStep'
import { BuildingConstructionStep } from './wizard-steps/BuildingConstructionStep'
import { PersonnelAssignmentStep } from './wizard-steps/PersonnelAssignmentStep'
import { OfficeTasksStep } from './wizard-steps/OfficeTasksStep'
import { CoverageIssueReviewStep } from './wizard-steps/CoverageIssueReviewStep'
import { CompletionStep } from './wizard-steps/CompletionStep'

interface ManualIntakeWizardProps {
  clientId?: string
  onComplete?: (claimData: any) => void
  onCancel?: () => void
}

interface WizardData {
  clientType: string
  isOrganization: boolean
  
  // Manual Data Storage (same schema as AI wizard)
  manualEntry: boolean // Flag to indicate this is manual entry
  
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
    insurerName?: string
    agentName?: string
    agentPhone?: string
    deductible?: string
    policyType?: string
    coverageA?: string
    coverageB?: string
    coverageC?: string
    coverageD?: string
  }
  claimInformation: {
    dateOfLoss?: string
    timeOfLoss?: string
    causeOfLoss?: string
    damageDescription?: string
    estimatedDamages?: string
    lossLocation?: string
    weatherConditions?: string
    policeCalled?: boolean
    policeReportNumber?: string
    emergencyMitigationRequired?: boolean
    mitigationDescription?: string
    claimDescription?: string
  }
  // ... (rest of the fields same as AI wizard)
}

export function ManualIntakeWizard({ 
  clientId, 
  onComplete, 
  onCancel 
}: ManualIntakeWizardProps) {
  const { userProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<WizardData>({
    clientType: 'individual',
    isOrganization: false,
    manualEntry: true,
    insuredDetails: {},
    mailingAddress: {},
    policyDetails: {},
    claimInformation: {}
  })
  
  const [stepValidation, setStepValidation] = useState<Record<string, any>>({})
  const { validateStep, canProceed: canStepProceed, getStepStatus } = useWizardStepValidation()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [progressId, setProgressId] = useState<string | null>(null)

  // Manual Intake Wizard Steps (same fields but without AI-specific features)
  const steps = [
    {
      id: 'client-details',
      title: 'Client Information',
      description: 'Enter client details and contact information',
      icon: Users,
      component: ManualClientDetailsStep,
      required: true
    },
    {
      id: 'insurance-info',
      title: 'Insurance Details',
      description: 'Enter policy information and coverage details',
      icon: Shield,
      component: ManualInsuranceInfoStep,
      required: true
    },
    {
      id: 'claim-info',
      title: 'Claim Information',
      description: 'Describe the loss details and circumstances',
      icon: Home,
      component: ManualClaimInformationStep,
      required: true
    },
    {
      id: 'property',
      title: 'Property Details',
      description: 'Property damage assessment and itemization',
      icon: Package,
      component: PersonalPropertyStep,
      required: false
    },
    {
      id: 'building-construction',
      title: 'Building Construction',
      description: 'Building details and construction specifications (Optional)',
      icon: Building2,
      component: BuildingConstructionStep,
      required: false
    },
    {
      id: 'experts',
      title: 'Vendors & Experts',
      description: 'Assign vendors and expert professionals',
      icon: Wrench,
      component: ExpertsProvidersStep,
      required: false
    },
    {
      id: 'mortgage',
      title: 'Mortgage Information',
      description: 'Mortgage companies and lender details',
      icon: Building2,
      component: MortgageInformationStep,
      required: false
    },
    {
      id: 'referral',
      title: 'Referral Information', 
      description: 'Track referral source and lead information',
      icon: Users,
      component: ReferralInformationStep,
      required: true
    },
    {
      id: 'contract',
      title: 'Contract Information',
      description: 'Fee structure and contract terms',
      icon: FileText,
      component: ContractInformationStep,
      required: true
    },
    {
      id: 'personnel',
      title: 'Personnel Assignment',
      description: 'Assign team members and responsibilities',
      icon: UserCheck,
      component: PersonnelAssignmentStep,
      required: false
    },
    {
      id: 'tasks',
      title: 'Office Tasks',
      description: 'Create initial tasks and follow-ups',
      icon: CheckSquare,
      component: OfficeTasksStep,
      required: false
    },
    {
      id: 'coverage-review',
      title: 'Coverage Review',
      description: 'Review potential coverage issues and policy concerns',
      icon: AlertCircle,
      component: CoverageIssueReviewStep,
      required: true
    },
    {
      id: 'completion',
      title: 'Review & Submit',
      description: 'Final review and claim submission',
      icon: CheckCircle,
      component: CompletionStep,
      required: true
    }
  ]

  const updateWizardData = (newData: any) => {
    const updatedData = { ...wizardData, ...newData, manualEntry: true }
    setWizardData(prev => ({ ...prev, ...newData, manualEntry: true }))
    setHasUnsavedChanges(true)
    
    // Auto-save after 2 seconds of inactivity
    debouncedSave()
  }

  // Debounced save function
  const debouncedSave = React.useCallback(
    debounce(() => {
      saveProgress()
    }, 2000),
    [wizardData, currentStep]
  )

  // Debounce utility function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Save progress function
  const saveProgress = async (stepOverride?: number) => {
    if (!userProfile?.id || !userProfile?.organization_id) {
      console.warn('Cannot save progress: missing user profile')
      return
    }

    setIsSaving(true)
    try {
      const stepStatuses = {}
      steps.forEach((step, index) => {
        const validation = stepValidation[step.id]
        stepStatuses[step.id] = {
          completed: index < currentStep,
          required: step.required,
          validation_errors: validation?.errors || [],
          completed_at: index < currentStep ? new Date().toISOString() : undefined
        }
      })

      const progressData = {
        user_id: userProfile.id,
        organization_id: userProfile.organization_id,
        wizard_type: 'claim_manual' as const,
        current_step: stepOverride ?? currentStep,
        total_steps: steps.length,
        progress_percentage: Math.round(((stepOverride ?? currentStep) / steps.length) * 100),
        wizard_data: wizardData,
        step_statuses: stepStatuses,
        last_saved_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      const savedProgress = await WizardProgressService.saveProgress(progressData)
      if (savedProgress) {
        setProgressId(savedProgress.id!)
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        console.log('✅ Manual wizard progress saved successfully')
      }
    } catch (error) {
      console.error('Error saving manual wizard progress:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      saveProgress(newStep)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      saveProgress(newStep)
    }
  }

  const handleComplete = async () => {
    try {
      // Save final progress
      await saveProgress(steps.length)
      
      // Create claim data with manual entry flag
      const claimData = {
        ...wizardData,
        manualEntry: true,
        dataSource: 'manual_input',
        completedAt: new Date().toISOString(),
        progressId
      }
      
      console.log('✅ Manual intake wizard completed:', claimData)
      onComplete?.(claimData)
    } catch (error) {
      console.error('Error completing manual wizard:', error)
    }
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = confirm('You have unsaved changes. Are you sure you want to cancel?')
      if (!confirmCancel) return
    }
    onCancel?.()
  }

  const currentStepData = steps[currentStep]
  const CurrentStepComponent = currentStepData.component

  const isStepValid = (stepIndex: number): boolean => {
    const step = steps[stepIndex]
    if (!step.required) return true
    
    // Use shared validation logic
    const canProceedResult = canStepProceed(step.id, wizardData, step.required)
    console.log(`Step validation for ${step.id}:`, {
      stepId: step.id,
      required: step.required,
      canProceed: canProceedResult,
      wizardData: wizardData
    })
    return canProceedResult
  }

  const canProceed = isStepValid(currentStep)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Manual Claim Intake
              </h2>
              <p className="text-gray-600">
                Step {currentStep + 1} of {steps.length}: {currentStepData.title}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isSaving && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Saving...</span>
              </div>
            )}
            
            {lastSaved && (
              <div className="text-sm text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
            
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / (steps.length - 1)) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            <CurrentStepComponent
              data={wizardData}
              onUpdate={updateWizardData}
            />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {!canProceed && currentStepData.required && (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Please complete required fields
              </span>
            )}
          </div>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleComplete}
              disabled={!canProceed}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Complete Intake
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
