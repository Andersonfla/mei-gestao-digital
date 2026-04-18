import { UserPlan } from "@/types/finance";

/**
 * Centralized plan permissions.
 * Single source of truth for what each plan can access.
 *
 * Rules:
 * - free:    20 lançamentos/mês, dashboard básico, relatórios básicos, categorização simples
 * - premium: tudo do free + lançamentos ilimitados, dashboard avançado, relatórios avançados,
 *            exportação PDF, suporte prioritário
 * - master:  tudo do premium + relatórios profissionais, gráficos detalhados, exportações
 *            avançadas, categorização inteligente, suporte VIP, metas financeiras,
 *            análise automática, módulo de precificação
 */

export const PLAN_PRICES = {
  free: 0,
  premium: 19.9,
  master: 29.9,
} as const;

export const PLAN_LABELS: Record<UserPlan, string> = {
  free: "Gratuito",
  premium: "Premium",
  master: "Premium Master",
};

export const FREE_TRANSACTION_LIMIT = 20;

export type PlanFeature =
  | "unlimited_transactions"
  | "advanced_dashboard"
  | "advanced_reports"
  | "pdf_export"
  | "priority_support"
  | "professional_reports"
  | "detailed_charts"
  | "advanced_exports"
  | "smart_categorization"
  | "vip_support"
  | "financial_goals"
  | "auto_analysis"
  | "pricing_module"
  | "recurring_transactions";

const PLAN_FEATURES: Record<UserPlan, PlanFeature[]> = {
  free: [],
  premium: [
    "unlimited_transactions",
    "advanced_dashboard",
    "advanced_reports",
    "pdf_export",
    "priority_support",
  ],
  master: [
    "unlimited_transactions",
    "advanced_dashboard",
    "advanced_reports",
    "pdf_export",
    "priority_support",
    "professional_reports",
    "detailed_charts",
    "advanced_exports",
    "smart_categorization",
    "vip_support",
    "financial_goals",
    "auto_analysis",
    "pricing_module",
    "recurring_transactions",
  ],
};

/**
 * Check whether a plan grants access to a given feature,
 * considering plan hierarchy (master ⊇ premium ⊇ free).
 */
export function planHasFeature(plan: UserPlan, feature: PlanFeature): boolean {
  return PLAN_FEATURES[plan]?.includes(feature) ?? false;
}

export const PREMIUM_FEATURE_LIST: string[] = [
  "Lançamentos ilimitados",
  "Dashboard completo e avançado",
  "Relatórios avançados",
  "Exportação de relatórios em PDF",
  "Suporte prioritário",
];

export const MASTER_FEATURE_LIST: string[] = [
  "Tudo do Plano Premium",
  "Relatórios profissionais",
  "Gráficos adicionais detalhados",
  "Exportações avançadas",
  "Categorização inteligente",
  "Suporte VIP prioritário",
  "Módulo de Metas Financeiras",
  "Módulo de Análise Automática",
  "Módulo de Precificação",
];

export const FREE_FEATURE_LIST: string[] = [
  "Até 20 lançamentos por mês",
  "Dashboard básico",
  "Relatórios básicos",
  "Categorização simples de transações",
];
