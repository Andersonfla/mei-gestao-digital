import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { FilterPeriod } from "@/components/dashboard/FilterPeriod";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { TransactionForm } from "@/components/transactions/TransactionForm";
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <FilterPeriod />
        </div>
        
        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-3">
            <AdvancedDashboard />
          </div>
          <div>
            <TransactionForm />
          </div>
        </div>
      </div>
    );
  }
  
  // Standard Dashboard for free and premium users
  return (
    <div className="space-y-8 w-full max-w-full">
      <InstallPrompt />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-12 sm:pt-0">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>
        <FilterPeriod />
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-4">
          <SummaryCards />
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">Últimas Transações</h2>
            <Button variant="outline" onClick={() => navigate('/transacoes')} className="w-full sm:w-auto">
              Ver todas
            </Button>
          </div>
          
          <TransactionsTable />
          
          <div className="grid md:grid-cols-2 gap-6">
            <TransactionChart type="entrada" />
            <TransactionChart type="saida" />
          </div>
        </div>
        
        <div>
          <TransactionForm />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
