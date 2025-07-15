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

      // Step 4: Get carrier-specific extraction hints from learned patterns
      const carrierHints = carrierId 
        ? await this.carrierLearning.getExtractionHints(carrierId, documentType)
        : null;

      // Step 5: Apply carrier-specific enhancement if available
      const intelligentData = carrierId && carrierHints
        ? await this.carrierLearning.enhanceExtraction(
            carrierId,
            documentType,
            text,
            basicExtraction.policyData
          )
        : basicExtraction.policyData;

      // Step 6: Calculate confidence with carrier learning boost
      const baseConfidence = basicExtraction.confidence || 0.5;
      const carrierBoost = carrierHints ? 0.2 : 0;
      const finalConfidence = Math.min(baseConfidence + carrierBoost, 1.0);

      // Step 7: Learn from this extraction if we have a carrier
      if (carrierId && intelligentData) {
        await this.carrierLearning.learnFromExtraction(
          carrierId,
          documentType as 'policy' | 'letter' | 'claim_form',
          intelligentData,
          text
        );
      }

      const processingTime = Date.now() - startTime;

      const result: IntelligentExtractionResult = {
        extractedData: intelligentData,
        rawText: text,
        
        carrierIdentified: carrierIdentification,
        
        documentAnalysis: {
          documentType,
          confidence: identifierAnalysis.relationshipStatus === 'valid' ? 0.9 : 0.6,
          expectedFields: carrierHints?.priorityFields || [],
          prohibitedFields: [],
          missingCriticalFields: []
        },
        
        extractionIntelligence: {
          method: carrierHints ? 'intelligent_carrier_specific' : 'intelligent_generic',
          carrierSpecificRulesApplied: !!carrierHints,
          adaptivePatternsUsed: carrierHints ? Object.keys(carrierHints.fieldHints).length : 0,
          baseConfidence,
          intelligenceBoost: carrierBoost,
          finalConfidence
        },
        
        learningOpportunities: {
          canLearnFromThis: !!carrierId,
          newPatternsDetected: [],
          improvementAreas: []
        },
        
        processingTime,
        cost: basicExtraction.cost,
        processingMethod: 'intelligent_carrier_learning'
      };

      console.log(`🎯 Intelligent extraction completed:`, {
        carrier: result.carrierIdentified.carrierId || 'unknown',
        docType: result.documentAnalysis.documentType,
        confidence: Math.round(result.extractionIntelligence.finalConfidence * 100) + '%',
        intelligenceBoost: Math.round(result.extractionIntelligence.intelligenceBoost * 100) + '%'
      });

      return result;

    } catch (error) {
      console.error('❌ Intelligent extraction failed:', error);
      throw error;
    }
  }

  /**
   * Determine document type from identifier analysis
   */
  private determineDocumentType(identifierAnalysis: IdentifierExtractionResult, text: string): string {
    if (identifierAnalysis.documentType !== 'unknown') {
      return identifierAnalysis.documentType;
    }
    
    // Fallback analysis
    const lowerText = text.toLowerCase();
    if (lowerText.includes('policy') && lowerText.includes('coverage')) {
      return 'policy';
    }
    if (lowerText.includes('claim') && lowerText.includes('number')) {
      return 'letter';
    }
    
    return 'unknown';
  }

  /**
   * Get carrier display name
   */
  private getCarrierDisplayName(carrierId: string): string {
    const displayNames: { [key: string]: string } = {
      'allstate': 'Allstate Insurance',
      'state_farm': 'State Farm Insurance',
      'geico': 'GEICO',
      'progressive': 'Progressive Insurance',
      'liberty_mutual': 'Liberty Mutual',
      'travelers': 'Travelers Insurance',
      'farmers': 'Farmers Insurance'
    };
    
    return displayNames[carrierId] || carrierId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Learn from user feedback
   */
  async learnFromUserFeedback(feedback: any): Promise<void> {
    if (feedback.carrierId) {
      await this.carrierLearning.learnFromFeedback(feedback);
    }
  }

  /**
   * Get learning statistics
   */
  getLearningStatistics(): any {
    return this.carrierLearning.getLearningStatistics();
  }
}
