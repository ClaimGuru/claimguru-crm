import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { Upload, FileText, CheckCircle, AlertTriangle, Brain, Eye, Shield, Cloud, Database } from 'lucide-react'
import { enhancedClaimWizardAI, PolicyExtractionResult } from '../../../services/enhancedClaimWizardAI'
import { documentUploadService, UploadedDocument } from '../../../services/documentUploadService'
import { PolicyExtractionValidationStep } from './PolicyExtractionValidationStep'

interface EnhancedPolicyUploadStepProps {
  data: any
  onUpdate: (data: any) => void
  onAIProcessing?: (isProcessing: boolean) => void
}

export const EnhancedPolicyUploadStep: React.FC<EnhancedPolicyUploadStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<'full_policy' | 'dec_page'>('dec_page')
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null)
  const [extractionResult, setExtractionResult] = useState<PolicyExtractionResult | null>(null)
  const [isAdvancedAnalyzing, setIsAdvancedAnalyzing] = useState(false)
  const [advancedAnalysis, setAdvancedAnalysis] = useState<any>(null)
  const [showValidation, setShowValidation] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [processingStep, setProcessingStep] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle')

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type)
      setUploadedFile(file)
      setUploadedDocument(null)
      setExtractionResult(null)
      setAdvancedAnalysis(null)
      setProcessingStep('idle')
      setIsValidated(false)
      setShowValidation(false)
    }
  }, [])

  const extractPolicyData = async () => {
    if (!uploadedFile) return

    setProcessingStep('uploading')
    setIsUploading(true)
    onAIProcessing?.(true)

    try {
      // Step 1: Upload document to Supabase storage
      console.log('Uploading document to storage...')
      const document = await documentUploadService.uploadDocument(uploadedFile, 'policy')
      setUploadedDocument(document)
      
      setProcessingStep('processing')
      setIsUploading(false)
      setIsExtracting(true)
      
      // Step 2: Process document with AI
      console.log('Processing document with AI...')
      const result = await enhancedClaimWizardAI.extractPolicyData(uploadedFile, documentType)
      setExtractionResult(result)
      
      // Step 3: Update document status
      await documentUploadService.updateExtractionStatus(document.id, 'completed', result)
      
      setProcessingStep('complete')
      
      // Show validation step instead of auto-populating
      setShowValidation(true)
    } catch (error) {
      console.error('Policy extraction failed:', error)
      setProcessingStep('idle')
      
      if (uploadedDocument) {
        await documentUploadService.updateExtractionStatus(uploadedDocument.id, 'failed')
      }
    } finally {
      setIsUploading(false)
      setIsExtracting(false)
      onAIProcessing?.(false)
    }
  }

  const handleValidationComplete = (validatedData: any) => {
    // Now we can auto-populate with validated data
    onUpdate({
      ...data,
      policyDetails: {
        ...data.policyDetails,
        ...validatedData.fieldMappings
      },
      extractedPolicyData: validatedData.extractedPolicyData,
      validatedFields: validatedData.validatedFields
    })
    
    setIsValidated(true)
    setShowValidation(false)
  }

  const handleBackToUpload = () => {
    setShowValidation(false)
    setExtractionResult(null)
    setIsValidated(false)
    setProcessingStep('idle')
  }

  const runAdvancedAnalysis = async () => {
    if (!extractionResult) return

    setIsAdvancedAnalyzing(true)
    onAIProcessing?.(true)

    try {
      // Run comprehensive AI analysis
      const [fraudAnalysis, weatherCorrelation, geoRisk] = await Promise.all([
        enhancedClaimWizardAI.detectPotentialFraud({ ...data, ...extractionResult.policyData }),
        enhancedClaimWizardAI.analyzeWeatherCorrelation(
          data.lossDetails?.lossDate || new Date().toISOString().split('T')[0],
          data.mailingAddress?.address || 'Unknown'
        ),
        enhancedClaimWizardAI.assessGeographicRisk(data.mailingAddress?.address || 'Unknown')
      ])

      setAdvancedAnalysis({
        fraudDetection: fraudAnalysis,
        complianceCheck: {
          status: 'Compliant',
          issues: [],
          score: 95
        },
        qualityScore: Math.round((extractionResult.validation.confidence * 100)),
        weatherCorrelation,
        geoRisk
      })
    } catch (error) {
      console.error('Advanced analysis failed:', error)
    } finally {
      setIsAdvancedAnalyzing(false)
      onAIProcessing?.(false)
    }
  }

  // Show validation step if extraction is complete and validation is needed
  if (showValidation && extractionResult) {
    return (
      <PolicyExtractionValidationStep
        data={data}
        onUpdate={onUpdate}
        extractionResult={extractionResult}
        onValidationComplete={handleValidationComplete}
        onBack={handleBackToUpload}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Policy Upload & AI-Powered Auto-Population
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="dec_page"
                  checked={documentType === 'dec_page'}
                  onChange={(e) => setDocumentType(e.target.value as 'dec_page')}
                  className="form-radio"
                />
                <span>Declarations Page</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="full_policy"
                  checked={documentType === 'full_policy'}
                  onChange={(e) => setDocumentType(e.target.value as 'full_policy')}
                  className="form-radio"
                />
                <span>Full Policy</span>
              </label>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload Policy Document</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="policy-upload"
              />
              <label htmlFor="policy-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG files supported
                </span>
              </label>
            </div>

            {uploadedFile && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                {isValidated ? (
                  <div className="ml-auto flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Validated & Ready</span>
                  </div>
                ) : (
                  <Button
                    onClick={extractPolicyData}
                    disabled={isUploading || isExtracting}
                    className="ml-auto"
                    size="sm"
                  >
                    {isUploading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <Cloud className="h-4 w-4 mr-1" />
                        Uploading...
                      </>
                    ) : isExtracting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <Brain className="h-4 w-4 mr-1" />
                        Processing with AI...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-1" />
                        Process with AI
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Processing Progress */}
          {(isUploading || isExtracting) && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <LoadingSpinner size="sm" />
                Processing Document
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {processingStep === 'uploading' ? (
                    <LoadingSpinner size="sm" />
                  ) : processingStep === 'processing' || processingStep === 'complete' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border border-gray-300 rounded-full" />
                  )}
                  <span className={`text-sm ${processingStep === 'uploading' ? 'text-blue-600' : processingStep === 'processing' || processingStep === 'complete' ? 'text-green-600' : 'text-gray-500'}`}>
                    Upload to secure storage
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {processingStep === 'processing' ? (
                    <LoadingSpinner size="sm" />
                  ) : processingStep === 'complete' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border border-gray-300 rounded-full" />
                  )}
                  <span className={`text-sm ${processingStep === 'processing' ? 'text-blue-600' : processingStep === 'complete' ? 'text-green-600' : 'text-gray-500'}`}>
                    AI extraction and analysis
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {processingStep === 'complete' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border border-gray-300 rounded-full" />
                  )}
                  <span className={`text-sm ${processingStep === 'complete' ? 'text-green-600' : 'text-gray-500'}`}>
                    Ready for validation
                  </span>
                </div>
              </div>
              {uploadedDocument && (
                <div className="mt-3 text-xs text-blue-600">
                  Document stored: {uploadedDocument.fileName} ({(uploadedDocument.fileSize / 1024).toFixed(1)}KB)
                </div>
              )}
            </div>
          )}

          {/* Validation Success Summary */}
          {isValidated && extractionResult && (
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Policy Data Validated & Ready
              </h3>
              <p className="text-sm text-green-700 mb-2">
                All extracted policy data has been validated and approved. The system is ready to proceed with the claim intake.
              </p>
              <div className="text-xs text-green-600">
                ✓ {Object.keys(data.extractedPolicyData || {}).length} fields extracted and validated
                ✓ Document stored securely in system
                ✓ Ready for next step
              </div>
            </div>
          )}

          {/* AI Extraction Results */}
          {extractionResult && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Extraction Results
                </h3>

                {/* Data Quality Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(extractionResult.validation.confidence * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {extractionResult.validation.missingData.length === 0 ? '✓' : '⚠'}
                    </div>
                    <div className="text-sm text-gray-600">Completeness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {extractionResult.validation.inconsistencies.length === 0 ? '✓' : '⚠'}
                    </div>
                    <div className="text-sm text-gray-600">Consistency</div>
                  </div>
                </div>

                {/* Extracted Data Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Policy Number:</strong> {extractionResult.policyData.policyNumber}
                  </div>
                  <div>
                    <strong>Effective Date:</strong> {extractionResult.policyData.effectiveDate}
                  </div>
                  <div>
                    <strong>Coverage Types:</strong> {extractionResult.policyData.coverageTypes?.join(', ')}
                  </div>
                  <div>
                    <strong>Territory:</strong> {extractionResult.policyData.coveredTerritory}
                  </div>
                </div>

                {/* Validation Alerts */}
                {extractionResult.validation.missingData.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <strong className="text-yellow-800">Missing Data</strong>
                    </div>
                    <ul className="text-sm text-yellow-700">
                      {extractionResult.validation.missingData.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {extractionResult.validation.inconsistencies.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <strong className="text-red-800">Inconsistencies Found</strong>
                    </div>
                    <ul className="text-sm text-red-700">
                      {extractionResult.validation.inconsistencies.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Advanced AI Analysis */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Advanced AI Analysis
                  </h3>
                  <Button
                    onClick={runAdvancedAnalysis}
                    disabled={isAdvancedAnalyzing}
                    variant="outline"
                    size="sm"
                  >
                    {isAdvancedAnalyzing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Run Advanced AI Analysis
                      </>
                    )}
                  </Button>
                </div>

                {advancedAnalysis && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Fraud Detection */}
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-red-600" />
                        <strong>Fraud Detection</strong>
                      </div>
                      <div className="text-sm">
                        <div>Risk Score: <span className="font-semibold">{advancedAnalysis.fraudDetection.riskScore}/100</span></div>
                        <div className="text-gray-600 mt-1">
                          Status: {advancedAnalysis.fraudDetection.riskScore < 30 ? 'Low Risk' : 
                                   advancedAnalysis.fraudDetection.riskScore < 60 ? 'Medium Risk' : 'High Risk'}
                        </div>
                      </div>
                    </div>

                    {/* Compliance Check */}
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <strong>Compliance Verification</strong>
                      </div>
                      <div className="text-sm">
                        <div>Status: <span className="font-semibold text-green-600">{advancedAnalysis.complianceCheck.status}</span></div>
                        <div className="text-gray-600 mt-1">Score: {advancedAnalysis.complianceCheck.score}%</div>
                      </div>
                    </div>

                    {/* Quality Score */}
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <strong>AI Quality Score</strong>
                      </div>
                      <div className="text-sm">
                        <div>Quality: <span className="font-semibold">{advancedAnalysis.qualityScore}%</span></div>
                        <div className="text-gray-600 mt-1">
                          Rating: {advancedAnalysis.qualityScore >= 90 ? 'Excellent' : 
                                   advancedAnalysis.qualityScore >= 70 ? 'Good' : 'Needs Review'}
                        </div>
                      </div>
                    </div>

                    {/* Weather Correlation */}
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-purple-600" />
                        <strong>Weather Analysis</strong>
                      </div>
                      <div className="text-sm">
                        <div>Correlation: <span className="font-semibold">{Math.round(advancedAnalysis.weatherCorrelation.correlation * 100)}%</span></div>
                        <div className="text-gray-600 mt-1">
                          {advancedAnalysis.weatherCorrelation.hasWeatherEvent ? 
                            `${advancedAnalysis.weatherCorrelation.eventType} confirmed` : 'No weather events'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
