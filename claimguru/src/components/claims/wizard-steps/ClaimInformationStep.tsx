import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { 
  FileText, 
  Brain, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Home,
  Camera,
  DollarSign,
  MapPin,
  Zap,
  Eye,
  RefreshCw,
  Sparkles,
  Shield,
  Clock
} from 'lucide-react'
import { claimWizardAI, DamageAnalysisResult, SettlementPrediction } from '../../../services/claimWizardAI'

interface ClaimInformationStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function ClaimInformationStep({ data, onUpdate }: ClaimInformationStepProps) {
  const [lossDetails, setLossDetails] = useState({
    reasonForLoss: data.lossDetails?.reasonForLoss || '',
    dateOfLoss: data.lossDetails?.dateOfLoss || '',
    causeOfLoss: data.lossDetails?.causeOfLoss || '',
    severity: data.lossDetails?.severity || '',
    lossDescription: data.lossDetails?.lossDescription || '',
    yearBuilt: data.lossDetails?.yearBuilt || '',
    isFEMA: data.lossDetails?.isFEMA || false,
    isHabitable: data.lossDetails?.isHabitable || true,
    alternativeLiving: data.lossDetails?.alternativeLiving || '',
    monthlyLivingCost: data.lossDetails?.monthlyLivingCost || '',
    stateOfEmergency: data.lossDetails?.stateOfEmergency || false,
    personalPropertyDamage: data.lossDetails?.personalPropertyDamage || false,
    otherStructuresDamage: data.lossDetails?.otherStructuresDamage || false
  })

  const [aiGenerating, setAiGenerating] = useState(false)
  const [damagePhotos, setDamagePhotos] = useState<File[]>([])
  const [damageAnalysis, setDamageAnalysis] = useState<DamageAnalysisResult | null>(null)
  const [settlementPrediction, setSettlementPrediction] = useState<SettlementPrediction | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [dateError, setDateError] = useState('')

  // Validate date of loss against policy period
  useEffect(() => {
    if (lossDetails.dateOfLoss && data.aiExtractedData) {
      const lossDate = new Date(lossDetails.dateOfLoss)
      const effectiveDate = new Date(data.aiExtractedData.extractedData.effectiveDate)
      const expirationDate = new Date(data.aiExtractedData.extractedData.expirationDate)
      
      if (lossDate < effectiveDate || lossDate > expirationDate) {
        setDateError('Date of loss is outside of policy coverage dates')
      } else {
        setDateError('')
      }
    }
  }, [lossDetails.dateOfLoss, data.aiExtractedData])

  // Update parent component when data changes
  useEffect(() => {
    onUpdate({
      lossDetails,
      personalPropertyDamage: lossDetails.personalPropertyDamage,
      otherStructuresDamage: lossDetails.otherStructuresDamage,
      damageAnalysis,
      settlementPrediction
    })
  }, [lossDetails, damageAnalysis, settlementPrediction, onUpdate])

  const handleInputChange = (field: string, value: any) => {
    setLossDetails(prev => ({ ...prev, [field]: value }))
  }

  const generateAILossDescription = async () => {
    if (!lossDetails.causeOfLoss || !lossDetails.dateOfLoss) {
      alert('Please fill in the cause of loss and date of loss first')
      return
    }

    setAiGenerating(true)
    try {
      const description = await claimWizardAI.generateLossDescription(
        lossDetails,
        data.aiExtractedData
      )
      handleInputChange('lossDescription', description)
    } catch (error) {
      console.error('Error generating loss description:', error)
      alert('Error generating description. Please try again.')
    } finally {
      setAiGenerating(false)
    }
  }

  const handlePhotoUpload = async (files: FileList) => {
    const photoFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (photoFiles.length === 0) {
      alert('Please select image files only')
      return
    }

    setDamagePhotos(prev => [...prev, ...photoFiles])
    
    // Start AI damage analysis
    if (photoFiles.length > 0) {
      setAnalyzing(true)
      try {
        const analysis = await claimWizardAI.analyzeDamagePhotos(photoFiles)
        setDamageAnalysis(analysis)
        
        // Generate settlement prediction based on damage analysis
        const prediction = await claimWizardAI.predictSettlement({
          ...lossDetails,
          damageAnalysis: analysis
        }, data.aiExtractedData)
        setSettlementPrediction(prediction)
        
      } catch (error) {
        console.error('Error analyzing damage photos:', error)
      } finally {
        setAnalyzing(false)
      }
    }
  }

  const reasonOptions = [
    'New Claim',
    'Supplement',
    'Denial Review',
    'Appraisal',
    'Loss Consulting',
    'Expert Witness',
    'Re-inspection'
  ]

  const causeOfLossOptions = [
    'Wind',
    'Hail',
    'Water Damage',
    'Fire',
    'Lightning',
    'Theft',
    'Vandalism',
    'Other'
  ]

  const severityOptions = [
    'Minor',
    'Moderate', 
    'Major',
    'Total Loss'
  ]

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
      {/* Loss Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            Loss Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Reason for Loss */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Loss *
              </label>
              <select
                value={lossDetails.reasonForLoss}
                onChange={(e) => handleInputChange('reasonForLoss', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select reason</option>
                {reasonOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Date of Loss */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Loss *
              </label>
              <input
                type="date"
                value={lossDetails.dateOfLoss}
                onChange={(e) => handleInputChange('dateOfLoss', e.target.value)}
                className={`w-full p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                  dateError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {dateError && (
                <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {dateError}
                </div>
              )}
            </div>

            {/* Cause of Loss */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cause of Loss *
              </label>
              <select
                value={lossDetails.causeOfLoss}
                onChange={(e) => handleInputChange('causeOfLoss', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select cause</option>
                {causeOfLossOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Severity
              </label>
              <select
                value={lossDetails.severity}
                onChange={(e) => handleInputChange('severity', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select severity</option>
                {severityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Year Built */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Built
              </label>
              <input
                type="number"
                value={lossDetails.yearBuilt}
                onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                min="1800"
                max={new Date().getFullYear()}
                placeholder="e.g., 1995"
              />
            </div>
          </div>

          {/* Special Circumstances */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={lossDetails.isFEMA}
                onChange={(e) => handleInputChange('isFEMA', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">FEMA Claim</span>
            </label>

            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={lossDetails.stateOfEmergency}
                onChange={(e) => handleInputChange('stateOfEmergency', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">State of Emergency</span>
            </label>

            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={!lossDetails.isHabitable}
                onChange={(e) => handleInputChange('isHabitable', !e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Home className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Home Not Habitable</span>
            </label>
          </div>

          {/* Alternative Living Expenses (if not habitable) */}
          {!lossDetails.isHabitable && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-3">Alternative Living Arrangements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Living Situation
                  </label>
                  <input
                    type="text"
                    value={lossDetails.alternativeLiving}
                    onChange={(e) => handleInputChange('alternativeLiving', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Hotel, family member's home, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Cost
                  </label>
                  <input
                    type="number"
                    value={lossDetails.monthlyLivingCost}
                    onChange={(e) => handleInputChange('monthlyLivingCost', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI-Powered Loss Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-purple-600" />
            AI-Generated Loss Description
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={generateAILossDescription}
              disabled={aiGenerating || !lossDetails.causeOfLoss || !lossDetails.dateOfLoss}
              className="flex items-center gap-2"
            >
              {aiGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate Professional Description
                </>
              )}
            </Button>
            
            {lossDetails.lossDescription && (
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
            )}
          </div>

          <textarea
            value={lossDetails.lossDescription}
            onChange={(e) => handleInputChange('lossDescription', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            rows={8}
            placeholder="AI will generate a professional loss description based on policy language and claim details..."
          />

          {lossDetails.lossDescription && (
            <div className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Professional description generated using policy language
            </div>
          )}
        </CardContent>
      </Card>

      {/* Damage Photography & AI Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Camera className="h-6 w-6 text-green-600" />
            Damage Documentation & AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Damage Photos</h3>
            <p className="text-gray-600 mb-4">
              Our AI will analyze photos to assess damage types, severity, and estimated costs
            </p>
            
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
              className="hidden"
              id="damage-photos"
            />
            <label htmlFor="damage-photos">
              <Button className="flex items-center gap-2 cursor-pointer">
                <Camera className="h-4 w-4" />
                Upload Photos
              </Button>
            </label>
          </div>

          {/* Photo Preview */}
          {damagePhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {damagePhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Damage photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Analysis Progress */}
          {analyzing && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
                <div>
                  <div className="font-medium text-purple-900">AI Damage Analysis in Progress</div>
                  <div className="text-sm text-purple-700">
                    Analyzing damage types, severity, and estimating repair costs...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Damage Analysis Results */}
          {damageAnalysis && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Damage Analysis Complete
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {damageAnalysis.severity.charAt(0).toUpperCase() + damageAnalysis.severity.slice(1)}
                  </div>
                  <div className="text-sm text-green-600">Damage Severity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(damageAnalysis.estimatedCost)}
                  </div>
                  <div className="text-sm text-green-600">Estimated Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {Math.round(damageAnalysis.confidence * 100)}%
                  </div>
                  <div className="text-sm text-green-600">AI Confidence</div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-green-900">Damage Types Detected: </span>
                  <span className="text-sm text-green-700">{damageAnalysis.damageTypes.join(', ')}</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-green-900">Recommendations: </span>
                  <ul className="text-sm text-green-700 list-disc list-inside">
                    {damageAnalysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Early Settlement Prediction */}
          {settlementPrediction && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                AI Settlement Prediction
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(settlementPrediction.estimatedAmount)}
                  </div>
                  <div className="text-sm text-blue-600">Predicted Settlement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {settlementPrediction.timelineWeeks} weeks
                  </div>
                  <div className="text-sm text-blue-600">Estimated Timeline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {Math.round(settlementPrediction.confidence * 100)}%
                  </div>
                  <div className="text-sm text-blue-600">Confidence Level</div>
                </div>
              </div>

              <div className="text-xs text-blue-600">
                * Prediction based on similar claims, policy coverage, and current market conditions
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Damage Type Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Damage Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Property Damage */}
            <div className="border rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lossDetails.personalPropertyDamage}
                  onChange={(e) => handleInputChange('personalPropertyDamage', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <div className="font-medium">Personal Property Damage</div>
                  <div className="text-sm text-gray-600">Damage to contents, furniture, belongings</div>
                </div>
              </label>
              
              {lossDetails.personalPropertyDamage && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-sm text-blue-800">
                    ✓ Personal Property Inventory section will be included in next steps
                  </div>
                </div>
              )}
            </div>

            {/* Other Structures Damage */}
            <div className="border rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lossDetails.otherStructuresDamage}
                  onChange={(e) => handleInputChange('otherStructuresDamage', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <div className="font-medium">Other Structures Damage</div>
                  <div className="text-sm text-gray-600">Garage, fence, shed, pool, etc.</div>
                </div>
              </label>
              
              {lossDetails.otherStructuresDamage && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm text-green-800">
                    ✓ Other Structures section will be included in next steps
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
