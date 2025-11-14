/**
 * OpenAI Service
 * A unified edge function for OpenAI API calls
 * Uses OPENAI_API_KEY from Supabase secrets
 */

// Define CORS headers directly in this file since imports are causing issues
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from environment
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Parse request body
    const { text, mode = 'document_analysis', context = null } = await req.json();
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for analysis');
    }

    console.log(`Processing text for ${mode}. Length: ${text.length} characters`);

    // Create prompt based on the requested mode
    let prompt;
    const model = 'gpt-3.5-turbo';
    const temperature = 0.1;
    const maxTokens = 1000;

    switch (mode) {
      case 'document_analysis':
        prompt = createDocumentAnalysisPrompt(text);
        break;
      case 'claim_analysis':
        prompt = createClaimAnalysisPrompt(text);
        break;
      case 'recommendations':
        prompt = createRecommendationsPrompt(text, context);
        break;
      default:
        prompt = createDocumentAnalysisPrompt(text);
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature
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

    // Process the response based on the mode
    let processedResult;
    try {
      switch (mode) {
        case 'document_analysis':
          processedResult = processDocumentAnalysisResponse(extractedContent);
          break;
        case 'claim_analysis':
          processedResult = processClaimAnalysisResponse(extractedContent);
          break;
        case 'recommendations':
          processedResult = processRecommendationsResponse(extractedContent, context);
          break;
        default:
          processedResult = processDocumentAnalysisResponse(extractedContent);
      }
    } catch (parseError) {
      console.error('Failed to process OpenAI response:', parseError);
      console.error('Raw response:', extractedContent);
      throw new Error('Invalid response format from OpenAI');
    }

    console.log(`${mode} successful:`, Object.keys(processedResult));
    
    // Return successful response
    return new Response(JSON.stringify(processedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('OpenAI service failed:', error);
    
    // Return error response
    return new Response(JSON.stringify({
      error: {
        code: 'OPENAI_SERVICE_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper functions for creating prompts and processing responses

function createDocumentAnalysisPrompt(text: string): string {
  return `You are an expert insurance document analyzer. Extract the following fields from this insurance policy document text and return ONLY a valid JSON object with these exact field names:

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
  "mortgageAccountNumber": "string or null",
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
}

function createClaimAnalysisPrompt(text: string): string {
  return `You are an expert insurance claim analyst. Analyze the following claim information and return ONLY a valid JSON object with your assessment:

{
  "analysis": {
    "coverageAssessment": "Assessment of coverage based on policy details",
    "estimatedSettlement": 0,
    "timeToResolution": 0,
    "riskFactors": ["array of risk factors"],
    "nextSteps": ["array of recommended next steps"],
    "documentationNeeded": ["array of required documentation"]
  }
}

Rules:
- Return ONLY the JSON object, no other text
- Provide a realistic settlement estimate as a number
- Estimate time to resolution in days as a number
- Include at least 3 risk factors, next steps, and documentation requirements

Claim information:
${text}`;
}

function createRecommendationsPrompt(text: string, context: string | null): string {
  let contextSpecificPrompt = '';
  
  switch (context) {
    case 'tasks':
      contextSpecificPrompt = `Return a JSON object with a "tasks" array containing task recommendations in this format:
      {
        "tasks": [
          {
            "title": "Task title",
            "description": "Task description",
            "priority": "high|medium|low|urgent",
            "dueDate": "ISO date string",
            "category": "Task category",
            "assigneeRole": "Role of person who should handle this"
          }
        ]
      }`;
      break;
    case 'vendors':
      contextSpecificPrompt = `Return a JSON object with a "vendors" array containing vendor recommendations in this format:
      {
        "vendors": [
          {
            "vendorType": "Type of vendor needed",
            "reason": "Why this vendor is needed",
            "priority": "high|medium|low",
            "specialization": "Any specific specialization needed",
            "timing": "immediate|within_week|schedule_ahead"
          }
        ]
      }`;
      break;
    case 'documentation':
      contextSpecificPrompt = `Return a JSON object with a "documentation" array containing documentation recommendations in this format:
      {
        "documentation": [
          {
            "documentType": "Type of document needed",
            "importance": "critical|high|medium|low",
            "reason": "Why this document is important",
            "deadline": "ISO date string or null",
            "tips": ["Array of tips for gathering this documentation"]
          }
        ]
      }`;
      break;
    case 'settlement':
      contextSpecificPrompt = `Return a JSON object with settlementAdvice in this format:
      {
        "settlementAdvice": "Detailed professional advice about settlement strategy"
      }`;
      break;
    default:
      contextSpecificPrompt = `Return a JSON object with recommendations in this format:
      {
        "tasks": [...task recommendations],
        "vendors": [...vendor recommendations],
        "documentation": [...documentation recommendations],
        "settlementAdvice": "Settlement advice string"
      }`;
  }

  return `You are an expert insurance claim consultant. Based on the following information, provide professional recommendations:

${contextSpecificPrompt}

Rules:
- Return ONLY the JSON object, no other text
- Be specific and practical in your recommendations
- Base recommendations on insurance industry best practices
- Due dates should be realistic relative to today

Claim information:
${text}`;
}

function processDocumentAnalysisResponse(response: string): any {
  // Extract the JSON object from the response
  let jsonObject;
  try {
    // If the response is wrapped in markdown code blocks, remove them
    const cleanedResponse = response.replace(/```json\n|```\n|```json|```/g, '');
    jsonObject = JSON.parse(cleanedResponse.trim());
  } catch (error) {
    console.error('Failed to parse document analysis response:', error);
    throw new Error('Invalid JSON in document analysis response');
  }

  return {
    policyData: jsonObject,
    extractedFields: Object.keys(jsonObject).filter(key => jsonObject[key] !== null),
    processingMethod: 'openai-gpt-3.5'
  };
}

function processClaimAnalysisResponse(response: string): any {
  // Extract the JSON object from the response
  let jsonObject;
  try {
    // If the response is wrapped in markdown code blocks, remove them
    const cleanedResponse = response.replace(/```json\n|```\n|```json|```/g, '');
    jsonObject = JSON.parse(cleanedResponse.trim());
  } catch (error) {
    console.error('Failed to parse claim analysis response:', error);
    throw new Error('Invalid JSON in claim analysis response');
  }

  return jsonObject;
}

function processRecommendationsResponse(response: string, context: string | null): any {
  // Extract the JSON object from the response
  let jsonObject;
  try {
    // If the response is wrapped in markdown code blocks, remove them
    const cleanedResponse = response.replace(/```json\n|```\n|```json|```/g, '');
    jsonObject = JSON.parse(cleanedResponse.trim());
  } catch (error) {
    console.error('Failed to parse recommendations response:', error);
    throw new Error('Invalid JSON in recommendations response');
  }

  return jsonObject;
}
