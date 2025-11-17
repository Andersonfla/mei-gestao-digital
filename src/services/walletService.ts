import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "@/types/finance";

export const getAllWallets = async (): Promise<Wallet[]> => {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createWallet = async (
  name: string,
  icon: string = 'Wallet',
  color: string = '#2563EB'
): Promise<Wallet> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('wallets')
    .insert({
      user_id: user.id,
      name,
      icon,
      color,
      is_default: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateWallet = async (
  id: string,
  updates: Partial<Pick<Wallet, 'name' | 'icon' | 'color'>>
): Promise<Wallet> => {
  const { data, error } = await supabase
    .from('wallets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteWallet = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('wallets')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const setDefaultWallet = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Remove default from all wallets
  await supabase
    .from('wallets')
    .update({ is_default: false })
    .eq('user_id', user.id);

  // Set new default
  const { error } = await supabase
    .from('wallets')
    .update({ is_default: true })
    .eq('id', id);

  if (error) throw error;
};
