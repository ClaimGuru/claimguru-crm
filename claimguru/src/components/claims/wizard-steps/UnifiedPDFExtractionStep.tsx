import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { 
  FileText, Upload, CheckCircle, AlertCircle, Brain, X, Eye, 
  Clock, Shield, Building, User, DollarSign, Calendar,
  AlertTriangle, Info, Trash2, Plus, Zap
} from 'lucide-react'
// import { unifiedPdfExtractionService, UnifiedPDFExtractionResult } from '../../../services//* UnifiedPDFExtractionService - removed */'
import { PolicyDataMappingService } from '../../../services/policyDataMappingService'
import { PolicyDataValidationStep } from './PolicyDataValidationStep'
import { ConfirmedFieldsService } from '../../../services/confirmedFieldsService'
import MultiDocumentExtractionService, { DocumentExtractionResult, MultiDocumentResult } from '../../../services/multiDocumentExtractionService'

interface UnifiedPDFExtractionStepProps {
  data: any
      // onUpdate: (data: any) => void
  onAIProcessing?: (isProcessing: boolean) => void
  mode?: 'single' | 'multi' | 'hybrid'
  enableValidation?: boolean
  autoProcessOnUpload?: boolean
  maxFiles?: number
}

interface PolicyValidationState {
  documentIndex: number
  isValidating: boolean
  extractedData: any
  rawText: string
}

interface PolicyValidationProgress {
  documentIndex: number
      // isComplete: boolean
  validatedData?: any
}

interface FileStatus {
  file: File
      // status: 'pending' | 'processing' | 'completed' | 'error'
  result?: DocumentExtractionResult
  error?: string
}

interface SingleDocumentResult {
  extractedText: string
  policyData: any
  processingMethod: string
  confidence: number
  cost: number
  processingTime: number
  metadata: {
    methodsAttempted: string[]
  }
}

const DocumentTypeIcon = ({ type, category }: { type: string; category: string }) => {
  const iconProps = { className: "h-4 w-4" }
  
  switch (category) {
    case 'policy':
      return <Shield {...iconProps} className="h-4 w-4 text-blue-600" />
    case 'communication':
      return <FileText {...iconProps} className="h-4 w-4 text-green-600" />
    case 'processing':
      return <AlertCircle {...iconProps} className="h-4 w-4 text-orange-600" />
    case 'assessment':
      return <Eye {...iconProps} className="h-4 w-4 text-purple-600" />
    default:
      return <FileText {...iconProps} className="h-4 w-4 text-gray-600" />
  }
}

const ConfidenceBadge = ({ confidence }: { confidence: number }) => {
  const getColor = () => {
    if (confidence >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColor()}`}>
      {confidence.toFixed(0)}% confidence
    </span>
  )
}

export function UnifiedPDFExtractionStep({ 
  data, 
  onUpdate, 
  onAIProcessing,
  mode = 'single',
  enableValidation = true,
  autoProcessOnUpload = false,
  maxFiles = 5
}: UnifiedPDFExtractionStepProps) {
  // Single document state
  const [file, setFile] = useState<File | null>(null)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [rawText, setRawText] = useState<string>('')
  const [processingDetails, setProcessingDetails] = useState<any>(null)
  
  // Multi-document state
  const [files, setFiles] = useState<FileStatus[]>([])
  const [processingResults, setProcessingResults] = useState<MultiDocumentResult | null>(null)
  
  // Common state
  const [isProcessing, setIsProcessing] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [policyValidation, setPolicyValidation] = useState<PolicyValidationState | null>(null)
  const [showInlineValidation, setShowInlineValidation] = useState(false)
  const [policyValidationProgress, setPolicyValidationProgress] = useState<PolicyValidationProgress[]>([])
  const [currentValidatingPolicy, setCurrentValidatingPolicy] = useState<number | null>(null)

  // Use unified service instead of instantiating
  // const hybridService = new HybridPDFExtractionService()
  const multiDocService = new MultiDocumentExtractionService()

  // Single document file selection
  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setExtractedData(null)
      setIsConfirmed(false)
      setRawText('')
      setProcessingDetails(null)
      
      if (autoProcessOnUpload) {
        setTimeout(() => processSingleDocument(selectedFile), 100)
      }
    }
  }

  // Multi-document file selection
  const handleMultiFileSelection = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return
    if (selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }


    const newFileStatuses: FileStatus[] = selectedFiles.map(file => ({
      file,
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...newFileStatuses])
    setError(null)
    
    if (autoProcessOnUpload) {
      setTimeout(() => processMultipleDocuments([...files, ...newFileStatuses]), 100)
    }
  }, [files, maxFiles, autoProcessOnUpload])

  // Single document processing
  const processSingleDocument = async (fileToProcess?: File) => {
    const targetFile = fileToProcess || file
    if (!targetFile) {
      setError("Please select a file first")
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      
      if (onAIProcessing) {
        onAIProcessing(true)
      }

      // const result = await unifiedPdfExtractionService.extractFromPDF(file, { mode: 'hybrid' })
      // Mock result for now
      const result = {
        success: true,
        extractedData: { mockData: 'PDF extraction service not available' },
        extractedText: 'Mock extracted text content',
        policyData: { mockPolicyData: 'Sample policy data' },
        confidence: 0.85,
        processingMethod: 'mock',
        cost: 0.05,
        processingTime: 1500,
        metadata: {
          methodsAttempted: ['ocr', 'textExtraction']
        }
      }
      
      // console.log('✅ Hybrid PDF extraction completed:', {
      //   method: result.processingMethod,
      //   confidence: result.confidence,
      //   cost: result.cost,
      //   textLength: result.extractedText.length
      // })
      
      setRawText(result.extractedText)
      setExtractedData(result.policyData)
      setProcessingDetails({
        processingMethod: result.processingMethod,
        confidence: result.confidence,
        cost: result.cost,
        processingTime: result.processingTime,
        methodsAttempted: result.metadata.methodsAttempted
      })
      
      setIsConfirmed(false)
      
    } catch (error) {
      // console.error('❌ Hybrid PDF extraction failed:', error)
      setError(`Extraction failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
      if (onAIProcessing) {
        onAIProcessing(false)
      }
    }
  }

  // Multi-document processing
  const processMultipleDocuments = async (filesToProcess?: FileStatus[]) => {
    const targetFiles = filesToProcess || files
    if (targetFiles.length === 0) {
      setError("Please select at least one file")
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      
      if (onAIProcessing) {
        onAIProcessing(true)
      }

      
      // Update file statuses to processing
      setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const })))
      
      // Process all documents
      const fileArray = targetFiles.map(f => f.file)
      const result = await multiDocService.processMultipleDocuments(fileArray)
      
      // console.log('📄 Multi-document processing completed:', {
      //   documentsProcessed: result.documents.length,
      //   totalCost: result.totalCost,
      //   processingTime: result.totalProcessingTime
      // })
      
      setFiles(prev => prev.map((fileStatus, index) => ({
        ...fileStatus,
        status: result.documents[index] ? 'completed' : 'error',
        result: result.documents[index],
        error: result.documents[index] ? undefined : 'Processing failed'
      })))

      setProcessingResults(result)
      
      // Auto-show validation for policy documents
      const policyDocIndex = result.documents.findIndex(doc => doc.documentInfo.category === 'policy')
      if (policyDocIndex !== -1 && enableValidation) {
        setShowInlineValidation(true)
        setCurrentValidatingPolicy(policyDocIndex)
      }
      
    } catch (error) {
      // console.error('❌ Multi-document processing failed:', error)
      setError(`Processing failed: ${error.message}`)
      
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const,
        error: error.message 
      })))
    } finally {
      setIsProcessing(false)
      if (onAIProcessing) {
        onAIProcessing(false)
      }
    }
  }

  // Remove file from multi-document list
  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Single document validation complete handler
  const handleSingleValidationComplete = (validatedPolicyData: any) => {
    
    ConfirmedFieldsService.initializeWithPDFData(validatedPolicyData, {
      processingMethod: processingDetails?.processingMethod || 'hybrid',
      confidence: processingDetails?.confidence || 0.8,
      cost: processingDetails?.cost || 0
    })
    
    // Auto-confirm high confidence fields
    Object.entries(validatedPolicyData).forEach(([fieldPath, value]) => {
      if (value && typeof value === 'string' && value.length > 0) {
        const field = ConfirmedFieldsService.getField(fieldPath)
        if (field && field.confidence === 'high') {
          ConfirmedFieldsService.confirmField(fieldPath, value)
        }
      }
    })
    
    // Create unique claim identifier
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Map extracted data to wizard form fields using the mapping service
    const mappedWizardData = PolicyDataMappingService.mergeWithExistingData(data, validatedPolicyData)
    
    
    // Get confirmed field values for additional data integration
    const confirmedValues = ConfirmedFieldsService.getConfirmedValues()
    
    onUpdate({
      ...mappedWizardData,
      claimId: claimId,
      policyDetails: validatedPolicyData,
      extractedPolicyData: true,
      fileProcessed: file?.name,
      dataConfirmed: true,
      validationComplete: true,
      confirmationTimestamp: new Date().toISOString(),
      processingComplete: true,
      rawExtractedText: rawText,
      processingDetails: processingDetails,
      confirmedFields: confirmedValues,
      confirmedFieldsState: ConfirmedFieldsService.exportState()
    })
    
    setIsConfirmed(true)
    
    // Show success message with confirmation details
    const summary = ConfirmedFieldsService.getSummary()
    setTimeout(() => {
      alert(`✅ Data validated and confirmed successfully!\n\n📊 Field Status:\n• ${summary.confirmedFields} fields confirmed\n• ${summary.pendingFields} fields pending review\n• ${Math.round(summary.completionRate)}% completion rate\n\n🔄 Wizard forms have been automatically populated with the extracted data.\n\nPlease click "Next" to review and confirm the populated information.`)
    }, 500)
  }

  // Multi-document validation complete handler
  const handleMultiValidationComplete = () => {
    if (!processingResults) return

    // Create comprehensive claim data from all documents
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const claimData = {
      ...data,
      claimId,
      multiDocumentData: {
        totalDocuments: processingResults.documents.length,
        documentTypes: processingResults.documents.map(d => d.documentInfo.type),
        consolidatedData: processingResults.consolidatedData,
        workflowStage: processingResults.workflowAnalysis.workflowStage,
        claimContext: processingResults.claimContext,
        totalProcessingCost: processingResults.totalCost,
        totalProcessingTime: processingResults.totalProcessingTime
      },
      documents: processingResults.documents.map(doc => ({
        filename: doc.documentInfo.filename,
        type: doc.documentInfo.type,
        category: doc.documentInfo.category,
        confidence: doc.documentInfo.confidence,
        extractedData: doc.extractedData,
        rawText: doc.rawText
      })),
      recommendations: processingResults.recommendations,
      extractedPolicyData: true,
      multiDocumentProcessing: true,
      dataConfirmed: true,
      validationComplete: true,
      confirmationTimestamp: new Date().toISOString(),
      processingComplete: true
    }

    onUpdate(claimData)
    setIsConfirmed(true)
    
    // Show success message
    setTimeout(() => {
      alert(`✅ ${processingResults.documents.length} documents processed successfully! Click "Next" to continue to Client Information.`)
    }, 500)
  }

  // Validation rejection handler
  const handleValidationReject = () => {
    
    // Reset everything to start over
    setFile(null)
    setFiles([])
    setExtractedData(null)
    setProcessingResults(null)
    setIsConfirmed(false)
    setRawText('')
    setProcessingDetails(null)
    setError(null)
    
    // Clear the file input
    const fileInput = document.getElementById('pdf-file-input') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const renderSingleDocumentMode = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-600" />
            {mode === 'hybrid' ? 'HYBRID PDF Data Extraction - Advanced AI Processing' : 'Single Document PDF Extraction'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!extractedData && !isProcessing && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Policy Document
                </h3>
                <p className="text-gray-600 mb-4">
                  Select your insurance policy or declaration page for AI extraction
                </p>
                <input
                  type="file"
                  id="pdf-file-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleSingleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="pdf-file-input"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Choose File
                </label>
              </div>
              
              {file && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    onClick={() => processSingleDocument()}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    {mode === 'hybrid' ? 'Start Hybrid Extraction' : 'Extract Data'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {mode === 'hybrid' ? 'Processing with Hybrid AI Technology' : 'Extracting Document Data'}
              </h3>
              <p className="text-gray-600">
                {mode === 'hybrid' 
                  ? 'Using advanced PDF.js \u2192 Tesseract OCR \u2192 Google Vision \u2192 OpenAI pipeline'
                  : 'Please wait while we extract and process your document...'
                }
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Extraction Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null)
                  setFile(null)
                  setExtractedData(null)
                }}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show validation step for single document */}
      {enableValidation && extractedData && rawText && !isConfirmed && (
        <PolicyDataValidationStep
          extractedData={extractedData}
          rawText={rawText}
          onConfirm={handleSingleValidationComplete}
          onReject={handleValidationReject}
          processingDetails={processingDetails}
        />
      )}
    </>
  )

  const renderMultiDocumentMode = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Multi-Document AI Processing System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!processingResults && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Multiple Documents
                </h3>
                <p className="text-gray-600 mb-4">
                  Select up to {maxFiles} documents for batch AI processing
                </p>
                <input
                  type="file"
                  id="multi-file-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleMultiFileSelection}
                  className="hidden"
                />
                <label
                  htmlFor="multi-file-input"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select Files
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      Selected Files ({files.length}/{maxFiles})
                    </h4>
                    <Button
                      onClick={() => processMultipleDocuments()}
                      disabled={isProcessing || files.length === 0}
                      className="flex items-center gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      Process All Documents
                    </Button>
                  </div>
                  
                  {files.map((fileStatus, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium">{fileStatus.file.name}</div>
                          <div className="text-sm text-gray-500">
                            {(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB • {fileStatus.status}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {fileStatus.status === 'processing' && <LoadingSpinner size="sm" />}
                        {fileStatus.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {fileStatus.status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Processing {files.length} Documents
              </h3>
              <p className="text-gray-600">
                AI is analyzing document types, extracting data, and consolidating information...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Processing Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show multi-document results */}
      {processingResults && !isConfirmed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Processing Complete - {processingResults.documents.length} Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {processingResults.documents.length}
                </div>
                <div className="text-sm text-gray-600">Documents Processed</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {processingResults.totalProcessingTime}s
                </div>
                <div className="text-sm text-gray-600">Processing Time</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${processingResults.totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Document Analysis Results</h4>
              {processingResults.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DocumentTypeIcon type={doc.documentInfo.type} category={doc.documentInfo.category} />
                    <div>
                      <div className="font-medium">{doc.documentInfo.filename}</div>
                      <div className="text-sm text-gray-500">
                        {doc.documentInfo.type} • {doc.documentInfo.category}
                      </div>
                    </div>
                  </div>
                  <ConfidenceBadge confidence={doc.documentInfo.confidence} />
                </div>
              ))}
            </div>

            {processingResults.recommendations.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">AI Recommendations</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {processingResults.recommendations.map((rec, idx) => (
                    <li key={idx}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleMultiValidationComplete}
                className="flex-1 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Confirm & Continue
              </Button>
              <Button
                variant="outline"
                onClick={handleValidationReject}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )

  const renderSuccessState = () => (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-medium text-green-900 mb-2">
            {mode === 'multi' 
              ? `${processingResults?.documents.length || 0} Documents Processed Successfully`
              : 'Document Processing Complete'
            }
          </h3>
          <p className="text-green-700">
            {mode === 'multi'
              ? 'All documents have been analyzed and consolidated. Data has been automatically populated in the wizard forms.'
              : 'Policy data has been extracted and validated. Wizard forms have been automatically populated.'
            }
          </p>
          {processingDetails && (
            <div className="mt-4 text-sm text-green-600">
              <div>Processing Method: {processingDetails.processingMethod}</div>
              <div>Confidence: {Math.round(processingDetails.confidence * 100)}%</div>
              <div>Processing Time: {processingDetails.processingTime}s</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {isConfirmed ? (
        renderSuccessState()
      ) : mode === 'multi' ? (
        renderMultiDocumentMode()
      ) : (
        renderSingleDocumentMode()
      )}
    </div>
  )
}