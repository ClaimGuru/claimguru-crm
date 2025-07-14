/**
 * OpenAI Intelligent Field Extraction
 * Uses OPENAI_API_KEY for intelligent parsing of insurance documents
 */

import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from environment
    const openaiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPENAI') || Deno.env.get('OPENAIKEY');
    
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Parse request body
    const { text } = await req.json();
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for analysis');
    }

    console.log(`Processing text for field extraction. Length: ${text.length} characters`);

    // Create OpenAI prompt for insurance document analysis
    const prompt = `You are an expert insurance document analyzer. Extract the following fields from this insurance policy document text and return ONLY a valid JSON object with these exact field names:

{
  "policyNumber": "string or null",
  "insuredName": "string or null", 
  "effectiveDate": "string or null",
  "expirationDate": "string or null",
  "insurerName": "string or null",
  "propertyAddress": "string or null",
  "coverageAmount": "string or null",
  "deductible": "string or null",
  "premium": "string or null",
  "coverageTypes": ["array of strings or empty array"]
}

Rules:
- Return ONLY the JSON object, no other text
- Use null for missing fields
- Format dates as MM/DD/YYYY if found
- Include dollar signs in amounts (e.g., "$350,000")
- Extract all coverage types found (e.g., "Dwelling", "Personal Property", etc.)

Document text:
${text}`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiResult = await openaiResponse.json();
    const extractedContent = openaiResult.choices[0]?.message?.content;
    
    if (!extractedContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response from OpenAI
    let policyData;
    try {
      policyData = JSON.parse(extractedContent.trim());
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', extractedContent);
      throw new Error('Invalid JSON response from OpenAI');
    }

    console.log('Field extraction successful:', Object.keys(policyData));
    
    // Return successful response
    return new Response(JSON.stringify({
      policyData,
      extractedFields: Object.keys(policyData).filter(key => policyData[key] !== null),
      processingMethod: 'openai-gpt-3.5'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('OpenAI field extraction failed:', error);
    
    // Return error response
    return new Response(JSON.stringify({
      error: {
        code: 'OPENAI_EXTRACTION_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
