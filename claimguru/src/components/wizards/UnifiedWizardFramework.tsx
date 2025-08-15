/**
 * UNIFIED WIZARD FRAMEWORK
 * 
 * A reusable wizard framework that eliminates structural duplication
 * across all wizard components in the application.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Progress } from '../ui/Progress'

// Type definitions
export interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType<any>
  required: boolean
  priority?: 'high' | 'medium' | 'low'
  aiEnhanced?: boolean
}

export interface WizardConfig {
  title: string
  subtitle?: string
  steps: WizardStep[]
  enableAutoSave?: boolean
  enableProgressRestore?: boolean
  saveToLocalStorage?: boolean
  className?: string
  icon?: React.ComponentType<{ className?: string }>
  autoSaveInterval?: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface UnifiedWizardFrameworkProps {
  config: WizardConfig
  initialData: any
  onUpdate: (data: any) => void
  onComplete: (data: any) => void
  onCancel?: () => void
  onSave?: (data: any, step: number) => Promise<any>
  validateStep?: (stepId: string, data: any) => ValidationResult
  canProceedToStep?: (stepId: string, data: any) => boolean
  showProgressBar?: boolean
  showStepIndicator?: boolean
}

const UnifiedWizardFramework: React.FC<UnifiedWizardFrameworkProps> = ({
  config,
  initialData,
  onUpdate,
  onComplete,
  onCancel,
  onSave,
  validateStep,
  canProceedToStep,
  showProgressBar = true,
  showStepIndicator = true
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [wizardData, setWizardData] = useState(initialData || {})
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const currentStep = config.steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === config.steps.length - 1
  const progressPercentage = ((currentStepIndex + 1) / config.steps.length) * 100

  // Handle data updates
  const handleDataUpdate = useCallback((newData: any) => {
    const updatedData = { ...wizardData, ...newData }
    setWizardData(updatedData)
    onUpdate(updatedData)

    // Auto-save functionality
    if (config.enableAutoSave && config.saveToLocalStorage) {
      localStorage.setItem(`wizard_${config.title}_data`, JSON.stringify(updatedData))
      localStorage.setItem(`wizard_${config.title}_step`, currentStepIndex.toString())
    }
  }, [wizardData, onUpdate, config, currentStepIndex])

  // Load saved progress on mount
  useEffect(() => {
    if (config.enableProgressRestore && config.saveToLocalStorage) {
      const savedData = localStorage.getItem(`wizard_${config.title}_data`)
      const savedStep = localStorage.getItem(`wizard_${config.title}_step`)
      
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setWizardData(parsedData)
        onUpdate(parsedData)
      }
      
      if (savedStep) {
        setCurrentStepIndex(parseInt(savedStep, 10))
      }
    }
  }, [config, onUpdate])

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    if (!validateStep) return { isValid: true, errors: [] }
    
    const result = validateStep(currentStep.id, wizardData)
    setValidationErrors(result.errors)
    return result
  }, [validateStep, currentStep, wizardData])

  // Navigation handlers
  const goToNextStep = useCallback(() => {
    const validation = validateCurrentStep()
    
    if (!validation.isValid) {
      return
    }

    // Mark current step as completed
    setCompletedSteps(prev => new Set(prev).add(currentStep.id))
    
    if (isLastStep) {
      // Complete the wizard
      if (config.saveToLocalStorage) {
        localStorage.removeItem(`wizard_${config.title}_data`)
        localStorage.removeItem(`wizard_${config.title}_step`)
      }
      onComplete(wizardData)
    } else {
      setCurrentStepIndex(prev => prev + 1)
      setValidationErrors([])
    }
  }, [validateCurrentStep, currentStep, isLastStep, wizardData, onComplete, config])

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1)
      setValidationErrors([])
    }
  }, [isFirstStep])

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < config.steps.length) {
      setCurrentStepIndex(stepIndex)
      setValidationErrors([])
    }
  }, [config.steps])

  // Check if we can proceed
  const canProceed = canProceedToStep ? canProceedToStep(currentStep.id, wizardData) : true

  // Render step indicator
  const renderStepIndicator = () => {
    if (!showStepIndicator) return null

    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-2">
          {config.steps.map((step, index) => {
            const isActive = index === currentStepIndex
            const isCompleted = completedSteps.has(step.id)
            const Icon = step.icon

            return (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  onClick={() => goToStep(index)}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < config.steps.length - 1 && (
                  <div className={`w-8 h-1 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }

  // Render current step
  const renderCurrentStep = () => {
    const StepComponent = currentStep.component
    
    return (
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStep.title}
          </h2>
          <p className="text-gray-600">
            {currentStep.description}
          </p>
        </div>
        
        <StepComponent
          data={wizardData}
          onUpdate={handleDataUpdate}
        />
        
        {validationErrors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <X className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Please fix the following errors:
                </h4>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${config.className || ''}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="text-center">
              <h1 className="text-3xl font-bold">{config.title}</h1>
              {config.subtitle && (
                <p className="text-blue-100 mt-2">{config.subtitle}</p>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Progress Bar */}
            {showProgressBar && (
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Step {currentStepIndex + 1} of {config.steps.length}</span>
                  <span>{Math.round(progressPercentage)}% Complete</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
            
            {/* Step Indicator */}
            {renderStepIndicator()}
            
            {/* Current Step Content */}
            {renderCurrentStep()}
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div>
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={isFirstStep}
                  className="flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  onClick={goToNextStep}
                  disabled={!canProceed}
                  className="flex items-center"
                >
                  {isLastStep ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UnifiedWizardFramework