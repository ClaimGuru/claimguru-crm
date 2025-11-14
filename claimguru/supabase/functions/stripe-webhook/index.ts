Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      throw new Error('Missing Stripe signature');
    }

    // Get environment variables
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Verify webhook signature (simplified version)
    const signatureElements = signature.split(',');
    let timestamp = '';
    const signatures = [];
    
    for (const element of signatureElements) {
      const [key, value] = element.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1') {
        signatures.push(value);
      }
    }

    // Create expected signature
    const payload = timestamp + '.' + body;
    const secret = stripeWebhookSecret.startsWith('whsec_') 
      ? stripeWebhookSecret.substring(6) 
      : stripeWebhookSecret;
      
    // Import crypto for HMAC verification
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature_bytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signature_bytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Verify signature
    let signatureValid = false;
    for (const sig of signatures) {
      if (sig === expectedSignature) {
        signatureValid = true;
        break;
      }
    }

    if (!signatureValid) {
      throw new Error('Invalid webhook signature');
    }

    const event = JSON.parse(body);
    console.log('Processing Stripe webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabaseUrl, supabaseServiceKey);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, supabaseUrl, supabaseServiceKey);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabaseUrl, supabaseServiceKey);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabaseUrl, supabaseServiceKey);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, supabaseUrl, supabaseServiceKey);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, supabaseUrl, supabaseServiceKey);
        break;
        
      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'WEBHOOK_PROCESSING_FAILED',
        message: error.message
      }
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper functions for handling specific events
async function handleCheckoutCompleted(session: any, supabaseUrl: string, serviceKey: string) {
  console.log('Handling checkout completion:', session.id);
  
  if (session.mode === 'subscription' && session.subscription) {
    // The subscription will be handled by the subscription.created event
    console.log('Checkout completed for subscription:', session.subscription);
  }
}

async function handleSubscriptionCreated(subscription: any, supabaseUrl: string, serviceKey: string) {
  console.log('Creating subscription record:', subscription.id);
  
  try {
    // Get customer email
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const customerResponse = await fetch(`https://api.stripe.com/v1/customers/${subscription.customer}`, {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`
      }
    });
    
    if (!customerResponse.ok) {
      throw new Error('Failed to fetch customer details');
    }
    
    const customer = await customerResponse.json();
    
    // Find user by email
    const userResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?email=eq.${customer.email}`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      }
    });
    
    if (!userResponse.ok) {
      throw new Error('Failed to find user');
    }
    
    const users = await userResponse.json();
    if (!users || users.length === 0) {
      throw new Error('User not found');
    }
    
    const userId = users[0].id;
    
    // Insert subscription record
    const subscriptionData = {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      price_id: subscription.items.data[0].price.id,
      status: subscription.status
    };
    
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/stripe_subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(subscriptionData)
    });
    
    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      throw new Error(`Failed to insert subscription: ${errorText}`);
    }
    
    console.log('Subscription record created successfully');
    
  } catch (error) {
    console.error('Error handling subscription creation:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: any, supabaseUrl: string, serviceKey: string) {
  console.log('Updating subscription:', subscription.id);
  
  try {
    const updateData = {
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      updated_at: new Date().toISOString()
    };
    
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/stripe_subscriptions?stripe_subscription_id=eq.${subscription.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }
    );
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update subscription');
    }
    
    console.log('Subscription updated successfully');
    
  } catch (error) {
    console.error('Error handling subscription update:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: any, supabaseUrl: string, serviceKey: string) {
  console.log('Deleting subscription:', subscription.id);
  
  try {
    const updateData = {
      status: 'cancelled',
      updated_at: new Date().toISOString()
    };
    
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/stripe_subscriptions?stripe_subscription_id=eq.${subscription.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }
    );
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update subscription status');
    }
    
    console.log('Subscription marked as cancelled');
    
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(invoice: any, supabaseUrl: string, serviceKey: string) {
  console.log('Invoice payment succeeded:', invoice.id);
  // Could log payment history or update usage metrics here
}

async function handleInvoicePaymentFailed(invoice: any, supabaseUrl: string, serviceKey: string) {
  console.log('Invoice payment failed:', invoice.id);
  // Could send notification or update subscription status here
}