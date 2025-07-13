import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  Settings,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Eye,
  Copy,
  X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface CommunicationRule {
  id: string
  name: string
  description: string
  trigger_type: string
  trigger_conditions: any
  action_type: string
  action_config: any
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
  last_executed_at?: string
  execution_count: number
}

export function AutomationManager() {
  const { userProfile } = useAuth()
  const [rules, setRules] = useState<CommunicationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedRule, setSelectedRule] = useState<CommunicationRule | null>(null)
  const [activeTab, setActiveTab] = useState('rules')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'claim_status_change',
    trigger_conditions: {},
    action_type: 'send_email',
    action_config: {},
    is_active: true,
    priority: 1
  })

  useEffect(() => {
    loadRules()
  }, [])

  useEffect(() => {
    if (selectedRule) {
      setFormData({
        name: selectedRule.name,
        description: selectedRule.description,
        trigger_type: selectedRule.trigger_type,
        trigger_conditions: selectedRule.trigger_conditions || {},
        action_type: selectedRule.action_type,
        action_config: selectedRule.action_config || {},
        is_active: selectedRule.is_active,
        priority: selectedRule.priority
      })
    } else {
      setFormData({
        name: '',
        description: '',
        trigger_type: 'claim_status_change',
        trigger_conditions: {},
        action_type: 'send_email',
        action_config: {},
        is_active: true,
        priority: 1
      })
    }
  }, [selectedRule])

  async function loadRules() {
    try {
      const { data, error } = await supabase
        .from('communication_rules')
        .select('*')
        .eq('organization_id', userProfile?.organization_id)
        .order('priority', { ascending: true })

      if (error) throw error
      setRules(data || [])
    } catch (error) {
      console.error('Error loading rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const ruleData = {
        ...formData,
        organization_id: userProfile?.organization_id
      }

      if (selectedRule) {
        await supabase
          .from('communication_rules')
          .update(ruleData)
          .eq('id', selectedRule.id)
      } else {
        await supabase
          .from('communication_rules')
          .insert([ruleData])
      }
      
      await loadRules()
      setShowForm(false)
      setSelectedRule(null)
    } catch (error) {
      console.error('Error saving rule:', error)
    }
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return

    try {
      await supabase
        .from('communication_rules')
        .delete()
        .eq('id', id)
      
      await loadRules()
    } catch (error) {
      console.error('Error deleting rule:', error)
    }
  }

  const handleToggleRule = async (rule: CommunicationRule) => {
    try {
      await supabase
        .from('communication_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id)
      
      await loadRules()
    } catch (error) {
      console.error('Error toggling rule:', error)
    }
  }

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'claim_status_change': return <FileText className="h-4 w-4" />
      case 'time_based': return <Clock className="h-4 w-4" />
      case 'client_action': return <Users className="h-4 w-4" />
      case 'document_uploaded': return <FileText className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_email': return <Mail className="h-4 w-4" />
      case 'send_sms': return <MessageSquare className="h-4 w-4" />
      case 'schedule_call': return <Phone className="h-4 w-4" />
      case 'create_task': return <CheckCircle className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const predefinedRules = [
    {
      name: 'Welcome Email for New Claims',
      description: 'Automatically send welcome email when a new claim is created',
      trigger_type: 'claim_status_change',
      trigger_conditions: { status: 'new' },
      action_type: 'send_email',
      action_config: { template: 'welcome_new_claim' }
    },
    {
      name: 'Follow-up Reminder',
      description: 'Send follow-up reminder 3 days after last communication',
      trigger_type: 'time_based',
      trigger_conditions: { days_since_last_communication: 3 },
      action_type: 'send_email',
      action_config: { template: 'follow_up_reminder' }
    },
    {
      name: 'Document Request',
      description: 'Request missing documents when claim moves to review phase',
      trigger_type: 'claim_status_change',
      trigger_conditions: { status: 'under_review' },
      action_type: 'send_email',
      action_config: { template: 'document_request' }
    },
    {
      name: 'Settlement Notification',
      description: 'Notify client when settlement is reached',
      trigger_type: 'claim_status_change',
      trigger_conditions: { status: 'settled' },
      action_type: 'send_email',
      action_config: { template: 'settlement_notification' }
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication Automation</h2>
          <p className="text-gray-600 mt-1">Automate routine communications and follow-ups</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'rules', label: 'Active Rules', icon: Zap },
            { id: 'templates', label: 'Rule Templates', icon: FileText },
            { id: 'analytics', label: 'Automation Analytics', icon: CheckCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {rules.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No automation rules</h3>
                <p className="text-gray-600 mb-6">
                  Create your first automation rule to streamline communication workflows
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            rules.map((rule) => (
              <Card key={rule.id} className={`${rule.is_active ? '' : 'opacity-60'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.is_active ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                          ) : (
                            <><Pause className="h-3 w-3 mr-1" /> Paused</>
                          )}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          rule.priority === 1 ? 'bg-red-100 text-red-800' :
                          rule.priority === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          Priority {rule.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{rule.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="p-2 bg-blue-100 rounded-full">
                            {getTriggerIcon(rule.trigger_type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Trigger</p>
                            <p className="text-xs text-blue-700 capitalize">
                              {rule.trigger_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="p-2 bg-green-100 rounded-full">
                            {getActionIcon(rule.action_type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900">Action</p>
                            <p className="text-xs text-green-700 capitalize">
                              {rule.action_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                        <span>Executed: {rule.execution_count} times</span>
                        {rule.last_executed_at && (
                          <span>Last run: {new Date(rule.last_executed_at).toLocaleDateString()}</span>
                        )}
                        <span>Created: {new Date(rule.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleRule(rule)}
                      >
                        {rule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRule(rule)
                          setShowForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Rule Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {predefinedRules.map((template, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getTriggerIcon(template.trigger_type)}
                  <span>{template.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{template.description}</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-1 bg-blue-100 rounded">
                      {getTriggerIcon(template.trigger_type)}
                    </div>
                    <span className="text-sm text-gray-700 capitalize">
                      Trigger: {template.trigger_type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-1 bg-green-100 rounded">
                      {getActionIcon(template.action_type)}
                    </div>
                    <span className="text-sm text-gray-700 capitalize">
                      Action: {template.action_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => {
                    setFormData({
                      name: template.name,
                      description: template.description,
                      trigger_type: template.trigger_type,
                      trigger_conditions: template.trigger_conditions,
                      action_type: template.action_type,
                      action_config: template.action_config,
                      is_active: true,
                      priority: 1
                    })
                    setSelectedRule(null)
                    setShowForm(true)
                  }}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{rules.length}</div>
              <p className="text-sm text-gray-600">Active automation rules</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {rules.reduce((sum, rule) => sum + rule.execution_count, 0)}
              </div>
              <p className="text-sm text-gray-600">Automated communications sent</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {rules.filter(rule => rule.is_active).length}
              </div>
              <p className="text-sm text-gray-600">Currently running</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rule Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedRule ? 'Edit Automation Rule' : 'New Automation Rule'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setSelectedRule(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveRule} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter rule name..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={1}>High (1)</option>
                    <option value={2}>Medium (2)</option>
                    <option value={3}>Low (3)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe what this rule does..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Type
                  </label>
                  <select
                    value={formData.trigger_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, trigger_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="claim_status_change">Claim Status Change</option>
                    <option value="time_based">Time Based</option>
                    <option value="client_action">Client Action</option>
                    <option value="document_uploaded">Document Uploaded</option>
                    <option value="payment_received">Payment Received</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Type
                  </label>
                  <select
                    value={formData.action_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, action_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="send_email">Send Email</option>
                    <option value="send_sms">Send SMS</option>
                    <option value="schedule_call">Schedule Call</option>
                    <option value="create_task">Create Task</option>
                    <option value="update_status">Update Status</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active rule (will execute automatically)
                </label>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setSelectedRule(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}