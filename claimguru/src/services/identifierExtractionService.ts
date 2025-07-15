/**
 * IDENTIFIER EXTRACTION SERVICE
 * 
 * Handles proper extraction and validation of Policy Numbers and Claim Numbers
 * Ensures correct mapping and relationship validation between identifiers
 */

export interface IdentifierExtractionResult {
  policyNumber: string | null;
  claimNumber: string | null;
  fileNumber: string | null;
  carrierClaimNumber: string | null;
  
  // Validation metadata
  documentType: 'policy' | 'claim' | 'communication' | 'settlement' | 'unknown';
  primaryIdentifier: 'policy' | 'claim' | 'both' | 'none';
  hasMultipleIdentifiers: boolean;
  
  // Confidence scores
  policyNumberConfidence: number;
  claimNumberConfidence: number;
  
  // Validation results
  relationshipStatus: 'valid' | 'conflicting' | 'missing' | 'unverified';
  validationMessage: string;
  suggestions: string[];
}

export class IdentifierExtractionService {
  private readonly POLICY_PATTERNS = [
    // Standard policy number patterns
    /(?:policy\s*(?:number|#|no|num)?\s*[:.]?\s*)([A-Z]{2,4}[\d\-]{6,20})/gi,
    /(?:policy\s*[:]\s*)([A-Z0-9\-]{6,25})/gi,
    /(?:pol(?:icy)?[:\s#]*([A-Z0-9\-]{5,25}))/gi,
    
    // Common insurance company patterns
    /\b([A-Z]{2,3}\d{7,15})\b/g,  // State Farm, Allstate patterns
    /\b(\d{2}-[A-Z]{2}-\d{6})\b/g,  // 12-AB-345678 pattern
    /\b([A-Z]{3,4}-\d{8,12})\b/g,  // ABC-12345678 pattern
    
    // Generic alphanumeric patterns (last resort)
    /\b([A-Z0-9]{8,20})\b/g
  ];

  private readonly CLAIM_PATTERNS = [
    // Standard claim number patterns
    /(?:claim\s*(?:number|#|no|num)?\s*[:.]?\s*)([A-Z0-9\-]{5,25})/gi,
    /(?:file\s*(?:number|#|no)?\s*[:.]?\s*)([A-Z0-9\-]{5,25})/gi,
    /(?:reference\s*(?:number|#|no)?\s*[:.]?\s*)([A-Z0-9\-]{5,25})/gi,
    
    // Common claim patterns
    /\b(CLM\d{6,15})\b/gi,
    /\b(\d{4}-\d{6,10})\b/g,  // Year-based patterns
    /\b([A-Z]{2,3}\d{8,15})\b/g,  // Carrier-specific patterns
    
    // Alternative patterns
    /(?:your\s+(?:claim|file)\s*[:.]?\s*)([A-Z0-9\-]{5,25})/gi,
    /(?:re\s*[:]\s*claim\s*[:.]?\s*)([A-Z0-9\-]{5,25})/gi
  ];

  private readonly DOCUMENT_TYPE_INDICATORS = {
    policy: [
      'insurance policy', 'policy declaration', 'policy period', 'coverage limits',
      'effective date', 'expiration date', 'premium', 'deductible'
    ],
    claim: [
      'claim number', 'date of loss', 'settlement', 'adjuster', 'inspection',
      'proof of loss', 'reservation of rights', 'claim status'
    ],
    communication: [
      'dear insured', 'thank you for', 'we have received', 'please provide',
      'request for information', 'additional documentation'
    ],
    settlement: [
      'settlement amount', 'payment', 'check', 'draft', 'release',
      'final settlement', 'partial payment'
    ]
  };

  /**
   * Extract and validate all identifiers from document text
   */
  async extractIdentifiers(text: string, documentFilename?: string): Promise<IdentifierExtractionResult> {
    console.log('🔍 Starting comprehensive identifier extraction...');
    
    // Extract identifiers using patterns
    const policyNumbers = this.extractPolicyNumbers(text);
    const claimNumbers = this.extractClaimNumbers(text);
    
    // Determine document type
    const documentType = this.analyzeDocumentType(text, documentFilename);
    
    // Select best candidates
    const bestPolicy = this.selectBestCandidate(policyNumbers, 'policy', text);
    const bestClaim = this.selectBestCandidate(claimNumbers, 'claim', text);
    
    // Calculate confidence scores
    const policyConfidence = this.calculateConfidence(bestPolicy, 'policy', text);
    const claimConfidence = this.calculateConfidence(bestClaim, 'claim', text);
    
    // Validate relationship
    const validation = this.validateRelationship(bestPolicy, bestClaim, documentType);
    
    // Determine primary identifier
    const primaryIdentifier = this.determinePrimaryIdentifier(
      bestPolicy, 
      bestClaim, 
      documentType, 
      policyConfidence, 
      claimConfidence
    );

    const result: IdentifierExtractionResult = {
      policyNumber: bestPolicy,
      claimNumber: bestClaim,
      fileNumber: this.extractFileNumber(text),
      carrierClaimNumber: this.extractCarrierClaimNumber(text),
      
      documentType,
      primaryIdentifier,
      hasMultipleIdentifiers: !!(bestPolicy && bestClaim),
      
      policyNumberConfidence: policyConfidence,
      claimNumberConfidence: claimConfidence,
      
      relationshipStatus: validation.status,
      validationMessage: validation.message,
      suggestions: validation.suggestions
    };

    console.log('✅ Identifier extraction complete:', {
      policy: result.policyNumber,
      claim: result.claimNumber,
      type: result.documentType,
      primary: result.primaryIdentifier
    });

    return result;
  }

  /**
   * Extract policy numbers using multiple patterns
   */
  private extractPolicyNumbers(text: string): string[] {
    const candidates = new Set<string>();
    
    for (const pattern of this.POLICY_PATTERNS) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && this.validatePolicyFormat(match[1])) {
          candidates.add(match[1].trim().toUpperCase());
        }
      }
    }
    
    return Array.from(candidates);
  }

  /**
   * Extract claim numbers using multiple patterns
   */
  private extractClaimNumbers(text: string): string[] {
    const candidates = new Set<string>();
    
    for (const pattern of this.CLAIM_PATTERNS) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && this.validateClaimFormat(match[1])) {
          candidates.add(match[1].trim().toUpperCase());
        }
      }
    }
    
    return Array.from(candidates);
  }

  /**
   * Validate policy number format
   */
  private validatePolicyFormat(policyNumber: string): boolean {
    // Basic validation rules
    if (policyNumber.length < 5 || policyNumber.length > 25) return false;
    if (!/[A-Z0-9]/.test(policyNumber)) return false;
    
    // Exclude obvious non-policy patterns
    const excludePatterns = [
      /^\d{4}$/, // Just a year
      /^(19|20)\d{2}$/, // Year patterns
      /^[A-Z]{1,2}$/, // Too short
      /^\d{1,4}$/ // Just short numbers
    ];
    
    return !excludePatterns.some(pattern => pattern.test(policyNumber));
  }

  /**
   * Validate claim number format
   */
  private validateClaimFormat(claimNumber: string): boolean {
    // Basic validation rules
    if (claimNumber.length < 5 || claimNumber.length > 25) return false;
    if (!/[A-Z0-9]/.test(claimNumber)) return false;
    
    // Exclude obvious non-claim patterns
    const excludePatterns = [
      /^\d{4}$/, // Just a year
      /^(19|20)\d{2}$/, // Year patterns
      /^[A-Z]{1,2}$/, // Too short
      /^\d{1,4}$/ // Just short numbers
    ];
    
    return !excludePatterns.some(pattern => pattern.test(claimNumber));
  }

  /**
   * Analyze document type based on content
   */
  private analyzeDocumentType(text: string, filename?: string): IdentifierExtractionResult['documentType'] {
    const lowerText = text.toLowerCase();
    const scores = { policy: 0, claim: 0, communication: 0, settlement: 0 };
    
    // Score based on keywords
    Object.entries(this.DOCUMENT_TYPE_INDICATORS).forEach(([type, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          scores[type as keyof typeof scores]++;
        }
      });
    });
    
    // Boost score based on filename
    if (filename) {
      const lowerFilename = filename.toLowerCase();
      if (lowerFilename.includes('policy')) scores.policy += 3;
      if (lowerFilename.includes('claim')) scores.claim += 3;
      if (lowerFilename.includes('settlement')) scores.settlement += 3;
      if (lowerFilename.includes('ror') || lowerFilename.includes('rfi')) scores.claim += 2;
    }
    
    // Return highest scoring type
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'unknown';
    
    return Object.entries(scores).find(([, score]) => score === maxScore)?.[0] as IdentifierExtractionResult['documentType'] || 'unknown';
  }

  /**
   * Select best candidate from multiple options
   */
  private selectBestCandidate(candidates: string[], type: 'policy' | 'claim', text: string): string | null {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];
    
    // Score candidates based on context
    const scoredCandidates = candidates.map(candidate => ({
      candidate,
      score: this.scoreCandidate(candidate, type, text)
    }));
    
    // Return highest scoring candidate
    scoredCandidates.sort((a, b) => b.score - a.score);
    return scoredCandidates[0].candidate;
  }

  /**
   * Score candidate based on context and format
   */
  private scoreCandidate(candidate: string, type: 'policy' | 'claim', text: string): number {
    let score = 0;
    
    // Length scoring (optimal lengths)
    if (type === 'policy') {
      if (candidate.length >= 8 && candidate.length <= 15) score += 3;
    } else {
      if (candidate.length >= 6 && candidate.length <= 18) score += 3;
    }
    
    // Format scoring
    if (/^[A-Z]{2,4}\d+/.test(candidate)) score += 2; // Starts with letters
    if (/\d{4}/.test(candidate)) score += 1; // Contains year-like pattern
    if (candidate.includes('-')) score += 1; // Has separators
    
    // Context scoring
    const contextPattern = new RegExp(`\\b${candidate}\\b`, 'gi');
    const mentions = (text.match(contextPattern) || []).length;
    if (mentions > 1) score += mentions; // Multiple mentions
    
    return score;
  }

  /**
   * Calculate confidence score for extracted identifier
   */
  private calculateConfidence(identifier: string | null, type: 'policy' | 'claim', text: string): number {
    if (!identifier) return 0;
    
    let confidence = 0.5; // Base confidence
    
    // Pattern confidence
    if (type === 'policy') {
      if (/^[A-Z]{2,4}\d{6,15}$/.test(identifier)) confidence += 0.3;
    } else {
      if (/^(CLM|CLAIM)\d+$/i.test(identifier)) confidence += 0.3;
    }
    
    // Context confidence
    const contextPattern = new RegExp(`${type}.*${identifier}|${identifier}.*${type}`, 'gi');
    if (contextPattern.test(text)) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Validate relationship between policy and claim numbers
   */
  private validateRelationship(
    policyNumber: string | null, 
    claimNumber: string | null, 
    documentType: string
  ): { status: IdentifierExtractionResult['relationshipStatus']; message: string; suggestions: string[] } {
    const suggestions: string[] = [];
    
    // Policy documents should have policy numbers
    if (documentType === 'policy') {
      if (!policyNumber) {
        return {
          status: 'missing',
          message: 'Policy document missing policy number',
          suggestions: ['Verify document type', 'Check for policy number in headers or footers']
        };
      }
      
      if (claimNumber) {
        suggestions.push('Policy document contains claim reference - may be claim-related correspondence');
      }
      
      return {
        status: 'valid',
        message: 'Policy number extracted from policy document',
        suggestions
      };
    }
    
    // Claim documents should have both identifiers
    if (['claim', 'communication', 'settlement'].includes(documentType)) {
      if (!claimNumber) {
        return {
          status: 'missing',
          message: 'Claim document missing claim number',
          suggestions: ['Verify document is claim-related', 'Check for alternative claim identifiers']
        };
      }
      
      if (!policyNumber) {
        suggestions.push('Missing policy number - claim documents should reference the policy');
        return {
          status: 'missing',
          message: 'Claim document missing policy number reference',
          suggestions
        };
      }
      
      return {
        status: 'valid',
        message: 'Both policy and claim numbers found in claim document',
        suggestions
      };
    }
    
    return {
      status: 'unverified',
      message: 'Unable to verify identifier relationship',
      suggestions: ['Manual verification recommended']
    };
  }

  /**
   * Determine primary identifier for the document
   */
  private determinePrimaryIdentifier(
    policyNumber: string | null,
    claimNumber: string | null,
    documentType: string,
    policyConfidence: number,
    claimConfidence: number
  ): IdentifierExtractionResult['primaryIdentifier'] {
    if (!policyNumber && !claimNumber) return 'none';
    if (policyNumber && claimNumber) return 'both';
    
    if (documentType === 'policy') return 'policy';
    if (['claim', 'settlement'].includes(documentType)) return 'claim';
    
    // Use confidence to decide
    if (policyConfidence > claimConfidence) return 'policy';
    if (claimConfidence > policyConfidence) return 'claim';
    
    return policyNumber ? 'policy' : 'claim';
  }

  /**
   * Extract file number (internal reference)
   */
  private extractFileNumber(text: string): string | null {
    const patterns = [
      /(?:file\s*(?:number|#|no)?\s*[:.]?\s*)([A-Z0-9\-]{5,25})/gi,
      /(?:our\s*(?:file|ref)\s*[:.]?\s*)([A-Z0-9\-]{5,25})/gi
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().toUpperCase();
      }
    }
    
    return null;
  }

  /**
   * Extract carrier-specific claim number
   */
  private extractCarrierClaimNumber(text: string): string | null {
    const patterns = [
      /(?:carrier\s*(?:claim|file)\s*[:.]?\s*)([A-Z0-9\-]{5,25})/gi,
      /(?:insurance\s*company\s*(?:claim|file)\s*[:.]?\s*)([A-Z0-9\-]{5,25})/gi
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().toUpperCase();
      }
    }
    
    return null;
  }
}
