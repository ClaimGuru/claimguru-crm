/**
 * REFACTORED AI-ENHANCED INTAKE WIZARD
 * 
 * Now uses the UnifiedWizardFramework to eliminate structural duplication
 * while preserving all AI-enhanced functionality.
 */

import React, { useState, useEffect } from 'react'
import { FileText, Users, Shield, Home, Package, Wrench, Building2, UserCheck, CheckSquare, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { WizardProgressService } from '../../services/wizardProgressService'
import { WizardValidationService } from '../../services/wizardValidationService'
import { intelligentWizardService } from '../../services/intelligentWizardService'
import UnifiedWizardFramework, { WizardConfig, WizardStep } from './UnifiedWizardFramework'

// Import unified wizard step components
import { UnifiedPDFExtractionStep } from '../claims/wizard-steps/UnifiedPDFExtractionStep'
import { UnifiedDocumentUpload } from '../claims/wizard-steps/UnifiedDocumentUpload'
import { UnifiedClientDetailsStep } from '../claims/wizard-steps/UnifiedClientDetailsStep'
import { UnifiedInsuranceInfoStep } from '../claims/wizard-steps/UnifiedInsuranceInfoStep'
import { ClaimInformationStep } from '../claims/wizard-steps/ClaimInformationStep'
import { PersonalPropertyStep } from '../claims/wizard-steps/PersonalPropertyStep'
import { ExpertsProvidersStep } from '../claims/wizard-steps/ExpertsProvidersStep'
import { MortgageInformationStep } from '../claims/wizard-steps/MortgageInformationStep'
import { ReferralInformationStep } from '../claims/wizard-steps/ReferralInformationStep'
import { ContractInformationStep } from '../claims/wizard-steps/ContractInformationStep'
import { BuildingConstructionStep } from '../claims/wizard-steps/BuildingConstructionStep'
import { PersonnelAssignmentStep } from '../claims/wizard-steps/PersonnelAssignmentStep'
import { OfficeTasksStep } from '../claims/wizard-steps/OfficeTasksStep'
import { CoverageIssueReviewStep } from '../claims/wizard-steps/CoverageIssueReviewStep'
import { CompletionStep } from '../claims/wizard-steps/CompletionStep'

interface RefactoredEnhancedAIIntakeWizardProps {
  clientId?: string
  onComplete?: (claimData: any) => void
  onCancel?: () => void
}

interface WizardData {
  clientType: string
      // isOrganization: boolean
  extractedPolicyData?: any
  additionalDocuments?: any
  aiSuggestions?: any
  insuredDetails: any
  mailingAddress: any
  policyDetails: any
  insuranceCarrier: any
  coverages: any[]
  deductibles: any[]
  priorPayments: any[]
  lossDetails: any
  personalPropertyDamage: boolean
  otherStructuresDamage: boolean
  mortgageInformation: any[]
  expertVendorInfo: any
  estimatingInfo: any
  referralInformation: any
  contractInformation: any
  personnelAssignments: any[]
      // officeTasks: any[]
  organizationId?: string
  organizationPolicies?: any
  customFields?: Record<string, any>
}

export function RefactoredEnhancedAIClaimWizard({ 
  clientId, 
  onComplete, 
  onCancel 
}: RefactoredEnhancedAIIntakeWizardProps) {
  const { userProfile } = useAuth()
  const [progressId, setProgressId] = useState<string | null>(null)
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
    organizationId: userProfile?.organization_id,
    organizationPolicies: {},
    customFields: {}
  })
  
  // Define wizard steps using the new framework
  const wizardSteps: WizardStep[] = [
    {
      id: 'policy-upload',
      title: 'Policy & Declaration Upload',
      description: 'Upload your insurance policy or declaration page for AI extraction and validation',
      icon: FileText,
      component: (props) => (
        <UnifiedDocumentUpload
          {...props}
          uploadMode="single"
          documentType="policy"
          acceptedTypes={['.pdf', '.doc', '.docx']}
          title="Upload Policy Document"
          description="Upload your insurance policy or declaration page for AI extraction and validation"
          showValidation={true}
        />
      ),
      required: true,
      priority: 'high'
    },
    {
      id: 'additional-documents',
      title: 'Additional Claim Documents',
      description: 'Upload supporting documents: photos, estimates, correspondence, reports',
      icon: Package,
      component: (props) => (
        <UnifiedDocumentUpload
          {...props}
          uploadMode="multiple"
          documentType="additional"
          acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']}
          maxFiles={10}
          title="Upload Supporting Documents"
          description="Upload photos, estimates, correspondence, and other supporting documents"
          showValidation={false}
        />
      ),
      required: false,
      priority: 'medium'
    },
    {
      id: 'client-details',
      title: 'Client Information',
      description: 'Verify AI-extracted client details and complete missing information',
      icon: Users,
      component: UnifiedClientDetailsStep,
      required: true,
      aiEnhanced: true
    },
    {
      id: 'insurance-info',
      title: 'Insurance Details',
      description: 'Confirm AI-extracted policy information and coverage details',
      icon: Shield,
      component: UnifiedInsuranceInfoStep,
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

  // Wizard configuration
  const wizardConfig: WizardConfig = {
    title: 'AI-Enhanced Claim Intake Wizard',
    subtitle: 'AI-powered claim processing with document intelligence',
    icon: FileText,
    steps: wizardSteps,
    enableAutoSave: true,
    autoSaveInterval: 2000,
    enableProgressRestore: true,
    saveToLocalStorage: false
  }

  // Handle wizard data updates
  const handleUpdate = (newData: any) => {
    const updatedData = { ...wizardData, ...newData }
    setWizardData(updatedData)
    
    // Update intelligent wizard service with extracted policy data
    if (newData.extractedPolicyData) {
      intelligentWizardService.setExtractedPolicyData(newData.extractedPolicyData)
    }
    
    // Update intelligent wizard service with processed documents
    if (newData.additionalDocuments && Array.isArray(newData.additionalDocuments)) {
      intelligentWizardService.addProcessedDocuments(newData.additionalDocuments)
    }
  }

  // Handle save progress
  const handleSave = async (data: any, step: number) => {
    if (!userProfile?.id || !userProfile?.organization_id) {
      throw new Error('User not authenticated')
    }

    const stepStatuses = {}
    wizardSteps.forEach((stepData, index) => {
      stepStatuses[stepData.id] = {
        completed: index < step,
        required: stepData.required,
        validation_errors: [],
        completed_at: index < step ? new Date().toISOString() : undefined
      }
    })
    const progressData = {
      user_id: userProfile.id,
      organization_id: userProfile.organization_id,
      wizard_type: 'claim' as const,
      current_step: step,
      total_steps: wizardSteps.length,
      progress_percentage: Math.round((step / wizardSteps.length) * 100),
      wizard_data: data,
      step_statuses: stepStatuses,
      last_saved_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    const savedProgress = await WizardProgressService.saveProgress(progressData)
    if (savedProgress?.id) {
      setProgressId(savedProgress.id)
    }
  }

  // Step validation
  const validateStep = (stepId: string, data: any) => {
    const result = WizardValidationService.validateStep(stepId, data)
    return {
      isValid: result.isValid,
      errors: result.errors.map(e => typeof e === 'string' ? e : e.message || 'Validation error')
    }
  }

  // Check if can proceed to step
  const canProceedToStep = (stepId: string, data: any) => {
    const validation = validateStep(stepId, data)
    return validation.isValid
  }

  // Handle completion
  const handleComplete = (data: any) => {
    const claimData = {
      ...data,
      aiEnhanced: true,
      dataSource: 'ai_extraction',
      completedAt: new Date().toISOString(),
      progressId
    }
    
    onComplete?.(claimData)
  }

  return (
    <UnifiedWizardFramework
      config={wizardConfig}
      initialData={wizardData}
      onUpdate={handleUpdate}
      onComplete={handleComplete}
      onCancel={onCancel}
      onSave={handleSave}
      validateStep={validateStep}
      canProceedToStep={canProceedToStep}
    />
  )
}

export default RefactoredEnhancedAIClaimWizard