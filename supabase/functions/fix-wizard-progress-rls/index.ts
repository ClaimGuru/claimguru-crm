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
    // Get the service role key from environment
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    if (!supabaseServiceKey || !supabaseUrl) {
      throw new Error('Missing Supabase configuration');
    }

    // Execute SQL to fix RLS policies
    const sqlCommands = [
      // Drop existing problematic policies
      `DROP POLICY IF EXISTS "Users can access wizard progress in their organization" ON wizard_progress;`,
      `DROP POLICY IF EXISTS "Users can create wizard progress in their organization" ON wizard_progress;`,
      
      // Create optimized single policy for all operations
      `CREATE POLICY "wizard_progress_organization_access" ON wizard_progress
        FOR ALL USING (
          organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE user_id = (SELECT auth.uid())
          )
          AND user_id = (SELECT auth.uid())
        )
        WITH CHECK (
          organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE user_id = (SELECT auth.uid())
          )
          AND user_id = (SELECT auth.uid())
        );`,
      
      // Enable access for anonymous users during onboarding
      `CREATE POLICY "wizard_progress_anon_insert" ON wizard_progress
        FOR INSERT TO anon
        WITH CHECK (
          user_id IS NULL OR user_id = (SELECT auth.uid())
        );`,
      
      // Create supporting index
      `CREATE INDEX IF NOT EXISTS idx_wizard_progress_rls_lookup 
        ON wizard_progress(organization_id, user_id);`,
      
      // Grant permissions
      `GRANT SELECT, INSERT, UPDATE, DELETE ON wizard_progress TO authenticated;`,
      `GRANT INSERT ON wizard_progress TO anon;`
    ];

    const results = [];
    
    for (const sql of sqlCommands) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ sql })
        });
        
        if (!response.ok) {
          // Try direct SQL execution
          const directResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/sql',
              'apikey': supabaseServiceKey
            },
            body: sql
          });
          
          results.push({
            sql: sql.substring(0, 50) + '...',
            success: directResponse.ok,
            status: directResponse.status
          });
        } else {
          results.push({
            sql: sql.substring(0, 50) + '...',
            success: true,
            status: response.status
          });
        }
      } catch (error) {
        results.push({
          sql: sql.substring(0, 50) + '...',
          success: false,
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'RLS policies fix attempted',
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fixing RLS policies:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});