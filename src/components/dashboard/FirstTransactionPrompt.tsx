import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function FirstTransactionPrompt() {
  return (
    <section aria-label="Primeiro lançamento" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-border py-6">
      <p className="text-base font-medium text-foreground">Comece registrando sua primeira receita ou despesa.</p>
      <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0">
        <Link to="/transacoes"><Plus className="h-4 w-4 mr-2" />Registrar lançamento</Link>
      </Button>
    </section>
  );
}