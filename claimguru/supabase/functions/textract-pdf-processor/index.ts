// AWS Textract PDF Processor Edge Function
// This function acts as a secure proxy to AWS Textract service

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

// Function to parse PDF content from AWS Textract response
function parseTextractResponse(textractResponse: any) {
  try {
    const blocks = textractResponse.Blocks || [];
    let extractedText = '';
    const formFields: Array<{key: string, value: string, confidence: number}> = [];
    const tables: any[] = [];
    
    // Process LINE blocks for full text
    blocks.filter(block => block.BlockType === 'LINE').forEach(line => {
      extractedText += line.Text + '\n';
    });
    
    // Process KEY_VALUE_SET blocks for form fields
    const keyMap = new Map();
    const valueMap = new Map();
    
    blocks.forEach(block => {
      if (block.BlockType === 'KEY_VALUE_SET') {
        if (block.EntityTypes?.includes('KEY')) {
          keyMap.set(block.Id, block);
        } else if (block.EntityTypes?.includes('VALUE')) {
          valueMap.set(block.Id, block);
        }
      }
    });
    
    // Connect keys with values
    keyMap.forEach(keyBlock => {
      const keyText = blocks
        .filter(b => b.Id && keyBlock.Relationships?.find(r => r.Type === 'CHILD' && r.Ids?.includes(b.Id)))
        .map(b => b.Text)
        .join(' ');
      
      const valueRelationship = keyBlock.Relationships?.find(r => r.Type === 'VALUE');
      if (valueRelationship && valueRelationship.Ids?.length) {
        const valueBlock = valueMap.get(valueRelationship.Ids[0]);
        if (valueBlock) {
          const valueText = blocks
            .filter(b => b.Id && valueBlock.Relationships?.find(r => r.Type === 'CHILD' && r.Ids?.includes(b.Id)))
            .map(b => b.Text)
            .join(' ');
          
          formFields.push({
            key: keyText,
            value: valueText,
            confidence: Math.min(keyBlock.Confidence || 0, valueBlock.Confidence || 0) / 100
          });
        }
      }
    });
    
    // Extract insurance data from form fields and text
    const extractedPolicyData = extractInsuranceData(extractedText, formFields);
    
    return {
      extractedText,
      formFields,
      tables,
      extractedPolicyData
    };
  } catch (error) {
    console.error('Error parsing Textract response:', error);
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
    const { pdfBase64, fileName, organizationId, awsCredentials } = requestData;
    
    if (!pdfBase64) {
      throw new Error('Missing PDF data');
    }
    
    if (!organizationId) {
      throw new Error('Missing organization ID');
    }
    
    if (!awsCredentials || !awsCredentials.accessKey || !awsCredentials.secretKey || !awsCredentials.region) {
      throw new Error('Missing AWS credentials');
    }
    
    // Set up AWS Textract client using AWS SDK in Deno
    const textractEndpoint = `https://textract.${awsCredentials.region}.amazonaws.com`;
    const service = 'textract';
    const host = `textract.${awsCredentials.region}.amazonaws.com`;
    const contentType = 'application/x-amz-json-1.1';
    const amzTarget = 'Textract.AnalyzeDocument';
    
    // Prepare the request payload for Textract
    const payload = {
      Document: {
        Bytes: pdfBase64
      },
      FeatureTypes: ['FORMS', 'TABLES', 'QUERIES'],
      QueriesConfig: {
        Queries: [
          { Text: 'What is the policy number?' },
          { Text: 'Who is the insured?' },
          { Text: 'What is the effective date?' },
          { Text: 'What is the expiration date?' },
          { Text: 'What is the insurance company name?' },
          { Text: 'What is the property address?' },
          { Text: 'What is the coverage amount?' },
          { Text: 'What is the deductible?' }
        ]
      }
    };
    
    // Create AWS signature v4
    const method = 'POST';
    const region = awsCredentials.region;
    const accessKey = awsCredentials.accessKey;
    const secretKey = awsCredentials.secretKey;
    
    const now = new Date();
    const amzdate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzdate.substring(0, 8);
    
    // Create canonical request
    const canonicalUri = '/';
    const canonicalQueryString = '';
    const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-date:${amzdate}\nx-amz-target:${amzTarget}\n`;
    const signedHeaders = 'content-type;host;x-amz-date;x-amz-target';
    
    const payloadJson = JSON.stringify(payload);
    const payloadHash = await crypto.subtle.digest(
      'SHA-256', 
      new TextEncoder().encode(payloadJson)
    ).then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));
    
    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    
    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    
    const canonicalRequestHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(canonicalRequest)
    ).then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));
    
    const stringToSign = `${algorithm}\n${amzdate}\n${credentialScope}\n${canonicalRequestHash}`;
    
    // Calculate signature
    async function getSignatureKey(key, dateStamp, regionName, serviceName) {
      const kDate = await crypto.subtle.sign(
        'HMAC',
        await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(`AWS4${key}`),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        ),
        new TextEncoder().encode(dateStamp)
      );
      
      const kRegion = await crypto.subtle.sign(
        'HMAC',
        await crypto.subtle.importKey(
          'raw',
          new Uint8Array(kDate),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        ),
        new TextEncoder().encode(regionName)
      );
      
      const kService = await crypto.subtle.sign(
        'HMAC',
        await crypto.subtle.importKey(
          'raw',
          new Uint8Array(kRegion),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        ),
        new TextEncoder().encode(serviceName)
      );
      
      const kSigning = await crypto.subtle.sign(
        'HMAC',
        await crypto.subtle.importKey(
          'raw',
          new Uint8Array(kService),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        ),
        new TextEncoder().encode('aws4_request')
      );
      
      return kSigning;
    }
    
    const signingKey = await getSignatureKey(secretKey, dateStamp, region, service);
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        new Uint8Array(signingKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      new TextEncoder().encode(stringToSign)
    ).then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));
    
    // Create authorization header
    const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    
    // Send request to AWS Textract
    const response = await fetch(textractEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'X-Amz-Target': amzTarget,
        'X-Amz-Date': amzdate,
        'Authorization': authorizationHeader
      },
      body: payloadJson
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AWS Textract API error: ${response.status} - ${errorText}`);
    }
    
    const textractResponse = await response.json();
    
    // Parse the Textract response
    const {
      extractedText,
      formFields,
      tables,
      extractedPolicyData
    } = parseTextractResponse(textractResponse);
    
    // Calculate cost
    // Textract pricing: $0.05 per page for forms
    const pageCount = textractResponse.DocumentMetadata?.Pages || 1;
    const cost = pageCount * 0.05;
    
    // Calculate confidence
    const confidence = formFields.length > 0 
      ? formFields.reduce((sum, field) => sum + field.confidence, 0) / formFields.length
      : 0.5;
    
    // Construct response
    const result = {
      documentType: 'insurance_policy',
      pageCount,
      extractedText,
      formFields,
      tables,
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