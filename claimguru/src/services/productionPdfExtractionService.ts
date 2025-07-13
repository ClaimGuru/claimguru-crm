/**
 * PRODUCTION PDF EXTRACTION SERVICE - ClaimGuru
 * 
 * Real PDF text extraction using PDF.js with intelligent policy data parsing
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.js';
}

export interface PolicyExtractionResult {
  extractedText: string;
  confidence: number;
  processingMethod: 'client-side' | 'textract';
  cost: number;
  processingTime: number;
  policyData: {
    policyNumber?: string;
    insuredName?: string;
    effectiveDate?: string;
    expirationDate?: string;
    insurerName?: string;
    propertyAddress?: string;
    dwellingCoverage?: string;
    personalProperty?: string;
    liability?: string;
    deductible?: string;
    premium?: string;
    agentName?: string;
    agentPhone?: string;
    mortgageeLender?: string;
    loanNumber?: string;
  };
  metadata: {
    pageCount: number;
    fileSize: number;
    fileName: string;
    processingDate: string;
  };
}

export class ProductionPdfExtractionService {
  
  /**
   * Extract text and policy data from PDF file with real parsing
   */
  async extractFromPDF(file: File, organizationId?: string): Promise<PolicyExtractionResult> {
    const startTime = Date.now();
    console.log('🔄 Starting production PDF extraction for:', file.name);
    
    try {
      // Extract text using PDF.js
      const extractedText = await this.extractTextWithPDFJS(file);
      console.log('✅ Text extraction completed, length:', extractedText.length);
      
      // Parse policy data using advanced patterns
      const policyData = this.parseInsurancePolicyData(extractedText);
      console.log('📋 Policy data extracted:', policyData);
      
      // Calculate confidence based on extracted fields
      const confidence = this.calculateConfidence(policyData, extractedText);
      
      const processingTime = Date.now() - startTime;
      
      return {
        extractedText,
        confidence,
        processingMethod: 'client-side',
        cost: 0, // Free client-side processing
        processingTime,
        policyData,
        metadata: {
          pageCount: await this.getPageCount(file),
          fileSize: file.size,
          fileName: file.name,
          processingDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ PDF extraction failed:', error);
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF using PDF.js
   */
  private async extractTextWithPDFJS(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let fullText = '';
      const pageCount = pdf.numPages;
      
      console.log(`📄 Processing ${pageCount} pages...`);
      
      // Process each page (limit to 20 pages for performance)
      for (let pageNum = 1; pageNum <= Math.min(pageCount, 20); pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + '\n';
          console.log(`✅ Page ${pageNum} processed`);
        } catch (pageError) {
          console.warn(`⚠️ Error processing page ${pageNum}:`, pageError);
        }
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('❌ PDF.js extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Get page count from PDF
   */
  private async getPageCount(file: File): Promise<number> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      return pdf.numPages;
    } catch {
      return 1; // Default fallback
    }
  }

  /**
   * Parse insurance policy data using comprehensive patterns
   */
  private parseInsurancePolicyData(text: string): PolicyExtractionResult['policyData'] {
    console.log('🔍 Parsing insurance policy data...');
    
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const policyData: PolicyExtractionResult['policyData'] = {};

    // Policy Number patterns
    const policyPatterns = [
      /policy\s*(?:number|#|no\.?)\s*:?\s*([A-Z0-9\-\s]{6,25})/i,
      /policy\s*([A-Z0-9\-\s]{6,25})/i,
      /(?:policy|pol)\s*#?\s*([A-Z0-9\-\s]{6,25})/i
    ];
    policyData.policyNumber = this.extractWithPatterns(cleanText, policyPatterns);

    // Insured Name patterns
    const namePatterns = [
      /insured\s*:?\s*([A-Z][a-zA-Z\s,&.]{2,50})/i,
      /policyholder\s*:?\s*([A-Z][a-zA-Z\s,&.]{2,50})/i,
      /named\s*insured\s*:?\s*([A-Z][a-zA-Z\s,&.]{2,50})/i
    ];
    policyData.insuredName = this.extractWithPatterns(cleanText, namePatterns);

    // Insurance Company patterns
    const insurerPatterns = [
      /insurance\s*company\s*:?\s*([A-Z][a-zA-Z\s&.]{2,50})/i,
      /insurer\s*:?\s*([A-Z][a-zA-Z\s&.]{2,50})/i,
      /company\s*:?\s*([A-Z][a-zA-Z\s&.]{2,50})\s*insurance/i
    ];
    policyData.insurerName = this.extractWithPatterns(cleanText, insurerPatterns);

    // Date patterns
    const datePatterns = [
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/g,
      /\b([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})\b/g
    ];
    const dates = this.extractDates(cleanText);
    if (dates.length >= 2) {
      policyData.effectiveDate = dates[0];
      policyData.expirationDate = dates[1];
    } else if (dates.length === 1) {
      policyData.effectiveDate = dates[0];
    }

    // Property Address patterns
    const addressPatterns = [
      /property\s*address\s*:?\s*([^\n\r]{10,100})/i,
      /location\s*:?\s*([^\n\r]{10,100})/i,
      /insured\s*location\s*:?\s*([^\n\r]{10,100})/i
    ];
    policyData.propertyAddress = this.extractWithPatterns(cleanText, addressPatterns);

    // Coverage amounts
    const coveragePatterns = [
      /dwelling\s*(?:coverage|protection)?\s*:?\s*\$?([0-9,]+)/i,
      /coverage\s*a\s*:?\s*\$?([0-9,]+)/i
    ];
    const dwellingAmount = this.extractWithPatterns(cleanText, coveragePatterns);
    if (dwellingAmount) {
      policyData.dwellingCoverage = `$${dwellingAmount.replace(/[^\d,]/g, '')}`;
    }

    // Personal Property
    const personalPropertyPatterns = [
      /personal\s*property\s*(?:coverage|protection)?\s*:?\s*\$?([0-9,]+)/i,
      /coverage\s*c\s*:?\s*\$?([0-9,]+)/i
    ];
    const personalPropertyAmount = this.extractWithPatterns(cleanText, personalPropertyPatterns);
    if (personalPropertyAmount) {
      policyData.personalProperty = `$${personalPropertyAmount.replace(/[^\d,]/g, '')}`;
    }

    // Liability
    const liabilityPatterns = [
      /liability\s*(?:coverage|protection)?\s*:?\s*\$?([0-9,]+)/i,
      /coverage\s*e\s*:?\s*\$?([0-9,]+)/i
    ];
    const liabilityAmount = this.extractWithPatterns(cleanText, liabilityPatterns);
    if (liabilityAmount) {
      policyData.liability = `$${liabilityAmount.replace(/[^\d,]/g, '')}`;
    }

    // Deductible
    const deductiblePatterns = [
      /deductible\s*:?\s*\$?([0-9,]+)/i,
      /deductible\s*amount\s*:?\s*\$?([0-9,]+)/i
    ];
    const deductibleAmount = this.extractWithPatterns(cleanText, deductiblePatterns);
    if (deductibleAmount) {
      policyData.deductible = `$${deductibleAmount.replace(/[^\d,]/g, '')}`;
    }

    // Premium
    const premiumPatterns = [
      /premium\s*:?\s*\$?([0-9,]+\.?\d{0,2})/i,
      /total\s*premium\s*:?\s*\$?([0-9,]+\.?\d{0,2})/i,
      /annual\s*premium\s*:?\s*\$?([0-9,]+\.?\d{0,2})/i
    ];
    const premiumAmount = this.extractWithPatterns(cleanText, premiumPatterns);
    if (premiumAmount) {
      policyData.premium = `$${premiumAmount.replace(/[^\d.,]/g, '')}`;
    }

    // Agent information
    const agentPatterns = [
      /agent\s*(?:name)?\s*:?\s*([A-Z][a-zA-Z\s.]{2,30})/i,
      /producer\s*:?\s*([A-Z][a-zA-Z\s.]{2,30})/i
    ];
    policyData.agentName = this.extractWithPatterns(cleanText, agentPatterns);

    // Phone numbers
    const phonePatterns = [
      /(\(\d{3}\)\s*\d{3}-\d{4})/,
      /(\d{3}-\d{3}-\d{4})/,
      /(\d{3}\.\d{3}\.\d{4})/
    ];
    policyData.agentPhone = this.extractWithPatterns(cleanText, phonePatterns);

    // Mortgagee/Lender
    const mortgageePatterns = [
      /mortgagee\s*:?\s*([A-Z][a-zA-Z\s&.]{2,50})/i,
      /lender\s*:?\s*([A-Z][a-zA-Z\s&.]{2,50})/i,
      /loss\s*payee\s*:?\s*([A-Z][a-zA-Z\s&.]{2,50})/i
    ];
    policyData.mortgageeLender = this.extractWithPatterns(cleanText, mortgageePatterns);

    // Loan number
    const loanPatterns = [
      /loan\s*(?:number|#|no\.?)\s*:?\s*([A-Z0-9\-]{6,20})/i,
      /account\s*(?:number|#|no\.?)\s*:?\s*([A-Z0-9\-]{6,20})/i
    ];
    policyData.loanNumber = this.extractWithPatterns(cleanText, loanPatterns);

    console.log('✅ Policy data parsing completed:', Object.keys(policyData).length, 'fields extracted');
    return policyData;
  }

  /**
   * Extract text using multiple patterns
   */
  private extractWithPatterns(text: string, patterns: RegExp[]): string | undefined {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  /**
   * Extract dates from text
   */
  private extractDates(text: string): string[] {
    const dates: string[] = [];
    
    // MM/DD/YYYY or MM-DD-YYYY
    const numericDates = text.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/g);
    if (numericDates) {
      dates.push(...numericDates);
    }
    
    // Month DD, YYYY
    const textDates = text.match(/\b([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})\b/g);
    if (textDates) {
      dates.push(...textDates);
    }
    
    return dates.slice(0, 2); // Return max 2 dates
  }

  /**
   * Calculate confidence score based on extracted data
   */
  private calculateConfidence(policyData: PolicyExtractionResult['policyData'], text: string): number {
    let confidence = 0.3; // Base confidence
    
    // Text length factor
    if (text.length > 500) confidence += 0.1;
    if (text.length > 2000) confidence += 0.1;
    
    // Field extraction bonuses
    if (policyData.policyNumber) confidence += 0.15;
    if (policyData.insuredName) confidence += 0.15;
    if (policyData.insurerName) confidence += 0.1;
    if (policyData.effectiveDate) confidence += 0.1;
    if (policyData.propertyAddress) confidence += 0.1;
    if (policyData.dwellingCoverage) confidence += 0.05;
    if (policyData.deductible) confidence += 0.05;
    if (policyData.premium) confidence += 0.05;
    
    // Insurance keyword detection
    const insuranceKeywords = ['policy', 'coverage', 'deductible', 'premium', 'insured', 'liability'];
    const foundKeywords = insuranceKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    confidence += (foundKeywords / insuranceKeywords.length) * 0.1;
    
    return Math.min(confidence, 0.98); // Cap at 98%
  }
}

// Export singleton instance
export const productionPdfExtractionService = new ProductionPdfExtractionService();