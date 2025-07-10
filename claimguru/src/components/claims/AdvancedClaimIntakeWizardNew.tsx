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
  AlertCircle
} from 'lucide-react'

// Import wizard step components
import { PolicyUploadStep } from './wizard-steps/PolicyUploadStep'
import { InsuredDetailsStep } from './wizard-steps/InsuredDetailsStep'
import { InsuranceInfoStep } from './wizard-steps/InsuranceInfoStep'
import { ClaimInformationStep } from './wizard-steps/ClaimInformationStep'
import { PersonalPropertyStep } from './wizard-steps/PersonalPropertyStep'
import { ExpertsProvidersStep } from './wizard-steps/ExpertsProvidersStep'
import { CompletionStep } from './wizard-steps/CompletionStep'

interface AdvancedClaimIntakeWizardProps {
  clientId?: string
  onComplete?: (claimData: any) => void
}

export function AdvancedClaimIntakeWizard({ clientId, onComplete }: AdvancedClaimIntakeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState({})
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [stepValidation, setStepValidation] = useState({})

  const steps = [
    {
      id: 'policy-upload',
      title: 'Policy Upload',
      description: 'Upload and analyze policy documents with AI',
      icon: FileText,
      component: PolicyUploadStep,
      required: false // Optional for new claims
    },
    {
      id: 'insured-details',
      title: 'Insured Details',
      description: 'Collect insured information',
      icon: Users,
      component: InsuredDetailsStep,
      required: true
    },
    {
      id: 'insurance-info',
      title: 'Insurance Information',
      description: 'Insurance carrier and policy details',
      icon: Shield,
      component: InsuranceInfoStep,
      required: true
    },
    {
      id: 'claim-info',
      title: 'Claim Information',
      description: 'Loss details and AI analysis',
      icon: Home,
      component: ClaimInformationStep,
      required: true
    },
    {
      id: 'personal-property',
      title: 'Personal Property',
      description: 'AI-powered inventory management',
      icon: Package,
      component: PersonalPropertyStep,
      required: false, // Only if personal property damage is selected
      conditional: (data) => data.lossDetails?.personalPropertyDamage
    },
    {
      id: 'other-structures',
      title: 'Other Structures',
      description: 'Additional structures assessment',
      icon: Home,
      component: null, // Placeholder for now
      required: false,
      conditional: (data) => data.lossDetails?.otherStructuresDamage
    },
    {
      id: 'experts-providers',
      title: 'Experts & Providers',
      description: 'AI-matched professional providers',
      icon: Wrench,
      component: ExpertsProvidersStep,
      required: false
    },
    {
      id: 'estimation',
      title: 'Estimation',
      description: 'AI damage assessment and cost estimation',
      icon: Calculator,
      component: null, // Placeholder for now
      required: false
    },
    {
      id: 'completion',
      title: 'Review & Submit',
      description: 'Final review and submission',
      icon: CheckCircle,
      component: CompletionStep,
      required: true
    }
  ]

  // Filter steps based on conditional requirements
  const getVisibleSteps = () => {
    return steps.filter(step => {
      if (!step.conditional) return true
      return step.conditional(wizardData)
    })
  }

  const visibleSteps = getVisibleSteps()

  const updateWizardData = (stepData: any) => {
    setWizardData(prev => {
      const newData = { ...prev, ...stepData }
      // Validate step completion
      validateCurrentStep(newData)
      return newData
    })
  }

  const validateCurrentStep = (data: any) => {
    const currentStepData = visibleSteps[currentStep]
    if (!currentStepData) return

    let isValid = true
    const errors = []

    // Basic validation based on step requirements
    switch (currentStepData.id) {
      case 'insured-details':
        if (!data.insuredDetails?.firstName || !data.insuredDetails?.lastName) {
          isValid = false
          errors.push('First and last name are required')
        }
        if (!data.mailingAddress?.addressLine1 || !data.mailingAddress?.city) {
          isValid = false
          errors.push('Complete address is required')
        }
        break
      
      case 'insurance-info':
        if (!data.insuranceInfo?.carrier || !data.insuranceInfo?.policyNumber) {
          isValid = false
          errors.push('Insurance carrier and policy number are required')
        }
        break
        
      case 'claim-info':
        if (!data.lossDetails?.reasonForLoss || !data.lossDetails?.dateOfLoss || !data.lossDetails?.causeOfLoss) {
          isValid = false
          errors.push('Loss reason, date, and cause are required')
        }
        break
    }

    setStepValidation(prev => ({
      ...prev,
      [currentStepData.id]: { isValid, errors }
    }))
  }

  const nextStep = () => {
    const currentStepData = visibleSteps[currentStep]
    const validation = stepValidation[currentStepData.id]
    
    // Check if required step is valid before proceeding
    if (currentStepData.required && validation && !validation.isValid) {
      alert('Please complete all required fields before proceeding')
      return
    }

    if (currentStep < visibleSteps.length - 1) {
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

  const handleAIProcessing = (processing: boolean) => {
    setIsAIProcessing(processing)
  }

  const handleComplete = async () => {
    try {
      // Final validation
      const requiredSteps = visibleSteps.filter(step => step.required)
      const invalidSteps = requiredSteps.filter(step => {
        const validation = stepValidation[step.id]
        return validation && !validation.isValid
      })

      if (invalidSteps.length > 0) {
        alert('Please complete all required sections before submitting')
        return
      }

      // Create final claim data
      const claimData = {
        ...wizardData,
        submittedAt: new Date().toISOString(),
        clientId: clientId,
        status: 'submitted',
        source: 'ai_wizard'
      }

      if (onComplete) {
        await onComplete(claimData)
      }
    } catch (error) {
      console.error('Error submitting claim:', error)
      alert('Error submitting claim. Please try again.')
    }
  }

  const currentStepData = visibleSteps[currentStep]
  const completionPercentage = Math.round(((currentStep + 1) / visibleSteps.length) * 100)

  // Render step component
  const renderStepComponent = () => {
    if (!currentStepData.component) {
      return (
        <div className="text-center py-12">
          <currentStepData.icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {currentStepData.title} - Coming Soon
          </h3>
          <p className="text-gray-600">
            This section is being developed with advanced AI features
          </p>
        </div>
      )
    }

    const StepComponent = currentStepData.component
    return (
      <StepComponent
        data={wizardData}
        onUpdate={updateWizardData}
        onAIProcessing={handleAIProcessing}
        clientId={clientId}
        onSubmit={currentStepData.id === 'completion' ? handleComplete : undefined}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          Advanced AI-Powered Claim Intake Wizard
        </h1>
        <p className="text-gray-600">
          Experience the future of claims processing with AI-driven automation and intelligent insights
        </p>
      </div>

      {/* AI Processing Overlay */}
      {isAIProcessing && (
        <Card className="mb-6 bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
              <div>
                <div className="font-medium text-purple-900">AI Processing Active</div>
                <div className="text-sm text-purple-700">
                  Our AI is analyzing your information and generating intelligent insights...
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-gray-900">
                Step {currentStep + 1} of {visibleSteps.length}: {currentStepData.title}
                {currentStepData.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {completionPercentage}% Complete
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs">
            {visibleSteps.map((step, index) => {
              const validation = stepValidation[step.id]
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const hasErrors = validation && !validation.isValid && step.required
              
              return (
                <div 
                  key={step.id}
                  className={`flex flex-col items-center cursor-pointer transition-colors ${
                    isCurrent ? 'text-purple-600' : 
                    isCompleted ? 'text-green-600' :
                    hasErrors ? 'text-red-500' :
                    'text-gray-400'
                  }`}
                  onClick={() => goToStep(index)}
                >
                  <div className="relative">
                    <step.icon className="h-4 w-4 mb-1" />
                    {hasErrors && (
                      <AlertCircle className="h-3 w-3 text-red-500 absolute -top-1 -right-1" />
                    )}
                    {isCompleted && !hasErrors && (
                      <CheckCircle className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <span className="hidden sm:block text-center">
                    {step.title}
                    {step.required && <span className="text-red-500">*</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Validation Errors */}
      {currentStepData.required && stepValidation[currentStepData.id] && !stepValidation[currentStepData.id].isValid && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="font-medium text-red-900">Required Information Missing</div>
                <ul className="text-sm text-red-700 mt-1">
                  {stepValidation[currentStepData.id].errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <currentStepData.icon className="h-6 w-6 text-purple-600" />
            {currentStepData.title}
            {currentStepData.required && <span className="text-red-500">*</span>}
          </CardTitle>
          <p className="text-gray-600">{currentStepData.description}</p>
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {renderStepComponent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={prevStep}
          disabled={currentStep === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex gap-3">
          {currentStep === visibleSteps.length - 1 ? (
            <Button
              onClick={handleComplete}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isAIProcessing}
            >
              <CheckCircle className="h-4 w-4" />
              Complete Claim
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="flex items-center gap-2"
              disabled={isAIProcessing}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* AI Features Summary */}
      <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">AI Features Active</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>• Policy Document Analysis</div>
            <div>• Damage Photo Recognition</div>
            <div>• Settlement Prediction</div>
            <div>• Provider Matching</div>
            <div>• Inventory Generation</div>
            <div>• Compliance Checking</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
