import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductFormData } from "@/types/pricing";

export const productService = {
  async getProducts(): Promise<Product[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as Product[];
  },

  async createProduct(product: ProductFormData): Promise<Product> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from("products")
      .insert({ ...product, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async updateProduct(id: string, product: Partial<ProductFormData>): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async toggleProductActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },
};
