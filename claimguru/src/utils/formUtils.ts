/**
 * Form Utility Functions
 * Consolidates duplicate form handling functions across components
 */

import { ChangeEvent } from 'react';

// Generic input change handler
export const createInputChangeHandler = (
  updateFunction: (field: string, value: any) => void
) => {
  return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    updateFunction(name, finalValue);
  };
};

// Generic save handler
export const createSaveHandler = (
  saveFunction: (data: any) => Promise<void>,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  return async (data: any) => {
    try {
      await saveFunction(data);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };
};

// Generic close handler
export const createCloseHandler = (
  onClose: () => void,
  shouldConfirm = false,
  hasUnsavedChanges = false
) => {
  return () => {
    if (shouldConfirm && hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };
};

// Generic submit handler
export const createSubmitHandler = (
  submitFunction: (data: any) => Promise<void>,
  validationFunction?: (data: any) => boolean,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  return async (data: any) => {
    try {
      if (validationFunction && !validationFunction(data)) {
        throw new Error('Validation failed');
      }
      await submitFunction(data);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };
};

// Generic cancel handler
export const createCancelHandler = (
  resetFunction?: () => void,
  onCancel?: () => void,
  shouldConfirm = true
) => {
  return () => {
    if (shouldConfirm) {
      if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        resetFunction?.();
        onCancel?.();
      }
    } else {
      resetFunction?.();
      onCancel?.();
    }
  };
};

// Field update utilities
export const createFieldUpdater = (
  data: any,
  setData: (data: any) => void
) => {
  return (field: string, value: any) => {
    setData({
      ...data,
      [field]: value,
    });
  };
};

export const createNestedFieldUpdater = (
  data: any,
  setData: (data: any) => void
) => {
  return (path: string, value: any) => {
    const keys = path.split('.');
    const updatedData = { ...data };
    let current = updatedData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    setData(updatedData);
  };
};

// Phone number utilities
export const createPhoneNumberHandlers = (
  phoneNumbers: any[],
  setPhoneNumbers: (numbers: any[]) => void
) => {
  const addPhoneNumber = () => {
    setPhoneNumbers([
      ...phoneNumbers,
      { type: 'Mobile', number: '', extension: '', isPrimary: false }
    ]);
  };

  const updatePhoneNumber = (index: number, field: string, value: any) => {
    const updated = phoneNumbers.map((phone, i) => 
      i === index ? { ...phone, [field]: value } : phone
    );
    setPhoneNumbers(updated);
  };

  const removePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
    }
  };

  return {
    addPhoneNumber,
    updatePhoneNumber,
    removePhoneNumber,
  };
};

// Address change handler
export const createAddressChangeHandler = (
  updateFunction: (field: string, value: any) => void
) => {
  return (addressData: any) => {
    Object.keys(addressData).forEach(key => {
      updateFunction(key, addressData[key]);
    });
  };
};

// File upload handlers
export const createFileUploadHandler = (
  onFileSelect: (files: File[]) => void,
  allowMultiple = false,
  allowedTypes?: string[]
) => {
  return (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (allowedTypes) {
      const validFiles = files.filter(file => 
        allowedTypes.some(type => file.type.includes(type))
      );
      onFileSelect(allowMultiple ? validFiles : [validFiles[0]]);
    } else {
      onFileSelect(allowMultiple ? files : [files[0]]);
    }
  };
};

// Validation utilities
export const createValidationHandler = (
  validationRules: Record<string, (value: any) => string | null>
) => {
  return (data: any): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    Object.keys(validationRules).forEach(field => {
      const error = validationRules[field](data[field]);
      if (error) {
        errors[field] = error;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };
};

// Edit/Confirm/Reject handlers for confirmed fields
export const createConfirmedFieldHandlers = (
  field: string,
  updateFunction: (field: string, value: any) => void
) => {
  const handleConfirm = () => {
    updateFunction(`${field}_confirmed`, true);
    updateFunction(`${field}_editing`, false);
  };

  const handleReject = () => {
    updateFunction(`${field}_confirmed`, false);
    updateFunction(`${field}_editing`, true);
  };

  const handleEdit = () => {
    updateFunction(`${field}_editing`, true);
    updateFunction(`${field}_confirmed`, false);
  };

  return {
    handleConfirm,
    handleReject,
    handleEdit,
  };
};
