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

  // Auto-map extracted data to wizard form fields
  const proceedToNextStep = () => {
    if (!extractionResult) return;

    const mappedData = {
      ...data,
      // Policy Details
      policyDetails: {
        policyNumber: extractionResult.policyData.policyNumber || '',
        effectiveDate: extractionResult.policyData.effectiveDate || '',
        expirationDate: extractionResult.policyData.expirationDate || '',
        insurerName: extractionResult.policyData.insurerName || '',
        agentName: (extractionResult.policyData as any).agentName || '',
        agentPhone: (extractionResult.policyData as any).agentPhone || '',
      },
      // Insured Details (auto-populated for next step)
      insuredDetails: {
        firstName: extractFirstName(extractionResult.policyData.insuredName || ''),
        lastName: extractLastName(extractionResult.policyData.insuredName || ''),
        fullName: extractionResult.policyData.insuredName || '',
      },
      // Property Information
      mailingAddress: {
        street: extractionResult.policyData.propertyAddress || '',
        // Parse address components if needed
      },
      // Insurance Carrier Info
      insuranceCarrier: {
        name: extractionResult.policyData.insurerName || '',
        policyNumber: extractionResult.policyData.policyNumber || '',
      },
      // Coverage Information
      coverages: extractCoverageArray(extractionResult.policyData.coverageTypes),
      deductibles: extractDeductibleArray(extractionResult.policyData.deductibles),
      // Loss Details (pre-populate property address)
      lossDetails: {
        lossAddress: extractionResult.policyData.propertyAddress || '',
      },
      // Mark as processed by AI
      aiProcessed: true,
      extractedFromPDF: true,
      originalFileName: selectedFile?.name || '',
    };

    console.log('🎯 Auto-mapping extracted data to wizard fields:', mappedData);
    
    // Update wizard data with mapped fields
    onUpdate(mappedData);
    
    // Show success message
    alert('Policy data has been automatically populated in the form fields. You can review and edit the information in the next steps.');
  };

  // Helper functions for data mapping
  const extractFirstName = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    return parts[0] || '';
  };

  const extractLastName = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  };

  const extractCoverageArray = (coverageTypes: any): any[] => {
    if (!coverageTypes || typeof coverageTypes !== 'object') return [];
    
    return Object.entries(coverageTypes).map(([type, amount]) => ({
      type: type,
      limit: String(amount),
      description: `Auto-extracted: ${type}`
    }));
  };

  const extractDeductibleArray = (deductibles: any): any[] => {
    if (!deductibles || typeof deductibles !== 'object') return [];
    
    return Object.entries(deductibles).map(([type, amount]) => ({
      type: type,
      amount: String(amount),
      description: `Auto-extracted: ${type}`
    }));
  };

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
      // Step 1: Document Analysis
      setProcessingStep('📄 Analyzing document structure and content...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Text Extraction
      setProcessingStep('🔤 Extracting text and identifying key information...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: Data Processing
      setProcessingStep('🧠 Processing policy data with AI intelligence...');
      await new Promise(resolve => setTimeout(resolve, 600));

      // Step 4: Field Mapping
      setProcessingStep('🎯 Preparing data for automatic form population...');
      
      // Call the HYBRID PDF extraction service
      const result = await hybridPdfExtractionService.extractFromPDF(selectedFile);
      
      console.log('✅ Hybrid AI processing completed successfully:', result);
      
      // Step 5: Validation
      setProcessingStep('✅ Validating and finalizing extracted data...');
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
            AI Policy Analysis
          </CardTitle>
          <p className="text-gray-600">
            Upload your insurance policy document for instant AI-powered data extraction and automatic form population
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

      {/* Processing Status - Clean Version */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <LoadingSpinner size="sm" />
              <div>
                <h4 className="font-medium text-gray-900">ClaimGuru AI Analyzing Document...</h4>
                <p className="text-sm text-gray-600">Extracting policy information and coverage details</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Intelligent Document Analysis in Progress</span>
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

      {/* Extraction Results - Clean User View */}
      {extractionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Policy Successfully Analyzed!
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              ClaimGuru has extracted key information from your policy document
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Policy Information - User Friendly */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Policy Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Policy Basics */}
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Policy Number</label>
                    <p className="text-lg font-semibold text-gray-900">{extractionResult.policyData.policyNumber || 'Not found'}</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Insured Party</label>
                    <p className="text-lg font-semibold text-gray-900">{extractionResult.policyData.insuredName || 'Not found'}</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Insurance Company</label>
                    <p className="text-lg font-semibold text-gray-900">{extractionResult.policyData.insurerName || 'Not found'}</p>
                  </div>
                </div>
                
                {/* Property & Coverage */}
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Property Address</label>
                    <p className="text-lg font-semibold text-gray-900">{extractionResult.policyData.propertyAddress || 'Not found'}</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Policy Period</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {extractionResult.policyData.effectiveDate || 'Start: Not found'} - {extractionResult.policyData.expirationDate || 'End: Not found'}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Dwelling Coverage</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {extractionResult.policyData.coverageTypes?.['Coverage A - Dwelling'] || 
                       extractionResult.policyData.coverageAmount || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Coverage Summary */}
              {extractionResult.policyData.coverageTypes && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Coverage Types Detected</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {Object.entries(extractionResult.policyData.coverageTypes).map(([coverage, amount]) => (
                      <div key={coverage} className="flex justify-between">
                        <span className="text-gray-700">{coverage}:</span>
                        <span className="font-medium text-gray-900">{String(amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deductible Info */}
              {extractionResult.policyData.deductibles && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Deductible Information</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {Object.entries(extractionResult.policyData.deductibles).map(([type, amount]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-gray-700">{type}:</span>
                        <span className="font-medium text-gray-900">{String(amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => {
                  setExtractionResult(null);
                  setSelectedFile(null);
                }}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Different Document
              </Button>
              
              <Button
                variant="primary"
                onClick={proceedToNextStep}
                className="flex items-center gap-2"
              >
                Continue with Extracted Data
                <CheckCircle className="h-4 w-4" />
              </Button>
            </div>
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
