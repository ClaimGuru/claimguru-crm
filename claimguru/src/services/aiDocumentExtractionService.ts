import { supabase } from '../lib/supabase'

export interface DocumentExtractionResult {
  success: boolean
  extractedData?: any
  extractedText?: string
  policyData?: any
  confidence?: number
  processingMethod?: string
  cost?: number
  processingTime?: number
  error?: string
  metadata?: {
    fileName?: string
    fileSize?: number
    mimeType?: string
    methodsAttempted?: string[]
    aiModel?: string
  }
}

export interface ExtractionOptions {
  mode?: 'basic' | 'enhanced'
  extractionType?: 'policy' | 'claim' | 'general'
  includeOCR?: boolean
  aiModel?: 'gpt-4' | 'gpt-4o-mini'
}

class AIDocumentExtractionService {
  private readonly supabaseUrl = 'https://ttnjqxemkbugwsofacxs.supabase.co'
  
  /**
   * Extract text from PDF using OCR
   */
  private async extractTextFromPDF(file: File): Promise<string> {
    try {
      // For basic text extraction, we can use browser APIs or a simpler method
      // This is a fallback for when advanced services aren't available
      return ''
    } catch (error) {
      console.error('PDF text extraction failed:', error)
      throw new Error('Failed to extract text from PDF')
    }
  }

  /**
   * Call Supabase Edge Function for AI field extraction
   */
  private async callOpenAIExtraction(text: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('openai-extract-fields-enhanced', {
        body: { text }
      })

      if (error) {
        console.error('Supabase function error:', error)
        throw new Error(`AI extraction failed: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('OpenAI extraction error:', error)
      throw error
    }
  }

  /**
   * Call Google Vision API for OCR text extraction
   */
  private async callGoogleVisionExtraction(file: File): Promise<string> {
    try {
      // Convert file to base64 for the API
      const base64 = await this.fileToBase64(file)
      
      const { data, error } = await supabase.functions.invoke('google-vision-extract', {
        body: { 
          image: base64,
          fileName: file.name 
        }
      })

      if (error) {
        console.error('Google Vision error:', error)
        throw new Error(`OCR extraction failed: ${error.message}`)
      }

      return data.extractedText || ''
    } catch (error) {
      console.error('Google Vision extraction error:', error)
      throw error
    }
  }

  /**
   * Convert file to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove data:image/...;base64, prefix
        resolve(result.split(',')[1])
      }
      reader.onerror = error => reject(error)
    })
  }

  /**
   * Main document extraction method
   */
  public async extractFromDocument(
    file: File, 
    options: ExtractionOptions = {}
  ): Promise<DocumentExtractionResult> {
    const startTime = Date.now()
    const metadata = {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      methodsAttempted: [] as string[],
      aiModel: options.aiModel || 'gpt-4o-mini'
    }

    try {
      console.log(`🚀 Starting document extraction for: ${file.name}`);
      
      let extractedText = ''
      
      // Step 1: Extract text based on file type
      if (file.type === 'application/pdf') {
        metadata.methodsAttempted.push('pdf-extraction')
        
        // Try Google Vision OCR for PDFs (more reliable for scanned documents)
        try {
          extractedText = await this.callGoogleVisionExtraction(file)
          metadata.methodsAttempted.push('google-vision-ocr')
          console.log(`✅ OCR extraction successful, text length: ${extractedText.length}`);
        } catch (ocrError) {
          console.log('⚠️ OCR extraction failed, trying fallback text extraction');
          extractedText = await this.extractTextFromPDF(file)
          metadata.methodsAttempted.push('fallback-pdf-text')
        }
      } else if (file.type.startsWith('image/')) {
        metadata.methodsAttempted.push('image-ocr')
        extractedText = await this.callGoogleVisionExtraction(file)
        console.log(`✅ Image OCR successful, text length: ${extractedText.length}`);
      } else {
        throw new Error('Unsupported file type. Please upload PDF or image files.')
      }

      if (!extractedText || extractedText.trim().length < 10) {
        throw new Error('Could not extract sufficient text from document. Please ensure the document is readable and contains text.')
      }

      // Step 2: AI Field Extraction
      console.log(`🤖 Starting AI field extraction...`);
      metadata.methodsAttempted.push('openai-field-extraction')
      
      const aiResult = await this.callOpenAIExtraction(extractedText)
      
      if (!aiResult) {
        throw new Error('AI extraction returned no results')
      }

      const processingTime = Date.now() - startTime
      
      console.log(`✅ Document extraction completed successfully in ${processingTime}ms`);
      
      return {
        success: true,
        extractedData: aiResult,
        extractedText,
        policyData: aiResult, // For backward compatibility
        confidence: 0.85, // Default confidence score
        processingMethod: 'ai-enhanced',
        cost: 0.05, // Estimated cost
        processingTime,
        metadata
      }

    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error(`❌ Document extraction failed after ${processingTime}ms:`, error)
      
      return {
        success: false,
        error: error.message || 'Unknown extraction error',
        processingTime,
        metadata,
        confidence: 0
      }
    }
  }

  /**
   * Extract from multiple documents
   */
  public async extractFromMultipleDocuments(
    files: File[],
    options: ExtractionOptions = {}
  ): Promise<DocumentExtractionResult[]> {
    console.log(`📄 Starting batch extraction for ${files.length} documents`);
    
    const results = await Promise.allSettled(
      files.map(file => this.extractFromDocument(file, options))
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error(`Document ${index} extraction failed:`, result.reason)
        return {
          success: false,
          error: result.reason?.message || 'Unknown error',
          metadata: {
            fileName: files[index]?.name || `document-${index}`,
            fileSize: files[index]?.size || 0,
            mimeType: files[index]?.type || 'unknown'
          }
        }
      }
    })
  }

  /**
   * Validate extracted data quality
   */
  public validateExtractionQuality(result: DocumentExtractionResult): {
    isValid: boolean
    confidence: number
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []
    let confidence = result.confidence || 0

    if (!result.success) {
      issues.push('Extraction failed')
      confidence = 0
    }

    if (!result.extractedText || result.extractedText.length < 50) {
      issues.push('Insufficient text extracted')
      suggestions.push('Try a higher resolution scan or different file format')
      confidence = Math.max(0, confidence - 0.3)
    }

    if (result.extractedData) {
      const requiredFields = ['policyNumber', 'insuredName', 'effectiveDate']
      const missingFields = requiredFields.filter(field => !result.extractedData[field])
      
      if (missingFields.length > 0) {
        issues.push(`Missing critical fields: ${missingFields.join(', ')}`)
        suggestions.push('Verify document contains all required information')
        confidence = Math.max(0, confidence - (missingFields.length * 0.1))
      }
    }

    return {
      isValid: issues.length === 0 && confidence > 0.5,
      confidence: Math.max(0, Math.min(1, confidence)),
      issues,
      suggestions
    }
  }
}

// Export singleton instance
export const aiDocumentExtractionService = new AIDocumentExtractionService()
export default aiDocumentExtractionService
