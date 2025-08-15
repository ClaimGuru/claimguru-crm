/**
 * REFACTORED MANUAL INTAKE WIZARD
 * 
 * Now uses the UnifiedWizardFramework to eliminate structural duplication
 * while preserving all manual entry functionality.
 */

import React, { useState } from 'react'
import { FileText, Users, Shield, Home, AlertTriangle, Building2, CheckSquare, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import UnifiedWizardFramework, { WizardConfig, WizardStep } from './UnifiedWizardFramework'

// Import manual intake step components
import { UnifiedClientDetailsStep } from '../claims/wizard-steps/UnifiedClientDetailsStep'
import { InsurerInformationStep } from '../claims/wizard-steps/InsurerInformationStep'
import { PolicyInformationStep } from '../claims/wizard-steps/PolicyInformationStep'
import { LossInformationStep } from '../claims/wizard-steps/LossInformationStep'
import { MortgageLenderInformationStep } from '../claims/wizard-steps/MortgageLenderInformationStep'
import { ReferralSourceInformationStep } from '../claims/wizard-steps/ReferralSourceInformationStep'
import { BuildingInformationStep } from '../claims/wizard-steps/BuildingInformationStep'
import { OfficeTasksStep } from '../claims/wizard-steps/OfficeTasksStep'
import { IntakeReviewCompletionStep } from '../claims/wizard-steps/IntakeReviewCompletionStep'

interface RefactoredManualIntakeWizardProps {
  clientId?: string
  onComplete?: (claimData: any) => void
  onCancel?: () => void
}

interface WizardData {
  clientType: string
  isOrganization: boolean
  manualEntry: boolean
  insuredDetails: any
  mailingAddress: any
  policyDetails: any
  claimInformation: any
}

export function RefactoredManualIntakeWizard({ 
  clientId, 
  onComplete, 
  onCancel 
}: RefactoredManualIntakeWizardProps) {
  const { userProfile } = useAuth()
  const [wizardData, setWizardData] = useState<WizardData>({
    clientType: 'individual',
    isOrganization: false,
    manualEntry: true,
    insuredDetails: {},
    mailingAddress: {},
    policyDetails: {},
    claimInformation: {}
  })
  
  // Define wizard steps using the new framework
  const wizardSteps: WizardStep[] = [
    {
      id: 'client-information',
      title: 'Client Information',
      description: 'Client type, contact details, and coinsured information',
      icon: Users,
      component: UnifiedClientDetailsStep,
      required: true
    },
    {
      id: 'insurer-information',
      title: 'Insurer Information',
      description: 'Insurance company details and personnel',
      icon: Shield,
      component: InsurerInformationStep,
      required: true
    },
    {
      id: 'policy-information',
      title: 'Policy Information',
      description: 'Policy details, coverage, and dispute resolution options',
      icon: FileText,
      component: PolicyInformationStep,
      required: true
    },
    {
      id: 'loss-information',
      title: 'Loss Information',
      description: 'Loss details, location, and property status',
      icon: AlertTriangle,
      component: LossInformationStep,
      required: true
    },
    {
      id: 'mortgage-lenders',
      title: 'Mortgage Lender Information',
      description: 'Mortgage companies and lender details',
      icon: Building2,
      component: MortgageLenderInformationStep,
      required: false
    },
    {
      id: 'referral-source',
      title: 'Referral Source Information',
      description: 'Referral type and source details',
      icon: Users,
      component: ReferralSourceInformationStep,
      required: true
    },
    {
      id: 'building-information',
      title: 'Building Information',
      description: 'Building type, construction, and systems',
      icon: Home,
      component: BuildingInformationStep,
      required: false
    },
    {
      id: 'office-tasks',
      title: 'Office Tasks & Follow-ups',
      description: 'Automatic tasks and custom task creation',
      icon: CheckSquare,
      component: OfficeTasksStep,
      required: false
    },
    {
      id: 'intake-review',
      title: 'Intake Review & Completion',
      description: 'Final review and contract generation',
      icon: CheckCircle,
      component: IntakeReviewCompletionStep,
      required: true
    }
  ]

  // Wizard configuration
  const wizardConfig: WizardConfig = {
    title: 'Manual Claim Intake Wizard',
    subtitle: 'Traditional form-based claim processing',
    icon: FileText,
    steps: wizardSteps,
    enableAutoSave: true,
    autoSaveInterval: 5000,
    enableProgressRestore: false,
    saveToLocalStorage: true
  }

  // Handle wizard data updates
  const handleUpdate = (newData: any) => {
    setWizardData({ ...wizardData, ...newData, manualEntry: true })
  }

  // Handle local storage save
  const handleSave = async (data: any, step: number) => {
    const progressData = {
      wizardData: data,
      currentStep: step,
      totalSteps: wizardSteps.length,
      lastSaved: new Date().toISOString(),
      wizardType: 'claim_manual'
    }
    
    localStorage.setItem('claimguru_manual_wizard_progress', JSON.stringify(progressData))
  }

  // Simple validation for manual wizard
  const validateStep = (stepId: string, data: any) => {
    // Basic validation - can be enhanced as needed
    return { isValid: true, errors: [] }
  }

  // Check if can proceed to step
  const canProceedToStep = (stepId: string, data: any) => {
    return true // Manual wizard allows proceeding to any step
  }

  // Handle completion
  const handleComplete = (data: any) => {
    const claimData = {
      ...data,
      manualEntry: true,
      dataSource: 'manual_input',
      completedAt: new Date().toISOString()
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

export default RefactoredManualIntakeWizard