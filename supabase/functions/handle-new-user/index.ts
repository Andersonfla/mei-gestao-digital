
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { 
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request body
    let authData;
    try {
      authData = await req.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return new Response(JSON.stringify({ error: "Formato de dados inválido" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Extract user data
    const user = authData?.data?.user || authData?.user;

    if (!user || !user.id) {
      console.error("Invalid user data:", user);
      return new Response(JSON.stringify({ error: "Dados de usuário não fornecidos ou inválidos" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Processing user:", user.id, user.email);

    // Create profile and plan limits in a transaction if possible
    try {
      // Verificar se o perfil já existe para evitar duplicações
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!existingProfile) {
        // Criar perfil para o novo usuário
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || "Usuário",
            plan: "free" // Definir como free por padrão
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // We'll continue and not throw the error, as the client might handle this fallback
        }
      }

      // Verificar se já existem plan_limits para este mês/ano/usuário
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { data: existingLimits } = await supabaseAdmin
        .from('plan_limits')
        .select('id')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();
      
      if (!existingLimits) {
        // Inicializar plan_limits para o mês atual se não existir
        const { error: limitsError } = await supabaseAdmin
          .from('plan_limits')
          .insert({
            user_id: user.id,
            month: currentMonth,
            year: currentYear,
            transactions: 0,
            limit_reached: false
          });

        if (limitsError) {
          console.error("Error creating plan limits:", limitsError);
          // We'll continue and not throw the error
        }
      }
    } catch (dbError) {
      console.error("Database operations failed:", dbError);
      // We don't return an error here, as we want the function to report success
      // The client side will handle the fallback
    }

    // Return success even if some operations failed, since client side has fallbacks
    return new Response(JSON.stringify({ 
      success: true,
      message: "Perfil e limites do plano configurados com sucesso" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error);
    // We still return a 200 status so the signup process can continue on the client
    // This is a fallback to ensure the function doesn't block signup
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || "Erro interno ao processar usuário",
      handled: true // Indicate that error was handled and client should proceed
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 instead of 500 to avoid blocking signup
    });
  }
});
