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
        const { documentData, fileName, claimId, documentType, documentCategory, description } = await req.json();

        if (!documentData || !fileName) {
            throw new Error('Document data and filename are required');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
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
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const uniqueFileName = `${organizationId}/${claimId || 'general'}/${timestamp}-${fileName}`;

        // Extract base64 data from data URL
        const base64Data = documentData.split(',')[1];
        const mimeType = documentData.split(';')[0].split(':')[1];

        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Upload to Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/claim-documents/${uniqueFileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/claim-documents/${uniqueFileName}`;

        // AI Analysis using Anthropic Claude (if API key available)
        let aiAnalysis = null;
        if (anthropicApiKey && (mimeType.includes('image') || mimeType.includes('pdf'))) {
            try {
                const analysisPrompt = `Analyze this insurance document and extract key information. Identify:
                1. Document type (policy, estimate, receipt, photo, etc.)
                2. Key entities (names, dates, amounts, addresses)
                3. Important details for insurance claims
                4. Compliance issues or missing information
                5. Risk factors or red flags
                
                Provide the response in JSON format with structured data.`;

                const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': anthropicApiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-sonnet-20240229',
                        max_tokens: 2000,
                        messages: [{
                            role: 'user',
                            content: [{
                                type: 'text',
                                text: analysisPrompt
                            }]
                        }]
                    })
                });

                if (aiResponse.ok) {
                    const aiData = await aiResponse.json();
                    aiAnalysis = {
                        summary: aiData.content[0].text,
                        confidence: 0.85,
                        processed_at: new Date().toISOString()
                    };
                }
            } catch (aiError) {
                console.warn('AI analysis failed:', aiError);
                // Continue without AI analysis
            }
        }

        // Save document metadata to database
        const documentRecord = {
            organization_id: organizationId,
            claim_id: claimId || null,
            document_type: documentType || 'general',
            document_category: documentCategory || 'uploaded',
            file_name: fileName,
            file_path: uniqueFileName,
            file_size: binaryData.length,
            mime_type: mimeType,
            file_url: publicUrl,
            document_title: description || fileName,
            description: description || '',
            is_public: false,
            uploaded_by: userId,
            ai_summary: aiAnalysis?.summary || null,
            ai_entities: aiAnalysis ? JSON.stringify(aiAnalysis) : null
        };

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(documentRecord)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const documentData = await insertResponse.json();

        // Create activity log entry
        const activityRecord = {
            organization_id: organizationId,
            claim_id: claimId || null,
            activity_type: 'document_uploaded',
            activity_category: 'file_management',
            title: `Document uploaded: ${fileName}`,
            description: `Document "${fileName}" was uploaded${aiAnalysis ? ' and analyzed by AI' : ''}`,
            activity_data: JSON.stringify({
                document_id: documentData[0].id,
                file_size: binaryData.length,
                mime_type: mimeType,
                ai_analyzed: !!aiAnalysis
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
                document: documentData[0],
                publicUrl,
                aiAnalysis
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Document upload error:', error);

        const errorResponse = {
            error: {
                code: 'DOCUMENT_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});