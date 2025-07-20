import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Brain,
  Shield,
  Calendar,
  DollarSign,
  FileX,
  Scale,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { enhancedClaimWizardAI, CoverageIssueAnalysis } from '../../../services/enhancedClaimWizardAI'

interface CoverageIssueReviewStepProps {
  data: any
  onUpdate: (data: any) => void
  onComplete?: () => void
}

export const CoverageIssueReviewStep: React.FC<CoverageIssueReviewStepProps> = ({
  data,
  onUpdate,
  onComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<CoverageIssueAnalysis | null>(null)
  const [expandedIssues, setExpandedIssues] = useState<{ [key: string]: boolean }>({})
  const [hasRunAnalysis, setHasRunAnalysis] = useState(false)

  const runCoverageAnalysis = async () => {
    setIsAnalyzing(true)
    
    try {
      const result = await enhancedClaimWizardAI.analyzeCoverageIssues(data)
      setAnalysisResult(result)
      setHasRunAnalysis(true)
      
      // Update data with analysis results
      onUpdate({
        ...data,
        coverageAnalysis: result
      })
    } catch (error) {
      console.error('Coverage analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleIssueExpansion = (issueIndex: string) => {
    setExpandedIssues(prev => ({
      ...prev,
      [issueIndex]: !prev[issueIndex]
    }))
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'notice':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'notice':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch ((category || '').toLowerCase()) {
      case 'policy period':
        return <Calendar className="h-4 w-4" />
      case 'coverage limits':
        return <DollarSign className="h-4 w-4" />
      case 'proof of loss':
        return <FileX className="h-4 w-4" />
      case 'deductible':
        return <Shield className="h-4 w-4" />
      case 'coverage exclusions':
        return <AlertTriangle className="h-4 w-4" />
      case 'appraisal rights':
        return <Scale className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span>AI Coverage Issue Analysis</span>
          </CardTitle>
          <p className="text-gray-600">
            Comprehensive review of potential coverage issues and policy concerns
          </p>
        </CardHeader>
        <CardContent>
          {!hasRunAnalysis ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready for Coverage Analysis
              </h3>
              <p className="text-gray-600 mb-4">
                AI will analyze your claim data for potential coverage issues, policy violations, and risk factors.
              </p>
              <Button 
                onClick={runCoverageAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-2"
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Analyzing Coverage...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Run Coverage Analysis
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Analysis Complete</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={runCoverageAnalysis}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? <LoadingSpinner className="mr-2" /> : <Brain className="mr-2 h-4 w-4" />}
                  Re-analyze
                </Button>
              </div>
              
              {analysisResult && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{analysisResult.summary}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <>
          {/* Overall Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Overall Risk Assessment</span>
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(analysisResult.overallRisk)}`}>
                  {analysisResult.overallRisk.toUpperCase()} RISK
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {analysisResult.issues.filter(i => i.severity === 'critical').length}
                  </div>
                  <div className="text-sm text-gray-600">Critical Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analysisResult.issues.filter(i => i.severity === 'warning').length}
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysisResult.issues.filter(i => i.severity === 'notice').length}
                  </div>
                  <div className="text-sm text-gray-600">Notices</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issue Details */}
          {analysisResult.issues.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Detailed Issue Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.issues.map((issue, index) => (
                    <div 
                      key={index}
                      className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                    >
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleIssueExpansion(index.toString())}
                      >
                        <div className="flex items-center space-x-3">
                          {getSeverityIcon(issue.severity)}
                          <div>
                            <h4 className="font-medium text-gray-900">{issue.issue}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              {getCategoryIcon(issue.category)}
                              <span>{issue.category}</span>
                            </div>
                          </div>
                        </div>
                        {expandedIssues[index.toString()] ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      
                      {expandedIssues[index.toString()] && (
                        <div className="mt-4 space-y-3 border-t pt-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Description</h5>
                            <p className="text-gray-700">{issue.description}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Recommendation</h5>
                            <p className="text-gray-700">{issue.recommendation}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Potential Impact</h5>
                            <p className="text-gray-700">{issue.impact}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Coverage Issues Found
                </h3>
                <p className="text-gray-600">
                  AI analysis found no significant coverage issues or concerns with this claim.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Required Section */}
          {analysisResult.actionRequired && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Action Required</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 mb-4">
                  This claim requires immediate attention due to critical issues or warnings identified by the AI analysis.
                </p>
                <div className="space-y-2">
                  <h5 className="font-medium text-orange-800">Next Steps:</h5>
                  <ul className="list-disc list-inside text-orange-700 space-y-1">
                    <li>Review all critical and warning issues above</li>
                    <li>Verify policy documents and claim information</li>
                    <li>Consult with senior adjuster or legal counsel if needed</li>
                    <li>Document all findings and decisions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion */}
          <div className="flex justify-between">
            <Button variant="outline">
              Export Analysis Report
            </Button>
            <Button onClick={onComplete}>
              Complete Review & Proceed
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
