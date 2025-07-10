import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  Brain, 
  FileSearch, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Download,
  Tag,
  FileText,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Hash,
  Zap,
  TrendingUp,
  Shield
} from 'lucide-react'

interface AIAnalysisResult {
  id: string
  confidence_score: number
  extracted_entities: {
    people: string[]
    organizations: string[]
    locations: string[]
    dates: string[]
    amounts: string[]
    policy_numbers: string[]
    claim_numbers: string[]
  }
  document_type: string
  compliance_status: 'compliant' | 'non_compliant' | 'needs_review'
  key_insights: string[]
  risk_factors: string[]
  recommendations: string[]
  extracted_text: string
  summary: string
}

interface AIDocumentAnalysisProps {
  analysis: AIAnalysisResult | null
  isLoading: boolean
  onReanalyze: () => void
  onExportAnalysis: () => void
}

export function AIDocumentAnalysis({ 
  analysis, 
  isLoading, 
  onReanalyze, 
  onExportAnalysis 
}: AIDocumentAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">AI is analyzing the document...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Document Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">No AI analysis available for this document</p>
            <Button onClick={onReanalyze} className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Start AI Analysis</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800'
      case 'non_compliant': return 'bg-red-100 text-red-800'
      case 'needs_review': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4" />
      case 'non_compliant': return <AlertTriangle className="h-4 w-4" />
      case 'needs_review': return <Eye className="h-4 w-4" />
      default: return <FileSearch className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Document Analysis</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={onReanalyze}>
                <Zap className="h-4 w-4 mr-1" />
                Re-analyze
              </Button>
              <Button size="sm" variant="outline" onClick={onExportAnalysis}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Confidence Score */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${getConfidenceColor(analysis.confidence_score)}`}>
                {(analysis.confidence_score * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-gray-600">Confidence Score</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    analysis.confidence_score >= 0.8 ? 'bg-green-600' :
                    analysis.confidence_score >= 0.6 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${analysis.confidence_score * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Document Type */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                <FileText className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {analysis.document_type.replace('_', ' ')}
              </p>
              <p className="text-xs text-gray-500">Document Type</p>
            </div>

            {/* Compliance Status */}
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getComplianceColor(analysis.compliance_status)}`}>
                {getComplianceIcon(analysis.compliance_status)}
                <span className="ml-2 capitalize">
                  {analysis.compliance_status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Compliance Status</p>
            </div>

            {/* Entities Found */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(analysis.extracted_entities).flat().length}
              </div>
              <p className="text-sm text-gray-600">Entities Extracted</p>
              <p className="text-xs text-gray-500">People, dates, amounts, etc.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'entities', label: 'Extracted Entities', icon: Tag },
            { id: 'insights', label: 'Key Insights', icon: TrendingUp },
            { id: 'compliance', label: 'Compliance', icon: Shield },
            { id: 'full_text', label: 'Extracted Text', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Document Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {analysis.summary || 'No summary available.'}
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">People mentioned:</span>
                  <span className="font-medium">{analysis.extracted_entities.people.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Organizations:</span>
                  <span className="font-medium">{analysis.extracted_entities.organizations.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dates found:</span>
                  <span className="font-medium">{analysis.extracted_entities.dates.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amounts:</span>
                  <span className="font-medium">{analysis.extracted_entities.amounts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Policy numbers:</span>
                  <span className="font-medium">{analysis.extracted_entities.policy_numbers.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'entities' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* People */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>People ({analysis.extracted_entities.people.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.extracted_entities.people.length > 0 ? (
                  analysis.extracted_entities.people.map((person, index) => (
                    <div key={index} className="px-3 py-2 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-900">{person}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No people mentioned</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Dates ({analysis.extracted_entities.dates.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.extracted_entities.dates.length > 0 ? (
                  analysis.extracted_entities.dates.map((date, index) => (
                    <div key={index} className="px-3 py-2 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-900">{date}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No dates found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Amounts ({analysis.extracted_entities.amounts.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.extracted_entities.amounts.length > 0 ? (
                  analysis.extracted_entities.amounts.map((amount, index) => (
                    <div key={index} className="px-3 py-2 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-yellow-900">{amount}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No amounts found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Policy Numbers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5" />
                <span>Policy Numbers ({analysis.extracted_entities.policy_numbers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.extracted_entities.policy_numbers.length > 0 ? (
                  analysis.extracted_entities.policy_numbers.map((policy, index) => (
                    <div key={index} className="px-3 py-2 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-900">{policy}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No policy numbers found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Key Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.key_insights.length > 0 ? (
                  analysis.key_insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-sm text-blue-900">{insight}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No key insights available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.recommendations.length > 0 ? (
                  analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="p-1 bg-green-100 rounded-full mt-0.5">
                        <Zap className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-sm text-green-900">{recommendation}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recommendations available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'compliance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Compliance Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Compliance Status */}
              <div className="text-center p-6 border rounded-lg">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${getComplianceColor(analysis.compliance_status)}`}>
                  {getComplianceIcon(analysis.compliance_status)}
                  <span className="ml-2 capitalize">
                    {analysis.compliance_status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">
                  Document compliance has been {analysis.compliance_status === 'compliant' ? 'verified' : 'flagged for review'}
                </p>
              </div>

              {/* Risk Factors */}
              {analysis.risk_factors.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Risk Factors</h4>
                  <div className="space-y-3">
                    {analysis.risk_factors.map((risk, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-900">{risk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'full_text' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Extracted Text</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {analysis.extracted_text || 'No text could be extracted from this document.'}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}