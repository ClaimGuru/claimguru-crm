/**
 * Document Classification Service
 * Automatically identifies document types based on content patterns
 * Supports the full spectrum of insurance claim documentation
 */

export interface DocumentType {
  type: string;
  confidence: number;
  patterns: string[];
  category: 'policy' | 'communication' | 'processing' | 'assessment';
}

export interface DocumentClassificationResult {
  documentType: string;
  confidence: number;
  category: 'policy' | 'communication' | 'processing' | 'assessment';
  extractionTemplate: string;
  suggestedFields: string[];
  processingNotes: string[];
}

export class DocumentClassificationService {
  
  private documentPatterns = {
    // Policy Documents
    'insurance_policy': {
      category: 'policy' as const,
      patterns: [
        /policy\s*number/i,
        /coverage\s*[a-d]/i,
        /deductible/i,
        /effective\s*date/i,
        /expiration\s*date/i,
        /dwelling\s*protection/i,
        /liability\s*protection/i,
        /homeowners?\s*policy/i,
        /property\s*insurance/i
      ],
      requiredPatterns: 2,
      weight: 1.0,
      extractionFields: [
        'policyNumber', 'insuredName', 'propertyAddress', 'effectiveDate', 
        'expirationDate', 'coverageA', 'coverageB', 'coverageC', 'coverageD',
        'deductible', 'insurerName', 'agentName'
      ]
    },
    
    'certified_policy': {
      category: 'policy' as const,
      patterns: [
        /certified\s*copy/i,
        /certified\s*policy/i,
        /official\s*copy/i,
        /policy\s*certification/i,
        /true\s*copy/i
      ],
      requiredPatterns: 1,
      weight: 1.2, // Higher weight for certified documents
      extractionFields: [
        'policyNumber', 'insuredName', 'propertyAddress', 'effectiveDate',
        'certificationDate', 'certifyingAuthority'
      ]
    },

    // Claim Communications
    'reservation_of_rights': {
      category: 'communication' as const,
      patterns: [
        /reservation\s*of\s*rights/i,
        /reserves?\s*its?\s*rights?/i,
        /under\s*investigation/i,
        /coverage\s*determination/i,
        /full\s*reservation/i,
        /deny\s*all\s*or\s*part/i
      ],
      requiredPatterns: 2,
      weight: 1.0,
      extractionFields: [
        'claimNumber', 'insuredName', 'dateOfLoss', 'investigationStatus',
        'rightsReserved', 'nextSteps', 'adjustorInfo', 'documentDate'
      ]
    },

    'request_for_information': {
      category: 'communication' as const,
      patterns: [
        /request\s*for\s*information/i,
        /additional\s*documentation/i,
        /within\s*\d+\s*days/i,
        /following\s*information/i,
        /needed\s*to\s*evaluate/i,
        /submit\s*the\s*following/i
      ],
      requiredPatterns: 2,
      weight: 1.0,
      extractionFields: [
        'claimNumber', 'requestedItems', 'deadline', 'contactInfo',
        'documentDate', 'referenceNumbers', 'submissionInstructions'
      ]
    },

    'acknowledgement_letter': {
      category: 'communication' as const,
      patterns: [
        /acknowledgment/i,
        /acknowledge/i,
        /claim\s*received/i,
        /thank\s*you\s*for\s*reporting/i,
        /claim\s*number\s*assigned/i,
        /started\s*working\s*on/i
      ],
      requiredPatterns: 2,
      weight: 1.0,
      extractionFields: [
        'claimNumber', 'acknowledgeDate', 'nextSteps', 'contactInfo',
        'assignedAdjustor', 'expectedTimeline'
      ]
    },

    'status_update_letter': {
      category: 'communication' as const,
      patterns: [
        /claim\s*update/i,
        /status\s*update/i,
        /may\s*provide\s*coverage/i,
        /under\s*review/i,
        /investigation\s*continues/i,
        /remediation/i,
        /mold.*fungus/i
      ],
      requiredPatterns: 2,
      weight: 1.0,
      extractionFields: [
        'claimNumber', 'currentStatus', 'investigationFindings',
        'coverageDecision', 'nextSteps', 'contactInfo'
      ]
    },

    // Processing Documents
    'settlement_letter': {
      category: 'processing' as const,
      patterns: [
        /settlement/i,
        /payment\s*authorization/i,
        /settlement\s*amount/i,
        /agreed\s*to\s*settle/i,
        /payment\s*will\s*be\s*issued/i,
        /final\s*settlement/i
      ],
      requiredPatterns: 2,
      weight: 1.1,
      extractionFields: [
        'claimNumber', 'settlementAmount', 'paymentTerms', 'releaseConditions',
        'paymentMethod', 'paymentDate', 'contactInfo'
      ]
    },

    'rejection_letter': {
      category: 'processing' as const,
      patterns: [
        /unable\s*to\s*accept/i,
        /rejection/i,
        /denied/i,
        /not\s*covered/i,
        /claim\s*is\s*denied/i,
        /cannot\s*provide\s*coverage/i,
        /policy\s*does\s*not\s*cover/i
      ],
      requiredPatterns: 2,
      weight: 1.1,
      extractionFields: [
        'claimNumber', 'rejectionReason', 'specificDeficiencies', 
        'appealProcess', 'appealDeadline', 'contactInfo'
      ]
    },

    'proof_of_loss_rejection': {
      category: 'processing' as const,
      patterns: [
        /proof\s*of\s*loss/i,
        /unable\s*to\s*accept.*estimate/i,
        /estimate.*proof\s*of\s*loss/i,
        /supplement.*reviewed/i,
        /inspection.*engineer/i
      ],
      requiredPatterns: 2,
      weight: 1.2,
      extractionFields: [
        'claimNumber', 'rejectedAmount', 'rejectionReason', 
        'inspectionFindings', 'requiredDocumentation', 'resubmissionRequirements'
      ]
    },

    // Assessment Documents
    'damage_assessment': {
      category: 'assessment' as const,
      patterns: [
        /damage\s*assessment/i,
        /estimate/i,
        /repair\s*costs?/i,
        /replacement\s*cost/i,
        /depreciation/i,
        /scope\s*of\s*work/i
      ],
      requiredPatterns: 2,
      weight: 1.0,
      extractionFields: [
        'claimNumber', 'damageDescription', 'estimatedCost', 
        'replacementCost', 'depreciation', 'scopeOfWork'
      ]
    },

    'inspection_report': {
      category: 'assessment' as const,
      patterns: [
        /inspection\s*report/i,
        /site\s*inspection/i,
        /field\s*inspection/i,
        /adjuster\s*notes/i,
        /inspection\s*findings/i
      ],
      requiredPatterns: 2,
      weight: 1.0,
      extractionFields: [
        'claimNumber', 'inspectionDate', 'inspectorName', 
        'findings', 'recommendations', 'photoReferences'
      ]
    }
  };

  /**
   * Classify a document based on its text content
   */
  public classifyDocument(text: string): DocumentClassificationResult {
    const scores: Array<{
      type: string;
      score: number;
      matchedPatterns: string[];
      template: any;
    }> = [];

    // Analyze text against each document type
    Object.entries(this.documentPatterns).forEach(([docType, template]) => {
      let matchCount = 0;
      const matchedPatterns: string[] = [];

      template.patterns.forEach((pattern, index) => {
        if (pattern.test(text)) {
          matchCount++;
          matchedPatterns.push(`Pattern ${index + 1}`);
        }
      });

      // Calculate confidence score
      const patternRatio = matchCount / template.patterns.length;
      const meetsRequirement = matchCount >= template.requiredPatterns;
      const weightedScore = patternRatio * template.weight;

      if (meetsRequirement) {
        scores.push({
          type: docType,
          score: weightedScore,
          matchedPatterns,
          template
        });
      }
    });

    // Sort by score and select the best match
    scores.sort((a, b) => b.score - a.score);

    if (scores.length === 0) {
      return {
        documentType: 'unknown',
        confidence: 0,
        category: 'processing',
        extractionTemplate: 'generic',
        suggestedFields: ['documentType', 'date', 'content'],
        processingNotes: ['Document type could not be determined', 'Manual classification recommended']
      };
    }

    const bestMatch = scores[0];
    const confidence = Math.min(bestMatch.score * 100, 95); // Cap at 95%

    return {
      documentType: bestMatch.type,
      confidence: confidence,
      category: bestMatch.template.category,
      extractionTemplate: bestMatch.type,
      suggestedFields: bestMatch.template.extractionFields,
      processingNotes: this.generateProcessingNotes(bestMatch.type, confidence, bestMatch.matchedPatterns)
    };
  }

  /**
   * Analyze multiple documents for workflow context
   */
  public analyzeDocumentWorkflow(documents: Array<{text: string, filename?: string}>): {
    claimContext: any;
    documentSequence: string[];
    missingDocuments: string[];
    workflowStage: string;
    recommendations: string[];
  } {
    const classifications = documents.map((doc, index) => ({
      index,
      filename: doc.filename || `Document ${index + 1}`,
      ...this.classifyDocument(doc.text)
    }));

    // Determine workflow stage
    const hasPolicy = classifications.some(c => c.category === 'policy');
    const hasAcknowledgement = classifications.some(c => c.documentType === 'acknowledgement_letter');
    const hasRFI = classifications.some(c => c.documentType === 'request_for_information');
    const hasSettlement = classifications.some(c => c.documentType === 'settlement_letter');
    const hasRejection = classifications.some(c => c.category === 'processing' && c.documentType.includes('rejection'));

    let workflowStage = 'unknown';
    const recommendations: string[] = [];
    const missingDocuments: string[] = [];

    if (!hasPolicy) {
      missingDocuments.push('Insurance Policy');
      recommendations.push('Upload insurance policy document for coverage verification');
    }

    if (hasPolicy && !hasAcknowledgement) {
      workflowStage = 'claim_initiation';
      recommendations.push('Claim appears to be in early stages - expect acknowledgement letter soon');
    } else if (hasAcknowledgement && hasRFI) {
      workflowStage = 'information_gathering';
      recommendations.push('Additional documentation requested - review RFI requirements');
    } else if (hasSettlement) {
      workflowStage = 'settlement';
      recommendations.push('Settlement reached - review terms and payment details');
    } else if (hasRejection) {
      workflowStage = 'disputed';
      recommendations.push('Claim has issues - review rejection reasons and appeal options');
    } else {
      workflowStage = 'under_review';
      recommendations.push('Claim appears to be under active review');
    }

    return {
      claimContext: {
        totalDocuments: documents.length,
        documentTypes: classifications.map(c => c.documentType),
        categories: [...new Set(classifications.map(c => c.category))],
        averageConfidence: classifications.reduce((sum, c) => sum + c.confidence, 0) / classifications.length
      },
      documentSequence: classifications
        .sort((a, b) => {
          // Sort by typical workflow order
          const order = ['policy', 'communication', 'assessment', 'processing'];
          return order.indexOf(a.category) - order.indexOf(b.category);
        })
        .map(c => c.documentType),
      missingDocuments,
      workflowStage,
      recommendations
    };
  }

  /**
   * Generate processing notes for a classification
   */
  private generateProcessingNotes(docType: string, confidence: number, matchedPatterns: string[]): string[] {
    const notes: string[] = [];

    if (confidence > 80) {
      notes.push('High confidence classification - document type clearly identified');
    } else if (confidence > 60) {
      notes.push('Moderate confidence - review extracted data carefully');
    } else {
      notes.push('Low confidence classification - manual verification recommended');
    }

    if (docType.includes('rejection')) {
      notes.push('ATTENTION: This appears to be a rejection/denial - review reasons carefully');
    }

    if (docType.includes('rfi') || docType.includes('request')) {
      notes.push('ACTION REQUIRED: Additional documentation may be needed');
    }

    if (docType.includes('settlement')) {
      notes.push('SETTLEMENT: Review payment terms and conditions');
    }

    if (matchedPatterns.length > 0) {
      notes.push(`Matched ${matchedPatterns.length} identification patterns`);
    }

    return notes;
  }

  /**
   * Get extraction template for a specific document type
   */
  public getExtractionTemplate(documentType: string): any {
    const template = this.documentPatterns[documentType];
    if (!template) {
      return {
        category: 'unknown',
        extractionFields: ['documentType', 'date', 'content'],
        processingInstructions: 'Use generic extraction approach'
      };
    }

    return {
      category: template.category,
      extractionFields: template.extractionFields,
      processingInstructions: `Extract ${template.category} document with focus on ${template.extractionFields.join(', ')}`
    };
  }
}

export default DocumentClassificationService;
