/**
 * Wizard Validation Service
 * 
 * Provides comprehensive validation for all wizard steps with detailed field-level validation,
 * visual indicators, and user-friendly error messages.
 */

export interface ValidationError {
  field: string;
  fieldLabel: string;
  message: string;
  severity: 'error' | 'warning';
  section?: string;
}

export interface StepValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  missingRequiredFields: ValidationError[];
  completionPercentage: number;
}

export interface FieldValidationConfig {
  required?: boolean;
  label: string;
  section?: string;
  validator?: (value: any, data?: any) => string | null;
}

export class WizardValidationService {
  private static validationRules: Record<string, Record<string, FieldValidationConfig>> = {
    'policy-upload': {
      'extractedPolicyData': {
        required: true,
        label: 'Policy Document',
        section: 'Document Upload',
        validator: (value) => {
          if (!value || !value.validationComplete) {
            return 'Policy document must be uploaded and validated';
          }
          return null;
        }
      }
    },
    
    'client-details': {
      'insuredDetails.firstName': {
        required: true,
        label: 'First Name',
        section: 'Personal Information',
        validator: (value) => {
          if (!value || value.trim().length < 2) {
            return 'First name must be at least 2 characters';
          }
          return null;
        }
      },
      'insuredDetails.lastName': {
        required: true,
        label: 'Last Name',
        section: 'Personal Information'
      },
      'insuredDetails.phone': {
        required: true,
        label: 'Phone Number',
        section: 'Contact Information',
        validator: (value) => {
          if (!value || !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value)) {
            return 'Please enter a valid phone number';
          }
          return null;
        }
      },
      'insuredDetails.email': {
        required: true,
        label: 'Email Address',
        section: 'Contact Information',
        validator: (value) => {
          if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Please enter a valid email address';
          }
          return null;
        }
      },
      'mailingAddress.address': {
        required: true,
        label: 'Mailing Address',
        section: 'Address Information'
      },
      'mailingAddress.city': {
        required: true,
        label: 'City',
        section: 'Address Information'
      },
      'mailingAddress.state': {
        required: true,
        label: 'State',
        section: 'Address Information'
      },
      'mailingAddress.zipCode': {
        required: true,
        label: 'ZIP Code',
        section: 'Address Information',
        validator: (value) => {
          if (!value || !/^\d{5}(-\d{4})?$/.test(value)) {
            return 'Please enter a valid ZIP code';
          }
          return null;
        }
      }
    },
    
    'insurance-info': {
      'insuranceCarrier.name': {
        required: true,
        label: 'Insurance Carrier',
        section: 'Insurance Details'
      },
      'policyDetails.policyNumber': {
        required: true,
        label: 'Policy Number',
        section: 'Policy Information',
        validator: (value) => {
          if (!value || value.trim().length < 3) {
            return 'Policy number must be at least 3 characters';
          }
          return null;
        }
      },
      'policyDetails.effectiveDate': {
        required: true,
        label: 'Policy Effective Date',
        section: 'Policy Information',
        validator: (value) => {
          if (!value) return 'Effective date is required';
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return 'Please enter a valid date';
          }
          return null;
        }
      },
      'policyDetails.expirationDate': {
        required: true,
        label: 'Policy Expiration Date',
        section: 'Policy Information'
      },
      'insuranceCarrier.agentInfo.agencyName': {
        required: false, // Made optional to allow progression
        label: 'Agency Name',
        section: 'Agent Information'
      },
      'insuranceCarrier.agentInfo.agentFirstName': {
        required: false, // Made optional to allow progression
        label: 'Agent First Name',
        section: 'Agent Information'
      },
      'insuranceCarrier.agentInfo.agentLastName': {
        required: false, // Made optional to allow progression
        label: 'Agent Last Name',
        section: 'Agent Information'
      },
      'insuranceCarrier.agentInfo.agentEmail': {
        required: false, // Made optional to allow progression
        label: 'Agent Email',
        section: 'Agent Information',
        validator: (value) => {
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Please enter a valid email address';
          }
          return null;
        }
      },
      'insuranceCarrier.agentInfo.agentPhone': {
        required: false, // Made optional to allow progression
        label: 'Agent Phone',
        section: 'Agent Information',
        validator: (value) => {
          if (value && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value)) {
            return 'Please enter a valid phone number';
          }
          return null;
        }
      },
      'insurerPersonnel': {
        required: false, // Made optional since it might be empty initially
        label: 'Personnel Information',
        section: 'Personnel Details',
        validator: (value, data) => {
          // Allow empty personnel list or validate filled personnel
          if (!Array.isArray(value)) return null;
          
          for (const person of value) {
            if (!person.firstName || !person.lastName) {
              return 'All personnel must have first and last name';
            }
            if (!person.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email)) {
              return 'All personnel must have valid email addresses';
            }
            if (!person.phoneNumbers || person.phoneNumbers.length === 0) {
              return 'All personnel must have at least one phone number';
            }
            if (!person.personnelType) {
              return 'All personnel must have a personnel type selected';
            }
            if (person.personnelType === 'Vendor' && !person.vendorSubType) {
              return 'Vendor personnel must have a specialty selected';
            }
          }
          return null;
        }
      }
    },
    
    'claim-info': {
      'lossDetails.reasonForLoss': {
        required: true,
        label: 'Reason for Loss',
        section: 'Loss Information'
      },
      'lossDetails.dateOfLoss': {
        required: true,
        label: 'Date of Loss',
        section: 'Loss Information',
        validator: (value, data) => {
          if (!value) return 'Date of loss is required';
          
          const lossDate = new Date(value);
          if (isNaN(lossDate.getTime())) {
            return 'Please enter a valid date';
          }
          
          // Validate against policy dates if available
          if (data?.policyDetails?.effectiveDate && data?.policyDetails?.expirationDate) {
            const effectiveDate = new Date(data.policyDetails.effectiveDate);
            const expirationDate = new Date(data.policyDetails.expirationDate);
            
            if (lossDate < effectiveDate || lossDate > expirationDate) {
              return 'Date of loss must be within policy coverage period';
            }
          }
          
          return null;
        }
      },
      'lossDetails.causeOfLoss': {
        required: true,
        label: 'Cause of Loss',
        section: 'Loss Information'
      },
      'lossDetails.lossDescription': {
        required: true,
        label: 'Loss Description',
        section: 'Loss Information',
        validator: (value) => {
          if (!value || value.trim().length < 20) {
            return 'Loss description must be at least 20 characters';
          }
          return null;
        }
      }
    },
    
    'referral': {
      'referralInformation.source': {
        required: true,
        label: 'Referral Source',
        section: 'Referral Information'
      }
    },
    
    'contract': {
      'contractInformation.feeStructure': {
        required: true,
        label: 'Fee Structure',
        section: 'Contract Terms'
      },
      'contractInformation.contractDate': {
        required: true,
        label: 'Contract Date',
        section: 'Contract Terms'
      }
    }
  };

  static validateStep(stepId: string, wizardData: any): StepValidationResult {
    const rules = this.validationRules[stepId] || {};
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const missingRequiredFields: ValidationError[] = [];
    
    const totalFields = Object.keys(rules).length;
    let validFields = 0;

    Object.entries(rules).forEach(([fieldPath, config]) => {
      const value = this.getNestedValue(wizardData, fieldPath);
      const isEmpty = this.isEmpty(value);
      
      // Check required fields
      if (config.required && isEmpty) {
        const error: ValidationError = {
          field: fieldPath,
          fieldLabel: config.label,
          message: `${config.label} is required`,
          severity: 'error',
          section: config.section
        };
        errors.push(error);
        missingRequiredFields.push(error);
      } else if (!isEmpty) {
        validFields++;
        
        // Run custom validator if present
        if (config.validator) {
          const validationMessage = config.validator(value, wizardData);
          if (validationMessage) {
            errors.push({
              field: fieldPath,
              fieldLabel: config.label,
              message: validationMessage,
              severity: 'error',
              section: config.section
            });
            validFields--;
          }
        }
      } else if (!config.required && !isEmpty) {
        validFields++;
      }
    });

    const completionPercentage = totalFields > 0 ? Math.round((validFields / totalFields) * 100) : 100;
    const isValid = errors.length === 0 && missingRequiredFields.length === 0;

    return {
      isValid,
      errors,
      warnings,
      missingRequiredFields,
      completionPercentage
    };
  }

  static validateAllSteps(wizardData: any, steps: any[]): Record<string, StepValidationResult> {
    const results: Record<string, StepValidationResult> = {};
    
    steps.forEach(step => {
      results[step.id] = this.validateStep(step.id, wizardData);
    });
    
    return results;
  }

  static getFieldValidationStatus(stepId: string, fieldPath: string, wizardData: any): {
    isValid: boolean;
    error?: string;
    isRequired: boolean;
  } {
    const rules = this.validationRules[stepId];
    if (!rules || !rules[fieldPath]) {
      return { isValid: true, isRequired: false };
    }
    
    const config = rules[fieldPath];
    const value = this.getNestedValue(wizardData, fieldPath);
    const isEmpty = this.isEmpty(value);
    
    if (config.required && isEmpty) {
      return {
        isValid: false,
        error: `${config.label} is required`,
        isRequired: true
      };
    }
    
    if (!isEmpty && config.validator) {
      const validationMessage = config.validator(value, wizardData);
      if (validationMessage) {
        return {
          isValid: false,
          error: validationMessage,
          isRequired: config.required || false
        };
      }
    }
    
    return { isValid: true, isRequired: config.required || false };
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private static isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  static getRequiredFieldsForStep(stepId: string): string[] {
    const rules = this.validationRules[stepId] || {};
    return Object.entries(rules)
      .filter(([, config]) => config.required)
      .map(([fieldPath]) => fieldPath);
  }

  static getStepSections(stepId: string): string[] {
    const rules = this.validationRules[stepId] || {};
    const sections = new Set<string>();
    
    Object.values(rules).forEach(config => {
      if (config.section) {
        sections.add(config.section);
      }
    });
    
    return Array.from(sections);
  }
}
