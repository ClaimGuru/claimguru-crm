// Services Index - ClaimGuru
// Consolidated exports without duplicates

// Extraction Services
export { HybridPDFExtractionService } from './hybridPdfExtractionService';
export { default as adaptiveLearningService } from './adaptiveLearningService';
export { WizardValidationService } from './wizardValidationService';
export { PolicyDataMappingService } from './policyDataMappingService';

// AI Services - New OpenAI Implementation
export { documentAnalysisService } from './ai/documentAnalysisService';
export { claimProcessingService } from './ai/claimProcessingService';
export { recommendationService } from './ai/recommendationService';

// Legacy AI services - now using the new implementations
export { default as claimWizardAI } from './claimWizardAI';
export { IdentifierExtractionService } from './identifierExtractionService';

// Google Places Services
export { hasGooglePlacesApiKey } from './googlePlacesService';
export { validateAddress } from './googlePlacesService';
export { geocodeAddress } from './googlePlacesService';
export { getAddressSuggestions } from './googlePlacesService';

// Document Services
export { default as documentClassificationService } from './documentClassificationService';
export { EnhancedClaimWizardAI } from './enhancedClaimWizardAI';
export { default as multiDocumentExtractionService } from './multiDocumentExtractionService';
export { IntelligentExtractionService } from './intelligentExtractionService';
export { documentUploadService } from './documentUploadService';
export { pdfExtractionService } from './pdfExtractionService';

// Wizard Services
export { default as intelligentWizardService } from './intelligentWizardService';
export { EnhancedPDFExtractionService } from './enhancedPdfExtractionService';

// Core Services
export { default as configService } from './configService';
export { default as claimService } from './claimService';
export { default as customFieldService } from './customFieldService';

// Schema Services
export { clientDetailsSchema } from './sharedFieldSchemas';
export { insuranceDetailsSchema } from './sharedFieldSchemas';
export { claimInformationSchema } from './sharedFieldSchemas';
export { propertyDetailsSchema } from './sharedFieldSchemas';
export { allFieldSchemas } from './sharedFieldSchemas';
export { getSchemaById } from './sharedFieldSchemas';
export { getFieldById } from './sharedFieldSchemas';
export { validateDataAgainstSchema } from './sharedFieldSchemas';
export { getRequiredFields } from './sharedFieldSchemas';

// Additional Services
export { WizardProgressService } from './wizardProgressService';
export { emailAutomationService } from './emailAutomationService';
export { EnhancedHybridPdfExtractionService } from './enhancedHybridPdfExtractionService';
export { CarrierLearningService } from './carrierLearningService';
export { ConfirmedFieldsService } from './confirmedFieldsService';
