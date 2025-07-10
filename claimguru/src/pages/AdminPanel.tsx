import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Shield,
  Users,
  Building,
  Activity,
  Settings,
  Database,
  Key,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Server,
  Mail,
  MessageSquare,
  Brain
} from 'lucide-react'

interface SystemStats {
  total_organizations: number
  total_users: number
  total_claims: number
  total_integrations: number
  active_users_today: number
  claims_created_today: number
}

interface Organization {
  id: string
  name: string
  subscription_plan: string
  subscription_status: string
  created_at: string
  user_count: number
  claims_count: number
}

interface CoreService {
  id: string
  name: string
  category: string
  status: string
  last_checked: string
  error_count: number
}

export function AdminPanel() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [coreServices, setCoreServices] = useState<CoreService[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadAdminData()
  }, [])

  async function loadAdminData() {
    setLoading(true)
    try {
      // Load system statistics
      await Promise.all([
        loadSystemStats(),
        loadOrganizations(),
        loadCoreServices()
      ])
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadSystemStats() {
    try {
      // Get organization count
      const { count: orgCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })

      // Get user count  
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Get claims count
      const { count: claimsCount } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })

      // Get integrations count
      const { count: integrationsCount } = await supabase
        .from('organization_integrations')
        .select('*', { count: 'exact', head: true })
        .eq('is_enabled', true)

      // Get today's active users (simplified)
      const today = new Date().toISOString().split('T')[0]
      const { count: activeUsersToday } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', `${today}T00:00:00.000Z`)

      // Get today's claims
      const { count: claimsToday } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)

      setSystemStats({
        total_organizations: orgCount || 0,
        total_users: userCount || 0,
        total_claims: claimsCount || 0,
        total_integrations: integrationsCount || 0,
        active_users_today: activeUsersToday || 0,
        claims_created_today: claimsToday || 0
      })
    } catch (error) {
      console.error('Error loading system stats:', error)
    }
  }

  async function loadOrganizations() {
    try {
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          subscription_plan,
          subscription_status,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get user and claims count for each organization
      const organizationsWithCounts = await Promise.all(
        (orgs || []).map(async (org) => {
          const { count: userCount } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id)

          const { count: claimsCount } = await supabase
            .from('claims')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id)

          return {
            ...org,
            user_count: userCount || 0,
            claims_count: claimsCount || 0
          }
        })
      )

      setOrganizations(organizationsWithCounts)
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  }

  async function loadCoreServices() {
    try {
      // Get core services from integration providers
      const { data: services, error } = await supabase
        .from('integration_providers')
        .select('*')
        .eq('is_core_service', true)

      if (error) throw error

      // Mock service health data (in production, this would come from actual health checks)
      const coreServicesWithHealth = (services || []).map(service => ({
        id: service.id,
        name: service.name,
        category: service.category,
        status: Math.random() > 0.1 ? 'operational' : 'error', // 90% uptime simulation
        last_checked: new Date().toISOString(),
        error_count: Math.floor(Math.random() * 5)
      }))

      setCoreServices(coreServicesWithHealth)
    } catch (error) {
      console.error('Error loading core services:', error)
    }
  }

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'sms':
        return <MessageSquare className="h-4 w-4" />
      case 'ai':
        return <Brain className="h-4 w-4" />
      default:
        return <Server className="h-4 w-4" />
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Panel
          </h1>
          <p className="text-gray-600 mt-2">
            System administration and monitoring dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAdminData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'organizations', label: 'Organizations', icon: Building },
            { key: 'services', label: 'Core Services', icon: Server },
            { key: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Based on Active Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats?.total_organizations}</p>
                  </div>
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats?.total_users}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Claims</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats?.total_claims}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats?.total_integrations}</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users Today</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats?.active_users_today}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Claims Created Today</p>
                    <p className="text-3xl font-bold text-gray-900">{systemStats?.claims_created_today}</p>
                  </div>
                  <Clock className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'organizations' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All Plans</option>
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Organizations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Organization</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Plan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Users</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Claims</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((org) => (
                      <tr key={org.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{org.name}</div>
                          <div className="text-sm text-gray-500">{org.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {org.subscription_plan}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            org.subscription_status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {org.subscription_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{org.user_count}</td>
                        <td className="py-3 px-4 text-gray-900">{org.claims_count}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(org.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Core Platform Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {coreServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        {getServiceIcon(service.category)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{service.category} service</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getServiceStatusColor(service.status)}`}>
                          {service.status === 'operational' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          {service.status}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {service.error_count} errors
                        </p>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        Monitor
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Email Configuration</h3>
                  <p className="text-sm text-gray-600 mb-4">Configure SMTP settings for system emails</p>
                  <Button variant="outline">Configure Email</Button>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Backup Settings</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage automated backups and data retention</p>
                  <Button variant="outline">Backup Settings</Button>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Security Settings</h3>
                  <p className="text-sm text-gray-600 mb-4">Configure security policies and access controls</p>
                  <Button variant="outline">Security Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
