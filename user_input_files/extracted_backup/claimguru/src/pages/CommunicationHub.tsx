import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Send,
  Calendar,
  Users,
  FileText,
  Plus,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Bell,
  Settings,
  Zap,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Communication, Claim, Client } from '../lib/supabase'
import { CommunicationForm } from '../components/forms/CommunicationForm'
import { EmailTemplateManager } from '../components/communication/EmailTemplateManager'
import { CommunicationAnalytics } from '../components/communication/CommunicationAnalytics'
import { AutomationManager } from '../components/communication/AutomationManager'

interface CommunicationStats {
  totalCommunications: number
  emailsSent: number
  smsSent: number
  callsMade: number
  responseRate: number
  averageResponseTime: number
  recentCommunications: Communication[]
  communicationsByType: { type: string; count: number }[]
  communicationsByStatus: { status: string; count: number }[]
  monthlyActivity: { month: string; emails: number; sms: number; calls: number }[]
  pendingFollowUps: number
  scheduledCommunications: number
}

export function CommunicationHub() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<CommunicationStats | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [communications, setCommunications] = useState<Communication[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [showCommunicationForm, setShowCommunicationForm] = useState(false)
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadCommunicationData()
    }
  }, [userProfile?.organization_id, dateRange, filterType, filterStatus])

  async function loadCommunicationData() {
    if (!userProfile?.organization_id) return

    try {
      setLoading(true)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      switch (dateRange) {
        case '7d': startDate.setDate(endDate.getDate() - 7); break
        case '30d': startDate.setDate(endDate.getDate() - 30); break
        case '90d': startDate.setDate(endDate.getDate() - 90); break
        case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break
        default: startDate.setDate(endDate.getDate() - 30)
      }

      // Build query filters
      let query = supabase
        .from('communications')
        .select('*, claims(file_number), clients(first_name, last_name, business_name)')
        .eq('organization_id', userProfile.organization_id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (filterType !== 'all') {
        query = query.eq('communication_type', filterType)
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const [communicationsData, claimsData, clientsData] = await Promise.all([
        query,
        supabase
          .from('claims')
          .select('id, file_number, client_id')
          .eq('organization_id', userProfile.organization_id),
        supabase
          .from('clients')
          .select('id, first_name, last_name, business_name, client_type')
          .eq('organization_id', userProfile.organization_id)
      ])

      const communicationsResult = communicationsData.data || []
      const claimsResult = claimsData.data || []
      const clientsResult = clientsData.data || []

      // Filter by search term
      const filteredCommunications = communicationsResult.filter(comm => {
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        return (
          comm.subject?.toLowerCase().includes(searchLower) ||
          comm.content?.toLowerCase().includes(searchLower) ||
          comm.claims?.file_number?.toLowerCase().includes(searchLower) ||
          comm.clients?.first_name?.toLowerCase().includes(searchLower) ||
          comm.clients?.last_name?.toLowerCase().includes(searchLower) ||
          comm.clients?.business_name?.toLowerCase().includes(searchLower)
        )
      })

      // Calculate statistics
      const totalCommunications = filteredCommunications.length
      const emailsSent = filteredCommunications.filter(c => c.communication_type === 'email').length
      const smsSent = filteredCommunications.filter(c => c.communication_type === 'sms').length
      const callsMade = filteredCommunications.filter(c => c.communication_type === 'phone').length
      
      const completedCommunications = filteredCommunications.filter(c => c.status === 'delivered' || c.status === 'completed')
      const responseRate = totalCommunications > 0 ? (completedCommunications.length / totalCommunications * 100) : 0
      
      // Average response time (simplified calculation)
      const responseTimes = filteredCommunications
        .filter(c => c.delivered_at && c.sent_at)
        .map(c => new Date(c.delivered_at!).getTime() - new Date(c.sent_at!).getTime())
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / (1000 * 60 * 60) // Convert to hours
        : 0

      // Communications by type
      const communicationsByType = [
        { type: 'email', count: emailsSent },
        { type: 'sms', count: smsSent },
        { type: 'phone', count: callsMade },
        { type: 'meeting', count: filteredCommunications.filter(c => c.communication_type === 'meeting').length }
      ].filter(item => item.count > 0)

      // Communications by status
      const statusCounts = filteredCommunications.reduce((acc, comm) => {
        acc[comm.status] = (acc[comm.status] || 0) + 1
        return acc
      }, {} as { [key: string]: number })
      
      const communicationsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number
      }))

      // Monthly activity
      const monthlyData = {}
      filteredCommunications.forEach(comm => {
        const month = new Date(comm.created_at).toLocaleString('default', { month: 'short', year: 'numeric' })
        if (!monthlyData[month]) {
          monthlyData[month] = { emails: 0, sms: 0, calls: 0 }
        }
        if (comm.communication_type === 'email') monthlyData[month].emails++
        else if (comm.communication_type === 'sms') monthlyData[month].sms++
        else if (comm.communication_type === 'phone') monthlyData[month].calls++
      })

      const monthlyActivity = Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
        month,
        emails: data.emails,
        sms: data.sms,
        calls: data.calls
      }))

      const pendingFollowUps = filteredCommunications.filter(c => 
        c.follow_up_required && !c.follow_up_date
      ).length

      const scheduledCommunications = filteredCommunications.filter(c => 
        c.scheduled_at && new Date(c.scheduled_at) > new Date()
      ).length

      setStats({
        totalCommunications,
        emailsSent,
        smsSent,
        callsMade,
        responseRate,
        averageResponseTime,
        recentCommunications: filteredCommunications.slice(0, 10),
        communicationsByType,
        communicationsByStatus,
        monthlyActivity: monthlyActivity.slice(-6),
        pendingFollowUps,
        scheduledCommunications
      })

      setCommunications(filteredCommunications)
      setClaims(claimsResult as Claim[])
      setClients(clientsResult as Client[])
    } catch (error) {
      console.error('Error loading communication data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCommunication = async (data: any) => {
    try {
      if (selectedCommunication) {
        await supabase
          .from('communications')
          .update(data)
          .eq('id', selectedCommunication.id)
      } else {
        await supabase
          .from('communications')
          .insert([{ ...data, organization_id: userProfile?.organization_id }])
      }
      
      await loadCommunicationData()
      setShowCommunicationForm(false)
      setSelectedCommunication(null)
    } catch (error) {
      console.error('Error saving communication:', error)
    }
  }

  const handleDeleteCommunication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this communication?')) return

    try {
      await supabase
        .from('communications')
        .delete()
        .eq('id', id)
      
      await loadCommunicationData()
    } catch (error) {
      console.error('Error deleting communication:', error)
    }
  }

  const exportData = () => {
    const exportData = {
      communications,
      stats,
      filters: { type: filterType, status: filterStatus, dateRange, searchTerm }
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `communications-report-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive communication management and analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCommunicationForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Communication
          </Button>
        </div>
      </div>

      {/* Communication Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Communications</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalCommunications || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {dateRange.replace('d', ' days').replace('y', ' year')}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.responseRate?.toFixed(1) || '0'}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Successful delivery rate
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats?.averageResponseTime?.toFixed(1) || '0'}h
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Average time to respond
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Follow-ups</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats?.pendingFollowUps || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Requires attention
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <Bell className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'communications', label: 'Communications', icon: MessageSquare },
            { id: 'templates', label: 'Email Templates', icon: FileText },
            { id: 'automation', label: 'Automation', icon: Zap },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Communication Types Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Communication Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.communicationsByType?.map((item, index) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        item.type === 'email' ? 'bg-blue-100' :
                        item.type === 'sms' ? 'bg-green-100' :
                        item.type === 'phone' ? 'bg-orange-100' :
                        'bg-purple-100'
                      }`}>
                        {item.type === 'email' ? (
                          <Mail className="h-4 w-4 text-blue-600" />
                        ) : item.type === 'sms' ? (
                          <MessageSquare className="h-4 w-4 text-green-600" />
                        ) : item.type === 'phone' ? (
                          <Phone className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Calendar className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium capitalize">
                        {item.type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No communication data</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Communications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Communications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentCommunications?.slice(0, 5).map((communication, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className={`p-2 rounded-full ${
                      communication.communication_type === 'email' ? 'bg-blue-100' :
                      communication.communication_type === 'sms' ? 'bg-green-100' :
                      communication.communication_type === 'phone' ? 'bg-orange-100' :
                      'bg-purple-100'
                    }`}>
                      {communication.communication_type === 'email' ? (
                        <Mail className="h-4 w-4 text-blue-600" />
                      ) : communication.communication_type === 'sms' ? (
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      ) : communication.communication_type === 'phone' ? (
                        <Phone className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Calendar className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {communication.subject || `${communication.communication_type} communication`}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(communication.created_at).toLocaleDateString()} • 
                        {communication.claims?.file_number || communication.clients?.first_name || 'System'}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      communication.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      communication.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      communication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {communication.status}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No recent communications</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'communications' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Communications</CardTitle>
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search communications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
                
                {/* Filters */}
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="phone">Phone</option>
                  <option value="meeting">Meeting</option>
                </select>
                
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject/Content</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {communications.map((communication) => (
                    <tr key={communication.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded-full ${
                            communication.communication_type === 'email' ? 'bg-blue-100' :
                            communication.communication_type === 'sms' ? 'bg-green-100' :
                            communication.communication_type === 'phone' ? 'bg-orange-100' :
                            'bg-purple-100'
                          }`}>
                            {communication.communication_type === 'email' ? (
                              <Mail className="h-3 w-3 text-blue-600" />
                            ) : communication.communication_type === 'sms' ? (
                              <MessageSquare className="h-3 w-3 text-green-600" />
                            ) : communication.communication_type === 'phone' ? (
                              <Phone className="h-3 w-3 text-orange-600" />
                            ) : (
                              <Calendar className="h-3 w-3 text-purple-600" />
                            )}
                          </div>
                          <span className="text-sm font-medium capitalize">
                            {communication.communication_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {communication.subject || 'No subject'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {communication.content}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {communication.clients?.business_name || 
                         `${communication.clients?.first_name || ''} ${communication.clients?.last_name || ''}`.trim() ||
                         'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          communication.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          communication.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          communication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {communication.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(communication.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCommunication(communication)
                            setShowCommunicationForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCommunication(communication.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {communications.length === 0 && (
                <p className="text-gray-500 text-center py-8">No communications found</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'templates' && (
        <EmailTemplateManager />
      )}

      {activeTab === 'automation' && (
        <AutomationManager />
      )}

      {activeTab === 'analytics' && (
        <CommunicationAnalytics stats={stats} />
      )}

      {/* Communication Form Modal */}
      {showCommunicationForm && (
        <CommunicationForm
          communication={selectedCommunication}
          claims={claims}
          clients={clients}
          isOpen={showCommunicationForm}
          onClose={() => {
            setShowCommunicationForm(false)
            setSelectedCommunication(null)
          }}
          onSave={handleSaveCommunication}
        />
      )}
    </div>
  )
}