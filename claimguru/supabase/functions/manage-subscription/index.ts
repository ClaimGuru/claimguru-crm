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
    const { action, customerEmail, subscriptionId } = await req.json();

    if (!action || !customerEmail) {
      throw new Error('Action and customer email are required');
    }

    // Get Stripe API key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe configuration missing');
    }

    let result;

    switch (action) {
      case 'create_portal_session':
        result = await createCustomerPortalSession(customerEmail, stripeSecretKey, req.headers.get('origin') || '');
        break;
        
      case 'cancel_subscription':
        if (!subscriptionId) {
          throw new Error('Subscription ID required for cancellation');
        }
        result = await cancelSubscription(subscriptionId, stripeSecretKey);
        break;
        
      case 'update_subscription':
        if (!subscriptionId) {
          throw new Error('Subscription ID required for update');
        }
        result = await updateSubscription(subscriptionId, stripeSecretKey, req);
        break;
        
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify({
      data: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Subscription management error:', error);

    const errorResponse = {
      error: {
        code: 'SUBSCRIPTION_MANAGEMENT_FAILED',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Create customer portal session for self-service billing management
async function createCustomerPortalSession(customerEmail: string, stripeSecretKey: string, origin: string) {
  // Find customer by email
  const customersResponse = await fetch('https://api.stripe.com/v1/customers?email=' + encodeURIComponent(customerEmail), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  if (!customersResponse.ok) {
    throw new Error('Failed to find customer');
  }
  
  const customers = await customersResponse.json();
  if (!customers.data || customers.data.length === 0) {
    throw new Error('Customer not found');
  }
  
  const customer = customers.data[0];
  
  // Create portal session
  const portalData = new URLSearchParams({
    'customer': customer.id,
    'return_url': `${origin}/billing`
  });
  
  const portalResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: portalData
  });
  
  if (!portalResponse.ok) {
    const errorText = await portalResponse.text();
    throw new Error(`Failed to create portal session: ${errorText}`);
  }
  
  const portalSession = await portalResponse.json();
  
  return {
    portalUrl: portalSession.url
  };
}

// Cancel subscription
async function cancelSubscription(subscriptionId: string, stripeSecretKey: string) {
  const cancelData = new URLSearchParams({
    'cancel_at_period_end': 'true'
  });
  
  const cancelResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: cancelData
  });
  
  if (!cancelResponse.ok) {
    const errorText = await cancelResponse.text();
    throw new Error(`Failed to cancel subscription: ${errorText}`);
  }
  
  const subscription = await cancelResponse.json();
  
  return {
    subscriptionId: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  };
}

// Update subscription (e.g., change plan)
async function updateSubscription(subscriptionId: string, stripeSecretKey: string, req: Request) {
  const { newPriceId, quantity } = await req.json();
  
  if (!newPriceId) {
    throw new Error('New price ID required');
  }
  
  // Get current subscription
  const subscriptionResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`
    }
  });
  
  if (!subscriptionResponse.ok) {
    throw new Error('Failed to fetch subscription');
  }
  
  const subscription = await subscriptionResponse.json();
  const currentItemId = subscription.items.data[0].id;
  
  // Update subscription
  const updateData = new URLSearchParams({
    [`items[0][id]`]: currentItemId,
    [`items[0][price]`]: newPriceId,
    [`items[0][quantity]`]: quantity?.toString() || '1',
    'proration_behavior': 'create_prorations'
  });
  
  const updateResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: updateData
  });
  
  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    throw new Error(`Failed to update subscription: ${errorText}`);
  }
  
  const updatedSubscription = await updateResponse.json();
  
  return {
    subscriptionId: updatedSubscription.id,
    status: updatedSubscription.status,
    currentPeriodEnd: updatedSubscription.current_period_end
  };
}