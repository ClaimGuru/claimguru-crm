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
    const { planType, customerEmail } = await req.json();

    if (!planType || !customerEmail) {
      throw new Error('Plan type and customer email are required');
    }

    // Get Stripe API key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe configuration missing');
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    // Get plan details from database
    const planResponse = await fetch(`${supabaseUrl}/rest/v1/stripe_plans?plan_type=eq.${planType}`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      }
    });

    if (!planResponse.ok) {
      throw new Error('Failed to fetch plan details');
    }

    const plans = await planResponse.json();
    if (!plans || plans.length === 0) {
      throw new Error('Plan not found');
    }

    const plan = plans[0];
    const priceId = plan.price_id;

    // Create or retrieve Stripe customer
    let customer;
    
    // First, try to find existing customer
    const existingCustomerResponse = await fetch('https://api.stripe.com/v1/customers?email=' + encodeURIComponent(customerEmail), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (existingCustomerResponse.ok) {
      const existingCustomers = await existingCustomerResponse.json();
      if (existingCustomers.data && existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      }
    }

    // Create customer if not found
    if (!customer) {
      const customerData = new URLSearchParams({
        'email': customerEmail,
        'metadata[source]': 'claimguru',
        'metadata[plan_type]': planType
      });

      const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: customerData
      });

      if (!customerResponse.ok) {
        const errorText = await customerResponse.text();
        throw new Error(`Failed to create customer: ${errorText}`);
      }

      customer = await customerResponse.json();
    }

    // Create Stripe Checkout Session
    const originUrl = req.headers.get('origin') || 'https://app.claimguru.com'
    const checkoutData = new URLSearchParams({
      'mode': 'subscription',
      'customer': customer.id,
      'success_url': `${originUrl}/billing?subscription=success`,
      'cancel_url': `${originUrl}/billing?subscription=cancelled`,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'metadata[plan_type]': planType,
      'metadata[customer_email]': customerEmail,
      'allow_promotion_codes': 'true',
      'billing_address_collection': 'required'
      // Remove automatic_tax for test mode
    });

    const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: checkoutData
    });

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      throw new Error(`Failed to create checkout session: ${errorText}`);
    }

    const checkoutSession = await checkoutResponse.json();

    return new Response(JSON.stringify({
      data: {
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Subscription creation error:', error);

    const errorResponse = {
      error: {
        code: 'SUBSCRIPTION_CREATION_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});