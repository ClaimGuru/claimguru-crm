import React, { useState, useCallback } from 'react';
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
  Cpu, 
  DollarSign, 
  Clock,
  Settings,
  Eye,
  Zap
} from 'lucide-react';
import { tieredPdfService, TieredExtractionResult } from '../../../services/tieredPdfService';

interface TieredPolicyUploadStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

export const TieredPolicyUploadStep: React.FC<TieredPolicyUploadStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<TieredExtractionResult | null>(null);
  const [currentTier, setCurrentTier] = useState<'pdf.js' | 'tesseract' | 'google-vision' | null>(null);
  const [processingStage, setProcessingStage] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [googleVisionApiKey, setGoogleVisionApiKey] = useState('');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      setUploadedFile(file);
      setExtractionResult(null);
      setProcessingStage('idle');
      setError(null);
      setCurrentTier(null);
    }
  }, []);

  const processWithAI = async () => {
    if (!uploadedFile) {
      setError('Please select a file first');
      return;
    }

    console.log('Starting tiered PDF processing for:', uploadedFile.name);
    
    try {
      setIsProcessing(true);
      setProcessingStage('uploading');
      setError(null);
      
      // Notify parent component
      if (onAIProcessing) {
        onAIProcessing(true);
      }

      // Set Google Vision API key if provided
      if (googleVisionApiKey.trim()) {
        tieredPdfService.setGoogleVisionApiKey(googleVisionApiKey);
      }

      // Simulate upload phase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingStage('processing');
      setCurrentTier('pdf.js');
      console.log('Starting with PDF.js extraction...');

      // Update current tier for UI feedback
      const originalExtract = tieredPdfService.extractFromPDF;
      tieredPdfService.extractFromPDF = async (file, orgId) => {
        // Wrap the extraction to show progress
        const result = await originalExtract.call(tieredPdfService, file, orgId);
        setCurrentTier(result.processingMethod);
        return result;
      };

      // Get organization ID from data
      const organizationId = data.organizationId || 'default-org';
      
      // Extract data using the tiered PDF service
      const result = await tieredPdfService.extractFromPDF(uploadedFile, organizationId);
      
      console.log('Tiered PDF extraction completed:', result);
      
      setExtractionResult(result);
      setProcessingStage('complete');
      
      // Update wizard data with the extracted policy data
      onUpdate({
        ...data,
        policyDetails: result.policyData,
        extractionResult: {
          processingMethod: result.processingMethod,
          confidence: result.confidence,
          cost: result.cost,
          processingTime: result.processingTime,
          extractedText: result.extractedText.substring(0, 500) + '...' // Truncate for storage
        },
        uploadedFile: uploadedFile.name,
        processingComplete: true
      });

    } catch (error) {
      console.error('Tiered PDF processing failed:', error);
      setError(`Processing failed: ${error.message}`);
      setProcessingStage('error');
    } finally {
      setIsProcessing(false);
      setCurrentTier(null);
      if (onAIProcessing) {
        onAIProcessing(false);
      }
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'pdf.js': return Cpu;
      case 'tesseract': return Eye;
      case 'google-vision': return Cloud;
      default: return Brain;
    }
  };

  const getTierDescription = (tier: string) => {
    switch (tier) {
      case 'pdf.js': return 'Client-side text extraction (Free)';
      case 'tesseract': return 'Client-side OCR processing (Free)';
      case 'google-vision': return 'Cloud OCR with AI (Premium)';
      default: return 'AI Processing';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pdf.js': return 'text-blue-600';
      case 'tesseract': return 'text-orange-600';
      case 'google-vision': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const renderProcessingTiers = () => {
    const tiers = [
      { name: 'pdf.js', label: 'Text Extraction', icon: Cpu, color: 'blue' },
      { name: 'tesseract', label: 'OCR Processing', icon: Eye, color: 'orange' },
      { name: 'google-vision', label: 'AI Cloud OCR', icon: Cloud, color: 'purple' }
    ];

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Processing Tiers:</h4>
        <div className="space-y-2">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const isActive = currentTier === tier.name;
            const isCompleted = extractionResult?.processingMethod === tier.name;
            const isPending = isProcessing && !isActive && !isCompleted;
            
            return (
              <div 
                key={tier.name}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isActive ? `border-${tier.color}-300 bg-${tier.color}-50` :
                  isCompleted ? `border-green-300 bg-green-50` :
                  isPending ? 'border-gray-200 bg-gray-50' :
                  'border-gray-200'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isActive ? `bg-${tier.color}-100` :
                  isCompleted ? 'bg-green-100' :
                  'bg-gray-100'
                }`}>
                  {isActive ? (
                    <LoadingSpinner size="sm" />
                  ) : isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Icon className={`h-4 w-4 ${
                      isActive ? `text-${tier.color}-600` :
                      isCompleted ? 'text-green-600' :
                      'text-gray-400'
                    }`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{index + 1}. {tier.label}</div>
                  <div className="text-xs text-gray-600">{getTierDescription(tier.name)}</div>
                </div>
                {isActive && (
                  <div className="text-xs text-blue-600 font-medium">Processing...</div>
                )}
                {isCompleted && (
                  <div className="text-xs text-green-600 font-medium">Success</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Tiered AI Policy Document Analysis
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="ml-auto"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">API Configuration</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Vision API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={googleVisionApiKey}
                    onChange={(e) => setGoogleVisionApiKey(e.target.value)}
                    placeholder="Enter Google Vision API key for premium OCR"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If not provided, will fallback to free client-side processing
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Insurance Policy Document
              </h3>
              <p className="text-gray-600">
                Advanced tiered extraction: PDF.js → Tesseract → Google Vision AI
              </p>
              <div className="mt-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* File Information */}
          {uploadedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Selected File:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div><strong>Name:</strong> {uploadedFile.name}</div>
                <div><strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(1)} KB</div>
                <div><strong>Type:</strong> {uploadedFile.type}</div>
              </div>
            </div>
          )}

          {/* Processing Tiers */}
          {(isProcessing || extractionResult) && renderProcessingTiers()}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Processing Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {extractionResult && processingStage === 'complete' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h4 className="text-lg font-semibold text-green-900">✅ Extraction Successful!</h4>
              </div>
              
              {/* Processing Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(extractionResult.confidence * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {extractionResult.processingMethod}
                  </div>
                  <div className="text-sm text-gray-600">Method Used</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {extractionResult.processingTime}ms
                  </div>
                  <div className="text-sm text-gray-600">Process Time</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${extractionResult.cost.toFixed(3)}
                  </div>
                  <div className="text-sm text-gray-600">Cost</div>
                </div>
              </div>

              {/* Processing Method Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-white`}>
                  {React.createElement(getTierIcon(extractionResult.processingMethod), {
                    className: `h-4 w-4 ${getTierColor(extractionResult.processingMethod)}`
                  })}
                  <span className="text-sm font-medium">
                    {getTierDescription(extractionResult.processingMethod)}
                  </span>
                </div>
              </div>

              {/* Extracted Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(extractionResult.policyData).map(([key, value]) => (
                  value && (
                    <div key={key} className="bg-white rounded-lg p-3">
                      <div className="text-sm text-gray-600">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="font-medium">{value}</div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Process Button */}
          <div className="flex justify-center">
            <Button
              onClick={processWithAI}
              disabled={!uploadedFile || isProcessing}
              variant="primary"
              size="lg"
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Process with AI
                </>
              )}
            </Button>
          </div>

          {/* Processing Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Tiered Processing:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li><strong>Tier 1:</strong> PDF.js extracts text from digital PDFs (Free, Fast)</li>
              <li><strong>Tier 2:</strong> Tesseract OCR processes scanned documents (Free, Slower)</li>
              <li><strong>Tier 3:</strong> Google Vision AI for complex layouts (Premium, Highest Accuracy)</li>
            </ol>
            <p className="text-xs text-blue-700 mt-2">
              System automatically escalates to the next tier if confidence is low.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
