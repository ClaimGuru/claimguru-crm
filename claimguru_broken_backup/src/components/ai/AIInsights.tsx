import React, { useState } from 'react'
import { Brain, TrendingUp, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'
import { useToastContext } from '../../contexts/ToastContext'

interface AIInsight {
  id: string
  type: 'recommendation' | 'prediction' | 'warning' | 'opportunity'
  title: string
  description: string
  confidence: number
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
}

interface AIInsightsProps {
  claimId?: string
}

const AIInsights: React.FC<AIInsightsProps> = ({ claimId }) => {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(false)
  const toast = useToastContext()

  const generateInsights = async () => {
    setLoading(true)
    
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'recommendation',
        title: 'Expedite Roof Inspection',
        description: 'Schedule roof inspection within 48 hours to prevent secondary damage.',
        confidence: 0.87,
        priority: 'high',
        actionable: true
      },
      {
        id: '2',
        type: 'prediction',
        title: 'Settlement Value Estimate',
        description: 'Predicted settlement range: $25,000 - $32,000 based on similar claims.',
        confidence: 0.92,
        priority: 'medium',
        actionable: false
      },
      {
        id: '3',
        type: 'warning',
        title: 'Documentation Gap',
        description: 'Missing structural engineer report may delay settlement.',
        confidence: 0.95,
        priority: 'high',
        actionable: true
      }
    ]
    
    setTimeout(() => {
      setInsights(mockInsights)
      setLoading(false)
      toast.success('Insights Generated', 'AI analysis complete')
    }, 2000)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'prediction': return <TrendingUp className="h-5 w-5 text-purple-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'opportunity': return <DollarSign className="h-5 w-5 text-green-600" />
      default: return <Brain className="h-5 w-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
        </div>
        
        <button
          onClick={generateInsights}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate Insights
            </>
          )}
        </button>
      </div>

      {insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {insight.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                      {insight.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{(insight.confidence * 100).toFixed(0)}% confident</span>
                    {insight.actionable && (
                      <span className="text-blue-600 font-medium">Actionable</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
          <p className="text-gray-500 mb-4">
            Generate AI insights to get recommendations and predictions.
          </p>
        </div>
      )}
    </div>
  )
}

export default AIInsights
