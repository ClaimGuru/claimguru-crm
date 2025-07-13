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
  Zap,
  Clock,
  DollarSign,
  Eye
} from 'lucide-react';
import { enhancedTesseractService } from '../../../services/enhancedTesseractService';

interface ClientSidePolicyUploadStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onAIProcessing?: (isProcessing: boolean) => void;
}

type ProcessingStage = 'idle' | 'processing' | 'complete' | 'error';
type ProcessingMethod = 'pdf.js' | 'tesseract' | 'hybrid';

export const ClientSidePolicyUploadStep: React.FC<ClientSidePolicyUploadStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [currentMethod, setCurrentMethod] = useState<ProcessingMethod>('pdf.js');
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected for client-side processing:', file.name, file.size);
      setUploadedFile(file);
      setError(null);
      setExtractionResult(null);
      setProcessingStage('idle');
    }
  }, []);

  const processWithClientSideAI = async () => {
    if (!uploadedFile) {
      setError('Please select a PDF file first');
      return;
    }

    console.log('Starting client-side PDF processing...');
    const startTime = Date.now();
    
    try {
      setProcessingStage('processing');
      setError(null);
      
      if (onAIProcessing) {
        onAIProcessing(true);
      }

      // Method 1: Try PDF.js first (fast, free)
      setCurrentMethod('pdf.js');
      console.log('Attempting PDF.js text extraction...');
      
      const pdfJsResult = await extractWithPdfJs(uploadedFile);
      
      if (pdfJsResult.success && pdfJsResult.confidence > 0.7) {
        console.log('PDF.js extraction successful');
        const result = formatExtractionResult(pdfJsResult, 'pdf.js', 0);
        setExtractionResult(result);
        setProcessingStage('complete');
        updateWizardData(result);
        return;
      }

      // Method 2: Enhanced Tesseract OCR (advanced, free)
      setCurrentMethod('tesseract');
      console.log('PDF.js insufficient, trying Enhanced Tesseract OCR...');
      
      const tesseractResult = await enhancedTesseractService.extractFromPDF(uploadedFile);
      
      if (tesseractResult.text.length > 50 && tesseractResult.confidence > 0.6) {
        console.log('Enhanced Tesseract extraction successful');
        const enhancedData = enhancedTesseractService.extractInsuranceData(tesseractResult);
        const result = formatExtractionResult(
          { 
            text: tesseractResult.text, 
            confidence: tesseractResult.confidence, 
            success: true,
            enhancedData 
          }, 
          'tesseract', 
          0
        );
        setExtractionResult(result);
        setProcessingStage('complete');
        updateWizardData(result);
        return;
      }

      // Method 3: Hybrid approach
      setCurrentMethod('hybrid');
      console.log('Trying hybrid PDF.js + Tesseract approach...');
      
      const hybridResult = await combineExtractionMethods(pdfJsResult, tesseractResult);
      const result = formatExtractionResult(hybridResult, 'hybrid', 0);
      
      setExtractionResult(result);
      setProcessingStage('complete');
      updateWizardData(result);

    } catch (error) {
      console.error('Client-side processing failed:', error);
      setError(`Processing failed: ${error.message}`);
      setProcessingStage('error');
    } finally {
      setProcessingTime(Date.now() - startTime);
      if (onAIProcessing) {
        onAIProcessing(false);
      }
    }
  };

  const extractWithPdfJs = async (file: File): Promise<{success: boolean, text: string, confidence: number}> => {
    try {
      // Dynamic import of PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.js';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let extractedText = '';
      const maxPages = Math.min(pdf.numPages, 10); // Limit to 10 pages
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        extractedText += pageText + '\n';
      }
      
      const confidence = calculatePdfJsConfidence(extractedText);
      
      return {
        success: extractedText.length > 100 && confidence > 0.5,
        text: extractedText,
        confidence
      };
    } catch (error) {
      console.error('PDF.js extraction failed:', error);
      return { success: false, text: '', confidence: 0 };
    }
  };

  const calculatePdfJsConfidence = (text: string): number => {
    let confidence = 0.3; // Base confidence
    
    if (text.length > 500) confidence += 0.2;
    if (/\d{3,}/.test(text)) confidence += 0.1; // Contains numbers
    if (/insurance|policy|coverage/i.test(text)) confidence += 0.2;
    if (/\$[\d,]+/.test(text)) confidence += 0.1; // Contains currency
    if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(text)) confidence += 0.1; // Contains dates
    
    return Math.min(confidence, 1.0);
  };

  const combineExtractionMethods = async (pdfJsResult: any, tesseractResult: any) => {
    // Combine results from both methods for better accuracy
    const combinedText = pdfJsResult.text + '\n\n--- ENHANCED OCR ---\n\n' + tesseractResult.text;
    const combinedConfidence = Math.max(pdfJsResult.confidence, tesseractResult.confidence);
    
    return {
      success: true,
      text: combinedText,
      confidence: combinedConfidence,
      enhancedData: tesseractResult.words ? enhancedTesseractService.extractInsuranceData(tesseractResult) : null
    };
  };

  const formatExtractionResult = (result: any, method: ProcessingMethod, cost: number) => {
    const policyData = extractPolicyData(result.text, result.enhancedData);
    
    return {
      extractedText: result.text,
      confidence: result.confidence,
      processingMethod: method,
      cost,
      processingTime,
      policyData,
      metadata: {
        fileSize: uploadedFile?.size || 0,
        fileName: uploadedFile?.name || '',
        isClientSide: true,
        enhancedExtraction: !!result.enhancedData
      }
    };
  };

  const extractPolicyData = (text: string, enhancedData?: any) => {
    // Use enhanced data if available, otherwise fall back to basic extraction
    if (enhancedData && Object.keys(enhancedData).length > 0) {
      return enhancedData;
    }

    // Basic extraction patterns
    const data: any = {};
    
    // Policy number
    const policyMatch = text.match(/policy\s*#?\s*:?\s*([A-Z0-9\-]{6,20})/i);
    if (policyMatch) data.policyNumber = policyMatch[1];
    
    // Insured name  
    const nameMatch = text.match(/insured\s*:?\s*([A-Za-z\s,&]+?)(?:\n|$)/i);
    if (nameMatch) data.insuredName = nameMatch[1].trim();
    
    // Insurance company
    const insurerMatch = text.match(/(?:insurance\s+company|insurer|carrier)\s*:?\s*([A-Za-z\s&,\.]+?)(?:\n|$)/i);
    if (insurerMatch) data.insurerName = insurerMatch[1].trim();
    
    // Dates
    const dates = text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g) || [];
    if (dates.length > 0) data.effectiveDate = dates[0];
    if (dates.length > 1) data.expirationDate = dates[1];
    
    // Coverage amounts
    const coverageMatch = text.match(/(?:dwelling|coverage\s+a)\s*:?\s*\$?([\d,]+)/i);
    if (coverageMatch) data.dwellingLimit = `$${coverageMatch[1]}`;
    
    // Property address
    const addressMatch = text.match(/(?:property\s+address|location)\s*:?\s*([^\n]+)/i);
    if (addressMatch) data.propertyAddress = addressMatch[1].trim();
    
    return data;
  };

  const updateWizardData = (result: any) => {
    onUpdate({
      ...data,
      policyDetails: result.policyData,
      extractionResult: result,
      fileProcessed: uploadedFile?.name,
      processingMethod: result.processingMethod,
      processingTime: result.processingTime,
      confidence: result.confidence
    });
  };

  const getMethodIcon = (method: ProcessingMethod) => {
    switch (method) {
      case 'pdf.js': return FileText;
      case 'tesseract': return Brain;
      case 'hybrid': return Zap;
      default: return FileText;
    }
  };

  const getMethodDescription = (method: ProcessingMethod) => {
    switch (method) {
      case 'pdf.js': return 'Fast text extraction from digital PDFs';
      case 'tesseract': return 'Advanced OCR with neural network processing';
      case 'hybrid': return 'Combined approach for maximum accuracy';
      default: return 'Processing document...';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Client-Side AI Policy Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Enhanced Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">PDF.js Engine</span>
              </div>
              <div className="text-xs text-blue-700">
                Fast digital text extraction
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-purple-800 mb-2">
                <Brain className="h-4 w-4" />
                <span className="text-sm font-medium">Enhanced Tesseract</span>
              </div>
              <div className="text-xs text-purple-700">
                LSTM neural network OCR
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Client-Side Only</span>
              </div>
              <div className="text-xs text-green-700">
                No uploads required
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Insurance Policy Document
              </h3>
              <p className="text-gray-600">
                Advanced client-side processing: PDF.js → Enhanced Tesseract → Hybrid Analysis
              </p>
              <div className="text-sm text-blue-600 mt-2">
                ✨ Fully client-side processing - no file uploads required
              </div>
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

          {/* Processing Status */}
          {processingStage === 'processing' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <LoadingSpinner size="sm" />
                <h4 className="font-medium text-purple-900">Processing Document...</h4>
              </div>
              <div className="flex items-center gap-2 text-purple-800">
                {React.createElement(getMethodIcon(currentMethod), { className: "h-4 w-4" })}
                <span className="text-sm">{getMethodDescription(currentMethod)}</span>
              </div>
            </div>
          )}

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

          {/* Extraction Results */}
          {extractionResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Extraction Successful</h4>
                <span className="ml-auto text-sm text-green-700">
                  Confidence: {Math.round(extractionResult.confidence * 100)}%
                </span>
              </div>

              {/* Processing Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="text-center p-2 bg-white rounded-lg">
                  <Eye className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <div className="font-medium">{extractionResult.processingMethod.toUpperCase()}</div>
                  <div className="text-gray-500">Method</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <Clock className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                  <div className="font-medium">{(processingTime / 1000).toFixed(1)}s</div>
                  <div className="text-gray-500">Time</div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-500 mx-auto mb-1" />
                  <div className="font-medium">$0.00</div>
                  <div className="text-gray-500">Cost</div>
                </div>
              </div>

              {/* Extracted Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(extractionResult.policyData).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <div key={key} className="p-2 bg-white rounded-lg">
                      <span className="text-gray-600 text-sm">{formatFieldLabel(key)}:</span>
                      <p className="font-medium text-sm">{String(value)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Process Button */}
          <div className="flex justify-center">
            <Button
              onClick={processWithClientSideAI}
              disabled={!uploadedFile || processingStage === 'processing'}
              variant="primary"
              className="flex items-center gap-2 px-8 py-3"
            >
              {processingStage === 'processing' ? (
                <>
                  <LoadingSpinner size="sm" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Process with Client-Side AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to format field labels
const formatFieldLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};
