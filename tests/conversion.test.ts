import { describe, expect, test } from "bun:test";
import { getAuthEntry } from "../src/lib/authEntry";
import { PLAN_PRICES, FREE_TRANSACTION_LIMIT, planHasFeature, type PlanFeature } from "../src/lib/planPermissions";

describe("Entrada pública de cadastro, sem alterar autenticação", () => {
  test("CTA gratuito abre cadastro", () => expect(getAuthEntry("?tab=signup").tab).toBe("signup"));
  test("entrada existente mantém login", () => expect(getAuthEntry("").tab).toBe("login"));
  test("aba inválida mantém login", () => expect(getAuthEntry("?tab=other").tab).toBe("login"));
});
describe("Preços e limites preservados", () => {
  test("Gratuito custa zero", () => expect(PLAN_PRICES.free).toBe(0));
  test("Premium custa 19,90", () => expect(PLAN_PRICES.premium).toBe(19.9));
  test("Master custa 29,90", () => expect(PLAN_PRICES.master).toBe(29.9));
  test("Gratuito permite 20 lançamentos mensais", () => expect(FREE_TRANSACTION_LIMIT).toBe(20));
});
describe("Permissões preservadas", () => {
  const exclusive: PlanFeature[] = ["professional_reports", "detailed_charts", "advanced_exports", "smart_categorization", "vip_support", "financial_goals", "auto_analysis", "pricing_module", "recurring_transactions"];
  for (const feature of exclusive) {
    test(`Premium não libera ${feature}`, () => expect(planHasFeature("premium", feature)).toBe(false));
    test(`Master libera ${feature}`, () => expect(planHasFeature("master", feature)).toBe(true));
    test(`Gratuito não libera ${feature}`, () => expect(planHasFeature("free", feature)).toBe(false));
  }
  for (const feature of ["unlimited_transactions", "advanced_dashboard", "advanced_reports", "pdf_export", "priority_support"] as PlanFeature[]) {
    test(`Master inclui recurso Premium ${feature}`, () => expect(planHasFeature("master", feature)).toBe(true));
    test(`Premium libera ${feature}`, () => expect(planHasFeature("premium", feature)).toBe(true));
    test(`Gratuito não libera ${feature}`, () => expect(planHasFeature("free", feature)).toBe(false));
  }
});
