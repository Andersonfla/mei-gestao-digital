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
