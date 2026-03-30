
-- 1) pricing_products
CREATE TABLE public.pricing_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text,
  description text,
  ingredient_cost numeric(12,2) DEFAULT 0,
  packaging_cost numeric(12,2) DEFAULT 0,
  operational_cost numeric(12,2) DEFAULT 0,
  platform_fee numeric(12,2) DEFAULT 0,
  delivery_cost numeric(12,2) DEFAULT 0,
  other_costs numeric(12,2) DEFAULT 0,
  sale_price numeric(12,2) DEFAULT 0,
  average_units_sold numeric(12,2) DEFAULT 0,
  sales_share_percent numeric(12,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) pricing_product_history
CREATE TABLE public.pricing_product_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.pricing_products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  old_sale_price numeric(12,2),
  new_sale_price numeric(12,2),
  old_total_cost numeric(12,2),
  new_total_cost numeric(12,2),
  change_type text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 3) pricing_simulations
CREATE TABLE public.pricing_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid REFERENCES public.pricing_products(id) ON DELETE SET NULL,
  current_price numeric(12,2) DEFAULT 0,
  simulated_price numeric(12,2) DEFAULT 0,
  current_profit numeric(12,2) DEFAULT 0,
  simulated_profit numeric(12,2) DEFAULT 0,
  current_margin numeric(12,2) DEFAULT 0,
  simulated_margin numeric(12,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_pricing_products_user_id ON public.pricing_products(user_id);
CREATE INDEX idx_pricing_products_is_active ON public.pricing_products(is_active);
CREATE INDEX idx_pricing_products_created_at ON public.pricing_products(created_at);
CREATE INDEX idx_pricing_product_history_user_id ON public.pricing_product_history(user_id);
CREATE INDEX idx_pricing_product_history_product_id ON public.pricing_product_history(product_id);
CREATE INDEX idx_pricing_product_history_created_at ON public.pricing_product_history(created_at);
CREATE INDEX idx_pricing_simulations_user_id ON public.pricing_simulations(user_id);
CREATE INDEX idx_pricing_simulations_product_id ON public.pricing_simulations(product_id);
CREATE INDEX idx_pricing_simulations_created_at ON public.pricing_simulations(created_at);

-- Trigger for updated_at
CREATE TRIGGER update_pricing_products_updated_at
  BEFORE UPDATE ON public.pricing_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS: pricing_products
ALTER TABLE public.pricing_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pricing products"
  ON public.pricing_products FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pricing products"
  ON public.pricing_products FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pricing products"
  ON public.pricing_products FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pricing products"
  ON public.pricing_products FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- RLS: pricing_product_history
ALTER TABLE public.pricing_product_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pricing history"
  ON public.pricing_product_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pricing history"
  ON public.pricing_product_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pricing history"
  ON public.pricing_product_history FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- RLS: pricing_simulations
ALTER TABLE public.pricing_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pricing simulations"
  ON public.pricing_simulations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pricing simulations"
  ON public.pricing_simulations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pricing simulations"
  ON public.pricing_simulations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pricing simulations"
  ON public.pricing_simulations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
