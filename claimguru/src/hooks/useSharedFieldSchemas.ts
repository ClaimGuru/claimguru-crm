import { useState, useEffect } from 'react'
import { 
  allFieldSchemas, 
  getSchemaById, 
  getFieldById, 
  validateDataAgainstSchema, 
  getRequiredFields,
  FieldSection,
  BaseFieldDefinition 
} from '../services/sharedFieldSchemas'

/**
 * Hook for using shared field schemas across Manual and AI wizards
 * 
 * This ensures both wizards use identical field definitions and validation rules,
 * maintaining consistency regardless of the data entry method.
 */
export function useSharedFieldSchemas() {
  const [schemas] = useState<FieldSection[]>(allFieldSchemas)
  const [fieldValidationCache, setFieldValidationCache] = useState<Record<string, any>>({})

  // Get all schemas
  const getSchemas = () => schemas

  // Get specific schema by ID
  const getSchema = (schemaId: string) => getSchemaById(schemaId)

  // Get specific field by schema and field ID
  const getField = (schemaId: string, fieldId: string) => getFieldById(schemaId, fieldId)

  // Validate data against a specific schema
  const validateSchema = (data: any, schemaId: string) => {
    const schema = getSchemaById(schemaId)
    if (!schema) {
      return { isValid: false, errors: [`Schema '${schemaId}' not found`] }
    }
    return validateDataAgainstSchema(data, schema)
  }

  // Validate field-level data
  const validateField = (schemaId: string, fieldId: string, value: any, allData: any = {}) => {
    const field = getFieldById(schemaId, fieldId)
    if (!field) {
      return { isValid: false, errors: [`Field '${fieldId}' not found in schema '${schemaId}'`] }
    }

    // Check if field should be shown
    if (field.showWhen && !field.showWhen(allData)) {
      return { isValid: true, errors: [], hidden: true }
    }

    const errors: string[] = []

    // Check required
    if (field.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field.label} is required`)
    }

    // Check validation rules if value exists
    if (value && field.validationRules) {
      field.validationRules.forEach(rule => {
        switch (rule.type) {
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors.push(rule.message)
            }
            break
          case 'phone':
            if (!/^[\d\-\(\)\.\s]{10,15}$/.test(value)) {
              errors.push(rule.message)
            }
            break
          case 'pattern':
            if (rule.value && !rule.value.test(value)) {
              errors.push(rule.message)
            }
            break
          case 'length':
            if (rule.value) {
              const len = value.toString().length
              if (rule.value.min && len < rule.value.min) {
                errors.push(rule.message)
              }
              if (rule.value.max && len > rule.value.max) {
                errors.push(rule.message)
              }
            }
            break
          case 'number':
            if (isNaN(Number(value))) {
              errors.push(rule.message)
            }
            break
          case 'date':
            if (isNaN(Date.parse(value))) {
              errors.push(rule.message)
            }
            break
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      hidden: false
    }
  }

  // Get all required fields for a schema
  const getRequiredFieldsForSchema = (schemaId: string, data: any = {}) => {
    const schema = getSchemaById(schemaId)
    if (!schema) return []
    return getRequiredFields(schema, data)
  }

  // Check if all required fields in a schema are completed
  const isSchemaComplete = (schemaId: string, data: any) => {
    const requiredFields = getRequiredFieldsForSchema(schemaId, data)
    return requiredFields.every(field => {
      const value = data[field.id]
      return value && value.toString().trim() !== ''
    })
  }

  // Get completion percentage for a schema
  const getSchemaCompletionPercentage = (schemaId: string, data: any) => {
    const schema = getSchemaById(schemaId)
    if (!schema) return 0

    const visibleFields = schema.fields.filter(field => 
      !field.showWhen || field.showWhen(data)
    )
    
    if (visibleFields.length === 0) return 100

    const completedFields = visibleFields.filter(field => {
      const value = data[field.id]
      return value && value.toString().trim() !== ''
    })

    return Math.round((completedFields.length / visibleFields.length) * 100)
  }

  // Batch validate multiple schemas
  const validateMultipleSchemas = (data: any, schemaIds: string[]) => {
    const results = {}
    let allValid = true
    const allErrors: string[] = []

    schemaIds.forEach(schemaId => {
      const result = validateSchema(data, schemaId)
      results[schemaId] = result
      if (!result.isValid) {
        allValid = false
        allErrors.push(...result.errors)
      }
    })

    return {
      isValid: allValid,
      errors: allErrors,
      schemaResults: results
    }
  }

  // Generate form field props for easy integration
  const getFieldProps = (schemaId: string, fieldId: string, data: any = {}) => {
    const field = getFieldById(schemaId, fieldId)
    if (!field) return null

    const validation = validateField(schemaId, fieldId, data[fieldId], data)
    
    return {
      id: field.id,
      label: field.label,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder,
      helpText: field.helpText,
      options: field.options,
      value: data[fieldId] || '',
      isValid: validation.isValid,
      errors: validation.errors,
      hidden: validation.hidden,
      validation
    }
  }

  // Get all field props for a schema
  const getAllFieldProps = (schemaId: string, data: any = {}) => {
    const schema = getSchemaById(schemaId)
    if (!schema) return []

    return schema.fields.map(field => getFieldProps(schemaId, field.id, data))
      .filter(Boolean) // Remove null entries
  }

  return {
    // Schema access
    getSchemas,
    getSchema,
    getField,
    
    // Validation
    validateSchema,
    validateField,
    validateMultipleSchemas,
    
    // Completion tracking
    getRequiredFieldsForSchema,
    isSchemaComplete,
    getSchemaCompletionPercentage,
    
    // Form integration
    getFieldProps,
    getAllFieldProps,
    
    // Raw schemas for advanced usage
    schemas: allFieldSchemas
  }
}

/**
 * Hook specifically for wizard step validation
 * Provides utilities for wizard-specific validation patterns
 */
export function useWizardStepValidation() {
  const schemas = useSharedFieldSchemas()

  // Validate a wizard step
  const validateStep = (stepId: string, data: any) => {
    return schemas.validateSchema(data, stepId)
  }

  // Check if wizard step can proceed
  const canProceed = (stepId: string, data: any, isRequired: boolean = true) => {
    if (!isRequired) return true
    
    const validation = validateStep(stepId, data)
    return validation.isValid
  }

  // Get step completion status
  const getStepStatus = (stepId: string, data: any) => {
    const completion = schemas.getSchemaCompletionPercentage(stepId, data)
    const validation = validateStep(stepId, data)
    const required = schemas.getRequiredFieldsForSchema(stepId, data)
    
    return {
      completion,
      isValid: validation.isValid,
      errors: validation.errors,
      requiredFieldsCount: required.length,
      canProceed: validation.isValid || required.length === 0
    }
  }

  return {
    validateStep,
    canProceed,
    getStepStatus,
    ...schemas
  }
}

/**
 * Hook for form field rendering
 * Provides utilities specific to rendering form fields with shared schemas
 */
export function useFormFieldRenderer() {
  const schemas = useSharedFieldSchemas()

  // Render field based on type
  const getFieldRenderer = (field: BaseFieldDefinition) => {
    // Return the appropriate component type based on field.type
    // This can be used by both manual and AI wizards
    return {
      component: field.type,
      props: {
        type: field.type,
        required: field.required,
        placeholder: field.placeholder,
        options: field.options
      }
    }
  }

  // Get field styling based on validation state
  const getFieldStyling = (isValid: boolean, hasValue: boolean) => {
    if (!isValid) {
      return 'border-red-300 focus:border-red-500 focus:ring-red-500'
    }
    if (hasValue) {
      return 'border-green-300 focus:border-green-500 focus:ring-green-500'
    }
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  }

  return {
    getFieldRenderer,
    getFieldStyling,
    ...schemas
  }
}
