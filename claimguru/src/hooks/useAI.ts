import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface DocumentAnalysisResult {
  document_type: string
  key_information: {
    policy_number?: string
    claim_amount?: string
    date_of_loss?: string
    cause_of_loss?: string
    insured_name?: string
    property_address?: string
  }
  compliance_check: {
    missing_information: string[]
    completeness_score: string
    recommendations: string[]
  }
  risk_assessment: {
    fraud_indicators: string[]
    risk_level: 'low' | 'medium' | 'high'
    verification_needed: string[]
  }
  next_steps: string[]
  summary: string
}

interface SettlementPredictionResult {
  settlement_prediction: {
    estimated_amount: string
    confidence_level: string
    estimated_timeline: string
    probability_of_settlement: string
  }
  risk_factors: {
    favorable_factors: string[]
    challenging_factors: string[]
    critical_issues: string[]
  }
  recommendations: {
    immediate_actions: string[]
    documentation_needs: string[]
    negotiation_strategy: string[]
    expert_consultations: string[]
  }
  market_insights: {
    comparable_claims: string
    regional_factors: string
    timing_considerations: string
  }
  risk_assessment: {
    fraud_probability: 'low' | 'medium' | 'high'
    coverage_disputes: string[]
    litigation_risk: 'low' | 'medium' | 'high'
  }
  key_milestones: Array<{
    milestone: string
    estimated_date: string
    critical_path: boolean
  }>
  summary: string
}

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeDocument = async (
    documentText: string,
    documentType?: string,
    claimId?: string
  ): Promise<DocumentAnalysisResult | null> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: {
          documentText,
          documentType,
          claimId
        }
      })

      if (error) {
        throw error
      }

      return data.data.analysis
    } catch (err: any) {
      console.error('Document analysis error:', err)
      setError(err.message || 'Failed to analyze document')
      return null
    } finally {
      setLoading(false)
    }
  }

  const predictSettlement = async (
    claimData: any,
    propertyData?: any,
    historicalData?: any,
    marketData?: any
  ): Promise<SettlementPredictionResult | null> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.functions.invoke('predict-settlement', {
        body: {
          claimData,
          propertyData,
          historicalData,
          marketData
        }
      })

      if (error) {
        throw error
      }

      return data.data.prediction
    } catch (err: any) {
      console.error('Settlement prediction error:', err)
      setError(err.message || 'Failed to predict settlement')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getAIInsights = async (claimId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('claim_id', claimId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (err: any) {
      console.error('Error fetching AI insights:', err)
      setError(err.message || 'Failed to fetch AI insights')
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    analyzeDocument,
    predictSettlement,
    getAIInsights
  }
}