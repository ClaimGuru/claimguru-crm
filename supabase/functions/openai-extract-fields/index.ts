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
    console.log('🤖 OpenAI Extract Fields function called');
    
    const { text } = await req.json();
    
    if (!text) {
      throw new Error('No text provided for extraction');
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('📝 Processing text of length:', text.length);

    const prompt = `
Extract the following insurance policy information from the provided text. Return a JSON object with these exact keys:

{
  "policyNumber": "string or null",
  "insuredName": "string or null", 
  "insurerName": "string or null",
  "effectiveDate": "string or null",
  "expirationDate": "string or null",
  "propertyAddress": "string or null",
  "coverageAmount": "string or null",
  "deductible": "string or null",
  "premium": "string or null",
  "mortgageAccountNumber": "string or null"
}

Rules:
- Extract exact values as they appear in the document
- For dates, preserve the original format
- For monetary amounts, include $ sign and commas
- If a field is not found, set it to null
- Look for variations of field names (e.g., "Policy No", "Policy #", etc.)
- For mortgage account number, look for loan numbers, account numbers, mortgagee information

Text to analyze:
${text}

Return only the JSON object, no additional text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a precise insurance document parser. Extract information exactly as it appears in documents. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const extractedText = result.choices[0]?.message?.content;

    if (!extractedText) {
      throw new Error('No content returned from OpenAI');
    }

    console.log('🤖 OpenAI raw response:', extractedText);

    // Parse the JSON response
    let policyData;
    try {
      // Clean the response to extract JSON
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        policyData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    console.log('✅ Successfully extracted policy data:', Object.keys(policyData));

    return new Response(JSON.stringify({ 
      success: true,
      policyData,
      confidence: 0.9,
      method: 'openai-gpt4o-mini'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ OpenAI extraction error:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'OPENAI_EXTRACTION_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});