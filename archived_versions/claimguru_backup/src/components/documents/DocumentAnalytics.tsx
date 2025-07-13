import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { 
  FileText, 
  Brain, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  Download,
  Upload,
  Folder
} from 'lucide-react'

interface DocumentAnalyticsProps {
  stats: {
    totalDocuments: number
    documentsThisMonth: number
    aiProcessed: number
    pendingReview: number
    documentsByType: { type: string; count: number }[]
    documentsByCategory: { category: string; count: number }[]
    recentActivity: any[]
    storageUsage: { used: number; total: number }
    complianceStatus: { compliant: number; total: number }
  } | null
}

export function DocumentAnalytics({ stats }: DocumentAnalyticsProps) {
  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        No analytics data available
      </div>
    )
  }

  const storagePercentage = stats.storageUsage.total > 0 ? 
    (stats.storageUsage.used / stats.storageUsage.total * 100) : 0
  
  const compliancePercentage = stats.complianceStatus.total > 0 ?
    (stats.complianceStatus.compliant / stats.complianceStatus.total * 100) : 0

  const aiProcessingRate = stats.totalDocuments > 0 ?
    (stats.aiProcessed / stats.totalDocuments * 100) : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Processing Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                aiProcessingRate >= 80 ? 'text-green-600' :
                aiProcessingRate >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {aiProcessingRate.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.aiProcessed} of {stats.totalDocuments} processed
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className={`h-2 rounded-full ${
                    aiProcessingRate >= 80 ? 'bg-green-600' :
                    aiProcessingRate >= 60 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(aiProcessingRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Compliance Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                compliancePercentage >= 90 ? 'text-green-600' :
                compliancePercentage >= 75 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {compliancePercentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.complianceStatus.compliant} compliant documents
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className={`h-2 rounded-full ${
                    compliancePercentage >= 90 ? 'bg-green-600' :
                    compliancePercentage >= 75 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(compliancePercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Storage Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                storagePercentage < 80 ? 'text-green-600' :
                storagePercentage < 95 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {storagePercentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {(stats.storageUsage.used / 1024 / 1024 / 1024).toFixed(2)} GB used
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className={`h-2 rounded-full ${
                    storagePercentage < 80 ? 'bg-green-600' :
                    storagePercentage < 95 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Review</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                stats.pendingReview === 0 ? 'text-green-600' :
                stats.pendingReview <= 5 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {stats.pendingReview}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Documents awaiting review
              </p>
              {stats.pendingReview > 0 && (
                <div className="mt-4">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    stats.pendingReview <= 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Requires attention
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Documents by Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.documentsByType?.map((item, index) => {
                const percentage = stats.totalDocuments > 0 ? (item.count / stats.totalDocuments * 100) : 0
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500']
                const color = colors[index % colors.length]
                
                return (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${color}`}></div>
                        <span className="text-sm font-medium capitalize">
                          {item.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {item.count}
                        </div>
                        <div className="text-xs text-gray-500">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              }) || (
                <p className="text-gray-500 text-center py-4">No document type data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Folder className="h-5 w-5" />
              <span>Documents by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.documentsByCategory?.map((item, index) => {
                const percentage = stats.totalDocuments > 0 ? (item.count / stats.totalDocuments * 100) : 0
                const colors = ['bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500']
                const color = colors[index % colors.length]
                
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${color}`}></div>
                        <span className="text-sm font-medium capitalize">
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {item.count}
                        </div>
                        <div className="text-xs text-gray-500">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              }) || (
                <p className="text-gray-500 text-center py-4">No category data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Recent Document Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'upload' ? 'bg-green-100' :
                    activity.type === 'ai_analysis' ? 'bg-purple-100' :
                    activity.type === 'download' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {activity.type === 'upload' ? (
                      <Upload className="h-4 w-4 text-green-600" />
                    ) : activity.type === 'ai_analysis' ? (
                      <Brain className="h-4 w-4 text-purple-600" />
                    ) : activity.type === 'download' ? (
                      <Download className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {activity.description || activity.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()} • 
                      {activity.user_name || 'System'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {activity.ai_processed && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      <Brain className="h-3 w-3 mr-1" />
                      AI Processed
                    </div>
                  )}
                  {activity.is_compliant && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Compliant
                    </div>
                  )}
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Analysis Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {stats.aiProcessed}
              </div>
              <p className="text-sm text-gray-600">Documents Analyzed</p>
              <p className="text-xs text-gray-500 mt-1">
                Automated processing with entity extraction
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {stats.complianceStatus.compliant}
              </div>
              <p className="text-sm text-gray-600">Compliance Verified</p>
              <p className="text-xs text-gray-500 mt-1">
                Meeting regulatory requirements
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {stats.totalDocuments - stats.aiProcessed}
              </div>
              <p className="text-sm text-gray-600">Pending Analysis</p>
              <p className="text-xs text-gray-500 mt-1">
                Queued for AI processing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}