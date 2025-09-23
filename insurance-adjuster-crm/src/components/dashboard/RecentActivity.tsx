import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { FileText, Upload, Mail, Clock } from 'lucide-react'

interface ActivityItem {
  type: string
  message: string
  timestamp: string
  user: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'claim_update':
        return FileText
      case 'document_upload':
        return Upload
      case 'client_communication':
        return Mail
      default:
        return Clock
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'claim_update':
        return 'text-blue-600 bg-blue-50'
      case 'document_upload':
        return 'text-green-600 bg-green-50'
      case 'client_communication':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Less than an hour ago'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type)
            const colorClasses = getActivityColor(activity.type)
            
            return (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${colorClasses}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      by {activity.user}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}