/**
 * Google Cloud Vision API Service for ClaimGuru
 * Production-ready implementation for document OCR and analysis
 */

// Will be populated with API key from environment
let GOOGLE_VISION_API_KEY = '';
let GOOGLE_PROJECT_ID = '';

export interface VisionAPIResponse {
  documentType: string;
  pageCount: number;
  extractedText: string;
  formFields: {
    key: string;
    value: string;
    confidence: number;
  }[];
  extractedPolicyData: {
    policyNumber?: string;
    insuredName?: string;
    effectiveDate?: string;
    expirationDate?: string;
    insurerName?: string;
    propertyAddress?: string;
    coverageAmount?: string;
    deductible?: string;
    agentName?: string;
    agentPhone?: string;
    agentEmail?: string;
    mortgagee?: string;
    loanNumber?: string;
  };
  processingTime: number;
  cost: number;
  confidence: number;
}

/**
 * Set Google Cloud Vision API credentials
 * @param apiKey Google Cloud API Key
 * @param projectId Google Cloud Project ID
 */
export const setGoogleVisionCredentials = (
  apiKey: string, 
  projectId: string
) => {
  GOOGLE_VISION_API_KEY = apiKey;
  GOOGLE_PROJECT_ID = projectId;
};

/**
 * Check if Google Vision API credentials are configured
 */
export const hasGoogleVisionCredentials = (): boolean => {
  return !!(GOOGLE_VISION_API_KEY && GOOGLE_PROJECT_ID);
};

/**
 * Process PDF document with Google Cloud Vision API
 * Uses Supabase Edge Function as proxy to Google Cloud
 * @param file PDF file to process
 * @param organizationId Organization ID for usage tracking
 */
export const processDocumentWithVision = async (
  file: File,
  organizationId: string
): Promise<VisionAPIResponse> => {
  console.log('Starting Google Vision processing', { fileName: file.name, fileSize: file.size });
  
  if (!hasGoogleVisionCredentials()) {
    throw new Error('Google Vision credentials not configured. Please set credentials before using this service.');
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64File = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte), ''
      )
    );
    
    // Call Supabase Edge Function that acts as proxy to Google Cloud Vision
    const startTime = new Date();
    const { data, error } = await supabase.functions.invoke('google-vision-processor', {
      body: {
        pdfBase64: base64File,
        fileName: file.name,
        organizationId,
        googleCredentials: {
          apiKey: GOOGLE_VISION_API_KEY,
          projectId: GOOGLE_PROJECT_ID
        }
      }
    });
    
    const endTime = new Date();
    const processingTime = (endTime.getTime() - startTime.getTime()) / 1000;
    
    if (error) {
      console.error('Google Vision processing error:', error);
      throw new Error(`Google Vision processing failed: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from Google Vision processing');
    }
    
    // Track usage in Supabase
    await trackVisionUsage(
      organizationId, 
      file.name, 
      data.pageCount || 1, 
      data.cost || 0.06 * (data.pageCount || 1)
    );
    
    return {
      ...data,
      processingTime,
    };
  } catch (error) {
    console.error('Google Vision processing error:', error);
    throw error;
  }
};

/**
 * Track Google Vision usage in Supabase
 */
const trackVisionUsage = async (
  organizationId: string,
  fileName: string,
  pageCount: number,
  cost: number
) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing, cannot track usage');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Insert usage record
    const { error } = await supabase
      .from('processing_usage')
      .insert({
        organization_id: organizationId,
        service: 'google_vision',
        document_name: fileName,
        page_count: pageCount,
        cost: cost,
        processing_date: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error tracking Google Vision usage:', error);
    }
  } catch (error) {
    console.error('Failed to track Google Vision usage:', error);
  }
};