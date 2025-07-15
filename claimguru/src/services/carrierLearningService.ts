/**
 * CARRIER-SPECIFIC LEARNING SERVICE
 * 
 * Implements machine learning for carrier-specific document patterns.
 * Learns where information is typically found on different carriers' documents.
 * Builds extraction templates and improves accuracy over time.
 */

export interface CarrierPattern {
  carrierId: string;
  carrierName: string;
  documentType: 'policy' | 'letter' | 'claim_form';
  fieldPatterns: FieldPattern[];
  layoutSignatures: LayoutSignature[];
  extractionSuccess: number;
  documentsProcessed: number;
  lastUpdated: Date;
  confidence: number;
}

export interface FieldPattern {
  fieldName: string;
  
  // Location patterns (relative positions on document)
  typicalPositions: {
    page: number;
    region: 'header' | 'body' | 'footer' | 'sidebar';
    coordinates?: { x: number; y: number; width: number; height: number };
    textBefore?: string[];
    textAfter?: string[];
  }[];
  
  // Content patterns
  valuePatterns: RegExp[];
  contextPatterns: string[];
  
  // Learning metadata
  successRate: number;
  timesFound: number;
  timesCorreected: number;
  confidence: number;
}

export interface LayoutSignature {
  documentType: string;
  headerPatterns: string[];
  footerPatterns: string[];
  logoPositions: { x: number; y: number }[];
  fontPatterns: string[];
  colorPatterns: string[];
  structuralMarkers: string[];
}

export interface LearningFeedback {
  documentId: string;
  carrierId: string;
  fieldName: string;
  correctValue: string;
  foundValue: string | null;
  userCorrection: boolean;
  actualPosition?: { page: number; x: number; y: number };
  context: string;
}

export class CarrierLearningService {
  private carrierPatterns: Map<string, CarrierPattern> = new Map();
  private learningHistory: LearningFeedback[] = [];
  
  // Known carrier identifiers and their patterns
  private readonly CARRIER_IDENTIFIERS = {
    'allstate': {
      patterns: [/allstate/i, /the allstate corporation/i],
      logoMarkers: ['ALLSTATE', 'You\'re in good hands'],
      commonHeaders: ['HOMEOWNERS POLICY', 'ALLSTATE INSURANCE COMPANY']
    },
    'state_farm': {
      patterns: [/state farm/i, /state farm insurance/i],
      logoMarkers: ['STATE FARM', 'Like a good neighbor'],
      commonHeaders: ['STATE FARM FIRE AND CASUALTY COMPANY']
    },
    'geico': {
      patterns: [/geico/i, /government employees insurance/i],
      logoMarkers: ['GEICO', 'Government Employees Insurance Company'],
      commonHeaders: ['GEICO GENERAL INSURANCE COMPANY']
    },
    'progressive': {
      patterns: [/progressive/i, /progressive insurance/i],
      logoMarkers: ['PROGRESSIVE', 'Progressive Casualty Insurance Company'],
      commonHeaders: ['PROGRESSIVE SPECIALTY INSURANCE COMPANY']
    },
    'liberty_mutual': {
      patterns: [/liberty mutual/i, /liberty insurance/i],
      logoMarkers: ['LIBERTY MUTUAL', 'Liberty Mutual Insurance'],
      commonHeaders: ['LIBERTY MUTUAL INSURANCE COMPANY']
    },
    'travelers': {
      patterns: [/travelers/i, /travelers insurance/i],
      logoMarkers: ['TRAVELERS', 'The Travelers Companies'],
      commonHeaders: ['TRAVELERS CASUALTY AND SURETY COMPANY']
    },
    'farmers': {
      patterns: [/farmers/i, /farmers insurance/i],
      logoMarkers: ['FARMERS', 'Farmers Insurance Group'],
      commonHeaders: ['FARMERS INSURANCE COMPANY']
    }
  };

  /**
   * Identify carrier from document text and structure
   */
  async identifyCarrier(text: string, metadata?: any): Promise<string | null> {
    const normalizedText = text.toLowerCase();
    
    // First, try direct pattern matching
    for (const [carrierId, carrier] of Object.entries(this.CARRIER_IDENTIFIERS)) {
      for (const pattern of carrier.patterns) {
        if (pattern.test(normalizedText)) {
          console.log(`🏢 Identified carrier: ${carrierId} via pattern matching`);
          return carrierId;
        }
      }
      
      // Check for logo markers
      for (const marker of carrier.logoMarkers) {
        if (normalizedText.includes(marker.toLowerCase())) {
          console.log(`🏢 Identified carrier: ${carrierId} via logo marker`);
          return carrierId;
        }
      }
    }
    
    // Fallback: Use learned patterns if available
    for (const [carrierId, pattern] of this.carrierPatterns.entries()) {
      const confidence = this.calculateCarrierMatchConfidence(text, pattern);
      if (confidence > 0.8) {
        console.log(`🏢 Identified carrier: ${carrierId} via learned patterns (${confidence.toFixed(2)} confidence)`);
        return carrierId;
      }
    }
    
    console.log('🏢 Could not identify carrier from document');
    return null;
  }

  /**
   * Learn from successful extraction
   */
  async learnFromExtraction(
    carrierId: string,
    documentType: 'policy' | 'letter' | 'claim_form',
    extractedData: any,
    documentText: string,
    metadata?: any
  ): Promise<void> {
    console.log(`📚 Learning from ${carrierId} ${documentType} extraction...`);
    
    const pattern = this.getOrCreateCarrierPattern(carrierId, documentType);
    
    // Analyze extracted fields and their context
    for (const [fieldName, value] of Object.entries(extractedData)) {
      if (value && typeof value === 'string' && value.trim() !== '') {
        await this.learnFieldPattern(pattern, fieldName, value as string, documentText);
      }
    }
    
    // Update pattern statistics
    pattern.documentsProcessed++;
    pattern.extractionSuccess++;
    pattern.lastUpdated = new Date();
    pattern.confidence = this.calculatePatternConfidence(pattern);
    
    this.carrierPatterns.set(carrierId, pattern);
    
    console.log(`📈 Updated ${carrierId} pattern: ${pattern.confidence.toFixed(2)} confidence, ${pattern.documentsProcessed} docs processed`);
  }

  /**
   * Learn from user feedback/corrections
   */
  async learnFromFeedback(feedback: LearningFeedback): Promise<void> {
    console.log(`🔧 Learning from user correction for ${feedback.carrierId}`);
    
    this.learningHistory.push(feedback);
    
    const pattern = this.carrierPatterns.get(feedback.carrierId);
    if (!pattern) return;
    
    // Find the field pattern and update it
    let fieldPattern = pattern.fieldPatterns.find(fp => fp.fieldName === feedback.fieldName);
    if (!fieldPattern) {
      fieldPattern = {
        fieldName: feedback.fieldName,
        typicalPositions: [],
        valuePatterns: [],
        contextPatterns: [],
        successRate: 0,
        timesFound: 0,
        timesCorreected: 0,
        confidence: 0
      };
      pattern.fieldPatterns.push(fieldPattern);
    }
    
    fieldPattern.timesCorreected++;
    
    if (feedback.userCorrection) {
      // Learn the correct pattern from user's correction
      await this.learnFieldPattern(pattern, feedback.fieldName, feedback.correctValue, feedback.context);
      
      // If we found the wrong value, adjust our confidence
      if (feedback.foundValue && feedback.foundValue !== feedback.correctValue) {
        fieldPattern.successRate = Math.max(0, fieldPattern.successRate - 0.1);
      }
    }
    
    // Recalculate confidence
    fieldPattern.confidence = this.calculateFieldConfidence(fieldPattern);
    pattern.confidence = this.calculatePatternConfidence(pattern);
    
    this.carrierPatterns.set(feedback.carrierId, pattern);
  }

  /**
   * Get carrier-specific extraction hints
   */
  async getExtractionHints(carrierId: string, documentType: string): Promise<any> {
    const pattern = this.carrierPatterns.get(carrierId);
    if (!pattern || pattern.confidence < 0.5) {
      return null;
    }
    
    const hints = {
      carrierId,
      documentType,
      confidence: pattern.confidence,
      fieldHints: {} as any,
      extractionStrategy: this.generateExtractionStrategy(pattern),
      priorityFields: this.getPriorityFields(pattern)
    };
    
    // Generate field-specific hints
    for (const fieldPattern of pattern.fieldPatterns) {
      if (fieldPattern.confidence > 0.6) {
        hints.fieldHints[fieldPattern.fieldName] = {
          patterns: fieldPattern.valuePatterns.map(p => p.source),
          contexts: fieldPattern.contextPatterns,
          positions: fieldPattern.typicalPositions,
          confidence: fieldPattern.confidence
        };
      }
    }
    
    console.log(`💡 Generated extraction hints for ${carrierId}: ${Object.keys(hints.fieldHints).length} field hints`);
    
    return hints;
  }

  /**
   * Enhanced extraction using learned patterns
   */
  async enhanceExtraction(
    carrierId: string,
    documentType: string,
    rawText: string,
    basicExtraction: any
  ): Promise<any> {
    const hints = await this.getExtractionHints(carrierId, documentType);
    if (!hints) return basicExtraction;
    
    console.log(`🎯 Enhancing extraction for ${carrierId} using learned patterns...`);
    
    const enhancedData = { ...basicExtraction };
    let enhancementsCount = 0;
    
    // Apply carrier-specific patterns
    for (const [fieldName, hint] of Object.entries(hints.fieldHints)) {
      const hintData = hint as any;
      
      // If we don't have this field or have low confidence, try learned patterns
      if (!enhancedData[fieldName] || enhancedData[fieldName] === 'null') {
        const extractedValue = this.extractFieldUsingHints(rawText, fieldName, hintData);
        if (extractedValue) {
          enhancedData[fieldName] = extractedValue;
          enhancementsCount++;
          console.log(`✨ Enhanced ${fieldName}: ${extractedValue}`);
        }
      }
    }
    
    // Add learning metadata
    enhancedData._learningMetadata = {
      carrierId,
      hintsApplied: Object.keys(hints.fieldHints).length,
      enhancementsCount,
      carrierConfidence: hints.confidence,
      learnedFrom: this.carrierPatterns.get(carrierId)?.documentsProcessed || 0
    };
    
    console.log(`📊 Applied ${enhancementsCount} enhancements from learned patterns`);
    
    return enhancedData;
  }

  /**
   * Get learning statistics for UI display
   */
  getLearningStatistics(): any {
    const stats = {
      carriersLearned: this.carrierPatterns.size,
      totalDocumentsProcessed: 0,
      totalCorrections: this.learningHistory.length,
      carrierBreakdown: {} as any,
      topPerformingCarriers: [] as any[],
      recentLearning: this.learningHistory.slice(-10)
    };
    
    for (const [carrierId, pattern] of this.carrierPatterns.entries()) {
      stats.totalDocumentsProcessed += pattern.documentsProcessed;
      stats.carrierBreakdown[carrierId] = {
        documentsProcessed: pattern.documentsProcessed,
        confidence: pattern.confidence,
        fieldsLearned: pattern.fieldPatterns.length,
        lastUpdate: pattern.lastUpdated
      };
    }
    
    // Sort carriers by performance
    stats.topPerformingCarriers = Array.from(this.carrierPatterns.entries())
      .map(([id, pattern]) => ({ id, ...pattern }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
    
    return stats;
  }

  // Private helper methods

  private getOrCreateCarrierPattern(carrierId: string, documentType: string): CarrierPattern {
    let pattern = this.carrierPatterns.get(carrierId);
    
    if (!pattern) {
      pattern = {
        carrierId,
        carrierName: this.getCarrierDisplayName(carrierId),
        documentType: documentType as 'policy' | 'letter' | 'claim_form',
        fieldPatterns: [],
        layoutSignatures: [],
        extractionSuccess: 0,
        documentsProcessed: 0,
        lastUpdated: new Date(),
        confidence: 0
      };
    }
    
    return pattern;
  }

  private async learnFieldPattern(
    pattern: CarrierPattern,
    fieldName: string,
    value: string,
    documentText: string
  ): Promise<void> {
    let fieldPattern = pattern.fieldPatterns.find(fp => fp.fieldName === fieldName);
    
    if (!fieldPattern) {
      fieldPattern = {
        fieldName,
        typicalPositions: [],
        valuePatterns: [],
        contextPatterns: [],
        successRate: 0,
        timesFound: 0,
        timesCorreected: 0,
        confidence: 0
      };
      pattern.fieldPatterns.push(fieldPattern);
    }
    
    fieldPattern.timesFound++;
    
    // Learn value patterns
    const valuePattern = this.createValuePattern(value);
    if (valuePattern && !fieldPattern.valuePatterns.some(p => p.source === valuePattern.source)) {
      fieldPattern.valuePatterns.push(valuePattern);
    }
    
    // Learn context patterns
    const context = this.extractContext(documentText, value);
    if (context && !fieldPattern.contextPatterns.includes(context)) {
      fieldPattern.contextPatterns.push(context);
    }
    
    fieldPattern.confidence = this.calculateFieldConfidence(fieldPattern);
  }

  private createValuePattern(value: string): RegExp | null {
    // Create a regex pattern based on the value structure
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Policy numbers: ABC123456 -> [A-Z]{3}\d{6}
    if (/^[A-Z]{2,4}\d{6,12}$/.test(value)) {
      const letterCount = value.match(/^[A-Z]+/)?.[0].length || 0;
      const numberCount = value.length - letterCount;
      return new RegExp(`[A-Z]{${letterCount}}\\d{${numberCount}}`, 'g');
    }
    
    // Dates: MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      return /\d{1,2}\/\d{1,2}\/\d{4}/g;
    }
    
    // Money amounts: $123,456
    if (/^\$[\d,]+$/.test(value)) {
      return /\$[\d,]+/g;
    }
    
    // Names (if contains spaces and proper case)
    if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(value)) {
      return /[A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g;
    }
    
    // Generic alphanumeric
    if (/^[A-Z0-9\-]+$/.test(value) && value.length > 5) {
      return new RegExp(`[A-Z0-9\\-]{${value.length - 2},${value.length + 2}}`, 'g');
    }
    
    return null;
  }

  private extractContext(text: string, value: string): string | null {
    const index = text.indexOf(value);
    if (index === -1) return null;
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + value.length + 50);
    const context = text.substring(start, end);
    
    // Extract the text before the value (likely the field label)
    const beforeValue = context.substring(0, index - start);
    const labelMatch = beforeValue.match(/([A-Za-z\s]+)[:]*\s*$/);
    
    return labelMatch ? labelMatch[1].trim() : null;
  }

  private calculateFieldConfidence(fieldPattern: FieldPattern): number {
    const successRate = fieldPattern.timesFound > 0 
      ? (fieldPattern.timesFound - fieldPattern.timesCorreected) / fieldPattern.timesFound 
      : 0;
    
    const patternStrength = Math.min(fieldPattern.valuePatterns.length / 3, 1);
    const contextStrength = Math.min(fieldPattern.contextPatterns.length / 2, 1);
    const experienceBonus = Math.min(fieldPattern.timesFound / 10, 0.2);
    
    return Math.min(successRate * 0.5 + patternStrength * 0.3 + contextStrength * 0.2 + experienceBonus, 1);
  }

  private calculatePatternConfidence(pattern: CarrierPattern): number {
    if (pattern.fieldPatterns.length === 0) return 0;
    
    const avgFieldConfidence = pattern.fieldPatterns.reduce((sum, fp) => sum + fp.confidence, 0) / pattern.fieldPatterns.length;
    const experienceBonus = Math.min(pattern.documentsProcessed / 20, 0.3);
    const successRate = pattern.documentsProcessed > 0 ? pattern.extractionSuccess / pattern.documentsProcessed : 0;
    
    return Math.min(avgFieldConfidence * 0.5 + successRate * 0.3 + experienceBonus, 1);
  }

  private calculateCarrierMatchConfidence(text: string, pattern: CarrierPattern): number {
    // Implementation for matching learned patterns against new documents
    let score = 0;
    
    for (const layoutSig of pattern.layoutSignatures) {
      for (const headerPattern of layoutSig.headerPatterns) {
        if (text.toLowerCase().includes(headerPattern.toLowerCase())) {
          score += 0.3;
        }
      }
    }
    
    return Math.min(score, 1);
  }

  private generateExtractionStrategy(pattern: CarrierPattern): any {
    return {
      approachOrder: ['learned_patterns', 'context_matching', 'fallback_regex'],
      priorityFields: pattern.fieldPatterns
        .filter(fp => fp.confidence > 0.7)
        .map(fp => fp.fieldName),
      confidence: pattern.confidence
    };
  }

  private getPriorityFields(pattern: CarrierPattern): string[] {
    return pattern.fieldPatterns
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10)
      .map(fp => fp.fieldName);
  }

  private extractFieldUsingHints(text: string, fieldName: string, hints: any): string | null {
    // Try each learned pattern
    for (const patternSource of hints.patterns || []) {
      try {
        const pattern = new RegExp(patternSource, 'gi');
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          return matches[0];
        }
      } catch (error) {
        console.warn(`Invalid pattern for ${fieldName}:`, patternSource);
      }
    }
    
    // Try context matching
    for (const context of hints.contexts || []) {
      const contextIndex = text.toLowerCase().indexOf(context.toLowerCase());
      if (contextIndex !== -1) {
        // Look for value after the context
        const afterContext = text.substring(contextIndex + context.length);
        const valueMatch = afterContext.match(/^\s*[:\-]?\s*([A-Za-z0-9\-\s,$]+)/);
        if (valueMatch) {
          return valueMatch[1].trim();
        }
      }
    }
    
    return null;
  }

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
}
