import { supabase } from "@/integrations/supabase/client";
import { Backup } from "@/types/finance";

export const generateBackup = async (): Promise<Backup> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Buscar todas as transações
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id);

  // Buscar carteiras
  const { data: wallets } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id);

  // Buscar categorias personalizadas
  const { data: customCategories } = await supabase
    .from('custom_categories')
    .select('*')
    .eq('user_id', user.id);

  // Criar objeto de backup
  const backupData = {
    transactions: transactions || [],
    wallets: wallets || [],
    customCategories: customCategories || [],
    generated_at: new Date().toISOString()
  };

  // Salvar backup no banco
  const { data, error } = await supabase
    .from('backups')
    .insert({
      user_id: user.id,
      file_data: backupData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllBackups = async (): Promise<Backup[]> => {
  const { data, error } = await supabase
    .from('backups')
    .select('*')
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const downloadBackup = (backup: Backup): void => {
  const dataStr = JSON.stringify(backup.file_data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup_mei_financas_${new Date(backup.generated_at).toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
