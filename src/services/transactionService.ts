import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/finance";
import { format } from "date-fns";

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  // Verificar se há uma sessão ativa
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    console.error("Nenhum usuário autenticado encontrado para addTransaction");
    throw new Error("Você precisa estar logado para adicionar transações");
  }

  // Formatar objeto Date para string se necessário
  const formattedTransaction = {
    ...transaction,
    user_id: session.user.id,
    date: transaction.date instanceof Date ? format(transaction.date, 'yyyy-MM-dd') : transaction.date,
  };

  console.log("🚀 Enviando transação:", formattedTransaction);

  const { data, error } = await supabase
    .from('transactions')
    .insert(formattedTransaction)
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar transação:', error);
    throw error;
  }

  // === ✅ Lógica de atualização de limites_planos ===
  try {
    const mesAnoAtual = format(new Date(), 'MM/yyyy');

    // Tenta buscar o limite existente
    const { data: limite, error: limiteError } = await supabase
      .from('limites_planos')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('mes_ano', mesAnoAtual)
      .single();

    if (limiteError && limiteError.code !== 'PGRST116') {
      console.error('Erro ao buscar limites_planos:', limiteError);
      throw limiteError;
    }

    if (limite) {
      // Atualiza o total de lançamentos
      await supabase
        .from('limites_planos')
        .update({ total_lancamentos: limite.total_lancamentos + 1 })
        .eq('id', limite.id);
    } else {
      // Cria novo registro
      await supabase
        .from('limites_planos')
        .insert({
          user_id: session.user.id,
          mes_ano: mesAnoAtual,
          total_lancamentos: 1,
        });
    }
  } catch (limiteUpdateError) {
    console.error('Erro ao atualizar limites_planos:', limiteUpdateError);
    // (Opcional) Não lançar o erro se quiser que a transação funcione mesmo se o limite falhar
  }

  return data as Transaction;
}

