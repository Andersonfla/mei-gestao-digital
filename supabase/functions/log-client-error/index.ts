import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const errorData = await req.json();
    
    // Validar dados obrigatórios
    if (!errorData.message || !errorData.route) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message, route' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log estruturado para observabilidade
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      source: 'client',
      message: errorData.message,
      route: errorData.route,
      errorId: errorData.errorId,
      userAgent: req.headers.get('user-agent'),
      // Stack trace apenas se não for produção
      ...(errorData.stack && { stack: errorData.stack }),
      ...(errorData.userId && { userId: errorData.userId }),
    };

    // Log no console do Edge Function
    console.error('Client Error:', JSON.stringify(logEntry, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true, 
        errorId: errorData.errorId,
        message: 'Error logged successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in log-client-error function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});