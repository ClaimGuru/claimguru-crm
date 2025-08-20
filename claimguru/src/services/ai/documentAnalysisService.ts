/**
 * Document Analysis Service
 * Provides AI-powered document analysis using OpenAI via Supabase Edge Function
 */

import { configService } from '../configService';
import { supabase } from '../../lib/supabase';

export interface DocumentAnalysisRequest {
  documentText: string;
  documentType?: 'policy' | 'claim' | 'invoice' | 'correspondence' | 'misc';
  specificFields?: string[];
}

export interface DocumentAnalysisResult {
  success: boolean;
  policyData?: Record<string, any>;
  extractedFields?: string[] | number;
  processingMethod?: string;
  error?: {
    code: string;
    message: string;
  };
}

class DocumentAnalysisService {
  private static instance: DocumentAnalysisService;

  private constructor() {}

  public static getInstance(): DocumentAnalysisService {
    if (!DocumentAnalysisService.instance) {
      DocumentAnalysisService.instance = new DocumentAnalysisService();
    }
    return DocumentAnalysisService.instance;
  }

  /**
   * Analyze document text using OpenAI edge function
   */
  public async analyzeDocument(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResult> {
    try {
      if (!configService.isOpenAIEnabled()) {
        console.warn('OpenAI integration is not enabled. Using mock response.');
        return this.getMockAnalysisResult(request);
      }

      // Call the OpenAI edge function through Supabase
      const { data, error } = await supabase.functions.invoke('openai-extract-fields', {
        body: { text: request.documentText }
      });

      if (error) {
        console.error('OpenAI edge function error:', error);
        throw new Error(`Failed to analyze document: ${error.message}`);
      }

      return {
        success: true,
        policyData: data?.policyData || {},
        extractedFields: data?.extractedFields || [],
        processingMethod: 'openai-gpt'
      };
    } catch (error: any) {
      console.error('Document analysis failed:', error);
      
      // If OpenAI fails, fall back to mock responses
      return {
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: error.message || 'Document analysis failed'
        }
      };
    }
  }

  /**
   * Enhanced document analysis with more comprehensive extraction
   * Uses the enhanced OpenAI edge function for better field extraction
   */
  public async analyzeDocumentEnhanced(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResult> {
    try {
      if (!configService.isOpenAIEnabled()) {
        console.warn('OpenAI integration is not enabled. Using mock response.');
        return this.getMockAnalysisResult(request);
      }

      // Call the enhanced OpenAI edge function through Supabase
      const { data, error } = await supabase.functions.invoke('openai-extract-fields-enhanced', {
        body: { text: request.documentText }
      });

      if (error) {
        console.error('Enhanced OpenAI edge function error:', error);
        throw new Error(`Failed to analyze document: ${error.message}`);
      }

      return {
        success: true,
        policyData: data?.policyData || {},
        extractedFields: Object.keys(data?.policyData || {}).length,
        processingMethod: 'openai-gpt4o'
      };
    } catch (error: any) {
      console.error('Enhanced document analysis failed:', error);
      
      // If OpenAI fails, fall back to mock responses
      return {
        success: false,
        error: {
          code: 'ENHANCED_ANALYSIS_FAILED',
          message: error.message || 'Enhanced document analysis failed'
        }
      };
    }
  }

  /**
   * Extracts text from a PDF file
   * In a real implementation, this would use PDF.js or a similar library
   */
  public async extractTextFromPDF(file: File): Promise<string> {
    // In a real implementation, this would use PDF.js or a similar library
    // For now, we'll just return a mock placeholder
    
    // This would be replaced with actual PDF text extraction
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Sample extracted text from ${file.name}. 
In a real implementation, this would contain the actual text content extracted from the PDF file.`);
      }, 1000);
    });
  }

  /**
   * Fallback mock analysis for when OpenAI is not available
   */
  private getMockAnalysisResult(request: DocumentAnalysisRequest): DocumentAnalysisResult {
    console.log('Using mock document analysis result');
    
    // Generate a mock policy data result based on request
    const mockPolicyData: Record<string, any> = {
      policyNumber: 'POL-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      insuredName: 'John Smith',
      effectiveDate: '2025-01-01',
      expirationDate: '2026-01-01',
      propertyAddress: '123 Main Street, Anytown, CA 12345',
      coverageAmount: '$500,000',
      deductible: '$2,500',
      premium: '$1,200',
      mortgageAccountNumber: null,
      coverageTypes: ['Dwelling', 'Personal Property', 'Liability']
    };

    // Look for patterns in the document text to enhance mock data
    if (request.documentText) {
      const text = request.documentText.toLowerCase();
      
      // Basic pattern matching for key policy data
      const policyMatch = text.match(/policy\s*(?:number|#|no)?\s*[:\-]?\s*([a-z0-9\-]{5,20})/i);
      if (policyMatch && policyMatch[1]) {
        mockPolicyData.policyNumber = policyMatch[1].toUpperCase();
      }

      const nameMatch = text.match(/(?:insured|policy holder)\s*[:\-]?\s*([a-z\s\.]{5,40})/i);
      if (nameMatch && nameMatch[1]) {
        mockPolicyData.insuredName = nameMatch[1].trim();
      }
    }

    return {
      success: true,
      policyData: mockPolicyData,
      extractedFields: Object.keys(mockPolicyData),
      processingMethod: 'mock-fallback'
    };
  }
}

export const documentAnalysisService = DocumentAnalysisService.getInstance();
export default documentAnalysisService;
