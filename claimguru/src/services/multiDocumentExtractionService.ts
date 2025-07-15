/**
 * Multi-Document Extraction Service
 * Handles various insurance document types with specialized extraction logic
 */

import { HybridPDFExtractionService } from './hybridPdfExtractionService';
import { EnhancedHybridPdfExtractionService } from './enhancedHybridPdfExtractionService';
import DocumentClassificationService, { DocumentClassificationResult } from './documentClassificationService';
import { IdentifierExtractionService, IdentifierExtractionResult } from './identifierExtractionService';

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
  identifierAnalysis: IdentifierExtractionResult; // NEW: Comprehensive identifier analysis
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
  private identifierExtractor: IdentifierExtractionService; // NEW: Identifier extraction service
  private useEnhancedExtraction: boolean = true; // Feature flag

  constructor() {
    this.hybridExtractor = new HybridPDFExtractionService();
    this.enhancedExtractor = new EnhancedHybridPdfExtractionService();
    this.classifier = new DocumentClassificationService();
    this.identifierExtractor = new IdentifierExtractionService(); // NEW: Initialize identifier extractor
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
            category: 'unknown',
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

    // Step 1: Use enhanced extraction if enabled, otherwise fallback to basic
    let basicExtraction: any;
    if (this.useEnhancedExtraction) {
      console.log('🚀 Using Enhanced Hybrid Extraction with Confidence Building');
      try {
        basicExtraction = await this.enhancedExtractor.extractWithConfidenceBuilding(file);
      } catch (error) {
        console.warn('⚠️ Enhanced extraction failed, falling back to basic:', error.message);
        basicExtraction = await this.hybridExtractor.extractFromPDF(file);
      }
    } else {
      basicExtraction = await this.hybridExtractor.extractFromPDF(file);
    }

    // Step 2: Classify document type
    const classification = this.classifier.classifyDocument(basicExtraction.extractedText);

    console.log(`📋 Document classified as: ${classification.documentType} (${classification.confidence.toFixed(1)}% confidence)`);

    // Step 3: NEW - Comprehensive identifier extraction and validation
    const identifierAnalysis = await this.identifierExtractor.extractIdentifiers(
      basicExtraction.extractedText,
      file.name
    );

    console.log(`🔍 Identifier analysis complete:`, {
      policy: identifierAnalysis.policyNumber || 'None',
      claim: identifierAnalysis.claimNumber || 'None',
      relationship: identifierAnalysis.relationshipStatus,
      docType: identifierAnalysis.documentType
    });

    // Step 4: Apply specialized extraction based on document type
    const specializedData = await this.applySpecializedExtraction(
      basicExtraction.extractedText,
      classification,
      basicExtraction.policyData,
      identifierAnalysis // Pass identifier analysis
    );

    // Step 5: Create validation schema
    const validationSchema = this.createValidationSchema(classification);

    // Step 6: Generate processing notes
    const processingNotes = this.generateProcessingNotes(classification, basicExtraction, identifierAnalysis);

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
      identifierAnalysis, // NEW: Include comprehensive identifier analysis
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
    return policyData;
  }

  private extractRORData(text: string, baseData: any): any {
    return {
      ...baseData,
      documentType: 'reservation_of_rights',
      claimNumber: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      dateOfLoss: this.extractPattern(text, /(?:date\s*of\s*loss|loss\s*date)\s*[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i),
      investigationStatus: this.extractPattern(text, /(under\s*investigation|still\s*looking\s*into|researching)/i),
      rightsReserved: text.includes('reserves') || text.includes('reservation'),
      adjustorInfo: this.extractPattern(text, /(?:claim\s*professional|adjuster|representative)\s*[:.]?\s*([A-Za-z\s]{2,30})/i),
      nextSteps: this.extractPattern(text, /(?:next\s*steps?|will\s*advise|contact|follow\s*up)\s*[:.]?\s*([^.]{10,100})/i)
    };
  }

  private extractRFIData(text: string, baseData: any): any {
    const requestedItems = this.extractListItems(text, /(?:following\s*information|need|required|provide)[\s\S]*?(?=\.|$)/i);
    const deadline = this.extractPattern(text, /(?:within|by)\s*(\d+\s*days?|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    
    return {
      ...baseData,
      documentType: 'request_for_information',
      claimNumber: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      requestedItems: requestedItems,
      deadline: deadline,
      contactInfo: this.extractContactInfo(text),
      submissionMethod: this.extractPattern(text, /(fax|email|mail|upload|submit)/i)
    };
  }

  private extractAcknowledgementData(text: string, baseData: any): any {
    return {
      ...baseData,
      documentType: 'acknowledgement_letter',
      claimNumber: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      acknowledgeDate: this.extractPattern(text, /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/),
      assignedAdjustor: this.extractPattern(text, /(?:adjuster|representative|contact)\s*[:.]?\s*([A-Za-z\s]{2,30})/i),
      nextSteps: this.extractPattern(text, /(?:will\s*contact|next\s*steps?|expect)\s*[:.]?\s*([^.]{10,100})/i),
      contactInfo: this.extractContactInfo(text)
    };
  }

  private extractSettlementData(text: string, baseData: any): any {
    return {
      ...baseData,
      documentType: 'settlement_letter',
      claimNumber: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      settlementAmount: this.extractPattern(text, /(?:settlement|amount|payment)\s*[:.]?\s*\$?([\d,]+\.?\d*)/i),
      paymentMethod: this.extractPattern(text, /(check|direct\s*deposit|wire|electronic)/i),
      paymentDate: this.extractPattern(text, /(?:payment\s*date|issued\s*on|sent\s*on)\s*[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i),
      releaseConditions: text.includes('release') || text.includes('waiver')
    };
  }

  private extractRejectionData(text: string, baseData: any): any {
    return {
      ...baseData,
      documentType: 'rejection_letter',
      claimNumber: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      rejectionReason: this.extractPattern(text, /(?:unable|cannot|denied|not\s*covered)\s*[:.]?\s*([^.]{10,200})/i),
      rejectedAmount: this.extractPattern(text, /(?:amount|estimate|supplement)\s*[:.]?\s*\$?([\d,]+\.?\d*)/i),
      appealRights: text.includes('appeal') || text.includes('dispute'),
      appealDeadline: this.extractPattern(text, /(?:appeal.*within|dispute.*days?)\s*[:.]?\s*(\d+\s*days?)/i)
    };
  }

  private extractStatusUpdateData(text: string, baseData: any): any {
    return {
      ...baseData,
      documentType: 'status_update_letter',
      claimNumber: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      currentStatus: this.extractPattern(text, /(?:status|under\s*review|investigation)\s*[:.]?\s*([^.]{10,100})/i),
      coverageDecision: this.extractPattern(text, /(?:may\s*provide|coverage|will\s*pay)\s*[:.]?\s*([^.]{10,100})/i),
      nextSteps: this.extractPattern(text, /(?:will\s*advise|next\s*steps?|upon\s*completion)\s*[:.]?\s*([^.]{10,100})/i)
    };
  }

  private extractGenericData(text: string, baseData: any): any {
    return {
      ...baseData,
      documentType: 'unknown',
      extractedText: text.substring(0, 500),
      dateReferences: this.extractDates(text),
      claimReferences: this.extractPattern(text, /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9]{5,20})/i),
      contactInfo: this.extractContactInfo(text)
    };
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
    identifierAnalysis?: IdentifierExtractionResult
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
}

export default MultiDocumentExtractionService;
