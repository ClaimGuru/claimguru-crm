/**
 * INTELLIGENT EXTRACTION SERVICE
 * 
 * Combines multiple extraction methods with adaptive learning:
 * - Uses carrier-specific templates learned from historical data
 * - Applies document-type-specific extraction rules
 * - Learns from successful extractions and user corrections
 * - Provides confidence scoring based on learned patterns
 */

import { HybridPDFExtractionService } from './hybridPdfExtractionService';
import { EnhancedHybridPdfExtractionService } from './enhancedHybridPdfExtractionService';
import AdaptiveLearningService from './adaptiveLearningService';
import { IdentifierExtractionService, IdentifierExtractionResult } from './identifierExtractionService';
import { CarrierLearningService } from './carrierLearningService';

export interface IntelligentExtractionResult {
  // Extracted data
  extractedData: any;
  rawText: string;
  
  // Intelligence metadata
  carrierIdentified: {
    carrierId: string | null;
    carrierName: string | null;
    confidence: number;
    isLearned: boolean; // Whether we have learned patterns for this carrier
  };
  
  documentAnalysis: {
    documentType: string;
    confidence: number;
    expectedFields: string[];
    prohibitedFields: string[];
    missingCriticalFields: string[];
  };
  
  extractionIntelligence: {
    method: string;
    carrierSpecificRulesApplied: boolean;
    adaptivePatternsUsed: number;
    baseConfidence: number;
    intelligenceBoost: number; // Confidence boost from learned patterns
    finalConfidence: number;
  };
  
  learningOpportunities: {
    canLearnFromThis: boolean;
    newPatternsDetected: string[];
    improvementAreas: string[];
  };
  
  // Processing metadata
  processingTime: number;
  cost: number;
  processingMethod: string;
}

export class IntelligentExtractionService {
  private hybridExtractor: HybridPDFExtractionService;
  private enhancedExtractor: EnhancedHybridPdfExtractionService;
  private adaptiveLearning: AdaptiveLearningService;
  private identifierExtractor: IdentifierExtractionService;
  private carrierLearning: CarrierLearningService;

  constructor() {
    this.hybridExtractor = new HybridPDFExtractionService();
    this.enhancedExtractor = new EnhancedHybridPdfExtractionService();
    this.adaptiveLearning = new AdaptiveLearningService();
    this.identifierExtractor = new IdentifierExtractionService();
    this.carrierLearning = new CarrierLearningService();
  }

  /**
   * Main intelligent extraction method
   */
  async extractWithIntelligence(file: File): Promise<IntelligentExtractionResult> {
    const startTime = Date.now();
    console.log(`🧠 Starting intelligent extraction for: ${file.name}`);

    try {
      // Step 1: Get basic text extraction
      const basicExtraction = await this.enhancedExtractor.extractWithConfidenceBuilding(file);
      const text = basicExtraction.extractedText;

      // Step 2: Identify carrier using learned patterns
      const carrierId = await this.carrierLearning.identifyCarrier(text);
      const carrierIdentification = {
        carrierId,
        carrierName: carrierId ? this.getCarrierDisplayName(carrierId) : null,
        confidence: carrierId ? 0.9 : 0,
        isLearned: carrierId ? true : false
      };
      
      // Step 3: Analyze document type and extract identifiers
      const identifierAnalysis = await this.identifierExtractor.extractIdentifiers(text, file.name);
      const documentType = this.determineDocumentType(identifierAnalysis, text);

      // Step 4: Get carrier-specific extraction rules
      const carrierRules = carrierIdentification 
        ? this.adaptiveLearning.getCarrierSpecificExtractionRules(
            carrierIdentification.carrierId, 
            documentType, 
            text
          )
        : null;

      // Step 5: Apply intelligent extraction
      const intelligentData = await this.applyIntelligentExtraction(
        text,
        basicExtraction.policyData,
        carrierRules,
        documentType,
        identifierAnalysis
      );

      // Step 6: Validate against document type expectations
      const validation = this.validateExtractionAgainstExpectations(
        intelligentData,
        documentType,
        carrierRules
      );

      // Step 7: Calculate confidence with intelligence boost
      const confidenceAnalysis = this.calculateIntelligentConfidence(
        basicExtraction.confidence,
        carrierIdentification,
        validation,
        carrierRules
      );

      // Step 8: Identify learning opportunities
      const learningOpportunities = this.identifyLearningOpportunities(
        text,
        intelligentData,
        carrierIdentification,
        documentType
      );

      const processingTime = Date.now() - startTime;

      const result: IntelligentExtractionResult = {
        extractedData: intelligentData,
        rawText: text,
        
        carrierIdentified: {
          carrierId: carrierIdentification?.carrierId || null,
          carrierName: carrierRules?.carrierSpecific?.carrierName || null,
          confidence: carrierIdentification?.confidence || 0,
          isLearned: !!carrierRules?.carrierSpecific
        },
        
        documentAnalysis: {
          documentType,
          confidence: identifierAnalysis.relationshipStatus === 'valid' ? 0.9 : 0.6,
          expectedFields: carrierRules?.documentExpectations?.expectedFields 
            ? Object.keys(carrierRules.documentExpectations.expectedFields) 
            : [],
          prohibitedFields: carrierRules?.documentExpectations?.prohibitedFields || [],
          missingCriticalFields: validation.missingCriticalFields
        },
        
        extractionIntelligence: {
          method: carrierRules ? 'intelligent_carrier_specific' : 'intelligent_generic',
          carrierSpecificRulesApplied: !!carrierRules?.carrierSpecific,
          adaptivePatternsUsed: carrierRules?.carrierSpecific?.fieldPatterns 
            ? Object.keys(carrierRules.carrierSpecific.fieldPatterns).length 
            : 0,
          baseConfidence: basicExtraction.confidence,
          intelligenceBoost: confidenceAnalysis.intelligenceBoost,
          finalConfidence: confidenceAnalysis.finalConfidence
        },
        
        learningOpportunities,
        
        processingTime,
        cost: basicExtraction.cost,
        processingMethod: 'intelligent_adaptive_extraction'
      };

      console.log(`🎯 Intelligent extraction completed:`, {
        carrier: result.carrierIdentified.carrierId || 'unknown',
        docType: result.documentAnalysis.documentType,
        confidence: Math.round(result.extractionIntelligence.finalConfidence * 100) + '%',
        intelligenceBoost: Math.round(result.extractionIntelligence.intelligenceBoost * 100) + '%'
      });

      // Step 9: Learn from this extraction if it's successful
      if (result.extractionIntelligence.finalConfidence > 0.7 && carrierIdentification) {
        await this.adaptiveLearning.learnFromSuccessfulExtraction(
          carrierIdentification.carrierId,
          documentType,
          text,
          intelligentData,
          'intelligent_extraction',
          result.extractionIntelligence.finalConfidence
        );
      }

      return result;

    } catch (error) {
      console.error('❌ Intelligent extraction failed:', error);
      throw error;
    }
  }

  /**
   * Apply intelligent extraction using learned patterns and document expectations
   */
  private async applyIntelligentExtraction(
    text: string,
    baseData: any,
    carrierRules: any,
    documentType: string,
    identifierAnalysis: IdentifierExtractionResult
  ): Promise<any> {
    let intelligentData = { ...baseData };

    // Apply identifier analysis results
    intelligentData.policyNumber = identifierAnalysis.policyNumber || intelligentData.policyNumber;
    intelligentData.claimNumber = identifierAnalysis.claimNumber || intelligentData.claimNumber;
    intelligentData.fileNumber = identifierAnalysis.fileNumber || intelligentData.fileNumber;
    intelligentData.carrierClaimNumber = identifierAnalysis.carrierClaimNumber || intelligentData.carrierClaimNumber;

    // Apply carrier-specific patterns if available
    if (carrierRules?.carrierSpecific?.fieldPatterns) {
      intelligentData = this.applyCarrierSpecificPatterns(
        text,
        intelligentData,
        carrierRules.carrierSpecific.fieldPatterns
      );
    }

    // Apply document type expectations
    if (carrierRules?.documentExpectations) {
      intelligentData = this.applyDocumentTypeExpectations(
        text,
        intelligentData,
        carrierRules.documentExpectations,
        documentType
      );
    }

    // Add intelligence metadata
    intelligentData.intelligenceMetadata = {
      documentType,
      carrierIdentified: carrierRules?.carrierSpecific?.carrierId || null,
      extractionMethod: 'intelligent_adaptive',
      rulesApplied: {
        carrierSpecific: !!carrierRules?.carrierSpecific,
        documentTypeExpectations: !!carrierRules?.documentExpectations,
        identifierAnalysis: true
      },
      extractionTimestamp: new Date().toISOString()
    };

    return intelligentData;
  }

  /**
   * Apply carrier-specific learned patterns
   */
  private applyCarrierSpecificPatterns(
    text: string,
    data: any,
    fieldPatterns: any
  ): any {
    const enhancedData = { ...data };

    Object.entries(fieldPatterns).forEach(([fieldName, pattern]: [string, any]) => {
      // Skip if we already have a good value for this field
      if (enhancedData[fieldName] && enhancedData[fieldName] !== 'null') {
        return;
      }

      // Try learned patterns
      for (const regex of pattern.patterns) {
        try {
          const match = text.match(new RegExp(regex, 'i'));
          if (match && match[1]) {
            enhancedData[fieldName] = match[1].trim();
            console.log(`🎯 Applied learned pattern for ${fieldName}: ${match[1].trim()}`);
            break;
          }
        } catch (error) {
          console.warn(`Invalid regex pattern for ${fieldName}:`, regex);
        }
      }

      // Try context-based extraction if patterns didn't work
      if (!enhancedData[fieldName] && pattern.contexts.length > 0) {
        for (const context of pattern.contexts) {
          const contextRegex = new RegExp(`${context}\\s*[:.]?\\s*([A-Za-z0-9\\s\\-$,.%]+)`, 'i');
          const match = text.match(contextRegex);
          if (match && match[1]) {
            enhancedData[fieldName] = match[1].trim();
            console.log(`🔍 Applied context extraction for ${fieldName}: ${match[1].trim()}`);
            break;
          }
        }
      }
    });

    return enhancedData;
  }

  /**
   * Apply document type expectations
   */
  private applyDocumentTypeExpectations(
    text: string,
    data: any,
    expectations: any,
    documentType: string
  ): any {
    const enhancedData = { ...data };

    // Remove prohibited fields for this document type
    expectations.prohibitedFields?.forEach((field: string) => {
      if (enhancedData[field]) {
        console.log(`🚫 Removing prohibited field for ${documentType}: ${field}`);
        delete enhancedData[field];
      }
    });

    // Ensure required fields are present or attempted
    Object.entries(expectations.expectedFields || {}).forEach(([fieldName, fieldExpectation]: [string, any]) => {
      if (fieldExpectation.isRequired && !enhancedData[fieldName]) {
        // Try generic patterns for required fields
        const value = this.tryGenericExtraction(text, fieldName, fieldExpectation.typicalValues);
        if (value) {
          enhancedData[fieldName] = value;
          console.log(`📋 Found required field via generic extraction: ${fieldName} = ${value}`);
        }
      }
    });

    return enhancedData;
  }

  /**
   * Try generic extraction for required fields
   */
  private tryGenericExtraction(text: string, fieldName: string, typicalValues: string[]): string | null {
    const patterns: { [key: string]: RegExp[] } = {
      claimNumber: [
        /(?:claim\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9\-]{5,25})/i,
        /(?:file\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9\-]{5,25})/i,
        /\b(CLM\d{6,15})\b/i
      ],
      policyNumber: [
        /(?:policy\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9\-]{5,25})/i,
        /(?:pol\s*(?:number|#|no)\s*[:.]?\s*)([A-Z0-9\-]{5,25})/i
      ],
      dateOfLoss: [
        /(?:date\s*of\s*loss|loss\s*date)\s*[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        /(?:occurred\s*on|incident\s*date)\s*[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
      ],
      causeOfLoss: [
        /(?:cause\s*of\s*loss|peril|covered\s*cause)\s*[:.]?\s*([A-Za-z\s]{3,30})/i,
        /(?:loss\s*type|damage\s*type)\s*[:.]?\s*([A-Za-z\s]{3,30})/i
      ],
      adjustorName: [
        /(?:adjuster|claim\s*professional|representative)\s*[:.]?\s*([A-Za-z\s]{2,50})/i,
        /(?:assigned\s*to|contact)\s*[:.]?\s*([A-Za-z\s]{2,50})/i
      ]
    };

    const fieldPatterns = patterns[fieldName];
    if (!fieldPatterns) return null;

    for (const pattern of fieldPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Determine document type from identifier analysis and text content
   */
  private determineDocumentType(identifierAnalysis: IdentifierExtractionResult, text: string): string {
    // Use identifier analysis first
    if (identifierAnalysis.documentType !== 'unknown') {
      return identifierAnalysis.documentType;
    }

    // Fall back to content analysis
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('policy number') && lowerText.includes('effective date')) {
      return 'policy';
    } else if (lowerText.includes('claim number') || lowerText.includes('file number')) {
      return 'claim_letter';
    }

    return 'unknown';
  }

  /**
   * Validate extraction against document type expectations
   */
  private validateExtractionAgainstExpectations(
    data: any,
    documentType: string,
    carrierRules: any
  ): any {
    const validation = {
      isValid: true,
      missingCriticalFields: [] as string[],
      unexpectedFields: [] as string[],
      validationMessages: [] as string[]
    };

    const expectations = carrierRules?.documentExpectations;
    if (!expectations) return validation;

    // Check for missing required fields
    Object.entries(expectations.expectedFields || {}).forEach(([fieldName, fieldExpectation]: [string, any]) => {
      if (fieldExpectation.isRequired && (!data[fieldName] || data[fieldName] === 'null')) {
        validation.missingCriticalFields.push(fieldName);
        validation.isValid = false;
      }
    });

    // Check for prohibited fields
    expectations.prohibitedFields?.forEach((fieldName: string) => {
      if (data[fieldName]) {
        validation.unexpectedFields.push(fieldName);
        validation.validationMessages.push(`Field '${fieldName}' should not appear in ${documentType} documents`);
      }
    });

    return validation;
  }

  /**
   * Calculate confidence with intelligence boost
   */
  private calculateIntelligentConfidence(
    baseConfidence: number,
    carrierIdentification: any,
    validation: any,
    carrierRules: any
  ): { intelligenceBoost: number; finalConfidence: number } {
    let intelligenceBoost = 0;

    // Boost for carrier identification
    if (carrierIdentification && carrierIdentification.confidence > 0.8) {
      intelligenceBoost += 0.1;
    }

    // Boost for using learned patterns
    if (carrierRules?.carrierSpecific?.fieldPatterns) {
      const patternCount = Object.keys(carrierRules.carrierSpecific.fieldPatterns).length;
      intelligenceBoost += Math.min(0.2, patternCount * 0.05);
    }

    // Boost for meeting document expectations
    if (validation.isValid) {
      intelligenceBoost += 0.1;
    } else {
      // Penalty for missing critical fields
      const penalty = validation.missingCriticalFields.length * 0.05;
      intelligenceBoost -= penalty;
    }

    const finalConfidence = Math.min(1.0, Math.max(0.0, baseConfidence + intelligenceBoost));

    return { intelligenceBoost, finalConfidence };
  }

  /**
   * Identify learning opportunities
   */
  private identifyLearningOpportunities(
    text: string,
    data: any,
    carrierIdentification: any,
    documentType: string
  ): any {
    const opportunities = {
      canLearnFromThis: true,
      newPatternsDetected: [] as string[],
      improvementAreas: [] as string[]
    };

    // Can't learn without carrier identification
    if (!carrierIdentification) {
      opportunities.canLearnFromThis = false;
      opportunities.improvementAreas.push('Carrier identification needed for learning');
      return opportunities;
    }

    // Detect new patterns in extracted data
    Object.entries(data).forEach(([fieldName, value]) => {
      if (value && typeof value === 'string' && value !== 'null') {
        // Check if this is a new pattern we could learn from
        if (this.isNovelPattern(value, fieldName)) {
          opportunities.newPatternsDetected.push(`${fieldName}: ${value}`);
        }
      }
    });

    // Identify improvement areas
    if (opportunities.newPatternsDetected.length === 0) {
      opportunities.improvementAreas.push('No new patterns detected - may need enhanced pattern recognition');
    }

    return opportunities;
  }

  /**
   * Check if a pattern is novel (simplified check)
   */
  private isNovelPattern(value: string, fieldName: string): boolean {
    // Simple heuristic: if the pattern is complex enough, it might be worth learning
    if (fieldName.includes('Number') || fieldName.includes('Id')) {
      return value.length >= 5 && /[A-Za-z]/.test(value) && /\d/.test(value);
    }
    return value.length >= 3;
  }

  /**
   * Learn from user corrections (called when user validates/corrects extraction)
   */
  async learnFromUserFeedback(
    intelligentResult: IntelligentExtractionResult,
    userCorrections: any
  ): Promise<void> {
    const carrierInfo = intelligentResult.carrierIdentified;
    
    if (!carrierInfo.carrierId) {
      console.log('⚠️ Cannot learn without carrier identification');
      return;
    }

    await this.adaptiveLearning.learnFromUserCorrections(
      carrierInfo.carrierId,
      intelligentResult.documentAnalysis.documentType,
      intelligentResult.rawText,
      intelligentResult.extractedData,
      userCorrections,
      'intelligent_extraction'
    );

    console.log(`📚 Learned from user corrections for ${carrierInfo.carrierId}`);
  }

  /**
   * Get learning statistics
   */
  getLearningStatistics(): any {
    return this.adaptiveLearning.getLearningStatistics();
  }

  /**
   * Enable/disable learning
   */
  setLearningEnabled(enabled: boolean): void {
    this.adaptiveLearning.setLearningEnabled(enabled);
  }
}

export default IntelligentExtractionService;