import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Brain, 
  Cloud, 
  Database, 
  DollarSign, 
  Zap, 
  Clock,
  Settings,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { extractFromPDF } from '../../../services/productionPdfExtractionService';
import { setAWSCredentials, hasAWSCredentials } from '../../../services/textractService';
import { setGoogleVisionCredentials, hasGoogleVisionCredentials } from '../../../services/googleVisionService';
import { setGooglePlacesApiKey, hasGooglePlacesApiKey } from '../../../services/googlePlacesService';

interface ProductionPolicyUploadStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

type ProcessingMethod = 'auto' | 'client' | 'textract' | 'vision' | 'hybrid';

export const ProductionPolicyUploadStep: React.FC<ProductionPolicyUploadStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingMethod, setProcessingMethod] = useState<ProcessingMethod>('auto');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // API key state
  const [awsAccessKey, setAwsAccessKey] = useState('');
  const [awsSecretKey, setAwsSecretKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [googleVisionApiKey, setGoogleVisionApiKey] = useState('');
  const [googleProjectId, setGoogleProjectId] = useState('');
  const [googlePlacesApiKey, setGooglePlacesApiKey] = useState('');
  
  // Credentials availability state
  const [hasAws, setHasAws] = useState(hasAWSCredentials());
  const [hasVision, setHasVision] = useState(hasGoogleVisionCredentials());
  const [hasPlaces, setHasPlaces] = useState(hasGooglePlacesApiKey());
  
  // Update credentials when API keys are changed
  useEffect(() => {
    if (awsAccessKey && awsSecretKey && awsRegion) {
      setAWSCredentials(awsAccessKey, awsSecretKey, awsRegion);
      setHasAws(true);
    } else {
      setHasAws(false);
    }
    
    if (googleVisionApiKey && googleProjectId) {
      setGoogleVisionCredentials(googleVisionApiKey, googleProjectId);
      setHasVision(true);
    } else {
      setHasVision(false);
    }
    
    if (googlePlacesApiKey) {
      setGooglePlacesApiKey(googlePlacesApiKey);
      setHasPlaces(true);
    } else {
      setHasPlaces(false);
    }
  }, [awsAccessKey, awsSecretKey, awsRegion, googleVisionApiKey, googleProjectId, googlePlacesApiKey]);
  
  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      setUploadedFile(file);
      setExtractionResult(null);
      setProcessingStep('idle');
      setError(null);
    }
  }, []);
  
  // Process policy document
  const processDocument = async () => {
    if (!uploadedFile) {
      setError('Please select a file to process');
      return;
    }
    
    setProcessingStep('uploading');
    setIsUploading(true);
    setIsProcessing(true);
    setError(null);
    
    // Notify parent component
    if (onAIProcessing) {
      onAIProcessing(true);
    }
    
    try {
      console.log('Processing document with method:', processingMethod);
      
      // If the selected method requires credentials but they're not set, show error
      if ((processingMethod === 'textract' || processingMethod === 'hybrid') && !hasAws) {
        throw new Error('AWS Textract credentials not configured. Please set credentials in settings.');
      }
      
      if (processingMethod === 'vision' && !hasVision) {
        throw new Error('Google Vision credentials not configured. Please set credentials in settings.');
      }
      
      // Simulate upload progress
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsUploading(false);
      setProcessingStep('processing');
      
      // Get organization ID from data
      const organizationId = data.organizationId || 'default-org';
      
      // Extract data using the PDF extraction service
      const result = await extractFromPDF(uploadedFile, organizationId, processingMethod);
      
      console.log('PDF extraction complete:', result);
      
      // Set the extraction result
      setExtractionResult(result);
      setProcessingStep('complete');
      
      // Update the wizard data with the extracted policy data
      onUpdate({
        ...data,
        policyDetails: result.policyData,
        extractionResult: {
          processingMethod: result.processingMethod,
          confidence: result.confidence,
          cost: result.cost,
          pageCount: result.pageCount
        }
      });
      
    } catch (error) {
      console.error('Error processing document:', error);
      setProcessingStep('error');
      setError(error.message || 'An unknown error occurred');
    } finally {
      setIsProcessing(false);
      
      // Notify parent component
      if (onAIProcessing) {
        onAIProcessing(false);
      }
    }
  };
  
  // Render API settings panel
  const renderSettingsPanel = () => {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AWS Textract Settings */}
            <div className="space-y-3 border rounded-lg p-4">
              <h4 className="font-medium flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-600" />
                AWS Textract Settings
                {hasAws && <CheckCircle className="h-4 w-4 text-green-500" />}
              </h4>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-700 block mb-1">Access Key ID</label>
                  <input 
                    type="password"
                    value={awsAccessKey}
                    onChange={(e) => setAwsAccessKey(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Enter AWS Access Key ID"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1">Secret Access Key</label>
                  <input 
                    type="password"
                    value={awsSecretKey}
                    onChange={(e) => setAwsSecretKey(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Enter AWS Secret Access Key"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1">Region</label>
                  <select
                    value={awsRegion}
                    onChange={(e) => setAwsRegion(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-east-2">US East (Ohio)</option>
                    <option value="us-west-1">US West (N. California)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="eu-central-1">EU (Frankfurt)</option>
                    <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Google Cloud Settings */}
            <div className="space-y-3 border rounded-lg p-4">
              <h4 className="font-medium flex items-center gap-2">
                <Cloud className="h-4 w-4 text-green-600" />
                Google Cloud Settings
                {hasVision && <CheckCircle className="h-4 w-4 text-green-500" />}
              </h4>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-700 block mb-1">Google Vision API Key</label>
                  <input 
                    type="password"
                    value={googleVisionApiKey}
                    onChange={(e) => setGoogleVisionApiKey(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Enter Google Vision API Key"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1">Google Project ID</label>
                  <input 
                    type="text"
                    value={googleProjectId}
                    onChange={(e) => setGoogleProjectId(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Enter Google Project ID"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 block mb-1">Google Places API Key</label>
                  <input 
                    type="password"
                    value={googlePlacesApiKey}
                    onChange={(e) => setGooglePlacesApiKey(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Enter Google Places API Key"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowSettings(false)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render file upload area
  const renderFileUpload = () => {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            Upload Policy Document
          </h3>
          <p className="text-gray-600">
            Upload your insurance policy document (PDF) for AI-powered extraction
          </p>
          <div className="mt-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>
        </div>
      </div>
    );
  };
  
  // Render processing controls
  const renderProcessingControls = () => {
    return (
      <div className="space-y-4">
        {/* Processing method selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Processing Method</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div 
              className={`border rounded-lg p-3 cursor-pointer ${processingMethod === 'auto' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
              onClick={() => setProcessingMethod('auto')}
            >
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Auto (Recommended)</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Automatically selects the best method based on document type</p>
            </div>
            
            <div 
              className={`border rounded-lg p-3 cursor-pointer ${processingMethod === 'client' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              onClick={() => setProcessingMethod('client')}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Client-side (Free)</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Process locally in browser - best for text-based PDFs</p>
            </div>
            
            <div 
              className={`border rounded-lg p-3 cursor-pointer ${processingMethod === 'textract' ? 'border-green-500 bg-green-50' : 'border-gray-200'} ${!hasAws ? 'opacity-50' : ''}`}
              onClick={() => hasAws ? setProcessingMethod('textract') : setShowSettings(true)}
            >
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-green-600" />
                <span className="font-medium">AWS Textract</span>
                {!hasAws && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
              </div>
              <p className="text-xs text-gray-600 mt-1">Premium cloud processing - best for forms and tables</p>
            </div>
            
            <div 
              className={`border rounded-lg p-3 cursor-pointer ${processingMethod === 'vision' ? 'border-red-500 bg-red-50' : 'border-gray-200'} ${!hasVision ? 'opacity-50' : ''}`}
              onClick={() => hasVision ? setProcessingMethod('vision') : setShowSettings(true)}
            >
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-red-600" />
                <span className="font-medium">Google Vision</span>
                {!hasVision && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
              </div>
              <p className="text-xs text-gray-600 mt-1">Premium cloud processing - best for scanned documents</p>
            </div>
            
            <div 
              className={`border rounded-lg p-3 cursor-pointer ${processingMethod === 'hybrid' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'} ${!hasAws ? 'opacity-50' : ''}`}
              onClick={() => hasAws ? setProcessingMethod('hybrid') : setShowSettings(true)}
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Hybrid</span>
                {!hasAws && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
              </div>
              <p className="text-xs text-gray-600 mt-1">Uses free client-side first, then cloud if needed</p>
            </div>
            
            <div 
              className="border rounded-lg p-3 cursor-pointer border-gray-200"
              onClick={() => setShowSettings(true)}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Configure APIs</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Set up API keys for AWS and Google Cloud</p>
            </div>
          </div>
        </div>
        
        {/* Process button */}
        <div className="flex justify-center">
          <Button
            onClick={processDocument}
            disabled={!uploadedFile || isProcessing}
            variant="primary"
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="sm" />
                {processingStep === 'uploading' ? 'Uploading...' : 'Processing...'}
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
  
  // Render processing status
  const renderProcessingStatus = () => {
    if (processingStep === 'idle') return null;
    
    // Different status indicator based on the current step
    const statusContent = {
      uploading: (
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Upload className="h-5 w-5 text-blue-600 animate-pulse" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Uploading Document</h4>
            <p className="text-sm text-gray-600">Preparing for AI processing...</p>
          </div>
        </div>
      ),
      processing: (
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <Brain className="h-5 w-5 text-purple-600 animate-pulse" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Processing Document</h4>
            <p className="text-sm text-gray-600">
              Extracting and analyzing policy information with {processingMethod === 'auto' ? 'optimal' : processingMethod} method...
            </p>
          </div>
        </div>
      ),
      complete: (
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Processing Complete</h4>
            <p className="text-sm text-gray-600">
              Successfully extracted policy information using {extractionResult?.processingMethod} method
            </p>
          </div>
        </div>
      ),
      error: (
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Processing Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )
    };
    
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        {statusContent[processingStep]}
      </div>
    );
  };
  
  // Render extraction results
  const renderExtractionResults = () => {
    if (!extractionResult || processingStep !== 'complete') return null;
    
    return (
      <Card className="border-green-200">
        <CardHeader className="pb-2 border-b border-green-100 bg-green-50 rounded-t-lg">
          <CardTitle className="text-lg flex items-center gap-2 text-green-800">
            <FileCheck className="h-5 w-5 text-green-600" />
            Policy Information Extracted
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Processing details */}
          <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                <Clock className="h-3 w-3" />
                <span>Method</span>
              </div>
              <div className="font-medium text-sm">
                {extractionResult.processingMethod === 'client' && 'Client-side'}
                {extractionResult.processingMethod === 'textract' && 'AWS Textract'}
                {extractionResult.processingMethod === 'vision' && 'Google Vision'}
                {extractionResult.processingMethod === 'hybrid' && 'Hybrid'}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                <FileText className="h-3 w-3" />
                <span>Pages</span>
              </div>
              <div className="font-medium text-sm">{extractionResult.pageCount}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                <Brain className="h-3 w-3" />
                <span>Confidence</span>
              </div>
              <div className="font-medium text-sm">{Math.round(extractionResult.confidence * 100)}%</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                <DollarSign className="h-3 w-3" />
                <span>Cost</span>
              </div>
              <div className="font-medium text-sm">${extractionResult.cost.toFixed(3)}</div>
            </div>
          </div>
          
          {/* Extracted policy data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(extractionResult.policyData).map(([key, value]) => (
              <div key={key} className="p-3 border rounded-lg bg-white">
                <div className="text-xs text-gray-500 mb-1">
                  {key === 'policyNumber' && 'Policy Number'}
                  {key === 'insuredName' && 'Insured Name'}
                  {key === 'effectiveDate' && 'Effective Date'}
                  {key === 'expirationDate' && 'Expiration Date'}
                  {key === 'insurerName' && 'Insurance Company'}
                  {key === 'propertyAddress' && 'Property Address'}
                  {key === 'coverageAmount' && 'Coverage Amount'}
                  {key === 'deductible' && 'Deductible'}
                  {key === 'agentName' && 'Agent Name'}
                  {key === 'agentPhone' && 'Agent Phone'}
                  {key === 'agentEmail' && 'Agent Email'}
                  {key === 'mortgagee' && 'Mortgagee'}
                  {key === 'loanNumber' && 'Loan Number'}
                </div>
                <div className="font-medium">{value || 'Not found'}</div>
              </div>
            ))}
          </div>
          
          {/* Actions */}
          <div className="border-t mt-4 pt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setUploadedFile(null);
                setExtractionResult(null);
                setProcessingStep('idle');
              }}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Different Document
            </Button>
            
            <Button
              variant="outline"
              onClick={processDocument}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reprocess Document
            </Button>
          </div>
        </CardContent>
      </Card>
    );
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
          {/* API Settings Panel */}
          {showSettings && renderSettingsPanel()}
          
          {/* File Upload Area */}
          {!uploadedFile && renderFileUpload()}
          
          {/* Selected File Info */}
          {uploadedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Selected File:</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Name:</strong> {uploadedFile.name}</p>
                <p><strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(1)} KB</p>
                <p><strong>Type:</strong> {uploadedFile.type}</p>
              </div>
            </div>
          )}
          
          {/* Processing Controls */}
          {uploadedFile && !extractionResult && renderProcessingControls()}
          
          {/* Processing Status */}
          {renderProcessingStatus()}
          
          {/* Extraction Results */}
          {renderExtractionResults()}
          
          {/* Error Message */}
          {error && processingStep !== 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h4 className="font-medium text-red-800">Error</h4>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};