import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Brain, 
  Eye, 
  Shield, 
  Cloud, 
  Database, 
  DollarSign, 
  Zap, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { documentUploadService } from '../../../services/documentUploadService';
import { advancedPdfExtractionService, PDFExtractionResult } from '../../../services/advancedPdfExtractionService';
import { EnhancedPolicyValidationStep } from './EnhancedPolicyValidationStep';

interface AdvancedPolicyUploadStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

export const AdvancedPolicyUploadStep: React.FC<AdvancedPolicyUploadStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'full_policy' | 'dec_page'>('dec_page');
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<any | null>(null);
  const [extractionResult, setExtractionResult] = useState<PDFExtractionResult | null>(null);
  const [processingStep, setProcessingStep] = useState<'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'failed'>('idle');
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [extractionOptions, setExtractionOptions] = useState({
    useTextract: true,
    useTesseract: true,
    forcePremiumProcessing: false,
    confidenceThreshold: 0.75
  });
  
  // Handle file upload via file input
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      setUploadedFile(file);
      setUploadedDocument(null);
      setExtractionResult(null);
      setExtractionError(null);
      setProcessingStep('idle');
      setShowValidation(false);
    }
  }, []);
  
  // Handle file upload via drag and drop
  const handleFileDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      console.log('File dropped:', file.name, 'Size:', file.size, 'Type:', file.type);
      setUploadedFile(file);
      setUploadedDocument(null);
      setExtractionResult(null);
      setExtractionError(null);
      setProcessingStep('idle');
      setShowValidation(false);
    }
  }, []);
  
  // Handle drag over
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);
  
  // Extract policy data
  const extractPolicyData = async () => {
    if (!uploadedFile) {
      setExtractionError('Please select a file first');
      return;
    }
    
    console.log('Starting PDF extraction process...');
    
    setProcessingStep('uploading');
    setIsUploading(true);
    setExtractionError(null);
    if (onAIProcessing) onAIProcessing(true);
    
    try {
      // First, try to upload the document to storage
      // This is optional but useful for document management
      let document = null;
      try {
        document = await documentUploadService.uploadDocument(uploadedFile, 'policy');
        setUploadedDocument(document);
      } catch (uploadError) {
        console.warn('Document upload failed, continuing with local extraction:', uploadError);
        // Continue with local extraction - this is a graceful fallback
      }
      
      setProcessingStep('processing');
      setIsUploading(false);
      setIsExtracting(true);
      
      // Get organization ID from data
      const organizationId = data.organizationId || 'default-org-id';
      
      console.log('Extracting PDF with advanced multi-engine extraction service');
      
      // Use advanced PDF extraction service with specified options
      const extractionResult = await advancedPdfExtractionService.extractFromPDF(
        uploadedFile,
        organizationId,
        extractionOptions
      );
      
      console.log('Extraction complete:', extractionResult);
      
      // Set extraction result
      setExtractionResult(extractionResult);
      
      // Update wizard data with extracted policy data
      onUpdate({
        ...data,
        policyDetails: extractionResult.policyData,
        extractedPolicyData: true,
        fileProcessed: uploadedFile.name,
        processingMethod: extractionResult.processingMethod,
        processingConfidence: extractionResult.confidence,
        processingTime: extractionResult.processingTime,
        pageCount: extractionResult.pageCount,
        cost: extractionResult.cost,
        validationResults: extractionResult.validationResults
      });
      
      setProcessingStep('complete');
      setShowValidation(true);
    } catch (error) {
      console.error('PDF extraction failed:', error);
      setExtractionError(`Extraction failed: ${error.message}`);
      setProcessingStep('failed');
      
      // Try fallback to client-side processing if server processing failed
      try {
        console.log('Attempting fallback to client-side processing...');
        
        // Force client-side only processing
        const fallbackOptions = {
          useTextract: false,
          useTesseract: false,
          forcePremiumProcessing: false
        };
        
        const organizationId = data.organizationId || 'default-org-id';
        const fallbackResult = await advancedPdfExtractionService.extractFromPDF(
          uploadedFile,
          organizationId,
          fallbackOptions
        );
        
        if (fallbackResult && Object.keys(fallbackResult.policyData).length > 0) {
          console.log('Fallback extraction succeeded:', fallbackResult);
          setExtractionResult(fallbackResult);
          setProcessingStep('complete');
          
          // Update wizard data with fallback extraction result
          onUpdate({
            ...data,
            policyDetails: fallbackResult.policyData,
            extractedPolicyData: true,
            fileProcessed: uploadedFile.name,
            processingMethod: 'fallback',
            processingConfidence: fallbackResult.confidence,
            processingTime: fallbackResult.processingTime
          });
          
          setShowValidation(true);
          setExtractionError('Primary extraction failed, using fallback extraction');
        }
      } catch (fallbackError) {
        console.error('Fallback extraction also failed:', fallbackError);
        // Both primary and fallback extraction failed
        setExtractionError(`All extraction methods failed. Please try a different file or enter data manually.`);
      }
    } finally {
      setIsExtracting(false);
      if (onAIProcessing) onAIProcessing(false);
    }
  };
  
  // Handle extract again with different options
  const handleExtractAgain = () => {
    setShowValidation(false);
    setExtractionResult(null);
    setProcessingStep('idle');
    setExtractionError(null);
  };
  
  // Handle extraction option changes
  const handleOptionChange = (option: keyof typeof extractionOptions, value: any) => {
    setExtractionOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };
  
  // Handle validation completion
  const handleValidationComplete = (validatedData: any) => {
    onUpdate(validatedData);
  };
  
  // If showing validation step, render that instead
  if (showValidation && extractionResult) {
    return (
      <EnhancedPolicyValidationStep
        data={{
          ...data,
          policyDetails: extractionResult.policyData,
          processingMethod: extractionResult.processingMethod,
          confidence: extractionResult.confidence,
          processingTime: extractionResult.processingTime,
          pageCount: extractionResult.pageCount,
          cost: extractionResult.cost,
          fileProcessed: uploadedFile?.name,
          validationResults: extractionResult.validationResults
        }}
        onUpdate={handleValidationComplete}
        onPrevStep={handleExtractAgain}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            AI Policy Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Upload Area */}
          <div 
            className={`border-2 border-dashed ${processingStep === 'idle' ? 'border-gray-300 hover:border-gray-400' : 'border-gray-300'} rounded-lg p-8 text-center transition-colors ${processingStep === 'idle' ? 'cursor-pointer' : ''}`}
            onClick={() => processingStep === 'idle' && document.getElementById('file-upload')?.click()}
            onDragOver={handleDragOver}
            onDrop={handleFileDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Insurance Policy
              </h3>
              <p className="text-gray-600">
                Upload your policy document (PDF) for AI-powered extraction
              </p>
              <div className="mt-4">
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 ${processingStep !== 'idle' ? 'hidden' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Selected File Info */}
          {uploadedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Selected File:</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Name:</strong> {uploadedFile.name}</p>
                <p><strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(1)} KB</p>
                <p><strong>Type:</strong> {uploadedFile.type}</p>
              </div>
              
              {/* Processing Options */}
              {processingStep === 'idle' && (
                <div className="mt-3 border-t border-blue-200 pt-3">
                  <h4 className="font-medium text-blue-900 mb-2">Processing Options:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="useTextract"
                        checked={extractionOptions.useTextract}
                        onChange={e => handleOptionChange('useTextract', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="useTextract" className="text-sm text-blue-800">
                        Use Textract (premium)
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="useTesseract"
                        checked={extractionOptions.useTesseract}
                        onChange={e => handleOptionChange('useTesseract', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="useTesseract" className="text-sm text-blue-800">
                        Use Tesseract OCR
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="forcePremium"
                        checked={extractionOptions.forcePremiumProcessing}
                        onChange={e => handleOptionChange('forcePremiumProcessing', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="forcePremium" className="text-sm text-blue-800">
                        Force Premium Processing
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                  ) : processingStep === 'processing' || processingStep === 'analyzing' || processingStep === 'complete' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border border-gray-300 rounded-full" />
                  )}
                  <span className={`text-sm ${processingStep === 'uploading' ? 'text-blue-600 font-medium' : processingStep === 'processing' || processingStep === 'analyzing' || processingStep === 'complete' ? 'text-green-600' : 'text-gray-500'}`}>
                    Upload document to secure storage
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {processingStep === 'processing' ? (
                    <LoadingSpinner size="sm" />
                  ) : processingStep === 'analyzing' || processingStep === 'complete' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border border-gray-300 rounded-full" />
                  )}
                  <span className={`text-sm ${processingStep === 'processing' ? 'text-blue-600 font-medium' : processingStep === 'analyzing' || processingStep === 'complete' ? 'text-green-600' : 'text-gray-500'}`}>
                    Extract document text and structure with PDF.js
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {processingStep === 'analyzing' ? (
                    <LoadingSpinner size="sm" />
                  ) : processingStep === 'complete' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border border-gray-300 rounded-full" />
                  )}
                  <span className={`text-sm ${processingStep === 'analyzing' ? 'text-blue-600 font-medium' : processingStep === 'complete' ? 'text-green-600' : 'text-gray-500'}`}>
                    AI analysis of policy data
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-blue-700">
                <p>Processing large files may take a moment. Please don't refresh the page.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {extractionError && (
            <div className="border rounded-lg p-4 bg-red-50">
              <h3 className="font-semibold flex items-center gap-2 mb-3 text-red-700">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Processing Error
              </h3>
              <p className="text-red-600">{extractionError}</p>
              <div className="mt-3 text-sm text-red-800">
                <p>You can try:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Using a different PDF file</li>
                  <li>Changing the processing options</li>
                  <li>Processing with client-side extraction only</li>
                </ul>
              </div>
            </div>
          )}

          {/* Process Button */}
          <div className="flex justify-center">
            <Button
              onClick={extractPolicyData}
              disabled={!uploadedFile || isUploading || isExtracting}
              variant="primary"
              className="flex items-center gap-2"
            >
              {isUploading || isExtracting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Process with AI
                </>
              )}
            </Button>
          </div>
          
          {/* Enhanced Features Info */}
          {processingStep === 'idle' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                <div className="p-2 bg-purple-100 rounded-full mb-3">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Multi-Engine Extraction</h3>
                <p className="text-sm text-gray-600">Combines PDF.js, Tesseract OCR, and AWS Textract for maximum accuracy.</p>
              </div>
              <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                <div className="p-2 bg-blue-100 rounded-full mb-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Enhanced Validation</h3>
                <p className="text-sm text-gray-600">Advanced validation with AI confidence scoring and alternatives.</p>
              </div>
              <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                <div className="p-2 bg-green-100 rounded-full mb-3">
                  <Cloud className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Intelligent Fallbacks</h3>
                <p className="text-sm text-gray-600">Graceful fallback options ensure data extraction even with poor quality documents.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};