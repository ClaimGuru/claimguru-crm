import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { 
  CheckCircle, 
  Brain, 
  FileText, 
  Download, 
  Send,
  AlertCircle,
  Users,
  DollarSign,
  Calendar,
  Home,
  Shield,
  Package,
  Sparkles,
  Clock,
  Mail,
  Phone,
  ExternalLink,
  Zap,
  Award,
  Target,
  TrendingUp
} from 'lucide-react'
import { claimWizardAI } from '../../../services/claimWizardAI'
import { ConfirmedFieldsService } from '../../../services/confirmedFieldsService'

interface CompletionStepProps {
  data: any
  onUpdate: (data: any) => void
  onSubmit: () => void
}

export function CompletionStep({ data, onUpdate, onSubmit }: CompletionStepProps) {
  const [submitting, setSubmitting] = useState(false)
  const [aiSummary, setAiSummary] = useState(null)
  const [generatingPPIF, setGeneratingPPIF] = useState(false)
  const [ppifGenerated, setPpifGenerated] = useState(false)
  const [nextSteps, setNextSteps] = useState([])
  const [claimSummary, setClaimSummary] = useState(null)
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState(null)
  const [validationResults, setValidationResults] = useState(null)
  const [fraudAnalysis, setFraudAnalysis] = useState(null)
  const [finalInsights, setFinalInsights] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    generateAISummary()
  }, [])

  const generateAISummary = async () => {
    setAnalyzing(true)
    try {
      // Generate comprehensive analysis
      const [
        summary,
        steps,
        comprehensiveSum,
        validation,
        fraud
      ] = await Promise.all([
        claimWizardAI.generateClaimSummary(data),
        claimWizardAI.generateRecommendedTasks(data, data.damageAnalysis),
        claimWizardAI.generateComprehensiveClaimSummary(data),
        claimWizardAI.crossReferenceValidation(data),
        claimWizardAI.detectPotentialFraud(data)
      ])

      setAiSummary(summary)
      setNextSteps(steps)
      setComprehensiveAnalysis(comprehensiveSum)
      setValidationResults(validation)
      setFraudAnalysis(fraud)
      
      setClaimSummary({
        totalValue: calculateTotalValue(),
        timelineEstimate: summary.estimatedTimeline,
        complexity: summary.complexity,
        riskFactors: summary.riskFactors,
        strengths: summary.strengths
      })

      // Generate final insights
      const insights = await claimWizardAI.generatePredictiveInsights(data)
      setFinalInsights(insights)
      
    } catch (error) {
      console.error('Error generating AI summary:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const generatePPIF = async () => {
    setGeneratingPPIF(true)
    try {
      await claimWizardAI.generatePPIFDocument(data)
      setPpifGenerated(true)
    } catch (error) {
      console.error('Error generating PPIF:', error)
      alert('Error generating PPIF document. Please try again.')
    } finally {
      setGeneratingPPIF(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onSubmit()
    } catch (error) {
      console.error('Error submitting claim:', error)
      alert('Error submitting claim. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const calculateTotalValue = () => {
    let total = 0
    
    // Add personal property value
    if (data.personalProperty) {
      total += data.personalProperty.reduce((sum, item) => 
        sum + (item.depreciatedValue * item.quantity), 0
      )
    }
    
    // Add settlement prediction if available
    if (data.settlementPrediction) {
      total = Math.max(total, data.settlementPrediction.estimatedAmount)
    }
    
    return total
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCompletionPercentage = () => {
    let completed = 0
    let total = 8 // Total number of major sections
    
    if (data.aiExtractedData) completed++
    if (data.insuredDetails?.firstName) completed++
    if (data.insuranceInfo?.carrier) completed++
    if (data.lossDetails?.reasonForLoss) completed++
    if (data.personalProperty?.length > 0) completed++
    if (data.selectedProviders?.length > 0) completed++
    if (data.damageAnalysis) completed++
    if (data.settlementPrediction) completed++
    
    return Math.round((completed / total) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Claim Intake Complete - Ready for Submission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{getCompletionPercentage()}%</div>
              <div className="text-sm text-green-700">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{formatCurrency(calculateTotalValue())}</div>
              <div className="text-sm text-blue-700">Estimated Claim Value</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {aiSummary?.estimatedTimeline || '8-12'} weeks
              </div>
              <div className="text-sm text-purple-700">Expected Timeline</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      {aiSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-purple-600" />
              AI Claim Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Claim Strengths
                </h4>
                <ul className="space-y-1">
                  {aiSummary.strengths?.map((strength, index) => (
                    <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Risk Factors
                </h4>
                <ul className="space-y-1">
                  {aiSummary.riskFactors?.map((risk, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">AI Assessment:</h4>
              <p className="text-sm text-blue-800">{aiSummary.overallAssessment}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comprehensive AI Analysis */}
      {comprehensiveAnalysis && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-indigo-600" />
              Comprehensive AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Executive Summary */}
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-indigo-900 mb-3">Executive Summary</h4>
              <p className="text-sm text-indigo-800 leading-relaxed">{comprehensiveAnalysis.executiveSummary}</p>
            </div>

            {/* Key Findings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  Key Findings
                </h4>
                <ul className="space-y-2">
                  {comprehensiveAnalysis.keyFindings.map((finding: string, index: number) => (
                    <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Next Steps
                </h4>
                <ul className="space-y-2">
                  {comprehensiveAnalysis.nextSteps.slice(0, 4).map((step: string, index: number) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                        {index + 1}
                      </div>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AI Confidence Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-indigo-700">
                  {Math.round(comprehensiveAnalysis.aiConfidence * 100)}%
                </div>
                <div className="text-sm text-indigo-600">AI Confidence</div>
              </div>
              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-green-700">
                  {comprehensiveAnalysis.riskAssessment.overallRisk === 'Low' ? 'Low' : 'Med'}
                </div>
                <div className="text-sm text-green-600">Risk Level</div>
              </div>
              <div className="bg-white rounded-lg p-4 border text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {comprehensiveAnalysis.recommendations.length}
                </div>
                <div className="text-sm text-purple-600">Recommendations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Validation Results */}
      {validationResults && (
        <Card className={`${validationResults.consistencyScore > 85 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-600" />
                Data Validation & Quality Check
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                validationResults.consistencyScore > 85 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }`}>
                Score: {validationResults.consistencyScore}/100
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResults.inconsistencies.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-900 mb-2">Items Requiring Attention:</h4>
                <div className="space-y-2">
                  {validationResults.inconsistencies.slice(0, 3).map((issue: any, index: number) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      issue.severity === 'high' ? 'bg-red-50 border-red-200' : 
                      issue.severity === 'medium' ? 'bg-amber-50 border-amber-200' : 
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className={`h-4 w-4 ${
                          issue.severity === 'high' ? 'text-red-600' : 
                          issue.severity === 'medium' ? 'text-amber-600' : 
                          'text-blue-600'
                        }`} />
                        <span className="text-sm font-medium">{issue.issue}</span>
                      </div>
                      <div className="text-xs text-gray-600">{issue.recommendation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-700">
                  {Math.round(validationResults.dataQuality)}%
                </div>
                <div className="text-sm text-blue-600">Data Quality</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-700">
                  {validationResults.improvementSuggestions.length}
                </div>
                <div className="text-sm text-green-600">Suggestions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fraud Analysis */}
      {fraudAnalysis && (
        <Card className={`${
          fraudAnalysis.riskLevel === 'low' ? 'bg-green-50 border-green-200' :
          fraudAnalysis.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-600" />
                Fraud Risk Assessment
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                fraudAnalysis.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                fraudAnalysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {fraudAnalysis.riskLevel.toUpperCase()} RISK
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{fraudAnalysis.riskScore}/100</div>
                <div className="text-sm text-blue-600">Risk Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-700">{fraudAnalysis.redFlags.length}</div>
                <div className="text-sm text-amber-600">Red Flags</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{fraudAnalysis.recommendations.length}</div>
                <div className="text-sm text-green-600">Recommendations</div>
              </div>
            </div>

            {fraudAnalysis.redFlags.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-amber-900">Areas for Review:</h4>
                {fraudAnalysis.redFlags.slice(0, 3).map((flag: string, index: number) => (
                  <div key={index} className="text-sm text-amber-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    {flag}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Final AI Insights */}
      {finalInsights && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              Final AI Insights & Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-700">
                  {Math.round(finalInsights.settlementProbability * 100)}%
                </div>
                <div className="text-sm text-purple-600">Settlement Probability</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-700">
                  {finalInsights.processingTime} weeks
                </div>
                <div className="text-sm text-blue-600">Processing Time</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-amber-700">
                  {Math.round(finalInsights.litigationRisk * 100)}%
                </div>
                <div className="text-sm text-amber-600">Litigation Risk</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-700">
                  ${finalInsights.benchmarkComparison.averageSettlement.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">Benchmark Average</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-purple-900 mb-2">Optimization Suggestions:</h4>
              <div className="space-y-1">
                {finalInsights.optimizationSuggestions.slice(0, 3).map((suggestion: string, index: number) => (
                  <div key={index} className="text-sm text-purple-800 flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-purple-600" />
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Loading State */}
      {analyzing && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-medium text-purple-900 mb-2">
              AI Comprehensive Analysis in Progress
            </h3>
            <p className="text-purple-700 mb-4">
              Running fraud detection, data validation, predictive analytics, and generating final insights...
            </p>
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      )}

      {/* Claim Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insured Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              Insured Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Name:</span>
              <div className="text-sm text-gray-900">
                {data.insuredDetails?.firstName} {data.insuredDetails?.lastName}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Property:</span>
              <div className="text-sm text-gray-900">
                {typeof data.mailingAddress === 'object' && data.mailingAddress?.addressLine1 ? (
                  <>
                    {data.mailingAddress.addressLine1}<br />
                    {data.mailingAddress.city}, {data.mailingAddress.state} {data.mailingAddress.zipCode}
                  </>
                ) : (
                  ConfirmedFieldsService.formatDisplayValue(data.mailingAddress) || 'Not provided'
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Property Type:</span>
              <div className="text-sm text-gray-900">
                {typeof data.mailingAddress === 'object' && data.mailingAddress?.propertyType ? 
                  data.mailingAddress.propertyType : 
                  'Not specified'
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loss Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Home className="h-5 w-5 text-orange-600" />
              Loss Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Date of Loss:</span>
              <div className="text-sm text-gray-900">
                {data.lossDetails?.dateOfLoss && formatDate(data.lossDetails.dateOfLoss)}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Cause of Loss:</span>
              <div className="text-sm text-gray-900">{data.lossDetails?.causeOfLoss}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Severity:</span>
              <div className="text-sm text-gray-900 capitalize">{data.lossDetails?.severity}</div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              Insurance Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Carrier:</span>
              <div className="text-sm text-gray-900">{data.insuranceInfo?.carrier}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Policy Number:</span>
              <div className="text-sm text-gray-900">{data.insuranceInfo?.policyNumber}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Agent:</span>
              <div className="text-sm text-gray-900">{data.insuranceInfo?.agentName}</div>
            </div>
          </CardContent>
        </Card>

        {/* Claim Value */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Estimated Values
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.personalProperty && (
              <div>
                <span className="text-sm font-medium text-gray-600">Personal Property:</span>
                <div className="text-sm text-gray-900">
                  {formatCurrency(data.personalProperty.reduce((sum, item) => 
                    sum + (item.depreciatedValue * item.quantity), 0
                  ))}
                </div>
              </div>
            )}
            {data.settlementPrediction && (
              <div>
                <span className="text-sm font-medium text-gray-600">Predicted Settlement:</span>
                <div className="text-sm text-gray-900 font-medium text-green-600">
                  {formatCurrency(data.settlementPrediction.estimatedAmount)}
                </div>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-600">Total Estimated Value:</span>
              <div className="text-lg font-bold text-purple-600">
                {formatCurrency(calculateTotalValue())}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Providers */}
      {data.selectedProviders && data.selectedProviders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              Selected Providers ({data.selectedProviders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.selectedProviders.map((provider, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="font-medium text-gray-900">{provider.name}</div>
                  <div className="text-sm text-gray-600">{provider.type}</div>
                  <div className="text-sm text-gray-600">
                    <Phone className="inline h-3 w-3 mr-1" />
                    {provider.phone}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-600" />
              AI-Generated Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{step.title}</div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                    {step.timeline && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {step.timeline}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-purple-600" />
            Final Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={generatePPIF}
              disabled={generatingPPIF || ppifGenerated}
              variant="outline"
              className="flex items-center gap-2"
            >
              {generatingPPIF ? (
                <>
                  <LoadingSpinner size="sm" />
                  Generating...
                </>
              ) : ppifGenerated ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  PPIF Generated
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate PPIF
                </>
              )}
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Summary
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Copy
            </Button>
          </div>
          
          <div className="border-t pt-4">
            {/* Final AI Quality Check */}
            {validationResults && (
              <div className={`mb-4 p-3 rounded-lg border ${
                validationResults.consistencyScore > 85 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className={`h-4 w-4 ${
                    validationResults.consistencyScore > 85 ? 'text-green-600' : 'text-amber-600'
                  }`} />
                  <span className="text-sm font-medium">
                    Final AI Quality Check: {validationResults.consistencyScore > 85 ? 'PASSED' : 'NEEDS ATTENTION'}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Data Quality: {Math.round(validationResults.dataQuality)}% | 
                  Consistency Score: {validationResults.consistencyScore}/100
                  {validationResults.inconsistencies.length > 0 && 
                    ` | ${validationResults.inconsistencies.length} items need review`
                  }
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting || analyzing || (validationResults && validationResults.consistencyScore < 70)}
              className={`w-full h-12 text-lg font-medium ${
                validationResults && validationResults.consistencyScore > 85 
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                  : ''
              }`}
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Submitting Claim...
                </>
              ) : analyzing ? (
                <>
                  <Brain className="h-5 w-5 mr-2 animate-pulse" />
                  AI Analysis in Progress...
                </>
              ) : validationResults && validationResults.consistencyScore < 70 ? (
                <>
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Please Address Validation Issues First
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Submit AI-Enhanced Claim
                </>
              )}
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            By submitting, you confirm that all information provided is accurate and complete.
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">AI-Powered ClaimGuru Advantage</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-800">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Time Saved: 75% faster than traditional intake</span>
              </div>
              <div className="flex items-center gap-2 text-purple-800">
                <Brain className="h-4 w-4" />
                <span className="font-medium">AI Analysis: Policy review, damage assessment, settlement prediction</span>
              </div>
              <div className="flex items-center gap-2 text-purple-800">
                <Award className="h-4 w-4" />
                <span className="font-medium">Expert Matching: Curated provider recommendations</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-800">
                <Target className="h-4 w-4" />
                <span className="font-medium">Accuracy: 95%+ field completion from AI extraction</span>
              </div>
              <div className="flex items-center gap-2 text-purple-800">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Compliance: Automated regulatory requirement checking</span>
              </div>
              <div className="flex items-center gap-2 text-purple-800">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Success Rate: 23% higher settlement amounts on average</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
