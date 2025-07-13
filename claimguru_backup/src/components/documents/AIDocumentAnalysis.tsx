import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { 
  X, 
  Brain, 
  Search, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  FileText,
  Image,
  BarChart3,
  Zap,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react'

interface AIDocumentAnalysisProps {
  document: any
  isOpen: boolean
  onClose: () => void
}

export function AIDocumentAnalysis({ document, isOpen, onClose }: AIDocumentAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'recommendations'>('overview')

  useEffect(() => {
    if (isOpen && document) {
      performAIAnalysis()
    }
  }, [isOpen, document])

  const performAIAnalysis = async () => {
    setLoading(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        confidence: 0.94,
        category: 'Property Damage Assessment',
        damageTypes: [
          { type: 'Fire Damage', confidence: 0.96, severity: 'High', estimatedCost: 15000 },
          { type: 'Water Damage', confidence: 0.88, severity: 'Medium', estimatedCost: 8000 },
          { type: 'Smoke Damage', confidence: 0.92, severity: 'Medium', estimatedCost: 5000 }
        ],
        keyFindings: [
          'Structural damage to kitchen area requires immediate attention',
          'Water damage extends to adjacent rooms',
          'Personal property damage includes furniture and electronics',
          'Potential mold risk identified in affected areas'
        ],
        estimatedTotalValue: 28000,
        complianceStatus: 'Compliant',
        recommendations: [
          {
            priority: 'High',
            action: 'Schedule structural engineer inspection',
            reasoning: 'Potential load-bearing damage detected',
            timeline: 'Within 48 hours'
          },
          {
            priority: 'Medium',
            action: 'Document personal property inventory',
            reasoning: 'Ensure complete coverage of damaged items',
            timeline: 'Within 1 week'
          },
          {
            priority: 'Low',
            action: 'Review policy coverage limits',
            reasoning: 'Estimated damage approaches policy limits',
            timeline: 'Before settlement'
          }
        ],
        riskFactors: [
          'Potential undervaluation of claim',
          'Delayed remediation may increase costs',
          'Missing documentation for high-value items'
        ],
        qualityScore: 85,
        extractedText: [
          'Kitchen fire originated from electrical outlet',
          'Initial damage assessment: $25,000',
          'Homeowner: John & Jane Smith',
          'Policy Number: ABC123456789'
        ]
      }
      
      setAnalysis(mockAnalysis)
      setLoading(false)
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Document Analysis</h2>
              <p className="text-sm text-gray-600">{document.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Document</h3>
              <p className="text-gray-600 text-center max-w-md">
                Our AI is analyzing your document for damage assessment, compliance, and recommendations...
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'details', label: 'Detailed Analysis', icon: Search },
                  { id: 'recommendations', label: 'Recommendations', icon: Target }
                ].map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white text-purple-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Confidence & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-900">AI Confidence</span>
                      </div>
                      <div className="text-3xl font-bold text-purple-900">
                        {Math.round(analysis.confidence * 100)}%
                      </div>
                      <div className="text-sm text-purple-700">Analysis accuracy</div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Category</span>
                      </div>
                      <div className="text-lg font-semibold text-blue-900">
                        {analysis.category}
                      </div>
                      <div className="text-sm text-blue-700">Document type</div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">Est. Value</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        ${analysis.estimatedTotalValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700">Total damage cost</div>
                    </div>
                  </div>

                  {/* Damage Types */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Detected Damage Types
                    </h3>
                    <div className="space-y-3">
                      {analysis.damageTypes.map((damage: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`h-3 w-3 rounded-full ${
                                damage.severity === 'High' ? 'bg-red-500' :
                                damage.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}></div>
                              <span className="font-medium text-gray-900">{damage.type}</span>
                              <span className="text-sm text-gray-600">
                                {Math.round(damage.confidence * 100)}% confidence
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                ${damage.estimatedCost.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">{damage.severity} severity</div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                damage.severity === 'High' ? 'bg-red-500' :
                                damage.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${damage.confidence * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Findings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Key Findings
                    </h3>
                    <div className="space-y-2">
                      {analysis.keyFindings.map((finding: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-900">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Quality Score */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Document Quality Score</h3>
                      <div className="text-3xl font-bold text-purple-600">{analysis.qualityScore}/100</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full"
                        style={{ width: `${analysis.qualityScore}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Based on image clarity, text readability, and completeness
                    </p>
                  </div>

                  {/* Extracted Text */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Key Extracted Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {analysis.extractedText.map((text: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                            <span className="text-gray-700">{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Risk Factors
                    </h3>
                    <div className="space-y-3">
                      {analysis.riskFactors.map((risk: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-yellow-900">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance Status */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="h-6 w-6 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-900">Compliance Status</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">{analysis.complianceStatus}</span>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Document meets all regulatory and industry standards
                    </p>
                  </div>
                </div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-6 w-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-900">AI-Powered Recommendations</h3>
                    </div>
                    <p className="text-blue-700">
                      Based on our analysis, here are prioritized actions to maximize your claim value
                    </p>
                  </div>

                  <div className="space-y-4">
                    {analysis.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              rec.priority === 'High' 
                                ? 'bg-red-100 text-red-800' 
                                : rec.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {rec.priority} Priority
                            </div>
                            <div className="text-sm text-gray-600">{rec.timeline}</div>
                          </div>
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2">{rec.action}</h4>
                        <p className="text-gray-600 mb-4">{rec.reasoning}</p>
                        
                        <Button size="sm" variant="outline" className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Create Task
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Generate Report
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Update Estimate
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Create Tasks
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}