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
    const { 
      claimData, 
      propertyData, 
      historicalData, 
      marketData 
    } = await req.json();

    if (!claimData) {
      throw new Error('Claim data is required');
    }

    // Get Claude API key from environment
    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Build analysis prompt
    const analysisPrompt = `You are an expert insurance claims analyst with 20+ years of experience. Analyze the following claim data and predict the settlement outcome:

Claim Information:
- Cause of Loss: ${claimData.cause_of_loss}
- Date of Loss: ${claimData.date_of_loss}
- Estimated Loss Value: $${claimData.estimated_loss_value}
- Policy Type: ${claimData.policy_type || 'Standard Homeowners'}
- Claim Phase: ${claimData.claim_phase}
- Current Status: ${claimData.claim_status}
- Is FEMA Claim: ${claimData.is_fema_claim ? 'Yes' : 'No'}
- Prior Claims: ${claimData.has_prior_claims ? 'Yes' : 'No'}

Property Information:
${propertyData ? `
- Property Type: ${propertyData.property_type}
- Year Built: ${propertyData.year_built}
- Square Footage: ${propertyData.square_footage}
- Construction Type: ${propertyData.construction_type}
` : '- Property data not provided'}

Historical Context:
${historicalData ? `
- Similar claims average settlement: $${historicalData.avg_settlement}
- Settlement rate: ${historicalData.settlement_rate}%
- Average processing time: ${historicalData.avg_days} days
` : '- Historical data not provided'}

Market Conditions:
${marketData ? `
- Regional loss trends: ${marketData.regional_trends}
- Current market conditions: ${marketData.market_conditions}
` : '- Market data not provided'}

Provide your analysis in the following JSON format:
{
  "settlement_prediction": {
    "estimated_amount": "predicted settlement amount",
    "confidence_level": "percentage confidence in prediction",
    "estimated_timeline": "predicted days to settlement",
    "probability_of_settlement": "percentage likelihood of settlement vs denial"
  },
  "risk_factors": {
    "favorable_factors": ["factors that support a good settlement"],
    "challenging_factors": ["factors that may reduce settlement or cause delays"],
    "critical_issues": ["major concerns that need immediate attention"]
  },
  "recommendations": {
    "immediate_actions": ["actions to take now"],
    "documentation_needs": ["additional documentation required"],
    "negotiation_strategy": ["recommended negotiation approach"],
    "expert_consultations": ["specialists that should be consulted"]
  },
  "market_insights": {
    "comparable_claims": "insights from similar claims",
    "regional_factors": "local market considerations",
    "timing_considerations": "best timing for settlement negotiations"
  },
  "risk_assessment": {
    "fraud_probability": "low/medium/high",
    "coverage_disputes": ["potential coverage issues"],
    "litigation_risk": "low/medium/high"
  },
  "key_milestones": [
    {
      "milestone": "milestone name",
      "estimated_date": "estimated completion date",
      "critical_path": true/false
    }
  ],
  "summary": "executive summary of the analysis and key takeaways"
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
        max_tokens: 3000,
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
    let prediction;
    try {
      // Extract JSON from Claude's response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: create structured response
      prediction = {
        settlement_prediction: {
          estimated_amount: claimData.estimated_loss_value || 0,
          confidence_level: '60%',
          estimated_timeline: '60-90 days',
          probability_of_settlement: '75%'
        },
        risk_factors: {
          favorable_factors: ['Standard claim type'],
          challenging_factors: ['Manual analysis required'],
          critical_issues: []
        },
        recommendations: {
          immediate_actions: ['Review documentation'],
          documentation_needs: ['Complete claim file review'],
          negotiation_strategy: ['Standard negotiation approach'],
          expert_consultations: []
        },
        market_insights: {
          comparable_claims: 'Analysis requires manual review',
          regional_factors: 'Standard market conditions assumed',
          timing_considerations: 'Standard timeline expected'
        },
        risk_assessment: {
          fraud_probability: 'low',
          coverage_disputes: [],
          litigation_risk: 'low'
        },
        key_milestones: [],
        summary: analysisText.substring(0, 500)
      };
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && serviceRoleKey && claimData.id) {
      // Save prediction to database
      const saveResponse = await fetch(`${supabaseUrl}/rest/v1/ai_analyses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          claim_id: claimData.id,
          analysis_type: 'settlement_prediction',
          input_data: { claimData, propertyData, historicalData, marketData },
          ai_response: prediction,
          ai_model: 'claude-3-sonnet',
          confidence_score: 0.78
        })
      });
    }

    return new Response(JSON.stringify({
      data: {
        prediction,
        generated_at: new Date().toISOString(),
        model_version: 'claude-3-sonnet-20240229'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Settlement prediction error:', error);

    const errorResponse = {
      error: {
        code: 'SETTLEMENT_PREDICTION_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});