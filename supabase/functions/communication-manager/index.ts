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
            type, 
            recipients, 
            subject, 
            message, 
            templateId, 
            claimId, 
            clientId,
            metadata,
            scheduledTime 
        } = await req.json();

        if (!type || !recipients || (!message && !templateId)) {
            throw new Error('Missing required parameters: type, recipients, and message or templateId');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

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
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}&select=organization_id,first_name,last_name,email`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const profileData = await profileResponse.json();
        if (!profileData || profileData.length === 0) {
            throw new Error('User profile not found');
        }

        const profile = profileData[0];
        const organizationId = profile.organization_id;

        // If templateId is provided, fetch the template
        let finalMessage = message;
        let finalSubject = subject;
        
        if (templateId) {
            const templateResponse = await fetch(`${supabaseUrl}/rest/v1/communication_templates?id=eq.${templateId}&organization_id=eq.${organizationId}`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            const templateData = await templateResponse.json();
            if (templateData && templateData.length > 0) {
                const template = templateData[0];
                finalSubject = template.subject_line || subject;
                finalMessage = template.body_template;

                // Simple placeholder replacement
                if (metadata) {
                    for (const [key, value] of Object.entries(metadata)) {
                        const placeholder = `{{${key}}}`;
                        finalMessage = finalMessage.replace(new RegExp(placeholder, 'g'), value);
                        if (finalSubject) {
                            finalSubject = finalSubject.replace(new RegExp(placeholder, 'g'), value);
                        }
                    }
                }

                // Update template usage count
                await fetch(`${supabaseUrl}/rest/v1/communication_templates?id=eq.${templateId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        usage_count: template.usage_count + 1,
                        updated_at: new Date().toISOString()
                    })
                });
            }
        }

        // Process recipients and send communications
        const results = [];
        const timestamp = new Date().toISOString();

        for (const recipient of recipients) {
            try {
                let communicationResult = {
                    recipient: recipient,
                    type: type,
                    status: 'pending',
                    error: null
                };

                if (type === 'email') {
                    // For demo purposes, simulate email sending
                    // In production, integrate with SendGrid, AWS SES, or similar
                    
                    communicationResult.status = 'sent';
                    communicationResult.message_id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    
                } else if (type === 'sms') {
                    // For demo purposes, simulate SMS sending
                    // In production, integrate with Twilio, AWS SNS, or similar
                    
                    communicationResult.status = 'sent';
                    communicationResult.message_id = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    
                } else if (type === 'notification') {
                    // Create in-app notification
                    const notificationRecord = {
                        organization_id: organizationId,
                        recipient_id: recipient, // Assuming recipient is user ID for notifications
                        sender_id: userId,
                        notification_type: 'communication',
                        title: finalSubject || 'New Message',
                        message: finalMessage,
                        metadata: metadata ? JSON.stringify(metadata) : null,
                        delivery_method: 'in_app'
                    };

                    const notificationResponse = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(notificationRecord)
                    });

                    if (notificationResponse.ok) {
                        communicationResult.status = 'delivered';
                    } else {
                        communicationResult.status = 'failed';
                        communicationResult.error = 'Failed to create notification';
                    }
                }

                results.push(communicationResult);

                // Create activity log for communication
                const activityRecord = {
                    organization_id: organizationId,
                    claim_id: claimId || null,
                    client_id: clientId || null,
                    activity_type: 'communication_sent',
                    activity_category: 'communication',
                    title: `${type.toUpperCase()} sent: ${finalSubject || 'Message'}`,
                    description: `${type} communication sent to ${recipient}`,
                    activity_data: JSON.stringify({
                        communication_type: type,
                        recipient: recipient,
                        subject: finalSubject,
                        template_id: templateId,
                        message_id: communicationResult.message_id,
                        status: communicationResult.status
                    }),
                    communication_method: type,
                    communication_direction: 'outbound',
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

            } catch (recipientError) {
                results.push({
                    recipient: recipient,
                    type: type,
                    status: 'failed',
                    error: recipientError.message
                });
            }
        }

        // Summary statistics
        const summary = {
            total_sent: results.filter(r => r.status === 'sent' || r.status === 'delivered').length,
            total_failed: results.filter(r => r.status === 'failed').length,
            total_pending: results.filter(r => r.status === 'pending').length
        };

        return new Response(JSON.stringify({
            data: {
                results: results,
                summary: summary,
                message: finalMessage,
                subject: finalSubject,
                sent_at: timestamp
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Communication manager error:', error);

        const errorResponse = {
            error: {
                code: 'COMMUNICATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});