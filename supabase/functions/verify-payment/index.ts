
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
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get the user from the JWT token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      throw new Error(`Auth error: ${userError.message}`);
    }

    const userId = userData.user.id;
    if (!userId) {
      throw new Error("User ID not found");
    }

    // Busca cliente no Stripe pelo email do usuário
    const customers = await stripe.customers.list({
      email: userData.user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      throw new Error("Customer not found in Stripe");
    }

    const customerId = customers.data[0].id;

    // Verifica se o cliente tem uma assinatura ativa
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let hasActiveSubscription = subscriptions.data.length > 0;

    // Create Supabase admin client using service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );

    // Atualiza o plano do usuário no banco de dados
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ plan: hasActiveSubscription ? "premium" : "free" })
      .eq("id", userId);

    if (updateError) {
      throw new Error(`Failed to update user plan: ${updateError.message}`);
    }

    // Limpa qualquer limitação de transações para o usuário se tiver assinatura ativa
    if (hasActiveSubscription) {
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
        // Erro não crítico, continua
      }
    }

    return new Response(
      JSON.stringify({ success: true, hasActiveSubscription }),
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
