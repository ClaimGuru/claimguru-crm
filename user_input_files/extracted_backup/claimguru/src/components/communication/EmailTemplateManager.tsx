import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  Mail,
  Settings,
  Tag,
  X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: string
  is_active: boolean
  variables: string[]
  created_at: string
  updated_at: string
}

export function EmailTemplateManager() {
  const { userProfile } = useAuth()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general',
    is_active: true,
    variables: [] as string[]
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      setFormData({
        name: selectedTemplate.name,
        subject: selectedTemplate.subject,
        content: selectedTemplate.content,
        category: selectedTemplate.category,
        is_active: selectedTemplate.is_active,
        variables: selectedTemplate.variables || []
      })
    } else {
      setFormData({
        name: '',
        subject: '',
        content: '',
        category: 'general',
        is_active: true,
        variables: []
      })
    }
  }, [selectedTemplate])

  async function loadTemplates() {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('organization_id', userProfile?.organization_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Extract variables from content
      const variableMatches = formData.content.match(/\{\{([^}]+)\}\}/g)
      const variables = variableMatches ? variableMatches.map(match => match.slice(2, -2).trim()) : []
      
      const templateData = {
        ...formData,
        variables,
        organization_id: userProfile?.organization_id
      }

      if (selectedTemplate) {
        await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id)
      } else {
        await supabase
          .from('email_templates')
          .insert([templateData])
      }
      
      await loadTemplates()
      setShowForm(false)
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      await supabase
        .from('email_templates')
        .delete()
        .eq('id', id)
      
      await loadTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const handleCopyTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(null)
    setFormData({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      content: template.content,
      category: template.category,
      is_active: true,
      variables: template.variables || []
    })
    setShowForm(true)
  }

  const exportTemplates = () => {
    const dataStr = JSON.stringify(templates, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `email-templates-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = ['general', 'welcome', 'status_update', 'document_request', 'settlement', 'closure', 'follow_up', 'reminder']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-gray-600 mt-1">Manage reusable email templates for consistent communication</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportTemplates}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        
        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className={`hover:shadow-lg transition-shadow ${!template.is_active ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      template.category === 'welcome' ? 'bg-green-100 text-green-800' :
                      template.category === 'status_update' ? 'bg-blue-100 text-blue-800' :
                      template.category === 'document_request' ? 'bg-yellow-100 text-yellow-800' :
                      template.category === 'settlement' ? 'bg-purple-100 text-purple-800' :
                      template.category === 'closure' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <Tag className="h-3 w-3 mr-1" />
                      {template.category.replace('_', ' ')}
                    </span>
                    {!template.is_active && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Subject:</p>
                  <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Preview:</p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {template.content.substring(0, 120)}...
                  </p>
                </div>
                
                {template.variables && template.variables.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Variables:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.variables.slice(0, 3).map((variable, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700">
                          {variable}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="text-xs text-gray-500">+{template.variables.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {new Date(template.updated_at).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyTemplate(template)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTemplate(template)
                        setShowForm(true)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first email template to get started'
            }
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          )}
        </div>
      )}

      {/* Template Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedTemplate ? 'Edit Template' : 'New Template'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setSelectedTemplate(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveTemplate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter template name..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email subject..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email content. Use {{variable_name}} for dynamic content..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use double curly braces for variables: {'{'}{'{'} client_name {'}'}{'}'},  {'{'}{'{'} claim_number {'}'}{'}'},  {'{'}{'{'} adjuster_name {'}'}{'}'},  etc.
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active template
                </label>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setSelectedTemplate(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Preview: {previewTemplate.name}</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Subject:</p>
                <p className="text-gray-900">{previewTemplate.subject}</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-white">
                <div className="prose max-w-none">
                  {previewTemplate.content.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">
                      {line || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
              
              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.variables.map((variable, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {'{'}{'{'}{variable}{'}'}{'}'}  
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}