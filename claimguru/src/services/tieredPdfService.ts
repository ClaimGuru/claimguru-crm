import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { supabase } from '../lib/supabase';
import { enhancedTesseractService, EnhancedOCRResult } from './enhancedTesseractService';

// Set PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.js';

export interface TieredExtractionResult {
  extractedText: string;
  confidence: number;
  processingMethod: 'pdf.js' | 'tesseract' | 'google-vision';
  cost: number;
  processingTime: number;
  policyData: {
    policyNumber?: string;
    insuredName?: string;
    insurerName?: string;
    effectiveDate?: string;
    expirationDate?: string;
    propertyAddress?: string;
    dwellingLimit?: string;
    personalPropertyLimit?: string;
    liabilityLimit?: string;
    deductibleAmount?: string;
    totalPremium?: string;
    agentName?: string;
    agentPhone?: string;
    mortgageeLender?: string;
    loanNumber?: string;
  };
  metadata: {
    fileSize: number;
    pageCount: number;
    isScanned: boolean;
    enhancedExtraction?: boolean;
  };
}

export class TieredPdfService {
  private googleVisionApiKey: string | null = null;
  private apiKeyInitialized: boolean = false;

  constructor() {
    // API key will be retrieved from Supabase secrets automatically
  }

  private async initializeGoogleVisionApiKey(): Promise<void> {
    if (this.apiKeyInitialized) return;

    try {
      // Try multiple methods to retrieve Google Vision API key from Supabase
      
      // Method 1: Try vault table
      let { data, error } = await supabase
        .from('vault')
        .select('value')
        .eq('key', 'GOOGLE_VISION_API_KEY')
        .single();

      if (error || !data?.value) {
        // Method 2: Try secrets table if vault doesn't exist
        const secretsResult = await supabase
          .from('secrets')
          .select('value')
          .eq('name', 'GOOGLE_VISION_API_KEY')
          .single();
        
        if (secretsResult.data?.value) {
          data = secretsResult.data;
          error = null;
        }
      }

      if (error || !data?.value) {
        // Method 3: Try environment variables or settings table
        const settingsResult = await supabase
          .from('organization_settings')
          .select('setting_value')
          .eq('setting_key', 'google_vision_api_key')
          .single();
        
        if (settingsResult.data?.setting_value) {
          this.googleVisionApiKey = settingsResult.data.setting_value;
          console.log('Google Vision API key retrieved from organization settings');
          this.apiKeyInitialized = true;
          return;
        }
      }

      if (error || !data?.value) {
        console.warn('Google Vision API key not found in any storage method');
        this.googleVisionApiKey = null;
      } else {
        this.googleVisionApiKey = data.value;
        console.log('Google Vision API key successfully retrieved from secrets');
      }
    } catch (error) {
      console.warn('Failed to retrieve Google Vision API key:', error);
      this.googleVisionApiKey = null;
    }

    this.apiKeyInitialized = true;
  }

  setGoogleVisionApiKey(apiKey: string) {
    this.googleVisionApiKey = apiKey;
    this.apiKeyInitialized = true;
  }

  async extractFromPDF(file: File, organizationId: string = 'default'): Promise<TieredExtractionResult> {
    const startTime = Date.now();
    const fileSize = file.size;
    
    // Initialize Google Vision API key from Supabase secrets
    await this.initializeGoogleVisionApiKey();
    
    console.log('Starting tiered PDF extraction for:', file.name);
    
    try {
      // Tier 1: PDF.js (client-side, free)
      const pdfResult = await this.tryPdfJsExtraction(file);
      if (pdfResult.success && pdfResult.confidence > 0.7) {
        console.log('PDF.js extraction successful');
        return this.formatResult(pdfResult.text, 'pdf.js', pdfResult.confidence, 0, Date.now() - startTime, file);
      }

      console.log('PDF.js extraction insufficient, trying Tesseract...');

      // Tier 2: Tesseract.js (client-side OCR, free)
      const tesseractResult = await this.tryTesseractExtraction(file);
      if (tesseractResult.success && tesseractResult.confidence > 0.6) {
        console.log('Enhanced Tesseract extraction successful');
        
        // Use enhanced insurance data extraction if available
        let enhancedPolicyData = {};
        if (tesseractResult.enhancedResult) {
          enhancedPolicyData = enhancedTesseractService.extractInsuranceData(tesseractResult.enhancedResult);
          console.log('Enhanced insurance data extracted:', enhancedPolicyData);
        }
        
        return this.formatResult(
          tesseractResult.text, 
          'tesseract', 
          tesseractResult.confidence, 
          0, 
          Date.now() - startTime, 
          file,
          enhancedPolicyData
        );
      }

      console.log('Tesseract extraction insufficient, trying Google Vision...');

      // Tier 3: Google Vision API (cloud OCR, paid)
      if (this.googleVisionApiKey) {
        const visionResult = await this.tryGoogleVisionExtraction(file);
        if (visionResult.success) {
          console.log('Google Vision extraction successful');
          const cost = this.calculateGoogleVisionCost(fileSize);
          return this.formatResult(visionResult.text, 'google-vision', visionResult.confidence, cost, Date.now() - startTime, file);
        }
      }

      // Fallback: Return best available result
      const bestResult = this.selectBestResult(pdfResult, tesseractResult);
      console.log('Using fallback result from:', bestResult.method);
      return this.formatResult(bestResult.text, bestResult.method as any, bestResult.confidence, 0, Date.now() - startTime, file);

    } catch (error) {
      console.error('All PDF extraction methods failed:', error);
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  private async tryPdfJsExtraction(file: File): Promise<{success: boolean, text: string, confidence: number}> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let extractedText = '';
      const pageCount = pdf.numPages;
      
      for (let pageNum = 1; pageNum <= Math.min(pageCount, 10); pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        extractedText += pageText + '\n';
      }

      const confidence = this.calculatePdfJsConfidence(extractedText);
      
      return {
        success: extractedText.length > 100 && confidence > 0.7,
        text: extractedText,
        confidence
      };
    } catch (error) {
      console.error('PDF.js extraction failed:', error);
      return { success: false, text: '', confidence: 0 };
    }
  }

  private async tryTesseractExtraction(file: File): Promise<{success: boolean, text: string, confidence: number, enhancedResult?: EnhancedOCRResult}> {
    try {
      console.log('Starting enhanced Tesseract extraction...');
      
      // Use the enhanced Tesseract service
      const enhancedResult = await enhancedTesseractService.extractFromPDF(file);
      
      const success = enhancedResult.text.length > 50 && enhancedResult.confidence > 0.6;
      
      console.log(`Enhanced Tesseract extraction completed - Success: ${success}, Confidence: ${(enhancedResult.confidence * 100).toFixed(1)}%`);
      
      return {
        success,
        text: enhancedResult.text,
        confidence: enhancedResult.confidence,
        enhancedResult
      };
    } catch (error) {
      console.error('Enhanced Tesseract extraction failed:', error);
      return { success: false, text: '', confidence: 0 };
    }
  }

  private async tryGoogleVisionExtraction(file: File): Promise<{success: boolean, text: string, confidence: number}> {
    try {
      if (!this.googleVisionApiKey) {
        throw new Error('Google Vision API key not configured');
      }

      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      
      const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${this.googleVisionApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: base64.split(',')[1] // Remove data:image/... prefix
            },
            features: [{
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1
            }]
          }]
        })
      });

      const result = await response.json();
      
      if (result.responses && result.responses[0] && result.responses[0].fullTextAnnotation) {
        const text = result.responses[0].fullTextAnnotation.text;
        const confidence = 0.9; // Google Vision typically has high confidence
        
        return {
          success: text && text.length > 50,
          text,
          confidence
        };
      }
      
      return { success: false, text: '', confidence: 0 };
    } catch (error) {
      console.error('Google Vision extraction failed:', error);
      return { success: false, text: '', confidence: 0 };
    }
  }

  private async convertPdfToImages(file: File): Promise<ImageData[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const images: ImageData[] = [];
      
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 3); pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        images.push(imageData);
      }
      
      return images;
    } catch (error) {
      console.error('PDF to images conversion failed:', error);
      return [];
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private calculatePdfJsConfidence(text: string): number {
    let confidence = 0.3; // Base confidence
    
    if (text.length > 500) confidence += 0.2;
    if (/\d{3,}/.test(text)) confidence += 0.1; // Contains numbers
    if (/insurance|policy|coverage/i.test(text)) confidence += 0.2;
    if (/\$[\d,]+/.test(text)) confidence += 0.1; // Contains currency
    
    return Math.min(confidence, 1.0);
  }

  private calculateGoogleVisionCost(fileSize: number): number {
    // Google Vision pricing: ~$1.50 per 1000 images
    return 0.0015; // Simplified cost per document
  }

  private selectBestResult(...results: {success: boolean, text: string, confidence: number, method?: string}[]) {
    return results
      .map((r, i) => ({ ...r, method: ['pdf.js', 'tesseract', 'google-vision'][i] }))
      .sort((a, b) => b.confidence - a.confidence)[0];
  }

  private formatResult(
    text: string, 
    method: 'pdf.js' | 'tesseract' | 'google-vision', 
    confidence: number, 
    cost: number, 
    processingTime: number,
    file: File,
    enhancedPolicyData?: any
  ): TieredExtractionResult {
    // Use enhanced policy data if available, otherwise fall back to basic parsing
    const policyData = enhancedPolicyData && Object.keys(enhancedPolicyData).length > 0 
      ? { ...this.parseInsuranceData(text), ...enhancedPolicyData }
      : this.parseInsuranceData(text);
    
    return {
      extractedText: text,
      confidence,
      processingMethod: method,
      cost,
      processingTime,
      policyData,
      metadata: {
        fileSize: file.size,
        pageCount: 1, // Simplified
        isScanned: method !== 'pdf.js',
        enhancedExtraction: !!enhancedPolicyData
      }
    };
  }

  private parseInsuranceData(text: string) {
    const data: any = {};
    
    // Extract policy number
    const policyMatch = text.match(/policy\s*#?\s*:?\s*([A-Z0-9\-\s]{6,20})/i);
    if (policyMatch) data.policyNumber = policyMatch[1].trim();
    
    // Extract insured name
    const nameMatch = text.match(/insured\s*:?\s*([A-Z][a-zA-Z\s,&]{2,50})/i);
    if (nameMatch) data.insuredName = nameMatch[1].trim();
    
    // Extract insurer name
    const insurerMatch = text.match(/(insurance|company)\s*([A-Z][a-zA-Z\s&]{2,40})/i);
    if (insurerMatch) data.insurerName = insurerMatch[2].trim();
    
    // Extract dates
    const dateMatches = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g) || [];
    if (dateMatches.length > 0) data.effectiveDate = dateMatches[0];
    if (dateMatches.length > 1) data.expirationDate = dateMatches[1];
    
    // Extract coverage amounts
    const dwellingMatch = text.match(/dwelling.*?\$?([\d,]+)/i);
    if (dwellingMatch) data.dwellingLimit = `$${dwellingMatch[1]}`;
    
    // Extract deductible
    const deductibleMatch = text.match(/deductible.*?\$?([\d,]+)/i);
    if (deductibleMatch) data.deductibleAmount = `$${deductibleMatch[1]}`;
    
    // Extract premium
    const premiumMatch = text.match(/premium.*?\$?([\d,\.]+)/i);
    if (premiumMatch) data.totalPremium = `$${premiumMatch[1]}`;
    
    return data;
  }
}

// Export singleton instance
export const tieredPdfService = new TieredPdfService();
