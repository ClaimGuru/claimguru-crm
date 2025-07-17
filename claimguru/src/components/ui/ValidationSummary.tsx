import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { 
  AlertTriangle, 
  CheckCircle, 
  X, 
  ArrowUp,
  Clock,
  AlertCircle,
  Info
} from 'lucide-react';
import { ValidationError, StepValidationResult } from '../../services/wizardValidationService';

interface ValidationSummaryProps {
  stepValidation: StepValidationResult;
  stepTitle: string;
  onDismiss?: () => void;
  onScrollToField?: (fieldPath: string) => void;
  showProgress?: boolean;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  stepValidation,
  stepTitle,
  onDismiss,
  onScrollToField,
  showProgress = true
}) => {
  const { 
    isValid, 
    errors, 
    warnings, 
    missingRequiredFields, 
    completionPercentage 
  } = stepValidation;

  // Don't show if everything is valid
  if (isValid && warnings.length === 0) {
    return null;
  }

  const totalIssues = errors.length + warnings.length;
  const criticalIssues = missingRequiredFields.length;

  const getProgressColor = () => {
    if (completionPercentage >= 90) return 'bg-green-500';
    if (completionPercentage >= 70) return 'bg-yellow-500';
    if (completionPercentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSeverityIcon = (severity: 'error' | 'warning') => {
    return severity === 'error' ? 
      <AlertTriangle className="h-4 w-4 text-red-500" /> : 
      <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const handleFieldClick = (fieldPath: string) => {
    if (onScrollToField) {
      onScrollToField(fieldPath);
    }
  };

  // Group errors by section
  const groupedErrors = errors.reduce((acc, error) => {
    const section = error.section || 'General';
    if (!acc[section]) acc[section] = [];
    acc[section].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  const groupedWarnings = warnings.reduce((acc, warning) => {
    const section = warning.section || 'General';
    if (!acc[section]) acc[section] = [];
    acc[section].push(warning);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  return (
    <Card className={`border-l-4 ${
      criticalIssues > 0 ? 'border-l-red-500 bg-red-50' : 
      errors.length > 0 ? 'border-l-orange-500 bg-orange-50' : 
      'border-l-yellow-500 bg-yellow-50'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 text-lg ${
            criticalIssues > 0 ? 'text-red-700' : 
            errors.length > 0 ? 'text-orange-700' : 
            'text-yellow-700'
          }`}>
            {criticalIssues > 0 ? (
              <AlertTriangle className="h-5 w-5" />
            ) : errors.length > 0 ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <Info className="h-5 w-5" />
            )}
            
            {criticalIssues > 0 ? (
              `${criticalIssues} Required Field${criticalIssues > 1 ? 's' : ''} Missing`
            ) : errors.length > 0 ? (
              `${errors.length} Validation Error${errors.length > 1 ? 's' : ''}`
            ) : (
              `${warnings.length} Warning${warnings.length > 1 ? 's' : ''}`
            )}
          </CardTitle>
          
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {showProgress && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Step Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {criticalIssues > 0 && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
            <p className="text-sm text-red-800 font-medium mb-2">
              Please complete the following required fields to continue:
            </p>
            <div className="space-y-1">
              {missingRequiredFields.map((error, index) => (
                <button
                  key={index}
                  onClick={() => handleFieldClick(error.field)}
                  className="flex items-center gap-2 text-left w-full p-2 rounded hover:bg-red-200 transition-colors group"
                >
                  <AlertTriangle className="h-3 w-3 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-900">
                      {error.fieldLabel}
                    </div>
                    {error.section && (
                      <div className="text-xs text-red-600">
                        {error.section}
                      </div>
                    )}
                  </div>
                  <ArrowUp className="h-3 w-3 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {Object.entries(groupedErrors).map(([section, sectionErrors]) => (
          <div key={section} className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">
              {section} Issues
            </h4>
            <div className="space-y-1">
              {sectionErrors.map((error, index) => (
                <button
                  key={index}
                  onClick={() => handleFieldClick(error.field)}
                  className="flex items-center gap-2 text-left w-full p-2 rounded hover:bg-gray-100 transition-colors group"
                >
                  {getSeverityIcon(error.severity)}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {error.fieldLabel}
                    </div>
                    <div className="text-xs text-gray-600">
                      {error.message}
                    </div>
                  </div>
                  <ArrowUp className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Warnings */}
        {Object.entries(groupedWarnings).map(([section, sectionWarnings]) => (
          <div key={section} className="space-y-2">
            <h4 className="text-sm font-semibold text-yellow-700 border-b border-yellow-200 pb-1">
              {section} Recommendations
            </h4>
            <div className="space-y-1">
              {sectionWarnings.map((warning, index) => (
                <button
                  key={index}
                  onClick={() => handleFieldClick(warning.field)}
                  className="flex items-center gap-2 text-left w-full p-2 rounded hover:bg-yellow-100 transition-colors group"
                >
                  {getSeverityIcon(warning.severity)}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {warning.fieldLabel}
                    </div>
                    <div className="text-xs text-gray-600">
                      {warning.message}
                    </div>
                  </div>
                  <ArrowUp className="h-3 w-3 text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>Tip:</strong> Click on any field above to quickly jump to it and make corrections. 
              Required fields must be completed before you can proceed to the next step.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mini validation indicator for form fields
interface FieldValidationIndicatorProps {
  isValid: boolean;
  isRequired: boolean;
  error?: string;
  className?: string;
}

export const FieldValidationIndicator: React.FC<FieldValidationIndicatorProps> = ({
  isValid,
  isRequired,
  error,
  className = ""
}) => {
  if (isValid) {
    return isRequired ? (
      <CheckCircle className={`h-4 w-4 text-green-500 ${className}`} />
    ) : null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-red-500" />
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  );
};

// Enhanced input wrapper with validation
interface ValidatedInputWrapperProps {
  children: React.ReactNode;
  fieldPath: string;
  stepId: string;
  wizardData: any;
  label?: string;
  required?: boolean;
}

export const ValidatedInputWrapper: React.FC<ValidatedInputWrapperProps> = ({
  children,
  fieldPath,
  stepId,
  wizardData,
  label,
  required
}) => {
  const validation = React.useMemo(() => {
    // This would use the validation service to check the field
    // For now, basic validation
    const value = fieldPath.split('.').reduce((obj, key) => obj?.[key], wizardData);
    const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
    
    return {
      isValid: !required || !isEmpty,
      isRequired: required || false,
      error: required && isEmpty ? `${label || 'This field'} is required` : undefined
    };
  }, [fieldPath, stepId, wizardData, required, label]);

  return (
    <div className={`relative ${!validation.isValid ? 'validation-error' : ''}`}>
      {children}
      <div className="absolute right-2 top-2">
        <FieldValidationIndicator {...validation} />
      </div>
      {!validation.isValid && validation.error && (
        <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {validation.error}
        </div>
      )}
    </div>
  );
};
