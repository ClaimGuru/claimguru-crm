/**
 * Custom Field Management Service
 * Handles CRUD operations for custom fields, placements, and values
 */

import { supabase } from '../lib/supabase';

export interface CustomField {
  id: string;
  organization_id: string;
  field_name: string;
  field_label: string;
  field_type: 'text_short' | 'text_long' | 'number' | 'decimal' | 'date' | 'datetime' | 'time' |
             'email' | 'phone' | 'url' | 'address' | 'checkbox' | 'radio' | 'dropdown' | 
             'multi_select' | 'slider' | 'file_upload' | 'signature' | 'rating' | 'color';
  field_options?: any; // JSON options for dropdowns, etc.
  validation_rules?: any; // JSON validation rules
  conditional_logic?: any; // JSON conditional logic
  default_value?: string;
  help_text?: string;
  placeholder_text?: string;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CustomFieldPlacement {
  id: string;
  custom_field_id: string;
  placement_type: 'claim_view' | 'intake_wizard' | 'client_profile' | 'vendor_profile';
  section_name: string;
  position_x: number;
  position_y: number;
  width_span: number;
  is_visible: boolean;
  created_at: string;
}

export interface CustomFieldValue {
  id: string;
  claim_id: string;
  custom_field_id: string;
  field_value: any; // JSON value
  created_at: string;
  updated_at: string;
}

export interface FolderTemplate {
  id: string;
  organization_id: string;
  template_name: string;
  template_description: string;
  folder_structure: any; // JSON structure
  is_default: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

class CustomFieldService {
  /**
   * Get all custom fields for an organization
   */
  async getCustomFields(organizationId: string): Promise<CustomField[]> {
    const { data, error } = await supabase
      .from('custom_fields')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching custom fields:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a new custom field
   */
  async createCustomField(field: Omit<CustomField, 'id' | 'created_at' | 'updated_at'>): Promise<CustomField> {
    const { data, error } = await supabase
      .from('custom_fields')
      .insert([field])
      .select()
      .single();

    if (error) {
      console.error('Error creating custom field:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a custom field
   */
  async updateCustomField(id: string, updates: Partial<CustomField>): Promise<CustomField> {
    const { data, error } = await supabase
      .from('custom_fields')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating custom field:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a custom field
   */
  async deleteCustomField(id: string): Promise<void> {
    const { error } = await supabase
      .from('custom_fields')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting custom field:', error);
      throw error;
    }
  }

  /**
   * Get field placements for a specific placement type and section
   */
  async getFieldPlacements(
    placementType: CustomFieldPlacement['placement_type'],
    sectionName?: string
  ): Promise<(CustomFieldPlacement & { custom_field: CustomField })[]> {
    let query = supabase
      .from('custom_field_placements')
      .select(`
        *,
        custom_field:custom_fields!inner(*)
      `)
      .eq('placement_type', placementType)
      .eq('is_visible', true);

    if (sectionName) {
      query = query.eq('section_name', sectionName);
    }

    const { data, error } = await query.order('position_y').order('position_x');

    if (error) {
      console.error('Error fetching field placements:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create or update field placement
   */
  async updateFieldPlacement(placement: Omit<CustomFieldPlacement, 'id' | 'created_at'>): Promise<CustomFieldPlacement> {
    // Check if placement already exists
    const { data: existing } = await supabase
      .from('custom_field_placements')
      .select('id')
      .eq('custom_field_id', placement.custom_field_id)
      .eq('placement_type', placement.placement_type)
      .eq('section_name', placement.section_name)
      .single();

    if (existing) {
      // Update existing placement
      const { data, error } = await supabase
        .from('custom_field_placements')
        .update(placement)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating field placement:', error);
        throw error;
      }

      return data;
    } else {
      // Create new placement
      const { data, error } = await supabase
        .from('custom_field_placements')
        .insert([placement])
        .select()
        .single();

      if (error) {
        console.error('Error creating field placement:', error);
        throw error;
      }

      return data;
    }
  }

  /**
   * Get custom field values for a claim
   */
  async getClaimCustomFieldValues(claimId: string): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('claim_custom_field_values')
      .select(`
        *,
        custom_field:custom_fields!inner(field_name, field_type)
      `)
      .eq('claim_id', claimId);

    if (error) {
      console.error('Error fetching claim custom field values:', error);
      throw error;
    }

    // Convert to key-value pairs using field_name as key
    const values: Record<string, any> = {};
    data?.forEach(item => {
      values[item.custom_field.field_name] = item.field_value;
    });

    return values;
  }

  /**
   * Save custom field value for a claim
   */
  async saveClaimCustomFieldValue(
    claimId: string,
    customFieldId: string,
    value: any
  ): Promise<CustomFieldValue> {
    const { data, error } = await supabase
      .from('claim_custom_field_values')
      .upsert({
        claim_id: claimId,
        custom_field_id: customFieldId,
        field_value: value,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving custom field value:', error);
      throw error;
    }

    return data;
  }

  /**
   * Batch save multiple custom field values for a claim
   */
  async saveClaimCustomFieldValues(
    claimId: string,
    values: Record<string, any>
  ): Promise<void> {
    // First get all custom fields for the organization to map field names to IDs
    const { data: claim } = await supabase
      .from('claims')
      .select('organization_id')
      .eq('id', claimId)
      .single();

    if (!claim) {
      throw new Error('Claim not found');
    }

    const customFields = await this.getCustomFields(claim.organization_id);
    const fieldNameToId = customFields.reduce((acc, field) => {
      acc[field.field_name] = field.id;
      return acc;
    }, {} as Record<string, string>);

    // Prepare upsert data
    const upsertData = Object.entries(values).map(([fieldName, value]) => ({
      claim_id: claimId,
      custom_field_id: fieldNameToId[fieldName],
      field_value: value,
      updated_at: new Date().toISOString()
    })).filter(item => item.custom_field_id); // Only include valid field IDs

    if (upsertData.length > 0) {
      const { error } = await supabase
        .from('claim_custom_field_values')
        .upsert(upsertData);

      if (error) {
        console.error('Error batch saving custom field values:', error);
        throw error;
      }
    }
  }

  /**
   * Get folder templates for an organization
   */
  async getFolderTemplates(organizationId: string): Promise<FolderTemplate[]> {
    const { data, error } = await supabase
      .from('folder_templates')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('template_name');

    if (error) {
      console.error('Error fetching folder templates:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create default folder template for organization
   */
  async createDefaultFolderTemplate(organizationId: string, createdBy: string): Promise<FolderTemplate> {
    const { data, error } = await supabase
      .rpc('create_default_folder_template', {
        p_organization_id: organizationId,
        p_created_by: createdBy
      });

    if (error) {
      console.error('Error creating default folder template:', error);
      throw error;
    }

    // Fetch and return the created template
    const templates = await this.getFolderTemplates(organizationId);
    return templates.find(t => t.is_default) || templates[0];
  }

  /**
   * Apply folder template to a claim
   */
  async applyFolderTemplateToClaimFunction(
    claimId: string,
    claimNumber: string,
    organizationId: string,
    createdBy: string
  ): Promise<void> {
    const { error } = await supabase
      .rpc('apply_folder_template_to_claim', {
        p_claim_id: claimId,
        p_claim_number: claimNumber,
        p_organization_id: organizationId,
        p_created_by: createdBy
      });

    if (error) {
      console.error('Error applying folder template to claim:', error);
      throw error;
    }
  }

  /**
   * Validate field value against validation rules
   */
  validateFieldValue(field: CustomField, value: any): { isValid: boolean; error?: string } {
    if (field.is_required && (value === null || value === undefined || value === '')) {
      return { isValid: false, error: `${field.field_label} is required` };
    }

    if (!field.validation_rules || !value) {
      return { isValid: true };
    }

    const rules = field.validation_rules;

    // String length validation
    if (rules.minLength && value.length < rules.minLength) {
      return { isValid: false, error: `${field.field_label} must be at least ${rules.minLength} characters` };
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return { isValid: false, error: `${field.field_label} must be no more than ${rules.maxLength} characters` };
    }

    // Number range validation
    if (field.field_type === 'number' || field.field_type === 'decimal') {
      const numValue = parseFloat(value);
      if (rules.min !== undefined && numValue < rules.min) {
        return { isValid: false, error: `${field.field_label} must be at least ${rules.min}` };
      }
      if (rules.max !== undefined && numValue > rules.max) {
        return { isValid: false, error: `${field.field_label} must be no more than ${rules.max}` };
      }
    }

    // Pattern validation
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        return { isValid: false, error: rules.patternMessage || `${field.field_label} format is invalid` };
      }
    }

    return { isValid: true };
  }

  /**
   * Check conditional logic for field visibility
   */
  shouldShowField(field: CustomField, allValues: Record<string, any>): boolean {
    if (!field.conditional_logic) {
      return true;
    }

    const logic = field.conditional_logic;
    
    // Simple condition: show if another field has specific value
    if (logic.showIf) {
      const condition = logic.showIf;
      const dependentValue = allValues[condition.fieldName];
      
      switch (condition.operator) {
        case 'equals':
          return dependentValue === condition.value;
        case 'not_equals':
          return dependentValue !== condition.value;
        case 'contains':
          return dependentValue && dependentValue.includes(condition.value);
        case 'greater_than':
          return parseFloat(dependentValue) > parseFloat(condition.value);
        case 'less_than':
          return parseFloat(dependentValue) < parseFloat(condition.value);
        default:
          return true;
      }
    }

    return true;
  }
}

export const customFieldService = new CustomFieldService();
export default customFieldService;
