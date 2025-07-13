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
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string || 'dec_page';
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing ${documentType}: ${file.name} (${file.size} bytes)`);

    // Extract text from the document
    let extractedText = '';
    
    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(file);
    } else if (file.type.startsWith('image/')) {
      extractedText = await extractTextFromImage(file);
    } else {
      throw new Error('Unsupported file type');
    }

    console.log(`Extracted text length: ${extractedText.length}`);

    // Parse insurance fields from extracted text
    const policyData = parseInsuranceFields(extractedText, documentType);
    
    // Validate extracted data
    const validation = validateExtractedData(policyData);
    
    // Create result
    const result = {
      policyData,
      validation,
      autoPopulateFields: createAutoPopulateFields(policyData),
      extractedText: extractedText.substring(0, 500), // First 500 chars for debugging
      processingDetails: {
        documentType,
        fileName: file.name,
        fileSize: file.size,
        textLength: extractedText.length,
        processingTime: new Date().toISOString()
      }
    };

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Document processing error:', error);
    const errorResponse = {
      error: {
        code: 'DOCUMENT_PROCESSING_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Extract text from PDF using built-in text extraction
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const binaryString = Array.from(uint8Array)
    .map(byte => String.fromCharCode(byte))
    .join('');

  // Enhanced PDF text extraction with multiple patterns
  const patterns = [
    // Text in parentheses (common PDF format)
    /\(([^)]+)\)/g,
    // Text with Tj operators
    /\(([^)]+)\)\s*Tj/g,
    // Text between brackets
    /\[([^\]]+)\]/g,
    // Direct text patterns
    /\b[A-Z][A-Za-z\s]{2,50}\b/g,
    // Numbers and dates
    /\b\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}\b/g,
    // Policy numbers
    /\b[A-Z]{2,4}\d{6,12}\b/g,
    // Dollar amounts
    /\$[\d,]+\.?\d*/g
  ];

  let extractedTexts = [];
  
  for (const pattern of patterns) {
    const matches = binaryString.match(pattern) || [];
    extractedTexts.push(...matches);
  }

  // Clean and deduplicate
  const cleanedTexts = extractedTexts
    .map(text => text.replace(/[()\[\]]/g, '').trim())
    .filter(text => text.length > 1 && /[A-Za-z0-9]/.test(text))
    .filter((text, index, arr) => arr.indexOf(text) === index);

  return cleanedTexts.join(' ');
}

// Extract text from image using OCR simulation
async function extractTextFromImage(file: File): Promise<string> {
  // For now, return a placeholder. In production, this would call an OCR service
  return `OCR extracted text from ${file.name}. This would contain actual OCR results in production.`;
}

// Parse insurance fields from extracted text
function parseInsuranceFields(text: string, documentType: string): any {
  const policyData: any = {};
  const lowerText = text.toLowerCase();
  
  // Extract policy number
  const policyPatterns = [
    /policy\s*#?\s*:?\s*([A-Z0-9\-]{6,20})/i,
    /pol\s*#?\s*:?\s*([A-Z0-9\-]{6,20})/i,
    /\b([A-Z]{2,4}\d{6,12})\b/g
  ];
  
  for (const pattern of policyPatterns) {
    const match = text.match(pattern);
    if (match) {
      policyData.policyNumber = match[1] || match[0];
      break;
    }
  }

  // Extract insured name
  const namePatterns = [
    /insured\s*:?\s*([A-Z][a-zA-Z\s]{2,50})/i,
    /name\s*:?\s*([A-Z][a-zA-Z\s]{2,50})/i,
    /policyholder\s*:?\s*([A-Z][a-zA-Z\s]{2,50})/i
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      policyData.insuredName = match[1].trim();
      break;
    }
  }

  // Extract dates
  const datePattern = /\b(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})\b/g;
  const dates = text.match(datePattern) || [];
  
  if (dates.length > 0) {
    // First date often effective date
    policyData.effectiveDate = dates[0];
  }
  if (dates.length > 1) {
    // Second date often expiration date
    policyData.expirationDate = dates[1];
  }

  // Extract coverage types
  const coverageKeywords = ['dwelling', 'personal property', 'liability', 'medical', 'aop', 'wind', 'hail'];
  const foundCoverage = [];
  
  for (const keyword of coverageKeywords) {
    if (lowerText.includes(keyword)) {
      foundCoverage.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }
  
  if (foundCoverage.length > 0) {
    policyData.coverageTypes = foundCoverage;
  }

  // Extract deductibles
  const deductiblePattern = /\$(\d{1,3},?\d{0,3})\s*deductible/gi;
  const deductibleMatches = text.match(deductiblePattern);
  
  if (deductibleMatches) {
    policyData.deductibles = deductibleMatches.map(match => {
      const amount = match.match(/\$(\d{1,3},?\d{0,3})/)?.[1];
      return {
        type: 'General',
        amount: amount ? parseInt(amount.replace(',', '')) : 0
      };
    });
  }

  // Extract insurer name
  const insurerPatterns = [
    /carrier\s*:?\s*([A-Z][a-zA-Z\s&]{2,40})/i,
    /company\s*:?\s*([A-Z][a-zA-Z\s&]{2,40})/i,
    /insurer\s*:?\s*([A-Z][a-zA-Z\s&]{2,40})/i
  ];
  
  for (const pattern of insurerPatterns) {
    const match = text.match(pattern);
    if (match) {
      policyData.insurerName = match[1].trim();
      break;
    }
  }

  // Extract address
  const addressPattern = /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd))/i;
  const addressMatch = text.match(addressPattern);
  if (addressMatch) {
    policyData.insuredAddress = addressMatch[1];
  }

  return policyData;
}

// Validate extracted data
function validateExtractedData(policyData: any): any {
  const missingData = [];
  const inconsistencies = [];
  
  // Check for required fields
  if (!policyData.policyNumber) missingData.push('Policy Number');
  if (!policyData.insuredName) missingData.push('Insured Name');
  if (!policyData.effectiveDate) missingData.push('Effective Date');
  
  // Check for inconsistencies
  if (policyData.effectiveDate && policyData.expirationDate) {
    const effective = new Date(policyData.effectiveDate);
    const expiration = new Date(policyData.expirationDate);
    
    if (effective >= expiration) {
      inconsistencies.push('Effective date is after expiration date');
    }
  }
  
  // Calculate confidence based on extracted data quality
  let confidence = 0.3; // Base confidence
  
  if (policyData.policyNumber) confidence += 0.25;
  if (policyData.insuredName) confidence += 0.25;
  if (policyData.effectiveDate) confidence += 0.1;
  if (policyData.coverageTypes?.length > 0) confidence += 0.1;
  
  confidence = Math.min(confidence, 1.0);
  
  return {
    missingData,
    inconsistencies,
    confidence
  };
}

// Create auto-populate fields
function createAutoPopulateFields(policyData: any): any {
  return {
    policyNumber: policyData.policyNumber || '',
    insuredName: policyData.insuredName || '',
    effectiveDate: policyData.effectiveDate || '',
    expirationDate: policyData.expirationDate || '',
    coverageTypes: policyData.coverageTypes || [],
    insurerName: policyData.insurerName || '',
    insuredAddress: policyData.insuredAddress || ''
  };
}