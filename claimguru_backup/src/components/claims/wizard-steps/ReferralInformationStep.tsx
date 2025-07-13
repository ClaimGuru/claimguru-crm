import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { 
  Users, 
  TrendingUp, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Brain,
  AlertCircle,
  CheckCircle,
  Target,
  Award,
  DollarSign
} from 'lucide-react'
import { enhancedClaimWizardAI } from '../../../services/enhancedClaimWizardAI'

interface ReferralSource {
  id: string
  type: 'individual' | 'business' | 'online' | 'marketing' | 'existing_client'
  name: string
  contactInfo?: {
    phone?: string
    email?: string
    address?: string
    website?: string
  }
  relationship: string
  referralDate: string
  commissionRate?: number
  notes?: string
  isActive: boolean
  totalReferrals: number
  totalValueGenerated: number
  lastReferralDate?: string
}

interface ReferralAnalytics {
  topSources: Array<{
    source: string
    count: number
    valueGenerated: number
    conversionRate: number
  }>
  trends: {
    monthlyGrowth: number
    bestPerformingChannel: string
    averageValuePerReferral: number
  }
  recommendations: string[]
  marketingOpportunities: string[]
}

interface ReferralInformationStepProps {
  data: any
  onUpdate: (data: any) => void
  onComplete?: () => void
}

export const ReferralInformationStep: React.FC<ReferralInformationStepProps> = ({
  data,
  onUpdate,
  onComplete
}) => {
  const [referralInfo, setReferralInfo] = useState<ReferralSource>(
    data.referralInformation || {
      id: '',
      type: 'individual',
      name: '',
      relationship: '',
      referralDate: new Date().toISOString().split('T')[0],
      isActive: true,
      totalReferrals: 1,
      totalValueGenerated: 0
    }
  )
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  useEffect(() => {
    onUpdate({
      ...data,
      referralInformation: referralInfo
    })
  }, [referralInfo, data, onUpdate])

  const analyzeReferralPatterns = async () => {
    setIsAnalyzing(true)
    try {
      const analysisResults = await enhancedClaimWizardAI.analyzeReferralPatterns({
        currentReferral: referralInfo,
        clientData: data.clientDetails,
        claimValue: data.claimInformation?.estimatedLossValue || 0,
        historicalData: data.historicalReferrals || []
      })
      
      setAnalytics(analysisResults)
      setShowAnalytics(true)
    } catch (error) {
      console.error('Failed to analyze referral patterns:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReferralChange = (field: string, value: any) => {
    setReferralInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleContactInfoChange = (field: string, value: string) => {
    setReferralInfo(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span>Referral Information</span>
          </CardTitle>
          <p className="text-gray-600">
            Track how this client found your services. AI analyzes referral patterns to optimize your business development.
          </p>
        </CardHeader>
      </Card>

      {/* Referral Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Referral Source Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Type
              </label>
              <select
                value={referralInfo.type}
                onChange={(e) => handleReferralChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="individual">Individual Person</option>
                <option value="business">Business/Company</option>
                <option value="online">Online/Website</option>
                <option value="marketing">Marketing Campaign</option>
                <option value="existing_client">Existing Client</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Source Name
              </label>
              <Input
                value={referralInfo.name}
                onChange={(e) => handleReferralChange('name', e.target.value)}
                placeholder="Enter name or source"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship/Channel
              </label>
              <Input
                value={referralInfo.relationship}
                onChange={(e) => handleReferralChange('relationship', e.target.value)}
                placeholder="e.g., Friend, Attorney, Previous Client, Google Search"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Date
              </label>
              <Input
                type="date"
                value={referralInfo.referralDate}
                onChange={(e) => handleReferralChange('referralDate', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information (Optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  value={referralInfo.contactInfo?.phone || ''}
                  onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={referralInfo.contactInfo?.email || ''}
                  onChange={(e) => handleContactInfoChange('email', e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <Input
                  value={referralInfo.contactInfo?.website || ''}
                  onChange={(e) => handleContactInfoChange('website', e.target.value)}
                  placeholder="https://website.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commission Rate (%)
                </label>
                <Input
                  type="number"
                  value={referralInfo.commissionRate || ''}
                  onChange={(e) => handleReferralChange('commissionRate', parseFloat(e.target.value))}
                  placeholder="10"
                  min="0"
                  max="50"
                  step="0.5"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={referralInfo.notes || ''}
              onChange={(e) => handleReferralChange('notes', e.target.value)}
              placeholder="Any additional details about this referral source..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Referral Analytics
            </span>
            <Button
              onClick={analyzeReferralPatterns}
              disabled={isAnalyzing || !referralInfo.name}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              Analyze Patterns
            </Button>
          </CardTitle>
        </CardHeader>
        {showAnalytics && analytics && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Source Value</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {analytics.trends.averageValuePerReferral > 0 
                    ? `$${analytics.trends.averageValuePerReferral.toLocaleString()}`
                    : 'N/A'
                  }
                </p>
                <p className="text-sm text-blue-600">Average per referral</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Growth Rate</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {analytics.trends.monthlyGrowth > 0 ? '+' : ''}{analytics.trends.monthlyGrowth}%
                </p>
                <p className="text-sm text-green-600">Monthly trend</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-800">Best Channel</span>
                </div>
                <p className="text-lg font-bold text-purple-900">
                  {analytics.trends.bestPerformingChannel}
                </p>
                <p className="text-sm text-purple-600">Top performer</p>
              </div>
            </div>

            {analytics.recommendations.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  AI Recommendations
                </h4>
                <ul className="space-y-1">
                  {analytics.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-1 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div></div>
        <Button onClick={onComplete}>
          Continue to Next Step
        </Button>
      </div>
    </div>
  )
}
