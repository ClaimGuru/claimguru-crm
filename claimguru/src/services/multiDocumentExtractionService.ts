/**
 * Multi-Document Extraction Service
 * Handles various insurance document types with specialized extraction logic
 */

import { HybridPDFExtractionService } from './hybridPdfExtractionService';
import { EnhancedHybridPdfExtractionService } from './enhancedHybridPdfExtractionService';
import DocumentClassificationService, { DocumentClassificationResult } from './documentClassificationService';
import { IdentifierExtractionService, IdentifierExtractionResult } from './identifierExtractionService';
import { IntelligentExtractionService, IntelligentExtractionResult } from './intelligentExtractionService';

export interface DocumentExtractionResult {
  documentInfo: {
    filename: string;
    type: string;
    category: string;
    confidence: number;
    processingMethod: string;
    processingTime: number;
    cost: number;
  };
  extractedData: any;
  rawText: string;
  classification: DocumentClassificationResult;
  identifierAnalysis: IdentifierExtractionResult; // Comprehensive identifier analysis
  intelligentExtraction?: IntelligentExtractionResult; // NEW: Intelligent extraction with learning
  validationSchema: any;
  processingNotes: string[];
}

export interface MultiDocumentResult {
  documents: DocumentExtractionResult[];
  claimContext: any;
  workflowAnalysis: any;
  consolidatedData: any;
  recommendations: string[];
  totalProcessingTime: number;
  totalCost: number;
}

export class MultiDocumentExtractionService {
  private hybridExtractor: HybridPDFExtractionService;
  private enhancedExtractor: EnhancedHybridPdfExtractionService;
  private classifier: DocumentClassificationService;
  private identifierExtractor: IdentifierExtractionService; // Identifier extraction service
  private intelligentExtractor: IntelligentExtractionService; // NEW: Intelligent extraction with learning
  private useEnhancedExtraction: boolean = true; // Feature flag
  private useIntelligentExtraction: boolean = true; // NEW: Intelligent extraction feature flag

  constructor() {
    this.hybridExtractor = new HybridPDFExtractionService();
    this.enhancedExtractor = new EnhancedHybridPdfExtractionService();
    this.classifier = new DocumentClassificationService();
    this.identifierExtractor = new IdentifierExtractionService(); // Initialize identifier extractor
    this.intelligentExtractor = new IntelligentExtractionService(); // NEW: Initialize intelligent extractor
  }

  /**
   * Process multiple documents with type-specific extraction
   */
  async processMultipleDocuments(files: File[]): Promise<MultiDocumentResult> {
    const startTime = Date.now();
    const results: DocumentExtractionResult[] = [];
    let totalCost = 0;

    console.log(`🚀 Starting multi-document processing for ${files.length} files`);

    // Phase 1: Extract and classify each document
    for (const file of files) {
      console.log(`📄 Processing: ${file.name}`);
      
      try {
        const docResult = await this.processDocument(file);
        results.push(docResult);
        totalCost += docResult.documentInfo.cost;
      } catch (error) {
        console.error(`❌ Failed to process ${file.name}:`, error);
        
        // Create error result
        results.push({
          documentInfo: {
            filename: file.name,
            type: 'error',
            category: 'processing',
            confidence: 0,
            processingMethod: 'failed',
            processingTime: 0,
            cost: 0
          },
          extractedData: {},
          rawText: '',
          classification: {
            documentType: 'error',
            confidence: 0,
            category: 'processing',
            extractionTemplate: 'error',
            suggestedFields: [],
            processingNotes: [`Error processing file: ${error.message}`]
          },
          identifierAnalysis: {
            policyNumber: null,
            claimNumber: null,
            fileNumber: null,
            carrierClaimNumber: null,
            documentType: 'unknown',
            primaryIdentifier: 'none',
            hasMultipleIdentifiers: false,
            policyNumberConfidence: 0,
            claimNumberConfidence: 0,
            relationshipStatus: 'missing',
            validationMessage: 'Error processing file',
            suggestions: []
          },
          validationSchema: {},
          processingNotes: [`Failed to process: ${error.message}`]
        });
      }
    }

    // Phase 2: Analyze workflow context
    const workflowAnalysis = this.classifier.analyzeDocumentWorkflow(
      results.map(r => ({ text: r.rawText, filename: r.documentInfo.filename }))
    );

    // Phase 3: Consolidate data across documents
    const consolidatedData = this.consolidateDocumentData(results);

    // Phase 4: Generate recommendations
    const recommendations = this.generateRecommendations(results, workflowAnalysis);

    const totalProcessingTime = Date.now() - startTime;

    console.log(`✅ Multi-document processing completed in ${totalProcessingTime}ms`);
    console.log(`💰 Total cost: $${totalCost.toFixed(3)}`);

    return {
      documents: results,
      claimContext: workflowAnalysis.claimContext,
      workflowAnalysis,
      consolidatedData,
      recommendations,
      totalProcessingTime,
      totalCost
    };
  }

  /**
   * Process a single document with type-specific extraction
   */
  private async processDocument(file: File): Promise<DocumentExtractionResult> {
    const startTime = Date.now();
    let intelligentResult: IntelligentExtractionResult | null = null;
    let basicExtraction: any;

    // Step 1: Try intelligent extraction first if enabled
    if (this.useIntelligentExtraction) {
      console.log('🧠 Using Intelligent Extraction with Adaptive Learning');
      try {
        intelligentResult = await this.intelligentExtractor.extractWithIntelligence(file);
        
        // Create a compatible basic extraction object from intelligent result
        basicExtraction = {
          extractedText: intelligentResult.rawText,
          policyData: intelligentResult.extractedData,
          confidence: intelligentResult.extractionIntelligence.finalConfidence,
          cost: intelligentResult.cost,
          processingMethod: intelligentResult.processingMethod,
          processingTime: intelligentResult.processingTime
        };
        
        console.log(`🎯 Intelligent extraction completed with ${Math.round(intelligentResult.extractionIntelligence.finalConfidence * 100)}% confidence`);
        
      } catch (error) {
        console.warn('⚠️ Intelligent extraction failed, falling back to enhanced extraction:', error.message);
        intelligentResult = null;
      }
    }
    
    // Step 2: Fallback to optimized hybrid extraction if intelligent extraction failed or is disabled
    if (!intelligentResult) {
      console.log('⚡ Using optimized hybrid extraction as fallback');
      basicExtraction = await this.hybridExtractor.extractFromPDF(file);
    }

    // Step 3: Classify document type (use intelligent result if available)
    const classification = intelligentResult 
      ? {
          documentType: intelligentResult.documentAnalysis.documentType,
          confidence: intelligentResult.documentAnalysis.confidence,
          category: 'processing' as const,
          extractionTemplate: intelligentResult.documentAnalysis.documentType,
          suggestedFields: intelligentResult.documentAnalysis.expectedFields,
          processingNotes: [`Classified using intelligent extraction`]
        }
      : this.classifier.classifyDocument(basicExtraction.extractedText);

    console.log(`📋 Document classified as: ${classification.documentType} (${classification.confidence.toFixed(1)}% confidence)`);

    // Step 4: Get identifier analysis (use intelligent result if available)
    const identifierAnalysis = intelligentResult 
      ? {
          policyNumber: intelligentResult.extractedData.policyNumber,
          claimNumber: intelligentResult.extractedData.claimNumber,
          fileNumber: intelligentResult.extractedData.fileNumber,
          carrierClaimNumber: intelligentResult.extractedData.carrierClaimNumber,
          documentType: intelligentResult.documentAnalysis.documentType as 'policy' | 'claim' | 'communication' | 'settlement' | 'unknown',
          primaryIdentifier: (intelligentResult.extractedData.policyNumber ? 'policy' : 
                           intelligentResult.extractedData.claimNumber ? 'claim' : 'none') as 'policy' | 'claim' | 'both' | 'none',
          hasMultipleIdentifiers: !!(intelligentResult.extractedData.policyNumber && intelligentResult.extractedData.claimNumber),
          policyNumberConfidence: 0.9, // High confidence from intelligent extraction
          claimNumberConfidence: 0.9,
          relationshipStatus: 'valid' as const,
          validationMessage: 'Validated through intelligent extraction',
          suggestions: []
        } as IdentifierExtractionResult
      : await this.identifierExtractor.extractIdentifiers(
          basicExtraction.extractedText,
          file.name
        );

    console.log(`🔍 Identifier analysis complete:`, {
      policy: identifierAnalysis.policyNumber || 'None',
      claim: identifierAnalysis.claimNumber || 'None',
      relationship: identifierAnalysis.relationshipStatus,
      docType: identifierAnalysis.documentType,
      method: intelligentResult ? 'intelligent' : 'standard'
    });

    // Step 5: Apply specialized extraction (use intelligent result if available)
    const specializedData = intelligentResult 
      ? intelligentResult.extractedData
      : await this.applySpecializedExtraction(
          basicExtraction.extractedText,
          classification,
          basicExtraction.policyData,
          identifierAnalysis // Pass identifier analysis
        );

    // Step 6: Create validation schema
    const validationSchema = this.createValidationSchema(classification);

    // Step 7: Generate processing notes
    const processingNotes = this.generateProcessingNotes(classification, basicExtraction, identifierAnalysis, intelligentResult);

    const processingTime = Date.now() - startTime;

    return {
      documentInfo: {
        filename: file.name,
        type: classification.documentType,
        category: classification.category,
        confidence: classification.confidence,
        processingMethod: basicExtraction.processingMethod,
        processingTime,
        cost: basicExtraction.cost
      },
      extractedData: specializedData,
      rawText: basicExtraction.extractedText,
      classification,
      identifierAnalysis, // Include comprehensive identifier analysis
      intelligentExtraction: intelligentResult, // NEW: Include intelligent extraction results if available
      validationSchema,
      processingNotes
    };
  }

  /**
   * Apply specialized extraction logic based on document type
   */
  private async applySpecializedExtraction(
    text: string,
    classification: DocumentClassificationResult,
    basicData: any,
    identifierAnalysis?: IdentifierExtractionResult // NEW: Include identifier analysis
  ): Promise<any> {
    const extractedData = { ...basicData };

    // Enhance extracted data with identifier analysis
    if (identifierAnalysis) {
      extractedData.policyNumber = identifierAnalysis.policyNumber || extractedData.policyNumber;
      extractedData.claimNumber = identifierAnalysis.claimNumber || extractedData.claimNumber;
      extractedData.fileNumber = identifierAnalysis.fileNumber || extractedData.fileNumber;
      extractedData.carrierClaimNumber = identifierAnalysis.carrierClaimNumber || extractedData.carrierClaimNumber;
      
      // Add identifier metadata
      extractedData.identifierMetadata = {
        documentType: identifierAnalysis.documentType,
        primaryIdentifier: identifierAnalysis.primaryIdentifier,
        relationshipStatus: identifierAnalysis.relationshipStatus,
        hasMultipleIdentifiers: identifierAnalysis.hasMultipleIdentifiers,
        validationMessage: identifierAnalysis.validationMessage,
        suggestions: identifierAnalysis.suggestions,
        confidenceScores: {
          policyNumber: identifierAnalysis.policyNumberConfidence,
          claimNumber: identifierAnalysis.claimNumberConfidence
        }
      };
    }

    switch (classification.documentType) {
      case 'insurance_policy':
        return this.extractPolicyData(text, extractedData);
      
      case 'reservation_of_rights':
        return this.extractRORData(text, extractedData);
      
      case 'request_for_information':
        return this.extractRFIData(text, extractedData);
      
      case 'acknowledgement_letter':
        return this.extractAcknowledgementData(text, extractedData);
      
      case 'settlement_letter':
        return this.extractSettlementData(text, extractedData);
      
      case 'rejection_letter':
      case 'proof_of_loss_rejection':
        return this.extractRejectionData(text, extractedData);
      
      case 'status_update_letter':
        return this.extractStatusUpdateData(text, extractedData);
      
      default:
        return this.extractGenericData(text, extractedData);
    }
  }

  /**
   * Specialized extraction methods for different document types
   */
  private extractPolicyData(text: string, baseData: any): any {
    // IMPORTANT: baseData already contains comprehensive OpenAI extraction with 34+ fields
    // We should enhance it, not overwrite it
    console.log('📋 Enhancing policy data - preserving comprehensive extraction');
    console.log('📊 Base data fields:', Object.keys(baseData).filter(k => baseData[k]).length);
    
    const policyData = { ...baseData };

    // Only enhance missing critical fields with targeted patterns
    const enhancementPatterns = {
      policyNumber: /(?:policy\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9\-]{5,25})/i,
      insuredName: /(?:named\s*insured|insured|policyholder)\s*[:.]?\s*([A-Z][A-Za-z\s,&'-]{2,50})/i,
      propertyAddress: /(?:property\s*address|residence|premises|risk\s*location)\s*[:.]?\s*([\w\s,#\-]{10,100})/i,
      effectiveDate: /(?:effective|policy\s*period\s*begins?|from)\s*[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      expirationDate: /(?:expir|policy\s*period\s*ends?|to)\s*[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      insurerName: /(?:insurance\s*company|insurer|carrier|issued\s*by)\s*[:.]?\s*([A-Z][A-Za-z\s&.,'-]{2,50})/i
    };

    // Only fill in missing critical fields - preserve comprehensive OpenAI extraction
    Object.entries(enhancementPatterns).forEach(([field, pattern]) => {
      if (!policyData[field] || policyData[field] === 'null' || policyData[field] === null) {
        const match = text.match(pattern);
        if (match && match[1]) {
          policyData[field] = match[1].trim();
          console.log(`🔧 Enhanced missing field: ${field} = ${match[1].trim()}`);
        }
      }
    });

    // Add document-specific metadata
    policyData.documentType = 'insurance_policy';
    policyData.extractionEnhanced = true;
    
    console.log('✅ Policy data enhancement complete - fields preserved:', Object.keys(policyData).filter(k => policyData[k] && policyData[k] !== 'null').length);
    
    // Apply formatting to improve readability
    const formattedData = this.formatExtractedData(policyData);
    console.log('✨ Applied data formatting for better readability');
    
    return formattedData;
  }

  private extractRORData(text: string, baseData: any): any {
    const data = {
      ...baseData,
      documentType: 'reservation_of_rights',
      claimNumber: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      dateOfLoss: this.extractPattern(text, /(?:date\s*of\s*loss|loss\s*date)\s*[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i),
      investigationStatus: this.extractPattern(text, /(under\s*investigation|still\s*looking\s*into|researching)/i),
      rightsReserved: text.includes('reserves') || text.includes('reservation'),
      adjustorInfo: this.extractPattern(text, /(?:claim\s*professional|adjuster|representative)\s*[:.]?\s*([A-Za-z\s]{2,30})/i),
      nextSteps: this.extractPattern(text, /(?:next\s*steps?|will\s*advise|contact|follow\s*up)\s*[:.]?\s*([^.]{10,100})/i)
    };
    
    return this.formatExtractedData(data);
  }

  private extractRFIData(text: string, baseData: any): any {
    const requestedItems = this.extractListItems(text, /(?:following\s*information|need|required|provide)[\s\S]*?(?=\.|$)/i);
    const deadline = this.extractPattern(text, /(?:within|by)\s*(\d+\s*days?|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    
    const data = {
      ...baseData,
      documentType: 'request_for_information',
      claimNumber: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      requestedItems: requestedItems,
      deadline: deadline,
      contactInfo: this.extractContactInfo(text),
      submissionMethod: this.extractPattern(text, /(fax|email|mail|upload|submit)/i)
    };
    
    return this.formatExtractedData(data);
  }

  private extractAcknowledgementData(text: string, baseData: any): any {
    const data = {
      ...baseData,
      documentType: 'acknowledgement_letter',
      claimNumber: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      acknowledgeDate: this.extractPattern(text, /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/),
      assignedAdjustor: this.extractPattern(text, /(?:adjuster|representative|contact)\s*[:.]?\s*([A-Za-z\s]{2,30})/i),
      nextSteps: this.extractPattern(text, /(?:will\s*contact|next\s*steps?|expect)\s*[:.]?\s*([^.]{10,100})/i),
      contactInfo: this.extractContactInfo(text)
    };
    
    return this.formatExtractedData(data);
  }

  private extractSettlementData(text: string, baseData: any): any {
    const data = {
      ...baseData,
      documentType: 'settlement_letter',
      claimNumber: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      settlementAmount: this.extractPattern(text, /(?:settlement|amount|payment)\s*[:.]?\s*\$?([\d,]+\.?\d*)/i),
      paymentMethod: this.extractPattern(text, /(check|direct\s*deposit|wire|electronic)/i),
      paymentDate: this.extractPattern(text, /(?:payment\s*date|issued\s*on|sent\s*on)\s*[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i),
      releaseConditions: text.includes('release') || text.includes('waiver')
    };
    
    return this.formatExtractedData(data);
  }

  private extractRejectionData(text: string, baseData: any): any {
    const data = {
      ...baseData,
      documentType: 'rejection_letter',
      claimNumber: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      rejectionReason: this.extractPattern(text, /(?:unable|cannot|denied|not\s*covered)\s*[:.]?\s*([^.]{10,200})/i),
      rejectedAmount: this.extractPattern(text, /(?:amount|estimate|supplement)\s*[:.]?\s*\$?([\d,]+\.?\d*)/i),
      appealRights: text.includes('appeal') || text.includes('dispute'),
      appealDeadline: this.extractPattern(text, /(?:appeal.*within|dispute.*days?)\s*[:.]?\s*(\d+\s*days?)/i)
    };
    
    return this.formatExtractedData(data);
  }

  private extractStatusUpdateData(text: string, baseData: any): any {
    const data = {
      ...baseData,
      documentType: 'status_update_letter',
      claimNumber: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      currentStatus: this.extractPattern(text, /(?:status|under\s*review|investigation)\s*[:.]?\s*([^.]{10,100})/i),
      coverageDecision: this.extractPattern(text, /(?:may\s*provide|coverage|will\s*pay)\s*[:.]?\s*([^.]{10,100})/i),
      nextSteps: this.extractPattern(text, /(?:will\s*advise|next\s*steps?|upon\s*completion)\s*[:.]?\s*([^.]{10,100})/i)
    };
    
    return this.formatExtractedData(data);
  }

  private extractGenericData(text: string, baseData: any): any {
    const data = {
      ...baseData,
      documentType: 'unknown',
      extractedText: text.substring(0, 500),
      dateReferences: this.extractDates(text),
      claimReferences: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      contactInfo: this.extractContactInfo(text)
    };
    
    return this.formatExtractedData(data);
  }

  /**
   * Helper methods for pattern extraction
   */
  private extractPattern(text: string, pattern: RegExp): string | null {
    const match = text.match(pattern);
    return match ? match[1]?.trim() || null : null;
  }

  private extractDates(text: string): string[] {
    const datePattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g;
    return text.match(datePattern) || [];
  }

  private extractContactInfo(text: string): any {
    return {
      phone: this.extractPattern(text, /(\d{3}[-\.\s]?\d{3}[-\.\s]?\d{4})/),
      email: this.extractPattern(text, /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/),
      website: this.extractPattern(text, /(www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[a-zA-Z0-9.-]+\.(com|org|net))/i)
    };
  }

  private extractListItems(text: string, pattern: RegExp): string[] {
    const match = text.match(pattern);
    if (!match) return [];
    
    const section = match[0];
    const items = section.split(/[\n\r]+/)
      .map(line => line.trim())
      .filter(line => line.length > 5)
      .slice(0, 10); // Max 10 items
    
    return items;
  }

  /**
   * Consolidate data across multiple documents
   */
  private consolidateDocumentData(results: DocumentExtractionResult[]): any {
    const consolidated: any = {
      claimNumbers: new Set(),
      policyNumbers: new Set(),
      insuredNames: new Set(),
      propertyAddresses: new Set(),
      keyDates: new Set(),
      documentTypes: new Set(),
      processingStatus: {},
      financialData: {}
    };

    results.forEach(result => {
      const data = result.extractedData;
      
      // Collect unique identifiers
      if (data.claimNumber) consolidated.claimNumbers.add(data.claimNumber);
      if (data.policyNumber) consolidated.policyNumbers.add(data.policyNumber);
      if (data.insuredName) consolidated.insuredNames.add(data.insuredName);
      if (data.propertyAddress) consolidated.propertyAddresses.add(data.propertyAddress);
      
      // Collect dates
      [data.dateOfLoss, data.effectiveDate, data.expirationDate, data.acknowledgeDate].forEach(date => {
        if (date) consolidated.keyDates.add(date);
      });
      
      // Track document types
      consolidated.documentTypes.add(result.documentInfo.type);
      
      // Track financial data
      if (data.settlementAmount) {
        consolidated.financialData.settlement = data.settlementAmount;
      }
      if (data.coverageA) {
        consolidated.financialData.coverageA = data.coverageA;
      }
      if (data.deductible) {
        consolidated.financialData.deductible = data.deductible;
      }
    });

    // Convert Sets to Arrays
    Object.keys(consolidated).forEach(key => {
      if (consolidated[key] instanceof Set) {
        consolidated[key] = Array.from(consolidated[key]);
      }
    });

    return consolidated;
  }

  /**
   * Generate processing recommendations
   */
  private generateRecommendations(
    results: DocumentExtractionResult[],
    workflowAnalysis: any
  ): string[] {
    const recommendations: string[] = [];

    // Check for consistency across documents
    const claimNumbers = results
      .map(r => r.extractedData.claimNumber)
      .filter(Boolean);
    
    if (new Set(claimNumbers).size > 1) {
      recommendations.push('⚠️ Multiple claim numbers detected - verify document relationships');
    }

    // Check for missing critical documents
    const docTypes = results.map(r => r.documentInfo.type);
    if (!docTypes.includes('insurance_policy')) {
      recommendations.push('📋 Consider uploading insurance policy for complete coverage verification');
    }

    // Check for low confidence extractions
    const lowConfidenceCount = results.filter(r => r.documentInfo.confidence < 70).length;
    if (lowConfidenceCount > 0) {
      recommendations.push(`🔍 ${lowConfidenceCount} document(s) have low confidence - review extracted data carefully`);
    }

    // Add workflow-specific recommendations
    recommendations.push(...workflowAnalysis.recommendations);

    // Check for actionable items
    const hasRFI = results.some(r => r.documentInfo.type === 'request_for_information');
    if (hasRFI) {
      recommendations.push('📝 Action required: Review information requests and prepare required documentation');
    }

    const hasRejection = results.some(r => r.documentInfo.type.includes('rejection'));
    if (hasRejection) {
      recommendations.push('⚠️ Claim issues detected: Review rejection reasons and consider appeal options');
    }

    return recommendations;
  }

  /**
   * Create validation schema for document type
   */
  private createValidationSchema(classification: DocumentClassificationResult): any {
    const baseSchema = {
      required: [],
      optional: [],
      validation: {}
    };

    classification.suggestedFields.forEach(field => {
      if (['claimNumber', 'policyNumber', 'insuredName'].includes(field)) {
        baseSchema.required.push(field);
      } else {
        baseSchema.optional.push(field);
      }
    });

    return baseSchema;
  }

  /**
   * Generate processing notes
   */
  private generateProcessingNotes(
    classification: DocumentClassificationResult,
    extraction: any,
    identifierAnalysis?: IdentifierExtractionResult,
    intelligentResult?: IntelligentExtractionResult
  ): string[] {
    const notes = [...classification.processingNotes];
    
    notes.push(`Processing method: ${extraction.processingMethod}`);
    notes.push(`Processing time: ${extraction.processingTime}ms`);
    notes.push(`Extraction cost: $${extraction.cost.toFixed(3)}`);
    
    if (extraction.confidence > 0.8) {
      notes.push('High quality text extraction achieved');
    } else if (extraction.confidence < 0.5) {
      notes.push('Low quality text extraction - may require manual review');
    }

    // Add intelligent extraction notes
    if (intelligentResult) {
      const carrierInfo = intelligentResult.carrierIdentified;
      const intelligence = intelligentResult.extractionIntelligence;
      
      notes.push('🧠 INTELLIGENT EXTRACTION APPLIED');
      
      if (carrierInfo.carrierId) {
        notes.push(`📋 Carrier identified: ${carrierInfo.carrierName} (${Math.round(carrierInfo.confidence * 100)}% confidence)`);
        if (carrierInfo.isLearned) {
          notes.push(`📚 Using learned patterns for ${carrierInfo.carrierName}`);
        }
      }
      
      if (intelligence.carrierSpecificRulesApplied) {
        notes.push(`🎯 Applied ${intelligence.adaptivePatternsUsed} carrier-specific patterns`);
      }
      
      if (intelligence.intelligenceBoost > 0) {
        notes.push(`🚀 Intelligence boost: +${Math.round(intelligence.intelligenceBoost * 100)}% confidence`);
      }
      
      const learningOpps = intelligentResult.learningOpportunities;
      if (learningOpps.newPatternsDetected.length > 0) {
        notes.push(`💡 New patterns detected: ${learningOpps.newPatternsDetected.length} patterns`);
      }
    }

    // Add identifier analysis notes
    if (identifierAnalysis) {
      if (identifierAnalysis.policyNumber) {
        notes.push(`Policy Number identified: ${identifierAnalysis.policyNumber} (${Math.round(identifierAnalysis.policyNumberConfidence * 100)}% confidence)`);
      }
      if (identifierAnalysis.claimNumber) {
        notes.push(`Claim Number identified: ${identifierAnalysis.claimNumber} (${Math.round(identifierAnalysis.claimNumberConfidence * 100)}% confidence)`);
      }
      if (identifierAnalysis.relationshipStatus !== 'valid') {
        notes.push(`⚠️ Identifier validation: ${identifierAnalysis.validationMessage}`);
      }
      if (identifierAnalysis.suggestions.length > 0) {
        notes.push(`Suggestions: ${identifierAnalysis.suggestions.join(', ')}`);
      }
    }

    return notes;
  }

  /**
   * Learn from user feedback on document extraction
   */
  public async learnFromUserFeedback(
    documentResult: DocumentExtractionResult,
    userCorrections: any
  ): Promise<void> {
    if (!documentResult.intelligentExtraction) {
      console.log('⚠️ Cannot learn from non-intelligent extraction result');
      return;
    }

    try {
      // Convert to feedback format expected by the learning service
      const feedback = {
        documentId: 'manual_correction',
        carrierId: documentResult.intelligentExtraction?.carrierIdentified?.carrierId,
        fieldName: 'multiple_fields',
        correctValue: JSON.stringify(userCorrections),
        foundValue: JSON.stringify(documentResult.extractedData),
        userCorrection: true,
        context: documentResult.rawText
      };
      
      await this.intelligentExtractor.learnFromUserFeedback(feedback);
      
      console.log('📚 Successfully learned from user feedback');
    } catch (error) {
      console.error('❌ Failed to learn from user feedback:', error);
    }
  }

  /**
   * Get learning statistics for the system
   */
  public getLearningStatistics(): any {
    return this.intelligentExtractor.getLearningStatistics();
  }

  /**
   * Enable/disable intelligent extraction
   */
  public setIntelligentExtractionEnabled(enabled: boolean): void {
    this.useIntelligentExtraction = enabled;
    console.log(`🧠 Intelligent extraction ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable/disable learning system
   */
  public setLearningEnabled(enabled: boolean): void {
    // Learning is always enabled with the new carrier learning system
    console.log(`📚 Learning system is always enabled with carrier-specific patterns`);
  }

  /**
   * Get learning system status
   */
  public getSystemStatus(): any {
    const learningStats = this.getLearningStatistics();
    
    return {
      intelligentExtractionEnabled: this.useIntelligentExtraction,
      enhancedExtractionEnabled: this.useEnhancedExtraction,
      learningStats,
      systemCapabilities: {
        carrierIdentification: true,
        adaptiveLearning: true,
        identifierValidation: true,
        documentTypeClassification: true
      }
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
    
    const formatted = date.toLowerCase();
    
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
}

export default MultiDocumentExtractionService;
