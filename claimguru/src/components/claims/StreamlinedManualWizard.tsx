/**
 * STREAMLINED MANUAL INTAKE WIZARD - For Testing Enhanced Features
 * 
 * This is a simplified version of the Manual Intake Wizard focused on testing:
 * - Personnel Form Layout (2-row phone layout)
 * - Recoverable Depreciation Calculations  
 * - Step Navigation Flow
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  Users, 
  Shield, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react'

// Import only the essential step components
import { ManualClientDetailsStep } from './wizard-steps/ManualClientDetailsStep'
import { ManualInsuranceInfoStep } from './wizard-steps/ManualInsuranceInfoStep'

interface StreamlinedManualWizardProps {
  clientId?: string
  onComplete?: (claimData: any) => void
  onCancel?: () => void
}

interface WizardData {
  clientType: string
  isOrganization: boolean
  manualEntry: boolean
  
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
  }
  insuranceCarrier: {
    name?: string
    agentInfo?: {
      agencyName?: string
      agentFirstName?: string
      agentLastName?: string
      agentEmail?: string
      agentPhone?: string
    }
  }
  // Enhanced Features Data
  personnelData?: any[]
  priorPayments?: any[]
}

export function StreamlinedManualWizard({ 
  clientId, 
  onComplete, 
  onCancel 
}: StreamlinedManualWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<WizardData>({
    clientType: 'individual',
    isOrganization: false,
    manualEntry: true,
    insuredDetails: {},
    mailingAddress: {},
    policyDetails: {},
    insuranceCarrier: {}
  })

  // Streamlined steps focusing on enhanced features
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
      title: 'Insurance Details - Enhanced Features',
      description: 'Test Personnel Forms & Recoverable Depreciation',
      icon: Shield,
      component: ManualInsuranceInfoStep,
      required: true
    }
  ]

  const currentStepData = steps[currentStep]
  const StepComponent = currentStepData.component

  // Simple validation - just check if basic required fields are filled
  const isStepValid = (stepIndex: number): boolean => {
    const step = steps[stepIndex]
    if (!step.required) return true
    
    if (step.id === 'client-details') {
      return !!(wizardData.insuredDetails?.firstName && wizardData.insuredDetails?.lastName)
    }
    
    if (step.id === 'insurance-info') {
      return !!(wizardData.insuranceCarrier?.name && wizardData.policyDetails?.policyNumber)
    }
    
    return true
  }

  const canProceed = isStepValid(currentStep)

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete the wizard
      completeWizard()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeWizard = async () => {
    try {
      console.log('Completing streamlined wizard with data:', wizardData)
      alert('Wizard completed successfully! Enhanced features tested.')
      onComplete?.(wizardData)
    } catch (error) {
      console.error('Error completing wizard:', error)
      alert('Error completing wizard. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white min-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manual Claim Intake - Enhanced Features Test</h2>
            <p className="text-gray-600 mt-1">Testing Personnel Forms & Recoverable Depreciation</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              const isValid = isStepValid(index)
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-600 text-white' :
                    isActive ? (isValid ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white') :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : 
                      isCompleted ? 'text-green-600' :
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <currentStepData.icon className="h-5 w-5" />
                {currentStepData.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StepComponent
                data={wizardData}
                onUpdate={(updates: any) => {
                  console.log('Step data update:', updates)
                  setWizardData(prev => ({ ...prev, ...updates }))
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={completeWizard}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Complete Test
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