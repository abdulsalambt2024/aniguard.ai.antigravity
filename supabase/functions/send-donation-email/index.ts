import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "donation_success" | "payment_confirmation" | "campaign_update";
  recipientEmail: string;
  recipientName?: string;
  donationAmount?: number;
  campaignTitle?: string;
  campaignId?: string;
  transactionId?: string;
  message?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      type, 
      recipientEmail, 
      recipientName, 
      donationAmount, 
      campaignTitle,
      transactionId,
      message 
    }: EmailRequest = await req.json();

    console.log(`Sending ${type} email to ${recipientEmail}`);

    let subject = "";
    let html = "";

    switch (type) {
      case "donation_success":
        subject = `Thank you for your donation to ${campaignTitle}!`;
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .amount { font-size: 36px; font-weight: bold; color: #10B981; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
              .btn { display: inline-block; background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🙏 Thank You!</h1>
                <p>Your generosity makes a difference</p>
              </div>
              <div class="content">
                <p>Dear ${recipientName || "Donor"},</p>
                <p>Your donation to <strong>${campaignTitle}</strong> has been received successfully!</p>
                <div class="amount">₹${donationAmount?.toLocaleString()}</div>
                <p>Transaction ID: <code>${transactionId || "N/A"}</code></p>
                <p>Your contribution helps us continue our mission of empowering rural youth and making a difference, one Sunday at a time.</p>
                <p>We are grateful for your support!</p>
                <p>With gratitude,<br><strong>Team PARIVARTAN</strong></p>
              </div>
              <div class="footer">
                <p>PARIVARTAN - Enlighten a Child, Discover a Personality</p>
                <p>Educating & Empowering Rural Youth</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case "payment_confirmation":
        subject = `Payment Confirmed - ${campaignTitle}`;
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #10B981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Payment Confirmed</h1>
              </div>
              <div class="content">
                <p>Dear ${recipientName || "Donor"},</p>
                <p>Your payment has been verified and confirmed.</p>
                <div class="details">
                  <p><strong>Campaign:</strong> ${campaignTitle}</p>
                  <p><strong>Amount:</strong> ₹${donationAmount?.toLocaleString()}</p>
                  <p><strong>Transaction ID:</strong> ${transactionId || "N/A"}</p>
                </div>
                <p>Thank you for your support!</p>
                <p>Team PARIVARTAN</p>
              </div>
              <div class="footer">
                <p>PARIVARTAN - Making a difference, One Sunday at a Time</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case "campaign_update":
        subject = `Campaign Update: ${campaignTitle}`;
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #F59E0B; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📢 Campaign Update</h1>
              </div>
              <div class="content">
                <p>Dear ${recipientName || "Supporter"},</p>
                <p>${message || `We have an update on the campaign "${campaignTitle}".`}</p>
                <p>Thank you for your continued support!</p>
                <p>Team PARIVARTAN</p>
              </div>
              <div class="footer">
                <p>PARIVARTAN - Enlighten a Child, Discover a Personality</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "PARIVARTAN <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
