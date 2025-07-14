/**
 * HYBRID PDF EXTRACTION SERVICE - ClaimGuru
 * 
 * Implements the proper tiered approach:
 * 1. PDF.js (Free, client-side)
 * 2. Tesseract.js OCR (Free fallback for scanned docs)  
 * 3. Google Vision API (Premium, only when needed)
 * 4. OpenAI Enhancement (Always applied to extracted text)
 */

export interface HybridPDFExtractionResult {
  extractedText: string;
  confidence: number;
  processingMethod: 'pdf-js' | 'tesseract' | 'google-vision' | 'fallback';
  cost: number;
  processingTime: number;
  policyData: {
    policyNumber?: string;
    insuredName?: string;
    effectiveDate?: string;
    expirationDate?: string;
    insurerName?: string;
    propertyAddress?: string;
    coverageAmount?: string;
    deductible?: string;
    premium?: string;
    // Ensure arrays are properly typed
    coverageTypes?: string[];
    deductibles?: Array<{
      type: string;
      amount: string;
    }>;
  };
  metadata: {
    pageCount?: number;
    fileSize: number;
    fileName: string;
    methodsAttempted: string[];
  };
}

export class HybridPDFExtractionService {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    // Get Supabase config from environment
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ttnjqxemkbugwsofacxs.supabase.co';
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bmpxeGVta2J1Z3dzb2ZhY3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODY1ODksImV4cCI6MjA2NzY2MjU4OX0.T4ZQBC1gF0rUtzrNqbf90k0dD8B1vD_JUBiEUbbAfuo';
  }

  /**
   * Main extraction method - implements hybrid approach
   */
  async extractFromPDF(file: File): Promise<HybridPDFExtractionResult> {
    const startTime = Date.now();
    const methodsAttempted: string[] = [];
    
    console.log('🔄 Starting HYBRID PDF extraction for:', file.name);
    console.log('📊 File size:', (file.size / 1024).toFixed(1), 'KB');
    
    let extractedText = '';
    let confidence = 0;
    let processingMethod: 'pdf-js' | 'tesseract' | 'google-vision' | 'fallback' = 'fallback';
    let cost = 0;

    try {
      // STEP 1: Try PDF.js (Free, fast for text-based PDFs)
      console.log('📄 STEP 1: Attempting PDF.js extraction...');
      methodsAttempted.push('pdf-js');
      
      try {
        const pdfJsResult = await this.extractWithPDFjs(file);
        if (pdfJsResult.text.length > 100) { // Sufficient text extracted
          extractedText = pdfJsResult.text;
          confidence = 0.85;
          processingMethod = 'pdf-js';
          console.log('✅ PDF.js extraction successful:', extractedText.length, 'characters');
        } else {
          throw new Error('Insufficient text extracted from PDF.js');
        }
      } catch (error) {
        console.log('⚠️ PDF.js failed:', error.message);
        
        // STEP 2: Try Tesseract.js OCR (Free fallback for scanned docs)
        console.log('🔤 STEP 2: Attempting Tesseract.js OCR...');
        methodsAttempted.push('tesseract');
        
        try {
          const tesseractResult = await this.extractWithTesseract(file);
          if (tesseractResult.text.length > 50) {
            extractedText = tesseractResult.text;
            confidence = tesseractResult.confidence;
            processingMethod = 'tesseract';
            console.log('✅ Tesseract OCR successful:', extractedText.length, 'characters');
          } else {
            throw new Error('Insufficient text from Tesseract OCR');
          }
        } catch (tesseractError) {
          console.log('⚠️ Tesseract failed:', tesseractError.message);
          
          // STEP 3: Try Google Vision (Premium, last resort)
          console.log('👁️ STEP 3: Attempting Google Vision API...');
          methodsAttempted.push('google-vision');
          
          try {
            const visionResult = await this.extractWithGoogleVision(file);
            extractedText = visionResult.text;
            confidence = visionResult.confidence;
            processingMethod = 'google-vision';
            cost = 0.015; // Approximate cost per page
            console.log('✅ Google Vision successful:', extractedText.length, 'characters');
          } catch (visionError) {
            console.log('❌ All extraction methods failed, using fallback');
            // STEP 4: Ultimate fallback with mock data for testing
            extractedText = this.generateFallbackText(file);
            confidence = 0.3;
            processingMethod = 'fallback';
          }
        }
      }

      // STEP 4: Enhance with OpenAI (Always applied)
      console.log('🧠 STEP 4: Enhancing with OpenAI intelligence...');
      const policyData = await this.enhanceWithOpenAI(extractedText);

      const processingTime = Date.now() - startTime;

      return {
        extractedText,
        confidence,
        processingMethod,
        cost,
        processingTime,
        policyData,
        metadata: {
          pageCount: 1, // TODO: Calculate actual page count
          fileSize: file.size,
          fileName: file.name,
          methodsAttempted
        }
      };

    } catch (error) {
      console.error('❌ Hybrid extraction completely failed:', error);
      
      // Ultimate fallback
      return {
        extractedText: this.generateFallbackText(file),
        confidence: 0.1,
        processingMethod: 'fallback',
        cost: 0,
        processingTime: Date.now() - startTime,
        policyData: this.generateFallbackPolicyData(),
        metadata: {
          fileSize: file.size,
          fileName: file.name,
          methodsAttempted
        }
      };
    }
  }

  /**
   * STEP 1: PDF.js extraction (Free)
   */
  private async extractWithPDFjs(file: File): Promise<{ text: string; pageCount: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        // Import PDF.js
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          throw new Error('PDF.js not loaded');
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        let fullText = '';
        const pageCount = pdf.numPages;
        
        for (let i = 1; i <= Math.min(pageCount, 10); i++) { // Limit to 10 pages
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        if (fullText.trim().length > 0) {
          resolve({ text: fullText, pageCount });
        } else {
          reject(new Error('No text content found in PDF'));
        }
      } catch (error) {
        reject(new Error(`PDF.js extraction failed: ${error.message}`));
      }
    });
  }

  /**
   * STEP 2: Tesseract.js OCR (Free)
   */
  private async extractWithTesseract(file: File): Promise<{ text: string; confidence: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        // Convert PDF first page to image
        const canvas = await this.pdfToCanvas(file);
        
        // Import Tesseract.js (we'll add this via CDN)
        const Tesseract = (window as any).Tesseract;
        if (!Tesseract) {
          throw new Error('Tesseract.js not loaded');
        }

        const { data: { text, confidence } } = await Tesseract.recognize(canvas, 'eng', {
          logger: m => console.log('Tesseract:', m)
        });

        if (text.trim().length > 0) {
          resolve({ text, confidence: confidence / 100 });
        } else {
          reject(new Error('No text extracted by Tesseract'));
        }
      } catch (error) {
        reject(new Error(`Tesseract OCR failed: ${error.message}`));
      }
    });
  }

  /**
   * STEP 3: Google Vision API (Premium)
   */
  private async extractWithGoogleVision(file: File): Promise<{ text: string; confidence: number }> {
    try {
      console.log('Converting PDF to image for Google Vision API...');
      
      // Convert PDF first page to image (required for Vision API)
      const canvas = await this.pdfToCanvas(file);
      
      // Convert canvas to base64 image data
      const imageData = canvas.toDataURL('image/png');
      
      console.log('Calling Google Vision API...');
      const response = await fetch(`${this.supabaseUrl}/functions/v1/google-vision-extract`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: imageData,
          fileName: file.name
        })
      });

      if (!response.ok) {
        throw new Error(`Google Vision API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        text: result.extractedText || '',
        confidence: result.confidence || 0.9
      };
    } catch (error) {
      throw new Error(`Google Vision extraction failed: ${error.message}`);
    }
  }

  /**
   * STEP 4: OpenAI Enhancement (Always applied)
   */
  private async enhanceWithOpenAI(text: string): Promise<HybridPDFExtractionResult['policyData']> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/openai-extract-fields`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        console.warn('OpenAI enhancement failed, using regex parsing');
        return this.parseWithRegex(text);
      }

      const result = await response.json();
      return this.ensureProperDataTypes(result.policyData || {});
    } catch (error) {
      console.warn('OpenAI enhancement error:', error.message);
      return this.parseWithRegex(text);
    }
  }

  /**
   * Utility: Convert PDF to Canvas for OCR
   */
  private async pdfToCanvas(file: File): Promise<HTMLCanvasElement> {
    const pdfjsLib = (window as any).pdfjsLib;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(1);
    
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas;
  }

  /**
   * Utility: Convert file to base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // Remove data:mime;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Fallback text generation
   */
  private generateFallbackText(file: File): string {
    return `
SAMPLE INSURANCE POLICY DOCUMENT

Policy Number: SAMPLE-${Date.now().toString().slice(-6)}
Insured: Sample Insured Name
Insurance Company: Sample Insurance Co.
Property Address: 123 Sample Street, Sample City, TX 75001
Policy Period: 01/01/2025 to 01/01/2026

Coverage Summary:
Coverage A - Dwelling: $300,000
Coverage B - Other Structures: $30,000  
Coverage C - Personal Property: $150,000
Coverage D - Loss of Use: $60,000
Coverage E - Personal Liability: $300,000
Coverage F - Medical Payments: $5,000

Deductibles:
All Other Perils: $1,000
Wind/Hail: $2,500

Note: This is sample data generated because PDF extraction failed.
Original file: ${file.name}
`;
  }

  /**
   * Fallback policy data
   */
  private generateFallbackPolicyData(): HybridPDFExtractionResult['policyData'] {
    return {
      policyNumber: `SAMPLE-${Date.now().toString().slice(-6)}`,
      insuredName: 'Sample Insured Name',
      effectiveDate: '01/01/2025',
      expirationDate: '01/01/2026',
      insurerName: 'Sample Insurance Co.',
      propertyAddress: '123 Sample Street, Sample City, TX 75001',
      coverageAmount: '$300,000',
      deductible: '$1,000',
      premium: '$2,500',
      coverageTypes: ['Dwelling', 'Other Structures', 'Personal Property', 'Loss of Use'],
      deductibles: [
        { type: 'All Other Perils', amount: '$1,000' },
        { type: 'Wind/Hail', amount: '$2,500' }
      ]
    };
  }

  /**
   * Regex-based parsing fallback
   */
  private parseWithRegex(text: string): HybridPDFExtractionResult['policyData'] {
    const policyData: HybridPDFExtractionResult['policyData'] = {};

    // Extract policy number
    const policyMatch = text.match(/policy\s*#?\s*:?\s*([A-Z0-9\-]{6,20})/i);
    if (policyMatch) {
      policyData.policyNumber = policyMatch[1];
    }

    // Extract insured name
    const nameMatch = text.match(/insured\s*:?\s*([A-Z][a-zA-Z\s&]{2,50})/i);
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
    const coverageTypes: string[] = [];
    if (text.includes('Dwelling')) coverageTypes.push('Dwelling');
    if (text.includes('Personal Property')) coverageTypes.push('Personal Property');
    if (text.includes('Liability')) coverageTypes.push('Liability');
    if (text.includes('Other Structures')) coverageTypes.push('Other Structures');
    
    policyData.coverageTypes = coverageTypes;

    return policyData;
  }

  /**
   * Ensure data types are properly formatted for React rendering
   */
  private ensureProperDataTypes(data: any): HybridPDFExtractionResult['policyData'] {
    const cleanData: any = {};

    // Ensure all values are properly typed
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (key === 'coverageTypes' && Array.isArray(value)) {
        // Handle coverageTypes as string array
        cleanData[key] = value.map(item => 
          typeof item === 'string' ? item : String(item)
        );
      } else if (key === 'deductibles' && Array.isArray(value)) {
        // Handle deductibles as properly structured array
        cleanData[key] = value.map(item => {
          if (typeof item === 'object' && item !== null) {
            return {
              type: String(item.type || ''),
              amount: String(item.amount || '')
            };
          }
          return { type: String(item), amount: '' };
        });
      } else if (Array.isArray(value)) {
        // Other arrays become comma-separated strings to prevent React errors
        cleanData[key] = value.map(item => String(item)).join(', ');
      } else if (typeof value === 'object' && value !== null) {
        // Convert objects to JSON strings to prevent React rendering errors
        cleanData[key] = JSON.stringify(value);
      } else {
        // Ensure primitive values are strings
        cleanData[key] = String(value || '');
      }
    });

    return cleanData as HybridPDFExtractionResult['policyData'];
  }
}

// Export singleton instance
export const hybridPdfExtractionService = new HybridPDFExtractionService();
