import { format } from 'date-fns';

/**
 * Service to map extracted PDF policy data to wizard form fields
 * Handles data transformation and population across all wizard steps
 */

export interface ExtractedPolicyData {
  // Basic Policy Information
  policyNumber?: string;
  insuredName?: string;
  insurerName?: string;
  effectiveDate?: string;
  expirationDate?: string;
  propertyAddress?: string;
  
  // Coverage Information
  coverageAmount?: string;
  deductible?: string;
  
  // Building Construction Details (often extracted from policies)
  buildingType?: string;
  constructionType?: string;
  roofType?: string;
  roofAge?: string;
  yearBuilt?: string;
  squareFootage?: string;
  numberStories?: string;
  
  // Additional Policy Details
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  
  // Address Components
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Property Details
  propertyType?: string;
  dwellingLimit?: string;
  personalPropertyLimit?: string;
  liabilityLimit?: string;
  medicalPaymentsLimit?: string;
  lossOfUseLimit?: string;
  
  // Mortgage Information
  mortgagee?: string;
  loanNumber?: string;
}

export interface MappedWizardData {
  // Client Details
  insuredDetails: {
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    phone?: string;
    email?: string;
  };
  
  mailingAddress: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  
  // Insurance Information
  insuranceCarrier: {
    name?: string;
  };
  
  policyDetails: {
    policyNumber?: string;
    effectiveDate?: string;
    expirationDate?: string;
  };
  
  // Coverage Information
  coverages: Array<{
    id: string;
    type: string;
    limit: number;
  }>;
  
  deductibles: Array<{
    id: string;
    type: string;
    amount: number;
    isPercentage: boolean;
  }>;
  
  // Building Construction (NEW SECTION)
  buildingConstruction: {
    buildingType?: string;
    constructionType?: string;
    roofType?: string;
    roofAge?: number;
    yearBuilt?: number;
    squareFootage?: number;
    numberStories?: number;
    foundationType?: string;
    exteriorWalls?: string;
    heatingType?: string;
    plumbingType?: string;
    electricalType?: string;
  };
  
  // Property Details
  propertyDetails: {
    propertyType?: string;
    propertyAddress?: string;
  };
  
  // Mortgage Information
  mortgageInformation: Array<{
    id: string;
    mortgagee?: string;
    loanNumber?: string;
    address?: string;
  }>;
}

export class PolicyDataMappingService {
  
  /**
   * Main method to map extracted PDF data to wizard form structure
   */
  static mapExtractedDataToWizard(extractedData: ExtractedPolicyData): MappedWizardData {
    console.log('🗺️ Mapping extracted PDF data to wizard form fields...');
    
    // Parse names (handle both individual and organization)
    const { firstName, lastName, organizationName } = this.parseInsuredName(extractedData.insuredName);
    
    // Parse address components
    const addressComponents = this.parseAddress(extractedData.propertyAddress || extractedData.mailingAddress);
    
    // Parse coverage amounts and create coverage objects
    const coverages = this.parseCoverages(extractedData);
    
    // Parse deductibles
    const deductibles = this.parseDeductibles(extractedData);
    
    // Parse building construction details
    const buildingConstruction = this.parseBuildingConstruction(extractedData);
    
    // Parse mortgage information
    const mortgageInformation = this.parseMortgageInformation(extractedData);
    
    const mappedData: MappedWizardData = {
      insuredDetails: {
        firstName,
        lastName,
        organizationName,
        phone: this.extractPhoneNumber(extractedData),
        email: this.extractEmail(extractedData),
      },
      
      mailingAddress: {
        address: addressComponents.address,
        city: addressComponents.city || extractedData.city,
        state: addressComponents.state || extractedData.state,
        zipCode: addressComponents.zipCode || extractedData.zipCode,
      },
      
      insuranceCarrier: {
        name: extractedData.insurerName,
      },
      
      policyDetails: {
        policyNumber: extractedData.policyNumber,
        effectiveDate: this.formatDate(extractedData.effectiveDate),
        expirationDate: this.formatDate(extractedData.expirationDate),
      },
      
      coverages,
      deductibles,
      buildingConstruction,
      
      propertyDetails: {
        propertyType: extractedData.propertyType || 'Residential',
        propertyAddress: extractedData.propertyAddress,
      },
      
      mortgageInformation,
    };
    
    console.log('✅ Data mapping completed:', mappedData);
    return mappedData;
  }
  
  /**
   * Parse insured name into components
   */
  private static parseInsuredName(insuredName?: string): { 
    firstName?: string; 
    lastName?: string; 
    organizationName?: string;
  } {
    if (!insuredName) return {};
    
    // Check if it's likely an organization (contains business keywords)
    const businessKeywords = ['LLC', 'INC', 'CORP', 'COMPANY', 'ASSOCIATION', 'TRUST', 'PARTNERSHIP'];
    const isOrganization = businessKeywords.some(keyword => 
      insuredName.toUpperCase().includes(keyword)
    );
    
    if (isOrganization) {
      return { organizationName: insuredName.trim() };
    }
    
    // Parse individual name
    const nameParts = insuredName.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      return {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ')
      };
    } else {
      return { firstName: nameParts[0] };
    }
  }
  
  /**
   * Parse address into components
   */
  private static parseAddress(address?: string): {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  } {
    if (!address) return {};
    
    // Try to extract ZIP code (last 5 digits)
    const zipMatch = address.match(/\b\d{5}(-\d{4})?\b$/);
    const zipCode = zipMatch ? zipMatch[0] : undefined;
    
    // Try to extract state (2 letter abbreviation before ZIP)
    const stateMatch = address.match(/\b[A-Z]{2}\b(?=\s+\d{5})/);
    const state = stateMatch ? stateMatch[0] : undefined;
    
    // Everything else is address and city
    let remainingAddress = address;
    if (zipCode) {
      remainingAddress = remainingAddress.replace(new RegExp(`\\s*${zipCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '');
    }
    if (state) {
      remainingAddress = remainingAddress.replace(new RegExp(`\\s*${state}$`), '');
    }
    
    // Split remaining into address and city (city is usually last part before state)
    const addressParts = remainingAddress.split(',').map(part => part.trim());
    
    if (addressParts.length >= 2) {
      const city = addressParts[addressParts.length - 1];
      const streetAddress = addressParts.slice(0, -1).join(', ');
      
      return {
        address: streetAddress,
        city,
        state,
        zipCode
      };
    }
    
    return {
      address: remainingAddress,
      state,
      zipCode
    };
  }
  
  /**
   * Parse coverage information from extracted data
   */
  private static parseCoverages(extractedData: ExtractedPolicyData): Array<{
    id: string;
    type: string;
    limit: number;
  }> {
    const coverages: Array<{ id: string; type: string; limit: number; }> = [];
    
    // Dwelling coverage
    if (extractedData.dwellingLimit || extractedData.coverageAmount) {
      coverages.push({
        id: `dwelling_${Date.now()}`,
        type: 'Dwelling',
        limit: this.parseAmount(extractedData.dwellingLimit || extractedData.coverageAmount || '0')
      });
    }
    
    // Personal Property coverage
    if (extractedData.personalPropertyLimit) {
      coverages.push({
        id: `personal_property_${Date.now() + 1}`,
        type: 'Personal Property',
        limit: this.parseAmount(extractedData.personalPropertyLimit)
      });
    }
    
    // Liability coverage
    if (extractedData.liabilityLimit) {
      coverages.push({
        id: `liability_${Date.now() + 2}`,
        type: 'Liability',
        limit: this.parseAmount(extractedData.liabilityLimit)
      });
    }
    
    // Medical Payments coverage
    if (extractedData.medicalPaymentsLimit) {
      coverages.push({
        id: `medical_${Date.now() + 3}`,
        type: 'Medical Payments',
        limit: this.parseAmount(extractedData.medicalPaymentsLimit)
      });
    }
    
    // Loss of Use coverage
    if (extractedData.lossOfUseLimit) {
      coverages.push({
        id: `loss_of_use_${Date.now() + 4}`,
        type: 'Loss of Use',
        limit: this.parseAmount(extractedData.lossOfUseLimit)
      });
    }
    
    return coverages;
  }
  
  /**
   * Parse deductible information
   */
  private static parseDeductibles(extractedData: ExtractedPolicyData): Array<{
    id: string;
    type: string;
    amount: number;
    isPercentage: boolean;
  }> {
    const deductibles: Array<{ id: string; type: string; amount: number; isPercentage: boolean; }> = [];
    
    if (extractedData.deductible) {
      // Check if deductible is percentage or dollar amount
      const deductibleStr = extractedData.deductible.toString();
      const isPercentage = deductibleStr.includes('%');
      
      let amount = 0;
      if (isPercentage) {
        // Extract percentage value
        const percentMatch = deductibleStr.match(/(\d+(?:\.\d+)?)\s*%/);
        amount = percentMatch ? parseFloat(percentMatch[1]) : 0;
      } else {
        // Extract dollar amount
        amount = this.parseAmount(deductibleStr);
      }
      
      deductibles.push({
        id: `deductible_${Date.now()}`,
        type: 'All Other Perils',
        amount,
        isPercentage
      });
    }
    
    return deductibles;
  }
  
  /**
   * Parse building construction details (NEW FEATURE)
   */
  private static parseBuildingConstruction(extractedData: ExtractedPolicyData) {
    return {
      buildingType: extractedData.buildingType,
      constructionType: extractedData.constructionType,
      roofType: extractedData.roofType,
      roofAge: extractedData.roofAge ? parseInt(extractedData.roofAge) : undefined,
      yearBuilt: extractedData.yearBuilt ? parseInt(extractedData.yearBuilt) : undefined,
      squareFootage: extractedData.squareFootage ? parseInt(extractedData.squareFootage) : undefined,
      numberStories: extractedData.numberStories ? parseInt(extractedData.numberStories) : undefined,
      // These might not be in PDF but can be filled by user
      foundationType: undefined,
      exteriorWalls: undefined,
      heatingType: undefined,
      plumbingType: undefined,
      electricalType: undefined,
    };
  }
  
  /**
   * Parse mortgage information
   */
  private static parseMortgageInformation(extractedData: ExtractedPolicyData): Array<{
    id: string;
    mortgagee?: string;
    loanNumber?: string;
    address?: string;
  }> {
    const mortgageInfo: Array<{ id: string; mortgagee?: string; loanNumber?: string; address?: string; }> = [];
    
    if (extractedData.mortgagee) {
      mortgageInfo.push({
        id: `mortgage_${Date.now()}`,
        mortgagee: extractedData.mortgagee,
        loanNumber: extractedData.loanNumber,
        address: undefined // Usually not in policy document
      });
    }
    
    return mortgageInfo;
  }
  
  /**
   * Extract phone number from various fields
   */
  private static extractPhoneNumber(extractedData: ExtractedPolicyData): string | undefined {
    return extractedData.agentPhone; // Could be enhanced to look in other fields
  }
  
  /**
   * Extract email from various fields
   */
  private static extractEmail(extractedData: ExtractedPolicyData): string | undefined {
    return extractedData.agentEmail; // Could be enhanced to look in other fields
  }
  
  /**
   * Parse monetary amount from string
   */
  private static parseAmount(amountStr: string): number {
    if (!amountStr) return 0;
    
    // Remove currency symbols and commas, extract numbers
    const numericStr = amountStr.replace(/[$,]/g, '');
    const amount = parseFloat(numericStr);
    return isNaN(amount) ? 0 : amount;
  }
  
  /**
   * Format date string to YYYY-MM-DD format
   */
  private static formatDate(dateStr?: string): string | undefined {
    if (!dateStr) return undefined;
    
    try {
      // Try various date formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return format(date, 'yyyy-MM-dd');
      }
    } catch (error) {
      console.warn('Failed to parse date:', dateStr);
    }
    
    return dateStr; // Return original if parsing fails
  }
  
  /**
   * Create a merged wizard data object with existing data and extracted data
   */
  static mergeWithExistingData(existingData: any, extractedData: ExtractedPolicyData): any {
    const mappedData = this.mapExtractedDataToWizard(extractedData);
    
    // Deep merge, preserving existing user-entered data while adding extracted data
    return {
      ...existingData,
      
      // Merge client details (only fill empty fields)
      insuredDetails: {
        ...existingData.insuredDetails,
        ...Object.fromEntries(
          Object.entries(mappedData.insuredDetails).filter(([_, value]) => value !== undefined)
        )
      },
      
      // Merge addresses
      mailingAddress: {
        ...existingData.mailingAddress,
        ...Object.fromEntries(
          Object.entries(mappedData.mailingAddress).filter(([_, value]) => value !== undefined)
        )
      },
      
      // Merge insurance information
      insuranceCarrier: {
        ...existingData.insuranceCarrier,
        ...Object.fromEntries(
          Object.entries(mappedData.insuranceCarrier).filter(([_, value]) => value !== undefined)
        )
      },
      
      policyDetails: {
        ...existingData.policyDetails,
        ...Object.fromEntries(
          Object.entries(mappedData.policyDetails).filter(([_, value]) => value !== undefined)
        )
      },
      
      // Add coverages (merge with existing)
      coverages: [
        ...(existingData.coverages || []),
        ...mappedData.coverages.filter(newCoverage => 
          !(existingData.coverages || []).some(existingCoverage => 
            existingCoverage.type === newCoverage.type
          )
        )
      ],
      
      // Add deductibles (merge with existing)
      deductibles: [
        ...(existingData.deductibles || []),
        ...mappedData.deductibles.filter(newDeductible => 
          !(existingData.deductibles || []).some(existingDeductible => 
            existingDeductible.type === newDeductible.type
          )
        )
      ],
      
      // Add building construction details (NEW)
      buildingConstruction: {
        ...existingData.buildingConstruction,
        ...Object.fromEntries(
          Object.entries(mappedData.buildingConstruction).filter(([_, value]) => value !== undefined)
        )
      },
      
      // Add property details
      propertyDetails: {
        ...existingData.propertyDetails,
        ...Object.fromEntries(
          Object.entries(mappedData.propertyDetails).filter(([_, value]) => value !== undefined)
        )
      },
      
      // Add mortgage information
      mortgageInformation: [
        ...(existingData.mortgageInformation || []),
        ...mappedData.mortgageInformation.filter(newMortgage => 
          !(existingData.mortgageInformation || []).some(existingMortgage => 
            existingMortgage.mortgagee === newMortgage.mortgagee
          )
        )
      ],
      
      // Flag that data has been populated from PDF
      dataPopulatedFromPDF: true,
      extractedDataSource: 'PDF Policy Document',
      extractedDataTimestamp: new Date().toISOString()
    };
  }
}