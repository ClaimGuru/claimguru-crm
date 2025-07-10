import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  FileText,
  Plus, 
  Search, 
  Filter, 
  Send,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Settings,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Bell
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Communication } from '../lib/supabase'
import { useClaims } from '../hooks/useClaims'
import { useClients } from '../hooks/useClients'

interface CommunicationTemplate {
  id: string
  organization_id: string
  template_name: string
  template_type: string
  category: string
  subject?: string
  content: string
  variables?: any
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export function Communications() {
  const { userProfile } = useAuth()
  const { claims } = useClaims()
  const { clients } = useClients()
  const [loading, setLoading] = useState(true)
  const [communications, setCommunications] = useState<Communication[]>([])
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'templates' | 'compose'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadCommunicationData()
    }
  }, [userProfile?.organization_id])

  async function loadCommunicationData() {
    if (!userProfile?.organization_id) return

    try {
      setLoading(true)
      const [communicationsData, templatesData] = await Promise.all([
        supabase
          .from('communications')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('communication_templates')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .order('template_name')
      ])

      setCommunications(communicationsData.data || [])
      setTemplates(templatesData.data || [])
    } catch (error) {
      console.error('Error loading communication data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = 
      comm.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.content?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || comm.communication_type === typeFilter
    const matchesStatus = statusFilter === 'all' || comm.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail
      case 'sms': return MessageSquare
      case 'phone': return Phone
      case 'letter': return FileText
      default: return Mail
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': case 'delivered': return CheckCircle
      case 'failed': return AlertCircle
      case 'draft': return Clock
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': case 'delivered': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'draft': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Calculate communication metrics
  const totalCommunications = communications.length
  const emailCount = communications.filter(c => c.communication_type === 'email').length
  const smsCount = communications.filter(c => c.communication_type === 'sms').length
  const phoneCount = communications.filter(c => c.communication_type === 'phone').length
  const recentCommunications = communications.filter(c => {
    const date = new Date(c.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return date >= weekAgo
  }).length

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Center</h1>
          <p className="text-gray-600 mt-2">
            Manage emails, SMS, calls, and communication templates
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>

      {/* Communication Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-900">{totalCommunications}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {recentCommunications} this week
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Messages</p>
                  <p className="text-3xl font-bold text-gray-900">{emailCount}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((emailCount / totalCommunications) * 100 || 0).toFixed(0)}% of total
                  </p>
                </div>
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SMS Messages</p>
                  <p className="text-3xl font-bold text-gray-900">{smsCount}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((smsCount / totalCommunications) * 100 || 0).toFixed(0)}% of total
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone Calls</p>
                  <p className="text-3xl font-bold text-gray-900">{phoneCount}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((phoneCount / totalCommunications) * 100 || 0).toFixed(0)}% of total
                  </p>
                </div>
                <Phone className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: MessageSquare },
            { id: 'history', label: 'Communication History', icon: Clock },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'compose', label: 'Compose', icon: Send }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      {(activeTab === 'history' || activeTab === 'templates') && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="phone">Phone</option>
              <option value="letter">Letter</option>
            </select>
            {activeTab === 'history' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
            )}
          </div>
        </div>
      )}

      {/* Communication History */}
      {activeTab === 'history' && (
        <Card>
          <CardContent className="p-6">
            {filteredCommunications.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No communications found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start communicating with your clients and vendors'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCommunications.map((comm) => {
                  const CommunicationIcon = getCommunicationIcon(comm.communication_type)
                  const StatusIcon = getStatusIcon(comm.status)
                  const statusColorClass = getStatusColor(comm.status)
                  
                  return (
                    <div key={comm.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <CommunicationIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {comm.subject || `${comm.communication_type.charAt(0).toUpperCase() + comm.communication_type.slice(1)} Communication`}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
                                <StatusIcon className="h-3 w-3 inline mr-1" />
                                {comm.status.charAt(0).toUpperCase() + comm.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                              {comm.content && comm.content.length > 100 
                                ? comm.content.substring(0, 100) + '...'
                                : comm.content}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(comm.created_at).toLocaleString()}
                              </span>
                              {comm.sent_at && (
                                <span className="flex items-center">
                                  <Send className="h-3 w-3 mr-1" />
                                  Sent: {new Date(comm.sent_at).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Templates Management */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Communication Templates</h2>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const TemplateIcon = getCommunicationIcon(template.template_type)
              
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <TemplateIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{template.template_name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{template.template_type}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.is_active 
                          ? 'text-green-600 bg-green-100'
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    {template.subject && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Subject:</strong> {template.subject}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {template.content.length > 120 
                        ? template.content.substring(0, 120) + '...'
                        : template.content}
                    </p>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 flex items-center gap-1">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            
            {/* Add New Template Card */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Create New Template</h3>
                    <p className="text-sm text-gray-500">Add a new communication template</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Compose Message */}
      {activeTab === 'compose' && (
        <Card>
          <CardHeader>
            <CardTitle>Compose New Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="letter">Letter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template (Optional)
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select a template...</option>
                  {templates.filter(t => t.is_active).map(template => (
                    <option key={template.id} value={template.id}>
                      {template.template_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients
              </label>
              <input 
                type="text" 
                placeholder="Enter email addresses or select from contacts..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input 
                type="text" 
                placeholder="Enter message subject..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
              </label>
              <textarea 
                rows={8}
                placeholder="Type your message here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Attach Files
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Schedule
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline">Save Draft</Button>
                <Button className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Communications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communications.slice(0, 5).map((comm) => {
                  const CommunicationIcon = getCommunicationIcon(comm.communication_type)
                  
                  return (
                    <div key={comm.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CommunicationIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {comm.subject || `${comm.communication_type.charAt(0).toUpperCase() + comm.communication_type.slice(1)}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(comm.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comm.status)}`}>
                        {comm.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Template Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.slice(0, 5).map((template) => {
                  const TemplateIcon = getCommunicationIcon(template.template_type)
                  
                  return (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <TemplateIcon className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{template.template_name}</p>
                          <p className="text-sm text-gray-500 capitalize">{template.template_type}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Send className="h-3 w-3" />
                        Use
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}