/**
 * Production PDF Extraction Service
 * Comprehensive service that combines multiple extraction methods with fallbacks
 */
import * as pdfjs from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { processDocumentWithTextract } from './textractService';
import { processDocumentWithVision } from './googleVisionService';
import { createClient } from '@supabase/supabase-js';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Types
export interface PDFExtractionResult {
  extractedText: string;
  pageCount: number;
  confidence: number;
  processingMethod: 'client' | 'textract' | 'vision' | 'hybrid';
  cost: number;
  policyData: {
    policyNumber?: string;
    insuredName?: string;
    effectiveDate?: string;
    expirationDate?: string;
    insurerName?: string;
    propertyAddress?: string;
    coverageAmount?: string;
    deductible?: string;
    agentName?: string;
    agentPhone?: string;
    agentEmail?: string;
    mortgagee?: string;
    loanNumber?: string;
  };
  formFields?: {
    key: string;
    value: string;
    confidence: number;
  }[];
}

export interface DocumentAnalysisResult {
  isTextBased: boolean;
  isScanned: boolean;
  isComplex: boolean;
  estimatedPages: number;
  fileSize: number;
  recommendedMethod: 'client' | 'textract' | 'vision' | 'hybrid';
}

// Main extraction function
export async function extractFromPDF(
  file: File, 
  organizationId: string = 'default',
  preferredMethod: 'auto' | 'client' | 'textract' | 'vision' | 'hybrid' = 'auto'
): Promise<PDFExtractionResult> {
  console.log('Starting PDF extraction process', { fileName: file.name, fileSize: file.size, preferredMethod });
  
  try {
    // Check cache first
    const cachedResult = await checkExtractionCache(file, organizationId);
    if (cachedResult) {
      console.log('Using cached extraction result');
      return cachedResult;
    }
    
    // Analyze document to determine best processing method
    const analysisResult = await analyzeDocument(file);
    console.log('Document analysis result:', analysisResult);
    
    // Determine extraction method
    const method = preferredMethod === 'auto' ? analysisResult.recommendedMethod : preferredMethod;
    
    let result: PDFExtractionResult;
    
    // Try extraction with the selected method
    try {
      switch (method) {
        case 'client':
          result = await extractWithPdfJs(file);
          break;
        case 'textract':
          result = await extractWithTextract(file, organizationId);
          break;
        case 'vision':
          result = await extractWithGoogleVision(file, organizationId);
          break;
        case 'hybrid':
          result = await extractWithHybridMethod(file, organizationId);
          break;
        default:
          result = await extractWithPdfJs(file); // Fallback to client-side
      }
    } catch (error) {
      console.error(`Error with ${method} extraction:`, error);
      // Fallback to client-side extraction if preferred method fails
      result = await extractWithPdfJs(file);
      result.processingMethod = `${method}_failed_fallback_to_client`;
    }
    
    // Cache the result
    await cacheExtractionResult(file, organizationId, result);
    
    return result;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw error;
  }
}

// Analyze document to determine best processing method
async function analyzeDocument(file: File): Promise<DocumentAnalysisResult> {
  // Basic analysis based on file size and type
  const fileSize = file.size;
  const fileType = file.type;
  
  // Estimate page count based on file size
  // Average PDF page size: ~100KB for text pages, ~500KB for image-heavy pages
  const estimatedPages = Math.max(1, Math.ceil(fileSize / 300000));
  
  let isTextBased = true;
  let isScanned = false;
  let isComplex = false;
  
  // Simple heuristic: Larger files are more likely to be scanned/image-based
  if (fileSize > 1000000 && estimatedPages < 5) { // >1MB but few pages suggests scanned
    isTextBased = false;
    isScanned = true;
  }
  
  // Complex if many pages or large file
  isComplex = estimatedPages > 10 || fileSize > 5000000;
  
  // Try to detect if PDF is text-based by checking first page
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    
    // If very little text is found, it's likely a scanned document
    if (textContent.items.length < 20) {
      isTextBased = false;
      isScanned = true;
    }
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    // If analysis fails, assume it's complex
    isComplex = true;
  }
  
  // Determine recommended method
  let recommendedMethod: 'client' | 'textract' | 'vision' | 'hybrid';
  
  if (isTextBased && !isComplex) {
    recommendedMethod = 'client'; // Use client-side for simple text PDFs
  } else if (isScanned) {
    recommendedMethod = 'vision'; // Google Vision is better for scanned docs
  } else if (isComplex) {
    recommendedMethod = 'textract'; // AWS Textract for complex forms
  } else {
    recommendedMethod = 'hybrid'; // Use hybrid approach for uncertain cases
  }
  
  return {
    isTextBased,
    isScanned,
    isComplex,
    estimatedPages,
    fileSize,
    recommendedMethod
  };
}

// Extract text using PDF.js (client-side)
async function extractWithPdfJs(file: File): Promise<PDFExtractionResult> {
  console.log('Extracting with PDF.js');
  
  const startTime = new Date().getTime();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  const pageCount = pdf.numPages;
  
  let extractedText = '';
  
  // Process each page
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const pageText = textContent.items
      .map((item: TextItem) => item.str)
      .join(' ');
    
    extractedText += pageText + '\n\n';
  }
  
  // Extract policy data
  const policyData = extractPolicyData(extractedText);
  
  // Calculate confidence based on policy data extracted
  const fields = Object.values(policyData).filter(Boolean);
  const confidence = Math.min(0.8, 0.5 + (fields.length / 10) * 0.5);
  
  const endTime = new Date().getTime();
  
  return {
    extractedText,
    pageCount,
    confidence,
    processingMethod: 'client',
    cost: 0, // Client-side processing is free
    policyData
  };
}

// Extract using AWS Textract
async function extractWithTextract(file: File, organizationId: string): Promise<PDFExtractionResult> {
  console.log('Extracting with AWS Textract');
  
  // Call Textract service
  const textractResult = await processDocumentWithTextract(file, organizationId);
  
  return {
    extractedText: textractResult.extractedText,
    pageCount: textractResult.pageCount,
    confidence: textractResult.confidence,
    processingMethod: 'textract',
    cost: textractResult.cost,
    policyData: textractResult.extractedPolicyData,
    formFields: textractResult.formFields
  };
}

// Extract using Google Cloud Vision
async function extractWithGoogleVision(file: File, organizationId: string): Promise<PDFExtractionResult> {
  console.log('Extracting with Google Cloud Vision');
  
  // Call Vision API service
  const visionResult = await processDocumentWithVision(file, organizationId);
  
  return {
    extractedText: visionResult.extractedText,
    pageCount: visionResult.pageCount,
    confidence: visionResult.confidence,
    processingMethod: 'vision',
    cost: visionResult.cost,
    policyData: visionResult.extractedPolicyData,
    formFields: visionResult.formFields
  };
}

// Extract using hybrid method (combines client-side and cloud)
async function extractWithHybridMethod(file: File, organizationId: string): Promise<PDFExtractionResult> {
  console.log('Extracting with hybrid method');
  
  // Try client-side first
  const clientResult = await extractWithPdfJs(file);
  
  // If client-side has good results, use it (free)
  const clientFieldCount = Object.values(clientResult.policyData).filter(Boolean).length;
  
  if (clientFieldCount >= 6 && clientResult.confidence > 0.7) {
    console.log('Client-side extraction has good results, using it');
    return clientResult;
  }
  
  // Otherwise, try Textract
  try {
    console.log('Client-side extraction insufficient, trying Textract');
    const textractResult = await extractWithTextract(file, organizationId);
    
    // Merge results
    const mergedPolicyData = { ...clientResult.policyData };
    
    // Override with Textract data where available
    Object.entries(textractResult.policyData).forEach(([key, value]) => {
      if (value) {
        mergedPolicyData[key] = value;
      }
    });
    
    return {
      extractedText: textractResult.extractedText || clientResult.extractedText,
      pageCount: textractResult.pageCount || clientResult.pageCount,
      confidence: Math.max(textractResult.confidence, clientResult.confidence),
      processingMethod: 'hybrid',
      cost: textractResult.cost, // Still pay for Textract
      policyData: mergedPolicyData,
      formFields: textractResult.formFields
    };
  } catch (error) {
    console.error('Textract extraction failed in hybrid method:', error);
    return clientResult; // Fallback to client-side result
  }
}

// Extract policy data from text
function extractPolicyData(text: string): any {
  const policyData: any = {};
  
  // Policy number
  const policyNumberMatches = [
    /policy\s*(?:#|number|no)?\s*[:=]?\s*([A-Z0-9\-]{5,20})/i,
    /policy\s*(?:#|number|no)?[^A-Za-z0-9]*([A-Z0-9\-]{5,20})/i
  ];
  
  for (const regex of policyNumberMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      policyData.policyNumber = match[1].trim();
      break;
    }
  }
  
  // Insured name
  const insuredNameMatches = [
    /(?:named\s+)?insured\s*[:=]?\s*([A-Z][A-Za-z\s,&.'-]{2,40}?)(?:\r|\n|,)/i,
    /(?:named\s+)?insured\s*[:=]?\s*([A-Z][A-Za-z\s,&.'-]{2,40})/i
  ];
  
  for (const regex of insuredNameMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      policyData.insuredName = match[1].trim();
      break;
    }
  }
  
  // Effective date
  const effectiveDateMatches = [
    /(?:effective|policy)\s*(?:date|period|from)?\s*[:=]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
    /(?:policy|coverage)\s+(?:period|dates?)?\s*[:=]?\s*(?:from)?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
    /effective\s*[:=]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
    /(?:from|begins?|starts?)\s*[:=]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i
  ];
  
  for (const regex of effectiveDateMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      policyData.effectiveDate = match[1].trim();
      break;
    }
  }
  
  // Expiration date
  const expirationDateMatches = [
    /(?:expiration|expiry|expires|expiring)\s*(?:date)?\s*[:=]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
    /(?:to|until|through)\s*[:=]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i
  ];
  
  for (const regex of expirationDateMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      policyData.expirationDate = match[1].trim();
      break;
    }
  }
  
  // Insurance company
  const insurerMatches = [
    /(?:insurance\s+company|insurer|carrier)\s*[:=]?\s*([A-Z][A-Za-z\s,.&'-]{2,60}?)(?:\r|\n|,)/i,
    /(?:insurance\s+company|insurer|carrier)\s*[:=]?\s*([A-Z][A-Za-z\s,.&'-]{2,60})/i,
    /([A-Z][A-Za-z\s,.&'-]{2,40}?)\s*(?:Insurance|Casualty|Indemnity|Underwriters)(?:\s+Company|\s+Corporation|\s+Inc\.?)?/
  ];
  
  for (const regex of insurerMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      policyData.insurerName = match[1].trim();
      break;
    }
  }
  
  // Property address
  const addressMatches = [
    /(?:property\s+address|insured\s+location|location\s+of\s+risk)\s*[:=]?\s*([0-9][A-Za-z0-9\s,.'-]{5,100}?)(?:\r|\n|,)/i,
    /(?:property\s+address|insured\s+location|location)\s*[:=]?\s*([0-9][A-Za-z0-9\s,.'-]{5,100})/i,
    /(?:premises|property)\s+(?:located\s+at|address|location)\s*[:=]?\s*([0-9][A-Za-z0-9\s,.'-]{5,100})/i
  ];
  
  for (const regex of addressMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      policyData.propertyAddress = match[1].trim();
      break;
    }
  }
  
  // Coverage amount
  const coverageMatches = [
    /(?:coverage\s+a|dwelling|building)\s*(?:limit|coverage|amount)?\s*[:=]?\s*\$?\s*([0-9,.]{4,15})/i,
    /(?:coverage\s+a|dwelling|building)\s*(?:limit|coverage|amount)?\s*[:=]?\s*([0-9,.]{4,15})/i,
    /(?:limit|amount|coverage|insurance)\s+(?:of|for)\s+(?:coverage\s+a|dwelling|building)\s*[:=]?\s*\$?\s*([0-9,.]{4,15})/i
  ];
  
  for (const regex of coverageMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      policyData.coverageAmount = '$' + match[1].replace(/[^\d.]/g, '');
      break;
    }
  }
  
  // Deductible
  const deductibleMatches = [
    /(?:deductible|ded)(?:\s+amount)?\s*[:=]?\s*\$?\s*([0-9,.]{3,10})/i,
    /(?:all\s+(?:other\s+)?peril|aop)\s+(?:deductible|ded)\s*[:=]?\s*\$?\s*([0-9,.]{3,10})/i
  ];
  
  for (const regex of deductibleMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      policyData.deductible = '$' + match[1].replace(/[^\d.]/g, '');
      break;
    }
  }
  
  return policyData;
}

// Check if extraction result is cached
async function checkExtractionCache(file: File, organizationId: string): Promise<PDFExtractionResult | null> {
  try {
    // Calculate file hash for cache key
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase configuration missing, cannot check cache');
      return null;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check cache
    const { data, error } = await supabase
      .from('pdf_extraction_cache')
      .select('*')
      .eq('file_hash', hashHex)
      .eq('organization_id', organizationId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Return cached result
    return {
      extractedText: data.extracted_text,
      pageCount: data.page_count,
      confidence: data.confidence,
      processingMethod: data.processing_method,
      cost: 0, // No cost for cached results
      policyData: data.policy_data,
      formFields: data.form_fields
    };
  } catch (error) {
    console.error('Error checking extraction cache:', error);
    return null;
  }
}

// Cache extraction result
async function cacheExtractionResult(file: File, organizationId: string, result: PDFExtractionResult): Promise<void> {
  try {
    // Calculate file hash for cache key
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase configuration missing, cannot cache result');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Store in cache
    const { error } = await supabase
      .from('pdf_extraction_cache')
      .upsert({
        file_hash: hashHex,
        organization_id: organizationId,
        file_name: file.name,
        file_size: file.size,
        extracted_text: result.extractedText,
        page_count: result.pageCount,
        confidence: result.confidence,
        processing_method: result.processingMethod,
        policy_data: result.policyData,
        form_fields: result.formFields,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error caching extraction result:', error);
    }
  } catch (error) {
    console.error('Error caching extraction result:', error);
  }
}