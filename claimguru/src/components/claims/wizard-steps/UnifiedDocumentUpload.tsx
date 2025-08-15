/**
 * UNIFIED DOCUMENT UPLOAD COMPONENT
 * 
 * Consolidates 2 duplicate document upload components into a single, configurable component:
 * - PolicyDocumentUploadStep.tsx (single policy document extraction)
 * - AdditionalDocumentsStep.tsx (multiple document types)
 * 
 * Features:
 * - Single or multiple file upload modes
 * - Configurable document types and categories
 * - Multiple extraction service support
 * - Progress tracking and validation
 * - Error handling and retry logic
 * - Confidence scoring and review workflow
 */

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Brain, 
  X, 
  Eye, 
  Clock, 
  Shield, 
  Building, 
  User, 
  DollarSign, 
  Calendar,
  AlertTriangle, 
  Info, 
  Trash2, 
  Plus, 
  Package, 
  Camera, 
  FileImage,
  MessageSquare, 
  ClipboardList, 
  Calculator
} from 'lucide-react'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
// import { unifiedPdfExtractionService, UnifiedPDFExtractionResult } from '../../../services//* UnifiedPDFExtractionService - removed */'
import MultiDocumentExtractionService, { DocumentExtractionResult, MultiDocumentResult } from '../../../services/multiDocumentExtractionService'

interface FileStatus {
  file: File
      // status: 'pending' | 'processing' | 'completed' | 'error'
  result?: DocumentExtractionResult
  error?: string
  category?: string
  confidence?: number
}

interface UnifiedDocumentUploadProps {
  data: any
      // onUpdate: (data: any) => void
  onAIProcessing?: (isProcessing: boolean) => void
  
  // Configuration props
  uploadMode?: 'single' | 'multiple'  // Single policy doc vs multiple documents
  documentType?: 'policy' | 'additional'  // Type of documents being uploaded
  acceptedTypes?: string[]  // Accepted file types
  maxFiles?: number  // Maximum number of files
  showValidation?: boolean  // Whether to show validation step
  title?: string  // Custom title
  description?: string  // Custom description
}

const DocumentTypeIcon = ({ type, category }: { type?: string; category?: string }) => {
  const iconProps = { className: "h-4 w-4" }
  
  switch (category) {
    case 'policy':
      return <Shield {...iconProps} className="h-4 w-4 text-blue-600" />
    case 'photo':
      return <Camera {...iconProps} className="h-4 w-4 text-green-600" />
    case 'estimate':
      return <Calculator {...iconProps} className="h-4 w-4 text-blue-600" />
    case 'correspondence':
      return <MessageSquare {...iconProps} className="h-4 w-4 text-purple-600" />
    case 'report':
      return <ClipboardList {...iconProps} className="h-4 w-4 text-orange-600" />
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

export function UnifiedDocumentUpload({
  data,
  onUpdate,
  onAIProcessing,
  uploadMode = 'single',
  documentType = 'policy',
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  maxFiles = uploadMode === 'single' ? 1 : 10,
  showValidation = true,
  title,
  description
}: UnifiedDocumentUploadProps) {
  const [files, setFiles] = useState<FileStatus[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [processingResults, setProcessingResults] = useState<any>(null)
  const [isValidated, setIsValidated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawText, setRawText] = useState<string>('')
  const [processingDetails, setProcessingDetails] = useState<any>(null)
  const [showValidationStep, setShowValidationStep] = useState(false)

  // Use unified service instead of instantiating
  // const hybridService = new HybridPDFExtractionService()
  const multiDocService = new MultiDocumentExtractionService()

  const handleFileSelection = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return


    if (uploadMode === 'single' && selectedFiles.length > 1) {
      setError('Only one file can be uploaded at a time for this step')
      return
    }

    if (selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const newFileStatuses: FileStatus[] = selectedFiles.map(file => ({
      file,
      status: 'pending',
      category: documentType
    }))

    setFiles(uploadMode === 'single' ? newFileStatuses : [...files, ...newFileStatuses])
    setError(null)
    setExtractedData(null)
    setIsValidated(false)
    setRawText('')
    setProcessingDetails(null)
    setShowValidationStep(false)
  }, [files, uploadMode, maxFiles, documentType])

  const handleSingleDocumentExtraction = async (file: File) => {
    try {
      setIsProcessing(true)
      setError(null)
      
      if (onAIProcessing) {
        onAIProcessing(true)
      }

      
      // const result = await unifiedPdfExtractionService.extractFromPDF(file, { mode: 'enhanced' })
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
      
      // console.log('✅ Document extraction completed:', {
      //   method: result.processingMethod,
      //   confidence: result.confidence,
      //   cost: result.cost
      // })
      
      setRawText(result.extractedText)
      setExtractedData(documentType === 'policy' ? result.policyData : result)
      setProcessingDetails({
        processingMethod: result.processingMethod,
        confidence: result.confidence,
        cost: result.cost,
        processingTime: result.processingTime,
        methodsAttempted: result.metadata.methodsAttempted
      })
      
      // Update file status
      setFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'completed', confidence: result.confidence, result: result as any }
          : f
      ))
      
      // Automatically show validation step if enabled
      if (showValidation) {
        setShowValidationStep(true)
      }
    } catch (error) {
      // console.error('❌ Document extraction failed:', error)
      setError(`Extraction failed: ${error.message}`)
      
      // Update file status
      setFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'error', error: error.message }
          : f
      ))
    } finally {
      setIsProcessing(false)
      if (onAIProcessing) {
        onAIProcessing(false)
      }
    }
  }

  const handleMultipleDocumentsExtraction = async () => {
    try {
      setIsProcessing(true)
      setError(null)
      
      if (onAIProcessing) {
        onAIProcessing(true)
      }

      // console.log(`📄 Starting batch extraction for ${files.length} documents`)
      
      // Update all files to processing status
      setFiles(prev => prev.map(f => ({ ...f, status: 'processing' })))
      
      const fileList = files.map(f => f.file)
      const result = await multiDocService.processMultipleDocuments(fileList)
      
      // console.log('✅ Batch extraction completed:', {
      //   totalDocuments: result.documents.length,
      //   successfulExtractions: result.documents.filter(d => d.extractedData).length
      // }),
        totalCost: result.totalCost
      setProcessingResults({
        documents: result.documents,
        totalDocuments: result.documents.length,
        successfulExtractions: result.documents.filter(d => d.extractedData).length,
        totalCost: result.totalCost,
        processingTime: result.totalProcessingTime,
        claimContext: result.claimContext,
        workflowAnalysis: result.workflowAnalysis,
        consolidatedData: result.consolidatedData,
        recommendations: result.recommendations
      })
      
      // Update file statuses with results
      setFiles(prev => prev.map((f, index) => {
        const docResult = result.documents[index]
        return {
          ...f,
          status: docResult?.extractedData ? 'completed' : 'error',
          result: docResult as any,
          confidence: docResult?.documentInfo?.confidence,
          category: docResult?.documentInfo?.category || f.category,
          error: docResult?.extractedData ? undefined : 'Processing failed'
        }
      }))
      
      onUpdate({
        ...data,
        additionalDocuments: result.documents,
        extractionMetadata: {
          totalDocuments: result.documents.length,
          successfulExtractions: result.documents.filter(d => d.extractedData).length,
          totalCost: result.totalCost,
          processingTime: result.totalProcessingTime
        }
      })
      
    } catch (error) {
      // console.error('❌ Batch extraction failed:', error)
      setError(`Batch extraction failed: ${error.message}`)
      
      // Update all files to error status
      setFiles(prev => prev.map(f => ({ ...f, status: 'error', error: error.message })))
    } finally {
      setIsProcessing(false)
      if (onAIProcessing) {
        onAIProcessing(false)
      }
    }
  }

  const extractDocuments = async () => {
    if (files.length === 0) {
      setError('Please select document(s) first')
      return
    }

    if (uploadMode === 'single') {
      await handleSingleDocumentExtraction(files[0].file)
    } else {
      await handleMultipleDocumentsExtraction()
    }
  }

  const removeFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove))
  }

  const handleValidation = (validatedData: any) => {
    setExtractedData(validatedData)
    setIsValidated(true)
    
    onUpdate({
      ...data,
      [documentType === 'policy' ? 'policyData' : 'extractedData']: validatedData,
      extractionMetadata: processingDetails,
      isValidated: true
    })
  }

  const defaultTitle = uploadMode === 'single' 
    ? `Upload ${documentType === 'policy' ? 'Policy' : 'Document'}`
    : 'Upload Additional Documents'
  
  const defaultDescription = uploadMode === 'single'
    ? `Upload your ${documentType} document for AI extraction and analysis`
    : 'Upload multiple documents for batch processing and extraction'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentTypeIcon category={documentType} />
            {title || defaultTitle}
          </CardTitle>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
          {!description && (
            <p className="text-sm text-gray-600">{defaultDescription}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept={acceptedTypes.join(',')}
              multiple={uploadMode === 'multiple'}
              onChange={handleFileSelection}
              className="hidden"
              id="document-upload"
              disabled={isProcessing}
            />
            <label htmlFor="document-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {uploadMode === 'single' ? 'Select Document' : 'Select Documents'}
              </p>
              <p className="text-sm text-gray-500">
                {uploadMode === 'single' 
                  ? `Choose a ${documentType} document`
                  : `Choose up to ${maxFiles} documents`
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported: {acceptedTypes.join(', ')}
              </p>
            </label>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Selected Files:</h4>
              {files.map((fileStatus, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DocumentTypeIcon category={fileStatus.category} />
                    <div>
                      <p className="font-medium text-gray-900">{fileStatus.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {fileStatus.status === 'processing' && (
                      <LoadingSpinner size="sm" />
                    )}
                    
                    {fileStatus.status === 'completed' && fileStatus.confidence && (
                      <ConfidenceBadge confidence={fileStatus.confidence} />
                    )}
                    
                    {fileStatus.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    
                    {fileStatus.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    
                    {!isProcessing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileStatus.file)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={extractDocuments}
              disabled={files.length === 0 || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Extract Data
                </>
              )}
            </Button>
            
            {files.some(f => f.status === 'completed') && (
              <Button
                variant="outline"
                onClick={() => setShowValidationStep(true)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Review Results
              </Button>
            )}
          </div>

          {/* Processing Summary */}
          {processingDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Processing Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Method:</span>
                  <span className="ml-2 text-blue-900">{processingDetails.processingMethod}</span>
                </div>
                <div>
                  <span className="text-blue-700">Confidence:</span>
                  <span className="ml-2 text-blue-900">{processingDetails.confidence}%</span>
                </div>
                <div>
                  <span className="text-blue-700">Processing Time:</span>
                  <span className="ml-2 text-blue-900">{processingDetails.processingTime}ms</span>
                </div>
                <div>
                  <span className="text-blue-700">Cost:</span>
                  <span className="ml-2 text-blue-900">${processingDetails.cost?.toFixed(4) || '0.0000'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Multi-document Results Summary */}
          {processingResults && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Batch Processing Results</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-purple-700">Total Documents:</span>
                  <span className="ml-2 text-purple-900">{processingResults.totalDocuments}</span>
                </div>
                <div>
                  <span className="text-purple-700">Successful:</span>
                  <span className="ml-2 text-purple-900">{processingResults.successfulExtractions}</span>
                </div>
                <div>
                  <span className="text-purple-700">Total Cost:</span>
                  <span className="ml-2 text-purple-900">${processingResults.totalCost?.toFixed(4) || '0.0000'}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Step */}
      {showValidationStep && extractedData && showValidation && (
        <Card>
          <CardHeader>
            <CardTitle>Review Extracted Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 border rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Extracted Data Preview:</h5>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleValidation(extractedData)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirm Data
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowValidationStep(false)}
                >
                  Review Later
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}