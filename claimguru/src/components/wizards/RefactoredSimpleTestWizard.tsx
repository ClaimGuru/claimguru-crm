/**
 * REFACTORED SIMPLE TEST WIZARD
 * 
 * Now uses the UnifiedWizardFramework to eliminate structural duplication
 * while maintaining the simple test functionality.
 */

import React, { useState } from 'react'
import { Users, Shield } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Input } from '../ui/Input'
import UnifiedWizardFramework, { WizardConfig, WizardStep } from './UnifiedWizardFramework'

interface RefactoredSimpleTestWizardProps {
  onComplete?: (data: any) => void
  onCancel?: () => void
}

interface WizardData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

// Basic Info Step Component
function BasicInfoStep({ data, onUpdate }: { data: WizardData; onUpdate: (data: any) => void }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tell us about yourself</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <Input
                value={data.firstName || ''}
                onChange={(e) => onUpdate({ firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <Input
                value={data.lastName || ''}
                onChange={(e) => onUpdate({ lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Contact Info Step Component
function ContactInfoStep({ data, onUpdate }: { data: WizardData; onUpdate: (data: any) => void }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={data.email || ''}
                onChange={(e) => onUpdate({ email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                type="tel"
                value={data.phone || ''}
                onChange={(e) => onUpdate({ phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RefactoredSimpleTestWizard({ 
  onComplete, 
  onCancel 
}: RefactoredSimpleTestWizardProps) {
  const [wizardData, setWizardData] = useState<WizardData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  // Define wizard steps using the new framework
  const wizardSteps: WizardStep[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Enter your basic personal information',
      icon: Users,
      component: BasicInfoStep,
      required: true
    },
    {
      id: 'contact',
      title: 'Contact Details',
      description: 'Provide your contact information',
      icon: Shield,
      component: ContactInfoStep,
      required: true
    }
  ]

  // Wizard configuration
  const wizardConfig: WizardConfig = {
    title: 'Test Wizard',
    subtitle: 'Simple test workflow',
    steps: wizardSteps,
    enableAutoSave: false,
    enableProgressRestore: false,
    saveToLocalStorage: false,
    className: 'max-w-4xl' // Smaller size for simple wizard
  }

  // Handle wizard data updates
  const handleUpdate = (newData: any) => {
    setWizardData({ ...wizardData, ...newData })
  }

  // Simple validation
  const validateStep = (stepId: string, data: WizardData) => {
    const errors: string[] = []
    
    if (stepId === 'basic-info') {
      if (!data.firstName?.trim()) errors.push('First name is required')
      if (!data.lastName?.trim()) errors.push('Last name is required')
    }
    
    if (stepId === 'contact') {
      if (!data.email?.trim()) errors.push('Email is required')
      if (!data.phone?.trim()) errors.push('Phone number is required')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Check if can proceed to step
  const canProceedToStep = (stepId: string, data: WizardData) => {
    const validation = validateStep(stepId, data)
    return validation.isValid
  }

  // Handle completion
  const handleComplete = (data: WizardData) => {
    onComplete?.(data)
  }

  return (
    <UnifiedWizardFramework
      config={wizardConfig}
      initialData={wizardData}
      onUpdate={handleUpdate}
      onComplete={handleComplete}
      onCancel={onCancel}
      validateStep={validateStep}
      canProceedToStep={canProceedToStep}
      showProgressBar={true}
      showStepIndicator={true}
    />
  )
}

export default RefactoredSimpleTestWizard