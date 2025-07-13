import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { FileText, Upload, CheckCircle, AlertCircle, File, FileCheck } from 'lucide-react';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { workingPdfService } from '../../../services/workingPdfService';

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
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log('File selected:', selectedFile.name, selectedFile.size, selectedFile.type);
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setExtractedText('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        console.log('File dropped:', droppedFile.name, droppedFile.size, droppedFile.type);
        setFile(droppedFile);
        setError(null);
        setResult(null);
        setExtractedText('');
      } else {
        setError("Please select a PDF file");
      }
    }
  };

  const extractPolicyData = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      // Start processing
      setIsProcessing(true);
      setError(null);
      
      // Notify parent component (if provided)
      if (onAIProcessing) {
        onAIProcessing(true);
      }

      console.log('Starting PDF processing:', file.name);
      
      // Use the PDF service to extract text and policy data
      const extractionResult = await workingPdfService.extractTextFromPDF(file);
      
      if (extractionResult.status === 'failed') {
        throw new Error(extractionResult.error || 'Failed to extract data from PDF');
      }
      
      // Store the extracted text
      setExtractedText(extractionResult.extractedText);
      
      // Set the result data
      setResult(extractionResult.policyData);
      
      // Update the wizard data
      onUpdate({
        ...data,
        policyDetails: extractionResult.policyData,
        extractedPolicyData: true,
        fileProcessed: file.name,
        confidence: extractionResult.confidence
      });
      
      console.log('PDF processing completed successfully:', extractionResult.policyData);
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError('Processing failed: ' + err.message);
    } finally {
      setIsProcessing(false);
      
      // Notify parent component processing ended
      if (onAIProcessing) {
        onAIProcessing(false);
      }
    }
  };

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
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('policyFileInput')?.click()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Insurance Policy
              </h3>
              <p className="text-gray-600">
                Drag and drop your policy document (PDF) or click to browse
              </p>
              <div className="mt-4">
                <input
                  id="policyFileInput"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {!file && (
                  <Button
                    variant="outline"
                    type="button"
                    className="mx-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('policyFileInput')?.click();
                    }}
                  >
                    <File className="mr-2 h-4 w-4" /> Browse Files
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-blue-900">Selected File:</h4>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="h-8 text-xs"
                  onClick={() => {
                    document.getElementById('policyFileInput')?.click();
                  }}
                >
                  Change File
                </Button>
              </div>
              <div className="text-sm text-blue-800 mt-2">
                <div className="flex items-center">
                  <FileCheck className="h-4 w-4 mr-2" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <div className="mt-1 ml-6 text-blue-700">
                  <p>Size: {(file.size / 1024).toFixed(1)} KB</p>
                  <p>Type: {file.type}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
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
                
                {extractedText && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowRawText(!showRawText)}
                    className="ml-auto text-green-700"
                  >
                    {showRawText ? 'Hide Raw Text' : 'Show Raw Text'}
                  </Button>
                )}
              </div>
              
              {showRawText && extractedText && (
                <div className="mb-4 p-3 bg-white rounded border border-green-200 text-xs text-gray-700 overflow-auto max-h-40">
                  <pre>{extractedText.substring(0, 1000)}...</pre>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {result.policyNumber && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600">Policy Number:</span>
                    <p className="font-medium">{result.policyNumber}</p>
                  </div>
                )}
                
                {result.insuredName && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600">Insured Name:</span>
                    <p className="font-medium">{result.insuredName}</p>
                  </div>
                )}
                
                {result.insurerName && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600">Insurance Company:</span>
                    <p className="font-medium">{result.insurerName}</p>
                  </div>
                )}
                
                {result.propertyAddress && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600">Property Address:</span>
                    <p className="font-medium">{result.propertyAddress}</p>
                  </div>
                )}
                
                {result.effectiveDate && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600">Effective Date:</span>
                    <p className="font-medium">{result.effectiveDate}</p>
                  </div>
                )}
                
                {result.expirationDate && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600">Expiration Date:</span>
                    <p className="font-medium">{result.expirationDate}</p>
                  </div>
                )}
                
                {result.dwellingLimit && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600">Dwelling Limit:</span>
                    <p className="font-medium">{result.dwellingLimit}</p>
                  </div>
                )}
                
                {result.personalPropertyLimit && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600">Personal Property:</span>
                    <p className="font-medium">{result.personalPropertyLimit}</p>
                  </div>
                )}
                
                {result.liabilityLimit && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600">Liability:</span>
                    <p className="font-medium">{result.liabilityLimit}</p>
                  </div>
                )}
                
                {result.deductibleAmount && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600">Deductible:</span>
                    <p className="font-medium">{result.deductibleAmount}</p>
                  </div>
                )}
                
                {result.mortgageeInfo && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600">Mortgagee:</span>
                    <p className="font-medium">{result.mortgageeInfo}</p>
                  </div>
                )}
                
                {result.agentInfo && (
                  <div className="p-2 bg-white rounded-lg">
                    <span className="text-gray-600">Agent:</span>
                    <p className="font-medium">{result.agentInfo}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-white rounded border border-green-200 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Extraction Confidence:</span>
                  <span className="font-medium">{Math.round((data.confidence || 0.7) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.round((data.confidence || 0.7) * 100)}%` }}
                  ></div>
                </div>
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
                  Processing PDF...
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