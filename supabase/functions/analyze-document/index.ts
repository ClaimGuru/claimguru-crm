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
    const { documentText, documentType, claimId } = await req.json();

    if (!documentText) {
      throw new Error('Document text is required');
    }

    // Get Claude API key from environment
    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Analyze document with Claude
    const analysisPrompt = `You are an expert insurance adjuster analyzing insurance-related documents. Please analyze the following document and provide insights:

Document Type: ${documentType || 'Unknown'}
Document Content:
${documentText}

Provide analysis in the following JSON format:
{
  "document_type": "detected document type",
  "key_information": {
    "policy_number": "if found",
    "claim_amount": "if found",
    "date_of_loss": "if found",
    "cause_of_loss": "if found",
    "insured_name": "if found",
    "property_address": "if found"
  },
  "compliance_check": {
    "missing_information": ["list of missing required info"],
    "completeness_score": "percentage",
    "recommendations": ["list of recommendations"]
  },
  "risk_assessment": {
    "fraud_indicators": ["any potential red flags"],
    "risk_level": "low/medium/high",
    "verification_needed": ["items that need verification"]
  },
  "next_steps": ["recommended actions"],
  "summary": "brief summary of the document and its significance"
}`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      throw new Error(`Claude API error: ${errorText}`);
    }

    const claudeData = await claudeResponse.json();
    const analysisText = claudeData.content[0].text;

    // Try to parse JSON from Claude's response
    let analysis;
    try {
      // Extract JSON from Claude's response (may contain additional text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: create structured response from text
      analysis = {
        document_type: documentType || 'Unknown',
        key_information: {},
        compliance_check: {
          missing_information: [],
          completeness_score: '0%',
          recommendations: []
        },
        risk_assessment: {
          fraud_indicators: [],
          risk_level: 'medium',
          verification_needed: []
        },
        next_steps: ['Manual review required'],
        summary: analysisText.substring(0, 500)
      };
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && serviceRoleKey && claimId) {
      // Save analysis to database
      const saveResponse = await fetch(`${supabaseUrl}/rest/v1/ai_analyses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          claim_id: claimId,
          analysis_type: 'document_analysis',
          input_data: { documentText, documentType },
          ai_response: analysis,
          ai_model: 'claude-3-sonnet',
          confidence_score: 0.85
        })
      });
    }

    return new Response(JSON.stringify({
      data: {
        analysis,
        processed_at: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Document analysis error:', error);

    const errorResponse = {
      error: {
        code: 'DOCUMENT_ANALYSIS_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});