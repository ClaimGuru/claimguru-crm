// Google Cloud Vision API Processor Edge Function
// This function acts as a secure proxy to Google Cloud Vision API

// Deno runtime supports Web API like Fetch and crypto out of the box
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Handle preflight OPTIONS request
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  return null;
}

// Function to parse Vision API response
function parseVisionResponse(visionResponse: any) {
  try {
    const responses = visionResponse.responses || [];
    let extractedText = '';
    const formFields: Array<{key: string, value: string, confidence: number}> = [];
    
    // Process text annotations for full text
    for (const response of responses) {
      if (response.fullTextAnnotation) {
        extractedText += response.fullTextAnnotation.text + '\n';
      }
      
      // Process form fields if present
      if (response.textAnnotations && response.textAnnotations.length > 0) {
        const blocks = response.textAnnotations.slice(1);
        
        // Attempt to identify key-value pairs
        const possibleKeyValuePairs = [];
        
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          if (block.description && block.description.includes(':')) {
            const parts = block.description.split(':');
            if (parts.length === 2) {
              possibleKeyValuePairs.push({
                key: parts[0].trim(),
                value: parts[1].trim(),
                confidence: block.confidence || 0.7
              });
            }
          } else if (block.description && i < blocks.length - 1) {
            // Check for key-value pattern without colon
            const nextBlock = blocks[i + 1];
            if (/^[A-Za-z\s]+$/.test(block.description) && 
                /[0-9]/.test(nextBlock.description)) {
              possibleKeyValuePairs.push({
                key: block.description.trim(),
                value: nextBlock.description.trim(),
                confidence: (block.confidence || 0.7) * 0.8 // Lower confidence for inferred pairs
              });
            }
          }
        }
        
        formFields.push(...possibleKeyValuePairs);
      }
    }
    
    // Extract insurance data from text
    const extractedPolicyData = extractInsuranceData(extractedText, formFields);
    
    return {
      extractedText,
      formFields,
      extractedPolicyData
    };
  } catch (error) {
    console.error('Error parsing Vision API response:', error);
    throw error;
  }
}

// Function to extract insurance-specific data
function extractInsuranceData(text: string, formFields: any[]) {
  const policyData: Record<string, string> = {};
  
  // Extract from form fields first (higher confidence)
  const fieldMap = new Map(formFields.map(field => [field.key.toLowerCase().replace(/[^a-z0-9]/g, ''), field.value]));
  
  // Policy number patterns
  if (fieldMap.has('policynumber') || fieldMap.has('policyno')) {
    policyData.policyNumber = fieldMap.get('policynumber') || fieldMap.get('policyno') || '';
  } else {
    const policyMatch = text.match(/policy\s*(?:number|#|no|num)?\s*[:.]?\s*([A-Z0-9\-]{5,20})/i);
    if (policyMatch) policyData.policyNumber = policyMatch[1];
  }
  
  // Insured name patterns
  if (fieldMap.has('insured') || fieldMap.has('insuredname') || fieldMap.has('namedinsured')) {
    policyData.insuredName = fieldMap.get('insured') || fieldMap.get('insuredname') || fieldMap.get('namedinsured') || '';
  } else {
    const insuredMatch = text.match(/(?:named\s+)?insured\s*[:.]?\s*([A-Z][A-Za-z\s,&.'-]{2,40})/i);
    if (insuredMatch) policyData.insuredName = insuredMatch[1].trim();
  }
  
  // Effective date
  if (fieldMap.has('effectivedate') || fieldMap.has('policyperiod') || fieldMap.has('policyfrom')) {
    policyData.effectiveDate = fieldMap.get('effectivedate') || fieldMap.get('policyperiod') || fieldMap.get('policyfrom') || '';
  } else {
    const effectiveMatch = text.match(/(?:effective|policy)\s*(?:date|period|from)?\s*[:.]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i);
    if (effectiveMatch) policyData.effectiveDate = effectiveMatch[1];
  }
  
  // Expiration date
  if (fieldMap.has('expirationdate') || fieldMap.has('policyexpires') || fieldMap.has('policyto')) {
    policyData.expirationDate = fieldMap.get('expirationdate') || fieldMap.get('policyexpires') || fieldMap.get('policyto') || '';
  } else {
    const expirationMatch = text.match(/(?:expiration|expires|to)\s*(?:date)?\s*[:.]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i);
    if (expirationMatch) policyData.expirationDate = expirationMatch[1];
  }
  
  // Insurer name
  if (fieldMap.has('insurer') || fieldMap.has('insurancecompany') || fieldMap.has('carrier')) {
    policyData.insurerName = fieldMap.get('insurer') || fieldMap.get('insurancecompany') || fieldMap.get('carrier') || '';
  } else {
    const insurerMatch = text.match(/(?:insurance\s+company|insurer|carrier)\s*[:.]?\s*([A-Z][A-Za-z\s,.&'-]{2,60})/i);
    if (insurerMatch) policyData.insurerName = insurerMatch[1].trim();
  }
  
  // Property address
  if (fieldMap.has('propertyaddress') || fieldMap.has('insuredlocation') || fieldMap.has('location')) {
    policyData.propertyAddress = fieldMap.get('propertyaddress') || fieldMap.get('insuredlocation') || fieldMap.get('location') || '';
  } else {
    const addressMatch = text.match(/(?:property\s+address|insured\s+location|location\s+of\s+risk)\s*[:.]?\s*([0-9][A-Za-z0-9\s,.'-]{5,100})/i);
    if (addressMatch) policyData.propertyAddress = addressMatch[1].trim();
  }
  
  // Coverage amount
  if (fieldMap.has('coverageamount') || fieldMap.has('dwelling') || fieldMap.has('coveragea')) {
    policyData.coverageAmount = fieldMap.get('coverageamount') || fieldMap.get('dwelling') || fieldMap.get('coveragea') || '';
  } else {
    const coverageMatch = text.match(/(?:coverage\s+a|dwelling|building)\s*(?:limit|coverage|amount)?\s*[:.]?\s*\$?\s*([0-9,.]{4,15})/i);
    if (coverageMatch) policyData.coverageAmount = '$' + coverageMatch[1].replace(/[^\d.]/g, '');
  }
  
  // Deductible
  if (fieldMap.has('deductible') || fieldMap.has('ded')) {
    policyData.deductible = fieldMap.get('deductible') || fieldMap.get('ded') || '';
  } else {
    const deductibleMatch = text.match(/(?:deductible|ded)\s*[:.]?\s*\$?\s*([0-9,.]{3,10})/i);
    if (deductibleMatch) policyData.deductible = '$' + deductibleMatch[1].replace(/[^\d.]/g, '');
  }
  
  return policyData;
}

// Main handler function
serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }
    
    // Parse request body
    const requestData = await req.json();
    const { pdfBase64, fileName, organizationId, googleCredentials } = requestData;
    
    if (!pdfBase64) {
      throw new Error('Missing PDF data');
    }
    
    if (!organizationId) {
      throw new Error('Missing organization ID');
    }
    
    if (!googleCredentials || !googleCredentials.apiKey || !googleCredentials.projectId) {
      throw new Error('Missing Google credentials');
    }
    
    // Google Cloud Vision API
    const apiKey = googleCredentials.apiKey;
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    
    // Prepare the request payload
    const payload = {
      requests: [
        {
          image: {
            content: pdfBase64
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 100
            }
          ]
        }
      ]
    };
    
    // Send request to Google Cloud Vision API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Vision API error: ${response.status} - ${errorText}`);
    }
    
    const visionResponse = await response.json();
    
    // Parse the Vision API response
    const {
      extractedText,
      formFields,
      extractedPolicyData
    } = parseVisionResponse(visionResponse);
    
    // Estimate page count based on text length
    const estimatedPageCount = Math.max(1, Math.ceil(extractedText.length / 3000));
    
    // Calculate cost
    // Google Vision pricing: $0.06 per page for text detection
    const cost = estimatedPageCount * 0.06;
    
    // Calculate confidence
    const confidence = formFields.length > 0 
      ? formFields.reduce((sum, field) => sum + field.confidence, 0) / formFields.length
      : 0.5;
    
    // Construct response
    const result = {
      documentType: 'insurance_policy',
      pageCount: estimatedPageCount,
      extractedText,
      formFields,
      extractedPolicyData,
      cost,
      confidence
    };
    
    // Return success response
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        status: 'error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});