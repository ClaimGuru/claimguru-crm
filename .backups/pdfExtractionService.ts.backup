/**
 * Hybrid PDF Extraction Service for ClaimGuru
 * Combines free client-side processing with premium cloud OCR
 */

import { supabase } from '../lib/supabase';

export interface PDFExtractionResult {
  extractedText: string;
  confidence: number;
  processingMethod: 'client' | 'textract' | 'fallback';
  processingTime: number; // Add this property
  metadata: {
    pageCount: number;
    isScanned: boolean;
    fileSize: number;
    processingTime: number;
  };
  policyData?: {
    policyNumber?: string;
    insuredName?: string;
    effectiveDate?: string;
    expirationDate?: string;
    coverageTypes?: string[];
    deductibles?: Array<{type: string, amount: number}>;
    insurerName?: string;
  };
  cost: number; // In dollars
}

export interface ExtractionConfig {
  useClientFirst: boolean;
  maxFileSize: number; // MB
  confidenceThreshold: number;
  enableTextract: boolean;
}

class PDFExtractionService {
  private config: ExtractionConfig = {
    useClientFirst: true,
    maxFileSize: 50, // 50MB max
    confidenceThreshold: 0.7,
    enableTextract: true
  };

  /**
   * Main extraction method - routes to best processor
   */
  async extractFromPDF(file: File, organizationId: string): Promise<PDFExtractionResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Check if document is suitable for client-side processing
      const documentAnalysis = await this.analyzeDocument(file);
      
      let result: PDFExtractionResult;
      
      if (documentAnalysis.isTextBased && this.config.useClientFirst) {
        // Try free client-side extraction first
        result = await this.extractClientSide(file);
        
        if (result.confidence >= this.config.confidenceThreshold) {
          result.processingTime = Date.now() - startTime;
          return result;
        }
      }
      
      // Step 2: Fall back to premium cloud extraction
      if (this.config.enableTextract) {
        result = await this.extractWithTextract(file, organizationId);
      } else {
        // Use basic server-side extraction as final fallback
        result = await this.extractServerSide(file);
      }
      
      result.processingTime = Date.now() - startTime;
      result.metadata.processingTime = result.processingTime;
      result.metadata.processingTime = result.processingTime;
      return result;
      
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  /**
   * Analyze document to determine processing strategy
   */
  private async analyzeDocument(file: File): Promise<{
    isTextBased: boolean;
    isScanned: boolean;
    estimatedPages: number;
    fileSize: number;
  }> {
    const fileSize = file.size;
    const estimatedPages = Math.ceil(fileSize / 100000); // Rough estimate
    
    // Basic heuristics for document type
    const isLikelyScanned = fileSize > 5000000; // Large files often scanned
    const isTextBased = !isLikelyScanned;
    
    return {
      isTextBased,
      isScanned: isLikelyScanned,
      estimatedPages,
      fileSize
    };
  }

  /**
   * Client-side PDF extraction using PDF.js
   */
  private async extractClientSide(file: File): Promise<PDFExtractionResult> {
    try {
      // Import PDF.js dynamically
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set up worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let extractedText = '';
      const pageCount = pdf.numPages;
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= Math.min(pageCount, 10); pageNum++) { // Limit to 10 pages for performance
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        extractedText += pageText + '\n';
      }
      
      // Calculate confidence based on text quality
      const confidence = this.calculateTextConfidence(extractedText);
      
      return {
        extractedText,
        confidence,
        processingMethod: 'client',
        processingTime: 0, // Will be set by caller
        metadata: {
          pageCount,
          isScanned: false,
          fileSize: file.size,
          processingTime: 0 // Will be set by caller
        },
        policyData: this.parseInsuranceData(extractedText),
        cost: 0 // Free
      };
      
    } catch (error) {
      console.error('Client-side extraction failed:', error);
      throw error;
    }
  }

  /**
   * AWS Textract extraction for premium processing
   */
  private async extractWithTextract(file: File, organizationId: string): Promise<PDFExtractionResult> {
    try {
      // Upload file to Supabase storage first
      const fileName = `temp-pdf-${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('policy-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Call Supabase Edge Function for Textract processing
      const { data, error } = await supabase.functions.invoke('textract-pdf-processor', {
        body: {
          filePath: uploadData.path,
          organizationId,
          processingType: 'form_analysis' // or 'text_detection' for cheaper option
        }
      });

      if (error) throw error;

      // Clean up temp file
      await supabase.storage
        .from('policy-documents')
        .remove([fileName]);

      // Calculate cost based on pages
      const estimatedPages = Math.ceil(file.size / 100000);
      const costPerPage = 0.05; // $50 per 1000 pages = $0.05 per page
      const cost = estimatedPages * costPerPage;

      return {
        extractedText: data.extractedText,
        confidence: data.confidence || 0.95,
        processingMethod: 'textract',
        processingTime: 0, // Will be set by caller
        metadata: {
          pageCount: data.pageCount || estimatedPages,
          isScanned: true,
          fileSize: file.size,
          processingTime: 0
        },
        policyData: this.parseInsuranceData(data.extractedText),
        cost
      };

    } catch (error) {
      console.error('Textract extraction failed:', error);
      throw error;
    }
  }

  /**
   * Server-side extraction fallback
   */
  private async extractServerSide(file: File): Promise<PDFExtractionResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'policy');

    const { data, error } = await supabase.functions.invoke('process-policy-document', {
      body: formData
    });

    if (error) throw error;

    return {
      extractedText: data.extractedText || '',
      confidence: data.validation?.confidence || 0.6,
      processingMethod: 'fallback',
      processingTime: 0, // Will be set by caller
      metadata: {
        pageCount: 1,
        isScanned: false,
        fileSize: file.size,
        processingTime: 0
      },
      policyData: data.policyData,
      cost: 0 // Free fallback
    };
  }

  /**
   * Calculate confidence score for extracted text
   */
  private calculateTextConfidence(text: string): number {
    if (!text || text.length < 100) return 0.1;
    
    let confidence = 0.3; // Base confidence
    
    // Check for insurance-specific terms
    const insuranceTerms = ['policy', 'coverage', 'deductible', 'premium', 'insured', 'effective'];
    const foundTerms = insuranceTerms.filter(term => 
      text.toLowerCase().includes(term)
    );
    confidence += foundTerms.length * 0.1;
    
    // Check for structured data
    if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text)) confidence += 0.1; // Dates
    if (/\$[\d,]+/.test(text)) confidence += 0.1; // Dollar amounts
    if (/[A-Z]{2,4}\d{6,}/.test(text)) confidence += 0.15; // Policy numbers
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Parse insurance-specific data from text
   */
  private parseInsuranceData(text: string): any {
    const policyData: any = {};
    
    // Extract policy number
    const policyMatch = text.match(/policy\s*#?\s*:?\s*([A-Z0-9\-]{6,20})/i);
    if (policyMatch) {
      policyData.policyNumber = policyMatch[1];
    }
    
    // Extract insured name
    const nameMatch = text.match(/insured\s*:?\s*([A-Z][a-zA-Z\s]{2,50})/i);
    if (nameMatch) {
      policyData.insuredName = nameMatch[1].trim();
    }
    
    // Extract dates
    const dates = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g) || [];
    if (dates.length > 0) {
      policyData.effectiveDate = dates[0];
    }
    if (dates.length > 1) {
      policyData.expirationDate = dates[1];
    }
    
    // Extract coverage types
    const coverageTypes = [];
    const coverageKeywords = ['dwelling', 'personal property', 'liability', 'medical', 'wind', 'hail'];
    
    for (const keyword of coverageKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        coverageTypes.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }
    
    if (coverageTypes.length > 0) {
      policyData.coverageTypes = coverageTypes;
    }
    
    // Extract insurer name
    const insurerMatch = text.match(/(insurance|mutual|assurance|company)\s*([A-Z][a-zA-Z\s&]{2,30})/i);
    if (insurerMatch) {
      policyData.insurerName = insurerMatch[2].trim();
    }
    
    return policyData;
  }

  /**
   * Get processing statistics for billing
   */
  async getProcessingStats(organizationId: string, period: 'month' | 'year' = 'month'): Promise<{
    totalDocuments: number;
    freeProcessing: number;
    premiumProcessing: number;
    totalCost: number;
    savings: number;
  }> {
    // This would query actual usage from database
    // For now, return mock data
    return {
      totalDocuments: 150,
      freeProcessing: 120,
      premiumProcessing: 30,
      totalCost: 15.75, // $0.525 per premium doc
      savings: 78.75 // Money saved by using hybrid approach
    };
  }

  /**
   * Update extraction configuration
   */
  updateConfig(newConfig: Partial<ExtractionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create and export singleton instance
export const pdfExtractionService = new PDFExtractionService();
export default pdfExtractionService;
