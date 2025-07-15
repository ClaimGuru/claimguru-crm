/**
 * Intelligent Wizard Service - Cross-Step AI Intelligence
 * 
 * Provides AI-driven suggestions and data flow throughout the entire wizard process.
 * Focuses on reducing user workload while maintaining accuracy and user control.
 */

interface ExtractedPolicyData {
  policyNumber?: string;
  insuredName?: string;
  propertyAddress?: string;
  insurerName?: string;
  effectiveDate?: string;
  expirationDate?: string;
  coverageAmount?: string;
  deductible?: string;
  mailingAddress?: {
    addressLine1?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  phoneNumber?: string;
  email?: string;
  [key: string]: any;
}

interface ProcessedDocument {
  fileName: string;
  category: 'damage_photos' | 'receipts' | 'estimates' | 'correspondence' | 'reports' | 'other';
  extractedText?: string;
  analysisResults?: any;
  confidence: number;
  insights: string[];
}

interface AIInsight {
  type: 'suggestion' | 'warning' | 'information' | 'enhancement';
  confidence: 'high' | 'medium' | 'low';
  field?: string;
  title: string;
  description: string;
  suggestedValue?: string;
  source: string; // Which document or analysis generated this insight
  actionable: boolean;
}

export class IntelligentWizardService {
  private extractedPolicyData: ExtractedPolicyData | null = null;
  private processedDocuments: ProcessedDocument[] = [];
  private userPreferences: any = {};

  /**
   * Store extracted policy data for use throughout the wizard
   */
  setExtractedPolicyData(data: ExtractedPolicyData) {
    this.extractedPolicyData = data;
    console.log('🧠 Policy data stored for intelligent suggestions:', data);
  }

  /**
   * Add processed documents for AI analysis
   */
  addProcessedDocuments(documents: ProcessedDocument[]) {
    this.processedDocuments.push(...documents);
    console.log('📄 Documents added for AI analysis:', documents.length);
  }

  /**
   * Get pre-populated data for any wizard step
   */
  getPrePopulatedData(stepType: string): any {
    const suggestions: any = {};

    if (!this.extractedPolicyData) return suggestions;

    switch (stepType) {
      case 'client-details':
        return this.getClientDetailsSuggestions();
      
      case 'insurance-info':
        return this.getInsuranceInfoSuggestions();
      
      case 'claim-information':
        return this.getClaimInformationSuggestions();
      
      case 'loss-details':
        return this.getLossDetailsSuggestions();
      
      default:
        return suggestions;
    }
  }

  /**
   * Generate AI insights and suggestions for current step
   */
  async generateStepInsights(stepType: string, currentData: any): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Policy-based insights
    if (this.extractedPolicyData) {
      insights.push(...this.generatePolicyBasedInsights(stepType, currentData));
    }

    // Document-based insights
    if (this.processedDocuments.length > 0) {
      insights.push(...this.generateDocumentBasedInsights(stepType, currentData));
    }

    // Validation insights
    insights.push(...this.generateValidationInsights(stepType, currentData));

    return insights;
  }

  /**
   * Enhanced loss description generation using all available data
   */
  async generateEnhancedLossDescription(basicDetails: any): Promise<{
    description: string;
    confidence: number;
    sources: string[];
    enhancements: string[];
  }> {
    const sources: string[] = [];
    const enhancements: string[] = [];
    
    // Start with basic information
    let description = this.buildBasicDescription(basicDetails);
    
    // Enhance with policy data
    if (this.extractedPolicyData) {
      description = this.enhanceWithPolicyData(description, basicDetails);
      sources.push('Policy Document');
      enhancements.push('Added policy-specific information');
    }

    // Enhance with document analysis
    if (this.processedDocuments.length > 0) {
      const documentEnhancements = this.enhanceWithDocumentAnalysis(description, basicDetails);
      description = documentEnhancements.description;
      sources.push(...documentEnhancements.sources);
      enhancements.push(...documentEnhancements.enhancements);
    }

    // Professional language enhancement
    description = this.applyProfessionalLanguage(description);
    enhancements.push('Applied professional claim language');

    const confidence = this.calculateDescriptionConfidence(sources, basicDetails);

    return {
      description,
      confidence,
      sources,
      enhancements
    };
  }

  /**
   * Detect missing information and suggest documents
   */
  async detectMissingInformation(allWizardData: any): Promise<{
    missingFields: string[];
    suggestedDocuments: string[];
    completeness: number;
    recommendations: string[];
  }> {
    const missingFields: string[] = [];
    const suggestedDocuments: string[] = [];
    const recommendations: string[] = [];

    // Check required fields based on claim type
    const requiredFields = this.getRequiredFieldsForClaimType(allWizardData.lossDetails?.causeOfLoss);
    
    requiredFields.forEach(field => {
      if (!this.isFieldComplete(allWizardData, field)) {
        missingFields.push(field);
      }
    });

    // Suggest documents based on claim type and missing information
    if (allWizardData.lossDetails?.causeOfLoss) {
      suggestedDocuments.push(...this.getSuggestedDocuments(allWizardData.lossDetails.causeOfLoss));
    }

    // Calculate completeness
    const totalFields = requiredFields.length;
    const completedFields = totalFields - missingFields.length;
    const completeness = (completedFields / totalFields) * 100;

    // Generate recommendations
    recommendations.push(...this.generateCompletionRecommendations(allWizardData, missingFields));

    return {
      missingFields,
      suggestedDocuments,
      completeness,
      recommendations
    };
  }

  // Private helper methods

  private getClientDetailsSuggestions(): any {
    if (!this.extractedPolicyData) {
      console.log('❌ No extracted policy data available for client suggestions');
      return {};
    }

    const suggestions: any = {
      firstName: this.extractFirstName(this.extractedPolicyData.insuredName),
      lastName: this.extractLastName(this.extractedPolicyData.insuredName),
      phone: this.extractedPolicyData.phoneNumber,
      email: this.extractedPolicyData.email,
      mailingAddress: this.extractedPolicyData.mailingAddress || {
        addressLine1: this.extractedPolicyData.propertyAddress,
      },
      _aiSuggested: true,
      _confidence: 'high'
    };
    
    // Enhanced coinsured detection and suggestions
    if (this.extractedPolicyData.coinsuredName) {
      console.log('🤝 Coinsured detected:', this.extractedPolicyData.coinsuredName);
      
      // Add coinsured information suggestions
      suggestions.coinsuredInfo = {
        firstName: this.extractFirstName(this.extractedPolicyData.coinsuredName),
        lastName: this.extractLastName(this.extractedPolicyData.coinsuredName),
        relationship: this.determineRelationship(this.extractedPolicyData.insuredName, this.extractedPolicyData.coinsuredName),
        _aiSuggested: true,
        _confidence: 'high'
      };
      
      // Add insights about multiple policyholders
      suggestions._insights = suggestions._insights || [];
      suggestions._insights.push({
        type: 'coinsured_detected',
        message: `Policy has multiple insured parties: ${this.extractedPolicyData.insuredName} (Primary) and ${this.extractedPolicyData.coinsuredName} (Co-insured)`,
        recommendation: 'Consider collecting contact information for both insured parties'
      });
    }
    
    console.log('✅ Generated client details suggestions with coinsured analysis');
    return suggestions;
  }

  private getInsuranceInfoSuggestions(): any {
    if (!this.extractedPolicyData) return {};

    return {
      insuranceCarrier: this.extractedPolicyData.insurerName,
      policyNumber: this.extractedPolicyData.policyNumber,
      effectiveDate: this.extractedPolicyData.effectiveDate,
      expirationDate: this.extractedPolicyData.expirationDate,
      coverageAmount: this.extractedPolicyData.coverageAmount,
      deductible: this.extractedPolicyData.deductible,
      _aiSuggested: true,
      _confidence: 'high'
    };
  }

  private getClaimInformationSuggestions(): any {
    const suggestions: any = {};

    // Use property address from policy
    if (this.extractedPolicyData?.propertyAddress) {
      suggestions.lossAddress = this.parseAddress(this.extractedPolicyData.propertyAddress);
      suggestions._aiSuggested = true;
    }

    // Add document-based suggestions
    if (this.processedDocuments.length > 0) {
      const damagePhotos = this.processedDocuments.filter(doc => doc.category === 'damage_photos');
      const estimates = this.processedDocuments.filter(doc => doc.category === 'estimates');
      
      if (damagePhotos.length > 0) {
        suggestions.damagePhotosAvailable = true;
        suggestions._photoCount = damagePhotos.length;
      }
      
      if (estimates.length > 0) {
        suggestions.estimatesAvailable = true;
        suggestions._estimateCount = estimates.length;
      }
    }

    return suggestions;
  }

  private getLossDetailsSuggestions(): any {
    const suggestions: any = {};

    // Extract dates from documents
    const documents = this.processedDocuments;
    if (documents.length > 0) {
      // Look for dates in document text
      const extractedDates = this.extractDatesFromDocuments(documents);
      if (extractedDates.length > 0) {
        suggestions.possibleLossDates = extractedDates;
        suggestions._aiSuggested = true;
      }
    }

    return suggestions;
  }

  private generatePolicyBasedInsights(stepType: string, currentData: any): AIInsight[] {
    const insights: AIInsight[] = [];
    
    if (!this.extractedPolicyData) return insights;

    // Check policy coverage dates
    if (stepType === 'claim-information' && currentData.dateOfLoss) {
      const lossDate = new Date(currentData.dateOfLoss);
      const effectiveDate = new Date(this.extractedPolicyData.effectiveDate || '');
      const expirationDate = new Date(this.extractedPolicyData.expirationDate || '');

      if (lossDate < effectiveDate) {
        insights.push({
          type: 'warning',
          confidence: 'high',
          field: 'dateOfLoss',
          title: 'Loss Date Before Policy Effective Date',
          description: 'The loss date appears to be before the policy effective date. Please verify the correct dates.',
          source: 'Policy Analysis',
          actionable: true
        });
      }

      if (lossDate > expirationDate) {
        insights.push({
          type: 'warning',
          confidence: 'high',
          field: 'dateOfLoss',
          title: 'Loss Date After Policy Expiration',
          description: 'The loss date appears to be after the policy expiration date. Coverage may not apply.',
          source: 'Policy Analysis',
          actionable: true
        });
      }
    }

    return insights;
  }

  private generateDocumentBasedInsights(stepType: string, currentData: any): AIInsight[] {
    const insights: AIInsight[] = [];

    // Analyze uploaded documents for relevant insights
    this.processedDocuments.forEach(doc => {
      if (doc.insights && doc.insights.length > 0) {
        doc.insights.forEach(insight => {
          insights.push({
            type: 'information',
            confidence: doc.confidence > 0.8 ? 'high' : doc.confidence > 0.6 ? 'medium' : 'low',
            title: `Insight from ${doc.fileName}`,
            description: insight,
            source: doc.fileName,
            actionable: false
          });
        });
      }
    });

    return insights;
  }

  private generateValidationInsights(stepType: string, currentData: any): AIInsight[] {
    const insights: AIInsight[] = [];

    // Check for common validation issues
    if (stepType === 'client-details') {
      if (currentData.phone && !this.isValidPhoneNumber(currentData.phone)) {
        insights.push({
          type: 'suggestion',
          confidence: 'high',
          field: 'phone',
          title: 'Phone Number Format',
          description: 'Phone number should be in format (XXX) XXX-XXXX',
          suggestedValue: this.formatPhoneNumber(currentData.phone),
          source: 'Validation Engine',
          actionable: true
        });
      }

      if (currentData.email && !this.isValidEmail(currentData.email)) {
        insights.push({
          type: 'warning',
          confidence: 'high',
          field: 'email',
          title: 'Invalid Email Format',
          description: 'Please check the email address format',
          source: 'Validation Engine',
          actionable: true
        });
      }
    }

    return insights;
  }

  private buildBasicDescription(details: any): string {
    const { causeOfLoss, dateOfLoss, damageDescription } = details;
    
    return `On ${dateOfLoss || '[Date of Loss]'}, the insured property sustained damage due to ${causeOfLoss || '[Cause of Loss]'}. ${damageDescription || 'The property experienced damage requiring assessment and repair.'}`;
  }

  private enhanceWithPolicyData(description: string, details: any): string {
    if (!this.extractedPolicyData) return description;

    const propertyAddress = this.extractedPolicyData.propertyAddress || '[Property Address]';
    const policyNumber = this.extractedPolicyData.policyNumber || '[Policy Number]';
    
    return description.replace('[Property Address]', propertyAddress) + 
           `\n\nThe loss is reported under Policy No. ${policyNumber}. The insured has taken appropriate measures to prevent further damage and is cooperating fully with the claims process.`;
  }

  private enhanceWithDocumentAnalysis(description: string, details: any): { description: string; sources: string[]; enhancements: string[] } {
    const sources: string[] = [];
    const enhancements: string[] = [];
    let enhancedDescription = description;

    // Look for damage assessment from photos
    const damagePhotos = this.processedDocuments.filter(doc => doc.category === 'damage_photos');
    if (damagePhotos.length > 0) {
      enhancedDescription += `\n\nPhotographic documentation has been provided showing the extent of damage (${damagePhotos.length} photos).`;
      sources.push('Damage Photos');
      enhancements.push('Added photo documentation reference');
    }

    // Look for cost estimates
    const estimates = this.processedDocuments.filter(doc => doc.category === 'estimates');
    if (estimates.length > 0) {
      enhancedDescription += ` Professional estimates have been obtained for repair costs.`;
      sources.push('Contractor Estimates');
      enhancements.push('Added cost estimation reference');
    }

    // Look for official reports
    const reports = this.processedDocuments.filter(doc => doc.category === 'reports');
    if (reports.length > 0) {
      enhancedDescription += ` Official reports documenting the incident have been provided.`;
      sources.push('Official Reports');
      enhancements.push('Added official documentation reference');
    }

    return { description: enhancedDescription, sources, enhancements };
  }

  private applyProfessionalLanguage(description: string): string {
    // Apply professional insurance language patterns
    return description
      .replace(/got damaged/gi, 'sustained damage')
      .replace(/broke/gi, 'failed')
      .replace(/a lot of/gi, 'significant')
      .replace(/really bad/gi, 'severe')
      .replace(/stuff/gi, 'property');
  }

  private calculateDescriptionConfidence(sources: string[], basicDetails: any): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on available data
    if (basicDetails.causeOfLoss) confidence += 0.1;
    if (basicDetails.dateOfLoss) confidence += 0.1;
    if (basicDetails.damageDescription) confidence += 0.1;
    
    // Increase confidence based on sources
    confidence += sources.length * 0.05;
    
    if (this.extractedPolicyData) confidence += 0.15;
    
    return Math.min(confidence, 1.0);
  }

  // Utility helper methods
  private extractFirstName(fullName?: string): string {
    if (!fullName) return '';
    return fullName.split(' ')[0] || '';
  }

  private extractLastName(fullName?: string): string {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  private parseAddress(addressString: string): any {
    // Simple address parsing - could be enhanced with a proper address parsing service
    const parts = addressString.split(',').map(p => p.trim());
    
    return {
      addressLine1: parts[0] || '',
      city: parts[1] || '',
      state: parts[2]?.split(' ')[0] || '',
      zipCode: parts[2]?.split(' ')[1] || ''
    };
  }

  private determineRelationship(primaryName?: string, coinsuredName?: string): string {
    if (!primaryName || !coinsuredName) return 'Co-insured';
    
    // Extract last names for comparison
    const primaryLastName = this.extractLastName(primaryName).toLowerCase();
    const coinsuredLastName = this.extractLastName(coinsuredName).toLowerCase();
    
    // If same last name, likely spouse
    if (primaryLastName && coinsuredLastName && primaryLastName === coinsuredLastName) {
      // Check for common spouse patterns
      const primaryFirst = this.extractFirstName(primaryName).toLowerCase();
      const coinsuredFirst = this.extractFirstName(coinsuredName).toLowerCase();
      
      // Look for gender-based name patterns to determine spouse relationship
      const maleNames = ['john', 'robert', 'michael', 'david', 'james', 'william', 'richard', 'thomas', 'charles', 'christopher'];
      const femaleNames = ['mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica', 'sarah', 'karen'];
      
      const primaryIsMale = maleNames.includes(primaryFirst);
      const primaryIsFemale = femaleNames.includes(primaryFirst);
      const coinsuredIsMale = maleNames.includes(coinsuredFirst);
      const coinsuredIsFemale = femaleNames.includes(coinsuredFirst);
      
      // If opposite genders with same last name, likely spouse
      if ((primaryIsMale && coinsuredIsFemale) || (primaryIsFemale && coinsuredIsMale)) {
        return 'Spouse';
      }
    }
    
    // Look for explicit relationship indicators in the original text
    // This would require access to the raw extracted text, but for now we'll use patterns
    
    return 'Co-insured'; // Default fallback
  }

  private extractDatesFromDocuments(documents: ProcessedDocument[]): string[] {
    const dates: string[] = [];
    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g;
    
    documents.forEach(doc => {
      if (doc.extractedText) {
        const foundDates = doc.extractedText.match(dateRegex);
        if (foundDates) {
          dates.push(...foundDates);
        }
      }
    });
    
    return [...new Set(dates)]; // Remove duplicates
  }

  private getRequiredFieldsForClaimType(causeOfLoss?: string): string[] {
    const baseFields = [
      'clientDetails.firstName',
      'clientDetails.lastName',
      'clientDetails.phone',
      'lossDetails.dateOfLoss',
      'lossDetails.causeOfLoss',
      'insuranceInfo.policyNumber',
      'insuranceInfo.insuranceCarrier'
    ];

    // Add claim-specific required fields
    switch (causeOfLoss) {
      case 'Water Damage':
        baseFields.push('lossDetails.waterSource', 'lossDetails.mitigationSteps');
        break;
      case 'Fire':
        baseFields.push('lossDetails.fireSource', 'lossDetails.evacuationDetails');
        break;
      case 'Theft':
        baseFields.push('lossDetails.policeReport', 'lossDetails.stolenItems');
        break;
    }

    return baseFields;
  }

  private getSuggestedDocuments(causeOfLoss: string): string[] {
    const baseDocuments = ['Damage photos', 'Repair estimates', 'Policy documents'];
    
    switch (causeOfLoss) {
      case 'Water Damage':
        return [...baseDocuments, 'Water mitigation reports', 'Plumber estimates'];
      case 'Fire':
        return [...baseDocuments, 'Fire department report', 'Fire investigation report'];
      case 'Theft':
        return [...baseDocuments, 'Police report', 'Inventory of stolen items'];
      case 'Storm Damage':
        return [...baseDocuments, 'Weather reports', 'Tree removal estimates'];
      default:
        return baseDocuments;
    }
  }

  private generateCompletionRecommendations(data: any, missingFields: string[]): string[] {
    const recommendations: string[] = [];
    
    if (missingFields.includes('lossDetails.dateOfLoss')) {
      recommendations.push('Verify the exact date when the damage first occurred');
    }
    
    if (missingFields.includes('insuranceInfo.policyNumber')) {
      recommendations.push('Locate your insurance policy or declaration page for policy number');
    }
    
    if (!data.damagePhotos || data.damagePhotos.length === 0) {
      recommendations.push('Take clear photos of all damaged areas from multiple angles');
    }
    
    return recommendations;
  }

  private isFieldComplete(data: any, fieldPath: string): boolean {
    const keys = fieldPath.split('.');
    let current = data;
    
    for (const key of keys) {
      if (!current || current[key] === undefined || current[key] === '') {
        return false;
      }
      current = current[key];
    }
    
    return true;
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  private formatPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const intelligentWizardService = new IntelligentWizardService();
export default intelligentWizardService;
