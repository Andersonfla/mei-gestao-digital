import type { PricingProduct } from "@/types/pricing";

// ── Core calculations ──────────────────────────────────────

export function calcTotalCost(p: Pick<PricingProduct, "ingredient_cost" | "packaging_cost" | "operational_cost" | "platform_fee" | "delivery_cost" | "other_costs">): number {
  return (p.ingredient_cost || 0) +
    (p.packaging_cost || 0) +
    (p.operational_cost || 0) +
    (p.platform_fee || 0) +
    (p.delivery_cost || 0) +
    (p.other_costs || 0);
}

export function calcProfit(salePrice: number, totalCost: number): number {
  return (salePrice || 0) - totalCost;
}

/** Margem % = (lucro / preço) * 100. Retorna 0 se preço = 0. */
export function calcMarginPercent(salePrice: number, totalCost: number): number {
  const price = salePrice || 0;
  if (price === 0) return 0;
  return ((price - totalCost) / price) * 100;
}

/** Markup = preço / custo. Retorna 0 se custo = 0. */
export function calcMarkup(salePrice: number, totalCost: number): number {
  if (totalCost === 0) return 0;
  return (salePrice || 0) / totalCost;
}

/** Markup % = ((preço - custo) / custo) * 100. Retorna 0 se custo = 0. */
export function calcMarkupPercent(salePrice: number, totalCost: number): number {
  if (totalCost === 0) return 0;
  return (((salePrice || 0) - totalCost) / totalCost) * 100;
}

// ── Preço mínimo e sugerido ────────────────────────────────

/** Preço mínimo sem prejuízo = custo total */
export function calcMinPrice(totalCost: number): number {
  return totalCost;
}

/** Margens alvo disponíveis */
export const TARGET_MARGINS = [0.15, 0.20, 0.25, 0.30] as const;

/** Preço sugerido = custo / (1 - margem). Retorna 0 se margem >= 1. */
export function calcSuggestedPrice(totalCost: number, targetMargin: number): number {
  if (targetMargin >= 1) return 0;
  return totalCost / (1 - targetMargin);
}

/** Retorna array com preço sugerido para cada margem alvo */
export function calcAllSuggestedPrices(totalCost: number): { margin: number; label: string; price: number }[] {
  return TARGET_MARGINS.map((m) => ({
    margin: m,
    label: `${(m * 100).toFixed(0)}%`,
    price: calcSuggestedPrice(totalCost, m),
  }));
}

// ── Status do produto ──────────────────────────────────────

export type ProductHealthStatus = "prejuizo" | "muito_baixa" | "atencao" | "saudavel" | "excelente";

export interface ProductStatus {
  key: ProductHealthStatus;
  label: string;
  variant: "destructive" | "secondary" | "outline" | "default";
  color: string;
}

export function calcProductStatus(marginPercent: number): ProductStatus {
  if (marginPercent < 0) return { key: "prejuizo", label: "Prejuízo", variant: "destructive", color: "text-destructive" };
  if (marginPercent < 10) return { key: "muito_baixa", label: "Margem Muito Baixa", variant: "destructive", color: "text-destructive" };
  if (marginPercent < 20) return { key: "atencao", label: "Atenção", variant: "secondary", color: "text-amber-600" };
  if (marginPercent < 35) return { key: "saudavel", label: "Saudável", variant: "default", color: "text-emerald-600" };
  return { key: "excelente", label: "Excelente", variant: "default", color: "text-emerald-600" };
}

// ── Helper: calcula tudo de uma vez para um produto ────────

export interface ProductCalculations {
  totalCost: number;
  profit: number;
  marginPercent: number;
  markupPercent: number;
  minPrice: number;
  suggestedPrices: { margin: number; label: string; price: number }[];
  status: ProductStatus;
  monthlyProfit: number;
}

export function calcProductFull(p: PricingProduct): ProductCalculations {
  const total = calcTotalCost(p);
  const price = p.sale_price || 0;
  const profit = calcProfit(price, total);
  const marginPercent = calcMarginPercent(price, total);
  const markupPercent = calcMarkupPercent(price, total);

  return {
    totalCost: total,
    profit,
    marginPercent,
    markupPercent,
    minPrice: calcMinPrice(total),
    suggestedPrices: calcAllSuggestedPrices(total),
    status: calcProductStatus(marginPercent),
    monthlyProfit: profit * (p.average_units_sold || 0),
  };
}
