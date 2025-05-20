
import { FilterPeriod } from "@/components/dashboard/FilterPeriod";
import { ReportBarChart } from "@/components/reports/ReportBarChart";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Reports = () => {
  const { filteredTransactions, userSettings } = useFinance();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const isPremium = userSettings.plan === 'premium';

  const handleExport = async () => {
    if (!isPremium) {
      // Let the premium alert dialog handle this
      return;
    }
    
    // In a real app, this would generate a PDF or Excel file
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsExporting(false);
    
    toast({
      title: "Relatório exportado",
      description: "O relatório foi exportado com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <FilterPeriod />
          
          {isPremium ? (
            <Button variant="default" onClick={handleExport} disabled={isExporting}>
              {isExporting ? "Exportando..." : "Exportar Relatório"}
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default">
                  Exportar Relatório
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Recurso Premium</AlertDialogTitle>
                  <AlertDialogDescription>
                    A exportação de relatórios é um recurso exclusivo do plano Premium. 
                    Faça upgrade agora para desbloquear esta e outras funcionalidades avançadas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => window.location.href = '/upgrade'}>
                    Ver Planos
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      
      <ReportSummary />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <ReportBarChart />
        
        <Card className="shadow-sm">
          <Dialog>
            <DialogTrigger asChild>
              <div className="p-6 flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <h3 className="text-xl font-semibold mb-4">Visualizar Transações Detalhadas</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Clique para ver todas as transações do período selecionado em formato detalhado
                </p>
                <Button variant="outline">Ver detalhes</Button>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Transações Detalhadas</DialogTitle>
                <DialogDescription>
                  Lista completa de transações do período selecionado
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          Nenhuma transação encontrada para o período selecionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{transaction.description || '-'}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs ${
                                transaction.type === 'entrada'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {transaction.type === 'entrada' ? 'Receita' : 'Despesa'}
                            </span>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            transaction.type === 'entrada' ? 'text-income' : 'text-expense'
                          }`}>
                            {transaction.type === 'entrada' ? '+' : '-'}
                            {formatCurrency(transaction.value)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TransactionChart type="entrada" />
        <TransactionChart type="saida" />
      </div>
    </div>
  );
};

export default Reports;
