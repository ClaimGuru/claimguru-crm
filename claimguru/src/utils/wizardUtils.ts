/**
 * Wizard Utility Functions
 * Consolidates duplicate wizard navigation and data management functions
 */

// Wizard step management
export const createWizardStepHandlers = (
  currentStep: number,
  setCurrentStep: (step: number) => void,
  totalSteps: number,
  onComplete?: () => void
) => {
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  return {
    nextStep,
    prevStep,
    goToStep,
    canGoNext: currentStep < totalSteps - 1,
    canGoPrev: currentStep > 0,
    isLastStep: currentStep === totalSteps - 1,
    isFirstStep: currentStep === 0,
  };
};

// Wizard data management
export const createWizardDataHandlers = (
  wizardData: any,
  setWizardData: (data: any) => void,
  saveProgressFunction?: (data: any) => Promise<void>
) => {
  const updateWizardData = (field: string, value: any) => {
    const updatedData = {
      ...wizardData,
      [field]: value,
    };
    setWizardData(updatedData);
  };

  const updateNestedWizardData = (path: string, value: any) => {
    const keys = path.split('.');
    const updatedData = { ...wizardData };
    let current = updatedData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    setWizardData(updatedData);
  };

  const saveProgress = async () => {
    if (saveProgressFunction) {
      try {
        await saveProgressFunction(wizardData);
      } catch (error) {
        console.error('Failed to save wizard progress:', error);
        throw error;
      }
    }
  };

  const resetWizardData = () => {
    setWizardData({});
  };

  return {
    updateWizardData,
    updateNestedWizardData,
    saveProgress,
    resetWizardData,
  };
};

// Step validation
export const createStepValidation = (
  validationRules: Record<number, (data: any) => boolean>
) => {
  const validateStep = (stepIndex: number, data: any): boolean => {
    const validationRule = validationRules[stepIndex];
    return validationRule ? validationRule(data) : true;
  };

  const getStepStatus = (stepIndex: number, data: any): 'completed' | 'current' | 'pending' | 'error' => {
    if (validateStep(stepIndex, data)) {
      return 'completed';
    }
    return 'pending';
  };

  const validateAllSteps = (data: any): boolean => {
    return Object.keys(validationRules).every(stepIndex => 
      validateStep(parseInt(stepIndex), data)
    );
  };

  return {
    validateStep,
    getStepStatus,
    validateAllSteps,
  };
};

// Wizard completion handler
export const createWizardCompletionHandler = (
  submitFunction: (data: any) => Promise<void>,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  const handleComplete = async (wizardData: any) => {
    try {
      await submitFunction(wizardData);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  };

  return { handleComplete };
};

// Common wizard step props creator
export const createWizardStepProps = (
  data: any,
  updateFunction: (field: string, value: any) => void,
  onNext?: () => void,
  onPrev?: () => void
) => {
  return {
    data,
    onUpdate: updateFunction,
    onNext,
    onPrev,
  };
};

// PDF extraction utilities for wizard steps
export const createPDFExtractionHandlers = (
  onExtractedData: (data: any) => void,
  onError?: (error: Error) => void
) => {
  const handleFileChange = async (file: File) => {
    try {
      // This would integrate with your PDF extraction service
      const extractedData = await extractPolicyData(file);
      onExtractedData(extractedData);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const extractPolicyData = async (file: File): Promise<any> => {
    // Placeholder for PDF extraction logic
    // This would call your actual PDF extraction service
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock extracted data
        resolve({
          policyNumber: 'AUTO-123456',
          carrier: 'State Farm',
          effectiveDate: '2024-01-01',
          expirationDate: '2024-12-31',
        });
      }, 2000);
    });
  };

  return {
    handleFileChange,
    extractPolicyData,
  };
};

// Wizard progress tracking
export const createProgressTracker = (
  totalSteps: number,
  completedSteps: number[]
) => {
  const getProgressPercentage = (): number => {
    return Math.round((completedSteps.length / totalSteps) * 100);
  };

  const isStepCompleted = (stepIndex: number): boolean => {
    return completedSteps.includes(stepIndex);
  };

  const markStepCompleted = (stepIndex: number): number[] => {
    if (!completedSteps.includes(stepIndex)) {
      return [...completedSteps, stepIndex];
    }
    return completedSteps;
  };

  const markStepIncomplete = (stepIndex: number): number[] => {
    return completedSteps.filter(step => step !== stepIndex);
  };

  return {
    getProgressPercentage,
    isStepCompleted,
    markStepCompleted,
    markStepIncomplete,
  };
};

// Common wizard step component interface
export interface WizardStepProps {
  data: any;
  onUpdate: (field: string, value: any) => void;
  onNext?: () => void;
  onPrev?: () => void;
  errors?: Record<string, string>;
  isLoading?: boolean;
}

// Wizard configuration type
export interface WizardConfig {
  totalSteps: number;
  stepTitles: string[];
  validationRules: Record<number, (data: any) => boolean>;
  onComplete: (data: any) => Promise<void>;
  onSaveProgress?: (data: any) => Promise<void>;
}
