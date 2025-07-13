import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { 
  DollarSign, 
  TrendingUp, 
  Target,
  Calendar,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Zap,
  Eye,
  FileText,
  Building,
  Shield,
  Users
} from 'lucide-react'
import type { Claim } from '../../lib/supabase'

interface SettlementPrediction {
  claimId: string
  claimNumber: string
  predictedAmount: number
  confidence: number
  timeToSettlement: number
  riskFactors: string[]
  opportunities: string[]
  comparablesCases: Array<{
    caseId: string
    similarity: number
    actualSettlement: number
    timeframe: number
  }>
  negotiationStrategy: {
    initialOffer: number
    targetAmount: number
    fallbackAmount: number
    keyArguments: string[]
  }
}

interface AISettlementPredictorProps {
  claims: Claim[]
}

export function AISettlementPredictor({ claims }: AISettlementPredictorProps) {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [prediction, setPrediction] = useState<SettlementPrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState<SettlementPrediction[]>([])

  const generatePrediction = async (claim: Claim) => {
    setLoading(true)
    setSelectedClaim(claim)

    // Simulate AI prediction analysis
    setTimeout(() => {
      const estimatedValue = claim.estimated_loss_value || 0
      const basePrediction = estimatedValue * (0.75 + Math.random() * 0.4) // 75-115% of estimated value
      
      const mockPrediction: SettlementPrediction = {
        claimId: claim.id,
        claimNumber: claim.file_number || 'Unknown',
        predictedAmount: Math.round(basePrediction),
        confidence: 0.82 + Math.random() * 0.15, // 82-97% confidence
        timeToSettlement: Math.floor(Math.random() * 90) + 30, // 30-120 days
        riskFactors: [
          'Carrier has disputed similar claims in the past 6 months',
          'Policy limit may cap maximum settlement',
          'Missing supporting documentation could weaken position',
          'Recent weather patterns may affect claim frequency'
        ],
        opportunities: [
          'Carrier showing 95% settlement rate for similar claims',
          'Expert witness testimony could increase value by 15-20%',
          'Precedent cases in jurisdiction favor higher settlements',
          'Additional living expenses could add $8,000-12,000'
        ],
        comparablesCases: [
          {
            caseId: 'CG-2024-187',
            similarity: 0.94,
            actualSettlement: Math.round(basePrediction * 1.1),
            timeframe: 67
          },
          {
            caseId: 'CG-2024-203',
            similarity: 0.89,
            actualSettlement: Math.round(basePrediction * 0.95),
            timeframe: 45
          },
          {
            caseId: 'CG-2024-156',
            similarity: 0.87,
            actualSettlement: Math.round(basePrediction * 1.05),
            timeframe: 82
          }
        ],
        negotiationStrategy: {
          initialOffer: Math.round(basePrediction * 0.6),
          targetAmount: Math.round(basePrediction),
          fallbackAmount: Math.round(basePrediction * 0.85),
          keyArguments: [
            'Comprehensive documentation supports full replacement cost',
            'Expert assessment confirms extent of damage',
            'Policy language clearly covers this type of loss',
            'Comparable settlements in similar cases'
          ]
        }
      }

      setPrediction(mockPrediction)
      setAnalysisHistory(prev => [mockPrediction, ...prev.slice(0, 4)]) // Keep last 5 analyses
      setLoading(false)
    }, 3000)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100'
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-100'
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
          <Target className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">AI Settlement Predictor</h3>
          <p className="text-gray-600">Advanced ML predictions for claim settlements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claim Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Select Claim to Analyze
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claims.slice(0, 10).map((claim) => (
                <div
                  key={claim.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedClaim?.id === claim.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => generatePrediction(claim)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{claim.file_number}</div>
                      <div className="text-xs text-gray-600">{claim.cause_of_loss}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatCurrency(claim.estimated_loss_value || 0)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        claim.claim_status === 'new' ? 'bg-blue-100 text-blue-800' :
                        claim.claim_status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        claim.claim_status === 'settled' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {claim.claim_status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prediction Results */}
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900 mb-2">AI Analysis in Progress</h4>
                    <p className="text-gray-600 text-sm">
                      Analyzing comparable cases, market data, and risk factors...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {prediction && !loading && (
            <>
              {/* Prediction Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Settlement Prediction - Claim {prediction.claimNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {formatCurrency(prediction.predictedAmount)}
                      </div>
                      <div className="text-sm text-gray-600">Predicted Settlement</div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                        getConfidenceColor(prediction.confidence)
                      }`}>
                        {Math.round(prediction.confidence * 100)}% Confidence
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {prediction.timeToSettlement}
                      </div>
                      <div className="text-sm text-gray-600">Days to Settlement</div>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Est. {new Date(Date.now() + prediction.timeToSettlement * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {prediction.comparablesCases.length}
                      </div>
                      <div className="text-sm text-gray-600">Comparable Cases</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Avg similarity: {Math.round(prediction.comparablesCases.reduce((sum, c) => sum + c.similarity, 0) / prediction.comparablesCases.length * 100)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Negotiation Strategy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Negotiation Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-red-700 mb-1">Initial Offer Expected</div>
                      <div className="text-xl font-bold text-red-800">
                        {formatCurrency(prediction.negotiationStrategy.initialOffer)}
                      </div>
                      <div className="text-xs text-red-600 mt-1">Conservative starting point</div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-green-700 mb-1">Target Amount</div>
                      <div className="text-xl font-bold text-green-800">
                        {formatCurrency(prediction.negotiationStrategy.targetAmount)}
                      </div>
                      <div className="text-xs text-green-600 mt-1">Optimal settlement goal</div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-yellow-700 mb-1">Fallback Position</div>
                      <div className="text-xl font-bold text-yellow-800">
                        {formatCurrency(prediction.negotiationStrategy.fallbackAmount)}
                      </div>
                      <div className="text-xs text-yellow-600 mt-1">Minimum acceptable</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Key Arguments</h4>
                    <div className="space-y-2">
                      {prediction.negotiationStrategy.keyArguments.map((argument, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{argument}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Factors & Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {prediction.riskFactors.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-800">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {prediction.opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-green-800">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparable Cases */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Comparable Cases Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prediction.comparablesCases.map((comparable, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium text-gray-900">
                            Case {comparable.caseId}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {Math.round(comparable.similarity * 100)}% match
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(comparable.actualSettlement)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Settled in {comparable.timeframe} days
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* No Prediction State */}
          {!prediction && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">Select a Claim for AI Analysis</h4>
                <p className="text-gray-600 text-sm">
                  Choose a claim from the list to generate AI-powered settlement predictions and negotiation strategies.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Recent Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisHistory.map((analysis, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Claim {analysis.claimNumber}</div>
                    <div className="text-xs text-gray-600">
                      {Math.round(analysis.confidence * 100)}% confidence
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(analysis.predictedAmount)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {analysis.timeToSettlement} days
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
