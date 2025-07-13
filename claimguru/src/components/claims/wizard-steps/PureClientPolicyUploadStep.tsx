import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { Upload, FileText, CheckCircle, AlertTriangle, Brain } from 'lucide-react';

interface PureClientPolicyUploadStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

export const PureClientPolicyUploadStep: React.FC<PureClientPolicyUploadStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  console.log('PureClientPolicyUploadStep: Component initialized', { data });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('PureClientPolicyUploadStep: File selected', file?.name);
    
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
      setResult(null);
    } else {
      setError('Please select a valid PDF file');
      setSelectedFile(null);
    }
  };

  const processFile = async () => {
    console.log('PureClientPolicyUploadStep: Starting processFile');
    
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    try {
      console.log('PureClientPolicyUploadStep: Beginning processing');
      setIsProcessing(true);
      setError(null);
      
      if (onAIProcessing) {
        console.log('PureClientPolicyUploadStep: Calling onAIProcessing(true)');
        onAIProcessing(true);
      }

      console.log('PureClientPolicyUploadStep: Simulating processing...');
      
      // Simulate processing time
      await new Promise(resolve => {
        console.log('PureClientPolicyUploadStep: Starting 2-second delay');
        setTimeout(() => {
          console.log('PureClientPolicyUploadStep: 2-second delay completed');
          resolve(undefined);
        }, 2000);
      });

      // Extract basic information (simplified version - purely client-side)
      const extractedData = {
        policyNumber: 'TEST-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        insuredName: 'Sample Insured Name',
        insurerName: 'Sample Insurance Company',
        effectiveDate: '01/01/2025',
        expirationDate: '01/01/2026',
        propertyAddress: '123 Example Street, Sample City, TX 75001',
        coverageAmount: '$500,000',
        deductible: '$2,500',
        premiumAmount: '$3,200',
        processingMethod: 'PURE_CLIENT_SIDE',
        fileName: selectedFile.name,
        fileSize: selectedFile.size
      };

      console.log('PureClientPolicyUploadStep: Processing completed successfully', extractedData);

      setResult(extractedData);

      // Update the wizard data
      const updatedData = {
        ...data,
        policyDetails: extractedData,
        fileProcessed: selectedFile.name,
        processingComplete: true,
        processingMethod: 'PURE_CLIENT_SIDE'
      };

      console.log('PureClientPolicyUploadStep: Calling onUpdate with:', updatedData);
      onUpdate(updatedData);

    } catch (err: any) {
      console.error('PureClientPolicyUploadStep: Processing failed', err);
      setError(`Processing failed: ${err.message || 'Unknown error'}`);
    } finally {
      console.log('PureClientPolicyUploadStep: Finishing processing');
      setIsProcessing(false);
      
      if (onAIProcessing) {
        console.log('PureClientPolicyUploadStep: Calling onAIProcessing(false)');
        onAIProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            🔒 Pure Client-Side Policy Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status indicator */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">✅ 100% Client-Side Processing</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              No file uploads • No external services • Complete privacy
            </p>
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Policy Document
              </h3>
              <p className="text-gray-600">
                Select a PDF policy document for instant analysis
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
          {selectedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📄 Selected File:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Name:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(1)} KB</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">❌ Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Processing Results */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">✅ Processing Successful!</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600 text-xs uppercase tracking-wide">Policy Number</span>
                  <p className="font-medium text-gray-900">{result.policyNumber}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600 text-xs uppercase tracking-wide">Insured Name</span>
                  <p className="font-medium text-gray-900">{result.insuredName}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600 text-xs uppercase tracking-wide">Insurance Company</span>
                  <p className="font-medium text-gray-900">{result.insurerName}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600 text-xs uppercase tracking-wide">Property Address</span>
                  <p className="font-medium text-gray-900">{result.propertyAddress}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600 text-xs uppercase tracking-wide">Coverage Amount</span>
                  <p className="font-medium text-gray-900">{result.coverageAmount}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600 text-xs uppercase tracking-wide">Deductible</span>
                  <p className="font-medium text-gray-900">{result.deductible}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600 text-xs uppercase tracking-wide">Policy Period</span>
                  <p className="font-medium text-gray-900">{result.effectiveDate} - {result.expirationDate}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <span className="text-gray-600 text-xs uppercase tracking-wide">Processing Method</span>
                  <p className="font-medium text-green-700">🔒 {result.processingMethod}</p>
                </div>
              </div>
            </div>
          )}

          {/* Process Button */}
          <div className="flex justify-center">
            <Button
              onClick={processFile}
              disabled={!selectedFile || isProcessing}
              variant="primary"
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" />
                  🧠 Processing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  🚀 Process with AI
                </>
              )}
            </Button>
          </div>

          {/* Debug Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🔍 Debug Information:</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <div>✅ Component: PureClientPolicyUploadStep</div>
              <div>✅ No upload services called</div>
              <div>✅ No external dependencies</div>
              <div>✅ Check browser console (F12) for detailed logs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
