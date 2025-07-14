import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { FileText, Upload, CheckCircle, AlertCircle, Brain, Eye, Clock, Check, X } from 'lucide-react';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { HybridPDFExtractionService } from '../../../services/hybridPdfExtractionService';

interface FixedRealPDFExtractionStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

export const FixedRealPDFExtractionStep: React.FC<FixedRealPDFExtractionStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [processingDetails, setProcessingDetails] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log('File selected for REAL extraction:', selectedFile.name);
      setFile(selectedFile);
      setError(null);
      setExtractedData(null);
      setIsConfirmed(false);
      setRawText('');
      setProcessingDetails(null);
    }
  };

  const extractRealPolicyData = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      if (onAIProcessing) {
        onAIProcessing(true);
      }

      console.log('🚀 Starting HYBRID PDF extraction for:', file.name);
      
      // Use the HybridPDFExtractionService for real extraction
      const hybridService = new HybridPDFExtractionService();
      const result = await hybridService.extractFromPDF(file);
      
      console.log('✅ Hybrid extraction completed:', {
        method: result.processingMethod,
        confidence: result.confidence,
        cost: result.cost,
        textLength: result.extractedText.length
      });
      
      // Set the results
      setRawText(result.extractedText);
      setExtractedData(result.policyData);
      setProcessingDetails({
        processingMethod: result.processingMethod,
        confidence: result.confidence,
        cost: result.cost,
        processingTime: result.processingTime,
        methodsAttempted: result.metadata.methodsAttempted
      });
      
    } catch (error) {
      console.error('❌ Hybrid PDF extraction failed:', error);
      setError(`Extraction failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      if (onAIProcessing) {
        onAIProcessing(false);
      }
    }
  };

  const confirmAndSaveData = () => {
    if (!extractedData) return;
    
    console.log('User confirmed real extracted data:', extractedData);
    
    // Create unique claim identifier
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    onUpdate({
      ...data,
      claimId: claimId,
      policyDetails: extractedData,
      extractedPolicyData: true,
      fileProcessed: file?.name,
      dataConfirmed: true,
      confirmationTimestamp: new Date().toISOString(),
      processingComplete: true,
      rawExtractedText: rawText,
      processingDetails: processingDetails
    });
    
    setIsConfirmed(true);
  };

  const rejectAndRetry = () => {
    console.log('User rejected extracted data, clearing for retry');
    setExtractedData(null);
    setRawText('');
    setIsConfirmed(false);
    setProcessingDetails(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-600" />
            HYBRID PDF Data Extraction - Advanced AI Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Real Processing Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">HYBRID Multi-Tier Processing System Active</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Uses PDF.js → Tesseract OCR → Google Vision → OpenAI Enhancement for maximum accuracy
            </p>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Insurance Policy Document
              </h3>
              <p className="text-gray-600">
                Upload your PDF for intelligent multi-tier extraction and analysis
              </p>
              <div className="mt-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
            </div>
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Selected File:</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Name:</strong> {file.name}</p>
                <p><strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB</p>
                <p><strong>Type:</strong> {file.type}</p>
              </div>
            </div>
          )}

          {/* Processing Button */}
          {file && !isConfirmed && (
            <div className="flex justify-center">
              <Button
                onClick={extractRealPolicyData}
                disabled={isProcessing}
                variant="primary"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Process with Hybrid AI
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
              <h4 className="font-medium text-blue-900 mb-2">Processing Details:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Method:</strong> {processingDetails.processingMethod}</p>
                <p><strong>Confidence:</strong> {Math.round(processingDetails.confidence * 100)}%</p>
                <p><strong>Cost:</strong> ${processingDetails.cost.toFixed(3)}</p>
                <p><strong>Time:</strong> {processingDetails.processingTime}ms</p>
                <p><strong>Methods Tried:</strong> {processingDetails.methodsAttempted?.join(', ')}</p>
              </div>
            </div>
          )}

          {/* Extracted Data Results */}
          {extractedData && !isConfirmed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Extraction Successful - Please Review</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {extractedData.policyNumber && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600 text-sm">Policy Number:</span>
                    <p className="font-medium text-green-800">{extractedData.policyNumber}</p>
                  </div>
                )}
                {extractedData.insuredName && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600 text-sm">Insured Name:</span>
                    <p className="font-medium text-green-800">{extractedData.insuredName}</p>
                  </div>
                )}
                {extractedData.insurerName && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600 text-sm">Insurance Company:</span>
                    <p className="font-medium text-green-800">{extractedData.insurerName}</p>
                  </div>
                )}
                {extractedData.propertyAddress && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600 text-sm">Property Address:</span>
                    <p className="font-medium text-green-800">{extractedData.propertyAddress}</p>
                  </div>
                )}
                {extractedData.effectiveDate && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600 text-sm">Effective Date:</span>
                    <p className="font-medium text-green-800">{extractedData.effectiveDate}</p>
                  </div>
                )}
                {extractedData.coverageAmount && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600 text-sm">Coverage Amount:</span>
                    <p className="font-medium text-green-800">{extractedData.coverageAmount}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={confirmAndSaveData}
                  variant="primary"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                  Confirm & Continue
                </Button>
                <Button
                  onClick={rejectAndRetry}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Reject & Retry
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          {isConfirmed && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-800 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Data Confirmed Successfully!</span>
              </div>
              <p className="text-green-700 text-sm">
                Policy data has been extracted and confirmed. You can now proceed to the next step.
              </p>
            </div>
          )}

          {/* Raw Text Preview */}
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
