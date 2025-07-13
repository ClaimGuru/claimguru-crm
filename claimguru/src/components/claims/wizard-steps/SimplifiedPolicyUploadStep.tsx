import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { FileText, Upload, CheckCircle, AlertCircle, Brain } from 'lucide-react';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { extractTextFromPdf, extractPolicyInfo } from '../../../services/simplifiedPdfService';

interface SimplifiedPolicyUploadStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

export const SimplifiedPolicyUploadStep: React.FC<SimplifiedPolicyUploadStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  // No initialization needed, service handles PDF.js setup

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log('File selected:', selectedFile.name, selectedFile.size, selectedFile.type);
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setProcessingStatus('');
    }
  };

  const extractPolicyData = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      // Reset states
      setIsProcessing(true);
      setError(null);
      setProcessingStatus('Uploading file...');
      
      // Notify parent component that processing started
      if (onAIProcessing) {
        onAIProcessing(true);
      }

      console.log('Starting PDF processing:', file.name);
      
      // Step 1: Basic client-side text extraction
      setProcessingStatus('Extracting text from PDF...');
      const extractionResult = await extractTextFromPdf(file);
      
      if (!extractionResult.success) {
        throw new Error(extractionResult.error || 'Failed to extract text from PDF');
      }
      
      // Step 2: Process the data and extract policy information
      setProcessingStatus('Analyzing policy data...');
      const policyData = extractPolicyInfo(extractionResult.extractedText);

      // Step 3: Set the result
      setResult(policyData);
      setProcessingStatus('Processing complete');
      
      // Step 4: Update the wizard data
      onUpdate({
        ...data,
        policyDetails: policyData,
        extractedPolicyData: true,
        fileProcessed: file.name
      });

      console.log('PDF processing completed successfully:', policyData);
      
    } catch (error) {
      console.error('PDF processing failed:', error);
      setError(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      
      // Notify parent component that processing ended
      if (onAIProcessing) {
        onAIProcessing(false);
      }
    }
  };

  // All extraction logic is now in the simplifiedPdfService

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Policy Document Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
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
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
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

          {/* Processing Status */}
          {isProcessing && processingStatus && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
              <LoadingSpinner size="sm" className="text-purple-600" />
              <div>
                <h4 className="font-medium text-purple-800">Processing...</h4>
                <p className="text-sm text-purple-700 mt-1">{processingStatus}</p>
              </div>
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

          {/* Results */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Extraction Successful</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Policy Number:</span>
                  <p className="font-medium">{result.policyNumber}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Insured Name:</span>
                  <p className="font-medium">{result.insuredName}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Insurance Company:</span>
                  <p className="font-medium">{result.insurerName}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Property Address:</span>
                  <p className="font-medium">{result.propertyAddress}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Effective Date:</span>
                  <p className="font-medium">{result.effectiveDate}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Expiration Date:</span>
                  <p className="font-medium">{result.expirationDate}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Coverage Amount:</span>
                  <p className="font-medium">{result.coverageAmount}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Deductible:</span>
                  <p className="font-medium">{result.deductible}</p>
                </div>
              </div>
              
              {/* Extracted Text Preview */}
              <div className="mt-4">
                <details className="text-sm">
                  <summary className="font-medium text-green-900 cursor-pointer">View Extracted Text</summary>
                  <div className="mt-2 p-3 bg-white rounded-lg max-h-32 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">{result.extractedText}</pre>
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* Process Button */}
          <div className="flex justify-center">
            <Button
              onClick={extractPolicyData}
              disabled={!file || isProcessing}
              variant="primary"
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
                  Process with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};