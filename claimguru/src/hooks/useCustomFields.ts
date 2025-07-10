/**
 * Custom Fields Hook
 * Provides easy access to custom fields and values for claims
 */

import { useState, useEffect } from 'react';
import customFieldService, { CustomField, CustomFieldPlacement } from '../services/customFieldService';

export const useCustomFields = (organizationId: string, placementType?: string, sectionName?: string) => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [fieldPlacements, setFieldPlacements] = useState<(CustomFieldPlacement & { custom_field: CustomField })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomFields();
  }, [organizationId, placementType, sectionName]);

  const loadCustomFields = async () => {
    try {
      setLoading(true);
      setError(null);

      if (placementType) {
        // Load fields for specific placement
        const placements = await customFieldService.getFieldPlacements(
          placementType as CustomFieldPlacement['placement_type'],
          sectionName
        );
        setFieldPlacements(placements);
        setCustomFields(placements.map(p => p.custom_field));
      } else {
        // Load all custom fields for organization
        const fields = await customFieldService.getCustomFields(organizationId);
        setCustomFields(fields);
      }
    } catch (err) {
      console.error('Error loading custom fields:', err);
      setError('Failed to load custom fields');
    } finally {
      setLoading(false);
    }
  };

  const saveCustomFieldValue = async (claimId: string, customFieldId: string, value: any) => {
    try {
      await customFieldService.saveClaimCustomFieldValue(claimId, customFieldId, value);
    } catch (err) {
      console.error('Error saving custom field value:', err);
      throw new Error('Failed to save custom field value');
    }
  };

  const saveAllCustomFieldValues = async (claimId: string, values: Record<string, any>) => {
    try {
      await customFieldService.saveClaimCustomFieldValues(claimId, values);
    } catch (err) {
      console.error('Error saving custom field values:', err);
      throw new Error('Failed to save custom field values');
    }
  };

  const validateFieldValue = (field: CustomField, value: any) => {
    return customFieldService.validateFieldValue(field, value);
  };

  const shouldShowField = (field: CustomField, allValues: Record<string, any>) => {
    return customFieldService.shouldShowField(field, allValues);
  };

  return {
    customFields,
    fieldPlacements,
    loading,
    error,
    saveCustomFieldValue,
    saveAllCustomFieldValues,
    validateFieldValue,
    shouldShowField,
    refetch: loadCustomFields
  };
};

export const useClaimCustomFieldValues = (claimId: string) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (claimId) {
      loadValues();
    }
  }, [claimId]);

  const loadValues = async () => {
    try {
      setLoading(true);
      setError(null);
      const fieldValues = await customFieldService.getClaimCustomFieldValues(claimId);
      setValues(fieldValues);
    } catch (err) {
      console.error('Error loading claim custom field values:', err);
      setError('Failed to load custom field values');
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    setValues,
    loading,
    error,
    refetch: loadValues
  };
};

export default useCustomFields;
