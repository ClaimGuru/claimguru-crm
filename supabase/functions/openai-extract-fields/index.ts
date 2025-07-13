/**
 * OpenAI Intelligent Field Extraction
 * Uses OPENAI_API_KEY for intelligent parsing of insurance documents
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

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

    // Call OpenAI API for intelligent field extraction
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: 'You are an expert insurance document analyzer. Extract key insurance policy information from the provided text and return it as a JSON object. Include fields like policyNumber, insuredName, effectiveDate, expirationDate, insurerName, propertyAddress, coverageTypes, deductibles, and any other relevant insurance data. If a field is not found, omit it from the response.'
        }, {
          role: 'user',
          content: `Extract insurance policy information from this document:\n\n${text}`
        }],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('OpenAI API response received');

    // Extract the generated content
    const extractedFields = openaiData.choices?.[0]?.message?.content;
    
    if (!extractedFields) {
      throw new Error('No content returned from OpenAI');
    }

    // Try to parse as JSON, fallback to text if parsing fails
    let policyData;
    try {
      policyData = JSON.parse(extractedFields);
    } catch (parseError) {
      console.warn('Failed to parse OpenAI response as JSON, using text extraction');
      // Simple text extraction as fallback
      policyData = {
        extractedText: extractedFields,
        processingNote: 'Extracted as text due to JSON parsing error'
      };
    }

    const result = {
      policyData,
      confidence: 0.9,
      processingMethod: 'openai-gpt',
      processingTime: Date.now(),
      textLength: text.length
    };

    console.log(`Successfully extracted fields using OpenAI`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('OpenAI field extraction failed:', error);
    
    const errorResponse = {
      error: {
        code: 'OPENAI_EXTRACTION_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});