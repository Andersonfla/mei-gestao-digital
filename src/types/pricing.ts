export type PricingProduct = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  description: string | null;
  ingredient_cost: number;
  packaging_cost: number;
  operational_cost: number;
  platform_fee: number;
  delivery_cost: number;
  other_costs: number;
  sale_price: number;
  average_units_sold: number;
  sales_share_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PricingProductFormData = Omit<PricingProduct, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export type PricingProductHistory = {
  id: string;
  product_id: string;
  user_id: string;
  old_sale_price: number | null;
  new_sale_price: number | null;
  old_total_cost: number | null;
  new_total_cost: number | null;
  change_type: string;
  notes: string | null;
  created_at: string;
};

export type PricingSimulation = {
  id: string;
  user_id: string;
  product_id: string | null;
  current_price: number;
  simulated_price: number;
  current_profit: number;
  simulated_profit: number;
  current_margin: number;
  simulated_margin: number;
  notes: string | null;
  created_at: string;
};

// Keep legacy types for backward compat
export type Product = {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  category: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  fixed_costs: number;
  variable_costs: number;
  labor_cost: number;
  desired_margin: number;
  monthly_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductFormData = Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export type PriceSimulation = {
  costPrice: number;
  fixedCosts: number;
  variableCosts: number;
  laborCost: number;
  desiredMargin: number;
  suggestedPrice: number;
  profit: number;
};

export type TicketSimulation = {
  totalRevenue: number;
  totalSales: number;
  averageTicket: number;
  targetTicket: number;
  gap: number;
};
