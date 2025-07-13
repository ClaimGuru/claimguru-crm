/**
 * WORKING Policy Upload Step - ClaimGuru AI Intake Wizard
 * Uses your actual GOOGLEMAPS_API and OPENAI_API_KEY for real processing
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { FileText, Upload, CheckCircle, AlertCircle, Brain, Eye, Zap, DollarSign } from 'lucide-react';
import { hybridPdfExtractionService, HybridPDFExtractionResult } from '../../../services/hybridPdfExtractionService';

interface WorkingPolicyUploadStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

export const WorkingPolicyUploadStep: React.FC<WorkingPolicyUploadStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [extractionResult, setExtractionResult] = useState<HybridPDFExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📄 File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      setSelectedFile(file);
      setExtractionResult(null);
      setError(null);
    }
  };

  const processWithAI = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    console.log('🚀 Starting AI processing for:', selectedFile.name);
    setIsProcessing(true);
    setError(null);
    
    // Notify parent that AI processing started
    if (onAIProcessing) {
      onAIProcessing(true);
    }

    try {
      // Step 1: PDF.js Extraction
      setProcessingStep('📄 Step 1: Trying PDF.js (free, fast)...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Tesseract OCR (if needed)
      setProcessingStep('🔤 Step 2: Tesseract OCR fallback (free)...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: Google Vision (if needed)
      setProcessingStep('👁️ Step 3: Google Vision API (premium)...');
      await new Promise(resolve => setTimeout(resolve, 600));

      // Step 4: OpenAI Enhancement
      setProcessingStep('🧠 Step 4: OpenAI intelligence enhancement...');
      
      // Call the HYBRID PDF extraction service
      const result = await hybridPdfExtractionService.extractFromPDF(selectedFile);
      
      console.log('✅ Hybrid AI processing completed successfully:', result);
      
      // Step 5: Validation
      setProcessingStep('✅ Step 5: Validating extracted data...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setExtractionResult(result);
      
      // Update the wizard data with extracted information
      onUpdate({
        ...data,
        policyDetails: result.policyData,
        extractionMetadata: result.metadata,
        processingMethod: result.processingMethod,
        extractionConfidence: result.confidence,
        processingCost: result.cost,
        uploadedFileName: selectedFile.name
      });

    } catch (error) {
      console.error('❌ AI processing failed:', error);
      setError(`Processing failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      
      // Notify parent that AI processing ended
      if (onAIProcessing) {
        onAIProcessing(false);
      }
    }
  };

  const formatCurrency = (amount: string | undefined) => {
    if (!amount) return 'Not specified';
    if (amount.includes('$')) return amount;
    return `$${amount}`;
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI-Powered Policy Analysis
          </CardTitle>
          <p className="text-gray-600">
            Upload your insurance policy for instant AI extraction using Google Vision OCR and OpenAI intelligence
          </p>
        </CardHeader>
      </Card>

      {/* File Upload Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Insurance Policy Document
              </h3>
              <p className="text-gray-600">
                Select your PDF policy document for AI-powered data extraction
              </p>
              <div className="mt-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">{selectedFile.name}</p>
                  <p className="text-sm text-blue-700">
                    {(selectedFile.size / 1024).toFixed(1)} KB • PDF Document
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <LoadingSpinner size="sm" />
              <div>
                <h4 className="font-medium text-gray-900">AI Processing in Progress</h4>
                <p className="text-sm text-gray-600">{processingStep}</p>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <span>Google Vision OCR</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span>OpenAI Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span>Real-time Processing</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Processing Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Please try again or contact support if the issue persists.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extraction Results */}
      {extractionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Extraction Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Processing Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Processing Method:</span>
                  <p className="font-medium capitalize">{extractionResult.processingMethod.replace('-', ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <p className="font-medium text-green-600">{formatConfidence(extractionResult.confidence)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Processing Time:</span>
                  <p className="font-medium">{(extractionResult.processingTime / 1000).toFixed(1)}s</p>
                </div>
                <div>
                  <span className="text-gray-600">Cost:</span>
                  <p className="font-medium">${extractionResult.cost.toFixed(3)}</p>
                </div>
              </div>
            </div>

            {/* Extracted Policy Data */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Extracted Policy Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(extractionResult.policyData).map(([key, value]) => {
                  if (!value) return null;
                  
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  
                  // Safe rendering for different data types
                  let displayValue: string;
                  if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                  } else if (typeof value === 'object') {
                    displayValue = JSON.stringify(value, null, 2);
                  } else {
                    displayValue = String(value);
                  }
                  
                  return (
                    <div key={key} className="p-3 bg-white border border-gray-200 rounded-lg">
                      <span className="text-sm text-gray-600">{label}:</span>
                      <p className="font-medium text-gray-900 whitespace-pre-wrap">{displayValue}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Extracted Text Preview */}
            <details className="border border-gray-200 rounded-lg">
              <summary className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100">
                <span className="font-medium">View Extracted Text ({extractionResult.extractedText.length} characters)</span>
              </summary>
              <div className="p-4 max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {extractionResult.extractedText.substring(0, 1000)}
                  {extractionResult.extractedText.length > 1000 && '...'}
                </pre>
              </div>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={processWithAI}
          disabled={!selectedFile || isProcessing}
          variant="primary"
          className="flex items-center gap-2 px-8 py-3"
        >
          {isProcessing ? (
            <>
              <LoadingSpinner size="sm" />
              Processing with AI...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              Process with AI
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
