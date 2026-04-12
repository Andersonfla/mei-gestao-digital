
-- Índices para pricing_products
CREATE INDEX IF NOT EXISTS idx_pricing_products_user_id ON public.pricing_products (user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_products_is_active ON public.pricing_products (is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_products_created_at ON public.pricing_products (created_at);

-- Índices para pricing_product_history
CREATE INDEX IF NOT EXISTS idx_pricing_product_history_product_id ON public.pricing_product_history (product_id);
CREATE INDEX IF NOT EXISTS idx_pricing_product_history_user_id ON public.pricing_product_history (user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_product_history_created_at ON public.pricing_product_history (created_at);

-- Índices para pricing_simulations
CREATE INDEX IF NOT EXISTS idx_pricing_simulations_user_id ON public.pricing_simulations (user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_simulations_product_id ON public.pricing_simulations (product_id);
CREATE INDEX IF NOT EXISTS idx_pricing_simulations_created_at ON public.pricing_simulations (created_at);
