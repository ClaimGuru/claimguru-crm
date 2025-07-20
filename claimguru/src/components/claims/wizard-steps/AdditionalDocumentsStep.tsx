import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { 
  FileText, Upload, CheckCircle, AlertCircle, Brain, X, Eye, 
  Clock, Shield, Building, User, DollarSign, Calendar,
  AlertTriangle, Info, Trash2, Plus, Package, Camera, FileImage,
  MessageSquare, ClipboardList, Calculator
} from 'lucide-react';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import MultiDocumentExtractionService, { DocumentExtractionResult, MultiDocumentResult } from '../../../services/multiDocumentExtractionService';

interface AdditionalDocumentsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

interface FileStatus {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: DocumentExtractionResult;
  error?: string;
  category?: string;
}

const DocumentTypeIcon = ({ type, category }: { type: string; category: string }) => {
  const iconProps = { className: "h-4 w-4" };
  
  switch (category) {
    case 'photo':
      return <Camera {...iconProps} className="h-4 w-4 text-green-600" />;
    case 'estimate':
      return <Calculator {...iconProps} className="h-4 w-4 text-blue-600" />;
    case 'correspondence':
      return <MessageSquare {...iconProps} className="h-4 w-4 text-purple-600" />;
    case 'report':
      return <ClipboardList {...iconProps} className="h-4 w-4 text-orange-600" />;
    default:
      return <FileText {...iconProps} className="h-4 w-4 text-gray-600" />;
  }
};

const ConfidenceBadge = ({ confidence }: { confidence: number }) => {
  const getColor = () => {
    if (confidence >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColor()}`}>
      {confidence.toFixed(0)}% confidence
    </span>
  );
};

export const AdditionalDocumentsStep: React.FC<AdditionalDocumentsStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<MultiDocumentResult | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const multiDocService = new MultiDocumentExtractionService();

  const handleFileSelection = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    console.log(`📁 Selected ${selectedFiles.length} additional documents`);

    const newFileStatuses: FileStatus[] = selectedFiles.map(file => ({
      file,
      status: 'pending',
      category: detectDocumentCategory(file.name)
    }));

    setFiles(prev => [...prev, ...newFileStatuses]);
    setError(null);
  }, []);

  const detectDocumentCategory = (filename: string): string => {
    const name = (filename || '').toLowerCase();
    if (name.includes('photo') || name.includes('image') || /\.(jpg|jpeg|png|gif)$/i.test(name)) return 'photo';
    if (name.includes('estimate') || name.includes('quote')) return 'estimate';
    if (name.includes('letter') || name.includes('email') || name.includes('correspondence')) return 'correspondence';
    if (name.includes('report') || name.includes('assessment')) return 'report';
    return 'document';
  };

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const processAllDocuments = async () => {
    if (files.length === 0) {
      // Allow proceeding without additional documents
      handleConfirm();
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      if (onAIProcessing) {
        onAIProcessing(true);
      }

      console.log(`🚀 Processing ${files.length} additional documents`);
      
      setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const })));
      
      const fileArray = files.map(f => f.file);
      const result = await multiDocService.processMultipleDocuments(fileArray);
      
      console.log('✅ Additional documents processed:', {
        documentsProcessed: result.documents.length,
        totalCost: result.totalCost,
        processingTime: result.totalProcessingTime
      });
      
      setFiles(prev => prev.map((fileStatus, index) => ({
        ...fileStatus,
        status: result.documents[index] ? 'completed' : 'error',
        result: result.documents[index],
        error: result.documents[index] ? undefined : 'Processing failed'
      })));

      setProcessingResults(result);
      
      // Generate AI suggestions based on processed documents
      generateAISuggestions(result);
      
    } catch (error) {
      console.error('❌ Additional documents processing failed:', error);
      setError(`Processing failed: ${error.message}`);
      
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const, 
        error: error.message 
      })));
    } finally {
      setIsProcessing(false);
      if (onAIProcessing) {
        onAIProcessing(false);
      }
    }
  };

  const generateAISuggestions = (results: MultiDocumentResult) => {
    const suggestions = {
      descriptions: [],
      insights: [],
      recommendations: []
    };

    // Analyze processed documents for insights
    results.documents.forEach(doc => {
      if (doc.documentInfo.category === 'correspondence') {
        suggestions.insights.push(`Communication document detected: ${doc.documentInfo.type}`);
      }
      if (doc.documentInfo.category === 'estimate') {
        suggestions.insights.push(`Cost estimate document available for reference`);
      }
      if (doc.documentInfo.category === 'photo') {
        suggestions.insights.push(`Photo documentation uploaded for damage verification`);
      }
    });

    // Generate description suggestions based on document content
    const consolidatedText = results.documents
      .map(doc => doc.rawText)
      .join(' ')
      .toLowerCase() || '';

    if (consolidatedText.includes('water') || consolidatedText.includes('flood')) {
      suggestions.descriptions.push('Water damage incident with potential flooding concerns');
    }
    if (consolidatedText.includes('fire') || consolidatedText.includes('smoke')) {
      suggestions.descriptions.push('Fire-related damage with smoke and heat impact');
    }
    if (consolidatedText.includes('wind') || consolidatedText.includes('storm')) {
      suggestions.descriptions.push('Storm damage from high winds and severe weather');
    }
    if (consolidatedText.includes('theft') || consolidatedText.includes('burglary')) {
      suggestions.descriptions.push('Property theft or burglary incident');
    }

    // Add recommendations
    if (results.documents.length > 0) {
      suggestions.recommendations.push('Review uploaded documents when completing claim details');
      suggestions.recommendations.push('Use document insights to enhance claim description accuracy');
    }

    return suggestions;
  };

  const handleConfirm = () => {
    console.log('📋 Confirming additional documents processing');
    
    const suggestions = processingResults ? generateAISuggestions(processingResults) : {
      descriptions: [],
      insights: [],
      recommendations: []
    };

    onUpdate({
      ...data,
      additionalDocuments: {
        documents: files.map(f => ({
          filename: f.file.name,
          category: f.category,
          status: f.status,
          result: f.result
        })),
        aiAnalysis: processingResults,
        processedAt: new Date().toISOString(),
        totalDocuments: files.length
      },
      aiSuggestions: {
        ...data.aiSuggestions,
        ...suggestions
      },
      documentsProcessed: true,
      documentProcessingComplete: true
    });
    
    setIsConfirmed(true);
    
    setTimeout(() => {
      const message = files.length > 0 
        ? `✅ ${files.length} documents processed successfully! AI insights will be available throughout the wizard forms.`
        : '✅ Ready to proceed! You can upload additional documents later if needed.';
      alert(message);
    }, 500);
  };

  const handleSkip = () => {
    onUpdate({
      ...data,
      additionalDocuments: {
        documents: [],
        processedAt: new Date().toISOString(),
        totalDocuments: 0
      },
      documentsProcessed: true,
      documentProcessingComplete: true
    });
    setIsConfirmed(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Additional Claim Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <Brain className="h-4 w-4" />
              <span className="font-medium">Step 2: Document Intelligence</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Upload any additional documents related to your claim. The AI will analyze them and provide intelligent suggestions throughout the wizard.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs text-green-600">
              <div className="flex items-center gap-1">
                <Camera className="h-3 w-3" />
                Photos
              </div>
              <div className="flex items-center gap-1">
                <Calculator className="h-3 w-3" />
                Estimates
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                Correspondence
              </div>
              <div className="flex items-center gap-1">
                <ClipboardList className="h-3 w-3" />
                Reports
              </div>
            </div>
          </div>

          {/* Policy Data Status */}
          {data.extractedPolicyData?.validated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Policy Data Ready</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Your policy information has been extracted and will be combined with these additional documents for enhanced AI assistance.
              </p>
            </div>
          )}

          {/* Enhanced File Upload Area */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer select-none group"
            onClick={() => document.getElementById('additional-docs-input')?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.getElementById('additional-docs-input')?.click();
              }
            }}
            aria-label="Click to upload additional documents"
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4 transition-colors group-hover:text-green-500" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Additional Documents (Optional)
              </h3>
              <p className="text-gray-600">
                Photos, estimates, correspondence, reports, or any supporting documents
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors group-hover:bg-green-200">
                <Package className="h-4 w-4" />
                Choose Files (Multiple Selection)
              </div>
            </div>
            <input
              id="additional-docs-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              multiple
              onChange={handleFileSelection}
              className="hidden"
            />
          </div>

          {/* Selected Files Display */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Selected Documents ({files.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.map((fileStatus, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        fileStatus.status === 'completed' ? 'bg-green-50 border-green-200' :
                        fileStatus.status === 'error' ? 'bg-red-50 border-red-200' :
                        fileStatus.status === 'processing' ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <DocumentTypeIcon 
                          type={fileStatus.result?.documentInfo.type || 'unknown'}
                          category={fileStatus.category || 'document'}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {fileStatus.file.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {(fileStatus.file.size / 1024).toFixed(1)} KB
                            {fileStatus.category && (
                              <span className="ml-2 capitalize">
                                • {fileStatus.category}
                              </span>
                            )}
                          </div>
                          {fileStatus.result && (
                            <div className="mt-1">
                              <ConfidenceBadge confidence={fileStatus.result.documentInfo.confidence} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {fileStatus.status === 'processing' && <LoadingSpinner size="sm" />}
                        {fileStatus.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {fileStatus.status === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                        
                        {fileStatus.status === 'pending' && (
                          <Button
                            onClick={() => removeFile(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {!isConfirmed && (
            <div className="flex justify-between items-center">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
                Skip This Step
              </Button>

              <Button
                onClick={processAllDocuments}
                disabled={isProcessing}
                variant="primary"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing...
                  </>
                ) : files.length > 0 ? (
                  <>
                    <Brain className="h-4 w-4" />
                    Process {files.length} Document{files.length > 1 ? 's' : ''} with AI
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Continue Without Additional Documents
                  </>
                )}
              </Button>
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

          {/* Processing Results Summary */}
          {processingResults && !isConfirmed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">AI Processing Complete</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Documents Processed:</strong> {processingResults.documents.length}</p>
                <p><strong>Total Cost:</strong> ${processingResults.totalCost.toFixed(3)}</p>
                <p><strong>Processing Time:</strong> {(processingResults.totalProcessingTime / 1000).toFixed(1)}s</p>
                <p><strong>Insights Generated:</strong> Ready for AI-assisted form completion</p>
              </div>
              <Button
                onClick={handleConfirm}
                className="mt-3 bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm & Continue
              </Button>
            </div>
          )}

          {/* Success Message */}
          {isConfirmed && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-800 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Documents Ready!</span>
              </div>
              <p className="text-green-700 text-sm">
                {files.length > 0 
                  ? `${files.length} documents processed. AI insights will enhance your form completion experience.`
                  : 'Ready to proceed with wizard completion. You can upload documents later if needed.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};