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
        const { action, userId, organizationId, roleType, assignedBy } = await req.json();

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

        // Check organization subscription limits
        const subscriptionResponse = await fetch(`${supabaseUrl}/rest/v1/organization_subscriptions?organization_id=eq.${organizationId}&select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        const subscriptions = await subscriptionResponse.json();
        if (!subscriptions || subscriptions.length === 0) {
            throw new Error('No active subscription found for organization');
        }

        const subscription = subscriptions[0];

        if (action === 'assign_role') {
            // Check current user counts
            const userCountResponse = await fetch(`${supabaseUrl}/rest/v1/user_role_details?organization_id=eq.${organizationId}&is_active=eq.true&select=role_type`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            const existingRoles = await userCountResponse.json();
            const roleCounts = {
                assignable_user: 0,
                admin_user: 0,
                office_staff: 0,
                sales_user: 0
            };

            existingRoles.forEach(role => {
                roleCounts[role.role_type] = (roleCounts[role.role_type] || 0) + 1;
            });

            // Validate against subscription limits
            if (roleType === 'assignable_user' && roleCounts.assignable_user >= subscription.max_assignable_users) {
                throw new Error(`Maximum assignable users (${subscription.max_assignable_users}) reached for current subscription`);
            }

            if (roleType === 'office_staff' && roleCounts.office_staff >= subscription.max_office_staff) {
                throw new Error(`Maximum office staff (${subscription.max_office_staff}) reached for current subscription`);
            }

            // Business rule: 1 admin per assignable user
            if (roleType === 'admin_user' && roleCounts.admin_user >= roleCounts.assignable_user + 1) {
                throw new Error('Cannot exceed 1 admin user per assignable user ratio');
            }

            // Insert role assignment
            const roleData = {
                user_id: userId,
                organization_id: organizationId,
                role_type: roleType,
                is_billable: roleType === 'assignable_user',
                can_have_claims_assigned: roleType === 'assignable_user',
                assigned_by: currentUser.id,
                is_active: true
            };

            const insertResponse = await fetch(`${supabaseUrl}/rest/v1/user_role_details`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(roleData)
            });

            if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                throw new Error(`Failed to assign role: ${errorText}`);
            }

            const result = await insertResponse.json();

            // Update storage quota if assignable user added
            if (roleType === 'assignable_user') {
                await updateStorageQuota(supabaseUrl, serviceRoleKey, organizationId);
            }

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    role: result[0],
                    message: `Role ${roleType} assigned successfully`
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'remove_role') {
            const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/user_role_details?user_id=eq.${userId}&organization_id=eq.${organizationId}&role_type=eq.${roleType}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_active: false, updated_at: new Date().toISOString() })
            });

            if (!deleteResponse.ok) {
                throw new Error('Failed to remove role');
            }

            // Update storage quota if assignable user removed
            if (roleType === 'assignable_user') {
                await updateStorageQuota(supabaseUrl, serviceRoleKey, organizationId);
            }

            return new Response(JSON.stringify({
                data: {
                    success: true,
                    message: `Role ${roleType} removed successfully`
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'validate_claim_assignment') {
            // Check if user can have claims assigned
            const roleResponse = await fetch(`${supabaseUrl}/rest/v1/user_role_details?user_id=eq.${userId}&organization_id=eq.${organizationId}&is_active=eq.true&can_have_claims_assigned=eq.true`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            const roles = await roleResponse.json();
            const canAssignClaims = roles && roles.length > 0;

            return new Response(JSON.stringify({
                data: {
                    canAssignClaims,
                    message: canAssignClaims ? 'User can have claims assigned' : 'Only assignable users can have claims assigned'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Invalid action specified');

    } catch (error) {
        console.error('User role management error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'USER_ROLE_MANAGEMENT_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function updateStorageQuota(supabaseUrl: string, serviceRoleKey: string, organizationId: string) {
    // Get current assignable user count
    const userCountResponse = await fetch(`${supabaseUrl}/rest/v1/user_role_details?organization_id=eq.${organizationId}&role_type=eq.assignable_user&is_active=eq.true&select=id`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    const assignableUsers = await userCountResponse.json();
    const assignableUserCount = assignableUsers.length;

    // Get organization subscription to determine base storage
    const subResponse = await fetch(`${supabaseUrl}/rest/v1/organization_subscriptions?organization_id=eq.${organizationId}&select=*`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    const subscriptions = await subResponse.json();
    if (subscriptions && subscriptions.length > 0) {
        const subscription = subscriptions[0];
        let baseStorage = 1; // Default 1TB for individual
        
        if (subscription.tier === 'firm') {
            baseStorage = 5; // 5TB base for firm
        } else if (subscription.tier === 'enterprise') {
            baseStorage = -1; // Unlimited for enterprise
        }

        const totalQuotaGB = baseStorage === -1 ? -1 : (baseStorage + assignableUserCount - 1) * 1024; // Convert TB to GB

        // Update or insert storage quota
        await fetch(`${supabaseUrl}/rest/v1/storage_quota_tracking`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
                organization_id: organizationId,
                total_quota_gb: totalQuotaGB,
                assignable_user_count: assignableUserCount,
                last_calculated_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        });
    }
}