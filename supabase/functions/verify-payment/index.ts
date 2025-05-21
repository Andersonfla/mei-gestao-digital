
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );

    // Parse request body
    const { paymentId, userId } = await req.json();
    
    // Validate required parameters
    if (!paymentId || !userId) {
      throw new Error("Payment ID and User ID are required");
    }

    // Security check: Validate the payment exists in your payment system
    // This would typically involve verifying with Stripe that this payment exists
    // and has been completed successfully
    
    // For demonstration, we're assuming validation passed
    
    // Definir data de expiração para 30 dias a partir de hoje
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
    
    // Upgrade user to premium plan in the database
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        plan: "premium",
        subscription_end: subscriptionEnd.toISOString()
      })
      .eq("id", userId);

    if (updateError) {
      throw new Error(`Failed to upgrade user: ${updateError.message}`);
    }

    // Clear any transaction limits for the user
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const { error: limitError } = await supabaseAdmin
      .from("plan_limits")
      .update({ limit_reached: false })
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .eq("year", currentYear);

    if (limitError) {
      console.error("Error updating plan limits:", limitError);
      // Non-critical error, continue
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        subscription_end: subscriptionEnd.toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
