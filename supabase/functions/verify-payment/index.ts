import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

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

    // Get user from JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError) {
      throw new Error(`Auth error: ${userError.message}`);
    }

    const userId = userData.user.id;
    if (!userId) {
      throw new Error("User ID not found");
    }

    // Initialize Stripe to verify payment
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Parse request body for session verification (optional)
    let sessionId: string | undefined;
    try {
      const body = await req.json();
      sessionId = body.sessionId;
    } catch {
      // No session ID provided - proceed with user verification
    }

    // If session ID is provided, verify it with Stripe
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      // Verify session belongs to this user and is paid
      if (session.client_reference_id !== userId || session.payment_status !== 'paid') {
        throw new Error("Invalid or unpaid session");
      }
    } else {
      // No session ID - check if user has any successful payments in Stripe
      const customers = await stripe.customers.list({ 
        email: userData.user.email,
        limit: 1 
      });
      
      if (customers.data.length === 0) {
        throw new Error("No Stripe customer found for this user");
      }

      // Check for successful payments
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customers.data[0].id,
        limit: 10
      });

      const hasSuccessfulPayment = paymentIntents.data.some(
        payment => payment.status === 'succeeded' && 
        payment.amount >= 1990 && // R$ 19.90 or more
        payment.created > Math.floor(Date.now() / 1000) - (24 * 60 * 60) // Last 24 hours
      );

      if (!hasSuccessfulPayment) {
        throw new Error("No recent successful payments found");
      }
    }

    // Payment verified - upgrade user to premium
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
    
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
        subscription_end: subscriptionEnd.toISOString(),
        message: "Plano Premium ativado com sucesso!"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});