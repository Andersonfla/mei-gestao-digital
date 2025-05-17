
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
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

    const { data: authData, error: authError } = await req.json();
    
    if (authError) {
      throw authError;
    }

    const { user } = authData;

    if (!user) {
      throw new Error("Dados de usuário não fornecidos");
    }

    // Criar perfil para o novo usuário
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        name: user.user_metadata?.name || "Usuário",
        plan: "premium" // Definir como premium por padrão
      });

    if (profileError) {
      throw profileError;
    }

    // Inicializar plan_limits para o mês atual
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
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
      throw limitsError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
