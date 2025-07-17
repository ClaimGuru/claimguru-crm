/**
 * AI-ENHANCED INTAKE WIZARD
 * 
 * This wizard provides an AI-powered approach for claim intake with advanced features.
 * Users can upload PDF documents for automatic data extraction and get AI assistance.
 * 
 * Key Features:
 * - PDF upload and intelligent data extraction
 * - AI-powered field population and suggestions
 * - Multi-document processing capabilities
 * - Hybrid extraction methods (PDF.js → Tesseract OCR → Google Vision → OpenAI)
 * - AI-assisted writing and recommendations
 * - Confidence scoring and validation
 * 
 * Use Cases:
 * - Clients with policy documents ready for upload
 * - Complex claims requiring AI analysis
 * - Cases where time efficiency is critical
 * - Document-heavy claim processing
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
  Brain,
  Sparkles,
  AlertCircle,
  AlertTriangle,
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
import { WizardValidationService, StepValidationResult } from '../../services/wizardValidationService'
import { ValidationSummary } from '../ui/ValidationSummary'

// Import enhanced AI wizard step components - INTELLIGENT AI FLOW
import { FixedRealPDFExtractionStep } from './wizard-steps/FixedRealPDFExtractionStep'
import { MultiDocumentPDFExtractionStep } from './wizard-steps/MultiDocumentPDFExtractionStep'
// New intelligent workflow components
import { PolicyDocumentUploadStep } from './wizard-steps/PolicyDocumentUploadStep'
import { AdditionalDocumentsStep } from './wizard-steps/AdditionalDocumentsStep'
import { EnhancedClientDetailsStep } from './wizard-steps/EnhancedClientDetailsStep'
import { IntelligentClientDetailsStep } from './wizard-steps/IntelligentClientDetailsStep'
import { intelligentWizardService } from '../../services/intelligentWizardService'
import { EnhancedInsuranceInfoStep } from './wizard-steps/EnhancedInsuranceInfoStep'
import { ClaimInformationStep } from './wizard-steps/ClaimInformationStep'
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
// import CustomFieldsStep from './wizard-steps/CustomFieldsStep' // Temporarily disabled

interface EnhancedAIIntakeWizardProps {
  clientId?: string
  onComplete?: (claimData: any) => void
  onCancel?: () => void
}

interface WizardData {
  clientType: string
  isOrganization: boolean
  
  // Enhanced AI Data Storage
  extractedPolicyData?: {
    validated: boolean
    confidence: number
    source: 'ai_extraction' | 'manual_entry'
    extractedAt?: string
  }
  additionalDocuments?: {
    documents: any[]
    aiAnalysis?: any
    processedAt?: string
  }
  aiSuggestions?: {
    descriptions?: string[]
    insights?: string[]
    recommendations?: string[]
  }
  
  insuredDetails: {
    firstName?: string
    lastName?: string
    organizationName?: string
    phone?: string
    email?: string
    // AI enhancement flags
    aiSuggested?: boolean
    confidenceScore?: number
  }
  mailingAddress: {
    address?: string
    city?: string
    state?: string
    zipCode?: string
    aiSuggested?: boolean
  }
  policyDetails: {
    policyNumber?: string
    effectiveDate?: string
    expirationDate?: string
    insuredName?: string
    insurerName?: string
    propertyAddress?: string
    coverageAmount?: string
    deductible?: string
    aiExtracted?: boolean
    validationComplete?: boolean
  }
  insuranceCarrier: {
    name?: string
    aiSuggested?: boolean
  }
  coverages: any[]
  deductibles: any[]
  priorPayments: any[]
  lossDetails: {
    reasonForLoss?: string
    dateOfLoss?: string
    causeOfLoss?: string
    severity?: string
    lossDescription?: string
    aiSuggestedDescription?: string
    yearBuilt?: string
    isFEMA?: boolean
    isHabitable?: boolean
    alternativeLiving?: string
    monthlyLivingCost?: string
    stateOfEmergency?: boolean
    personalPropertyDamage?: boolean
    otherStructuresDamage?: boolean
    estimatedAmount?: number
    propertyAddress?: string
    description?: string
    documentBasedInsights?: string[]
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
  const { userProfile } = useAuth()
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
    organizationId: userProfile?.organization_id || 'demo-org-123',
    organizationPolicies: {},
    customFields: {}
  })
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [stepValidation, setStepValidation] = useState<Record<string, StepValidationResult>>({})
  const [showValidationSummary, setShowValidationSummary] = useState(false)
  const [progressId, setProgressId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const steps = [
    {
      id: 'policy-upload',
      title: 'Policy & Declaration Upload',
      description: 'Upload your insurance policy or declaration page for AI extraction and validation',
      icon: FileText,
      component: PolicyDocumentUploadStep,
      required: true,
      priority: 'high'
    },
    {
      id: 'additional-documents',
      title: 'Additional Claim Documents',
      description: 'Upload supporting documents: photos, estimates, correspondence, reports',
      icon: Package,
      component: AdditionalDocumentsStep,
      required: false,
      priority: 'medium'
    },
    {
      id: 'client-details',
      title: 'Client Information',
      description: 'Verify AI-extracted client details and complete missing information',
      icon: Users,
      component: IntelligentClientDetailsStep,
      required: true,
      aiEnhanced: true
    },
    {
      id: 'insurance-info',
      title: 'Insurance Details',
      description: 'Confirm AI-extracted policy information and coverage details',
      icon: Shield,
      component: EnhancedInsuranceInfoStep,
      required: true,
      aiEnhanced: true
    },
    {
      id: 'claim-info',
      title: 'Claim Information',
      description: 'Describe loss details with AI-assisted writing and document insights',
      icon: Home,
      component: ClaimInformationStep,
      required: true,
      aiEnhanced: true
    },
    {
      id: 'property',
      title: 'Property Analysis',
      description: 'AI-powered property damage assessment based on uploaded documents',
      icon: Package,
      component: PersonalPropertyStep,
      required: false,
      aiEnhanced: true
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
    const updatedData = { ...wizardData, ...newData }
    setWizardData(prev => ({ ...prev, ...newData }))
    setHasUnsavedChanges(true)
    
    // Update intelligent wizard service with extracted policy data
    if (newData.extractedPolicyData) {
      console.log('🧠 Setting extracted policy data in intelligent service:', newData.extractedPolicyData)
      intelligentWizardService.setExtractedPolicyData(newData.extractedPolicyData)
    }
    
    // Update intelligent wizard service with processed documents
    if (newData.additionalDocuments && Array.isArray(newData.additionalDocuments)) {
      console.log('📄 Setting processed documents in intelligent service:', newData.additionalDocuments.length)
      intelligentWizardService.addProcessedDocuments(newData.additionalDocuments)
    }
    
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
        wizard_type: 'claim' as const,
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
        console.log('✅ Progress saved successfully')
      } else {
        // Even if saving fails, don't block the wizard
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        console.warn('⚠️ Progress saving failed, but wizard continues to function')
      }
    } catch (error) {
      console.error('❌ Failed to save progress:', error)
      // Don't block the wizard even if progress saving fails
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  // Initialize intelligent wizard service whenever wizard data changes
  useEffect(() => {
    if (wizardData.extractedPolicyData) {
      console.log('🧠 Initializing intelligent service with policy data');
      intelligentWizardService.setExtractedPolicyData(wizardData.extractedPolicyData);
    }
    
    if (wizardData.additionalDocuments && Array.isArray(wizardData.additionalDocuments)) {
      console.log('📄 Initializing intelligent service with documents:', wizardData.additionalDocuments.length);
      intelligentWizardService.addProcessedDocuments(wizardData.additionalDocuments);
    }
  }, [wizardData.extractedPolicyData, wizardData.additionalDocuments]);

  // Load existing progress on mount
  useEffect(() => {
    const loadExistingProgress = async () => {
      if (!userProfile?.id || !userProfile?.organization_id) return

      try {
        const existingProgress = await WizardProgressService.loadProgress(
          userProfile.id,
          userProfile.organization_id,
          'claim'
        )

        if (existingProgress && existingProgress.progress_percentage < 100) {
          const shouldRestore = window.confirm(
            `You have an incomplete claim wizard (${existingProgress.progress_percentage}% complete). Would you like to continue where you left off?`
          )

          if (shouldRestore) {
            setProgressId(existingProgress.id!)
            setCurrentStep(existingProgress.current_step)
            setWizardData(existingProgress.wizard_data)
            setLastSaved(new Date(existingProgress.last_saved_at))
            
            // Initialize intelligent wizard service with restored data
            if (existingProgress.wizard_data.extractedPolicyData) {
              console.log('🧠 Initializing intelligent service with restored policy data:', existingProgress.wizard_data.extractedPolicyData)
              intelligentWizardService.setExtractedPolicyData(existingProgress.wizard_data.extractedPolicyData)
            }
            
            if (existingProgress.wizard_data.additionalDocuments && Array.isArray(existingProgress.wizard_data.additionalDocuments)) {
              console.log('📄 Initializing intelligent service with restored documents:', existingProgress.wizard_data.additionalDocuments.length)
              intelligentWizardService.addProcessedDocuments(existingProgress.wizard_data.additionalDocuments)
            }
            
            console.log('✅ Restored wizard progress and initialized intelligent service')
          } else {
            // User chose not to restore, delete the old progress
            if (existingProgress.id) {
              await WizardProgressService.deleteProgress(existingProgress.id)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load existing progress:', error)
      }
    }

    loadExistingProgress()
  }, [userProfile])

  // Periodic sync check to restore database connectivity
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        await WizardProgressService.checkAndSync()
      } catch (error) {
        console.warn('Sync check failed:', error)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(syncInterval)
  }, [])

  // Format time ago utility
  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  // Handle manual save
  const handleManualSave = async () => {
    await saveProgress()
  }

  // Handle wizard cancellation
  const handleCancel = async () => {
    if (hasUnsavedChanges && progressId) {
      const shouldDelete = window.confirm(
        'You have unsaved changes. Do you want to save your progress before closing?'
      )
      
      if (shouldDelete) {
        await saveProgress()
      }
    }
    
    onCancel?.()
  }

  const scrollToField = (fieldPath: string) => {
    // Convert field path to a potential DOM element ID or selector
    const elementSelectors = [
      `[data-field="${fieldPath}"]`,
      `[name="${fieldPath}"]`,
      `[id*="${fieldPath.replace('.', '-')}"]`,
      `input[placeholder*="${fieldPath.split('.').pop()}"]`,
      `select[data-testid*="${fieldPath}"]`
    ]
    
    for (const selector of elementSelectors) {
      const element = document.querySelector(selector)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Flash the field to draw attention
        const originalBorder = (element as HTMLElement).style.border
        ;(element as HTMLElement).style.border = '2px solid #ef4444'
        setTimeout(() => {
          ;(element as HTMLElement).style.border = originalBorder
        }, 2000)
        
        // Focus the field if it's an input
        if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
          element.focus()
        }
        return
      }
    }
    
    // Fallback: scroll to the top of the current step content
    const stepContent = document.querySelector('[data-step-content]')
    if (stepContent) {
      stepContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleAIProcessing = (processing: boolean) => {
    setIsAIProcessing(processing)
  }

  // Enhanced validation for all steps
  useEffect(() => {
    // Validate current step
    const currentStepData = steps[currentStep]
    const validation = WizardValidationService.validateStep(currentStepData.id, wizardData)
    
    setStepValidation(prev => ({
      ...prev,
      [currentStepData.id]: validation
    }))
    
    // Auto-hide validation summary if step becomes valid
    if (validation.isValid && showValidationSummary) {
      setShowValidationSummary(false)
    }
  }, [wizardData, currentStep, showValidationSummary])

  const nextStep = async () => {
    const currentStepData = steps[currentStep]
    const validation = stepValidation[currentStepData.id]
    
    // Check if step is valid
    if (currentStepData.required && validation && !validation.isValid) {
      setShowValidationSummary(true)
      // Scroll to validation summary
      setTimeout(() => {
        const validationElement = document.getElementById('validation-summary')
        if (validationElement) {
          validationElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
      return
    }

    // Hide validation summary and proceed
    setShowValidationSummary(false)
    
    if (currentStep < steps.length - 1) {
      // Save progress before advancing
      await saveProgress(currentStep + 1)
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
    
    // Mark wizard as completed in progress tracking
    if (progressId) {
      await WizardProgressService.markCompleted(progressId, completedData)
    }
    
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
              {/* Progress Save Status */}
              <div className="flex items-center gap-3 text-purple-100">
                {isSaving && (
                  <div className="flex items-center gap-1">
                    <Save className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Saving...</span>
                  </div>
                )}
                {lastSaved && !isSaving && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">
                      Saved {formatTimeAgo(lastSaved)}
                    </span>
                  </div>
                )}
                {hasUnsavedChanges && !isSaving && (
                  <div className="flex items-center gap-1 text-yellow-200">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs">Unsaved changes</span>
                  </div>
                )}
                {isAIProcessing && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    <span className="text-sm">AI Processing...</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleManualSave}
                  variant="outline"
                  size="sm"
                  disabled={isSaving || !hasUnsavedChanges}
                  className="text-white border-white hover:bg-white hover:text-purple-600"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-purple-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
        <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]" data-step-content>
          {renderStepComponent()}
        </div>

        {/* Validation Summary */}
        {showValidationSummary && stepValidation[steps[currentStep].id] && (
          <div className="px-6 pb-4" id="validation-summary">
            <ValidationSummary
              stepValidation={stepValidation[steps[currentStep].id]}
              stepTitle={steps[currentStep].title}
              onDismiss={() => setShowValidationSummary(false)}
              onScrollToField={scrollToField}
              showProgress={true}
            />
          </div>
        )}

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {/* Progress save controls */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleManualSave}
                  variant="outline"
                  size="sm"
                  disabled={isSaving || !hasUnsavedChanges}
                  className="flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  {isSaving ? 'Saving...' : 'Save Progress'}
                </Button>
                
                {lastSaved && (
                  <span className="text-xs text-gray-500">
                    Saved {formatTimeAgo(lastSaved)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {stepValidation[steps[currentStep].id] && !stepValidation[steps[currentStep].id].isValid && (
                <div className="flex items-center gap-2 text-sm text-red-600 mr-4">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    {stepValidation[steps[currentStep].id].missingRequiredFields.length > 0
                      ? `${stepValidation[steps[currentStep].id].missingRequiredFields.length} required field${stepValidation[steps[currentStep].id].missingRequiredFields.length > 1 ? 's' : ''} missing`
                      : `${stepValidation[steps[currentStep].id].errors.length} validation error${stepValidation[steps[currentStep].id].errors.length > 1 ? 's' : ''}`
                    }
                  </span>
                </div>
              )}
              
              {stepValidation[steps[currentStep].id]?.isValid && steps[currentStep].required && (
                <div className="flex items-center gap-2 text-sm text-green-600 mr-4">
                  <CheckCircle className="h-4 w-4" />
                  <span>All required fields completed</span>
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
