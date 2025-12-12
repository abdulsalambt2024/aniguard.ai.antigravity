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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      payment_id, 
      transaction_id, 
      status, 
      amount, 
      campaign_id,
      gateway_response 
    } = await req.json();

    console.log('Webhook received:', { payment_id, status });

    // Validate required fields
    if (!payment_id || !status || !campaign_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the payment transaction
    const { data: transaction, error: fetchError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('payment_id', payment_id)
      .single();

    if (fetchError || !transaction) {
      console.error('Transaction not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update transaction status
    const { error: updateError } = await supabaseClient
      .from('payment_transactions')
      .update({
        status,
        transaction_id,
        gateway_response,
        verified_at: status === 'success' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If payment successful, create donation record
    if (status === 'success' && !transaction.donation_id) {
      const { data: donationData, error: donationError } = await supabaseClient
        .from('donations')
        .insert({
          campaign_id: transaction.campaign_id,
          user_id: transaction.user_id,
          amount: transaction.amount,
          payment_method: transaction.payment_gateway,
          payment_id: transaction.payment_id,
        })
        .select()
        .single();

      if (donationError) {
        console.error('Error creating donation:', donationError);
        return new Response(
          JSON.stringify({ error: 'Failed to create donation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update transaction with donation_id
      await supabaseClient
        .from('payment_transactions')
        .update({ donation_id: donationData.id })
        .eq('id', transaction.id);

      // Generate receipt
      const receiptNumber = `RCP-${Date.now()}-${donationData.id.substring(0, 8)}`;
      await supabaseClient
        .from('donation_receipts')
        .insert({
          donation_id: donationData.id,
          receipt_number: receiptNumber,
        });
    }

    return new Response(
      JSON.stringify({ success: true, status }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in payment-webhook function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
