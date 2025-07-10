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
        const { claimId, analysisType } = await req.json();

        if (!claimId) {
            throw new Error('Claim ID is required');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

        if (!serviceRoleKey || !supabaseUrl || !anthropicApiKey) {
            throw new Error('Required configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Get user's organization
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}&select=organization_id`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const profileData = await profileResponse.json();
        if (!profileData || profileData.length === 0) {
            throw new Error('User profile not found');
        }

        const organizationId = profileData[0].organization_id;

        // Fetch claim data with related information
        const claimResponse = await fetch(`${supabaseUrl}/rest/v1/claims?id=eq.${claimId}&organization_id=eq.${organizationId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const claimData = await claimResponse.json();
        if (!claimData || claimData.length === 0) {
            throw new Error('Claim not found');
        }

        const claim = claimData[0];

        // Fetch related documents
        const documentsResponse = await fetch(`${supabaseUrl}/rest/v1/documents?claim_id=eq.${claimId}&organization_id=eq.${organizationId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const documents = await documentsResponse.json() || [];

        // Fetch policy information
        const policyResponse = await fetch(`${supabaseUrl}/rest/v1/policies?claim_id=eq.${claimId}&organization_id=eq.${organizationId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const policies = await policyResponse.json() || [];
        const policy = policies[0] || null;

        // Prepare analysis prompt based on type
        let analysisPrompt = '';
        
        if (analysisType === 'outcome_prediction') {
            analysisPrompt = `As an expert public insurance adjuster, analyze this claim and predict the likely outcome and settlement range:

Claim Details:
- Cause of Loss: ${claim.cause_of_loss}
- Date of Loss: ${claim.date_of_loss}
- Description: ${claim.loss_description}
- Estimated Value: $${claim.estimated_loss_value || 'Not specified'}
- Property Type: Property information needed

Policy Details:
${policy ? `- Policy Limits: Dwelling $${policy.dwelling_limit_a}, Contents $${policy.contents_limit_c}
- Deductible: $${policy.deductible_amount}
- Policy Type: ${policy.policy_type}` : '- Policy information not available'}

Documents Available: ${documents.length} documents uploaded

Provide analysis in JSON format with:
1. predicted_outcome (string)
2. settlement_range_low (number)
3. settlement_range_high (number)
4. confidence_level (0-1)
5. key_factors (array)
6. recommended_actions (array)
7. potential_issues (array)
8. timeline_estimate (string)`;
        } else if (analysisType === 'risk_assessment') {
            analysisPrompt = `As an expert in insurance fraud detection and risk assessment, analyze this claim for potential red flags:

Claim Details:
- Cause of Loss: ${claim.cause_of_loss}
- Date of Loss: ${claim.date_of_loss}
- Description: ${claim.loss_description}
- Date Reported: ${claim.date_reported}
- First Contact: ${claim.date_first_contact}

Risk Factors to Assess:
1. Timing inconsistencies
2. Loss pattern analysis
3. Documentation completeness
4. Client behavior indicators
5. Property risk factors

Provide analysis in JSON format with:
1. overall_risk_score (0-100)
2. risk_level (low/medium/high)
3. red_flags (array)
4. verification_needed (array)
5. recommended_investigations (array)
6. documentation_gaps (array)`;
        } else {
            analysisPrompt = `As an expert public insurance adjuster, provide a comprehensive analysis of this claim:

Claim Details:
- Cause of Loss: ${claim.cause_of_loss}
- Date of Loss: ${claim.date_of_loss}
- Description: ${claim.loss_description}
- Status: ${claim.claim_status}
- Phase: ${claim.claim_phase}

Provide analysis in JSON format with comprehensive insights, recommendations, and next steps.`;
        }

        // Call Anthropic API
        const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicApiKey,
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

        if (!aiResponse.ok) {
            throw new Error('AI analysis request failed');
        }

        const aiData = await aiResponse.json();
        const analysisResult = aiData.content[0].text;

        // Parse JSON response from AI
        let parsedAnalysis;
        try {
            const jsonStart = analysisResult.indexOf('{');
            const jsonEnd = analysisResult.lastIndexOf('}') + 1;
            const jsonString = analysisResult.slice(jsonStart, jsonEnd);
            parsedAnalysis = JSON.parse(jsonString);
        } catch (parseError) {
            parsedAnalysis = {
                raw_analysis: analysisResult,
                error: 'Failed to parse structured response'
            };
        }

        // Save AI insight to database
        const insightRecord = {
            organization_id: organizationId,
            claim_id: claimId,
            insight_type: analysisType || 'general_analysis',
            insight_category: 'ai_analysis',
            confidence_score: parsedAnalysis.confidence_level || 0.8,
            title: `AI Analysis: ${analysisType || 'General'}`,
            summary: analysisResult.substring(0, 500),
            full_analysis: analysisResult,
            extracted_entities: JSON.stringify(parsedAnalysis),
            status: 'completed',
            ai_model_version: 'claude-3-sonnet-20240229'
        };

        const insightResponse = await fetch(`${supabaseUrl}/rest/v1/ai_insights`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(insightRecord)
        });

        if (!insightResponse.ok) {
            throw new Error('Failed to save AI insight');
        }

        const savedInsight = await insightResponse.json();

        // Create activity log
        const activityRecord = {
            organization_id: organizationId,
            claim_id: claimId,
            activity_type: 'ai_analysis_completed',
            activity_category: 'analysis',
            title: `AI Analysis Completed: ${analysisType || 'General'}`,
            description: `Artificial intelligence analysis was performed on the claim`,
            activity_data: JSON.stringify({
                analysis_type: analysisType,
                insight_id: savedInsight[0].id,
                confidence: parsedAnalysis.confidence_level || 0.8
            }),
            created_by: userId
        };

        await fetch(`${supabaseUrl}/rest/v1/activities`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(activityRecord)
        });

        return new Response(JSON.stringify({
            data: {
                insight: savedInsight[0],
                analysis: parsedAnalysis,
                raw_response: analysisResult
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('AI claim analysis error:', error);

        const errorResponse = {
            error: {
                code: 'AI_ANALYSIS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});