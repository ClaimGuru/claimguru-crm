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
        const { action, clientId, organizationId, portalPin } = await req.json();

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        if (action === 'authenticate') {
            if (!clientId || !portalPin) {
                throw new Error('Client ID and portal PIN are required');
            }

            // Verify client credentials
            const clientResponse = await fetch(`${supabaseUrl}/rest/v1/clients?id=eq.${clientId}&portal_pin=eq.${portalPin}&is_active=eq.true`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            const clients = await clientResponse.json();
            if (!clients || clients.length === 0) {
                throw new Error('Invalid client credentials');
            }

            const client = clients[0];

            return new Response(JSON.stringify({
                data: {
                    authenticated: true,
                    client: {
                        id: client.id,
                        firstName: client.first_name,
                        lastName: client.last_name,
                        email: client.primary_email,
                        organizationId: client.organization_id
                    }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'get_claims') {
            // Get client's claims
            const claimsResponse = await fetch(`${supabaseUrl}/rest/v1/claims?client_id=eq.${clientId}&organization_id=eq.${organizationId}&select=*`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            const claims = await claimsResponse.json();

            // Get assigned adjusters for each claim
            for (const claim of claims) {
                const assignmentResponse = await fetch(`${supabaseUrl}/rest/v1/claim_assignments?claim_id=eq.${claim.id}&is_active=eq.true&select=*`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                const assignments = await assignmentResponse.json();
                
                // Get user profiles for assigned users
                if (assignments && assignments.length > 0) {
                    const userIds = assignments.map(a => a.user_id);
                    const usersResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=in.(${userIds.join(',')})&select=first_name,last_name,email`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    });

                    const users = await usersResponse.json();
                    claim.assignedAdjusters = users;
                } else {
                    claim.assignedAdjusters = [];
                }
            }

            return new Response(JSON.stringify({
                data: {
                    claims: claims.map(claim => ({
                        id: claim.id,
                        fileNumber: claim.file_number,
                        claimNumber: claim.claim_number,
                        status: claim.claim_status,
                        phase: claim.claim_phase,
                        dateOfLoss: claim.date_of_loss,
                        causeOfLoss: claim.cause_of_loss,
                        lossDescription: claim.loss_description,
                        estimatedValue: claim.estimated_loss_value,
                        settlementAmount: claim.total_settlement_amount,
                        settlementStatus: claim.settlement_status,
                        assignedAdjusters: claim.assignedAdjusters,
                        createdAt: claim.created_at
                    }))
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'get_documents') {
            const { claimId } = await req.json();
            
            // Get client-accessible documents for the claim
            const documentsResponse = await fetch(`${supabaseUrl}/rest/v1/documents?client_id=eq.${clientId}&claim_id=eq.${claimId}&is_public=eq.true&select=*`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            const documents = await documentsResponse.json();

            return new Response(JSON.stringify({
                data: {
                    documents: documents.map(doc => ({
                        id: doc.id,
                        fileName: doc.file_name,
                        documentTitle: doc.document_title,
                        documentType: doc.document_type,
                        documentCategory: doc.document_category,
                        fileUrl: doc.file_url,
                        fileSize: doc.file_size,
                        uploadedAt: doc.created_at
                    }))
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'get_communications') {
            // Get communications for client
            const communicationsResponse = await fetch(`${supabaseUrl}/rest/v1/communications?organization_id=eq.${organizationId}&client_id=eq.${clientId}&select=*&order=created_at.desc`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            const communications = await communicationsResponse.json();

            return new Response(JSON.stringify({
                data: {
                    communications: communications.map(comm => ({
                        id: comm.id,
                        subject: comm.subject,
                        content: comm.content,
                        type: comm.communication_type,
                        direction: comm.direction,
                        status: comm.status,
                        createdAt: comm.created_at
                    }))
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Invalid action specified');

    } catch (error) {
        console.error('Client portal error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'CLIENT_PORTAL_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});