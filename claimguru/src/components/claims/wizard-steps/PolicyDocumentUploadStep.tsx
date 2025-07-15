import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { FileText, Upload, CheckCircle, AlertCircle, Brain, Eye, Clock, Check, X, Shield } from 'lucide-react';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { HybridPDFExtractionService } from '../../../services/hybridPdfExtractionService';
import { PolicyDataValidationStep } from './PolicyDataValidationStep';

interface PolicyDocumentUploadStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

export const PolicyDocumentUploadStep: React.FC<PolicyDocumentUploadStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [processingDetails, setProcessingDetails] = useState<any>(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log('Policy file selected:', selectedFile.name);
      setFile(selectedFile);
      setError(null);
      setExtractedData(null);
      setIsValidated(false);
      setRawText('');
      setProcessingDetails(null);
      setShowValidation(false);
    }
  };

  const extractPolicyData = async () => {
    if (!file) {
      setError("Please select a policy document first");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      if (onAIProcessing) {
        onAIProcessing(true);
      }

      console.log('🏛️ Starting policy extraction for:', file.name);
      
      const hybridService = new HybridPDFExtractionService();
      const result = await hybridService.extractFromPDF(file);
      
      console.log('✅ Policy extraction completed:', {
        method: result.processingMethod,
        confidence: result.confidence,
        cost: result.cost
      });
      
      setRawText(result.extractedText);
      setExtractedData(result.policyData);
      setProcessingDetails({
        processingMethod: result.processingMethod,
        confidence: result.confidence,
        cost: result.cost,
        processingTime: result.processingTime,
        methodsAttempted: result.metadata.methodsAttempted
      });
      
      // Automatically show validation step
      setShowValidation(true);
      
    } catch (error) {
      console.error('❌ Policy extraction failed:', error);
      setError(`Extraction failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      if (onAIProcessing) {
        onAIProcessing(false);
      }
    }
  };

  const handleValidationComplete = (validatedPolicyData: any) => {
    console.log('✅ Policy data validated and confirmed:', validatedPolicyData);
    
    // Update wizard data with validated policy information
    onUpdate({
      ...data,
      policyDetails: {
        ...validatedPolicyData,
        aiExtracted: true,
        validationComplete: true,
        extractedAt: new Date().toISOString()
      },
      extractedPolicyData: {
        validated: true,
        confidence: processingDetails?.confidence || 0,
        source: 'ai_extraction',
        extractedAt: new Date().toISOString()
      },
      // Pre-populate client details from policy
      insuredDetails: {
        ...data.insuredDetails,
        firstName: validatedPolicyData.insuredName?.split(' ')[0] || data.insuredDetails?.firstName,
        lastName: validatedPolicyData.insuredName?.split(' ').slice(1).join(' ') || data.insuredDetails?.lastName,
        aiSuggested: true,
        confidenceScore: processingDetails?.confidence || 0
      },
      // Pre-populate address from policy
      mailingAddress: {
        ...data.mailingAddress,
        address: validatedPolicyData.propertyAddress || data.mailingAddress?.address,
        aiSuggested: true
      },
      // Pre-populate insurance carrier
      insuranceCarrier: {
        ...data.insuranceCarrier,
        name: validatedPolicyData.insurerName || data.insuranceCarrier?.name,
        aiSuggested: true
      },
      fileProcessed: file?.name,
      rawExtractedText: rawText,
      processingDetails: processingDetails
    });
    
    setIsValidated(true);
    setShowValidation(false);
    
    // Show success message
    setTimeout(() => {
      alert('✅ Policy data validated and confirmed! The extracted information will be used to pre-fill the upcoming forms. Click "Next" to proceed to additional documents.');
    }, 500);
  };

  const handleValidationReject = () => {
    console.log('❌ User rejected policy data, resetting');
    setFile(null);
    setExtractedData(null);
    setShowValidation(false);
    setIsValidated(false);
    setRawText('');
    setProcessingDetails(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Policy & Declaration Page Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Step 1: Policy Intelligence</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Upload your insurance policy or declaration page. Our AI will extract key information and pre-fill the entire wizard for you.
            </p>
            <ul className="text-blue-600 text-xs mt-2 space-y-1 ml-4">
              <li>• Supports: Policy documents, declaration pages, insurance certificates</li>
              <li>• AI will extract: Policy details, insured information, coverage amounts, dates</li>
              <li>• You'll review and confirm all extracted data before proceeding</li>
            </ul>
          </div>

          {/* Enhanced File Upload Area */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer select-none group"
            onClick={() => document.getElementById('policy-file-input')?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.getElementById('policy-file-input')?.click();
              }
            }}
            aria-label="Click to upload policy document"
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4 transition-colors group-hover:text-blue-500" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Click to Upload Policy Document
              </h3>
              <p className="text-gray-600">
                Select your insurance policy or declaration page (PDF format)
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors group-hover:bg-blue-200">
                <FileText className="h-4 w-4" />
                Choose Policy File
              </div>
            </div>
            <input
              id="policy-file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Policy Document Selected
              </h4>
              <div className="text-sm text-green-800">
                <p><strong>Name:</strong> {file.name}</p>
                <p><strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB</p>
                <p><strong>Type:</strong> {file.type}</p>
              </div>
            </div>
          )}

          {/* Processing Button */}
          {file && !isValidated && !showValidation && (
            <div className="flex justify-center">
              <Button
                onClick={extractPolicyData}
                disabled={isProcessing}
                variant="primary"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Extracting Policy Data...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Extract Policy Data with AI
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Processing Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Processing Details */}
          {processingDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">AI Processing Results:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Method:</strong> {processingDetails.processingMethod}</p>
                <p><strong>Confidence:</strong> {Math.round(processingDetails.confidence * 100)}%</p>
                <p><strong>Processing Time:</strong> {processingDetails.processingTime}ms</p>
                <p><strong>Cost:</strong> ${processingDetails.cost.toFixed(3)}</p>
              </div>
            </div>
          )}

          {/* Policy Data Validation */}
          {showValidation && extractedData && rawText && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Review & Validate Extracted Policy Data
                </h4>
                <p className="text-yellow-800 text-sm">
                  Please review the AI-extracted policy information below. This data will be used to pre-fill the entire wizard.
                </p>
              </div>
              
              <PolicyDataValidationStep
                extractedData={extractedData}
                rawText={rawText}
                onValidated={handleValidationComplete}
                onReject={handleValidationReject}
              />
            </div>
          )}

          {/* Success Confirmation */}
          {isValidated && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-800 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Policy Data Successfully Validated!</span>
              </div>
              <p className="text-green-700 text-sm">
                Your policy information has been extracted and validated. This data will automatically pre-fill the wizard forms to save you time.
              </p>
              <div className="mt-3 text-xs text-green-600">
                ✓ Client details will be pre-populated<br/>
                ✓ Insurance information will be pre-filled<br/>
                ✓ Property address will be suggested<br/>
                ✓ Coverage details will be available
              </div>
            </div>
          )}

          {/* Raw Text Preview (for debugging) */}
          {rawText && (
            <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-gray-700">
                View Raw Extracted Text ({rawText.length} characters)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 bg-white p-3 rounded border max-h-40 overflow-y-auto whitespace-pre-wrap">
                {rawText.substring(0, 1000)}...
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};