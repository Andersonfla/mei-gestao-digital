-- Adicionar policies de admin para o módulo Precificação (sem alterar as existentes)
CREATE POLICY "Admins can view all pricing products"
  ON public.pricing_products FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all pricing simulations"
  ON public.pricing_simulations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all pricing history"
  ON public.pricing_product_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));