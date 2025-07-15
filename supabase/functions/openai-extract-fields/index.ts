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
    console.log('🤖 OpenAI Enhanced Identifier + Deductibles Extract Fields function called');
    
    const { text } = await req.json();
    
    if (!text) {
      throw new Error('No text provided for extraction');
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('📝 Processing enhanced identifier + deductibles text of length:', text.length);

    const prompt = `
Extract the following comprehensive insurance document information from the provided text. This could be a policy document OR a claim-related document. Return a JSON object with these exact keys:

{
  // CRITICAL IDENTIFIERS - Extract ALL that are present
  "policyNumber": "string or null",
  "claimNumber": "string or null",
  "fileNumber": "string or null",
  "carrierClaimNumber": "string or null",
  
  // Document Context
  "documentType": "string or null", // policy, claim, communication, settlement, etc.
  "primaryFocus": "string or null", // policy_info, claim_processing, settlement, etc.
  "identifierContext": "string or null", // which identifier is primary for this document
  
  // Basic Policy Information
  "insuredName": "string or null",
  "coinsuredName": "string or null",
  "effectiveDate": "string or null",
  "expirationDate": "string or null",
  
  // Addresses
  "propertyAddress": "string or null",
  "mailingAddress": "string or null",
  
  // Coverage Information
  "coverageA": "string or null",
  "coverageB": "string or null", 
  "coverageC": "string or null",
  "coverageD": "string or null",
  "moldLimit": "string or null",
  
  // Deductibles - Enhanced with specific types
  "aopDeductible": "string or null",
  "aopDeductibleType": "string or null",
  "windHailDeductible": "string or null", 
  "windHailDeductibleType": "string or null",
  "namedStormDeductible": "string or null",
  "namedStormDeductibleType": "string or null",
  "hurricaneDeductible": "string or null",
  "hurricaneDeductibleType": "string or null",
  "tornadoDeductible": "string or null",
  "tornadoDeductibleType": "string or null",
  
  // Legacy deductible fields for compatibility
  "deductible": "string or null",
  "deductibleType": "string or null",
  "deductiblePercentageOf": "string or null",
  
  // Insurer Information
  "insurerName": "string or null",
  "insurerPhone": "string or null",
  "insurerAddress": "string or null",
  
  // Agent Information
  "agentName": "string or null",
  "agentPhone": "string or null",
  "agentAddress": "string or null",
  
  // Mortgagee Information
  "mortgageeName": "string or null",
  "mortgageePhone": "string or null", 
  "mortgageeAddress": "string or null",
  "mortgageAccountNumber": "string or null",
  
  // Property Construction Details (moved from Property Information)
  "yearBuilt": "string or null",
  "dwellingStyle": "string or null",
  "numberOfFamilies": "string or null",
  "squareFootage": "string or null",
  "numberOfStories": "string or null",
  "numberOfBathrooms": "string or null",
  "numberOfEmployees": "string or null",
  
  // Construction Materials
  "foundationType": "string or null",
  "constructionType": "string or null",
  "sidingType": "string or null",
  "roofMaterialType": "string or null",
  "exteriorWallTypes": "string or null",
  "interiorWallPartition": "string or null",
  
  // Roof Details
  "roofSquareFootage": "string or null",
  "ageOfRoof": "string or null",
  "roofSurfaceMaterial": "string or null",
  
  // Garage and Structures
  "garageType": "string or null",
  "garageNumberOfCars": "string or null",
  "attachedStructures": "string or null",
  
  // Additional Features
  "pool": "string or null",
  "finishedBasement": "string or null",
  "heatingAndCooling": "string or null",
  "interiorDetails": "string or null",
  "additionalDetails": "string or null",
  "treeOverhang": "string or null",
  
  // Safety and Protection
  "fireProtectionDetails": "string or null",
  
  // Legacy compatibility
  "coverageAmount": "string or null",
  "premium": "string or null"
}

Specific Extraction Rules:

**CRITICAL IDENTIFIER EXTRACTION (HIGHEST PRIORITY):**
- **Policy Number**: Look for "Policy Number", "Policy #", "Policy No", or similar patterns
- **Claim Number**: Look for "Claim Number", "Claim #", "File Number", "Our File", "Reference Number", or similar
- **File Number**: Internal claim reference numbers
- **Carrier Claim Number**: Insurance company's internal claim number

**Document Type Classification:**
- Determine if this is: "policy", "claim", "communication", "settlement", "rfi", "ror", "acknowledgement"
- Identify primary focus: "policy_info", "claim_processing", "settlement", "information_request"
- Note which identifier is most relevant for this document type

**Coverage Information:**
- Coverage A = Dwelling coverage limit
- Coverage B = Other Structures coverage limit  
- Coverage C = Personal Property coverage limit
- Coverage D = Loss of Use/Additional Living Expenses coverage limit
- Look for patterns like "Coverage A: $500,000" or "Dwelling: $500,000"

**Deductibles - Enhanced Extraction:**
- **AOP (All Other Perils) Deductible**: Look for "AOP", "All Other Perils", or general deductible
- **Wind/Hail Deductible**: Look for "Wind", "Hail", "Wind/Hail", "Windstorm" deductibles
- **Named Storm Deductible**: Look for "Named Storm", "Named Hurricane", or similar
- **Hurricane Deductible**: Look for "Hurricane" specific deductibles
- **Tornado Deductible**: Look for "Tornado" specific deductibles

**For each deductible type:**
- Extract the amount/percentage (e.g., "$2,500", "2%", "1% of Coverage A")
- Determine if it's "Stated Amount" (fixed dollar amount) or "Percentage of Coverage A/B/C/D"
- If percentage, specify which coverage it's based on

**Deductible Type Classification:**
- If amount like "$2,500", "$1,000" → "Stated Amount"
- If amount like "2%", "1% of Coverage A", "2% of Dwelling" → "Percentage of Coverage A"
- Look for patterns: "2% of Coverage A", "1% of dwelling limit", "3% of Coverage A limit"

**Contact Information:**
- Extract phone numbers in any format: (555) 123-4567, 555-123-4567, 555.123.4567
- Extract full addresses including city, state, zip
- Look for agent, insurer, and mortgagee contact details

**Property Details:**
- Extract construction details like "Built in 1973; 1 family; 1683 sq. ft.; ranch -1 story"
- Look for foundation types: slab, basement, crawl space
- Extract roof materials: composition, metal, tile, etc.
- Note garage details: attached, detached, number of cars

**Construction Information:**
- Siding types: wood, vinyl, brick, stucco, etc.
- Foundation details: slab at grade, basement, etc.
- Construction types: frame, masonry, etc.
- Wall types and materials

**Safety Features:**
- Fire protection: fire department distance, subscription, sprinkler systems
- Security systems and features

**IDENTIFIER EXTRACTION RULES (CRITICAL):**
- **Policy documents**: Should always have policyNumber, may have claimNumber if claim-related
- **Claim documents**: Should have both claimNumber AND policyNumber for proper relationship
- **Communication documents**: Extract both identifiers to establish context
- **Look for patterns**: 
  - Policy: "Policy Number ABC123", "Policy # DEF456", "Pol No: GHI789"
  - Claim: "Claim Number CLM123", "File # 2024-001", "Our Reference: REF456"
- **Common locations**: Headers, footers, first paragraph, signature blocks
- **Multiple identifiers**: If both present, extract both to show relationship

General Rules:
- **IDENTIFIERS ARE HIGHEST PRIORITY** - extract these first and most carefully
- Extract exact values as they appear in the document
- For dates, preserve the original format
- For monetary amounts, include $ sign and commas
- If a field is not found, set it to null
- Look for variations of field names and terminology
- Separate mailing address from property address if different
- **Always extract both policy and claim numbers when present**

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
            content: 'You are a comprehensive insurance document parser specializing in identifier and deductible extraction. Extract all available information exactly as it appears in documents. ALWAYS extract both policy numbers and claim numbers when present. Always return valid JSON with all requested fields, using null for missing data. Pay special attention to different deductible types and whether they are stated amounts or percentages of coverage.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
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

    console.log('🤖 OpenAI enhanced identifier + deductibles response length:', extractedText.length);

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

    console.log('✅ Successfully extracted enhanced identifier + deductibles policy data:', Object.keys(policyData).filter(k => policyData[k]).length, 'fields');
    console.log('🆔 Identifiers found:', {
      policyNumber: policyData.policyNumber || 'None',
      claimNumber: policyData.claimNumber || 'None',
      documentType: policyData.documentType || 'Unknown'
    });

    return new Response(JSON.stringify({ 
      success: true,
      policyData,
      confidence: 0.9,
      method: 'openai-gpt4o-mini-enhanced-identifiers-deductibles',
      fieldsExtracted: Object.keys(policyData).filter(k => policyData[k]).length,
      identifiersExtracted: {
        policyNumber: !!policyData.policyNumber,
        claimNumber: !!policyData.claimNumber,
        fileNumber: !!policyData.fileNumber,
        carrierClaimNumber: !!policyData.carrierClaimNumber
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ OpenAI enhanced identifier + deductibles extraction error:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'OPENAI_ENHANCED_IDENTIFIERS_DEDUCTIBLES_EXTRACTION_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});