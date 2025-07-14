/**
 * Simple PDF Test Step - Diagnostic Component
 * Basic PDF upload and processing test without external dependencies
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { FileText, Upload, CheckCircle, AlertCircle, Brain } from 'lucide-react';

interface SimplePDFTestStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

export const SimplePDFTestStep: React.FC<SimplePDFTestStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      console.log('File selected:', file.name, file.size, 'bytes');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const processWithSimpleAI = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      onAIProcessing?.(true);
      
      console.log('Starting simple AI processing...');
      
      // Step 1: File validation
      setProcessingStep('Validating file...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: Mock text extraction
      setProcessingStep('Extracting text from PDF...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: Mock AI analysis
      setProcessingStep('Analyzing document with AI...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock extracted data
      const mockPolicyData = {
        policyNumber: 'TEST-' + Math.floor(Math.random() * 100000),
        insuredName: 'John and Jane Smith',
        insurerName: 'Test Insurance Company',
        effectiveDate: '01/01/2025',
        expirationDate: '01/01/2026',
        propertyAddress: '123 Main Street, Test City, TX 75001',
        coverageAmount: '$350,000',
        deductible: '$1,000',
        processingMethod: 'Simple Mock AI',
        confidence: 95,
        processingTime: '3.2 seconds'
      };
      
      setResult(mockPolicyData);
      
      // Update wizard data
      onUpdate({
        ...data,
        policyDetails: mockPolicyData,
        extractedFromPDF: true,
        aiProcessed: true,
        originalFileName: selectedFile.name
      });
      
      setProcessingStep('Processing complete!');
      console.log('Simple AI processing completed successfully');
      
    } catch (error) {
      console.error('Processing failed:', error);
      setError(`Processing failed: ${error.message}`);
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
            <Brain className="h-5 w-5 text-purple-600" />
            Simple PDF Processing Test
          </CardTitle>
          <p className="text-sm text-gray-600">
            Basic PDF upload and AI processing (mock data for testing)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Upload PDF Document</h3>
              <p className="text-gray-600">Select a PDF file to test the processing</p>
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Selected File:</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Name:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(1)} KB</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
              </div>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <LoadingSpinner size="sm" />
                <div>
                  <h4 className="font-medium text-purple-900">AI Processing...</h4>
                  <p className="text-sm text-purple-700">{processingStep}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Processing Successful</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600">Policy Number:</span>
                  <p className="font-medium">{result.policyNumber}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600">Insured Name:</span>
                  <p className="font-medium">{result.insuredName}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600">Insurance Company:</span>
                  <p className="font-medium">{result.insurerName}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600">Property Address:</span>
                  <p className="font-medium">{result.propertyAddress}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600">Policy Period:</span>
                  <p className="font-medium">{result.effectiveDate} - {result.expirationDate}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600">Coverage Amount:</span>
                  <p className="font-medium">{result.coverageAmount}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={processWithSimpleAI}
              disabled={!selectedFile || isProcessing}
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
                  Process with Simple AI
                </>
              )}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
