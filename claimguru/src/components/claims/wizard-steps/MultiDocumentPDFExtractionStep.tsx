import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { 
  FileText, Upload, CheckCircle, AlertCircle, Brain, X, Eye, 
  Clock, Shield, Building, User, DollarSign, Calendar,
  AlertTriangle, Info, Trash2, Plus
} from 'lucide-react';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import MultiDocumentExtractionService, { DocumentExtractionResult, MultiDocumentResult } from '../../../services/multiDocumentExtractionService';
import { PolicyDataValidationStep } from './PolicyDataValidationStep';

interface MultiDocumentPDFExtractionStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

interface PolicyValidationState {
  documentIndex: number;
  isValidating: boolean;
  extractedData: any;
  rawText: string;
}

interface FileStatus {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: DocumentExtractionResult;
  error?: string;
}

const DocumentTypeIcon = ({ type, category }: { type: string; category: string }) => {
  const iconProps = { className: "h-4 w-4" };
  
  switch (category) {
    case 'policy':
      return <Shield {...iconProps} className="h-4 w-4 text-blue-600" />;
    case 'communication':
      return <FileText {...iconProps} className="h-4 w-4 text-green-600" />;
    case 'processing':
      return <AlertCircle {...iconProps} className="h-4 w-4 text-orange-600" />;
    case 'assessment':
      return <Eye {...iconProps} className="h-4 w-4 text-purple-600" />;
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

export const MultiDocumentPDFExtractionStep: React.FC<MultiDocumentPDFExtractionStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<MultiDocumentResult | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policyValidation, setPolicyValidation] = useState<PolicyValidationState | null>(null);

  const multiDocService = new MultiDocumentExtractionService();

  const handleFileSelection = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    console.log(`📁 Selected ${selectedFiles.length} files for processing`);

    const newFileStatuses: FileStatus[] = selectedFiles.map(file => ({
      file,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFileStatuses]);
    setError(null);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const processAllDocuments = async () => {
    if (files.length === 0) {
      setError("Please select at least one file");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      if (onAIProcessing) {
        onAIProcessing(true);
      }

      console.log(`🚀 Starting multi-document processing for ${files.length} files`);
      
      // Update file statuses to processing
      setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const })));
      
      // Process all documents
      const fileArray = files.map(f => f.file);
      const result = await multiDocService.processMultipleDocuments(fileArray);
      
      console.log('✅ Multi-document processing completed:', {
        documentsProcessed: result.documents.length,
        totalCost: result.totalCost,
        processingTime: result.totalProcessingTime
      });
      
      // Update file statuses with results
      setFiles(prev => prev.map((fileStatus, index) => ({
        ...fileStatus,
        status: result.documents[index] ? 'completed' : 'error',
        result: result.documents[index],
        error: result.documents[index] ? undefined : 'Processing failed'
      })));

      setProcessingResults(result);
      
    } catch (error) {
      console.error('❌ Multi-document processing failed:', error);
      setError(`Processing failed: ${error.message}`);
      
      // Update file statuses to error
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

  const handleConfirm = () => {
    if (!processingResults) return;

    // Create comprehensive claim data from all documents
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const claimData = {
      ...data,
      claimId,
      multiDocumentData: {
        totalDocuments: processingResults.documents.length,
        documentTypes: processingResults.documents.map(d => d.documentInfo.type),
        consolidatedData: processingResults.consolidatedData,
        workflowStage: processingResults.workflowAnalysis.workflowStage,
        claimContext: processingResults.claimContext,
        totalProcessingCost: processingResults.totalCost,
        totalProcessingTime: processingResults.totalProcessingTime
      },
      documents: processingResults.documents.map(doc => ({
        filename: doc.documentInfo.filename,
        type: doc.documentInfo.type,
        category: doc.documentInfo.category,
        confidence: doc.documentInfo.confidence,
        extractedData: doc.extractedData,
        rawText: doc.rawText
      })),
      recommendations: processingResults.recommendations,
      extractedPolicyData: true,
      multiDocumentProcessing: true,
      dataConfirmed: true,
      validationComplete: true,
      confirmationTimestamp: new Date().toISOString(),
      processingComplete: true
    };

    onUpdate(claimData);
    setIsConfirmed(true);
    
    // Show success message
    setTimeout(() => {
      alert(`✅ ${processingResults.documents.length} documents processed successfully! Click "Next" to continue to Client Information.`);
    }, 500);
  };

  const handleReject = () => {
    setFiles([]);
    setProcessingResults(null);
    setIsConfirmed(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Multi-Document AI Processing System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Processing Notice */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-800">
              <Brain className="h-4 w-4" />
              <span className="font-medium">Advanced Document Intelligence</span>
            </div>
            <p className="text-purple-700 text-sm mt-1">
              Automatically classifies and extracts data from policies, communications, settlements, and assessments
            </p>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Insurance Documents
              </h3>
              <p className="text-gray-600">
                Upload multiple PDFs: policies, claim letters, settlements, assessments, etc.
              </p>
              <div className="mt-4">
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileSelection}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
            </div>
          </div>

          {/* Selected Files */}
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
                        {fileStatus.result && (
                          <DocumentTypeIcon 
                            type={fileStatus.result.documentInfo.type}
                            category={fileStatus.result.documentInfo.category}
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {fileStatus.file.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {(fileStatus.file.size / 1024).toFixed(1)} KB
                            {fileStatus.result && (
                              <span className="ml-2">
                                • {fileStatus.result.documentInfo.type.replace(/_/g, ' ')}
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

          {/* Processing Button */}
          {files.length > 0 && !isConfirmed && !processingResults && (
            <div className="flex justify-center">
              <Button
                onClick={processAllDocuments}
                disabled={isProcessing}
                variant="primary"
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing {files.length} document{files.length > 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Process {files.length} Document{files.length > 1 ? 's' : ''} with AI
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

          {/* Processing Results */}
          {processingResults && !isConfirmed && (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Processing Complete - Review Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Overall Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-900">
                        {processingResults.documents.length}
                      </div>
                      <div className="text-sm text-blue-700">Documents</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-900">
                        ${processingResults.totalCost.toFixed(3)}
                      </div>
                      <div className="text-sm text-green-700">Total Cost</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-900">
                        {(processingResults.totalProcessingTime / 1000).toFixed(1)}s
                      </div>
                      <div className="text-sm text-purple-700">Processing Time</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-900">
                        {processingResults.workflowAnalysis.workflowStage.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-orange-700">Claim Stage</div>
                    </div>
                  </div>

                  {/* Workflow Analysis */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Claim Context Analysis</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Workflow Stage:</strong> {processingResults.workflowAnalysis.workflowStage.replace(/_/g, ' ')}</p>
                      <p><strong>Document Categories:</strong> {processingResults.claimContext.categories.join(', ')}</p>
                      {processingResults.consolidatedData.claimNumbers.length > 0 && (
                        <p><strong>Claim Numbers:</strong> {processingResults.consolidatedData.claimNumbers.join(', ')}</p>
                      )}
                      {processingResults.consolidatedData.policyNumbers.length > 0 && (
                        <p><strong>Policy Numbers:</strong> {processingResults.consolidatedData.policyNumbers.join(', ')}</p>
                      )}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {processingResults.recommendations.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Recommendations & Action Items
                      </h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        {processingResults.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Document Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Analysis Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {processingResults.documents.map((doc, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <DocumentTypeIcon 
                              type={doc.documentInfo.type}
                              category={doc.documentInfo.category}
                            />
                            <div>
                              <h4 className="font-medium">{doc.documentInfo.filename}</h4>
                              <p className="text-sm text-gray-600">
                                {doc.documentInfo.type.replace(/_/g, ' ')} • {doc.documentInfo.category}
                              </p>
                            </div>
                          </div>
                          <ConfidenceBadge confidence={doc.documentInfo.confidence} />
                        </div>
                        
                        {/* Key Extracted Data */}
                        {doc.documentInfo.category === 'policy' ? (
                          <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Insurance Policy Document - Comprehensive Validation Available
                              </h5>
                              <p className="text-sm text-blue-700 mb-3">
                                This policy document contains {Object.keys(doc.extractedData).filter(k => k !== 'validationMetadata' && doc.extractedData[k]).length} extracted fields. 
                                Click "Review Policy Details" to validate all comprehensive policy information.
                              </p>
                              <Button
                                onClick={() => setPolicyValidation({
                                  documentIndex: index,
                                  isValidating: true,
                                  extractedData: doc.extractedData,
                                  rawText: doc.rawText
                                })}
                                variant="primary"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-3 w-3" />
                                Review Policy Details ({Object.keys(doc.extractedData).filter(k => k !== 'validationMetadata' && doc.extractedData[k]).length} fields)
                              </Button>
                            </div>
                            
                            {/* Show quick preview of key fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {Object.entries(doc.extractedData)
                                .filter(([key, value]) => value && key !== 'validationMetadata')
                                .filter(([key]) => ['policyNumber', 'insuredName', 'propertyAddress', 'effectiveDate', 'coverageAmount', 'insurerName'].includes(key))
                                .map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-gray-600 capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                                    </span>
                                    <span className="font-medium text-gray-900 text-right">
                                      {typeof value === 'string' ? value : JSON.stringify(value)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {Object.entries(doc.extractedData)
                              .filter(([key, value]) => value && key !== 'validationMetadata')
                              .map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="font-medium text-gray-900 text-right">
                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Processing Notes */}
                        {doc.processingNotes.length > 0 && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                              Processing Notes ({doc.processingNotes.length})
                            </summary>
                            <ul className="mt-2 text-xs text-gray-600 space-y-1 ml-4">
                              {doc.processingNotes.map((note, noteIndex) => (
                                <li key={noteIndex}>• {note}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Policy Data Validation Modal */}
          {policyValidation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Comprehensive Policy Data Validation
                    </h3>
                    <Button
                      onClick={() => setPolicyValidation(null)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <PolicyDataValidationStep
                    extractedData={policyValidation.extractedData}
                    rawText={policyValidation.rawText}
                    onValidated={(validatedData) => {
                      // Update the processing results with validated data
                      setProcessingResults(prev => {
                        if (!prev) return prev;
                        const updated = { ...prev };
                        updated.documents[policyValidation.documentIndex].extractedData = validatedData;
                        return updated;
                      });
                      setPolicyValidation(null);
                      alert('✅ Policy data validated successfully! You can now proceed with all documents.');
                    }}
                    onReject={() => {
                      setPolicyValidation(null);
                      alert('❌ Policy validation cancelled. You can re-upload the document if needed.');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {processingResults && !isConfirmed && !policyValidation && (
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                onClick={handleReject}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Start Over
              </Button>

              <Button
                onClick={handleConfirm}
                variant="primary"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Confirm & Proceed
              </Button>
            </div>
          )}

          {/* Confirmation Message */}
          {isConfirmed && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-800 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Multi-Document Processing Complete!</span>
              </div>
              <p className="text-green-700 text-sm">
                {processingResults?.documents.length} documents processed and confirmed. 
                You can now proceed to the next step.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiDocumentPDFExtractionStep;
