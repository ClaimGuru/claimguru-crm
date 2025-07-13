/**
 * Custom Field Manager - Admin Panel Component
 * Allows administrators to create, edit, and manage custom fields for their organization
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Move, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Label } from '../ui/Label';
import { Badge } from '../ui/Badge';
import { Switch } from '../ui/switch';
import { useToast } from '../../contexts/ToastContext';
import customFieldService, { CustomField, CustomFieldPlacement } from '../../services/customFieldService';

interface CustomFieldManagerProps {
  organizationId: string;
}

const FIELD_TYPES = [
  { value: 'text_short', label: 'Short Text', description: 'Single line text input' },
  { value: 'text_long', label: 'Long Text', description: 'Multi-line text area' },
  { value: 'number', label: 'Number', description: 'Numeric input (integer)' },
  { value: 'decimal', label: 'Decimal', description: 'Decimal number input' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'datetime', label: 'Date & Time', description: 'Date and time picker' },
  { value: 'time', label: 'Time', description: 'Time picker' },
  { value: 'email', label: 'Email', description: 'Email address input' },
  { value: 'phone', label: 'Phone', description: 'Phone number input' },
  { value: 'url', label: 'URL', description: 'Website URL input' },
  { value: 'address', label: 'Address', description: 'Address input with validation' },
  { value: 'checkbox', label: 'Checkbox', description: 'True/false checkbox' },
  { value: 'radio', label: 'Radio Buttons', description: 'Single selection from options' },
  { value: 'dropdown', label: 'Dropdown', description: 'Single selection dropdown' },
  { value: 'multi_select', label: 'Multi-Select', description: 'Multiple selection dropdown' },
  { value: 'slider', label: 'Slider', description: 'Range slider input' },
  { value: 'file_upload', label: 'File Upload', description: 'File attachment' },
  { value: 'signature', label: 'Signature', description: 'Digital signature pad' },
  { value: 'rating', label: 'Rating', description: 'Star rating input' },
  { value: 'color', label: 'Color', description: 'Color picker' }
];

const PLACEMENT_TYPES = [
  { value: 'claim_view', label: 'Claim View', description: 'Main claim details page' },
  { value: 'intake_wizard', label: 'Intake Wizard', description: 'Claim creation wizard' },
  { value: 'client_profile', label: 'Client Profile', description: 'Client information page' },
  { value: 'vendor_profile', label: 'Vendor Profile', description: 'Vendor information page' }
];

const SECTION_NAMES = {
  claim_view: ['basic_info', 'policy_details', 'loss_details', 'contact_info', 'financial_info'],
  intake_wizard: ['client_details', 'policy_upload', 'loss_information', 'contract_information', 'personnel_assignment'],
  client_profile: ['contact_info', 'address_info', 'additional_info'],
  vendor_profile: ['contact_info', 'business_info', 'service_details']
};

export const CustomFieldManager: React.FC<CustomFieldManagerProps> = ({ organizationId }) => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Form state for creating/editing fields
  const [formData, setFormData] = useState({
    field_name: '',
    field_label: '',
    field_type: 'text_short' as CustomField['field_type'],
    help_text: '',
    placeholder_text: '',
    default_value: '',
    is_required: false,
    options: [] as string[], // For dropdown, radio, multi_select
    validation: {
      minLength: '',
      maxLength: '',
      min: '',
      max: '',
      pattern: '',
      patternMessage: ''
    },
    placements: [] as { placement_type: string; section_name: string; position_x: number; position_y: number }[]
  });

  useEffect(() => {
    loadCustomFields();
  }, [organizationId]);

  const loadCustomFields = async () => {
    try {
      setLoading(true);
      const fields = await customFieldService.getCustomFields(organizationId);
      setCustomFields(fields);
    } catch (error) {
      console.error('Error loading custom fields:', error);
      showToast('Failed to load custom fields', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      field_name: '',
      field_label: '',
      field_type: 'text_short',
      help_text: '',
      placeholder_text: '',
      default_value: '',
      is_required: false,
      options: [],
      validation: {
        minLength: '',
        maxLength: '',
        min: '',
        max: '',
        pattern: '',
        patternMessage: ''
      },
      placements: []
    });
    setEditingField(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (field: CustomField) => {
    setEditingField(field);
    setFormData({
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type,
      help_text: field.help_text || '',
      placeholder_text: field.placeholder_text || '',
      default_value: field.default_value || '',
      is_required: field.is_required,
      options: field.field_options?.options || [],
      validation: field.validation_rules || {
        minLength: '',
        maxLength: '',
        min: '',
        max: '',
        pattern: '',
        patternMessage: ''
      },
      placements: [] // Load existing placements separately
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.field_name || !formData.field_label) {
        showToast('Field name and label are required', 'error');
        return;
      }

      // Generate field name from label if not provided
      const fieldName = formData.field_name || formData.field_label.toLowerCase().replace(/[^a-z0-9]/g, '_');

      // Prepare validation rules
      const validationRules: any = {};
      if (formData.validation.minLength) validationRules.minLength = parseInt(formData.validation.minLength);
      if (formData.validation.maxLength) validationRules.maxLength = parseInt(formData.validation.maxLength);
      if (formData.validation.min) validationRules.min = parseFloat(formData.validation.min);
      if (formData.validation.max) validationRules.max = parseFloat(formData.validation.max);
      if (formData.validation.pattern) {
        validationRules.pattern = formData.validation.pattern;
        validationRules.patternMessage = formData.validation.patternMessage;
      }

      // Prepare field options for dropdowns, etc.
      const fieldOptions: any = {};
      if (['dropdown', 'radio', 'multi_select'].includes(formData.field_type) && formData.options.length > 0) {
        fieldOptions.options = formData.options;
      }

      const fieldData = {
        organization_id: organizationId,
        field_name: fieldName,
        field_label: formData.field_label,
        field_type: formData.field_type,
        field_options: Object.keys(fieldOptions).length > 0 ? fieldOptions : null,
        validation_rules: Object.keys(validationRules).length > 0 ? validationRules : null,
        help_text: formData.help_text || null,
        placeholder_text: formData.placeholder_text || null,
        default_value: formData.default_value || null,
        is_required: formData.is_required,
        sort_order: customFields.length,
        created_by: 'current-user-id' // TODO: Get from auth context
      };

      if (editingField) {
        await customFieldService.updateCustomField(editingField.id, fieldData);
        showToast('Custom field updated successfully', 'success');
      } else {
        await customFieldService.createCustomField(fieldData);
        showToast('Custom field created successfully', 'success');
      }

      setIsCreateDialogOpen(false);
      resetForm();
      loadCustomFields();
    } catch (error) {
      console.error('Error saving custom field:', error);
      showToast('Failed to save custom field', 'error');
    }
  };

  const handleDelete = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this custom field? This will remove all associated data.')) {
      return;
    }

    try {
      await customFieldService.deleteCustomField(fieldId);
      showToast('Custom field deleted successfully', 'success');
      loadCustomFields();
    } catch (error) {
      console.error('Error deleting custom field:', error);
      showToast('Failed to delete custom field', 'error');
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const needsOptions = ['dropdown', 'radio', 'multi_select'].includes(formData.field_type);
  const needsMinMax = ['number', 'decimal', 'slider'].includes(formData.field_type);
  const needsLength = ['text_short', 'text_long'].includes(formData.field_type);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading custom fields...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Fields</h2>
          <p className="text-gray-600">Manage custom fields for your organization</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Custom Field
        </Button>
      </div>

      {/* Custom Fields List */}
      <div className="grid gap-4">
        {customFields.map((field) => (
          <Card key={field.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{field.field_label}</h3>
                  <Badge variant="secondary">
                    {FIELD_TYPES.find(t => t.value === field.field_type)?.label || field.field_type}
                  </Badge>
                  {field.is_required && <Badge variant="destructive">Required</Badge>}
                  {!field.is_active && <Badge variant="outline">Inactive</Badge>}
                </div>
                <p className="text-sm text-gray-600 mb-1">Field Name: <code>{field.field_name}</code></p>
                {field.help_text && (
                  <p className="text-sm text-gray-500">{field.help_text}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(field)}
                  className="p-2"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(field.id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {customFields.length === 0 && (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Custom Fields</h3>
            <p className="text-gray-600 mb-4">Create your first custom field to get started</p>
            <Button onClick={handleCreate}>Create Custom Field</Button>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Edit Custom Field' : 'Create Custom Field'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="placement">Placement</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field_label">Field Label *</Label>
                  <Input
                    id="field_label"
                    value={formData.field_label}
                    onChange={(e) => setFormData(prev => ({ ...prev, field_label: e.target.value }))}
                    placeholder="Display name for this field"
                  />
                </div>
                <div>
                  <Label htmlFor="field_name">Field Name *</Label>
                  <Input
                    id="field_name"
                    value={formData.field_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, field_name: e.target.value }))}
                    placeholder="internal_field_name"
                  />
                  <p className="text-xs text-gray-500 mt-1">Internal identifier (letters, numbers, underscores only)</p>
                </div>
              </div>

              <div>
                <Label htmlFor="field_type">Field Type *</Label>
                <Select
                  value={formData.field_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, field_type: value as CustomField['field_type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="placeholder_text">Placeholder Text</Label>
                  <Input
                    id="placeholder_text"
                    value={formData.placeholder_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, placeholder_text: e.target.value }))}
                    placeholder="Hint text for users"
                  />
                </div>
                <div>
                  <Label htmlFor="default_value">Default Value</Label>
                  <Input
                    id="default_value"
                    value={formData.default_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_value: e.target.value }))}
                    placeholder="Default value"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="help_text">Help Text</Label>
                <Textarea
                  id="help_text"
                  value={formData.help_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, help_text: e.target.value }))}
                  placeholder="Additional guidance for users"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: checked }))}
                />
                <Label htmlFor="is_required">Required Field</Label>
              </div>

              {/* Options for dropdown/radio/multi-select */}
              {needsOptions && (
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addOption}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              {needsLength && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_length">Minimum Length</Label>
                    <Input
                      id="min_length"
                      type="number"
                      value={formData.validation.minLength}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validation: { ...prev.validation, minLength: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_length">Maximum Length</Label>
                    <Input
                      id="max_length"
                      type="number"
                      value={formData.validation.maxLength}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validation: { ...prev.validation, maxLength: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              )}

              {needsMinMax && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_value">Minimum Value</Label>
                    <Input
                      id="min_value"
                      type="number"
                      step="any"
                      value={formData.validation.min}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validation: { ...prev.validation, min: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_value">Maximum Value</Label>
                    <Input
                      id="max_value"
                      type="number"
                      step="any"
                      value={formData.validation.max}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        validation: { ...prev.validation, max: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="pattern">Pattern (RegEx)</Label>
                <Input
                  id="pattern"
                  value={formData.validation.pattern}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    validation: { ...prev.validation, pattern: e.target.value }
                  }))}
                  placeholder="^[A-Z0-9]+$"
                />
              </div>

              <div>
                <Label htmlFor="pattern_message">Pattern Error Message</Label>
                <Input
                  id="pattern_message"
                  value={formData.validation.patternMessage}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    validation: { ...prev.validation, patternMessage: e.target.value }
                  }))}
                  placeholder="Custom error message for pattern validation"
                />
              </div>
            </TabsContent>

            <TabsContent value="placement" className="space-y-4">
              <p className="text-sm text-gray-600">Configure where this field appears in the application</p>
              {/* Placement configuration will be implemented next */}
              <div className="text-center text-gray-500 py-8">
                Placement configuration coming soon...
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingField ? 'Update Field' : 'Create Field'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomFieldManager;
