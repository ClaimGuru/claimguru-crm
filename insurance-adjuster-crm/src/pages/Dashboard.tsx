import React, { useState, useEffect } from 'react'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Plus, FileText, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Dashboard() {
  const { organization } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load sample data
    const loadData = async () => {
      try {
        const response = await fetch('/data/sample-data.json')
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Fallback to default data
        setDashboardData({
          claims_summary: {
            total_claims: 87,
            active_claims: 23,
            settled_claims: 58,
            total_value: 12450000,
            settled_value: 8750000
          },
          recent_activity: [
            {
              type: 'claim_update',
              message: 'Claim #2024-1501 status updated to Settlement Negotiation',
              timestamp: '2025-09-24T04:30:00Z',
              user: 'Sarah Johnson'
            }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const statsData = dashboardData ? {
    totalClaims: dashboardData.claims_summary.total_claims,
    activeClaims: dashboardData.claims_summary.active_claims,
    settledClaims: dashboardData.claims_summary.settled_claims,
    totalClients: 156, // Sample data
    totalValue: dashboardData.claims_summary.total_value,
    settledValue: dashboardData.claims_summary.settled_value
  } : {
    totalClaims: 0,
    activeClaims: 0,
    settledClaims: 0,
    totalClients: 0,
    totalValue: 0,
    settledValue: 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your claims.
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button asChild>
            <Link to="/claims/new">
              <Plus className="h-4 w-4 mr-2" />
              New Claim
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats data={statsData} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity activities={dashboardData?.recent_activity || []} />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/claims/new">
                  <FileText className="h-4 w-4 mr-2" />
                  Create New Claim
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/clients/new">
                  <Users className="h-4 w-4 mr-2" />
                  Add New Client
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/documents">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Documents
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          {organization && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Storage Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Used</span>
                    <span>2.4 GB of 5 TB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: '0.048%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Plenty of space available for your documents
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}