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
        const { userId, email, firstName, lastName, companyName, phone } = await req.json();

        if (!userId || !email) {
            throw new Error('User ID and email are required');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Check if user profile already exists
        const profileCheckResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${userId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const existingProfiles = await profileCheckResponse.json();
        if (existingProfiles && existingProfiles.length > 0) {
            return new Response(JSON.stringify({
                data: {
                    message: 'User profile already exists',
                    profile: existingProfiles[0]
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Create organization first
        const orgData = {
            name: companyName || 'New Organization',
            email: email,
            phone: phone || '',
            subscription_tier: 'starter',
            subscription_status: 'trial'
        };

        const orgResponse = await fetch(`${supabaseUrl}/rest/v1/organizations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orgData)
        });

        if (!orgResponse.ok) {
            const errorText = await orgResponse.text();
            throw new Error(`Failed to create organization: ${errorText}`);
        }

        const orgResult = await orgResponse.json();
        const organization = orgResult[0];

        // Create user profile
        const profileData = {
            id: userId,
            organization_id: organization.id,
            email: email,
            first_name: firstName || '',
            last_name: lastName || '',
            role: 'admin'
        };

        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(profileData)
        });

        if (!profileResponse.ok) {
            const errorText = await profileResponse.text();
            throw new Error(`Failed to create user profile: ${errorText}`);
        }

        const profileResult = await profileResponse.json();
        const profile = profileResult[0];

        return new Response(JSON.stringify({
            data: {
                organization: organization,
                profile: profile,
                message: 'User setup completed successfully'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('User setup error:', error);

        const errorResponse = {
            error: {
                code: 'USER_SETUP_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});