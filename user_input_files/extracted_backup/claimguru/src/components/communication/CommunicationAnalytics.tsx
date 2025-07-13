import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Calendar,
  TrendingUp, 
  TrendingDown,
  Target,
  Clock,
  Users,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface CommunicationAnalyticsProps {
  stats: {
    totalCommunications: number
    emailsSent: number
    smsSent: number
    callsMade: number
    responseRate: number
    averageResponseTime: number
    recentCommunications: any[]
    communicationsByType: { type: string; count: number }[]
    communicationsByStatus: { status: string; count: number }[]
    monthlyActivity: { month: string; emails: number; sms: number; calls: number }[]
    pendingFollowUps: number
    scheduledCommunications: number
  } | null
}

export function CommunicationAnalytics({ stats }: CommunicationAnalyticsProps) {
  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        No analytics data available
      </div>
    )
  }

  const emailPercentage = stats.totalCommunications > 0 ? (stats.emailsSent / stats.totalCommunications * 100) : 0
  const smsPercentage = stats.totalCommunications > 0 ? (stats.smsSent / stats.totalCommunications * 100) : 0
  const callPercentage = stats.totalCommunications > 0 ? (stats.callsMade / stats.totalCommunications * 100) : 0
  
  // Calculate engagement metrics
  const engagementScore = Math.round((stats.responseRate + (stats.averageResponseTime < 24 ? 80 : 40)) / 2)
  const communicationEfficiency = stats.totalCommunications > 0 ? Math.round(stats.responseRate) : 0
  
  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Response Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                stats.responseRate >= 80 ? 'text-green-600' :
                stats.responseRate >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {stats.responseRate.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Success rate target: 85%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className={`h-2 rounded-full ${
                    stats.responseRate >= 80 ? 'bg-green-600' :
                    stats.responseRate >= 60 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(stats.responseRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Avg Response Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                stats.averageResponseTime <= 4 ? 'text-green-600' :
                stats.averageResponseTime <= 24 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {stats.averageResponseTime.toFixed(1)}h
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Target: Under 4 hours
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className={`h-2 rounded-full ${
                    stats.averageResponseTime <= 4 ? 'bg-green-600' :
                    stats.averageResponseTime <= 24 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${Math.max(0, 100 - (stats.averageResponseTime / 48 * 100))}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Engagement Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                engagementScore >= 80 ? 'text-green-600' :
                engagementScore >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {engagementScore}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Overall communication effectiveness
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className={`h-2 rounded-full ${
                    engagementScore >= 80 ? 'bg-green-600' :
                    engagementScore >= 60 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${engagementScore}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Daily Volume</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(stats.totalCommunications / 30)}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Average communications per day
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{Math.round(stats.emailsSent / 30)}</div>
                  <div className="text-gray-500">Emails</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{Math.round(stats.smsSent / 30)}</div>
                  <div className="text-gray-500">SMS</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{Math.round(stats.callsMade / 30)}</div>
                  <div className="text-gray-500">Calls</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Communication Channel Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Communication Channels</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Email</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{stats.emailsSent}</div>
                  <div className="text-xs text-gray-500">{emailPercentage.toFixed(1)}%</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${emailPercentage}%` }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">SMS</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{stats.smsSent}</div>
                  <div className="text-xs text-gray-500">{smsPercentage.toFixed(1)}%</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${smsPercentage}%` }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Phone className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium">Phone Calls</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{stats.callsMade}</div>
                  <div className="text-xs text-gray-500">{callPercentage.toFixed(1)}%</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${callPercentage}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Communication Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.communicationsByStatus?.map((item, index) => {
                const percentage = stats.totalCommunications > 0 ? (item.count / stats.totalCommunications * 100) : 0
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'delivered': return 'bg-green-500'
                    case 'sent': return 'bg-blue-500'
                    case 'pending': return 'bg-yellow-500'
                    case 'failed': return 'bg-red-500'
                    case 'draft': return 'bg-gray-500'
                    default: return 'bg-purple-500'
                  }
                }
                
                return (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(item.status)}`}></div>
                        <span className="text-sm font-medium capitalize">
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.count}</div>
                        <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              }) || (
                <p className="text-gray-500 text-center py-4">No status data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Monthly Communication Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stats.monthlyActivity?.map((data, index) => {
              const totalForMonth = data.emails + data.sms + data.calls
              const maxTotal = Math.max(...stats.monthlyActivity.map(m => m.emails + m.sms + m.calls))
              
              return (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{data.month}</span>
                    <span className="text-sm text-gray-600">{totalForMonth} total</span>
                  </div>
                  
                  {/* Stacked Bar Chart */}
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div className="h-full flex">
                      {data.emails > 0 && (
                        <div 
                          className="bg-blue-600" 
                          style={{ width: `${(data.emails / maxTotal) * 100}%` }}
                          title={`${data.emails} emails`}
                        ></div>
                      )}
                      {data.sms > 0 && (
                        <div 
                          className="bg-green-600" 
                          style={{ width: `${(data.sms / maxTotal) * 100}%` }}
                          title={`${data.sms} SMS`}
                        ></div>
                      )}
                      {data.calls > 0 && (
                        <div 
                          className="bg-orange-600" 
                          style={{ width: `${(data.calls / maxTotal) * 100}%` }}
                          title={`${data.calls} calls`}
                        ></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span>Emails: {data.emails}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span>SMS: {data.sms}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                      <span>Calls: {data.calls}</span>
                    </div>
                  </div>
                </div>
              )
            }) || (
              <p className="text-gray-500 text-center py-4">No monthly data</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Communication Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Performance Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Strong Email Performance
                    </p>
                    <p className="text-xs text-green-700">
                      Email is your most effective channel with {emailPercentage.toFixed(0)}% of communications
                    </p>
                  </div>
                </div>
              </div>
              
              {stats.responseRate >= 80 ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Excellent Response Rate
                      </p>
                      <p className="text-xs text-green-700">
                        Your {stats.responseRate.toFixed(1)}% response rate exceeds industry standards
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">
                        Response Rate Opportunity
                      </p>
                      <p className="text-xs text-yellow-700">
                        Consider improving follow-up processes to boost from {stats.responseRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats.averageResponseTime <= 4 ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Fast Response Times
                      </p>
                      <p className="text-xs text-green-700">
                        {stats.averageResponseTime.toFixed(1)} hour average response time is excellent
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Slow Response Times
                      </p>
                      <p className="text-xs text-red-700">
                        {stats.averageResponseTime.toFixed(1)} hour average - aim for under 4 hours
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.pendingFollowUps > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Address Pending Follow-ups
                      </p>
                      <p className="text-xs text-red-700">
                        {stats.pendingFollowUps} communications need follow-up attention
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats.scheduledCommunications > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Scheduled Communications
                      </p>
                      <p className="text-xs text-blue-700">
                        {stats.scheduledCommunications} communications are scheduled for delivery
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      Optimize Communication Mix
                    </p>
                    <p className="text-xs text-purple-700">
                      Consider balancing channels based on client preferences and urgency
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-indigo-900">
                      Automate Routine Communications
                    </p>
                    <p className="text-xs text-indigo-700">
                      Set up templates and automation for common communication patterns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}