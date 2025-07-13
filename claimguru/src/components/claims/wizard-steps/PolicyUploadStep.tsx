/**
 * SINGLE POLICY UPLOAD STEP - ClaimGuru
 * 
 * This is the ONLY policy upload component in the system.
 * Clean, simple, and working.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { pdfExtractionService, PDFExtractionResult } from '../../../services/pdfExtractionService';

interface PolicyUploadStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

export const PolicyUploadStep: React.FC<PolicyUploadStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PDFExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please select a PDF file');
    }
  };

  const processPolicy = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    onAIProcessing?.(true);

    try {
      console.log('Processing policy document:', file.name);
      
      const extractionResult = await pdfExtractionService.extractFromPDF(file);
      setResult(extractionResult);
      
      // Update wizard data
      onUpdate({
        ...data,
        policyDetails: extractionResult.policyData,
        policyProcessed: true,
        extractionResult
      });

      console.log('Policy processing completed successfully');
      
    } catch (error) {
      console.error('Policy processing failed:', error);
      setError(error.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
      onAIProcessing?.(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Policy Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Insurance Policy
              </h3>
              <p className="text-gray-600">
                Select your policy document (PDF) for automated data extraction
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
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Extraction Successful</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {Object.entries(result.policyData).map(([key, value]) => (
                  value && (
                    <div key={key} className="p-2 bg-white rounded-lg">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <p className="font-medium">{value}</p>
                    </div>
                  )
                ))}
              </div>
              <div className="mt-3 text-xs text-green-700">
                Confidence: {Math.round(result.confidence * 100)}% | 
                Method: {result.processingMethod} | 
                Cost: ${result.cost.toFixed(2)}
              </div>
            </div>
          )}

          {/* Process Button */}
          <div className="flex justify-center">
            <Button
              onClick={processPolicy}
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
                  <FileText className="h-4 w-4" />
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
