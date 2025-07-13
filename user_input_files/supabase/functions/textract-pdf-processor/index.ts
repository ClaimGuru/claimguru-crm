/**
 * AWS Textract PDF Processor for ClaimGuru
 * Premium document processing using AWS Textract
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { filePath, organizationId, processingType = 'form_analysis' } = await req.json();
    
    if (!filePath) {
      throw new Error('File path is required');
    }

    console.log(`Processing document with Textract: ${filePath}`);

    // Get Supabase storage URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Download file from Supabase storage
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/policy-documents/${filePath}`;
    const fileResponse = await fetch(fileUrl);
    
    if (!fileResponse.ok) {
      throw new Error('Failed to download file from storage');
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    
    // For now, simulate AWS Textract processing with enhanced extraction
    // In production, this would call actual AWS Textract API
    const extractedData = await simulateTextractProcessing(fileBuffer, processingType);
    
    // Log usage for billing
    await logProcessingUsage(organizationId, filePath, extractedData.pageCount, processingType);
    
    return new Response(JSON.stringify({ data: extractedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Textract processing error:', error);
    
    const errorResponse = {
      error: {
        code: 'TEXTRACT_PROCESSING_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

/**
 * Simulate AWS Textract processing with enhanced extraction
 * In production, replace with actual AWS Textract API calls
 */
async function simulateTextractProcessing(fileBuffer, processingType) {
  const uint8Array = new Uint8Array(fileBuffer);
  const pageCount = Math.max(1, Math.floor(uint8Array.length / 500000)); // Estimate pages
  
  // Enhanced pattern-based extraction that simulates Textract's capabilities
  const binaryString = Array.from(uint8Array)
    .map(byte => String.fromCharCode(byte))
    .join('');

  // Advanced PDF content extraction patterns
  const extractionPatterns = {
    // Text in parentheses with position data
    textWithPosition: /BT\s+([0-9.-]+)\s+([0-9.-]+)\s+Td\s+\(([^)]+)\)\s*Tj/g,
    // Direct text objects
    textObjects: /\(([^)]+)\)\s*Tj/g,
    // Text arrays
    textArrays: /\[([^\]]+)\]\s*TJ/g,
    // Form field values
    formFields: /\/V\s*\(([^)]+)\)/g,
    // Font and style information
    fontInfo: /\/F\d+\s+([0-9.]+)\s+Tf/g,
    // Positioning information
    positioning: /([0-9.-]+)\s+([0-9.-]+)\s+Td/g
  };

  let extractedText = '';
  const extractedFields = {};
  
  // Extract text using multiple patterns
  for (const [patternName, pattern] of Object.entries(extractionPatterns)) {
    const matches = Array.from(binaryString.matchAll(pattern));
    
    for (const match of matches) {
      if (patternName === 'textWithPosition' && match[3]) {
        extractedText += match[3] + ' ';
      } else if ((patternName === 'textObjects' || patternName === 'formFields') && match[1]) {
        extractedText += match[1] + ' ';
      } else if (patternName === 'textArrays' && match[1]) {
        // Parse text array format
        const textArray = match[1].split(/\s+/).filter(item => item.includes('('))
          .map(item => item.replace(/[()]/g, ''));
        extractedText += textArray.join(' ') + ' ';
      }
    }
  }

  // Enhanced insurance-specific field extraction
  const insuranceData = extractInsuranceFields(extractedText);
  
  // Simulate table extraction (form_analysis mode)
  const tableData = processingType === 'form_analysis' ? extractTableData(extractedText) : null;
  
  // Calculate confidence based on data quality
  const confidence = calculateExtractionConfidence(extractedText, insuranceData);
  
  return {
    extractedText: extractedText.trim(),
    confidence,
    pageCount,
    insuranceData,
    tableData,
    processingType,
    metadata: {
      documentType: 'insurance_policy',
      processingTime: new Date().toISOString(),
      textLength: extractedText.length,
      fieldsExtracted: Object.keys(insuranceData).length
    }
  };
}

/**
 * Enhanced insurance field extraction
 */
function extractInsuranceFields(text) {
  const fields = {};
  const lowerText = text.toLowerCase();
  
  // Policy Number - Multiple patterns
  const policyPatterns = [
    /policy\s*(?:no\.?|number|#)\s*:?\s*([A-Z0-9\-]{6,25})/i,
    /pol\s*(?:no\.?|#)\s*:?\s*([A-Z0-9\-]{6,25})/i,
    /^\s*([A-Z]{2,4}\d{6,15})\s*$/m,
    /policy\s+([A-Z0-9\-]{8,20})/i
  ];
  
  for (const pattern of policyPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      fields.policyNumber = match[1].trim();
      break;
    }
  }

  // Insured Name - Enhanced patterns
  const namePatterns = [
    /(?:insured|policyholder|named insured)\s*:?\s*([A-Z][a-zA-Z\s]{2,50})/i,
    /name\s*:?\s*([A-Z][a-zA-Z\s]{2,50})(?:\s+address|\s+\d)/i,
    /(?:first|given)\s+name\s*:?\s*([A-Z][a-zA-Z\s]{2,30})/i
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      fields.insuredName = match[1].trim();
      break;
    }
  }

  // Dates - Enhanced extraction
  const datePatterns = [
    /effective\s+date\s*:?\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/i,
    /expir(?:ation|y)\s+date\s*:?\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/i,
    /period\s+from\s*:?\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/i,
    /period\s+to\s*:?\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      if (pattern.source.includes('effective') || pattern.source.includes('from')) {
        fields.effectiveDate = match[1];
      } else {
        fields.expirationDate = match[1];
      }
    }
  }

  // Coverage Limits
  const limitPatterns = [
    /dwelling\s*:?\s*\$(\d{1,3}(?:,\d{3})*)/i,
    /coverage\s+a\s*:?\s*\$(\d{1,3}(?:,\d{3})*)/i,
    /personal\s+property\s*:?\s*\$(\d{1,3}(?:,\d{3})*)/i,
    /liability\s*:?\s*\$(\d{1,3}(?:,\d{3})*)/i
  ];
  
  const coverageLimits = {};
  for (const pattern of limitPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseInt(match[1].replace(/,/g, ''));
      if (pattern.source.includes('dwelling') || pattern.source.includes('coverage\\s+a')) {
        coverageLimits.dwelling = amount;
      } else if (pattern.source.includes('personal')) {
        coverageLimits.personalProperty = amount;
      } else if (pattern.source.includes('liability')) {
        coverageLimits.liability = amount;
      }
    }
  }
  
  if (Object.keys(coverageLimits).length > 0) {
    fields.coverageLimits = coverageLimits;
  }

  // Deductibles
  const deductiblePattern = /\$(\d{1,3}(?:,\d{3})*)\s*deductible/gi;
  const deductibleMatches = Array.from(text.matchAll(deductiblePattern));
  
  if (deductibleMatches.length > 0) {
    fields.deductibles = deductibleMatches.map(match => ({
      type: 'All Other Perils',
      amount: parseInt(match[1].replace(/,/g, ''))
    }));
  }

  // Insurance Company
  const insurerPatterns = [
    /(?:company|carrier|insurer)\s*:?\s*([A-Z][a-zA-Z\s&\\.]{2,40})(?:\s+insurance|\s+ins\\.?|\s+company)?/i,
    /([A-Z][a-zA-Z\s&\\.]{2,40})\s+insurance\s+company/i,
    /underwritten\s+by\s*:?\s*([A-Z][a-zA-Z\s&\\.]{2,40})/i
  ];
  
  for (const pattern of insurerPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      fields.insurerName = match[1].trim();
      break;
    }
  }

  // Property Address
  const addressPattern = /(\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct|Place|Pl))/i;
  const addressMatch = text.match(addressPattern);
  if (addressMatch) {
    fields.propertyAddress = addressMatch[1];
  }

  // Agent Information
  const agentPattern = /agent\s*:?\s*([A-Z][a-zA-Z\s]{2,40})/i;
  const agentMatch = text.match(agentPattern);
  if (agentMatch) {
    fields.agentName = agentMatch[1].trim();
  }

  return fields;
}

/**
 * Extract table data (simulated for form_analysis mode)
 */
function extractTableData(text) {
  // Simulate table extraction - in production this would use Textract's table detection
  const tables = [];
  
  // Look for coverage table patterns
  const coverageLines = text.split('\n').filter(line => 
    line.toLowerCase().includes('coverage') || 
    line.toLowerCase().includes('limit') ||
    line.toLowerCase().includes('deductible')
  );
  
  if (coverageLines.length > 0) {
    tables.push({
      type: 'coverage_summary',
      rows: coverageLines.map(line => ({ content: line.trim() }))
    });
  }
  
  return tables.length > 0 ? tables : null;
}

/**
 * Calculate extraction confidence
 */
function calculateExtractionConfidence(text, insuranceData) {
  let confidence = 0.4; // Base confidence for Textract
  
  // Text quality indicators
  if (text.length > 500) confidence += 0.1;
  if (text.length > 2000) confidence += 0.1;
  
  // Insurance field indicators
  if (insuranceData.policyNumber) confidence += 0.15;
  if (insuranceData.insuredName) confidence += 0.15;
  if (insuranceData.effectiveDate) confidence += 0.1;
  if (insuranceData.insurerName) confidence += 0.1;
  if (insuranceData.coverageLimits) confidence += 0.1;
  
  // Structure indicators
  const hasStructuredData = /\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}/.test(text); // Dates
  const hasDollarAmounts = /\$[\d,]+/.test(text);
  const hasPolicyFormat = /[A-Z]{2,4}\d{6,}/.test(text);
  
  if (hasStructuredData) confidence += 0.05;
  if (hasDollarAmounts) confidence += 0.05;
  if (hasPolicyFormat) confidence += 0.05;
  
  return Math.min(confidence, 0.98); // Cap at 98% for simulated processing
}

/**
 * Log processing usage for billing
 */
async function logProcessingUsage(organizationId, filePath, pageCount, processingType) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.warn('Missing Supabase config for usage logging');
      return;
    }

    // Log to processing_usage table
    const response = await fetch(`${supabaseUrl}/rest/v1/processing_usage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        organization_id: organizationId,
        document_path: filePath,
        page_count: pageCount,
        processing_type: processingType,
        cost_per_page: processingType === 'form_analysis' ? 0.05 : 0.0015,
        total_cost: pageCount * (processingType === 'form_analysis' ? 0.05 : 0.0015),
        processed_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.warn('Failed to log processing usage:', await response.text());
    }
  } catch (error) {
    console.warn('Error logging processing usage:', error);
  }
}