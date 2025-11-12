/**
 * Google Gemini AI Service
 * Primary AI engine for ClaimGuru CRM
 * Handles document analysis, PDF extraction, claim processing, and recommendations
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

class GeminiService {
  private static instance: GeminiService
  private genAI: GoogleGenerativeAI | null = null
  private model: GenerativeModel | null = null
  private visionModel: GenerativeModel | null = null
  private isInitialized = false

  private constructor() {}

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService()
    }
    return GeminiService.instance
  }

  /**
   * Initialize Gemini with API key from environment
   */
  initialize() {
    if (this.isInitialized) return

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY

    if (!apiKey) {
      console.warn('⚠️ Gemini API key not found. Set VITE_GEMINI_API_KEY in .env file')
      return
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey)
      
      // Gemini 1.5 Pro for text and complex analysis
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        },
      })

      // Gemini 1.5 Pro Vision for document/image analysis
      this.visionModel = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.2, // Lower temperature for more accurate extraction
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        },
      })

      this.isInitialized = true
      console.log('✅ Gemini AI initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Gemini:', error)
      throw error
    }
  }

  /**
   * Check if Gemini is properly configured
   */
  isConfigured(): boolean {
    return this.isInitialized && this.model !== null
  }

  /**
   * Generate text response from prompt
   */
  async generateText(prompt: string): Promise<string> {
    if (!this.isConfigured()) {
      this.initialize()
    }

    if (!this.model) {
      throw new Error('Gemini model not initialized')
    }

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response
      return response.text()
    } catch (error) {
      console.error('Error generating text with Gemini:', error)
      throw error
    }
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON<T>(prompt: string): Promise<T> {
    const text = await this.generateText(prompt)
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)
    const jsonText = jsonMatch ? jsonMatch[1] : text
    
    try {
      return JSON.parse(jsonText) as T
    } catch (error) {
      console.error('Failed to parse JSON from Gemini response:', text)
      throw new Error('Invalid JSON response from Gemini')
    }
  }

  /**
   * Analyze document with vision (for PDFs converted to images or scanned documents)
   */
  async analyzeDocument(
    documentContent: string | { inlineData: { data: string; mimeType: string } },
    prompt: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      this.initialize()
    }

    if (!this.visionModel) {
      throw new Error('Gemini vision model not initialized')
    }

    try {
      const parts = typeof documentContent === 'string' 
        ? [prompt, documentContent]
        : [prompt, documentContent]

      const result = await this.visionModel.generateContent(parts)
      const response = result.response
      return response.text()
    } catch (error) {
      console.error('Error analyzing document with Gemini Vision:', error)
      throw error
    }
  }

  /**
   * Extract structured data from document text
   */
  async extractDocumentData<T>(documentText: string, fields: string[]): Promise<T> {
    const prompt = `
You are a document data extraction expert. Extract the following fields from this document:

Fields to extract: ${fields.join(', ')}

Document text:
${documentText}

Return ONLY a JSON object with the extracted data. Use null for fields not found.
Format dates as YYYY-MM-DD, format currency as numbers without symbols.

Example response format:
{
  "policyNumber": "ABC123456",
  "insuredName": "John Doe",
  "effectiveDate": "2025-01-01",
  "coverageAmount": 500000
}
`

    return this.generateJSON<T>(prompt)
  }

  /**
   * Analyze insurance claim
   */
  async analyzeClaim(claimData: any): Promise<any> {
    const prompt = `
You are an insurance claim analysis expert. Analyze this claim and provide detailed insights:

Claim Data:
${JSON.stringify(claimData, null, 2)}

Provide analysis in the following JSON format:
{
  "coverageAssessment": "detailed assessment of coverage",
  "estimatedSettlement": 50000,
  "timeToResolution": 45,
  "riskFactors": ["list", "of", "risk", "factors"],
  "nextSteps": ["recommended", "next", "steps"],
  "documentationNeeded": ["required", "documents"],
  "similarCases": [{"description": "...", "outcome": "...", "settlement": 0}],
  "confidence": 0.85
}
`

    return this.generateJSON(prompt)
  }

  /**
   * Generate claim recommendations
   */
  async generateRecommendations(claimData: any): Promise<any> {
    const prompt = `
You are an insurance claim recommendation expert. Provide actionable recommendations for this claim:

Claim Data:
${JSON.stringify(claimData, null, 2)}

Provide recommendations in the following JSON format:
{
  "immediateActions": [
    {"action": "action description", "priority": "high|medium|low", "reason": "why"}
  ],
  "documentRequests": [
    {"document": "document name", "urgency": "high|medium|low", "purpose": "why needed"}
  ],
  "negotiationStrategy": {
    "approach": "strategy description",
    "keyPoints": ["point1", "point2"],
    "expectedOutcome": "outcome description"
  },
  "estimatedTimeline": {
    "documentGathering": 14,
    "initialReview": 7,
    "negotiation": 30,
    "settlement": 60
  },
  "potentialChallenges": ["challenge1", "challenge2"],
  "successFactors": ["factor1", "factor2"]
}
`

    return this.generateJSON(prompt)
  }

  /**
   * Extract policy information from document
   */
  async extractPolicyInfo(documentText: string): Promise<any> {
    const prompt = `
You are an insurance policy document expert. Extract all policy information from this document:

Document:
${documentText}

Extract and return in JSON format:
{
  "policyNumber": "policy number",
  "carrier": "insurance company name",
  "insuredName": "insured person/business",
  "effectiveDate": "YYYY-MM-DD",
  "expirationDate": "YYYY-MM-DD",
  "policyType": "type of policy",
  "coverages": [
    {
      "type": "coverage type",
      "limit": 500000,
      "deductible": 1000,
      "description": "coverage details"
    }
  ],
  "premium": {
    "amount": 1200,
    "frequency": "annual|monthly",
    "nextDue": "YYYY-MM-DD"
  },
  "propertyAddress": "property address if applicable",
  "additionalInsured": ["list of additional insured parties"],
  "exclusions": ["list of exclusions"],
  "specialConditions": ["special conditions or endorsements"],
  "agentInfo": {
    "name": "agent name",
    "agency": "agency name",
    "phone": "phone number",
    "email": "email"
  }
}
`

    return this.generateJSON(prompt)
  }

  /**
   * Summarize document
   */
  async summarizeDocument(documentText: string, maxLength: number = 500): Promise<string> {
    const prompt = `
Summarize the following document in ${maxLength} characters or less. Focus on key information, dates, amounts, and parties involved.

Document:
${documentText}
`

    return this.generateText(prompt)
  }

  /**
   * Compare documents and identify discrepancies
   */
  async compareDocuments(doc1: string, doc2: string): Promise<any> {
    const prompt = `
Compare these two documents and identify any discrepancies, differences, or inconsistencies:

Document 1:
${doc1}

Document 2:
${doc2}

Return comparison in JSON format:
{
  "overallSimilarity": 0.85,
  "keyDifferences": [
    {"field": "field name", "doc1Value": "value", "doc2Value": "value", "severity": "high|medium|low"}
  ],
  "consistentFields": ["field1", "field2"],
  "missingInDoc1": ["field1"],
  "missingInDoc2": ["field2"],
  "recommendations": ["recommendation1", "recommendation2"]
}
`

    return this.generateJSON(prompt)
  }

  /**
   * Generate smart form suggestions based on context
   */
  async suggestFormFields(context: any, partialData: any): Promise<any> {
    const prompt = `
Based on the context and partial data provided, suggest intelligent auto-fill values for remaining form fields:

Context:
${JSON.stringify(context, null, 2)}

Partial Data:
${JSON.stringify(partialData, null, 2)}

Provide suggestions in JSON format with confidence scores (0-1):
{
  "suggestions": {
    "fieldName": {"value": "suggested value", "confidence": 0.9, "source": "reason"}
  }
}
`

    return this.generateJSON(prompt)
  }
}

export const geminiService = GeminiService.getInstance()
export default geminiService
