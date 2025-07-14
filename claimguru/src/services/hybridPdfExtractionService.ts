/**
 * HYBRID PDF EXTRACTION SERVICE - ClaimGuru
 * 
 * REAL Multi-Tier Implementation:
 * 1. PDF.js (Free, client-side) - with quality evaluation
 * 2. Tesseract.js OCR (Free fallback for scanned docs)  
 * 3. Google Vision API (Premium, only when needed)
 * 4. OpenAI Enhancement (Always applied to extracted text)
 * 5. Advanced Regex Parsing (Reliable fallback)
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
    qualityScore: number;
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
   * Main extraction method - REAL hybrid approach with quality evaluation
   */
  async extractFromPDF(file: File): Promise<HybridPDFExtractionResult> {
    const startTime = Date.now();
    const methodsAttempted: string[] = [];
    
    console.log('🔄 Starting REAL HYBRID PDF extraction for:', file.name);
    console.log('📊 File size:', (file.size / 1024).toFixed(1), 'KB');
    
    let extractedText = '';
    let confidence = 0;
    let processingMethod: 'pdf-js' | 'tesseract' | 'google-vision' | 'fallback' = 'fallback';
    let cost = 0;
    let qualityScore = 0;

    try {
      // STEP 1: Try PDF.js (Free, fast for text-based PDFs)
      console.log('📄 STEP 1: Attempting PDF.js extraction...');
      methodsAttempted.push('pdf-js');
      
      const pdfJsResult = await this.extractWithPDFjs(file);
      extractedText = pdfJsResult.text;
      qualityScore = this.evaluateTextQuality(extractedText);
      
      console.log(`📄 PDF.js Result: ${extractedText.length} chars, Quality Score: ${qualityScore}/100`);
      
      // Check if PDF.js extraction is good enough
      if (qualityScore >= 70 && extractedText.length > 500) {
        confidence = 0.90;
        processingMethod = 'pdf-js';
        console.log('✅ PDF.js extraction sufficient - proceeding to enhancement');
      } else if (qualityScore >= 40 && extractedText.length > 200) {
        confidence = 0.70;
        processingMethod = 'pdf-js';
        console.log('⚠️ PDF.js extraction mediocre but usable - proceeding to enhancement');
      } else {
        // PDF.js extraction poor - try OCR methods
        console.log('⚠️ PDF.js extraction poor - trying OCR methods...');
        
        // STEP 2: Try Google Vision API (Premium, more reliable than Tesseract)
        console.log('👁️ STEP 2: Attempting Google Vision API...');
        methodsAttempted.push('google-vision');
        
        try {
          const visionResult = await this.extractWithGoogleVision(file);
          if (visionResult.text.length > extractedText.length * 0.5) {
            extractedText = visionResult.text;
            confidence = visionResult.confidence;
            processingMethod = 'google-vision';
            cost = 0.015; // Approximate cost per page
            qualityScore = this.evaluateTextQuality(extractedText);
            console.log('✅ Google Vision successful:', extractedText.length, 'characters');
          } else {
            throw new Error('Google Vision didn\'t improve extraction');
          }
        } catch (visionError) {
          console.log('⚠️ Google Vision failed:', visionError.message);
          
          // STEP 3: Try Tesseract.js OCR (Free fallback)
          console.log('🔤 STEP 3: Attempting Tesseract.js OCR...');
          methodsAttempted.push('tesseract');
          
          try {
            const tesseractResult = await this.extractWithTesseract(file);
            if (tesseractResult.text.length > extractedText.length * 0.3) {
              extractedText = tesseractResult.text;
              confidence = tesseractResult.confidence;
              processingMethod = 'tesseract';
              qualityScore = this.evaluateTextQuality(extractedText);
              console.log('✅ Tesseract OCR successful:', extractedText.length, 'characters');
            } else {
              throw new Error('Tesseract didn\'t improve extraction');
            }
          } catch (tesseractError) {
            console.log('⚠️ Tesseract failed, using best available text');
            // Use the best text we have (from PDF.js)
            confidence = 0.3;
            processingMethod = 'pdf-js';
          }
        }
      }

      // STEP 4: ALWAYS enhance with AI parsing (OpenAI + Advanced Regex)
      console.log('🧠 STEP 4: Enhancing with AI intelligence...');
      const policyData = await this.enhanceWithAI(extractedText);

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
          methodsAttempted,
          qualityScore
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
          methodsAttempted,
          qualityScore: 0
        }
      };
    }
  }

  /**
   * Evaluate text quality for decision making
   */
  private evaluateTextQuality(text: string): number {
    if (!text || text.length < 50) return 0;
    
    let score = 0;
    
    // Length score (up to 30 points)
    if (text.length > 5000) score += 30;
    else if (text.length > 1000) score += 20;
    else if (text.length > 500) score += 15;
    else if (text.length > 200) score += 10;
    
    // Insurance keywords score (up to 40 points)
    const insuranceKeywords = [
      'policy', 'insured', 'coverage', 'deductible', 'premium', 'liability',
      'dwelling', 'property', 'effective', 'expiration', 'carrier', 'limit'
    ];
    
    const foundKeywords = insuranceKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    score += Math.min(foundKeywords * 3, 40);
    
    // Structure score (up to 20 points)
    const hasNumbers = /\$[\d,]+|\d{1,2}\/\d{1,2}\/\d{2,4}/.test(text);
    const hasAddresses = /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|blvd|boulevard)/i.test(text);
    const hasProperNouns = /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(text);
    
    if (hasNumbers) score += 7;
    if (hasAddresses) score += 7;
    if (hasProperNouns) score += 6;
    
    // Readability score (up to 10 points)
    const readableRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
    if (readableRatio > 0.7) score += 10;
    else if (readableRatio > 0.5) score += 7;
    else if (readableRatio > 0.3) score += 4;
    
    return Math.min(score, 100);
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
          // Load PDF.js dynamically if not available
          await this.loadPDFjs();
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await (window as any).pdfjsLib.getDocument(arrayBuffer).promise;
        
        let fullText = '';
        const pageCount = pdf.numPages;
        
        for (let i = 1; i <= Math.min(pageCount, 15); i++) { // Process up to 15 pages
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        resolve({ text: fullText, pageCount });
      } catch (error) {
        reject(new Error(`PDF.js extraction failed: ${error.message}`));
      }
    });
  }

  /**
   * Load PDF.js library dynamically
   */
  private async loadPDFjs(): Promise<void> {
    if ((window as any).pdfjsLib) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/pdf/pdf.worker.js';
      script.onload = () => {
        const mainScript = document.createElement('script');
        mainScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        mainScript.onload = () => {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.js';
          resolve();
        };
        mainScript.onerror = reject;
        document.head.appendChild(mainScript);
      };
      script.onerror = reject;
      document.head.appendChild(script);
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
        
        // Load Tesseract.js dynamically
        await this.loadTesseract();
        
        const Tesseract = (window as any).Tesseract;
        if (!Tesseract) {
          throw new Error('Tesseract.js failed to load');
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
   * Load Tesseract.js library dynamically
   */
  private async loadTesseract(): Promise<void> {
    if ((window as any).Tesseract) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/tesseract.js@4/dist/tesseract.min.js';
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * STEP 3: Google Vision API (Premium)
   */
  private async extractWithGoogleVision(file: File): Promise<{ text: string; confidence: number }> {
    try {
      console.log('Converting PDF to image for Google Vision API...');
      
      // Convert PDF first page to image
      const canvas = await this.pdfToCanvas(file);
      
      // Convert canvas to base64 image data
      const imageData = canvas.toDataURL('image/png').split(',')[1];
      
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
      
      if (result.error) {
        throw new Error(result.error.message || 'Google Vision API error');
      }
      
      return {
        text: result.text || '',
        confidence: result.confidence || 0.9
      };
    } catch (error) {
      throw new Error(`Google Vision extraction failed: ${error.message}`);
    }
  }

  /**
   * STEP 4: AI Enhancement (OpenAI + Advanced Regex)
   */
  private async enhanceWithAI(text: string): Promise<HybridPDFExtractionResult['policyData']> {
    try {
      console.log('🧠 Attempting OpenAI enhancement...');
      const response = await fetch(`${this.supabaseUrl}/functions/v1/openai-extract-fields`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.policyData && Object.keys(result.policyData).length > 0) {
          console.log('✅ OpenAI enhancement successful');
          return this.ensureProperDataTypes(result.policyData);
        }
      }
      
      console.warn('⚠️ OpenAI enhancement failed, using advanced regex parsing');
      return this.parseWithAdvancedRegex(text);
    } catch (error) {
      console.warn('⚠️ OpenAI enhancement error:', error.message);
      return this.parseWithAdvancedRegex(text);
    }
  }

  /**
   * Utility: Convert PDF to Canvas for OCR
   */
  private async pdfToCanvas(file: File): Promise<HTMLCanvasElement> {
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) {
      await this.loadPDFjs();
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await (window as any).pdfjsLib.getDocument(arrayBuffer).promise;
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
   * Advanced regex-based parsing with comprehensive patterns
   */
  private parseWithAdvancedRegex(text: string): HybridPDFExtractionResult['policyData'] {
    console.log('🔍 Using advanced regex parsing...');
    const policyData: HybridPDFExtractionResult['policyData'] = {};

    // Clean text for better matching
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Enhanced policy number patterns
    const policyPatterns = [
      /policy\s*(?:number|#|no|num)?\s*[:.]?\s*([A-Z0-9\-]{5,25})/i,
      /policy\s*[:]\s*([A-Z0-9\-]{5,25})/i,
      /\b([A-Z]{2,4}\d{6,15})\b/,
      /\b([A-Z]\d{7,15})\b/,
      /number\s*[:.]?\s*([A-Z0-9\-]{6,20})/i
    ];
    
    for (const pattern of policyPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1] && !policyData.policyNumber) {
        policyData.policyNumber = match[1].trim();
        break;
      }
    }

    // Enhanced insured name patterns
    const namePatterns = [
      /(?:named\s+)?insured\s*[:.]?\s*([A-Z][A-Za-z\s,&.'-]{2,50})/i,
      /insured\s*name\s*[:.]?\s*([A-Z][A-Za-z\s,&.'-]{2,50})/i,
      /policyholder\s*[:.]?\s*([A-Z][A-Za-z\s,&.'-]{2,50})/i,
      /name\s*of\s*insured\s*[:.]?\s*([A-Z][A-Za-z\s,&.'-]{2,50})/i
    ];
    
    for (const pattern of namePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1] && !policyData.insuredName) {
        const name = match[1].trim().replace(/[,.;]$/, '');
        if (name.length > 2 && name.length < 50) {
          policyData.insuredName = name;
          break;
        }
      }
    }

    // Enhanced date patterns
    const datePatterns = [
      /effective\s*(?:date)?\s*[:.]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
      /policy\s*period\s*[:.]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
      /from\s*[:.]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i
    ];
    
    for (const pattern of datePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1] && !policyData.effectiveDate) {
        policyData.effectiveDate = match[1];
        break;
      }
    }

    const expirationPatterns = [
      /expir(?:ation|es)\s*(?:date)?\s*[:.]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
      /to\s*[:.]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
      /until\s*[:.]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i
    ];
    
    for (const pattern of expirationPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1] && !policyData.expirationDate) {
        policyData.expirationDate = match[1];
        break;
      }
    }

    // Enhanced insurer patterns
    const insurerPatterns = [
      /(?:insurance\s+company|insurer|carrier|company)\s*[:.]?\s*([A-Z][A-Za-z\s,.&'-]{2,60})/i,
      /issued\s+by\s*[:.]?\s*([A-Z][A-Za-z\s,.&'-]{2,60})/i,
      /underwritten\s+by\s*[:.]?\s*([A-Z][A-Za-z\s,.&'-]{2,60})/i
    ];
    
    for (const pattern of insurerPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1] && !policyData.insurerName) {
        const name = match[1].trim().replace(/[,.;]$/, '');
        if (name.length > 2 && name.length < 60) {
          policyData.insurerName = name;
          break;
        }
      }
    }

    // Enhanced address patterns
    const addressPatterns = [
      /(?:property\s+address|insured\s+location|risk\s+location|location\s+of\s+risk)\s*[:.]?\s*([0-9][A-Za-z0-9\s,.'-]{5,100})/i,
      /address\s*[:.]?\s*([0-9][A-Za-z0-9\s,.'-]{5,100})/i,
      /located\s+at\s*[:.]?\s*([0-9][A-Za-z0-9\s,.'-]{5,100})/i
    ];
    
    for (const pattern of addressPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1] && !policyData.propertyAddress) {
        const address = match[1].trim().replace(/[,.;]$/, '');
        if (address.length > 5 && address.length < 100) {
          policyData.propertyAddress = address;
          break;
        }
      }
    }

    // Enhanced coverage amount patterns
    const coveragePatterns = [
      /(?:coverage\s+a|dwelling|building)\s*(?:limit|coverage|amount)?\s*[:.]?\s*\$?\s*([0-9,]{3,15})/i,
      /dwelling\s*[:.]?\s*\$?\s*([0-9,]{3,15})/i,
      /coverage\s*[:.]?\s*\$?\s*([0-9,]{3,15})/i,
      /limit\s*[:.]?\s*\$?\s*([0-9,]{3,15})/i
    ];
    
    for (const pattern of coveragePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1] && !policyData.coverageAmount) {
        const amount = match[1].replace(/[^\d]/g, '');
        if (amount.length >= 3) {
          policyData.coverageAmount = '$' + parseInt(amount).toLocaleString();
          break;
        }
      }
    }

    // Enhanced deductible patterns
    const deductiblePatterns = [
      /(?:deductible|ded)\s*[:.]?\s*\$?\s*([0-9,]{2,10})/i,
      /all\s+other\s+perils\s*[:.]?\s*\$?\s*([0-9,]{2,10})/i,
      /aop\s*[:.]?\s*\$?\s*([0-9,]{2,10})/i
    ];
    
    for (const pattern of deductiblePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1] && !policyData.deductible) {
        const amount = match[1].replace(/[^\d]/g, '');
        if (amount.length >= 2) {
          policyData.deductible = '$' + parseInt(amount).toLocaleString();
          break;
        }
      }
    }

    // Extract coverage types
    const coverageTypes: string[] = [];
    const coverageTypePatterns = [
      /coverage\s+[a-z]\s*[-:.]?\s*([a-z\s]+)/ig,
      /(dwelling|personal\s+property|liability|medical|other\s+structures|loss\s+of\s+use)/ig
    ];
    
    for (const pattern of coverageTypePatterns) {
      const matches = cleanText.matchAll(pattern);
      for (const match of matches) {
        const type = match[1].trim();
        if (type.length > 2 && !coverageTypes.includes(type)) {
          coverageTypes.push(type);
        }
      }
    }
    
    if (coverageTypes.length > 0) {
      policyData.coverageTypes = coverageTypes.slice(0, 10); // Limit to 10 types
    }

    console.log('🔍 Regex parsing extracted:', Object.keys(policyData).filter(k => policyData[k]).length, 'fields');
    
    return policyData;
  }

  /**
   * Fallback text generation
   */
  private generateFallbackText(file: File): string {
    return `
SAMPLE INSURANCE POLICY DOCUMENT - EXTRACTION FAILED

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

Deductibles:
All Other Perils: $1,000
Wind/Hail: $2,500

Note: This is sample data generated because PDF extraction failed.
Original file: ${file.name}
File size: ${(file.size / 1024).toFixed(1)} KB
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
      coverageTypes: ['Dwelling', 'Other Structures', 'Personal Property', 'Loss of Use']
    };
  }

  /**
   * Ensure data types are properly formatted for React rendering
   */
  private ensureProperDataTypes(data: any): HybridPDFExtractionResult['policyData'] {
    const cleanData: any = {};

    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (key === 'coverageTypes' && Array.isArray(value)) {
        cleanData[key] = value.map(item => String(item || '')).filter(item => item.length > 0);
      } else if (key === 'deductibles' && Array.isArray(value)) {
        cleanData[key] = value.map(item => {
          if (typeof item === 'object' && item !== null) {
            return {
              type: String(item.type || ''),
              amount: String(item.amount || '')
            };
          }
          return { type: String(item), amount: '' };
        });
      } else if (value !== null && value !== undefined) {
        cleanData[key] = String(value);
      }
    });

    return cleanData as HybridPDFExtractionResult['policyData'];
  }
}

// Export singleton instance
export const hybridPdfExtractionService = new HybridPDFExtractionService();
