/**
 * Shared Field Schemas for ClaimGuru
 * 
 * This file contains all field definitions and schemas used by both:
 * - Manual Intake Wizard
 * - AI-Enhanced Intake Wizard
 * 
 * Any changes to field structures here will automatically apply to both wizards,
 * ensuring consistency across manual and AI-powered claim intake processes.
 */

export interface BaseFieldDefinition {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio'
  required: boolean
  placeholder?: string
  helpText?: string
  validationRules?: ValidationRule[]
  options?: SelectOption[] // For select, radio, checkbox fields
  dependsOn?: string // Field dependency
  showWhen?: (data: any) => boolean // Conditional display logic
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'date' | 'number' | 'pattern' | 'length'
  value?: any
  message: string
}

export interface SelectOption {
  value: string
  label: string
  description?: string
}

export interface FieldSection {
  id: string
  title: string
  description: string
  icon?: string
  fields: BaseFieldDefinition[]
  required: boolean
  priority: 'high' | 'medium' | 'low'
}

// =============================================================================
// CLIENT DETAILS SCHEMA
// =============================================================================
export const clientDetailsSchema: FieldSection = {
  id: 'client-details',
  title: 'Client Information',
  description: 'Essential client contact and identification details',
  required: true,
  priority: 'high',
  fields: [
    {
      id: 'clientType',
      label: 'Client Type',
      type: 'radio',
      required: true,
      options: [
        { value: 'individual', label: 'Individual/Residential' },
        { value: 'business', label: 'Business/Commercial' }
      ]
    },
    {
      id: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'Enter first name',
      showWhen: (data) => data.clientType === 'individual',
      validationRules: [
        { type: 'required', message: 'First name is required' },
        { type: 'length', value: { min: 2, max: 50 }, message: 'Name must be 2-50 characters' }
      ]
    },
    {
      id: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Enter last name',
      showWhen: (data) => data.clientType === 'individual',
      validationRules: [
        { type: 'required', message: 'Last name is required' },
        { type: 'length', value: { min: 2, max: 50 }, message: 'Name must be 2-50 characters' }
      ]
    },
    {
      id: 'businessName',
      label: 'Business Name',
      type: 'text',
      required: true,
      placeholder: 'Enter business name',
      showWhen: (data) => data.clientType === 'business',
      validationRules: [
        { type: 'required', message: 'Business name is required' },
        { type: 'length', value: { min: 2, max: 100 }, message: 'Business name must be 2-100 characters' }
      ]
    },
    {
      id: 'primaryEmail',
      label: 'Primary Email',
      type: 'email',
      required: true,
      placeholder: 'Enter email address',
      validationRules: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Please enter a valid email address' }
      ]
    },
    {
      id: 'primaryPhone',
      label: 'Primary Phone',
      type: 'tel',
      required: true,
      placeholder: '(555) 123-4567',
      validationRules: [
        { type: 'required', message: 'Phone number is required' },
        { type: 'phone', message: 'Please enter a valid phone number' }
      ]
    },
    {
      id: 'alternatePhone',
      label: 'Alternate Phone',
      type: 'tel',
      required: false,
      placeholder: '(555) 123-4567',
      validationRules: [
        { type: 'phone', message: 'Please enter a valid phone number' }
      ]
    }
  ]
}

// =============================================================================
// INSURANCE DETAILS SCHEMA
// =============================================================================
export const insuranceDetailsSchema: FieldSection = {
  id: 'insurance-details',
  title: 'Insurance Information',
  description: 'Policy details and coverage information',
  required: true,
  priority: 'high',
  fields: [
    {
      id: 'insurerName',
      label: 'Insurance Company',
      type: 'text',
      required: true,
      placeholder: 'Enter insurance company name',
      validationRules: [
        { type: 'required', message: 'Insurance company is required' }
      ]
    },
    {
      id: 'policyNumber',
      label: 'Policy Number',
      type: 'text',
      required: true,
      placeholder: 'Enter policy number',
      validationRules: [
        { type: 'required', message: 'Policy number is required' },
        { type: 'pattern', value: /^[A-Z0-9\-]{6,20}$/i, message: 'Invalid policy number format' }
      ]
    },
    {
      id: 'effectiveDate',
      label: 'Policy Effective Date',
      type: 'date',
      required: true,
      validationRules: [
        { type: 'required', message: 'Effective date is required' },
        { type: 'date', message: 'Please enter a valid date' }
      ]
    },
    {
      id: 'expirationDate',
      label: 'Policy Expiration Date',
      type: 'date',
      required: true,
      validationRules: [
        { type: 'required', message: 'Expiration date is required' },
        { type: 'date', message: 'Please enter a valid date' }
      ]
    },
    {
      id: 'agentName',
      label: 'Insurance Agent Name',
      type: 'text',
      required: false,
      placeholder: 'Enter agent name'
    },
    {
      id: 'agentPhone',
      label: 'Agent Phone Number',
      type: 'tel',
      required: false,
      placeholder: '(555) 123-4567',
      validationRules: [
        { type: 'phone', message: 'Please enter a valid phone number' }
      ]
    },
    {
      id: 'deductible',
      label: 'Deductible Amount',
      type: 'number',
      required: false,
      placeholder: '1000',
      helpText: 'Enter deductible amount in dollars'
    },
    {
      id: 'policyType',
      label: 'Policy Type',
      type: 'select',
      required: true,
      options: [
        { value: 'homeowners', label: 'Homeowners' },
        { value: 'condo', label: 'Condominium' },
        { value: 'renters', label: 'Renters' },
        { value: 'commercial', label: 'Commercial Property' },
        { value: 'auto', label: 'Auto Insurance' },
        { value: 'other', label: 'Other' }
      ]
    }
  ]
}

// =============================================================================
// CLAIM INFORMATION SCHEMA
// =============================================================================
export const claimInformationSchema: FieldSection = {
  id: 'claim-information',
  title: 'Claim Details',
  description: 'Loss information and claim specifics',
  required: true,
  priority: 'high',
  fields: [
    {
      id: 'dateOfLoss',
      label: 'Date of Loss',
      type: 'date',
      required: true,
      validationRules: [
        { type: 'required', message: 'Date of loss is required' },
        { type: 'date', message: 'Please enter a valid date' }
      ]
    },
    {
      id: 'timeOfLoss',
      label: 'Time of Loss',
      type: 'text',
      required: false,
      placeholder: '2:30 PM',
      helpText: 'Approximate time if known'
    },
    {
      id: 'causeOfLoss',
      label: 'Cause of Loss',
      type: 'select',
      required: true,
      options: [
        { value: 'fire', label: 'Fire' },
        { value: 'water', label: 'Water Damage' },
        { value: 'wind', label: 'Wind/Hail' },
        { value: 'theft', label: 'Theft/Burglary' },
        { value: 'vandalism', label: 'Vandalism' },
        { value: 'lightning', label: 'Lightning' },
        { value: 'flood', label: 'Flood' },
        { value: 'earthquake', label: 'Earthquake' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'damageDescription',
      label: 'Damage Description',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the damage in detail...',
      helpText: 'Provide a detailed description of all damage',
      validationRules: [
        { type: 'required', message: 'Damage description is required' },
        { type: 'length', value: { min: 20, max: 2000 }, message: 'Description must be 20-2000 characters' }
      ]
    },
    {
      id: 'estimatedDamages',
      label: 'Estimated Damage Amount',
      type: 'number',
      required: false,
      placeholder: '5000',
      helpText: 'Estimated cost to repair/replace in dollars'
    },
    {
      id: 'lossLocation',
      label: 'Loss Location Address',
      type: 'textarea',
      required: true,
      placeholder: 'Enter the address where the loss occurred',
      validationRules: [
        { type: 'required', message: 'Loss location is required' }
      ]
    },
    {
      id: 'weatherConditions',
      label: 'Weather Conditions',
      type: 'select',
      required: false,
      options: [
        { value: 'clear', label: 'Clear' },
        { value: 'rain', label: 'Rain' },
        { value: 'storm', label: 'Storm' },
        { value: 'snow', label: 'Snow' },
        { value: 'wind', label: 'High Winds' },
        { value: 'hail', label: 'Hail' },
        { value: 'unknown', label: 'Unknown' }
      ]
    },
    {
      id: 'policeCalled',
      label: 'Was Police Called?',
      type: 'radio',
      required: false,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'policeReportNumber',
      label: 'Police Report Number',
      type: 'text',
      required: false,
      placeholder: 'Enter report number',
      showWhen: (data) => data.policeCalled === 'yes'
    }
  ]
}

// =============================================================================
// PROPERTY DETAILS SCHEMA
// =============================================================================
export const propertyDetailsSchema: FieldSection = {
  id: 'property-details',
  title: 'Property Information',
  description: 'Property characteristics and construction details',
  required: false,
  priority: 'medium',
  fields: [
    {
      id: 'yearBuilt',
      label: 'Year Built',
      type: 'number',
      required: false,
      placeholder: '1985',
      validationRules: [
        { type: 'number', message: 'Please enter a valid year' }
      ]
    },
    {
      id: 'squareFootage',
      label: 'Square Footage',
      type: 'number',
      required: false,
      placeholder: '2500',
      helpText: 'Total square footage of structure'
    },
    {
      id: 'constructionType',
      label: 'Construction Type',
      type: 'select',
      required: false,
      options: [
        { value: 'frame', label: 'Frame/Wood' },
        { value: 'masonry', label: 'Masonry' },
        { value: 'steel', label: 'Steel Frame' },
        { value: 'concrete', label: 'Concrete' },
        { value: 'mixed', label: 'Mixed Construction' }
      ]
    },
    {
      id: 'roofType',
      label: 'Roof Type',
      type: 'select',
      required: false,
      options: [
        { value: 'asphalt', label: 'Asphalt Shingles' },
        { value: 'tile', label: 'Tile' },
        { value: 'metal', label: 'Metal' },
        { value: 'slate', label: 'Slate' },
        { value: 'flat', label: 'Flat/Built-up' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'stories',
      label: 'Number of Stories',
      type: 'select',
      required: false,
      options: [
        { value: '1', label: '1 Story' },
        { value: '1.5', label: '1.5 Stories' },
        { value: '2', label: '2 Stories' },
        { value: '2.5', label: '2.5 Stories' },
        { value: '3+', label: '3 or More Stories' }
      ]
    }
  ]
}

// =============================================================================
// EXPORT ALL SCHEMAS
// =============================================================================
export const allFieldSchemas = [
  clientDetailsSchema,
  insuranceDetailsSchema,
  claimInformationSchema,
  propertyDetailsSchema
]

// Utility function to get schema by ID
export const getSchemaById = (schemaId: string): FieldSection | undefined => {
  return allFieldSchemas.find(schema => schema.id === schemaId)
}

// Utility function to get field by ID within a schema
export const getFieldById = (schemaId: string, fieldId: string): BaseFieldDefinition | undefined => {
  const schema = getSchemaById(schemaId)
  if (!schema) return undefined
  return schema.fields.find(field => field.id === fieldId)
}

// Utility function to validate data against schema
export const validateDataAgainstSchema = (data: any, schema: FieldSection): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  schema.fields.forEach(field => {
    // Check if field should be shown
    if (field.showWhen && !field.showWhen(data)) {
      return // Skip validation if field is not shown
    }
    
    const value = data[field.id]
    
    // Check required fields
    if (field.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field.label} is required`)
      return
    }
    
    // Check validation rules
    if (value && field.validationRules) {
      field.validationRules.forEach(rule => {
        switch (rule.type) {
          case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors.push(rule.message)
            }
            break
          case 'phone':
            if (value && !/^[\d\-\(\)\.\s]{10,15}$/.test(value)) {
              errors.push(rule.message)
            }
            break
          case 'pattern':
            if (value && rule.value && !rule.value.test(value)) {
              errors.push(rule.message)
            }
            break
          case 'length':
            if (value && rule.value) {
              const len = value.toString().length
              if (rule.value.min && len < rule.value.min) {
                errors.push(rule.message)
              }
              if (rule.value.max && len > rule.value.max) {
                errors.push(rule.message)
              }
            }
            break
        }
      })
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Utility function to get all required fields for a schema
export const getRequiredFields = (schema: FieldSection, data: any = {}): BaseFieldDefinition[] => {
  return schema.fields.filter(field => {
    if (field.showWhen && !field.showWhen(data)) {
      return false // Skip if field is not shown
    }
    return field.required
  })
}
