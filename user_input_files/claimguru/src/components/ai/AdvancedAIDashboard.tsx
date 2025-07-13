import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Clock,
  Eye,
  Zap,
  Target,
  Shield,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  Bot,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Calendar,
  Users,
  FileText,
  Building
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useClaims } from '../../hooks/useClaims'

interface AIAnalysis {
  settlements: {
    predicted: number
    confidence: number
    timeline: string
    factors: string[]
  }
  risks: {
    highRisk: number
    mediumRisk: number
    lowRisk: number
    alerts: Array<{
      claimId: string
      risk: string
      severity: 'high' | 'medium' | 'low'
      recommendation: string
    }>
  }
  opportunities: {
    revenue: number
    efficiency: number
    suggestions: Array<{
      type: string
      impact: string
      action: string
    }>
  }
  performance: {
    speed: number
    accuracy: number
    satisfaction: number
    trend: 'up' | 'down' | 'stable'
  }
}

interface PredictiveMetric {
  label: string
  current: number
  predicted: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  timeframe: string
}

export function AdvancedAIDashboard() {
  const { userProfile } = useAuth()
  const { claims } = useClaims()
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [predictions, setPredictions] = useState<PredictiveMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    if (userProfile?.organization_id && claims.length > 0) {
      generateAIAnalysis()
    }
  }, [userProfile?.organization_id, claims, selectedTimeframe])

  const generateAIAnalysis = async () => {
    setLoading(true)
    
    // Simulate AI analysis with realistic data
    setTimeout(() => {
      const mockAnalysis: AIAnalysis = {
        settlements: {
          predicted: 285000,
          confidence: 0.87,
          timeline: "Next 45 days",
          factors: [
            "Historical settlement patterns",
            "Carrier responsiveness data", 
            "Claim complexity analysis",
            "Market conditions"
          ]
        },
        risks: {
          highRisk: 3,
          mediumRisk: 7,
          lowRisk: 12,
          alerts: [
            {
              claimId: "CG-2025-001",
              risk: "Settlement deadline approaching with incomplete documentation",
              severity: "high",
              recommendation: "Schedule immediate client meeting to gather missing documents"
            },
            {
              claimId: "CG-2025-003", 
              risk: "Carrier showing signs of dispute based on communication patterns",
              severity: "medium",
              recommendation: "Prepare additional supporting evidence and expert opinions"
            },
            {
              claimId: "CG-2025-007",
              risk: "Potential undervaluation detected in initial estimate",
              severity: "medium", 
              recommendation: "Request independent appraisal to substantiate claim value"
            }
          ]
        },
        opportunities: {
          revenue: 45000,
          efficiency: 25,
          suggestions: [
            {
              type: "Process Optimization",
              impact: "$15,000 monthly savings",
              action: "Automate document collection for similar claim types"
            },
            {
              type: "Settlement Enhancement", 
              impact: "$30,000 additional revenue",
              action: "Leverage AI-detected damage patterns in negotiations"
            },
            {
              type: "Client Acquisition",
              impact: "12 new clients predicted",
              action: "Target marketing in areas with recent weather events"
            }
          ]
        },
        performance: {
          speed: 92,
          accuracy: 96,
          satisfaction: 94,
          trend: 'up'
        }
      }

      const mockPredictions: PredictiveMetric[] = [
        {
          label: "Settlement Amount",
          current: 125000,
          predicted: 158000,
          confidence: 0.91,
          trend: 'up',
          timeframe: selectedTimeframe
        },
        {
          label: "Claims Processed",
          current: 18,
          predicted: 24,
          confidence: 0.84,
          trend: 'up', 
          timeframe: selectedTimeframe
        },
        {
          label: "Client Satisfaction",
          current: 94,
          predicted: 97,
          confidence: 0.88,
          trend: 'up',
          timeframe: selectedTimeframe
        },
        {
          label: "Revenue Per Claim",
          current: 6800,
          predicted: 7250,
          confidence: 0.79,
          trend: 'up',
          timeframe: selectedTimeframe
        }
      ]

      setAnalysis(mockAnalysis)
      setPredictions(mockPredictions)
      setLoading(false)
    }, 2000)
  }

  const handleRefreshAnalysis = async () => {
    setRefreshing(true)
    await generateAIAnalysis()
    setRefreshing(false)
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-green-500 bg-green-50'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              AI Analysis in Progress
            </h3>
            <p className="text-gray-600">
              Our AI is analyzing your claims data, settlement patterns, and market conditions...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Analytics</h2>
            <p className="text-gray-600">Predictive insights and intelligent recommendations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimeframe(period)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedTimeframe === period 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          
          <Button
            onClick={handleRefreshAnalysis}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            {refreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Predictive Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {predictions.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(metric.confidence * 100)}% confidence
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-500">Current</div>
                  <div className="text-lg font-semibold">
                    {metric.label.includes('Amount') || metric.label.includes('Revenue') 
                      ? `$${metric.current.toLocaleString()}`
                      : metric.label.includes('Satisfaction')
                      ? `${metric.current}%`
                      : metric.current.toLocaleString()
                    }
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">Predicted</div>
                  <div className="text-xl font-bold text-purple-600">
                    {metric.label.includes('Amount') || metric.label.includes('Revenue')
                      ? `$${metric.predicted.toLocaleString()}`
                      : metric.label.includes('Satisfaction')
                      ? `${metric.predicted}%`
                      : metric.predicted.toLocaleString()
                    }
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Change</span>
                  <span className={`font-medium ${
                    metric.predicted > metric.current ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.predicted > metric.current ? '+' : ''}
                    {((metric.predicted - metric.current) / metric.current * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settlement Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Settlement Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Predicted Total Settlements</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {Math.round(analysis.settlements.confidence * 100)}% confidence
                </span>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                ${analysis.settlements.predicted.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Expected within {analysis.settlements.timeline}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Factors</h4>
              <div className="space-y-2">
                {analysis.settlements.factors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{analysis.risks.highRisk}</div>
                <div className="text-xs text-gray-600">High Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{analysis.risks.mediumRisk}</div>
                <div className="text-xs text-gray-600">Medium Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.risks.lowRisk}</div>
                <div className="text-xs text-gray-600">Low Risk</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Critical Alerts</h4>
              <div className="space-y-3">
                {analysis.risks.alerts.slice(0, 2).map((alert, index) => (
                  <div key={index} className={`border-l-4 p-3 rounded-r-lg ${getSeverityColor(alert.severity)}`}>
                    <div className="font-medium text-sm text-gray-900 mb-1">
                      Claim {alert.claimId}
                    </div>
                    <div className="text-xs text-gray-700 mb-2">{alert.risk}</div>
                    <div className="text-xs text-blue-700 font-medium">{alert.recommendation}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Potential Additional Revenue</div>
              <div className="text-3xl font-bold text-purple-600">${analysis.opportunities.revenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Next {selectedTimeframe}</div>
            </div>
            
            <div className="space-y-3">
              {analysis.opportunities.suggestions.map((suggestion, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{suggestion.type}</div>
                      <div className="text-xs text-gray-600 mt-1">{suggestion.action}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">{suggestion.impact}</div>
                      <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Processing Speed</span>
                  <span className="text-sm font-bold text-blue-600">{analysis.performance.speed}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${analysis.performance.speed}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Accuracy Rate</span>
                  <span className="text-sm font-bold text-green-600">{analysis.performance.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${analysis.performance.accuracy}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Client Satisfaction</span>
                  <span className="text-sm font-bold text-purple-600">{analysis.performance.satisfaction}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${analysis.performance.satisfaction}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {getTrendIcon(analysis.performance.trend)}
                <span className="text-sm text-gray-600">
                  Performance trending {analysis.performance.trend} this month
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Immediate Action</span>
              </div>
              <p className="text-sm text-blue-800 mb-3">
                Review 3 high-risk claims requiring immediate attention to prevent settlement delays.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                View Claims
              </Button>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Optimization</span>
              </div>
              <p className="text-sm text-green-800 mb-3">
                Implement automated document collection to reduce processing time by 35%.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Learn More
              </Button>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Growth</span>
              </div>
              <p className="text-sm text-purple-800 mb-3">
                Focus marketing efforts on wind damage claims - 40% higher conversion rate.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                View Strategy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
