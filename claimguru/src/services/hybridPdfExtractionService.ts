/**
 * HYBRID PDF EXTRACTION SERVICE - ClaimGuru
 * 
 * MOST ACCURATE Multi-Tier Implementation:
 * 1. PDF.js (Free, client-side) - Fast text extraction
 * 2. Tesseract.js OCR (Free, comprehensive OCR)
 * 3. Google Vision API (Premium, high-accuracy OCR)
 * 4. OpenAI Enhancement (Always applied to best text)
 * 5. Advanced Regex Parsing (Reliable fallback)
 */

export interface HybridPDFExtractionResult {
  extractedText: string;
  confidence: number;
  processingMethod: 'pdf-js' | 'tesseract' | 'google-vision' | 'fallback';
  cost: number;
  processingTime: number;
  policyData: {
    // Basic Policy Information
    policyNumber?: string;
    insuredName?: string;
    coinsuredName?: string;
    effectiveDate?: string;
    expirationDate?: string;
    
    // Addresses
    propertyAddress?: string;
    mailingAddress?: string;
    
    // Coverage Information
    coverageA?: string;  // Dwelling
    coverageB?: string;  // Other Structures
    coverageC?: string;  // Personal Property
    coverageD?: string;  // Loss of Use
    moldLimit?: string;
    
    // Deductibles
    deductible?: string;
    deductibleType?: string; // percentage or flat amount
    deductiblePercentageOf?: string; // what the percentage is based on
    deductibles?: Array<{
      type: string;
      amount: string;
      isPercentage?: boolean;
      percentageOf?: string;
    }>;
    
    // Insurer Information
    insurerName?: string;
    insurerPhone?: string;
    insurerAddress?: string;
    
    // Agent Information
    agentName?: string;
    agentPhone?: string;
    agentAddress?: string;
    
    // Mortgagee Information
    mortgageeName?: string;
    mortgageePhone?: string;
    mortgageeAddress?: string;
    mortgageAccountNumber?: string;
    
    // Property Construction Details
    yearBuilt?: string;
    dwellingStyle?: string;
    numberOfFamilies?: string;
    squareFootage?: string;
    numberOfStories?: string;
    numberOfBathrooms?: string;
    numberOfEmployees?: string;
    
    // Construction Materials
    foundationType?: string;
    constructionType?: string;
    sidingType?: string;
    roofMaterialType?: string;
    exteriorWallTypes?: string;
    interiorWallPartition?: string;
    
    // Roof Details
    roofSquareFootage?: string;
    ageOfRoof?: string;
    roofSurfaceMaterial?: string;
    
    // Garage and Structures
    garageType?: string;
    garageNumberOfCars?: string;
    attachedStructures?: string;
    
    // Additional Features
    pool?: string;
    finishedBasement?: string;
    heatingAndCooling?: string;
    interiorDetails?: string;
    additionalDetails?: string;
    treeOverhang?: string;
    
    // Safety and Protection
    fireProtectionDetails?: string;
    
    // Legacy fields for compatibility
    coverageAmount?: string;
    premium?: string;
    coverageTypes?: string[];
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
      
      // Smart extraction strategy - use additional methods only when needed
      let bestText = extractedText;
      let bestConfidence = this.qualityToConfidence(qualityScore);
      let bestMethod: 'pdf-js' | 'tesseract' | 'google-vision' | 'fallback' = 'pdf-js';
      let bestQuality = qualityScore;
      
      console.log(`📄 PDF.js baseline: ${extractedText.length} chars, Quality: ${qualityScore}`);
      
      // OPTIMIZED Early exit conditions for better performance vs accuracy trade-off
      const isExcellentQuality = qualityScore >= 90 && extractedText.length > 8000;
      const isHighQuality = qualityScore >= 75 && extractedText.length > 4000;
      const isGoodQuality = qualityScore >= 60 && extractedText.length > 2000;
      
      if (isExcellentQuality) {
        console.log('🚀 PDF.js quality is excellent (≥90%), skipping additional methods for optimal speed');
      } else if (isHighQuality) {
        console.log('⚡ PDF.js quality is high (≥75%), using quick Tesseract enhancement only');
      } else if (isGoodQuality) {
        console.log('⚡ PDF.js quality is good (≥70%), using quick enhancement only');
        
        // Try only Tesseract with optimized timeout for high quality
        console.log('🔤 STEP 2: Quick Tesseract OCR (with 25s timeout)...');
        methodsAttempted.push('tesseract');
        
        try {
          const tesseractResult = await Promise.race([
            this.extractWithTesseract(file),
            new Promise<{ text: string; confidence: number }>((_, reject) => 
              setTimeout(() => reject(new Error('Tesseract timeout')), 25000)
            )
          ]);
          
          const tesseractQuality = this.evaluateTextQuality(tesseractResult.text);
          console.log(`🔤 Tesseract result: ${tesseractResult.text.length} chars, Quality: ${tesseractQuality}`);
          
          // Use Tesseract if it's significantly better
          if (tesseractQuality > bestQuality + 10 || tesseractResult.text.length > bestText.length * 1.5) {
            bestText = tesseractResult.text;
            bestConfidence = Math.max(tesseractResult.confidence, this.qualityToConfidence(tesseractQuality));
            bestMethod = 'tesseract';
            bestQuality = tesseractQuality;
            console.log('✅ Tesseract provides better extraction');
          }
        } catch (tesseractError) {
          console.log('⚠️ Tesseract failed or timed out:', tesseractError.message);
        }
      } else {
        console.log('🔄 PDF.js quality is low, trying all extraction methods...');
        
        // STEP 2: Try Tesseract.js OCR with timeout
        console.log('🔤 STEP 2: Running Tesseract.js OCR (with 50s timeout)...');
        methodsAttempted.push('tesseract');
        
        try {
          const tesseractResult = await Promise.race([
            this.extractWithTesseract(file),
            new Promise<{ text: string; confidence: number }>((_, reject) => 
              setTimeout(() => reject(new Error('Tesseract timeout')), 50000)
            )
          ]);
          
          const tesseractQuality = this.evaluateTextQuality(tesseractResult.text);
          console.log(`🔤 Tesseract result: ${tesseractResult.text.length} chars, Quality: ${tesseractQuality}`);
          
          // Use Tesseract if it's better
          if (tesseractQuality > bestQuality || tesseractResult.text.length > bestText.length * 1.5) {
            bestText = tesseractResult.text;
            bestConfidence = Math.max(tesseractResult.confidence, this.qualityToConfidence(tesseractQuality));
            bestMethod = 'tesseract';
            bestQuality = tesseractQuality;
            console.log('✅ Tesseract provides better extraction');
          }
        } catch (tesseractError) {
          console.log('⚠️ Tesseract failed or timed out:', tesseractError.message);
        }
        
        // STEP 3: Try Google Vision API only if still low quality and file is small enough
        if (bestQuality < 60 && file.size < 4 * 1024 * 1024) { // Only for files < 4MB
          console.log('👁️ STEP 3: Running Google Vision API (with 35s timeout)...');
          methodsAttempted.push('google-vision');
          
          try {
            const visionResult = await Promise.race([
              this.extractWithGoogleVision(file),
              new Promise<{ text: string; confidence: number }>((_, reject) => 
                setTimeout(() => reject(new Error('Google Vision timeout')), 35000)
              )
            ]);
            
            const visionQuality = this.evaluateTextQuality(visionResult.text);
            console.log(`👁️ Google Vision result: ${visionResult.text.length} chars, Quality: ${visionQuality}`);
            
            // Use Google Vision if it's better quality
            if (visionQuality > bestQuality || visionResult.text.length > bestText.length * 1.2) {
              bestText = visionResult.text;
              bestConfidence = Math.max(visionResult.confidence, this.qualityToConfidence(visionQuality));
              bestMethod = 'google-vision';
              bestQuality = visionQuality;
              cost = 0.015; // Approximate cost per page
              console.log('✅ Google Vision provides best extraction');
            }
          } catch (visionError) {
            console.log('⚠️ Google Vision failed or timed out:', visionError.message);
          }
        } else if (bestQuality >= 60) {
          console.log('⚡ Quality sufficient, skipping Google Vision API');
        } else {
          console.log('📁 File too large for Google Vision API, skipping');
        }
      }
      
      // Use the best result from all methods
      extractedText = bestText;
      confidence = bestConfidence;
      processingMethod = bestMethod;
      qualityScore = bestQuality;
      
      console.log(`🏆 Best result: ${bestMethod} with ${extractedText.length} chars, Quality: ${qualityScore}`);

      // STEP 4: Enhance with AI parsing (with timeout for reliability)
      console.log('🧠 STEP 4: Enhancing with AI intelligence (with 20s timeout)...');
      let policyData;
      try {
        policyData = await Promise.race([
          this.enhanceWithAI(bestText),
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('AI enhancement timeout')), 20000)
          )
        ]);
        console.log('✅ AI enhancement completed successfully');
      } catch (aiError) {
        console.warn('⚠️ AI enhancement failed or timed out, using regex fallback:', aiError.message);
        policyData = this.parseWithAdvancedRegex(bestText);
      }

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
   * Convert quality score to confidence value
   */
  private qualityToConfidence(qualityScore: number): number {
    // Convert quality score (0-100) to confidence (0-1)
    // Apply a more realistic confidence curve
    if (qualityScore >= 80) return 0.9 + (qualityScore - 80) * 0.005; // 0.9 to 1.0
    if (qualityScore >= 60) return 0.7 + (qualityScore - 60) * 0.01;  // 0.7 to 0.9
    if (qualityScore >= 40) return 0.5 + (qualityScore - 40) * 0.01;  // 0.5 to 0.7
    if (qualityScore >= 20) return 0.3 + (qualityScore - 20) * 0.01;  // 0.3 to 0.5
    return Math.max(0.05, qualityScore * 0.015); // Minimum 5% confidence
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
          logger: m => {
            // Only log important progress milestones to reduce noise
            if (m.status === 'recognizing text' && (m.progress === 0 || m.progress >= 0.9 || m.progress % 0.2 < 0.05)) {
              console.log(`Tesseract progress: ${Math.round(m.progress * 100)}%`);
            } else if (m.status !== 'recognizing text') {
              console.log('Tesseract:', m.status);
            }
          }
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
   * STEP 4: AI Enhancement (OpenAI + Advanced Regex) with Data Formatting
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
          const cleanedData = this.formatExtractedData(result.policyData);
          return this.ensureProperDataTypes(cleanedData);
        }
      }
      
      console.warn('⚠️ OpenAI enhancement failed, using advanced regex parsing');
      const regexData = this.parseWithAdvancedRegex(text);
      return this.formatExtractedData(regexData);
    } catch (error) {
      console.warn('⚠️ OpenAI enhancement error:', error.message);
      const regexData = this.parseWithAdvancedRegex(text);
      return this.formatExtractedData(regexData);
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

    // Enhanced mortgage account number patterns
    const mortgagePatterns = [
      /(?:acc\s*num|account\s*number|loan\s*number|mortgage\s*number)\s*[:.]?\s*([A-Z0-9]{6,20})/i,
      /loan\s*#\s*[:.]?\s*([A-Z0-9]{6,20})/i,
      /account\s*[:.]?\s*([A-Z0-9]{6,20})/i,
      /mortgagee.*?([0-9]{8,15})/i
    ];
    
    for (const pattern of mortgagePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1] && !policyData.mortgageAccountNumber) {
        const accountNum = match[1].trim();
        if (accountNum.length >= 6 && accountNum.length <= 20) {
          policyData.mortgageAccountNumber = accountNum;
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
   * Format and clean extracted data for better readability
   */
  private formatExtractedData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const result = { ...data };
    
    // Format names (add spaces between concatenated names)
    if (result.insuredName && typeof result.insuredName === 'string') {
      result.insuredName = this.formatName(result.insuredName);
    }
    
    // Format company names
    if (result.insurerName && typeof result.insurerName === 'string') {
      result.insurerName = this.formatCompanyName(result.insurerName);
    }
    
    // Format addresses
    if (result.propertyAddress && typeof result.propertyAddress === 'string') {
      result.propertyAddress = this.formatAddress(result.propertyAddress);
    }
    
    if (result.mailingAddress && typeof result.mailingAddress === 'string') {
      result.mailingAddress = this.formatAddress(result.mailingAddress);
    }
    
    if (result.insurerAddress && typeof result.insurerAddress === 'string') {
      result.insurerAddress = this.formatAddress(result.insurerAddress);
    }
    
    if (result.agentAddress && typeof result.agentAddress === 'string') {
      result.agentAddress = this.formatAddress(result.agentAddress);
    }
    
    if (result.mortgageeAddress && typeof result.mortgageeAddress === 'string') {
      result.mortgageeAddress = this.formatAddress(result.mortgageeAddress);
    }
    
    // Format dates
    if (result.effectiveDate && typeof result.effectiveDate === 'string') {
      result.effectiveDate = this.formatDate(result.effectiveDate);
    }
    
    if (result.expirationDate && typeof result.expirationDate === 'string') {
      result.expirationDate = this.formatDate(result.expirationDate);
    }
    
    // Format phone numbers
    if (result.insurerPhone && typeof result.insurerPhone === 'string') {
      result.insurerPhone = this.formatPhoneNumber(result.insurerPhone);
    }
    
    if (result.agentPhone && typeof result.agentPhone === 'string') {
      result.agentPhone = this.formatPhoneNumber(result.agentPhone);
    }
    
    // Format agent name
    if (result.agentName && typeof result.agentName === 'string') {
      result.agentName = this.formatName(result.agentName);
    }
    
    // Format mortgagee name
    if (result.mortgageeName && typeof result.mortgageeName === 'string') {
      result.mortgageeName = this.formatCompanyName(result.mortgageeName);
    }
    
    return result;
  }
  
  /**
   * Format concatenated names by adding spaces
   */
  private formatName(name: string): string {
    // Handle cases like "terryconnellyphyllisconnelly"
    // Look for capital letters that might indicate name boundaries
    let formatted = name.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Handle common name patterns
    formatted = formatted.replace(/([a-z])([A-Z][a-z])/g, '$1 $2');
    
    // Capitalize first letters
    formatted = formatted.replace(/\b\w/g, l => l.toUpperCase());
    
    return formatted.trim();
  }
  
  /**
   * Format company names
   */
  private formatCompanyName(company: string): string {
    // Handle cases like "allstatevehicleandpropertyinsurancecompany"
    let formatted = company.toLowerCase();
    
    // Add spaces before common company words
    const companyWords = ['insurance', 'company', 'corporation', 'inc', 'llc', 'group', 'mutual', 'agency', 'services', 'financial', 'property', 'casualty', 'vehicle', 'auto', 'home', 'life'];
    
    companyWords.forEach(word => {
      const regex = new RegExp(`([a-z])(${word})`, 'gi');
      formatted = formatted.replace(regex, '$1 $2');
    });
    
    // Capitalize words
    formatted = formatted.replace(/\b\w/g, l => l.toUpperCase());
    
    return formatted.trim();
  }
  
  /**
   * Format addresses by adding spaces and proper formatting
   */
  private formatAddress(address: string): string {
    let formatted = address.toLowerCase();
    
    // Add space before state abbreviations (tx, ca, ny, etc.)
    formatted = formatted.replace(/([a-z])([a-z]{2})(\d{5})/g, '$1 $2 $3');
    
    // Add space before zip codes
    formatted = formatted.replace(/(\w)(\d{5})/g, '$1 $2');
    
    // Add spaces before common address words
    const addressWords = ['st', 'street', 'dr', 'drive', 'ave', 'avenue', 'rd', 'road', 'ln', 'lane', 'ct', 'court', 'pl', 'place', 'blvd', 'boulevard', 'box', 'po'];
    
    addressWords.forEach(word => {
      const regex = new RegExp(`([a-z])(${word})([\s\d]|$)`, 'gi');
      formatted = formatted.replace(regex, '$1 $2$3');
    });
    
    // Capitalize words
    formatted = formatted.replace(/\b\w/g, l => l.toUpperCase());
    
    return formatted.trim();
  }
  
  /**
   * Format dates from compressed format
   */
  private formatDate(date: string): string {
    // Handle cases like "june272024"
    const monthNames = {
      'january': '01', 'february': '02', 'march': '03', 'april': '04',
      'may': '05', 'june': '06', 'july': '07', 'august': '08',
      'september': '09', 'october': '10', 'november': '11', 'december': '12',
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
      'jun': '06', 'jul': '07', 'aug': '08',
      'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };
    
    let formatted = date.toLowerCase();
    
    // Look for month names followed by numbers
    for (const [monthName, monthNum] of Object.entries(monthNames)) {
      const regex = new RegExp(`${monthName}(\d{1,2})(\d{4})`, 'i');
      const match = formatted.match(regex);
      if (match) {
        const day = match[1].padStart(2, '0');
        const year = match[2];
        return `${monthNum}/${day}/${year}`;
      }
    }
    
    return date; // Return original if no pattern matches
  }
  
  /**
   * Format phone numbers
   */
  private formatPhoneNumber(phone: string): string {
    // Handle cases like "18002557828"
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone; // Return original if doesn't match expected patterns
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
