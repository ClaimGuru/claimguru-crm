import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { AdvancedAIDashboard } from '../components/ai/AdvancedAIDashboard'
import { ComprehensiveAnalyticsDashboard } from '../components/analytics/ComprehensiveAnalyticsDashboard'
import ActivityFeed from '../components/ui/ActivityFeed'
import { SkeletonCard, SkeletonDashboard } from '../components/ui/SkeletonLoader'
import { StaggeredAnimation, HoverScale, FadeIn } from '../components/ui/Animations'
import EmptyState from '../components/ui/EmptyState'
import Tooltip from '../components/ui/Tooltip'
import { useNotifications } from '../contexts/NotificationContext'
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Brain,
  Calendar,
  BarChart3,
  PieChart,
  Building,
  Plus,
  Eye,
  Zap,
  Target,
  Activity
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useNavigate } from 'react-router-dom'
import { useClaims } from '../hooks/useClaims'
import { useClients } from '../hooks/useClients'
import { useIsMobile } from '../hooks/use-mobile'
import { ClientForm } from '../components/forms/ClientForm'

interface DashboardStats {
  totalClaims: number
  openClaims: number
  totalClients: number
  pendingTasks: number
  totalValue: number
  settledValue: number
  pendingValue: number
  activeVendors: number
  recentActivity: any[]
  upcomingDeadlines: any[]
  claimsByStatus: { [key: string]: number }
  monthlyRevenue: { month: string; revenue: number }[]
}

export function Dashboard() {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const { claims, loading: claimsLoading } = useClaims()
  const { clients, loading: clientsLoading, createClient } = useClients()
  const { addNotification } = useNotifications()
  const isMobile = useIsMobile()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAIDashboard, setShowAIDashboard] = useState(false)
  const [showDebugClientForm, setShowDebugClientForm] = useState(false)
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false)

  useEffect(() => {
    if (!claimsLoading && !clientsLoading) {
      loadDashboardData()
    }
  }, [claimsLoading, clientsLoading, claims, clients])

  async function loadDashboardData() {
    if (!userProfile?.organization_id) return

    try {
      const [claimsData, clientsData, tasksData, activitiesData, vendorsData] = await Promise.all([
        supabase
          .from('claims')
          .select('id, claim_status, estimated_loss_value, total_settlement_amount, created_at, file_number, cause_of_loss')
          .eq('organization_id', userProfile.organization_id),
        supabase
          .from('clients')
          .select('id, created_at')
          .eq('organization_id', userProfile.organization_id),
        supabase
          .from('tasks')
          .select('id, status, priority, due_date, title')
          .eq('organization_id', userProfile.organization_id),
        supabase
          .from('activities')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('vendors')
          .select('id, is_active')
          .eq('organization_id', userProfile.organization_id)
          .eq('is_active', true)
      ])

      const claims = claimsData.data || []
      const clients = clientsData.data || []
      const tasks = tasksData.data || []
      const activities = activitiesData.data || []
      const vendors = vendorsData.data || []

      const openClaims = claims.filter(claim => 
        ['new', 'in_progress', 'under_review', 'investigating'].includes(claim.claim_status)
      )

      const settledClaims = claims.filter(claim => claim.claim_status === 'settled')
      const totalValue = claims.reduce((sum, claim) => sum + (claim.estimated_loss_value || 0), 0)
      const settledValue = settledClaims.reduce((sum, claim) => sum + (claim.total_settlement_amount || 0), 0)
      const pendingValue = openClaims.reduce((sum, claim) => sum + (claim.estimated_loss_value || 0), 0)

      const claimsByStatus = claims.reduce((acc, claim) => {
        acc[claim.claim_status] = (acc[claim.claim_status] || 0) + 1
        return acc
      }, {} as { [key: string]: number })

      const monthlyRevenue = settledClaims.reduce((acc, claim) => {
        const month = new Date(claim.created_at).toLocaleString('default', { month: 'short', year: 'numeric' })
        const existing = acc.find(item => item.month === month)
        if (existing) {
          existing.revenue += claim.total_settlement_amount || 0
        } else {
          acc.push({ month, revenue: claim.total_settlement_amount || 0 })
        }
        return acc
      }, [] as { month: string; revenue: number }[])

      setStats({
        totalClaims: claims.length,
        openClaims: openClaims.length,
        totalClients: clients.length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        totalValue,
        settledValue,
        pendingValue,
        activeVendors: vendors.length,
        recentActivity: activities,
        upcomingDeadlines: tasks.filter(task => task.due_date).slice(0, 5),
        claimsByStatus,
        monthlyRevenue: monthlyRevenue.slice(-6)
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      addNotification({
        type: 'error',
        title: 'Failed to load dashboard data',
        message: 'Please refresh the page to try again',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDebugClientSave = async (clientData: any) => {
    console.log('🔧 DEBUG: Dashboard client creation test')
    console.log('💾 Client data:', clientData)
    try {
      const result = await createClient(clientData)
      console.log('✅ DEBUG: Client created successfully:', result)
      setShowDebugClientForm(false)
      addNotification({
        type: 'success',
        title: 'Client created successfully',
        message: `Client ${result.first_name} ${result.last_name} has been added`,
        duration: 5000
      })
    } catch (error: any) {
      console.error('❌ DEBUG: Client creation failed:', error)
      addNotification({
        type: 'error',
        title: 'Client creation failed',
        message: error.message || 'Please try again',
        duration: 5000
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonDashboard />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <FadeIn>
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.first_name}!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your claims today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Tooltip content="View detailed analytics and insights">
                <Button 
                  onClick={() => setShowAnalyticsDashboard(!showAnalyticsDashboard)}
                  className={`${showAnalyticsDashboard ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white transition-colors`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {showAnalyticsDashboard ? 'Hide Analytics' : 'View Analytics'}
                </Button>
              </Tooltip>
              <Tooltip content="Test client creation functionality">
                <Button 
                  onClick={() => {
                    console.log('🔧 Debug button clicked!')
                    setShowDebugClientForm(true)
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  🔧 DEBUG: Test Client Creation
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HoverScale>
          <Card className="hover:shadow-lg transition-all duration-200 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Claims</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalClaims || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats?.openClaims || 0} open</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverScale>

        <HoverScale>
          <Card className="hover:shadow-lg transition-all duration-200 animate-fade-in stagger-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Settled Value</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${stats?.settledValue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Revenue generated</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverScale>

        <HoverScale>
          <Card className="hover:shadow-lg transition-all duration-200 animate-fade-in stagger-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Value</p>
                  <p className="text-3xl font-bold text-orange-600">
                    ${stats?.pendingValue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats?.openClaims || 0} open claims</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverScale>

        <HoverScale>
          <Card className="hover:shadow-lg transition-all duration-200 animate-fade-in stagger-3">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Network</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {(stats?.totalClients || 0) + (stats?.activeVendors || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.totalClients || 0} clients, {stats?.activeVendors || 0} vendors
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Building className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverScale>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <FadeIn delay={300}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Tooltip content="Create a new claim with manual entry">
                    <Button
                      onClick={() => navigate('/claims/new')}
                      className="w-full flex items-center gap-2 justify-start hover:shadow-md transition-all"
                      variant="outline"
                    >
                      <FileText className="h-4 w-4" />
                      New Claim
                    </Button>
                  </Tooltip>
                  
                  <Tooltip content="Add a new client to your database">
                    <Button
                      onClick={() => navigate('/clients')}
                      className="w-full flex items-center gap-2 justify-start hover:shadow-md transition-all"
                      variant="outline"
                    >
                      <Users className="h-4 w-4" />
                      Add Client
                    </Button>
                  </Tooltip>
                  
                  <Tooltip content="View your calendar and appointments">
                    <Button
                      onClick={() => navigate('/calendar')}
                      className="w-full flex items-center gap-2 justify-start hover:shadow-md transition-all"
                      variant="outline"
                    >
                      <Calendar className="h-4 w-4" />
                      Calendar
                    </Button>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* AI Dashboard Toggle */}
          {showAIDashboard && (
            <FadeIn delay={400}>
              <AdvancedAIDashboard />
            </FadeIn>
          )}

          {/* Analytics Dashboard */}
          {showAnalyticsDashboard && (
            <FadeIn delay={400}>
              <ComprehensiveAnalyticsDashboard />
            </FadeIn>
          )}

          {/* Recent Claims */}
          <FadeIn delay={500}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Recent Claims
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/claims')}
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {claims.length === 0 ? (
                  <EmptyState
                    title="No claims yet"
                    description="Get started by creating your first claim"
                    action={{
                      label: "Create New Claim",
                      onClick: () => navigate('/claims/new')
                    }}
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-3">
                    {claims.slice(0, 5).map((claim, index) => (
                      <FadeIn key={claim.id} delay={600 + index * 100}>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                             onClick={() => navigate(`/claims/${claim.id}`)}>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {claim.file_number || 'No file number'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {claim.cause_of_loss || 'No cause specified'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              claim.claim_status === 'settled' ? 'bg-green-100 text-green-700' :
                              claim.claim_status === 'new' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {claim.claim_status?.replace('_', ' ') || 'unknown'}
                            </span>
                            <Eye className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="space-y-6">
          <FadeIn delay={400}>
            <ActivityFeed 
              limit={20}
              compact={isMobile}
              className="h-[600px] overflow-y-auto"
            />
          </FadeIn>
        </div>
      </div>

      {/* Debug Modal */}
      {showDebugClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <FadeIn>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">🔧 DEBUG: Test Client Creation</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowDebugClientForm(false)}
                  >
                    ✕
                  </Button>
                </div>
                <ClientForm
                  isOpen={showDebugClientForm}
                  onClose={() => setShowDebugClientForm(false)}
                  onSave={handleDebugClientSave}
                />
              </div>
            </div>
          </FadeIn>
        </div>
      )}
    </div>
  )
}