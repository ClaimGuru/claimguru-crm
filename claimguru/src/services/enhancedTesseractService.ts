import Tesseract, { Worker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Enhanced Tesseract configuration based on official documentation
export interface TesseractConfig {
  language: string;
  psm: number; // Page Segmentation Mode
  oem: number; // OCR Engine Mode
  tessedit_char_whitelist?: string;
  tessedit_char_blacklist?: string;
  user_defined_dpi?: number;
  preserve_interword_spaces?: string;
}

export interface EnhancedOCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
  blocks: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
  processingTime: number;
  imageQuality: number;
}

export class EnhancedTesseractService {
  private workers: Map<string, Worker> = new Map();
  private initialized = false;

  constructor() {
    this.initializeWorkers();
  }

  /**
   * Initialize Tesseract workers with optimal configuration
   * Based on official Tesseract documentation for performance optimization
   */
  private async initializeWorkers(): Promise<void> {
    try {
      console.log('Initializing Enhanced Tesseract workers...');
      
      // Create optimized worker for insurance documents
      const insuranceWorker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`Insurance OCR progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        errorHandler: (err) => {
          console.error('Tesseract worker error:', err);
        }
      });

      // Set optimal parameters for insurance documents
      await insuranceWorker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO, // Automatic page segmentation
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY, // Use LSTM neural network
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,()-$:/', // Insurance-specific characters
        user_defined_dpi: '300', // High DPI for better accuracy
        preserve_interword_spaces: '1', // Preserve spacing for addresses/names
        tessedit_do_invert: '0', // Don't invert images automatically
        textord_really_old_xheight: '1', // Better handling of mixed font sizes
        textord_min_linesize: '2.5', // Minimum line size
        classify_enable_learning: '0', // Disable adaptive learning for consistency
        classify_enable_adaptive_matcher: '0', // Disable adaptive matching
        textord_noise_rejwords: '1', // Reject noisy words
        textord_noise_rejrows: '1', // Reject noisy rows
        load_system_dawg: '0', // Don't use system dictionary
        load_freq_dawg: '0', // Don't use frequency dictionary
        load_unambig_dawg: '0', // Don't use unambiguous word dictionary
        load_punc_dawg: '0', // Don't use punctuation dictionary
        load_number_dawg: '0', // Don't use number dictionary
        load_bigram_dawg: '0', // Don't use bigram dictionary
      });

      this.workers.set('insurance', insuranceWorker);

      // Create general-purpose worker for fallback
      const generalWorker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`General OCR progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      // General purpose configuration
      await generalWorker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
        user_defined_dpi: '300',
        preserve_interword_spaces: '1'
      });

      this.workers.set('general', generalWorker);
      this.initialized = true;

      console.log('Enhanced Tesseract workers initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Tesseract workers:', error);
    }
  }

  /**
   * Extract text from PDF file using enhanced Tesseract OCR
   */
  async extractFromPDF(file: File): Promise<EnhancedOCRResult> {
    if (!this.initialized) {
      await this.initializeWorkers();
    }

    try {
      console.log('Starting enhanced Tesseract extraction for:', file.name);
      const startTime = Date.now();

      // Convert PDF to high-quality images
      const images = await this.convertPdfToOptimizedImages(file);
      
      if (images.length === 0) {
        throw new Error('Failed to extract images from PDF');
      }

      let allText = '';
      let totalConfidence = 0;
      const allWords: any[] = [];
      const allBlocks: any[] = [];

      // Try insurance-optimized worker first
      const worker = this.workers.get('insurance') || this.workers.get('general');
      
      if (!worker) {
        throw new Error('No Tesseract worker available');
      }

      // Process each page/image
      for (let i = 0; i < Math.min(images.length, 5); i++) { // Limit to 5 pages for performance
        console.log(`Processing page ${i + 1}/${Math.min(images.length, 5)}`);
        
        const result = await worker.recognize(images[i]);

        // Extract detailed results
        const pageText = result.data.text;
        const pageConfidence = result.data.confidence;
        
        allText += pageText + '\n\n';
        totalConfidence += pageConfidence;

        // Extract word-level information
        if (result.data.words) {
          result.data.words.forEach(word => {
            if (word.confidence > 30) { // Filter low-confidence words
              allWords.push({
                text: word.text,
                confidence: word.confidence,
                bbox: word.bbox
              });
            }
          });
        }

        // Extract block-level information
        if (result.data.blocks) {
          result.data.blocks.forEach(block => {
            if (block.confidence > 30) { // Filter low-confidence blocks
              allBlocks.push({
                text: block.text,
                confidence: block.confidence,
                bbox: block.bbox
              });
            }
          });
        }
      }

      const processingTime = Date.now() - startTime;
      const averageConfidence = totalConfidence / images.length;
      const imageQuality = this.assessImageQuality(images[0]);

      const result: EnhancedOCRResult = {
        text: allText.trim(),
        confidence: averageConfidence / 100, // Normalize to 0-1
        words: allWords,
        blocks: allBlocks,
        processingTime,
        imageQuality
      };

      console.log(`Enhanced Tesseract extraction completed in ${processingTime}ms with confidence ${averageConfidence.toFixed(1)}%`);
      
      return result;

    } catch (error) {
      console.error('Enhanced Tesseract extraction failed:', error);
      return {
        text: '',
        confidence: 0,
        words: [],
        blocks: [],
        processingTime: 0,
        imageQuality: 0
      };
    }
  }

  /**
   * Convert PDF to optimized images for OCR
   * Uses high DPI and preprocessing for better OCR results
   */
  private async convertPdfToOptimizedImages(file: File): Promise<HTMLCanvasElement[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const images: HTMLCanvasElement[] = [];

      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 5); pageNum++) {
        const page = await pdf.getPage(pageNum);
        
        // Use higher scale for better OCR accuracy
        const scale = 3.0; // Higher DPI for better text recognition
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Enable image smoothing for better quality
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        await page.render({
          canvasContext: context,
          viewport: viewport,
          intent: 'print' // Use print intent for better quality
        }).promise;

        // Apply image preprocessing for better OCR
        this.preprocessImageForOCR(context, canvas.width, canvas.height);

        images.push(canvas);
      }

      return images;
    } catch (error) {
      console.error('PDF to optimized images conversion failed:', error);
      return [];
    }
  }

  /**
   * Preprocess image to improve OCR accuracy
   * Based on Tesseract best practices
   */
  private preprocessImageForOCR(context: CanvasRenderingContext2D, width: number, height: number): void {
    try {
      const imageData = context.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Apply contrast enhancement and noise reduction
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale using luminance formula
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Apply contrast enhancement
        const enhanced = this.enhanceContrast(gray);
        
        // Set RGB channels to enhanced value
        data[i] = enhanced;     // Red
        data[i + 1] = enhanced; // Green
        data[i + 2] = enhanced; // Blue
        // Alpha channel (data[i + 3]) remains unchanged
      }

      context.putImageData(imageData, 0, 0);
    } catch (error) {
      console.error('Image preprocessing failed:', error);
    }
  }

  /**
   * Enhance image contrast for better OCR
   */
  private enhanceContrast(value: number): number {
    // Simple contrast enhancement
    const factor = 1.5; // Contrast factor
    const enhanced = ((value / 255 - 0.5) * factor + 0.5) * 255;
    return Math.max(0, Math.min(255, enhanced));
  }

  /**
   * Assess image quality for OCR suitability
   */
  private assessImageQuality(canvas: HTMLCanvasElement): number {
    try {
      const context = canvas.getContext('2d')!;
      const imageData = context.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
      const data = imageData.data;

      let variance = 0;
      let mean = 0;
      const sampleSize = data.length / 4;

      // Calculate mean
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        mean += gray;
      }
      mean /= sampleSize;

      // Calculate variance
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        variance += Math.pow(gray - mean, 2);
      }
      variance /= sampleSize;

      // Higher variance indicates better contrast/quality for OCR
      const quality = Math.min(variance / 1000, 1.0);
      return quality;
    } catch (error) {
      console.error('Image quality assessment failed:', error);
      return 0.5; // Default medium quality
    }
  }

  /**
   * Extract specific insurance data using enhanced OCR results
   */
  extractInsuranceData(ocrResult: EnhancedOCRResult): any {
    const text = ocrResult.text;
    const words = ocrResult.words;

    return {
      policyNumber: this.extractPolicyNumber(text, words),
      insuredName: this.extractInsuredName(text, words),
      insurerName: this.extractInsurerName(text, words),
      effectiveDate: this.extractDate(text, 'effective'),
      expirationDate: this.extractDate(text, 'expiration'),
      propertyAddress: this.extractPropertyAddress(text, words),
      coverageAmounts: this.extractCoverageAmounts(text, words),
      deductibles: this.extractDeductibles(text, words)
    };
  }

  private extractPolicyNumber(text: string, words: any[]): string | null {
    // Enhanced policy number extraction using both text and word-level data
    const patterns = [
      /(?:policy\s+(?:number|no\.?|#)\s*:?\s*)([A-Z0-9\-]{6,20})/i,
      /(?:pol\s*#?\s*:?\s*)([A-Z0-9\-]{6,20})/i,
      /\b([A-Z]{2,3}\s*\-?\s*\d{6,12})\b/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].replace(/\s/g, '');
    }

    return null;
  }

  private extractInsuredName(text: string, words: any[]): string | null {
    const patterns = [
      /(?:insured\s*:?\s*)([A-Za-z\s,&]+)(?:\n|$)/i,
      /(?:named\s+insured\s*:?\s*)([A-Za-z\s,&]+)(?:\n|$)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim().replace(/\s+/g, ' ');
      }
    }

    return null;
  }

  private extractInsurerName(text: string, words: any[]): string | null {
    const patterns = [
      /(?:insurance\s+company\s*:?\s*)([A-Za-z\s&,\.]+)(?:\n|$)/i,
      /(?:insurer\s*:?\s*)([A-Za-z\s&,\.]+)(?:\n|$)/i,
      /(?:carrier\s*:?\s*)([A-Za-z\s&,\.]+)(?:\n|$)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim().replace(/\s+/g, ' ');
      }
    }

    return null;
  }

  private extractDate(text: string, type: 'effective' | 'expiration'): string | null {
    const typePattern = type === 'effective' ? 
      /(?:effective|from|start)\s+date\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i :
      /(?:expir(?:ation|y)|to|end)\s+date\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i;

    const match = text.match(typePattern);
    return match ? match[1] : null;
  }

  private extractPropertyAddress(text: string, words: any[]): string | null {
    const patterns = [
      /(?:property\s+address\s*:?\s*)([^\n]+)/i,
      /(?:location\s*:?\s*)([^\n]+)/i,
      /(?:premises\s*:?\s*)([^\n]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  private extractCoverageAmounts(text: string, words: any[]): any[] {
    const coveragePattern = /(?:coverage\s+[A-Z]\s*-?\s*)?([A-Za-z\s]+)\s*:?\s*\$?([\d,]+)/gi;
    const coverages = [];
    let match;

    while ((match = coveragePattern.exec(text)) !== null) {
      coverages.push({
        type: match[1].trim(),
        amount: match[2].replace(/,/g, '')
      });
    }

    return coverages;
  }

  private extractDeductibles(text: string, words: any[]): any[] {
    const deductiblePattern = /(?:deductible|ded\.?)\s*:?\s*\$?([\d,]+)/gi;
    const deductibles = [];
    let match;

    while ((match = deductiblePattern.exec(text)) !== null) {
      deductibles.push({
        amount: match[1].replace(/,/g, ''),
        type: 'general'
      });
    }

    return deductibles;
  }

  /**
   * Cleanup workers when service is no longer needed
   */
  async cleanup(): Promise<void> {
    console.log('Cleaning up Enhanced Tesseract workers...');
    
    for (const [name, worker] of this.workers) {
      try {
        await worker.terminate();
        console.log(`${name} worker terminated`);
      } catch (error) {
        console.error(`Failed to terminate ${name} worker:`, error);
      }
    }
    
    this.workers.clear();
    this.initialized = false;
  }
}

// Export singleton instance
export const enhancedTesseractService = new EnhancedTesseractService();
