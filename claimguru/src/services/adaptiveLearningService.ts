/**
 * ADAPTIVE LEARNING SERVICE
 * 
 * Implements machine learning capabilities for document extraction:
 * - Learns carrier-specific document patterns
 * - Builds template knowledge for improved extraction
 * - Adapts extraction rules based on historical success
 * - Incorporates user feedback for continuous improvement
 */

export interface CarrierTemplate {
  carrierId: string;
  carrierName: string;
  documentType: 'policy' | 'claim_letter' | 'ror' | 'rfi' | 'acknowledgement' | 'settlement';
  
  // Field location patterns (learned from successful extractions)
  fieldPatterns: {
    [fieldName: string]: {
      patterns: string[];           // Regex patterns that work for this carrier
      locations: number[];          // Character positions where field is typically found
      contexts: string[];           // Surrounding text that indicates this field
      confidence: number;           // Success rate for this pattern
      lastUpdated: string;
      extractionCount: number;      // How many times this pattern was successful
    };
  };
  
  // Document layout characteristics
  layoutSignatures: {
    headerPatterns: string[];       // Text patterns that identify this carrier's headers
    footerPatterns: string[];       // Footer identification patterns
    sectionMarkers: string[];       // How this carrier marks document sections
    dateFormats: string[];          // Preferred date formats for this carrier
    numberFormats: string[];        // How this carrier formats policy/claim numbers
  };
  
  // Learning metadata
  learnedFrom: {
    totalDocuments: number;
    successfulExtractions: number;
    userCorrections: number;
    lastLearningDate: string;
    averageConfidence: number;
  };
}

export interface DocumentTypeExpectations {
  documentType: string;
  expectedFields: {
    [fieldName: string]: {
      isRequired: boolean;
      probability: number;           // Likelihood this field appears in this document type
      typicalValues: string[];       // Examples of typical values
      validationRules: string[];     // Rules for validating extracted values
    };
  };
  prohibitedFields: string[];       // Fields that should never appear in this document type
  contextualHints: string[];        // Text that suggests this document type
}

export interface LearningFeedback {
  documentId: string;
  carrierId: string;
  documentType: string;
  originalExtraction: any;
  userCorrections: any;
  extractionMethod: string;
  feedbackType: 'correction' | 'validation' | 'enhancement';
  timestamp: string;
  confidence: number;
}

export class AdaptiveLearningService {
  private carrierTemplates: Map<string, CarrierTemplate> = new Map();
  private documentExpectations: Map<string, DocumentTypeExpectations> = new Map();
  private learningHistory: LearningFeedback[] = [];
  private isLearningEnabled: boolean = true;

  constructor() {
    this.initializeDocumentExpectations();
    this.loadCarrierTemplates();
  }

  /**
   * Initialize document type expectations based on business rules
   */
  private initializeDocumentExpectations(): void {
    // Policy Document Expectations
    this.documentExpectations.set('policy', {
      documentType: 'policy',
      expectedFields: {
        policyNumber: { isRequired: true, probability: 0.95, typicalValues: [], validationRules: ['length:5-25'] },
        insuredName: { isRequired: true, probability: 0.95, typicalValues: [], validationRules: ['minLength:2'] },
        propertyAddress: { isRequired: true, probability: 0.90, typicalValues: [], validationRules: ['minLength:10'] },
        effectiveDate: { isRequired: true, probability: 0.95, typicalValues: [], validationRules: ['dateFormat'] },
        expirationDate: { isRequired: true, probability: 0.95, typicalValues: [], validationRules: ['dateFormat'] },
        coverageA: { isRequired: false, probability: 0.85, typicalValues: [], validationRules: ['currency'] },
        coverageB: { isRequired: false, probability: 0.75, typicalValues: [], validationRules: ['currency'] },
        coverageC: { isRequired: false, probability: 0.75, typicalValues: [], validationRules: ['currency'] },
        coverageD: { isRequired: false, probability: 0.70, typicalValues: [], validationRules: ['currency'] },
        deductible: { isRequired: false, probability: 0.85, typicalValues: [], validationRules: ['currency'] },
        insurerName: { isRequired: true, probability: 0.90, typicalValues: [], validationRules: ['minLength:2'] }
      },
      prohibitedFields: ['claimNumber', 'dateOfLoss', 'adjustorName'], // Policies should never have these
      contextualHints: ['policy number', 'effective date', 'expiration date', 'coverage limits', 'premium']
    });

    // Claim Letter Expectations (ROR, RFI, Acknowledgement, etc.)
    this.documentExpectations.set('claim_letter', {
      documentType: 'claim_letter',
      expectedFields: {
        claimNumber: { isRequired: true, probability: 0.95, typicalValues: [], validationRules: ['length:5-25'] },
        policyNumber: { isRequired: true, probability: 0.85, typicalValues: [], validationRules: ['length:5-25'] },
        insuredName: { isRequired: true, probability: 0.90, typicalValues: [], validationRules: ['minLength:2'] },
        dateOfLoss: { isRequired: false, probability: 0.70, typicalValues: [], validationRules: ['dateFormat'] },
        causeOfLoss: { isRequired: false, probability: 0.60, typicalValues: ['fire', 'water', 'wind', 'theft'], validationRules: [] },
        lossDescription: { isRequired: false, probability: 0.50, typicalValues: [], validationRules: ['minLength:10'] },
        adjustorName: { isRequired: false, probability: 0.60, typicalValues: [], validationRules: ['minLength:2'] },
        adjustorPhone: { isRequired: false, probability: 0.50, typicalValues: [], validationRules: ['phoneFormat'] },
        insurerName: { isRequired: true, probability: 0.85, typicalValues: [], validationRules: ['minLength:2'] }
      },
      prohibitedFields: ['coverageA', 'coverageB', 'coverageC', 'coverageD'], // Letters typically don't have coverage details
      contextualHints: ['claim number', 'date of loss', 'adjuster', 'investigation', 'reservation of rights']
    });
  }

  /**
   * Load existing carrier templates from storage
   */
  private async loadCarrierTemplates(): Promise<void> {
    try {
      // In a real implementation, this would load from a database
      console.log('📚 Loading carrier templates from storage...');
      
      // For now, initialize with some common carriers
      this.initializeCommonCarriers();
    } catch (error) {
      console.error('Failed to load carrier templates:', error);
    }
  }

  /**
   * Initialize templates for common insurance carriers
   */
  private initializeCommonCarriers(): void {
    const commonCarriers = [
      {
        id: 'allstate',
        name: 'Allstate Insurance',
        policyPatterns: ['\\b[A-Z]{2}\\d{8}\\b', '\\bALL\\d{6,10}\\b'],
        claimPatterns: ['\\bCLM\\d{8,12}\\b', '\\b\\d{4}-\\d{6}\\b'],
        headerPatterns: ['allstate', 'allstate insurance company'],
        dateFormats: ['MM/DD/YYYY', 'MM-DD-YYYY']
      },
      {
        id: 'statefarm',
        name: 'State Farm',
        policyPatterns: ['\\b\\d{2}-[A-Z]{2}-\\d{4}-\\d{2}\\b', '\\bSF\\d{8}\\b'],
        claimPatterns: ['\\b\\d{2}-\\d{6}-\\d{2}\\b'],
        headerPatterns: ['state farm', 'state farm insurance'],
        dateFormats: ['MM/DD/YYYY']
      },
      {
        id: 'travelers',
        name: 'Travelers Insurance',
        policyPatterns: ['\\bTRV\\d{8}\\b', '\\b[A-Z]{3}\\d{7}\\b'],
        claimPatterns: ['\\bTC\\d{8}\\b'],
        headerPatterns: ['travelers', 'travelers insurance'],
        dateFormats: ['MM/DD/YYYY', 'YYYY-MM-DD']
      }
    ];

    commonCarriers.forEach(carrier => {
      this.carrierTemplates.set(carrier.id, {
        carrierId: carrier.id,
        carrierName: carrier.name,
        documentType: 'policy', // Default, will be refined with learning
        fieldPatterns: {
          policyNumber: {
            patterns: carrier.policyPatterns,
            locations: [],
            contexts: ['policy number', 'policy #', 'pol no'],
            confidence: 0.7, // Starting confidence
            lastUpdated: new Date().toISOString(),
            extractionCount: 0
          },
          claimNumber: {
            patterns: carrier.claimPatterns,
            locations: [],
            contexts: ['claim number', 'claim #', 'file number'],
            confidence: 0.7,
            lastUpdated: new Date().toISOString(),
            extractionCount: 0
          }
        },
        layoutSignatures: {
          headerPatterns: carrier.headerPatterns,
          footerPatterns: [],
          sectionMarkers: [],
          dateFormats: carrier.dateFormats,
          numberFormats: []
        },
        learnedFrom: {
          totalDocuments: 0,
          successfulExtractions: 0,
          userCorrections: 0,
          lastLearningDate: new Date().toISOString(),
          averageConfidence: 0.7
        }
      });
    });

    console.log(`🎯 Initialized ${commonCarriers.length} carrier templates`);
  }

  /**
   * Identify carrier from document text
   */
  public identifyCarrier(text: string): { carrierId: string; confidence: number } | null {
    const lowerText = text.toLowerCase();
    let bestMatch: { carrierId: string; confidence: number } | null = null;

    for (const [carrierId, template] of this.carrierTemplates) {
      let confidence = 0;

      // Check header patterns
      for (const pattern of template.layoutSignatures.headerPatterns) {
        if (lowerText.includes(pattern.toLowerCase())) {
          confidence += 0.4;
          break;
        }
      }

      // Check if policy/claim number patterns match
      const policyPatterns = template.fieldPatterns.policyNumber?.patterns || [];
      for (const pattern of policyPatterns) {
        if (new RegExp(pattern, 'i').test(text)) {
          confidence += 0.3;
          break;
        }
      }

      const claimPatterns = template.fieldPatterns.claimNumber?.patterns || [];
      for (const pattern of claimPatterns) {
        if (new RegExp(pattern, 'i').test(text)) {
          confidence += 0.3;
          break;
        }
      }

      if (confidence > (bestMatch?.confidence || 0)) {
        bestMatch = { carrierId, confidence };
      }
    }

    return bestMatch && bestMatch.confidence > 0.5 ? bestMatch : null;
  }

  /**
   * Get enhanced extraction instructions for a specific carrier and document type
   */
  public getCarrierSpecificExtractionRules(
    carrierId: string,
    documentType: string,
    text: string
  ): any {
    const template = this.carrierTemplates.get(carrierId);
    const expectations = this.documentExpectations.get(documentType);

    if (!template && !expectations) {
      return this.getGenericExtractionRules(documentType);
    }

    const rules = {
      carrierSpecific: template ? {
        carrierId,
        carrierName: template.carrierName,
        fieldPatterns: template.fieldPatterns,
        layoutHints: template.layoutSignatures,
        averageConfidence: template.learnedFrom.averageConfidence
      } : null,
      
      documentExpectations: expectations ? {
        expectedFields: expectations.expectedFields,
        prohibitedFields: expectations.prohibitedFields,
        contextualHints: expectations.contextualHints
      } : null,

      adaptiveRules: this.generateAdaptiveRules(carrierId, documentType, text),
      
      extractionStrategy: this.determineExtractionStrategy(template, expectations, text)
    };

    console.log(`🎯 Generated carrier-specific extraction rules for ${carrierId} (${documentType})`);
    return rules;
  }

  /**
   * Generate adaptive extraction rules based on learning history
   */
  private generateAdaptiveRules(carrierId: string, documentType: string, text: string): any {
    const relevantFeedback = this.learningHistory.filter(
      feedback => feedback.carrierId === carrierId && feedback.documentType === documentType
    );

    const adaptiveRules = {
      highSuccessPatterns: [],
      commonFailurePoints: [],
      userCorrectionPatterns: [],
      confidenceAdjustments: {}
    };

    // Analyze feedback to generate adaptive rules
    relevantFeedback.forEach(feedback => {
      if (feedback.feedbackType === 'correction') {
        // Learn from user corrections
        Object.keys(feedback.userCorrections).forEach(field => {
          if (!adaptiveRules.userCorrectionPatterns.includes(field)) {
            adaptiveRules.userCorrectionPatterns.push(field);
          }
        });
      }
    });

    return adaptiveRules;
  }

  /**
   * Determine optimal extraction strategy based on carrier template and document type
   */
  private determineExtractionStrategy(
    template: CarrierTemplate | undefined,
    expectations: DocumentTypeExpectations | undefined,
    text: string
  ): string {
    if (template && template.learnedFrom.averageConfidence > 0.8) {
      return 'template_optimized'; // Use learned patterns primarily
    } else if (expectations) {
      return 'document_type_optimized'; // Use document type expectations
    } else {
      return 'generic_extraction'; // Fall back to generic extraction
    }
  }

  /**
   * Learn from successful extraction
   */
  public async learnFromSuccessfulExtraction(
    carrierId: string,
    documentType: string,
    text: string,
    extractedData: any,
    extractionMethod: string,
    confidence: number
  ): Promise<void> {
    if (!this.isLearningEnabled) return;

    console.log(`📖 Learning from successful extraction: ${carrierId} (${documentType})`);

    let template = this.carrierTemplates.get(carrierId);
    
    if (!template) {
      // Create new template for this carrier
      template = this.createNewCarrierTemplate(carrierId, documentType, text);
      this.carrierTemplates.set(carrierId, template);
    }

    // Update field patterns based on successful extraction
    Object.keys(extractedData).forEach(fieldName => {
      const value = extractedData[fieldName];
      if (value && typeof value === 'string') {
        this.updateFieldPattern(template!, fieldName, value, text, confidence);
      }
    });

    // Update learning metadata
    template.learnedFrom.totalDocuments++;
    template.learnedFrom.successfulExtractions++;
    template.learnedFrom.lastLearningDate = new Date().toISOString();
    template.learnedFrom.averageConfidence = 
      (template.learnedFrom.averageConfidence + confidence) / 2;

    await this.saveCarrierTemplate(template);
  }

  /**
   * Learn from user corrections
   */
  public async learnFromUserCorrections(
    carrierId: string,
    documentType: string,
    text: string,
    originalExtraction: any,
    userCorrections: any,
    extractionMethod: string
  ): Promise<void> {
    if (!this.isLearningEnabled) return;

    console.log(`🔧 Learning from user corrections: ${carrierId} (${documentType})`);

    const feedback: LearningFeedback = {
      documentId: `doc_${Date.now()}`,
      carrierId,
      documentType,
      originalExtraction,
      userCorrections,
      extractionMethod,
      feedbackType: 'correction',
      timestamp: new Date().toISOString(),
      confidence: 0.9 // User corrections are high confidence
    };

    this.learningHistory.push(feedback);

    let template = this.carrierTemplates.get(carrierId);
    if (!template) {
      template = this.createNewCarrierTemplate(carrierId, documentType, text);
      this.carrierTemplates.set(carrierId, template);
    }

    // Update patterns based on user corrections
    Object.keys(userCorrections).forEach(fieldName => {
      const correctedValue = userCorrections[fieldName];
      if (correctedValue && typeof correctedValue === 'string') {
        this.updateFieldPattern(template!, fieldName, correctedValue, text, 0.95);
      }
    });

    template.learnedFrom.userCorrections++;
    template.learnedFrom.lastLearningDate = new Date().toISOString();

    await this.saveCarrierTemplate(template);
  }

  /**
   * Create new carrier template from first encounter
   */
  private createNewCarrierTemplate(
    carrierId: string,
    documentType: string,
    text: string
  ): CarrierTemplate {
    console.log(`🆕 Creating new carrier template: ${carrierId}`);

    return {
      carrierId,
      carrierName: this.extractCarrierName(text) || carrierId,
      documentType: documentType as any,
      fieldPatterns: {},
      layoutSignatures: {
        headerPatterns: this.extractHeaderPatterns(text),
        footerPatterns: this.extractFooterPatterns(text),
        sectionMarkers: [],
        dateFormats: this.detectDateFormats(text),
        numberFormats: []
      },
      learnedFrom: {
        totalDocuments: 1,
        successfulExtractions: 0,
        userCorrections: 0,
        lastLearningDate: new Date().toISOString(),
        averageConfidence: 0.5
      }
    };
  }

  /**
   * Update field pattern based on successful extraction
   */
  private updateFieldPattern(
    template: CarrierTemplate,
    fieldName: string,
    value: string,
    text: string,
    confidence: number
  ): void {
    if (!template.fieldPatterns[fieldName]) {
      template.fieldPatterns[fieldName] = {
        patterns: [],
        locations: [],
        contexts: [],
        confidence: 0,
        lastUpdated: new Date().toISOString(),
        extractionCount: 0
      };
    }

    const fieldPattern = template.fieldPatterns[fieldName];

    // Generate regex pattern for this value
    const pattern = this.generatePatternFromValue(value);
    if (pattern && !fieldPattern.patterns.includes(pattern)) {
      fieldPattern.patterns.push(pattern);
    }

    // Find location of value in text
    const location = text.indexOf(value);
    if (location !== -1) {
      fieldPattern.locations.push(location);
    }

    // Extract context around the value
    const context = this.extractContextAroundValue(text, value);
    if (context && !fieldPattern.contexts.includes(context)) {
      fieldPattern.contexts.push(context);
    }

    // Update confidence and metadata
    fieldPattern.confidence = Math.max(fieldPattern.confidence, confidence);
    fieldPattern.extractionCount++;
    fieldPattern.lastUpdated = new Date().toISOString();
  }

  /**
   * Generate regex pattern from extracted value
   */
  private generatePatternFromValue(value: string): string {
    // Policy number patterns
    if (/^[A-Z]{2,4}[\d\-]{6,15}$/.test(value)) {
      return '\\b[A-Z]{2,4}[\\d\\-]{6,15}\\b';
    }
    
    // Claim number patterns
    if (/^(CLM|CLAIM)?\d{6,15}$/i.test(value)) {
      return '\\b(CLM|CLAIM)?\\d{6,15}\\b';
    }

    // Date patterns
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(value)) {
      return '\\b\\d{1,2}[\/\\-]\\d{1,2}[\/\\-]\\d{2,4}\\b';
    }

    // Currency patterns
    if (/^\$[\d,]+\.?\d*$/.test(value)) {
      return '\\$[\\d,]+\\.?\\d*';
    }

    // Generic alphanumeric
    if (value.length > 5) {
      return `\\b${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`;
    }

    return '';
  }

  /**
   * Extract context words around a value
   */
  private extractContextAroundValue(text: string, value: string): string {
    const index = text.indexOf(value);
    if (index === -1) return '';

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + value.length + 50);
    const context = text.substring(start, end);

    // Extract key words that might indicate this field
    const words = context.match(/\b\w+\b/g) || [];
    const relevantWords = words.filter(word => 
      word.length > 2 && 
      !['the', 'and', 'for', 'you', 'are', 'with'].includes(word.toLowerCase())
    );

    return relevantWords.slice(0, 3).join(' ').toLowerCase();
  }

  /**
   * Helper methods for template creation
   */
  private extractCarrierName(text: string): string | null {
    const patterns = [
      /(?:insurance\s+company|insurance|ins\.?\s+co\.?)\s*[:.]?\s*([A-Za-z\s&]{2,30})/i,
      /([A-Za-z\s&]{2,30})\s+(?:insurance\s+company|insurance)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  private extractHeaderPatterns(text: string): string[] {
    const lines = text.split('\n').slice(0, 5); // First 5 lines
    return lines
      .filter(line => line.trim().length > 5)
      .map(line => line.trim().toLowerCase())
      .slice(0, 3);
  }

  private extractFooterPatterns(text: string): string[] {
    const lines = text.split('\n').slice(-5); // Last 5 lines
    return lines
      .filter(line => line.trim().length > 5)
      .map(line => line.trim().toLowerCase())
      .slice(0, 3);
  }

  private detectDateFormats(text: string): string[] {
    const formats = [];
    
    if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(text)) {
      formats.push('MM/DD/YYYY');
    }
    if (/\d{1,2}-\d{1,2}-\d{4}/.test(text)) {
      formats.push('MM-DD-YYYY');
    }
    if (/\d{4}-\d{1,2}-\d{1,2}/.test(text)) {
      formats.push('YYYY-MM-DD');
    }

    return formats;
  }

  private getGenericExtractionRules(documentType: string): any {
    return {
      carrierSpecific: null,
      documentExpectations: this.documentExpectations.get(documentType) || null,
      adaptiveRules: { message: 'No carrier-specific patterns learned yet' },
      extractionStrategy: 'generic_extraction'
    };
  }

  /**
   * Save carrier template (in real implementation, this would save to database)
   */
  private async saveCarrierTemplate(template: CarrierTemplate): Promise<void> {
    try {
      // In real implementation, save to database
      console.log(`💾 Saved carrier template: ${template.carrierId}`);
    } catch (error) {
      console.error('Failed to save carrier template:', error);
    }
  }

  /**
   * Get learning statistics
   */
  public getLearningStatistics(): any {
    return {
      totalCarriers: this.carrierTemplates.size,
      totalLearningEvents: this.learningHistory.length,
      documentTypesLearned: this.documentExpectations.size,
      averageCarrierConfidence: Array.from(this.carrierTemplates.values())
        .reduce((sum, template) => sum + template.learnedFrom.averageConfidence, 0) / this.carrierTemplates.size,
      lastLearningEvent: this.learningHistory.length > 0 
        ? this.learningHistory[this.learningHistory.length - 1].timestamp 
        : null
    };
  }

  /**
   * Enable/disable learning
   */
  public setLearningEnabled(enabled: boolean): void {
    this.isLearningEnabled = enabled;
    console.log(`🎓 Learning ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export default AdaptiveLearningService;