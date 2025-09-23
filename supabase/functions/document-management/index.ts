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
        const { action, documentData, organizationId, bucket = 'crm-documents' } = await req.json();

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user auth context
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid authentication token');
        }

        const currentUser = await userResponse.json();

        if (action === 'upload') {
            const { fileName, fileData, claimId, clientId, documentType, documentCategory, isPublic = false } = documentData;

            if (!fileName || !fileData) {
                throw new Error('File name and data are required');
            }

            // Check storage quota before upload
            const quotaCheck = await checkStorageQuota(supabaseUrl, serviceRoleKey, organizationId, fileData.length);
            if (!quotaCheck.allowed) {
                throw new Error(`Storage quota exceeded. Available: ${quotaCheck.available}GB, Required: ${(fileData.length / (1024*1024*1024)).toFixed(2)}GB`);
            }

            // Extract base64 data
            const base64Data = fileData.split(',')[1] || fileData;
            const mimeType = fileData.includes('data:') ? fileData.split(';')[0].split(':')[1] : 'application/octet-stream';
            const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

            // Generate unique file path
            const timestamp = Date.now();
            const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${organizationId}/${claimId || 'general'}/${timestamp}-${safeFileName}`;

            // Upload to Supabase Storage
            const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`, {
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
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;

            // Save document metadata to database
            const documentMetadata = {
                organization_id: organizationId,
                claim_id: claimId || null,
                client_id: clientId || null,
                document_type: documentType || 'general',
                document_category: documentCategory || 'uncategorized',
                file_name: fileName,
                file_path: filePath,
                file_size: binaryData.length,
                mime_type: mimeType,
                file_url: publicUrl,
                document_title: fileName,
                is_public: isPublic,
                is_confidential: !isPublic,
                uploaded_by: currentUser.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const insertResponse = await fetch(`${supabaseUrl}/rest/v1/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(documentMetadata)
            });

            if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                throw new Error(`Failed to save document metadata: ${errorText}`);
            }

            const document = await insertResponse.json();

            // Update storage usage
            await updateStorageUsage(supabaseUrl, serviceRoleKey, organizationId, binaryData.length);

            return new Response(JSON.stringify({
                data: {
                    document: document[0],
                    publicUrl,
                    message: 'Document uploaded successfully'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'get_storage_info') {
            const storageResponse = await fetch(`${supabaseUrl}/rest/v1/storage_quota_tracking?organization_id=eq.${organizationId}`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            const storageData = await storageResponse.json();
            const storage = storageData && storageData.length > 0 ? storageData[0] : null;

            return new Response(JSON.stringify({
                data: {
                    totalQuotaGB: storage?.total_quota_gb || 1024,
                    usedStorageGB: storage?.used_storage_gb || 0,
                    availableGB: storage ? Math.max(0, storage.total_quota_gb - storage.used_storage_gb) : 1024,
                    assignableUserCount: storage?.assignable_user_count || 1
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Invalid action specified');

    } catch (error) {
        console.error('Document management error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'DOCUMENT_MANAGEMENT_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function checkStorageQuota(supabaseUrl: string, serviceRoleKey: string, organizationId: string, fileSizeBytes: number): Promise<{allowed: boolean, available: number}> {
    const storageResponse = await fetch(`${supabaseUrl}/rest/v1/storage_quota_tracking?organization_id=eq.${organizationId}`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    const storageData = await storageResponse.json();
    if (!storageData || storageData.length === 0) {
        // No storage tracking found, allow with default quota
        return { allowed: true, available: 1024 };
    }

    const storage = storageData[0];
    
    // Enterprise has unlimited storage
    if (storage.total_quota_gb === -1) {
        return { allowed: true, available: -1 };
    }

    const availableGB = storage.total_quota_gb - (storage.used_storage_gb || 0);
    const requiredGB = fileSizeBytes / (1024 * 1024 * 1024);

    return {
        allowed: availableGB >= requiredGB,
        available: availableGB
    };
}

async function updateStorageUsage(supabaseUrl: string, serviceRoleKey: string, organizationId: string, fileSizeBytes: number) {
    const fileSizeGB = fileSizeBytes / (1024 * 1024 * 1024);
    
    // Get current storage usage
    const storageResponse = await fetch(`${supabaseUrl}/rest/v1/storage_quota_tracking?organization_id=eq.${organizationId}`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    const storageData = await storageResponse.json();
    
    if (storageData && storageData.length > 0) {
        const currentUsage = storageData[0].used_storage_gb || 0;
        const newUsage = currentUsage + fileSizeGB;

        await fetch(`${supabaseUrl}/rest/v1/storage_quota_tracking?organization_id=eq.${organizationId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                used_storage_gb: newUsage,
                updated_at: new Date().toISOString()
            })
        });
    }
}