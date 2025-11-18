
import { FilterPeriod } from "@/components/dashboard/FilterPeriod";
import { ReportBarChart } from "@/components/reports/ReportBarChart";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { exportReportToPDF } from "@/lib/exportReport";
import { exportToCSV, exportToExcel } from "@/lib/exportAdvanced";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, FileText, File, Table as TableIcon } from "lucide-react";

const Reports = () => {
  const { 
    filteredTransactions, 
    userSettings, 
    isPremiumActive,
    isPremiumMasterActive,
    filterDates,
    calculateTotalByType,
    calculateBalance
  } = useFinance();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'csv' | 'xlsx' = 'pdf') => {
    if (!isPremiumActive) {
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Calcular dados do resumo
      const totalIncome = calculateTotalByType('entrada');
      const totalExpense = calculateTotalByType('saida');
      const profit = totalIncome - totalExpense;
      const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
      
      const exportData = {
        totalIncome,
        totalExpense,
        profit,
        profitMargin,
        transactions: filteredTransactions,
        startDate: filterDates.startDate,
        endDate: filterDates.endDate,
      };
      
      // Exportar no formato solicitado
      switch (format) {
        case 'csv':
          exportToCSV(exportData);
          toast({
            title: "Relatório exportado",
            description: "O arquivo CSV foi baixado com sucesso.",
          });
          break;
        case 'xlsx':
          exportToExcel(exportData);
          toast({
            title: "Relatório exportado",
            description: "O arquivo Excel foi baixado com sucesso.",
          });
          break;
        case 'pdf':
        default:
          exportReportToPDF({
            ...exportData,
            period: filterDates,
          });
          toast({
            title: "Relatório exportado",
            description: "O arquivo PDF foi baixado com sucesso.",
          });
          break;
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <FilterPeriod />
          
          {isPremiumActive ? (
            isPremiumMasterActive ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" disabled={isExporting}>
                    {isExporting ? "Exportando..." : "Exportar Relatório"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <File className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                    <TableIcon className="mr-2 h-4 w-4" />
                    Exportar Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" onClick={() => handleExport('pdf')} disabled={isExporting}>
                {isExporting ? "Exportando..." : "Exportar Relatório"}
              </Button>
            )
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
                    {userSettings.plan === 'premium' && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md">
                        <strong>Seu plano Premium expirou.</strong> Para continuar usando os recursos avançados, renove sua assinatura mensal.
                      </div>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => window.location.href = '/upgrade'}>
                    {userSettings.plan === 'premium' ? 'Renovar Assinatura' : 'Ver Planos'}
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
