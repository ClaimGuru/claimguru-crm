import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  Brain, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Clock,
  Eye,
  Download,
  Upload,
  Zap
} from 'lucide-react'
import { useClaims } from '../hooks/useClaims'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface AIInsight {
  id: string
  title: string
  type: 'prediction' | 'risk' | 'opportunity' | 'compliance'
  confidence: number
  description: string
  recommendation: string
  created_at: string
  claim_id?: string
}

export function AIInsights() {
  const { userProfile } = useAuth()
  const { claims, loading: claimsLoading } = useClaims()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  useEffect(() => {
    loadAIInsights()
  }, [userProfile?.organization_id])

  async function loadAIInsights() {
    if (!userProfile?.organization_id) return

    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading AI insights:', error)
        return
      }

      setInsights(data || [])
    } catch (error) {
      console.error('Error loading AI insights:', error)
    } finally {
      setLoading(false)
    }
  }

  async function analyzeDocument() {
    if (!selectedFile || !userProfile?.organization_id) return

    setAnalyzing(true)
    try {
      // Upload file to Supabase storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('claim-documents')
        .upload(`ai-analysis/${fileName}`, selectedFile)

      if (uploadError) {
        throw uploadError
      }

      // Call AI analysis edge function
      const { data, error } = await supabase.functions.invoke('document-upload-ai-analysis', {
        body: {
          filePath: uploadData.path,
          fileName: selectedFile.name,
          organizationId: userProfile.organization_id
        }
      })

      if (error) {
        throw error
      }

      setAnalysisResult(data)
      
      // Refresh insights
      await loadAIInsights()
      
    } catch (error: any) {
      console.error('Error analyzing document:', error)
      alert('Error analyzing document: ' + error.message)
    } finally {
      setAnalyzing(false)
      setSelectedFile(null)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return TrendingUp
      case 'risk': return AlertTriangle
      case 'opportunity': return DollarSign
      case 'compliance': return CheckCircle
      default: return Brain
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'text-blue-600 bg-blue-100'
      case 'risk': return 'text-red-600 bg-red-100'
      case 'opportunity': return 'text-green-600 bg-green-100'
      case 'compliance': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100'
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading || claimsLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Insights & Analysis</h1>
          <p className="text-gray-600 mt-2">
            Leverage artificial intelligence to optimize your claims management
          </p>
        </div>
      </div>

      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Document Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="text-center">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered Document Analysis
              </h3>
              <p className="text-gray-600 mb-6">
                Upload insurance documents to get instant AI analysis, risk assessment, and recommendations
              </p>
              
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {selectedFile ? selectedFile.name : 'Click to upload document'}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                
                {selectedFile && (
                  <Button 
                    onClick={analyzeDocument}
                    disabled={analyzing}
                    className="mt-4 w-full flex items-center gap-2"
                  >
                    {analyzing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {analysisResult && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Analysis Complete!</h4>
              <p className="text-green-700">
                Document analyzed successfully. Check the insights below for detailed findings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Insights</p>
                <p className="text-3xl font-bold text-gray-900">{insights.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Alerts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {insights.filter(i => i.type === 'risk').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Opportunities</p>
                <p className="text-3xl font-bold text-gray-900">
                  {insights.filter(i => i.type === 'opportunity').length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Confidence</p>
                <p className="text-3xl font-bold text-gray-900">
                  {insights.filter(i => i.confidence >= 90).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Insights</h2>
        
        {insights.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No AI insights yet
              </h3>
              <p className="text-gray-600 mb-6">
                Upload documents or create claims to start generating AI insights and recommendations
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {insights.map((insight) => {
              const InsightIcon = getInsightIcon(insight.type)
              const colorClass = getInsightColor(insight.type)
              const confidenceColor = getConfidenceColor(insight.confidence)
              
              return (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                          <InsightIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {insight.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {insight.description}
                          </p>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 mb-1">
                              Recommendation:
                            </p>
                            <p className="text-blue-700">
                              {insight.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${confidenceColor}`}>
                          {insight.confidence}% confidence
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                          {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(insight.created_at).toLocaleString()}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}