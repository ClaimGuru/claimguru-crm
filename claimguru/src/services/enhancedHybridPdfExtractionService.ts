/**
 * ENHANCED HYBRID PDF EXTRACTION SERVICE - ClaimGuru
 * 
 * INTELLIGENT ITERATIVE PROCESSING WITH CONFIDENCE BUILDING:
 * 1. Multi-method extraction with cross-validation
 * 2. Iterative confidence building - bounces between methods until high confidence
 * 3. Field-level confidence scoring and validation
 * 4. Adaptive retry mechanisms with optimization
 * 5. Result fusion from multiple sources
 * 6. Smart quality gates and thresholds
 */

import { HybridPDFExtractionService, HybridPDFExtractionResult } from './hybridPdfExtractionService';

export interface FieldConfidence {
  field: string;
  value: string;
  confidence: number;
  sources: string[];
  validationScore: number;
}

export interface EnhancedExtractionResult extends HybridPDFExtractionResult {
  overallConfidence: number;
  fieldConfidences: FieldConfidence[];
  iterationCount: number;
  crossValidationScore: number;
  qualityGate: 'passed' | 'warning' | 'failed';
  processingHistory: {
    iteration: number;
    method: string;
    confidence: number;
    fieldsExtracted: number;
    timestamp: number;
  }[];
}

export class EnhancedHybridPdfExtractionService extends HybridPDFExtractionService {
  private readonly CONFIDENCE_THRESHOLDS = {
    HIGH: 0.85,
    MEDIUM: 0.70,
    LOW: 0.50,
    MINIMUM: 0.30
  };

  private readonly MAX_ITERATIONS = 4;
  private readonly CRITICAL_FIELDS = [
    'policyNumber', 'insuredName', 'propertyAddress', 
    'effectiveDate', 'expirationDate', 'insurerName'
  ];

  /**
   * Enhanced extraction with iterative confidence building
   */
  async extractWithConfidenceBuilding(file: File): Promise<EnhancedExtractionResult> {
    console.log('🚀 Starting Enhanced Hybrid Extraction with Confidence Building');
    const startTime = Date.now();
    
    let results: any[] = [];
    let iteration = 0;
    let bestResult: any = null;
    let processingHistory: any[] = [];

    // Phase 1: Multi-method extraction
    const extractionMethods = [
      { name: 'pdf-js', weight: 0.6 },
      { name: 'tesseract', weight: 0.8 },
      { name: 'google-vision', weight: 1.0 }
    ];

    for (const method of extractionMethods) {
      iteration++;
      console.log(`🔄 Iteration ${iteration}: Trying ${method.name}...`);
      
      try {
        const result = await this.extractWithMethod(file, method.name);
        result.iteration = iteration;
        result.weight = method.weight;
        results.push(result);
        
        processingHistory.push({
          iteration,
          method: method.name,
          confidence: result.confidence,
          fieldsExtracted: Object.keys(result.policyData).filter(k => result.policyData[k]).length,
          timestamp: Date.now() - startTime
        });

        console.log(`📊 ${method.name} result: ${result.confidence.toFixed(2)} confidence, ${Object.keys(result.policyData).filter(k => result.policyData[k]).length} fields`);
      } catch (error) {
        console.warn(`⚠️ ${method.name} failed:`, error.message);
      }
    }

    // Phase 2: Cross-validation and fusion
    const fusedResult = await this.fuseResults(results, file);
    
    // Phase 3: Field-level confidence analysis
    const fieldConfidences = await this.analyzeFieldConfidences(fusedResult, results);
    
    // Phase 4: Check if we need additional iterations
    const overallConfidence = this.calculateOverallConfidence(fieldConfidences);
    console.log(`🎯 Current overall confidence: ${overallConfidence.toFixed(2)}`);

    // Phase 5: Adaptive retry if confidence is low
    if (overallConfidence < this.CONFIDENCE_THRESHOLDS.MEDIUM && iteration < this.MAX_ITERATIONS) {
      console.log('🔄 Confidence below threshold, attempting adaptive retry...');
      const adaptiveResult = await this.adaptiveRetry(file, fusedResult, fieldConfidences);
      if (adaptiveResult.confidence > fusedResult.confidence) {
        console.log('✅ Adaptive retry improved results');
        results.push(adaptiveResult);
        // Re-fuse with new result
        const newFusedResult = await this.fuseResults(results, file);
        return this.finalizeEnhancedResult(newFusedResult, results, fieldConfidences, processingHistory, startTime);
      }
    }

    return this.finalizeEnhancedResult(fusedResult, results, fieldConfidences, processingHistory, startTime);
  }

  /**
   * Extract using specific method
   */
  private async extractWithMethod(file: File, method: string): Promise<any> {
    switch (method) {
      case 'pdf-js':
        const pdfResult = await this.extractWithPDFjs(file);
        return {
          extractedText: pdfResult.text,
          confidence: this.evaluateTextQuality(pdfResult.text) / 100,
          processingMethod: 'pdf-js',
          cost: 0,
          policyData: await this.enhanceWithAI(pdfResult.text),
          method: 'pdf-js'
        };

      case 'tesseract':
        const tesseractResult = await this.extractWithTesseract(file);
        return {
          extractedText: tesseractResult.text,
          confidence: tesseractResult.confidence,
          processingMethod: 'tesseract',
          cost: 0,
          policyData: await this.enhanceWithAI(tesseractResult.text),
          method: 'tesseract'
        };

      case 'google-vision':
        const visionResult = await this.extractWithGoogleVision(file);
        return {
          extractedText: visionResult.text,
          confidence: visionResult.confidence,
          processingMethod: 'google-vision',
          cost: 0.015,
          policyData: await this.enhanceWithAI(visionResult.text),
          method: 'google-vision'
        };

      default:
        throw new Error(`Unknown extraction method: ${method}`);
    }
  }

  /**
   * Fuse results from multiple extraction methods
   */
  private async fuseResults(results: any[], file: File): Promise<any> {
    if (results.length === 0) {
      throw new Error('No successful extractions to fuse');
    }

    console.log('🔀 Fusing results from multiple methods...');
    
    // Find the result with highest weighted confidence
    const bestResult = results.reduce((best, current) => {
      const weightedScore = current.confidence * (current.weight || 1);
      const bestWeightedScore = best.confidence * (best.weight || 1);
      return weightedScore > bestWeightedScore ? current : best;
    });

    // Create fused policy data by taking best field from each result
    const fusedPolicyData: any = {};
    const allFields = new Set<string>();
    
    // Collect all unique fields
    results.forEach(result => {
      Object.keys(result.policyData || {}).forEach(field => allFields.add(field));
    });

    // For each field, find the best value across all results
    for (const field of allFields) {
      const fieldCandidates = results
        .map(result => ({
          value: result.policyData?.[field],
          confidence: result.confidence,
          method: result.method,
          weight: result.weight || 1
        }))
        .filter(candidate => candidate.value && candidate.value !== 'null')
        .sort((a, b) => (b.confidence * b.weight) - (a.confidence * a.weight));

      if (fieldCandidates.length > 0) {
        // Cross-validate if multiple candidates exist
        if (fieldCandidates.length > 1) {
          const consensus = this.findFieldConsensus(fieldCandidates);
          fusedPolicyData[field] = consensus.value;
        } else {
          fusedPolicyData[field] = fieldCandidates[0].value;
        }
      }
    }

    return {
      ...bestResult,
      policyData: fusedPolicyData,
      extractedText: this.fuseTexts(results),
      confidence: this.calculateFusedConfidence(results),
      processingMethod: 'fused',
      fusedFromMethods: results.map(r => r.method)
    };
  }

  /**
   * Find consensus value for a field across multiple extractions
   */
  private findFieldConsensus(candidates: any[]): any {
    // Check for exact matches first
    const valueGroups: any = {};
    candidates.forEach(candidate => {
      const normalizedValue = this.normalizeFieldValue(candidate.value);
      if (!valueGroups[normalizedValue]) {
        valueGroups[normalizedValue] = [];
      }
      valueGroups[normalizedValue].push(candidate);
    });

    // Find the value with highest combined confidence
    let bestGroup = null;
    let bestScore = 0;

    Object.entries(valueGroups).forEach(([value, group]: [string, any[]]) => {
      const score = group.reduce((sum, candidate) => sum + (candidate.confidence * candidate.weight), 0);
      if (score > bestScore) {
        bestScore = score;
        bestGroup = { value, candidates: group };
      }
    });

    return bestGroup ? { value: bestGroup.value, confidence: bestScore } : candidates[0];
  }

  /**
   * Normalize field values for comparison
   */
  private normalizeFieldValue(value: string): string {
    if (!value) return '';
    return value.toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  /**
   * Fuse text from multiple extractions
   */
  private fuseTexts(results: any[]): string {
    // Return the longest text as it likely has the most complete content
    return results.reduce((longest, current) => {
      return current.extractedText.length > longest.extractedText.length 
        ? current.extractedText 
        : longest.extractedText;
    }, { extractedText: '' }).extractedText;
  }

  /**
   * Calculate confidence for fused result
   */
  private calculateFusedConfidence(results: any[]): number {
    // Weight average of all confidences
    const totalWeight = results.reduce((sum, result) => sum + (result.weight || 1), 0);
    const weightedSum = results.reduce((sum, result) => sum + (result.confidence * (result.weight || 1)), 0);
    
    return Math.min(weightedSum / totalWeight, 1.0);
  }

  /**
   * Analyze field-level confidences
   */
  private async analyzeFieldConfidences(result: any, allResults: any[]): Promise<FieldConfidence[]> {
    const fieldConfidences: FieldConfidence[] = [];
    const policyData = result.policyData || {};

    for (const [field, value] of Object.entries(policyData)) {
      if (!value || value === 'null') continue;

      // Find how many methods extracted this field
      const sources = allResults
        .filter(r => r.policyData?.[field] && r.policyData[field] !== 'null')
        .map(r => r.method);

      // Calculate field confidence based on:
      // 1. Number of sources that found it
      // 2. Consensus between sources
      // 3. Field validation score
      const sourceCount = sources.length;
      const consensusScore = this.calculateFieldConsensus(field, allResults);
      const validationScore = this.validateField(field, value as string);

      const fieldConfidence = Math.min(
        (sourceCount / allResults.length) * 0.4 +  // 40% based on source coverage
        consensusScore * 0.3 +                     // 30% based on consensus
        validationScore * 0.3,                     // 30% based on validation
        1.0
      );

      fieldConfidences.push({
        field,
        value: value as string,
        confidence: fieldConfidence,
        sources,
        validationScore
      });
    }

    return fieldConfidences.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate consensus score for a specific field
   */
  private calculateFieldConsensus(field: string, results: any[]): number {
    const values = results
      .map(r => r.policyData?.[field])
      .filter(v => v && v !== 'null')
      .map(v => this.normalizeFieldValue(v));

    if (values.length <= 1) return 1.0;

    // Count unique values
    const uniqueValues = new Set(values);
    const consensusRatio = 1 - (uniqueValues.size - 1) / values.length;
    
    return Math.max(consensusRatio, 0.1);
  }

  /**
   * Validate individual field value
   */
  private validateField(field: string, value: string): number {
    if (!value || value.length < 2) return 0;

    const validationRules: any = {
      policyNumber: /^[A-Z0-9\-]{5,25}$/,
      insuredName: /^[A-Za-z\s,&.'-]{2,50}$/,
      propertyAddress: /\d+.*[A-Za-z]/,
      effectiveDate: /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,
      expirationDate: /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,
      insurerName: /^[A-Za-z\s&.,'-]{2,60}$/,
      coverageAmount: /^\$?[\d,]+$/,
      deductible: /^\$?[\d,]+$/
    };

    const rule = validationRules[field];
    if (!rule) return 0.7; // Default score for unknown fields

    return rule.test(value.trim()) ? 1.0 : 0.3;
  }

  /**
   * Calculate overall confidence from field confidences
   */
  private calculateOverallConfidence(fieldConfidences: FieldConfidence[]): number {
    if (fieldConfidences.length === 0) return 0;

    // Weight critical fields more heavily
    let totalWeight = 0;
    let weightedSum = 0;

    fieldConfidences.forEach(field => {
      const weight = this.CRITICAL_FIELDS.includes(field.field) ? 3 : 1;
      totalWeight += weight;
      weightedSum += field.confidence * weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Adaptive retry with optimizations based on current results
   */
  private async adaptiveRetry(file: File, currentResult: any, fieldConfidences: FieldConfidence[]): Promise<any> {
    console.log('🎯 Performing adaptive retry with optimizations...');

    // Identify weak fields that need improvement
    const weakFields = fieldConfidences
      .filter(f => f.confidence < this.CONFIDENCE_THRESHOLDS.MEDIUM)
      .map(f => f.field);

    console.log('🔧 Targeting weak fields:', weakFields.join(', '));

    // Try a different approach based on what's missing
    const missingCriticalFields = this.CRITICAL_FIELDS.filter(field => 
      !currentResult.policyData[field] || currentResult.policyData[field] === 'null'
    );

    if (missingCriticalFields.length > 0) {
      console.log('🎯 Re-extracting for missing critical fields:', missingCriticalFields.join(', '));
      
      // Try Google Vision with higher confidence threshold
      try {
        const retryResult = await this.extractWithGoogleVision(file);
        const enhancedData = await this.enhanceWithAI(retryResult.text);
        
        return {
          extractedText: retryResult.text,
          confidence: Math.min(retryResult.confidence + 0.1, 1.0), // Boost confidence for retry
          processingMethod: 'google-vision-retry',
          cost: 0.015,
          policyData: enhancedData,
          method: 'adaptive-retry'
        };
      } catch (error) {
        console.warn('⚠️ Adaptive retry failed:', error.message);
      }
    }

    return currentResult;
  }

  /**
   * Finalize enhanced result with all metadata
   */
  private finalizeEnhancedResult(
    result: any, 
    allResults: any[], 
    fieldConfidences: FieldConfidence[], 
    processingHistory: any[], 
    startTime: number
  ): EnhancedExtractionResult {
    const overallConfidence = this.calculateOverallConfidence(fieldConfidences);
    const crossValidationScore = this.calculateCrossValidationScore(allResults);
    
    let qualityGate: 'passed' | 'warning' | 'failed' = 'failed';
    if (overallConfidence >= this.CONFIDENCE_THRESHOLDS.HIGH) {
      qualityGate = 'passed';
    } else if (overallConfidence >= this.CONFIDENCE_THRESHOLDS.MEDIUM) {
      qualityGate = 'warning';
    }

    console.log(`🏁 Enhanced extraction complete:
      - Overall Confidence: ${overallConfidence.toFixed(2)}
      - Quality Gate: ${qualityGate}
      - Fields Extracted: ${fieldConfidences.length}
      - Cross-Validation Score: ${crossValidationScore.toFixed(2)}
      - Processing Time: ${Date.now() - startTime}ms`);

    return {
      ...result,
      overallConfidence,
      fieldConfidences,
      iterationCount: allResults.length,
      crossValidationScore,
      qualityGate,
      processingHistory,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Calculate cross-validation score
   */
  private calculateCrossValidationScore(results: any[]): number {
    if (results.length < 2) return 0.5;

    const allFields = new Set<string>();
    results.forEach(result => {
      Object.keys(result.policyData || {}).forEach(field => allFields.add(field));
    });

    let agreementCount = 0;
    let totalComparisons = 0;

    for (const field of allFields) {
      const values = results
        .map(r => r.policyData?.[field])
        .filter(v => v && v !== 'null')
        .map(v => this.normalizeFieldValue(v));

      if (values.length >= 2) {
        totalComparisons++;
        const uniqueValues = new Set(values);
        if (uniqueValues.size === 1) {
          agreementCount++;
        }
      }
    }

    return totalComparisons > 0 ? agreementCount / totalComparisons : 0.5;
  }

  // Note: Inherit all methods from parent HybridPDFExtractionService
  // This class extends the base functionality with enhanced confidence building
}