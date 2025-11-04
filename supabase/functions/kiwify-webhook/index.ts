import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const KIWIFY_TOKEN = Deno.env.get('KIWIFY_WEBHOOK_SECRET');

interface KiwifyWebhookPayload {
  email: string;
  evento: string;
  produto: string;
  token: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 Kiwify webhook received');

    // Parse request body
    const payload: KiwifyWebhookPayload = await req.json();
    console.log('📦 Payload:', { email: payload.email, evento: payload.evento, produto: payload.produto });

    // Validate token
    if (payload.token !== KIWIFY_TOKEN) {
      console.error('❌ Invalid token');
      return new Response(
        JSON.stringify({ error: 'Token inválido ou ausente' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by email
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching users:', authError);
      throw new Error('Erro ao buscar usuários');
    }

    const user = authUsers.users.find(u => u.email === payload.email);
    
    if (!user) {
      console.warn('⚠️ User not found:', payload.email);
      
      // Log event even if user not found
      await supabase.from('webhook_logs').insert({
        email: payload.email,
        evento: payload.evento,
        produto: payload.produto,
        status: 'user_not_found'
      });

      return new Response(
        JSON.stringify({ message: 'Usuário não encontrado', email: payload.email }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine new plan based on event
    let newPlan = 'free';
    let subscriptionEnd = null;

    const eventosNegativo = ['cancelada', 'atrasada', 'expirada', 'reembolsada', 'chargeback'];
    const eventosPositivo = ['renovada', 'aprovada', 'criada', 'paga', 'completa'];

    const eventoLower = payload.evento.toLowerCase();

    if (eventosNegativo.some(e => eventoLower.includes(e))) {
      // Downgrade to free plan
      newPlan = 'free';
      subscriptionEnd = null;
      console.log('⬇️ Downgrade to free plan - Event:', payload.evento);
    } else if (eventosPositivo.some(e => eventoLower.includes(e))) {
      // Upgrade to premium - always upgrade on positive events
      newPlan = 'premium';
      // Set subscription end to 30 days from now
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      subscriptionEnd = endDate.toISOString();
      console.log('⬆️ Upgrade to premium plan - Event:', payload.evento, 'Expiration:', subscriptionEnd);
    } else {
      // Unknown event - log but don't change plan
      console.log('⚠️ Unknown event type:', payload.evento);
      await supabase.from('webhook_logs').insert({
        email: payload.email,
        evento: payload.evento,
        produto: payload.produto,
        status: 'unknown_event'
      });
      
      return new Response(
        JSON.stringify({ message: 'Evento desconhecido, plano não alterado', email: payload.email }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        plan: newPlan,
        subscription_end: subscriptionEnd
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
      throw new Error('Erro ao atualizar perfil do usuário');
    }

    console.log('✅ Profile updated successfully:', { userId: user.id, plan: newPlan });

    // Log successful webhook processing
    await supabase.from('webhook_logs').insert({
      email: payload.email,
      evento: payload.evento,
      produto: payload.produto,
      status: 'success'
    });

    return new Response(
      JSON.stringify({
        message: 'Webhook processado com sucesso',
        email: payload.email,
        plano: newPlan,
        subscriptionEnd
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});