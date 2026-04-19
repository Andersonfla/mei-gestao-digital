import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { FilterPeriod } from "@/components/dashboard/FilterPeriod";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";

import { AdvancedDashboard } from "@/components/dashboard/AdvancedDashboard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFinance } from "@/contexts";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isPremiumMasterActive, isLoading } = useFinance();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Render Advanced Dashboard for Premium Master users
  if (isPremiumMasterActive) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <FilterPeriod />
        </div>
        <AdvancedDashboard />
      </div>
    );
  }

  // Standard Dashboard for free and premium users
  return (
    <div className="space-y-10 w-full max-w-full">
      <InstallPrompt />

      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pt-12 sm:pt-0 animate-slide-up">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Visão geral
          </p>
          <h1 className="text-3xl md:text-[2rem] font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Acompanhe suas finanças do período</p>
        </div>
        <FilterPeriod />
      </header>

      <section className="animate-slide-up" style={{ animationDelay: "60ms" }}>
        <SummaryCards />
      </section>

      <section className="space-y-6 animate-slide-up" style={{ animationDelay: "120ms" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
            Últimas Transações
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/transacoes')} className="w-full sm:w-auto">
            Ver todas
          </Button>
        </div>

        <TransactionsTable />

        <div className="grid md:grid-cols-2 gap-6">
          <TransactionChart type="entrada" />
          <TransactionChart type="saida" />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
