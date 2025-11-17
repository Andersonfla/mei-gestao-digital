import { supabase } from "@/integrations/supabase/client";
import { CustomCategory, TransactionType } from "@/types/finance";

export const getAllCustomCategories = async (): Promise<CustomCategory[]> => {
  const { data, error } = await supabase
    .from('custom_categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as CustomCategory[];
};

export const createCustomCategory = async (
  name: string,
  type: TransactionType,
  icon: string = 'Tag',
  color: string = '#2563EB'
): Promise<CustomCategory> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('custom_categories')
    .insert({
      user_id: user.id,
      name,
      type,
      icon,
      color
    })
    .select()
    .single();

  if (error) throw error;
  return data as CustomCategory;
};

export const updateCustomCategory = async (
  id: string,
  updates: Partial<Pick<CustomCategory, 'name' | 'icon' | 'color'>>
): Promise<CustomCategory> => {
  const { data, error } = await supabase
    .from('custom_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CustomCategory;
};

export const deleteCustomCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('custom_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
