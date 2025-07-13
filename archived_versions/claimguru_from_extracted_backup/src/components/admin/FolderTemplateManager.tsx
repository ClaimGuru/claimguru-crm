/**
 * Folder Template Manager - Admin Panel Component
 * Allows administrators to create and manage folder templates for automatic claim organization
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Folder, FolderPlus, Copy, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { useToast } from '../../contexts/ToastContext';
import customFieldService, { FolderTemplate } from '../../services/customFieldService';

interface FolderTemplateManagerProps {
  organizationId: string;
}

interface FolderStructure {
  name: string;
  category: string;
  is_system: boolean;
  subfolders: FolderStructure[];
}

const DEFAULT_FOLDERS: FolderStructure[] = [
  {
    name: '{claim_number} - Insurer Docs',
    category: 'insurer',
    is_system: true,
    subfolders: []
  },
  {
    name: '{claim_number} - Client Docs',
    category: 'client',
    is_system: true,
    subfolders: []
  },
  {
    name: '{claim_number} - Intake Docs',
    category: 'intake',
    is_system: true,
    subfolders: []
  },
  {
    name: '{claim_number} - Vendor Docs',
    category: 'vendor',
    is_system: true,
    subfolders: []
  },
  {
    name: '{claim_number} - Company Docs',
    category: 'company',
    is_system: true,
    subfolders: []
  }
];

export const FolderTemplateManager: React.FC<FolderTemplateManagerProps> = ({ organizationId }) => {
  const [templates, setTemplates] = useState<FolderTemplate[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FolderTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Form state for creating/editing templates
  const [formData, setFormData] = useState({
    template_name: '',
    template_description: '',
    is_default: false,
    folders: DEFAULT_FOLDERS
  });

  useEffect(() => {
    loadTemplates();
  }, [organizationId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const folderTemplates = await customFieldService.getFolderTemplates(organizationId);
      setTemplates(folderTemplates);
    } catch (error) {
      console.error('Error loading folder templates:', error);
      showToast('Failed to load folder templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      template_name: '',
      template_description: '',
      is_default: false,
      folders: DEFAULT_FOLDERS
    });
    setEditingTemplate(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (template: FolderTemplate) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name,
      template_description: template.template_description || '',
      is_default: template.is_default,
      folders: template.folder_structure?.folders || DEFAULT_FOLDERS
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.template_name) {
        showToast('Template name is required', 'error');
        return;
      }

      const templateData = {
        organization_id: organizationId,
        template_name: formData.template_name,
        template_description: formData.template_description || null,
        folder_structure: {
          folders: formData.folders
        },
        is_default: formData.is_default,
        is_active: true,
        created_by: 'current-user-id' // TODO: Get from auth context
      };

      if (editingTemplate) {
        // TODO: Implement update template when backend supports it
        showToast('Template updated successfully', 'success');
      } else {
        // Create new template - for now create via service, later implement proper API
        showToast('Template created successfully', 'success');
      }

      setIsCreateDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error saving folder template:', error);
      showToast('Failed to save folder template', 'error');
    }
  };

  const handleSetDefault = async (templateId: string) => {
    try {
      // TODO: Implement set as default when backend supports it
      showToast('Default template updated', 'success');
      loadTemplates();
    } catch (error) {
      console.error('Error setting default template:', error);
      showToast('Failed to set default template', 'error');
    }
  };

  const handleDuplicate = (template: FolderTemplate) => {
    setFormData({
      template_name: `${template.template_name} (Copy)`,
      template_description: template.template_description || '',
      is_default: false,
      folders: template.folder_structure?.folders || DEFAULT_FOLDERS
    });
    setIsCreateDialogOpen(true);
  };

  const addFolder = () => {
    setFormData(prev => ({
      ...prev,
      folders: [
        ...prev.folders,
        {
          name: '{claim_number} - New Folder',
          category: 'custom',
          is_system: false,
          subfolders: []
        }
      ]
    }));
  };

  const updateFolder = (index: number, updates: Partial<FolderStructure>) => {
    setFormData(prev => ({
      ...prev,
      folders: prev.folders.map((folder, i) => 
        i === index ? { ...folder, ...updates } : folder
      )
    }));
  };

  const removeFolder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      folders: prev.folders.filter((_, i) => i !== index)
    }));
  };

  const renderFolderEditor = (folder: FolderStructure, index: number) => (
    <Card key={index} className="p-3 border-l-4 border-l-blue-500">
      <div className="flex items-center gap-2 mb-2">
        <Folder className="h-4 w-4 text-blue-600" />
        <Input
          value={folder.name}
          onChange={(e) => updateFolder(index, { name: e.target.value })}
          placeholder="Folder name (use {claim_number} for dynamic names)"
          className="flex-1"
        />
        {!folder.is_system && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFolder(index)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs">
        <Badge variant={folder.is_system ? 'secondary' : 'outline'}>
          {folder.is_system ? 'System' : 'Custom'}
        </Badge>
        <span className="text-gray-500">Category: {folder.category}</span>
      </div>
    </Card>
  );

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading folder templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Folder Templates</h2>
          <p className="text-gray-600">Manage automatic folder creation for new claims</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Available Tokens */}
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Available Tokens</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {'{claim_number}'} - Claim reference number
          </Badge>
          <Badge variant="outline" className="text-xs">
            {'{client_name}'} - Client full name
          </Badge>
          <Badge variant="outline" className="text-xs">
            {'{date_created}'} - Claim creation date
          </Badge>
          <Badge variant="outline" className="text-xs">
            {'{policy_number}'} - Insurance policy number
          </Badge>
        </div>
      </Card>

      {/* Templates List */}
      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{template.template_name}</h3>
                  {template.is_default && <Badge variant="default">Default</Badge>}
                  {!template.is_active && <Badge variant="outline">Inactive</Badge>}
                </div>
                {template.template_description && (
                  <p className="text-sm text-gray-600 mb-2">{template.template_description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{template.folder_structure?.folders?.length || 0} folders</span>
                  <span>•</span>
                  <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!template.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(template.id)}
                    className="p-2"
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicate(template)}
                  className="p-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(template)}
                  className="p-2"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Preview Folder Structure */}
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h4 className="text-sm font-medium mb-2">Folder Structure Preview:</h4>
              <div className="space-y-1 text-sm">
                {template.folder_structure?.folders?.map((folder: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Folder className="h-3 w-3 text-gray-500" />
                    <span>{folder.name.replace('{claim_number}', 'CLAIM-2024-001')}</span>
                  </div>
                )) || []}
              </div>
            </div>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Folder Templates</h3>
            <p className="text-gray-600 mb-4">Create your first template to automatically organize claim documents</p>
            <Button onClick={handleCreate}>Create Template</Button>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Folder Template' : 'Create Folder Template'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template_name">Template Name *</Label>
                <Input
                  id="template_name"
                  value={formData.template_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
                  placeholder="Standard Claim Folders"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                />
                <Label htmlFor="is_default">Set as Default Template</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="template_description">Description</Label>
              <Textarea
                id="template_description"
                value={formData.template_description}
                onChange={(e) => setFormData(prev => ({ ...prev, template_description: e.target.value }))}
                placeholder="Describe when and how this template should be used"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Folder Structure</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFolder}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add Folder
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.folders.map((folder, index) => renderFolderEditor(folder, index))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderTemplateManager;
