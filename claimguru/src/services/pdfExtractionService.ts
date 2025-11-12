/**
 * PDF Extraction Service with Gemini AI
 * Extracts text and structured data from PDF documents using pdf-parse and Gemini
 */

import { geminiService } from './geminiService'

// @ts-ignore - pdf-parse has ESM issues
const pdfParse = require('pdf-parse')

export interface PDFExtractionResult {
  success: boolean
  text?: string
  pages?: number
  extractedData?: any
  policyData?: any
  confidence?: number
  error?: string
  metadata?: {
    title?: string
    author?: string
    subject?: string
    creator?: string
    producer?: string
    creationDate?: Date
    modDate?: Date
  }
}

class PDFExtractionService {
  private static instance: PDFExtractionService

  private constructor() {}

  static getInstance(): PDFExtractionService {
    if (!PDFExtractionService.instance) {
      PDFExtractionService.instance = new PDFExtractionService()
    }
    return PDFExtractionService.instance
  }

  /**
   * Extract text from PDF file
   */
  async extractText(file: File | Buffer): Promise<PDFExtractionResult> {
    try {
      console.log('📄 Extracting text from PDF...')
      
      // Convert File to Buffer if needed
      const buffer = file instanceof File ? await file.arrayBuffer() : file
      const bufferData = Buffer.from(buffer)

      // Parse PDF
      const data = await pdfParse(bufferData)

      console.log(`✅ Extracted ${data.numpages} pages, ${data.text.length} characters`)

      return {
        success: true,
        text: data.text,
        pages: data.numpages,
        metadata: {
          title: data.info?.Title,
          author: data.info?.Author,
          subject: data.info?.Subject,
          creator: data.info?.Creator,
          producer: data.info?.Producer,
          creationDate: data.info?.CreationDate,
          modDate: data.info?.ModDate,
        }
      }
    } catch (error: any) {
      console.error('❌ PDF extraction error:', error)
      return {
        success: false,
        error: error.message || 'Failed to extract PDF text'
      }
    }
  }

  /**
   * Extract insurance policy data from PDF using Gemini AI
   */
  async extractPolicyData(file: File): Promise<PDFExtractionResult> {
    try {
      console.log('📑 Extracting policy data from PDF with Gemini AI...')

      // First extract text
      const textResult = await this.extractText(file)
      
      if (!textResult.success || !textResult.text) {
        return textResult
      }

      // Use Gemini to extract structured policy data
      console.log('🤖 Analyzing document with Gemini AI...')
      const policyData = await geminiService.extractPolicyInfo(textResult.text)

      console.log('✅ Policy data extracted successfully')

      return {
        success: true,
        text: textResult.text,
        pages: textResult.pages,
        policyData,
        extractedData: policyData,
        confidence: 0.9,
        metadata: textResult.metadata
      }
    } catch (error: any) {
      console.error('❌ Policy extraction error:', error)
      return {
        success: false,
        error: error.message || 'Failed to extract policy data'
      }
    }
  }

  /**
   * Extract specific fields from document
   */
  async extractFields(file: File, fields: string[]): Promise<PDFExtractionResult> {
    try {
      console.log(`📋 Extracting fields from PDF: ${fields.join(', ')}`)

      // Extract text first
      const textResult = await this.extractText(file)
      
      if (!textResult.success || !textResult.text) {
        return textResult
      }

      // Use Gemini to extract specific fields
      console.log('🤖 Extracting fields with Gemini AI...')
      const extractedData = await geminiService.extractDocumentData(
        textResult.text,
        fields
      )

      console.log('✅ Fields extracted successfully')

      return {
        success: true,
        text: textResult.text,
        pages: textResult.pages,
        extractedData,
        confidence: 0.85,
        metadata: textResult.metadata
      }
    } catch (error: any) {
      console.error('❌ Field extraction error:', error)
      return {
        success: false,
        error: error.message || 'Failed to extract fields'
      }
    }
  }

  /**
   * Analyze claim document
   */
  async analyzeClaimDocument(file: File): Promise<PDFExtractionResult> {
    try {
      console.log('📊 Analyzing claim document with Gemini AI...')

      // Extract text
      const textResult = await this.extractText(file)
      
      if (!textResult.success || !textResult.text) {
        return textResult
      }

      // Define claim-specific fields
      const claimFields = [
        'claimNumber',
        'policyNumber',
        'dateOfLoss',
        'lossLocation',
        'claimant',
        'claimType',
        'damageDescription',
        'estimatedAmount',
        'adjusterName',
        'adjusterPhone',
        'carrierName',
        'insuredName'
      ]

      // Extract claim data
      console.log('🤖 Extracting claim information...')
      const extractedData = await geminiService.extractDocumentData(
        textResult.text,
        claimFields
      )

      console.log('✅ Claim document analyzed successfully')

      return {
        success: true,
        text: textResult.text,
        pages: textResult.pages,
        extractedData,
        confidence: 0.88,
        metadata: textResult.metadata
      }
    } catch (error: any) {
      console.error('❌ Claim analysis error:', error)
      return {
        success: false,
        error: error.message || 'Failed to analyze claim document'
      }
    }
  }

  /**
   * Summarize PDF document
   */
  async summarizeDocument(file: File, maxLength: number = 500): Promise<PDFExtractionResult> {
    try {
      console.log('📝 Summarizing document with Gemini AI...')

      // Extract text
      const textResult = await this.extractText(file)
      
      if (!textResult.success || !textResult.text) {
        return textResult
      }

      // Generate summary
      const summary = await geminiService.summarizeDocument(textResult.text, maxLength)

      console.log('✅ Document summarized successfully')

      return {
        success: true,
        text: textResult.text,
        pages: textResult.pages,
        extractedData: { summary },
        confidence: 0.92,
        metadata: textResult.metadata
      }
    } catch (error: any) {
      console.error('❌ Summarization error:', error)
      return {
        success: false,
        error: error.message || 'Failed to summarize document'
      }
    }
  }

  /**
   * Batch process multiple PDFs
   */
  async batchExtract(files: File[], extractionType: 'policy' | 'claim' | 'fields', fields?: string[]): Promise<PDFExtractionResult[]> {
    console.log(`📚 Batch processing ${files.length} PDF files...`)

    const results: PDFExtractionResult[] = []

    for (const file of files) {
      try {
        let result: PDFExtractionResult

        switch (extractionType) {
          case 'policy':
            result = await this.extractPolicyData(file)
            break
          case 'claim':
            result = await this.analyzeClaimDocument(file)
            break
          case 'fields':
            result = await this.extractFields(file, fields || [])
            break
          default:
            result = await this.extractText(file)
        }

        results.push(result)
      } catch (error: any) {
        results.push({
          success: false,
          error: `Failed to process ${file.name}: ${error.message}`
        })
      }
    }

    console.log(`✅ Batch processing complete: ${results.filter(r => r.success).length}/${files.length} successful`)

    return results
  }
}

export const pdfExtractionService = PDFExtractionService.getInstance()
export default pdfExtractionService
