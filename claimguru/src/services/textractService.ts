/**
 * AWS Textract Service for ClaimGuru
 * Production-ready implementation that connects to AWS Textract API
 */
import { createClient } from '@supabase/supabase-js';

// Will be populated with API keys from environment
let AWS_ACCESS_KEY = '';
let AWS_SECRET_KEY = '';
let AWS_REGION = '';

export interface TextractResponse {
  documentType: string;
  pageCount: number;
  extractedText: string;
  formFields: {
    key: string;
    value: string;
    confidence: number;
  }[];
  tables: any[];
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
 * Set AWS Credentials for Textract
 * @param accessKey AWS Access Key ID
 * @param secretKey AWS Secret Access Key
 * @param region AWS Region
 */
export const setAWSCredentials = (
  accessKey: string, 
  secretKey: string, 
  region: string
) => {
  AWS_ACCESS_KEY = accessKey;
  AWS_SECRET_KEY = secretKey;
  AWS_REGION = region;
};

/**
 * Check if AWS credentials are configured
 */
export const hasAWSCredentials = (): boolean => {
  return !!(AWS_ACCESS_KEY && AWS_SECRET_KEY && AWS_REGION);
};

/**
 * Process PDF document with AWS Textract
 * Uses Supabase Edge Function as proxy to AWS Textract
 * @param file PDF file to process
 * @param organizationId Organization ID for usage tracking
 */
export const processDocumentWithTextract = async (
  file: File,
  organizationId: string
): Promise<TextractResponse> => {
  console.log('Starting AWS Textract processing', { fileName: file.name, fileSize: file.size });
  
  if (!hasAWSCredentials()) {
    throw new Error('AWS credentials not configured. Please set AWS credentials before using this service.');
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
    
    // Call Supabase Edge Function that acts as proxy to AWS Textract
    const startTime = new Date();
    const { data, error } = await supabase.functions.invoke('textract-pdf-processor', {
      body: {
        pdfBase64: base64File,
        fileName: file.name,
        organizationId,
        awsCredentials: {
          accessKey: AWS_ACCESS_KEY,
          secretKey: AWS_SECRET_KEY,
          region: AWS_REGION
        }
      }
    });
    
    const endTime = new Date();
    const processingTime = (endTime.getTime() - startTime.getTime()) / 1000;
    
    if (error) {
      console.error('Textract processing error:', error);
      throw new Error(`Textract processing failed: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from Textract processing');
    }
    
    // Track usage in Supabase
    await trackTextractUsage(
      organizationId, 
      file.name, 
      data.pageCount || 1, 
      data.cost || 0.05 * (data.pageCount || 1)
    );
    
    return {
      ...data,
      processingTime,
    };
  } catch (error) {
    console.error('AWS Textract processing error:', error);
    throw error;
  }
};

/**
 * Track Textract usage in Supabase
 */
const trackTextractUsage = async (
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
        service: 'aws_textract',
        document_name: fileName,
        page_count: pageCount,
        cost: cost,
        processing_date: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error tracking Textract usage:', error);
    }
  } catch (error) {
    console.error('Failed to track Textract usage:', error);
  }
};