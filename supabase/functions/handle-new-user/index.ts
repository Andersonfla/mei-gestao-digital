
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

    const user = authData?.data?.user || authData?.user;

    if (!user || !user.id) {
      console.error("Invalid user data:", user);
      return new Response(JSON.stringify({ error: "Dados de usuário não fornecidos ou inválidos" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Processing user:", user.id, user.email);

    // Verificar se o perfil já existe para evitar duplicações
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
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
        throw profileError;
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
      .single();
    
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
        throw limitsError;
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Perfil e limites do plano configurados com sucesso" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Erro interno ao processar usuário" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
