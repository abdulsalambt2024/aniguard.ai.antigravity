import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user (optional for donations)
    const { data: { user } } = await supabaseClient.auth.getUser();

    const { 
      campaign_id, 
      amount, 
      donor_name,
      is_anonymous = false,
      message = null,
      payment_gateway = 'upi'
    } = await req.json();

    // Validate required fields
    if (!campaign_id || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'campaign_id and valid amount are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify campaign exists
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('id, upi_id, title')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique payment ID
    const payment_id = `PAY-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create payment transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        campaign_id,
        user_id: user?.id || null,
        amount,
        payment_gateway,
        payment_id,
        status: 'pending',
        payment_method: payment_gateway,
        gateway_response: {
          donor_name,
          is_anonymous,
          message,
        },
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return new Response(
        JSON.stringify({ error: 'Failed to initiate payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate UPI payment URL
    const upiUrl = `upi://pay?pa=${campaign.upi_id}&pn=${encodeURIComponent(campaign.title)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Donation to ' + campaign.title)}&tr=${payment_id}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_id,
        transaction_id: transaction.id,
        upi_url: upiUrl,
        status: 'pending'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in initiate-payment function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
