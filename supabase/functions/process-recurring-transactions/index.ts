import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string | null;
  type: string;
  category: string;
  value: number;
  frequency: string;
  start_date: string;
  end_date: string | null;
  next_date: string;
  active: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const today = new Date().toISOString().split('T')[0];
    
    console.log(`[${new Date().toISOString()}] Iniciando processamento de transações recorrentes...`);

    // Buscar todas as transações recorrentes ativas que precisam ser processadas
    const { data: recurringTransactions, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('active', true)
      .lte('next_date', today);

    if (fetchError) {
      console.error('Erro ao buscar transações recorrentes:', fetchError);
      throw fetchError;
    }

    console.log(`Encontradas ${recurringTransactions?.length || 0} transações recorrentes para processar`);

    if (!recurringTransactions || recurringTransactions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma transação recorrente para processar',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processedCount = 0;
    let errorCount = 0;

    // Processar cada transação recorrente
    for (const recurring of recurringTransactions as RecurringTransaction[]) {
      try {
        // Verificar se já passou da data de término (se definida)
        if (recurring.end_date && recurring.next_date > recurring.end_date) {
          console.log(`Transação recorrente ${recurring.id} passou da data de término. Desativando...`);
          await supabase
            .from('recurring_transactions')
            .update({ active: false })
            .eq('id', recurring.id);
          continue;
        }

        // Criar a transação
        const { error: insertError } = await supabase
          .from('transactions')
          .insert({
            user_id: recurring.user_id,
            description: recurring.description || 'Transação recorrente',
            type: recurring.type,
            category: recurring.category,
            value: recurring.value,
            date: recurring.next_date,
          });

        if (insertError) {
          console.error(`Erro ao criar transação para ${recurring.id}:`, insertError);
          errorCount++;
          continue;
        }

        // Calcular próxima data baseado na frequência
        const nextDate = calculateNextDate(recurring.next_date, recurring.frequency);

        // Atualizar a próxima data da transação recorrente
        const { error: updateError } = await supabase
          .from('recurring_transactions')
          .update({ next_date: nextDate })
          .eq('id', recurring.id);

        if (updateError) {
          console.error(`Erro ao atualizar próxima data para ${recurring.id}:`, updateError);
          errorCount++;
          continue;
        }

        console.log(`✅ Transação criada para usuário ${recurring.user_id}: ${recurring.description} (${recurring.value})`);
        processedCount++;

      } catch (error) {
        console.error(`Erro ao processar transação recorrente ${recurring.id}:`, error);
        errorCount++;
      }
    }

    console.log(`[${new Date().toISOString()}] Processamento concluído: ${processedCount} sucesso, ${errorCount} erros`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Processamento concluído',
        processed: processedCount,
        errors: errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro geral no processamento:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function calculateNextDate(currentDate: string, frequency: string): string {
  const date = new Date(currentDate);
  
  switch (frequency.toLowerCase()) {
    case 'diaria':
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    
    case 'semanal':
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    
    case 'quinzenal':
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    
    case 'mensal':
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    
    case 'bimestral':
    case 'bimonthly':
      date.setMonth(date.getMonth() + 2);
      break;
    
    case 'trimestral':
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    
    case 'semestral':
    case 'semiannual':
      date.setMonth(date.getMonth() + 6);
      break;
    
    case 'anual':
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    
    default:
      // Padrão: mensal
      date.setMonth(date.getMonth() + 1);
  }
  
  return date.toISOString().split('T')[0];
}
