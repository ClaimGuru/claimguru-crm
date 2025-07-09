import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Brain,
  Calendar
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

interface DashboardStats {
  totalClaims: number
  openClaims: number
  totalClients: number
  pendingTasks: number
  totalValue: number
  recentActivity: any[]
  upcomingDeadlines: any[]
  aiInsights: any[]
}

export function Dashboard() {
  const { userProfile } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    if (!userProfile?.organization_id) return

    try {
      // Load dashboard statistics
      const [claimsData, clientsData, tasksData, activitiesData] = await Promise.all([
        supabase
          .from('claims')
          .select('id, claim_status, estimated_loss_value, total_settlement_amount')
          .eq('organization_id', userProfile.organization_id),
        supabase
          .from('clients')
          .select('id')
          .eq('organization_id', userProfile.organization_id),
        supabase
          .from('tasks')
          .select('id, status, priority, due_date')
          .eq('organization_id', userProfile.organization_id)
          .eq('status', 'pending'),
        supabase
          .from('activities')
          .select('*')
          .eq('organization_id', userProfile.organization_id)
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      const claims = claimsData.data || []
      const clients = clientsData.data || []
      const tasks = tasksData.data || []
      const activities = activitiesData.data || []

      const openClaims = claims.filter(claim => 
        ['new', 'in_progress', 'under_review'].includes(claim.claim_status)
      )

      const totalValue = claims.reduce((sum, claim) => 
        sum + (claim.total_settlement_amount || claim.estimated_loss_value || 0), 0
      )

      setStats({
        totalClaims: claims.length,
        openClaims: openClaims.length,
        totalClients: clients.length,
        pendingTasks: tasks.length,
        totalValue,
        recentActivity: activities,
        upcomingDeadlines: tasks.filter(task => task.due_date).slice(0, 5),
        aiInsights: [] // TODO: Load AI insights
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your claims today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalClaims || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Claims</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.openClaims || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalClients || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats?.totalValue?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="font-medium">New Claim</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium">Add Client</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="font-medium">AI Analysis</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="font-medium">Schedule Meeting</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity?.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Pending Tasks</span>
              {stats?.pendingTasks && stats.pendingTasks > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {stats.pendingTasks}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.upcomingDeadlines?.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Task #{index + 1}
                    </p>
                    <p className="text-xs text-gray-600">
                      Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'high' 
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No pending tasks
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Insights & Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Your AI Assistant is Ready
                </h3>
                <p className="text-gray-600">
                  Upload documents to get instant AI-powered analysis and insights
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Document Analysis</h4>
                <p className="text-sm text-gray-600">
                  AI extracts key information from policies, estimates, and reports
                </p>
              </div>
              <div className="bg-white rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Outcome Prediction</h4>
                <p className="text-sm text-gray-600">
                  Predict claim outcomes and settlement ranges with AI analysis
                </p>
              </div>
              <div className="bg-white rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Risk Assessment</h4>
                <p className="text-sm text-gray-600">
                  Identify potential red flags and compliance issues automatically
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}