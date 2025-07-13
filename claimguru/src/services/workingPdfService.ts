import * as pdfjsLib from 'pdfjs-dist';

// Ensure PDF.js worker is properly set
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.js';

export interface PolicyData {
  policyNumber?: string;
  insuredName?: string;
  effectiveDate?: string;
  expirationDate?: string;
  insurerName?: string;
  propertyAddress?: string;
  dwellingLimit?: string;
  personalPropertyLimit?: string;
  liabilityLimit?: string;
  deductibleAmount?: string;
  mortgageeInfo?: string;
  agentInfo?: string;
}

export interface PDFExtractionResult {
  extractedText: string;
  pageCount: number;
  confidence: number;
  policyData: PolicyData;
  status: 'success' | 'partial' | 'failed';
  error?: string;
}

export class WorkingPdfService {
  /**
   * Extract text from a PDF file using PDF.js
   */
  async extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
    console.log('Starting PDF extraction with PDF.js', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type 
    });
    
    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await this.fileToArrayBuffer(file);
      
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully: ${pdf.numPages} pages`);
      
      // Extract text from each page
      let extractedText = '';
      const pageCount = pdf.numPages;
      
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        console.log(`Processing page ${pageNum}/${pageCount}`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map(item => 'str' in item ? item.str : '')
          .join(' ');
        
        extractedText += pageText + '\\n';
      }
      
      console.log('Text extraction complete', { textLength: extractedText.length });
      
      // Parse policy data from extracted text
      const policyData = this.parsePolicyData(extractedText);
      console.log('Parsed policy data', policyData);
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(extractedText, policyData);
      
      return {
        extractedText,
        pageCount,
        confidence,
        policyData,
        status: 'success'
      };
    } catch (error) {
      console.error('PDF extraction failed:', error);
      return {
        extractedText: '',
        pageCount: 0,
        confidence: 0,
        policyData: {},
        status: 'failed',
        error: error.message
      };
    }
  }
  
  /**
   * Convert File to ArrayBuffer
   */
  private fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }
  
  /**
   * Parse policy data from extracted text
   */
  private parsePolicyData(text: string): PolicyData {
    console.log('Parsing policy data from text');
    const policyData: PolicyData = {};
    
    // Policy Number (various formats)
    const policyNumberRegexes = [
      /policy\s*(?:number|#)?\s*:?\s*([A-Z0-9\-\s]{4,20})/i,
      /(?:policy|certificate|contract)\s*(?:number|#|no\.?)?\s*:?\s*([A-Z0-9\-\s]{4,20})/i,
      /(?:^|\s)([A-Z]{2,5}[-\s]?[0-9]{5,10})/m
    ];
    
    for (const regex of policyNumberRegexes) {
      const match = text.match(regex);
      if (match) {
        policyData.policyNumber = match[1].trim();
        console.log('Found policy number:', policyData.policyNumber);
        break;
      }
    }
    
    // Insured Name
    const insuredNameRegexes = [
      /(?:named\s+)?insured\s*:?\s*([A-Z][a-zA-Z\s\.,&'-]{2,50})/i,
      /(?:policy\s+holder|policyholder)\s*:?\s*([A-Z][a-zA-Z\s\.,&'-]{2,50})/i
    ];
    
    for (const regex of insuredNameRegexes) {
      const match = text.match(regex);
      if (match) {
        policyData.insuredName = match[1].trim();
        console.log('Found insured name:', policyData.insuredName);
        break;
      }
    }
    
    // Insurance Company
    const insurerRegexes = [
      /(?:insurance\s+company|insurer|carrier)\s*:?\s*([A-Z][a-zA-Z\s\.,&'-]{2,50})/i,
      /(?:underwritten|issued)\s+by\s+([A-Z][a-zA-Z\s\.,&'-]{2,50})/i
    ];
    
    for (const regex of insurerRegexes) {
      const match = text.match(regex);
      if (match) {
        policyData.insurerName = match[1].trim();
        console.log('Found insurer name:', policyData.insurerName);
        break;
      }
    }
    
    // Property Address
    const addressRegexes = [
      /(?:property|insured)\s+(?:address|location)\s*:?\s*([0-9][a-zA-Z0-9\s\.,#'-]{5,100})/i,
      /(?:location|premises)\s+(?:address|described)\s*:?\s*([0-9][a-zA-Z0-9\s\.,#'-]{5,100})/i
    ];
    
    for (const regex of addressRegexes) {
      const match = text.match(regex);
      if (match) {
        policyData.propertyAddress = match[1].trim();
        console.log('Found property address:', policyData.propertyAddress);
        break;
      }
    }
    
    // Policy Dates
    const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+ \d{1,2},? \d{4})/g;
    const dates = text.match(dateRegex);
    
    if (dates && dates.length >= 2) {
      // Try to find dates near "effective" and "expiration" keywords
      const effectiveIndex = text.search(/(?:effective|policy|from|begin|start)\s+(?:date|period|term)/i);
      const expirationIndex = text.search(/(?:expiration|expires|to|until|end)\s+(?:date|period|term)/i);
      
      if (effectiveIndex >= 0 && expirationIndex >= 0) {
        // Find dates closest to these keywords
        let closestEffectiveDate = null;
        let closestExpirationDate = null;
        let minEffectiveDist = Infinity;
        let minExpirationDist = Infinity;
        
        for (const date of dates) {
          const dateIndex = text.indexOf(date);
          const effectiveDist = Math.abs(dateIndex - effectiveIndex);
          const expirationDist = Math.abs(dateIndex - expirationIndex);
          
          if (effectiveDist < minEffectiveDist) {
            minEffectiveDist = effectiveDist;
            closestEffectiveDate = date;
          }
          
          if (expirationDist < minExpirationDist) {
            minExpirationDist = expirationDist;
            closestExpirationDate = date;
          }
        }
        
        policyData.effectiveDate = closestEffectiveDate;
        policyData.expirationDate = closestExpirationDate;
        console.log('Found policy dates:', { 
          effectiveDate: policyData.effectiveDate, 
          expirationDate: policyData.expirationDate 
        });
      } else {
        // If no specific keywords, use first two dates
        policyData.effectiveDate = dates[0];
        policyData.expirationDate = dates[1];
        console.log('Using first two dates found:', { 
          effectiveDate: policyData.effectiveDate, 
          expirationDate: policyData.expirationDate 
        });
      }
    }
    
    // Coverage Limits
    const dwellingRegexes = [
      /(?:coverage\s+a|dwelling)(?:\s+(?:limit|protection|coverage))?\s*:?\s*\$?\s*([\d,]+)/i,
      /dwelling(?:\s+(?:limit|protection|coverage))?\s*:?\s*\$?\s*([\d,]+)/i
    ];
    
    for (const regex of dwellingRegexes) {
      const match = text.match(regex);
      if (match) {
        policyData.dwellingLimit = `$${match[1]}`;
        console.log('Found dwelling limit:', policyData.dwellingLimit);
        break;
      }
    }
    
    const personalPropertyRegexes = [
      /(?:coverage\s+c|personal\s+property)(?:\s+(?:limit|protection|coverage))?\s*:?\s*\$?\s*([\d,]+)/i,
      /personal\s+property(?:\s+(?:limit|protection|coverage))?\s*:?\s*\$?\s*([\d,]+)/i
    ];
    
    for (const regex of personalPropertyRegexes) {
      const match = text.match(regex);
      if (match) {
        policyData.personalPropertyLimit = `$${match[1]}`;
        console.log('Found personal property limit:', policyData.personalPropertyLimit);
        break;
      }
    }
    
    const liabilityRegexes = [
      /(?:coverage\s+e|(?:personal\s+)?liability)(?:\s+(?:limit|protection|coverage))?\s*:?\s*\$?\s*([\d,]+)/i,
      /liability(?:\s+(?:limit|protection|coverage))?\s*:?\s*\$?\s*([\d,]+)/i
    ];
    
    for (const regex of liabilityRegexes) {
      const match = text.match(regex);
      if (match) {
        policyData.liabilityLimit = `$${match[1]}`;
        console.log('Found liability limit:', policyData.liabilityLimit);
        break;
      }
    }
    
    // Deductible
    const deductibleRegexes = [
      /deductible\s*:?\s*\$?\s*([\d,]+)/i,
      /(?:all\s+peril|aop)\s+deductible\s*:?\s*\$?\s*([\d,]+)/i
    ];
    
    for (const regex of deductibleRegexes) {
      const match = text.match(regex);
      if (match) {
        policyData.deductibleAmount = `$${match[1]}`;
        console.log('Found deductible amount:', policyData.deductibleAmount);
        break;
      }
    }
    
    // Mortgagee Information
    const mortgageeRegex = /(?:mortgagee|lienholder|mortgage\s+company|lender)\s*:?\s*([A-Z][a-zA-Z0-9\s\.,&'-]{2,100})/i;
    const mortgageeMatch = text.match(mortgageeRegex);
    if (mortgageeMatch) {
      policyData.mortgageeInfo = mortgageeMatch[1].trim();
      console.log('Found mortgagee info:', policyData.mortgageeInfo);
    }
    
    // Agent Information
    const agentRegex = /(?:agent|producer|broker)\s*:?\s*([A-Z][a-zA-Z0-9\s\.,&'-]{2,100})/i;
    const agentMatch = text.match(agentRegex);
    if (agentMatch) {
      policyData.agentInfo = agentMatch[1].trim();
      console.log('Found agent info:', policyData.agentInfo);
    }
    
    return policyData;
  }
  
  /**
   * Calculate confidence score based on extracted data
   */
  private calculateConfidence(text: string, policyData: PolicyData): number {
    // Start with base confidence
    let confidence = 0.3;
    
    // Increase confidence based on text length
    if (text.length > 500) confidence += 0.05;
    if (text.length > 1000) confidence += 0.05;
    if (text.length > 5000) confidence += 0.05;
    
    // Increase confidence based on extracted fields
    if (policyData.policyNumber) confidence += 0.1;
    if (policyData.insuredName) confidence += 0.1;
    if (policyData.insurerName) confidence += 0.05;
    if (policyData.propertyAddress) confidence += 0.05;
    if (policyData.effectiveDate) confidence += 0.05;
    if (policyData.expirationDate) confidence += 0.05;
    if (policyData.dwellingLimit) confidence += 0.05;
    if (policyData.deductibleAmount) confidence += 0.05;
    
    // Identify insurance-specific keywords
    const insuranceKeywords = [
      'policy', 'coverage', 'insured', 'premium', 'deductible', 'liability',
      'property', 'dwelling', 'peril', 'endorsement', 'underwriting', 'claim'
    ];
    
    const keywordCount = insuranceKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    
    confidence += Math.min(0.1, keywordCount * 0.01);
    
    // Cap confidence at 1.0
    return Math.min(confidence, 1.0);
  }
}

// Export a singleton instance
export const workingPdfService = new WorkingPdfService();