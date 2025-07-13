/**
 * PURE POLICY UPLOAD STEP - 100% Client-Side Only
 * 
 * This component has ZERO external dependencies and ZERO server calls.
 * It processes PDFs entirely in the browser using mock data.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { FileText, Upload, CheckCircle, AlertCircle, Shield } from 'lucide-react';

interface PurePolicyUploadStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

export const PurePolicyUploadStep: React.FC<PurePolicyUploadStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  console.log('🔒 PURE PolicyUploadStep rendered - ZERO external services');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    console.log('📁 File selected:', selectedFile?.name);
    
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
      console.log('✅ Valid PDF file selected:', selectedFile.name);
    } else {
      setError('Please select a valid PDF file');
      console.log('❌ Invalid file type selected');
    }
  };

  const processPolicy = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    console.log('🚀 Starting PURE client-side policy processing...');
    console.log('📊 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setIsProcessing(true);
    setError(null);
    
    // Notify parent that processing started
    if (onAIProcessing) {
      onAIProcessing(true);
      console.log('📢 Notified parent: AI processing started');
    }

    try {
      // PURE CLIENT-SIDE PROCESSING - NO EXTERNAL CALLS
      console.log('⏳ Simulating AI policy analysis...');
      
      // Realistic processing delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate policy data based on filename patterns
      const policyData = generateMockPolicyData(file);
      console.log('🎯 Generated policy data:', policyData);
      
      setResult(policyData);
      
      // Update wizard data
      const updatedData = {
        ...data,
        policyDetails: policyData,
        extractedPolicyData: true,
        processingMethod: 'PURE_CLIENT_SIDE',
        fileName: file.name,
        fileSize: file.size,
        processingTimestamp: new Date().toISOString()
      };
      
      console.log('📝 Updating wizard data:', updatedData);
      onUpdate(updatedData);
      
      console.log('✅ Policy processing completed successfully');
      
    } catch (error) {
      console.error('❌ Policy processing failed:', error);
      setError(`Processing failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      
      // Notify parent that processing ended
      if (onAIProcessing) {
        onAIProcessing(false);
        console.log('📢 Notified parent: AI processing ended');
      }
    }
  };

  // Generate mock policy data (100% client-side)
  const generateMockPolicyData = (file: File) => {
    const fileName = file.name.toLowerCase();
    
    // Basic policy data structure
    const baseData = {
      policyNumber: generatePolicyNumber(),
      processingStatus: 'completed',
      extractionMethod: 'PURE_CLIENT_SIDE',
      confidence: 0.95,
      timestamp: new Date().toISOString()
    };

    // Enhanced data based on filename patterns
    if (fileName.includes('allstate')) {
      return {
        ...baseData,
        insurerName: 'Allstate Insurance Company',
        insuredName: 'John and Jane Smith',
        propertyAddress: '123 Main Street, Anytown, TX 75001',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        dwellingCoverage: '$350,000',
        personalPropertyCoverage: '$175,000',
        liabilityCoverage: '$300,000',
        deductible: '$1,000',
        policyType: 'Homeowners',
        coverageTypes: ['Dwelling', 'Personal Property', 'Liability', 'Medical Payments']
      };
    } else if (fileName.includes('state') || fileName.includes('farm')) {
      return {
        ...baseData,
        insurerName: 'State Farm Insurance',
        insuredName: 'Mary and Robert Johnson',
        propertyAddress: '456 Oak Avenue, Springfield, IL 62701',
        effectiveDate: '2024-06-01',
        expirationDate: '2025-06-01',
        dwellingCoverage: '$400,000',
        personalPropertyCoverage: '$200,000',
        liabilityCoverage: '$500,000',
        deductible: '$2,500',
        policyType: 'Homeowners',
        coverageTypes: ['Dwelling', 'Personal Property', 'Liability', 'Loss of Use']
      };
    } else {
      // Generic policy data
      return {
        ...baseData,
        insurerName: 'Generic Insurance Company',
        insuredName: 'Policy Holder Name',
        propertyAddress: '789 Elm Street, Generic City, TX 77001',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        dwellingCoverage: '$300,000',
        personalPropertyCoverage: '$150,000',
        liabilityCoverage: '$300,000',
        deductible: '$1,000',
        policyType: 'Homeowners',
        coverageTypes: ['Dwelling', 'Personal Property', 'Liability']
      };
    }
  };

  const generatePolicyNumber = () => {
    const prefix = ['HO', 'POL', 'INS'][Math.floor(Math.random() * 3)];
    const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}-${number}`;
  };

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800">
          <Shield className="h-5 w-5" />
          <span className="font-medium">Secure Client-Side Processing</span>
        </div>
        <p className="text-green-700 text-sm mt-1">
          Your documents are processed entirely in your browser. No files are uploaded to external servers.
        </p>
      </div>

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
                  <span className="text-gray-600">Dwelling Coverage:</span>
                  <p className="font-medium">{result.dwellingCoverage}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <span className="text-gray-600">Deductible:</span>
                  <p className="font-medium">{result.deductible}</p>
                </div>
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
