import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Settings, 
  Search, 
  Filter,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Users,
  BarChart3,
  Plus,
  Download,
  RefreshCw
} from 'lucide-react'
import { emailAutomationService } from '../services/emailAutomationService'

interface EmailStats {
  totalEmails: number
  claimRelated: number
  highPriority: number
  averageConfidence: number
  tasksCreated: number
  claimNumbersExtracted: number
}

export default function Communications() {
  const [activeTab, setActiveTab] = useState<'emails' | 'calls' | 'sms' | 'settings'>('emails')
  const [emailLogs, setEmailLogs] = useState<any[]>([])
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadEmailData()
  }, [])

  const loadEmailData = async () => {
    setIsLoading(true)
    try {
      const [logs, stats] = await Promise.all([
        emailAutomationService.getRecentEmailLogs(100),
        emailAutomationService.getEmailAnalytics(30)
      ])
      
      setEmailLogs(logs)
      setEmailStats(stats)
    } catch (error) {
      console.error('Failed to load email data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadEmailData()
    setIsRefreshing(false)
  }

  const filteredEmails = emailLogs.filter(email => {
    const matchesSearch = email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.from_email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterCategory === 'all') return matchesSearch
    return matchesSearch && email.classification?.category === filterCategory
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      claim_related: 'text-blue-600 bg-blue-100',
      insurer_update: 'text-purple-600 bg-purple-100',
      vendor_communication: 'text-orange-600 bg-orange-100',
      client_communication: 'text-green-600 bg-green-100',
      other: 'text-gray-600 bg-gray-100'
    }
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Loading communications...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600">Email automation system with AI processing</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Setup Integration
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'emails', label: 'Email System', icon: Mail },
            { id: 'calls', label: 'Phone System', icon: Phone },
            { id: 'sms', label: 'SMS System', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Email Tab */}
      {activeTab === 'emails' && (
        <div className="space-y-6">
          {/* Email Statistics */}
          {emailStats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Mail className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{emailStats.totalEmails}</div>
                  <div className="text-sm text-gray-600">Total Emails</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{emailStats.claimRelated}</div>
                  <div className="text-sm text-gray-600">Claim Related</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{emailStats.highPriority}</div>
                  <div className="text-sm text-gray-600">High Priority</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Brain className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((emailStats.averageConfidence || 0) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">AI Confidence</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{emailStats.tasksCreated}</div>
                  <div className="text-sm text-gray-600">Tasks Created</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{emailStats.claimNumbersExtracted}</div>
                  <div className="text-sm text-gray-600">Claims Found</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Email System Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Email Processing System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Email Ingestion</h3>
                  <p className="text-sm text-gray-600">
                    Automatic email collection from IMAP/Gmail with real-time processing
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">AI Classification</h3>
                  <p className="text-sm text-gray-600">
                    Smart categorization, claim number extraction, and priority assessment
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Auto Actions</h3>
                  <p className="text-sm text-gray-600">
                    Automatic task creation, notifications, and workflow triggers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Email Integration</h4>
                      <p className="text-sm text-gray-600">Backend processing system ready</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium">AI Processing</h4>
                      <p className="text-sm text-gray-600">Document processing and extraction</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Other tabs */}
      {activeTab === 'calls' && (
        <Card>
          <CardContent className="p-8 text-center">
            <Phone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Phone System Integration</h3>
            <p className="text-gray-600 mb-4">Amazon Connect integration available for advanced phone features</p>
            <Button className="flex items-center gap-2 mx-auto">
              <Settings className="h-4 w-4" />
              Setup Phone System
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'sms' && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">SMS Integration</h3>
            <p className="text-gray-600 mb-4">SMS automation and tracking ready for configuration</p>
            <Button className="flex items-center gap-2 mx-auto">
              <Settings className="h-4 w-4" />
              Setup SMS Service
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                The communication system is now integrated with real backend processing. 
                Advanced configuration options will be available in the next update.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Document Processing</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Real AI-powered document extraction with Supabase storage
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Configured</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Email Processing</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    AI classification and automated task creation system
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Ready</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
