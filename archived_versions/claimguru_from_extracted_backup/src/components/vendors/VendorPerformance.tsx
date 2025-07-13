import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { 
  TrendingUp, 
  Award, 
  Clock, 
  DollarSign,
  Star,
  BarChart3
} from 'lucide-react'
import type { Vendor } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface VendorPerformanceProps {
  vendors: Vendor[]
}

interface PerformanceMetrics {
  vendorId: string
  vendorName: string
  category: string
  totalJobs: number
  completedJobs: number
  averageRating: number
  totalEarnings: number
  averageCompletionTime: number
  onTimeDelivery: number
}

export function VendorPerformance({ vendors }: VendorPerformanceProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([])
  const [sortBy, setSortBy] = useState('totalEarnings')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadPerformanceData()
  }, [vendors, userProfile?.organization_id])

  async function loadPerformanceData() {
    try {
      setLoading(true)
      
      // Calculate performance metrics for each vendor
      const vendorMetrics = vendors.map(vendor => {
        // Mock data for demonstration
        const totalJobs = Math.floor(Math.random() * 20) + 5
        const completedJobs = Math.floor(totalJobs * 0.8)
        const averageRating = 3 + Math.random() * 2
        const totalEarnings = Math.floor(Math.random() * 50000) + 10000
        const averageCompletionTime = Math.floor(Math.random() * 10) + 3
        const onTimeDelivery = 70 + Math.random() * 30
        
        return {
          vendorId: vendor.id,
          vendorName: vendor.company_name || '',
          category: vendor.category || '',
          totalJobs,
          completedJobs,
          averageRating,
          totalEarnings,
          averageCompletionTime,
          onTimeDelivery
        }
      })
      
      setPerformanceData(vendorMetrics)
    } catch (error) {
      console.error('Error loading performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = performanceData
    .sort((a, b) => {
      const aValue = a[sortBy as keyof PerformanceMetrics] as number
      const bValue = b[sortBy as keyof PerformanceMetrics] as number
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })

  const topPerformers = filteredData.slice(0, 5)
  const averageMetrics = {
    rating: filteredData.length > 0 ? filteredData.reduce((sum, v) => sum + v.averageRating, 0) / filteredData.length : 0,
    earnings: filteredData.reduce((sum, v) => sum + v.totalEarnings, 0),
    completionTime: filteredData.length > 0 ? filteredData.reduce((sum, v) => sum + v.averageCompletionTime, 0) / filteredData.length : 0,
    onTimeDelivery: filteredData.length > 0 ? filteredData.reduce((sum, v) => sum + v.onTimeDelivery, 0) / filteredData.length : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span>Avg Rating</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {averageMetrics.rating.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Total Paid</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${averageMetrics.earnings.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Avg Completion</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {averageMetrics.completionTime.toFixed(1)}
            </div>
            <p className="text-sm text-gray-600">Days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>On-Time Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {averageMetrics.onTimeDelivery.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Top Performers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((vendor, index) => (
              <div key={vendor.vendorId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' :
                    'bg-indigo-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{vendor.vendorName}</p>
                    <p className="text-sm text-gray-600">{vendor.category}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">${vendor.totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Earnings</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{vendor.averageRating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vendor.completedJobs}</p>
                    <p className="text-xs text-gray-500">Jobs</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vendor.onTimeDelivery.toFixed(0)}%</p>
                    <p className="text-xs text-gray-500">On-Time</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}